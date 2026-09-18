import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as XLSX from 'xlsx';
import {
  EventState,
  Team,
  Submission,
  AntiCheatEvent,
  Question,
  AdminRole,
  AuditLogEntry,
  TeamWarning,
  RoundNumber,
  QuestionSet,
  ManualScoreAdjustment,
  EventFeedback,
  ImportReviewItem,
  QuestionClue,
} from '../src/types';

export interface AdminAccount {
  username: string;
  passwordHash: string;
  role: AdminRole;
  name?: string;
  disabled?: boolean;
  createdAt?: number;
  lastLogin?: number;
}

export interface AdvancedRoutesOptions {
  teams: Map<string, Team>;
  questions: Question[];
  submissions: Map<string, Submission>;
  antiCheatEvents: AntiCheatEvent[];
  teamWarnings: TeamWarning[];
  auditLogs: AuditLogEntry[];
  eventState: EventState;
  adminAccounts: AdminAccount[];
  requireSuperAdmin: any;
  requireAdminOrAbove: any;
  requireModeratorOrAbove: any;
  recordAudit: (
    adminUsername: string,
    role: AdminRole,
    action: string,
    target: string,
    oldValue?: string,
    newValue?: string,
    details?: string,
    ip?: string
  ) => void;
  broadcast: (type: string, payload: any) => void;
  broadcastState: () => void;
  getCurrentQuestion: (teamId?: string) => Question | null;
  sanitizeQuestion: (q: Question | null, teamId?: string) => any;
  computeLeaderboard: () => any[];
}

export function registerAdvancedCompetitionRoutes(app: any, opts: AdvancedRoutesOptions) {
  const {
    teams,
    questions,
    submissions,
    antiCheatEvents,
    teamWarnings,
    auditLogs,
    eventState,
    adminAccounts,
    requireSuperAdmin,
    requireAdminOrAbove,
    requireModeratorOrAbove,
    recordAudit,
    broadcast,
    broadcastState,
    getCurrentQuestion,
    sanitizeQuestion,
    computeLeaderboard,
  } = opts;

  // In-memory state collections
  const manualScoreAdjustments: ManualScoreAdjustment[] = [];
  const eventFeedbacks: EventFeedback[] = [];
  const importReviewQueue: ImportReviewItem[] = [];

  // ==========================================
  // 1. MULTIPLE ADMIN MANAGEMENT (SUPER ADMIN)
  // ==========================================
  app.get('/api/admin/accounts', requireSuperAdmin, (req: Request, res: Response) => {
    const list = adminAccounts.map(a => ({
      username: a.username,
      role: a.role,
      name: a.name || a.username,
      disabled: Boolean(a.disabled),
      createdAt: a.createdAt || Date.now(),
      lastLogin: a.lastLogin,
    }));
    res.json({ accounts: list });
  });

  app.post('/api/admin/accounts', requireSuperAdmin, async (req: Request, res: Response) => {
    const { username, password, role, name } = req.body;
    const adminUser = (req as any).adminUser;

    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Username, password, and role are required' });
    }

    const cleanUsername = username.trim().toUpperCase();
    if (adminAccounts.some(a => a.username.toUpperCase() === cleanUsername)) {
      return res.status(409).json({ error: `Admin username '${cleanUsername}' already exists` });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newAdmin: AdminAccount = {
      username: cleanUsername,
      passwordHash,
      role: role as AdminRole,
      name: name?.trim() || cleanUsername,
      disabled: false,
      createdAt: Date.now(),
    };

    adminAccounts.push(newAdmin);
    recordAudit(
      adminUser.username,
      adminUser.role,
      'CREATE_ADMIN_ACCOUNT',
      cleanUsername,
      undefined,
      role,
      `Created administrator account with role ${role}`
    );

    res.json({
      success: true,
      message: `Admin account '${cleanUsername}' created successfully`,
      account: {
        username: newAdmin.username,
        role: newAdmin.role,
        name: newAdmin.name,
        disabled: false,
        createdAt: newAdmin.createdAt,
      },
    });
  });

  app.put('/api/admin/accounts/:username', requireSuperAdmin, async (req: Request, res: Response) => {
    const targetUsername = req.params.username.trim().toUpperCase();
    const { role, name, disabled, password } = req.body;
    const adminUser = (req as any).adminUser;

    const account = adminAccounts.find(a => a.username.toUpperCase() === targetUsername);
    if (!account) {
      return res.status(404).json({ error: 'Admin account not found' });
    }

    if (role) account.role = role;
    if (name !== undefined) account.name = name;
    if (disabled !== undefined) account.disabled = Boolean(disabled);
    if (password && password.trim()) {
      account.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    recordAudit(
      adminUser.username,
      adminUser.role,
      'UPDATE_ADMIN_ACCOUNT',
      targetUsername,
      undefined,
      role || undefined,
      `Updated admin settings (Role: ${account.role}, Disabled: ${account.disabled})`
    );

    res.json({
      success: true,
      message: `Admin account '${targetUsername}' updated successfully`,
      account: {
        username: account.username,
        role: account.role,
        name: account.name,
        disabled: account.disabled,
      },
    });
  });

  app.delete('/api/admin/accounts/:username', requireSuperAdmin, (req: Request, res: Response) => {
    const targetUsername = req.params.username.trim().toUpperCase();
    const adminUser = (req as any).adminUser;

    if (adminUser.username.toUpperCase() === targetUsername) {
      return res.status(400).json({ error: 'You cannot delete your own active administrator account' });
    }

    const idx = adminAccounts.findIndex(a => a.username.toUpperCase() === targetUsername);
    if (idx === -1) {
      return res.status(404).json({ error: 'Admin account not found' });
    }

    const removed = adminAccounts.splice(idx, 1)[0];
    recordAudit(
      adminUser.username,
      adminUser.role,
      'DELETE_ADMIN_ACCOUNT',
      targetUsername,
      removed.role,
      undefined,
      `Permanently removed administrator account ${targetUsername}`
    );

    res.json({ success: true, message: `Admin account '${targetUsername}' removed` });
  });

  // ==========================================
  // 2. ANSWERED / NOT ANSWERED TEAM MONITORING (SECTION 3)
  // ==========================================
  app.get('/api/admin/question/:questionId/team-status', requireModeratorOrAbove, (req: Request, res: Response) => {
    const { questionId } = req.params;
    let targetQuestion = questions.find(q => q.id === questionId);
    if (!targetQuestion) {
      targetQuestion = getCurrentQuestion() || undefined;
    }

    if (!targetQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const activeTeams = Array.from(teams.values()).filter(t => t.status !== 'DISQUALIFIED');
    const answeredTeams: any[] = [];
    const notAnsweredTeams: any[] = [];
    let correctCount = 0;
    let incorrectCount = 0;

    activeTeams.forEach(team => {
      const subKey = `${team.id}_${targetQuestion!.id}`;
      const sub = submissions.get(subKey);
      if (sub) {
        if (sub.isCorrect) correctCount++;
        else incorrectCount++;
        answeredTeams.push({
          teamId: team.id,
          teamName: team.name,
          college: team.college,
          currentQuestionId: team.currentQuestionId || targetQuestion!.id,
          submittedAnswer: sub.submittedAnswer,
          isCorrect: sub.isCorrect,
          submittedAt: sub.submittedAt,
          pointsAwarded: sub.pointsAwarded,
          status: team.status,
        });
      } else {
        notAnsweredTeams.push({
          teamId: team.id,
          teamName: team.name,
          college: team.college,
          currentQuestionId: team.currentQuestionId || targetQuestion!.id,
          status: team.status,
          lastActive: team.lastActive,
          isOnline: team.isOnline,
        });
      }
    });

    res.json({
      questionId: targetQuestion.id,
      questionNumber: targetQuestion.questionNumber,
      round: targetQuestion.round,
      domain: targetQuestion.domain,
      totalTeams: activeTeams.length,
      answeredCount: answeredTeams.length,
      notAnsweredCount: notAnsweredTeams.length,
      correctCount,
      incorrectCount,
      answeredTeams,
      notAnsweredTeams,
      updatedAt: Date.now(),
    });
  });

  // ==========================================
  // 3. TEAM-SPECIFIC QUESTION CONTROL (SECTION 25)
  // ==========================================
  app.post('/api/admin/teams/set-question', requireAdminOrAbove, (req: Request, res: Response) => {
    const { target, teamIds, questionId, reason } = req.body;
    const adminUser = (req as any).adminUser;

    if (!target || !questionId) {
      return res.status(400).json({ error: 'Target and questionId are required' });
    }

    const targetQ = questions.find(q => q.id === questionId);
    if (!targetQ) {
      return res.status(404).json({ error: 'Target question not found' });
    }

    let affectedCount = 0;
    if (target === 'ALL') {
      // Clear specific overrides or set round question index
      const roundQuestions = questions.filter(q => q.round === targetQ.round);
      const qIndex = roundQuestions.findIndex(q => q.id === targetQ.id);
      if (qIndex !== -1) {
        eventState.currentRound = targetQ.round;
        eventState.currentQuestionIndex = qIndex;
        eventState.currentQuestionId = targetQ.id;
      }
      // Reset team specific overrides
      teams.forEach(t => {
        t.currentQuestionId = targetQ.id;
        affectedCount++;
      });
    } else if (target === 'SELECTED' || target === 'INDIVIDUAL') {
      const ids: string[] = Array.isArray(teamIds) ? teamIds : [teamIds];
      ids.forEach(id => {
        const team = teams.get(id);
        if (team) {
          team.currentQuestionId = targetQ.id;
          affectedCount++;
        }
      });
    }

    recordAudit(
      adminUser.username,
      adminUser.role,
      'SET_TEAM_QUESTION',
      `${target}: ${affectedCount} teams`,
      undefined,
      targetQ.id,
      `Assigned Question ${targetQ.questionNumber} (R${targetQ.round}) to ${target}. Reason: ${reason || 'Manual assignment'}`
    );

    broadcast('TEAM_QUESTION_CHANGED', {
      target,
      questionId: targetQ.id,
      questionNumber: targetQ.questionNumber,
      round: targetQ.round,
      affectedTeamIds: teamIds || 'ALL',
    });

    broadcastState();

    res.json({
      success: true,
      message: `Assigned Question ${targetQ.questionNumber} to ${affectedCount} team(s)`,
      affectedCount,
      questionId: targetQ.id,
    });
  });

  // Reset team question assignment back to default round index
  app.post('/api/admin/teams/reset-question', requireAdminOrAbove, (req: Request, res: Response) => {
    const { teamIds } = req.body;
    const adminUser = (req as any).adminUser;

    const ids: string[] = Array.isArray(teamIds) ? teamIds : Array.from(teams.keys());
    ids.forEach(id => {
      const team = teams.get(id);
      if (team) {
        delete team.currentQuestionId;
      }
    });

    recordAudit(
      adminUser.username,
      adminUser.role,
      'RESET_TEAM_QUESTION',
      `${ids.length} teams`,
      undefined,
      'DEFAULT_SYNC',
      'Reset team question overrides to synchronized round question'
    );

    broadcastState();
    res.json({ success: true, message: `Reset question assignment for ${ids.length} team(s)` });
  });

  // ==========================================
  // 4. MANUAL SCORE ADJUSTMENTS (SECTION 26)
  // ==========================================
  app.post('/api/admin/scores/adjust', requireAdminOrAbove, (req: Request, res: Response) => {
    const { target, teamIds, round, adjustmentType, amount, reason } = req.body;
    const adminUser = (req as any).adminUser;

    if (!target || !adjustmentType || amount === undefined || !reason?.trim()) {
      return res.status(400).json({ error: 'Target, adjustmentType, amount, and reason are required' });
    }

    const rNum = (Number(round) || eventState.currentRound) as RoundNumber;
    const delta = Number(amount);
    const targetTeams: Team[] = [];

    if (target === 'ALL') {
      teams.forEach(t => {
        if (t.status !== 'DISQUALIFIED') targetTeams.push(t);
      });
    } else {
      const ids: string[] = Array.isArray(teamIds) ? teamIds : [teamIds];
      ids.forEach(id => {
        const t = teams.get(id);
        if (t) targetTeams.push(t);
      });
    }

    if (targetTeams.length === 0) {
      return res.status(404).json({ error: 'No valid teams found for adjustment' });
    }

    const createdAdjustments: ManualScoreAdjustment[] = [];

    targetTeams.forEach(team => {
      let currentRoundScore = rNum === 1 ? team.round1Score : rNum === 2 ? team.round2Score : team.round3Score;
      let newRoundScore = currentRoundScore;

      if (adjustmentType === 'ADD') {
        newRoundScore = currentRoundScore + delta;
      } else if (adjustmentType === 'SUBTRACT') {
        newRoundScore = Math.max(0, currentRoundScore - delta);
      } else if (adjustmentType === 'SET') {
        newRoundScore = Math.max(0, delta);
      }

      const scoreDelta = newRoundScore - currentRoundScore;

      if (rNum === 1) team.round1Score = newRoundScore;
      else if (rNum === 2) team.round2Score = newRoundScore;
      else if (rNum === 3) team.round3Score = newRoundScore;

      team.totalScore = team.round1Score + team.round2Score + team.round3Score;
      team.manualScoreAdjustment = (team.manualScoreAdjustment || 0) + scoreDelta;

      const record: ManualScoreAdjustment = {
        id: `adj-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        teamId: team.id,
        teamName: team.name,
        adminUsername: adminUser.username,
        round: rNum,
        oldScore: currentRoundScore,
        newScore: newRoundScore,
        adjustment: scoreDelta,
        reason: reason.trim(),
        timestamp: Date.now(),
      };

      manualScoreAdjustments.unshift(record);
      createdAdjustments.push(record);

      recordAudit(
        adminUser.username,
        adminUser.role,
        'MANUAL_SCORE_ADJUSTMENT',
        team.name,
        String(currentRoundScore),
        String(newRoundScore),
        `Adjusted R${rNum} by ${scoreDelta >= 0 ? '+' : ''}${scoreDelta}. Reason: ${reason}`
      );
    });

    broadcast('SCORE_UPDATED', { adjustments: createdAdjustments });
    broadcastState();

    res.json({
      success: true,
      message: `Adjusted score for ${targetTeams.length} team(s)`,
      adjustments: createdAdjustments,
    });
  });

  app.get('/api/admin/scores/history', requireModeratorOrAbove, (req: Request, res: Response) => {
    res.json({ adjustments: manualScoreAdjustments });
  });

  // ==========================================
  // 5. DYNAMIC CLUE CONTROL (SECTION 27 & 15)
  // ==========================================
  app.post('/api/admin/clues/toggle', requireAdminOrAbove, (req: Request, res: Response) => {
    const { questionId, clueId, enabled, target, teamIds } = req.body;
    const adminUser = (req as any).adminUser;

    if (!questionId || !clueId) {
      return res.status(400).json({ error: 'questionId and clueId are required' });
    }

    if (!eventState.activeCluesByQuestion) {
      eventState.activeCluesByQuestion = {};
    }

    const isAll = target === 'ALL';
    const activeTargetTeamIds = Array.isArray(teamIds) ? teamIds : [];

    if (enabled) {
      eventState.activeCluesByQuestion[clueId] = {
        allTeams: isAll,
        teamIds: isAll ? [] : activeTargetTeamIds,
      };

      if (!isAll) {
        activeTargetTeamIds.forEach((tid: string) => {
          const team = teams.get(tid);
          if (team) {
            team.enabledClues = Array.from(new Set([...(team.enabledClues || []), clueId]));
          }
        });
      }
    } else {
      delete eventState.activeCluesByQuestion[clueId];
      teams.forEach(team => {
        if (team.enabledClues) {
          team.enabledClues = team.enabledClues.filter(c => c !== clueId);
        }
      });
    }

    recordAudit(
      adminUser.username,
      adminUser.role,
      'TOGGLE_DYNAMIC_CLUE',
      `Question ${questionId} - Clue ${clueId}`,
      undefined,
      enabled ? `ENABLED (${target})` : 'DISABLED',
      `Admin toggled clue visibility for ${target}`
    );

    broadcast('CLUES_UPDATED', {
      questionId,
      clueId,
      enabled,
      activeClues: eventState.activeCluesByQuestion,
    });

    broadcastState();
    res.json({ success: true, message: `Clue ${clueId} ${enabled ? 'enabled' : 'disabled'} for ${target}` });
  });

  // ==========================================
  // 6. QUALIFICATION SYSTEM (SECTION 28)
  // ==========================================
  app.get('/api/admin/qualification/preview', requireAdminOrAbove, (req: Request, res: Response) => {
    const round = Number(req.query.round) || eventState.currentRound;
    const topCount = Number(req.query.topCount) || 10;

    const allTeams = Array.from(teams.values()).filter(t => t.status !== 'DISQUALIFIED');

    // Sort by score for the specified round (fallback to totalScore)
    allTeams.sort((a, b) => {
      const scoreA = round === 1 ? a.round1Score : round === 2 ? a.round2Score : a.round3Score;
      const scoreB = round === 1 ? b.round1Score : round === 2 ? b.round2Score : b.round3Score;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return b.totalScore - a.totalScore;
    });

    const ranked = allTeams.map((team, idx) => {
      const rScore = round === 1 ? team.round1Score : round === 2 ? team.round2Score : team.round3Score;
      return {
        rank: idx + 1,
        teamId: team.id,
        teamName: team.name,
        college: team.college,
        roundScore: rScore,
        totalScore: team.totalScore,
        isQualified: idx < topCount,
      };
    });

    const cutOffScore = ranked[topCount - 1]?.roundScore ?? 0;
    // Identify ties at cut boundary
    const boundaryTies = ranked.filter(t => t.roundScore === cutOffScore);

    res.json({
      round,
      topCount,
      cutOffScore,
      totalTeams: ranked.length,
      qualifiedCount: Math.min(topCount, ranked.length),
      teams: ranked,
      hasBoundaryTies: boundaryTies.length > 1,
      boundaryTies,
    });
  });

  app.post('/api/admin/qualification/apply', requireAdminOrAbove, (req: Request, res: Response) => {
    const { round, qualifiedTeamIds, disqualifiedTeamIds } = req.body;
    const adminUser = (req as any).adminUser;

    if (!Array.isArray(qualifiedTeamIds)) {
      return res.status(400).json({ error: 'qualifiedTeamIds array is required' });
    }

    const rNum = Number(round) || eventState.currentRound;
    let qualifiedCount = 0;
    let disqualifiedCount = 0;

    teams.forEach(team => {
      if (qualifiedTeamIds.includes(team.id)) {
        team.isQualified = true;
        team.qualificationRound = rNum;
        qualifiedCount++;
      } else {
        team.isQualified = false;
        if (disqualifiedTeamIds?.includes(team.id)) {
          team.status = 'DISQUALIFIED';
          team.lockReason = `Eliminated after Round ${rNum} qualification cutoff.`;
          disqualifiedCount++;
        }
      }
    });

    recordAudit(
      adminUser.username,
      adminUser.role,
      'APPLY_ROUND_QUALIFICATION',
      `Round ${rNum}`,
      undefined,
      `${qualifiedCount} qualified`,
      `Applied qualification cut for Round ${rNum}: ${qualifiedCount} teams advanced, ${disqualifiedCount} eliminated.`
    );

    broadcastState();

    res.json({
      success: true,
      message: `Qualification applied: ${qualifiedCount} teams qualified for next stage`,
      qualifiedCount,
      disqualifiedCount,
    });
  });

  app.post('/api/admin/qualification/override', requireAdminOrAbove, (req: Request, res: Response) => {
    const { teamId, isQualified, reason } = req.body;
    const adminUser = (req as any).adminUser;

    const team = teams.get(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    team.isQualified = Boolean(isQualified);
    if (isQualified && team.status === 'DISQUALIFIED') {
      team.status = 'ACTIVE';
      delete team.lockReason;
    }

    recordAudit(
      adminUser.username,
      adminUser.role,
      'QUALIFICATION_OVERRIDE',
      team.name,
      String(!isQualified),
      String(isQualified),
      `Manual qualification status override. Reason: ${reason || 'Admin discretion'}`
    );

    broadcastState();
    res.json({ success: true, message: `Updated qualification status for ${team.name}`, team });
  });

  // ==========================================
  // 7. BULK IMPORT & IMPORT REVIEW QUEUE (SECTIONS 18-20)
  // ==========================================
  app.post('/api/admin/questions/parse-document', requireAdminOrAbove, (req: Request, res: Response) => {
    const { content, format, defaultRound, defaultSet } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Document content is required' });
    }

    const rNum: RoundNumber = (Number(defaultRound) || 1) as RoundNumber;
    const sName: QuestionSet = (defaultSet || 'A') as QuestionSet;
    const detectedItems: ImportReviewItem[] = [];

    try {
      if (format === 'JSON') {
        const parsed = JSON.parse(content);
        const list = Array.isArray(parsed) ? parsed : [parsed];
        list.forEach((item: any, idx: number) => {
          detectedItems.push({
            id: `rev-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
            questionNumber: item.questionNumber || idx + 1,
            title: item.title || `Question ${item.questionNumber || idx + 1}`,
            round: item.round || rNum,
            set: item.set || sName,
            domain: item.domain || 'Computer Science',
            difficulty: item.difficulty || 'Medium',
            points: item.points || (item.round === 1 ? 1 : item.round === 2 ? 2 : 3),
            correctAnswer: item.correctAnswer || '',
            aliases: Array.isArray(item.aliases) ? item.aliases : [],
            explanation: item.explanation || '',
            status: 'PENDING_REVIEW',
            confidence: item.correctAnswer ? 'HIGH' : 'MEDIUM',
            detectedFrom: 'JSON Upload',
            cluePanels: item.cluePanels || [],
            rebusFormulaText: item.rebusFormulaText || 'Panel 1 + Panel 2',
          });
        });
      } else {
        // Document / Text / CSV Parsing using regex splitting heuristics
        const rawText: string = content;
        // Split by lines or question blocks
        const questionBlocks = rawText.split(/(?:Question\s*#?\d+:?|Q\d+[:.]|\n(?=\d+[\.\)]\s+))/i);

        questionBlocks.forEach((block, idx) => {
          const trimmed = block.trim();
          if (trimmed.length < 10) return;

          // Detect answer lines
          const answerMatch = trimmed.match(/(?:Answer|Correct Answer|Ans)[:\s]+([^\n\r]+)/i);
          const aliasesMatch = trimmed.match(/(?:Aliases|Alternatives|Also Accepted)[:\s]+([^\n\r]+)/i);
          const explanationMatch = trimmed.match(/(?:Explanation|Notes)[:\s]+([^\n\r]+)/i);
          const roundMatch = trimmed.match(/(?:Round|R)[:\s]+(\d+)/i);
          const pointsMatch = trimmed.match(/(?:Points|Marks)[:\s]+(\d+)/i);
          const domainMatch = trimmed.match(/(?:Domain|Topic|Category)[:\s]+([^\n\r]+)/i);

          const promptLine = trimmed.split('\n')[0].replace(/^\d+[\.\)]\s*/, '').trim();
          const correctAnswer = answerMatch ? answerMatch[1].trim() : '';
          const aliases = aliasesMatch ? aliasesMatch[1].split(/[,;/]/).map(s => s.trim()).filter(Boolean) : [];

          detectedItems.push({
            id: `rev-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
            questionNumber: idx + 1,
            title: promptLine || `Detected Question ${idx + 1}`,
            round: roundMatch ? (Number(roundMatch[1]) as RoundNumber) : rNum,
            set: sName,
            domain: domainMatch ? domainMatch[1].trim() : 'Computer Science',
            difficulty: 'Medium',
            points: pointsMatch ? Number(pointsMatch[1]) : (rNum === 1 ? 1 : rNum === 2 ? 2 : 3),
            correctAnswer,
            aliases,
            explanation: explanationMatch ? explanationMatch[1].trim() : 'Technical rebus visual clue challenge',
            status: 'PENDING_REVIEW',
            confidence: correctAnswer ? 'HIGH' : 'LOW',
            detectedFrom: 'Document Parsing',
            cluePanels: [
              { panelNumber: 1, description: promptLine || 'Visual Clue 1', svgType: 'brain' },
              { panelNumber: 2, description: 'Visual Clue 2', svgType: 'cpu' },
            ],
            rebusFormulaText: 'Panel 1 + Panel 2',
          });
        });
      }

      // Add to review queue
      detectedItems.forEach(item => importReviewQueue.unshift(item));

      res.json({
        success: true,
        message: `Successfully parsed and queued ${detectedItems.length} question(s) for review`,
        queuedCount: detectedItems.length,
        items: detectedItems,
      });
    } catch (err: any) {
      res.status(400).json({ error: `Failed to parse document: ${err.message}` });
    }
  });

  app.get('/api/admin/questions/review-queue', requireAdminOrAbove, (req: Request, res: Response) => {
    res.json({ queue: importReviewQueue });
  });

  app.put('/api/admin/questions/review-queue/:id', requireAdminOrAbove, (req: Request, res: Response) => {
    const { id } = req.params;
    const item = importReviewQueue.find(q => q.id === id);
    if (!item) return res.status(404).json({ error: 'Queue item not found' });

    Object.assign(item, req.body);
    res.json({ success: true, item });
  });

  app.post('/api/admin/questions/review-queue/approve', requireAdminOrAbove, (req: Request, res: Response) => {
    const { itemIds } = req.body;
    const adminUser = (req as any).adminUser;

    const ids: string[] = Array.isArray(itemIds) ? itemIds : importReviewQueue.map(q => q.id);
    const approvedItems: Question[] = [];

    ids.forEach(id => {
      const idx = importReviewQueue.findIndex(q => q.id === id);
      if (idx !== -1) {
        const item = importReviewQueue.splice(idx, 1)[0];
        const newQ: Question = {
          id: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          round: item.round,
          set: item.set,
          questionNumber: item.questionNumber,
          domain: item.domain,
          difficulty: item.difficulty,
          points: item.points,
          cluePanels: item.cluePanels || [
            { panelNumber: 1, description: item.title, svgType: 'brain' },
            { panelNumber: 2, description: 'Technical Clue', svgType: 'cpu' },
          ],
          rebusFormulaText: item.rebusFormulaText || 'Panel 1 + Panel 2',
          correctAnswer: item.correctAnswer,
          aliases: item.aliases || [],
          explanation: item.explanation || item.title,
          active: true,
          status: 'ACTIVE',
        };

        questions.push(newQ);
        approvedItems.push(newQ);
      }
    });

    recordAudit(
      adminUser.username,
      adminUser.role,
      'APPROVE_IMPORT_QUEUE',
      `${approvedItems.length} questions`,
      undefined,
      'COMMITTED_TO_BANK',
      `Approved and committed ${approvedItems.length} questions from review queue to question bank`
    );

    broadcastState();

    res.json({
      success: true,
      message: `Approved and saved ${approvedItems.length} question(s) to Question Bank`,
      count: approvedItems.length,
      questions: approvedItems,
    });
  });

  app.delete('/api/admin/questions/review-queue/:id', requireAdminOrAbove, (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = importReviewQueue.findIndex(q => q.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Item not found in queue' });

    importReviewQueue.splice(idx, 1);
    res.json({ success: true, message: 'Removed item from review queue' });
  });

  // ==========================================
  // 8. QUESTION MANAGEMENT: REORDER, MOVE, STATUS (SECTIONS 16, 17, 21, 24)
  // ==========================================
  app.post('/api/admin/questions/reorder', requireAdminOrAbove, (req: Request, res: Response) => {
    const { round, set, orderedIds } = req.body;
    const adminUser = (req as any).adminUser;

    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds array required' });
    }

    orderedIds.forEach((id: string, idx: number) => {
      const q = questions.find(item => item.id === id);
      if (q) {
        q.questionNumber = idx + 1;
      }
    });

    recordAudit(
      adminUser.username,
      adminUser.role,
      'REORDER_QUESTIONS',
      `Round ${round || 'All'} Set ${set || 'All'}`,
      undefined,
      `${orderedIds.length} re-indexed`,
      'Updated question ordering sequence'
    );

    broadcastState();
    res.json({ success: true, message: 'Questions reordered successfully' });
  });

  app.post('/api/admin/questions/move-copy', requireAdminOrAbove, (req: Request, res: Response) => {
    const { questionId, action, targetRound, targetSet } = req.body;
    const adminUser = (req as any).adminUser;

    const sourceQ = questions.find(q => q.id === questionId);
    if (!sourceQ) return res.status(404).json({ error: 'Source question not found' });

    const tRound = Number(targetRound) as RoundNumber;
    const tSet = (targetSet || 'A') as QuestionSet;

    if (action === 'MOVE') {
      sourceQ.round = tRound;
      sourceQ.set = tSet;
      recordAudit(
        adminUser.username,
        adminUser.role,
        'MOVE_QUESTION',
        sourceQ.id,
        undefined,
        `R${tRound}-${tSet}`,
        `Moved question to Round ${tRound} Set ${tSet}`
      );
    } else if (action === 'COPY') {
      const cloned: Question = {
        ...JSON.parse(JSON.stringify(sourceQ)),
        id: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        round: tRound,
        set: tSet,
      };
      questions.push(cloned);
      recordAudit(
        adminUser.username,
        adminUser.role,
        'COPY_QUESTION',
        cloned.id,
        sourceQ.id,
        `R${tRound}-${tSet}`,
        `Cloned question into Round ${tRound} Set ${tSet}`
      );
    }

    broadcastState();
    res.json({ success: true, message: `Question ${action.toLowerCase()}d successfully` });
  });

  app.post('/api/admin/question/status', requireAdminOrAbove, (req: Request, res: Response) => {
    const { questionId, status } = req.body;
    const adminUser = (req as any).adminUser;

    const q = questions.find(item => item.id === questionId);
    if (!q) return res.status(404).json({ error: 'Question not found' });

    const oldStatus = q.status || (q.active ? 'ACTIVE' : 'DRAFT');
    q.status = status;
    q.active = status === 'ACTIVE';

    recordAudit(
      adminUser.username,
      adminUser.role,
      'SET_QUESTION_STATUS',
      q.id,
      oldStatus,
      status,
      `Changed question status from ${oldStatus} to ${status}`
    );

    broadcastState();
    res.json({ success: true, message: `Question status updated to ${status}`, question: q });
  });

  // ==========================================
  // 9. EVENT FEEDBACK SYSTEM (SECTION 32)
  // ==========================================
  app.post('/api/feedback', (req: Request, res: Response) => {
    const { teamId, overallRating, questionQuality, difficulty, userExperience, eventOrganization, comments } = req.body;

    if (!teamId || !overallRating) {
      return res.status(400).json({ error: 'Team ID and ratings are required' });
    }

    const team = teams.get(teamId);
    const teamName = team ? team.name : 'Unknown Team';

    const feedback: EventFeedback = {
      id: `fb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      teamId,
      teamName,
      overallRating: Math.min(5, Math.max(1, Number(overallRating) || 5)),
      questionQuality: Math.min(5, Math.max(1, Number(questionQuality) || 5)),
      difficulty: Math.min(5, Math.max(1, Number(difficulty) || 3)),
      userExperience: Math.min(5, Math.max(1, Number(userExperience) || 5)),
      eventOrganization: Math.min(5, Math.max(1, Number(eventOrganization) || 5)),
      comments: comments?.trim() || undefined,
      timestamp: Date.now(),
    };

    eventFeedbacks.unshift(feedback);
    res.json({ success: true, message: 'Thank you for your feedback!' });
  });

  app.get('/api/admin/feedback', requireModeratorOrAbove, (req: Request, res: Response) => {
    const total = eventFeedbacks.length;
    if (total === 0) {
      return res.json({
        total: 0,
        averageOverall: 0,
        averageQuality: 0,
        averageDifficulty: 0,
        averageUX: 0,
        averageOrganization: 0,
        feedbacks: [],
        ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });
    }

    let sumOverall = 0;
    let sumQuality = 0;
    let sumDifficulty = 0;
    let sumUX = 0;
    let sumOrg = 0;
    const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    eventFeedbacks.forEach(f => {
      sumOverall += f.overallRating;
      sumQuality += f.questionQuality;
      sumDifficulty += f.difficulty;
      sumUX += f.userExperience;
      sumOrg += f.eventOrganization;
      ratingCounts[f.overallRating] = (ratingCounts[f.overallRating] || 0) + 1;
    });

    res.json({
      total,
      averageOverall: Number((sumOverall / total).toFixed(2)),
      averageQuality: Number((sumQuality / total).toFixed(2)),
      averageDifficulty: Number((sumDifficulty / total).toFixed(2)),
      averageUX: Number((sumUX / total).toFixed(2)),
      averageOrganization: Number((sumOrg / total).toFixed(2)),
      ratingCounts,
      feedbacks: eventFeedbacks,
    });
  });

  app.post('/api/admin/feedback/toggle', requireAdminOrAbove, (req: Request, res: Response) => {
    eventState.feedbackActive = !eventState.feedbackActive;
    broadcastState();
    res.json({ success: true, feedbackActive: eventState.feedbackActive });
  });

  // ==========================================
  // 10. COMPREHENSIVE EVENT REPORTS & EXPORTS (SECTION 29)
  // ==========================================
  app.get('/api/admin/reports/event-summary', requireModeratorOrAbove, (req: Request, res: Response) => {
    const allTeams = Array.from(teams.values());
    const leaderboard = computeLeaderboard();

    let totalSubmissions = 0;
    let totalCorrect = 0;
    submissions.forEach(s => {
      totalSubmissions++;
      if (s.isCorrect) totalCorrect++;
    });

    const completionRate = totalSubmissions > 0 ? Number(((totalCorrect / totalSubmissions) * 100).toFixed(1)) : 0;

    res.json({
      symposiumName: "TECH BRIDGE '26",
      department: 'Computer Science and Engineering',
      eventTitle: 'Visual Technical Rebus Challenge',
      generatedAt: Date.now(),
      status: eventState.status,
      currentRound: eventState.currentRound,
      stats: {
        totalTeams: allTeams.length,
        activeTeams: allTeams.filter(t => t.status === 'ACTIVE').length,
        warnedTeams: allTeams.filter(t => t.status === 'WARNED').length,
        lockedTeams: allTeams.filter(t => t.status === 'LOCKED').length,
        disqualifiedTeams: allTeams.filter(t => t.status === 'DISQUALIFIED').length,
        totalQuestions: questions.length,
        totalSubmissions,
        totalCorrect,
        completionRate,
        antiCheatViolationsCount: antiCheatEvents.length,
        manualScoreAdjustmentsCount: manualScoreAdjustments.length,
        feedbacksCount: eventFeedbacks.length,
      },
      leaderboardTop10: leaderboard.slice(0, 10),
      recentAdjustments: manualScoreAdjustments.slice(0, 5),
    });
  });

  // Multi-Sheet Excel Export (XLSX)
  app.get('/api/admin/reports/export-xlsx', requireModeratorOrAbove, (req: Request, res: Response) => {
    const wb = XLSX.utils.book_new();

    // 1. Leaderboard Sheet
    const leaderboardData = computeLeaderboard().map(t => ({
      Rank: t.rank,
      'Team ID': t.teamId,
      'Team Name': t.teamName,
      College: t.college,
      'Round 1 Score': t.round1Score,
      'Round 2 Score': t.round2Score,
      'Round 3 Score': t.round3Score,
      'Total Score': t.totalScore,
      Status: t.status,
      Submissions: t.submissionCount,
    }));
    const wsLeaderboard = XLSX.utils.json_to_sheet(leaderboardData);
    XLSX.utils.book_append_sheet(wb, wsLeaderboard, 'Leaderboard');

    // 2. Submissions Sheet
    const subData = Array.from(submissions.values()).map(s => ({
      'Submission ID': s.id,
      'Team ID': s.teamId,
      'Team Name': s.teamName,
      Round: s.round,
      'Question Number': s.questionNumber,
      'Submitted Answer': s.submittedAnswer,
      'Is Correct': s.isCorrect ? 'YES' : 'NO',
      'Points Awarded': s.pointsAwarded,
      'Submitted At': new Date(s.submittedAt).toISOString(),
    }));
    const wsSub = XLSX.utils.json_to_sheet(subData);
    XLSX.utils.book_append_sheet(wb, wsSub, 'Submissions');

    // 3. Anti-Cheat Violations Sheet
    const acData = antiCheatEvents.map(a => ({
      'Alert ID': a.id,
      'Team ID': a.teamId,
      'Team Name': a.teamName,
      Event: a.eventType,
      Severity: a.severity,
      Details: a.details,
      Round: a.round,
      Timestamp: new Date(a.timestamp).toISOString(),
      'Action Taken': a.actionTaken || 'LOGGED',
    }));
    const wsAC = XLSX.utils.json_to_sheet(acData);
    XLSX.utils.book_append_sheet(wb, wsAC, 'Anti-Cheat Logs');

    // 4. Manual Score Adjustments Sheet
    const adjData = manualScoreAdjustments.map(m => ({
      'Adjustment ID': m.id,
      'Team ID': m.teamId,
      'Team Name': m.teamName,
      Admin: m.adminUsername,
      Round: m.round,
      'Old Score': m.oldScore,
      'New Score': m.newScore,
      Delta: m.adjustment,
      Reason: m.reason,
      Date: new Date(m.timestamp).toISOString(),
    }));
    const wsAdj = XLSX.utils.json_to_sheet(adjData);
    XLSX.utils.book_append_sheet(wb, wsAdj, 'Score Adjustments');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="TECH_BRIDGE_26_Official_Report.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  });
}
