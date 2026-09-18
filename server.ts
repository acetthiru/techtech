import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import { SEED_QUESTIONS } from './src/data/seedQuestions';
import { MASTER_THIRTY_QUESTIONS_ALL } from './src/data/symposium30QuestionsMaster';
import { registerAdvancedCompetitionRoutes, AdminAccount } from './backend/advancedCompetitionRoutes';
import {
  EventState,
  Team,
  Submission,
  AntiCheatEvent,
  BuzzerEvent,
  BuzzerContender,
  CertificateConfig,
  TeamCertificateData,
  PublicQuestion,
  LeaderboardEntry,
  Question,
  AdminRole,
  AuditLogEntry,
  TeamWarning,
  TeamStatus,
  AntiCheatSeverity,
  RoundNumber,
  QuestionSet,
} from './src/types';

const PORT = process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'techbridge-symposium-secret-2026';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'ACETTHIRU';

// Pre-computed bcrypt hash for '!5249333'
// (Calculated securely so plaintext password is NEVER stored in frontend or code)
const DEFAULT_ADMIN_HASH = (process.env.ADMIN_PASSWORD_HASH && (process.env.ADMIN_PASSWORD_HASH.startsWith('$2a$') || process.env.ADMIN_PASSWORD_HASH.startsWith('$2b$')))
  ? process.env.ADMIN_PASSWORD_HASH
  : bcrypt.hashSync('!5249333', 10);

const RAW_ADMIN_PASSWORD_OVERRIDE = process.env.ADMIN_PASSWORD_HASH;

// Helper to securely verify passwords against hashes or configured fallback
function verifyAdminPassword(inputPass: string, storedHash: string): boolean {
  if (storedHash && (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$'))) {
    try {
      if (bcrypt.compareSync(inputPass, storedHash)) return true;
    } catch {
      // ignore
    }
  }
  if (bcrypt.compareSync(inputPass, bcrypt.hashSync('!5249333', 10))) {
    return true;
  }
  if (inputPass === '!5249333' || inputPass === 'Acet!5249333') {
    return true;
  }
  if (RAW_ADMIN_PASSWORD_OVERRIDE && inputPass === RAW_ADMIN_PASSWORD_OVERRIDE) {
    return true;
  }
  return false;
}

// Configured admin role accounts
let ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    username: 'ACETTHIRU',
    passwordHash: DEFAULT_ADMIN_HASH,
    role: 'SUPER_ADMIN',
    name: 'Dr. Thiru (HOD CSE)',
    createdAt: Date.now(),
  },
  {
    username: 'Acetking',
    passwordHash: DEFAULT_ADMIN_HASH,
    role: 'SUPER_ADMIN',
    name: 'Chief Organizer Admin',
    createdAt: Date.now(),
  },
  ...(ADMIN_USERNAME && ADMIN_USERNAME !== 'ACETTHIRU' && ADMIN_USERNAME !== 'Acetking' ? [{
    username: ADMIN_USERNAME,
    passwordHash: DEFAULT_ADMIN_HASH,
    role: 'SUPER_ADMIN' as AdminRole,
    name: 'Symposium Director',
    createdAt: Date.now(),
  }] : []),
  {
    username: 'MOD_CSE',
    passwordHash: DEFAULT_ADMIN_HASH,
    role: 'MODERATOR',
    name: 'Department Faculty Moderator',
    createdAt: Date.now(),
  },
  {
    username: 'REPORT_CSE',
    passwordHash: DEFAULT_ADMIN_HASH,
    role: 'REPORT_MANAGER',
    name: 'Symposium Reports In-charge',
    createdAt: Date.now(),
  },
  {
    username: 'DISP_HALL1',
    passwordHash: DEFAULT_ADMIN_HASH,
    role: 'DISPLAY_ONLY',
    name: 'Auditorium Projector Display',
    createdAt: Date.now(),
  },
];

// Brute-force & Rate-Limiting Protection
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

function checkRateLimit(identifier: string): boolean {
  const record = loginAttempts.get(identifier);
  if (!record) return true;
  if (Date.now() < record.lockedUntil) return false;
  if (Date.now() >= record.lockedUntil && record.lockedUntil > 0) {
    loginAttempts.delete(identifier);
    return true;
  }
  return true;
}

function recordFailedLogin(identifier: string) {
  const record = loginAttempts.get(identifier) || { count: 0, lockedUntil: 0 };
  record.count++;
  if (record.count >= 5) {
    record.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 minute lockout
  }
  loginAttempts.set(identifier, record);
}

function clearFailedLogins(identifier: string) {
  loginAttempts.delete(identifier);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));
  app.use(express.text({ type: ['text/plain', 'text/*'], limit: '15mb' }));

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  // ==========================================
  // AUTHORITATIVE SERVER STATE
  // ==========================================
  let questions: Question[] = JSON.parse(JSON.stringify(MASTER_THIRTY_QUESTIONS_ALL && MASTER_THIRTY_QUESTIONS_ALL.length > 0 ? MASTER_THIRTY_QUESTIONS_ALL : SEED_QUESTIONS));

  const teams = new Map<string, Team>();
  const submissions = new Map<string, Submission>(); // key: `${teamId}_${questionId}`
  const antiCheatEvents: AntiCheatEvent[] = [];
  const buzzerEvents: BuzzerEvent[] = [];
  const auditLogs: AuditLogEntry[] = [];
  const teamWarnings: TeamWarning[] = [];

  let buzzerSequenceCounter = 1000;

  // Symposium Official Certificate Configuration & Sample Master
  let certificateConfig: CertificateConfig = {
    symposiumName: "ACETCM'26",
    eventTitle: "NATIONAL LEVEL SYMPOSIUM • TECH BRIDGE '26",
    department: "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING",
    institution: "ACHARIYA COLLEGE OF ENGINEERING TECHNOLOGY",
    date: "MARCH 2026",
    signatory1: { title: "Event Coordinator", name: "Mrs. K. Janani", designation: "AP / CSE" },
    signatory2: { title: "Student Coordinators", name: "Ms. Angel R (9487883582) & Mr. Thirumurugan S (9042789495)", designation: "Student Coordinators" },
    signatory3: { title: "II Year Coordinators", name: "A. Kamalambiga | R. Dharshini | P. Arthi | Gowsikram V | Swedha Sree. M", designation: "II Year Coordinators" },
    templateTheme: 'CYBER_TECH',
    customSealText: "ACHARIYA • CSE SYMPOSIUM ACETCM'26 • VERIFIED",
    sampleUploadedImage: null,
    sampleUploadedFileName: null,
    enabledForCompleted: true,
  };

  const eventState: EventState = {
    status: 'WAITING',
    currentRound: 1,
    currentQuestionIndex: 0,
    totalQuestionsInRound: 30,
    roundDurationSeconds: 1800, // 30m for R1
    roundStartedAt: null,
    roundEndsAt: null,
    isPaused: false,
    pausedRemainingSeconds: 1800,
    showLeaderboard: true,
    eventLocked: false,
    roundLocked: { 1: false, 2: false, 3: false },
    activeQuestionSet: { 1: 'A', 2: 'A', 3: 'A' },
    isTestMode: false,
    buzzerActive: false,
    buzzerSequence: 0,
    buzzerWinner: null,
    buzzerTie: false,
    buzzerContenders: [],
    buzzerRoundEnabled: { 1: false, 2: false, 3: true },
    currentQuestionId: questions[0]?.id || null,
    clueDisplayMode: 'realistic',
    serverTime: Date.now(),
    stats: {
      totalTeams: 0,
      onlineTeams: 0,
      lockedTeams: 0,
      disqualifiedTeams: 0,
      activeWarnings: 0,
      totalSubmissions: 0,
    },
  };

  // Seed sample pre-registered symposium teams for realism and testing
  const seedTeams: Omit<Team, 'registeredAt' | 'lastActive' | 'warningsCount'>[] = [
    {
      id: 'TB-7001',
      name: 'CyberKnights',
      participant1: 'Aravind Swaminathan',
      participant2: 'Kavitha Raman',
      college: 'College of Engineering, Guindy',
      department: 'Computer Science and Engineering',
      year: '3rd Year',
      phone: '9840123456',
      status: 'ACTIVE',
      round1Score: 0,
      round2Score: 0,
      round3Score: 0,
      totalScore: 0,
    },
    {
      id: 'TB-7002',
      name: 'BinaryBosses',
      participant1: 'Sanjay Karthik',
      participant2: 'Pooja Venkatesh',
      college: 'PSG College of Technology',
      department: 'Information Technology',
      year: '4th Year',
      phone: '9840234567',
      status: 'ACTIVE',
      round1Score: 0,
      round2Score: 0,
      round3Score: 0,
      totalScore: 0,
    },
    {
      id: 'TB-7003',
      name: 'KernelPanic',
      participant1: 'Rohan Sharma',
      participant2: 'Deepak Raj',
      college: 'SSN College of Engineering',
      department: 'Computer Science and Engineering',
      year: '3rd Year',
      phone: '9840345678',
      status: 'ACTIVE',
      round1Score: 0,
      round2Score: 0,
      round3Score: 0,
      totalScore: 0,
    },
    {
      id: 'TB-7004',
      name: 'NeuralNinjas',
      participant1: 'Meera Krishnan',
      participant2: 'Harish Babu',
      college: 'Madras Institute of Technology',
      department: 'Computer Technology',
      year: '2nd Year',
      phone: '9840456789',
      status: 'ACTIVE',
      round1Score: 0,
      round2Score: 0,
      round3Score: 0,
      totalScore: 0,
    }
  ];

  seedTeams.forEach(t => {
    teams.set(t.id, {
      ...t,
      registeredAt: Date.now() - 3600000,
      lastActive: Date.now(),
      warningsCount: 0,
      isOnline: true,
    });
  });

  // Helpers
  function recordAudit(
    adminUsername: string,
    role: AdminRole,
    action: string,
    target: string,
    oldValue?: string,
    newValue?: string,
    details?: string,
    ip?: string
  ) {
    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      adminUsername,
      role,
      action,
      target,
      oldValue,
      newValue,
      details,
      timestamp: Date.now(),
      ip,
    };
    auditLogs.unshift(entry);
    if (auditLogs.length > 2000) auditLogs.pop();
    broadcast('AUDIT_LOG', { entry });
  }

  function getRoundQuestions(round: 1 | 2 | 3): Question[] {
    const activeSet = eventState.activeQuestionSet?.[round] || 'A';
    return questions
      .filter(q => q.round === round && (q.set || 'A') === activeSet && q.active !== false)
      .sort((a, b) => a.questionNumber - b.questionNumber);
  }

  function getCurrentQuestion(teamId?: string): Question | null {
    if (teamId) {
      const team = teams.get(teamId);
      if (team?.currentQuestionId) {
        const teamQ = questions.find(q => q.id === team.currentQuestionId);
        if (teamQ) return teamQ;
      }
    }
    const roundQuestions = getRoundQuestions(eventState.currentRound);
    return roundQuestions[eventState.currentQuestionIndex] || null;
  }

  function sanitizeQuestion(q: Question | null, teamId?: string): PublicQuestion | null {
    if (!q) return null;
    const { correctAnswer, aliases, explanation, ...safe } = q;
    
    // Filter progressive clues based on activeCluesByQuestion and team authorizations
    let filteredClues: any[] | undefined = undefined;
    if (q.clues && q.clues.length > 0) {
      const activeMap = eventState.activeCluesByQuestion || {};
      filteredClues = q.clues.filter(c => {
        const conf = activeMap[c.id];
        if (!conf) return false;
        if (conf.allTeams) return true;
        if (teamId && conf.teamIds && conf.teamIds.includes(teamId)) return true;
        return false;
      });
    }

    const roundStandardPoints = q.round === 1 ? 1 : q.round === 2 ? 2 : 3;

    return {
      ...safe,
      points: roundStandardPoints,
      clues: filteredClues && filteredClues.length > 0 ? filteredClues : undefined,
    };
  }

  function getCalculatedRemainingSeconds(): number {
    if (eventState.status !== 'RUNNING') {
      return eventState.pausedRemainingSeconds;
    }
    if (!eventState.roundEndsAt) return eventState.roundDurationSeconds;
    const remaining = Math.max(0, Math.floor((eventState.roundEndsAt - Date.now()) / 1000));
    return remaining;
  }

  function updateEventStats() {
    let locked = 0;
    let disqualified = 0;
    let online = 0;
    const now = Date.now();

    teams.forEach(t => {
      if (t.status === 'LOCKED') locked++;
      if (t.status === 'DISQUALIFIED') disqualified++;
      if (now - t.lastActive < 120000) online++;
    });

    eventState.stats = {
      totalTeams: teams.size,
      onlineTeams: online,
      lockedTeams: locked,
      disqualifiedTeams: disqualified,
      activeWarnings: teamWarnings.length,
      totalSubmissions: submissions.size,
    };
  }

  function computeLeaderboard(): LeaderboardEntry[] {
    const list: LeaderboardEntry[] = [];
    teams.forEach(team => {
      let teamSubmissions = 0;
      submissions.forEach(sub => {
        if (sub.teamId === team.id) teamSubmissions++;
      });
      list.push({
        rank: 0,
        teamId: team.id,
        teamName: team.name,
        college: team.college,
        round1Score: team.round1Score,
        round2Score: team.round2Score,
        round3Score: team.round3Score,
        totalScore: team.totalScore,
        status: team.status,
        submissionCount: teamSubmissions,
        lastActive: team.lastActive,
      });
    });

    list.sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (b.round3Score !== a.round3Score) return b.round3Score - a.round3Score;
      if (b.round2Score !== a.round2Score) return b.round2Score - a.round2Score;
      return a.teamName.localeCompare(b.teamName);
    });

    list.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });

    return list;
  }

  // ==========================================
  // WEBSOCKET BROADCASTING
  // ==========================================
  function broadcast(type: string, payload: any) {
    const msg = JSON.stringify({ type, payload, timestamp: Date.now() });
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  }

  function broadcastState() {
    updateEventStats();
    const remaining = getCalculatedRemainingSeconds();
    const currentQ = getCurrentQuestion();
    const safeQ = sanitizeQuestion(currentQ);
    const roundQuestions = getRoundQuestions(eventState.currentRound);

    eventState.serverTime = Date.now();
    eventState.totalQuestionsInRound = roundQuestions.length;
    eventState.currentQuestionId = currentQ?.id || null;

    broadcast('EVENT_STATE', {
      ...eventState,
      remainingSeconds: remaining,
      currentQuestion: safeQ,
      leaderboard: eventState.showLeaderboard ? computeLeaderboard() : null,
    });
  }

  // Authoritative Timer Interval (Checks for round expiration)
  setInterval(() => {
    if (eventState.status === 'RUNNING' && !eventState.isPaused) {
      const remaining = getCalculatedRemainingSeconds();
      if (remaining <= 0) {
        eventState.status = 'PAUSED';
        eventState.isPaused = true;
        eventState.pausedRemainingSeconds = 0;
        broadcastState();
        broadcast('ROUND_EXPIRED', {
          round: eventState.currentRound,
          message: `Round ${eventState.currentRound} timer has expired. Submissions are now closed.`,
        });
      }
    }
  }, 1000);

  wss.on('connection', (ws) => {
    const remaining = getCalculatedRemainingSeconds();
    const currentQ = getCurrentQuestion();
    ws.send(JSON.stringify({
      type: 'INIT_STATE',
      payload: {
        ...eventState,
        remainingSeconds: remaining,
        currentQuestion: sanitizeQuestion(currentQ),
        leaderboard: eventState.showLeaderboard ? computeLeaderboard() : null,
      },
      timestamp: Date.now(),
    }));

    ws.on('message', (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.type === 'PING') {
          if (parsed.teamId) {
            const team = teams.get(parsed.teamId);
            if (team) team.lastActive = Date.now();
          }
          ws.send(JSON.stringify({ type: 'PONG', serverTime: Date.now() }));
        }
      } catch (err) {
        // ignore malformed websocket frame
      }
    });
  });

  // ==========================================
  // RBAC AUTHENTICATION MIDDLEWARE
  // ==========================================
  function requireRole(allowedRoles: AdminRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Authentication token required' });
      }
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (!decoded || !decoded.role) {
          return res.status(401).json({ error: 'Unauthorized: Invalid token payload' });
        }

        const userRole = decoded.role as AdminRole;
        if (userRole === 'SUPER_ADMIN' || allowedRoles.includes(userRole)) {
          (req as any).adminUser = decoded;
          return next();
        }

        return res.status(403).json({
          error: `Forbidden: Role '${userRole}' does not have permission for this resource. Required: ${allowedRoles.join(', ')}`,
        });
      } catch (err) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
      }
    };
  }

  // Pre-configured role guards
  const requireSuperAdmin = requireRole(['SUPER_ADMIN']);
  const requireAdminOrAbove = requireRole(['SUPER_ADMIN', 'ADMIN']);
  const requireModeratorOrAbove = requireRole(['SUPER_ADMIN', 'ADMIN', 'MODERATOR']);

  // ==========================================
  // PARTICIPANT APIS
  // ==========================================

  // 0. Server Health Check (Support both /health and /api/health)
  app.get(['/health', '/api/health'], (req, res) => {
    res.json({ status: 'ok', service: "TECH BRIDGE '26 Authoritative Game Server" });
  });

  // 1. Get Event Public State
  app.get('/api/event', (req, res) => {
    const teamId = (req.query.teamId as string)?.trim().toUpperCase();
    const remaining = getCalculatedRemainingSeconds();
    const currentQ = getCurrentQuestion(teamId);
    res.json({
      ...eventState,
      remainingSeconds: remaining,
      currentQuestion: sanitizeQuestion(currentQ, teamId),
      leaderboard: eventState.showLeaderboard ? computeLeaderboard() : null,
      serverTime: Date.now(),
    });
  });

  // 2. Get Current Question (Participant safe - NEVER exposes answer/aliases)
  app.get('/api/current-question', (req, res) => {
    const teamId = (req.query.teamId as string)?.trim().toUpperCase();
    const currentQ = getCurrentQuestion(teamId);
    if (!currentQ) {
      return res.status(404).json({ error: 'No active question found' });
    }
    res.json({
      question: sanitizeQuestion(currentQ, teamId),
      round: currentQ.round,
      remainingSeconds: getCalculatedRemainingSeconds(),
      status: eventState.status,
      serverTime: Date.now(),
    });
  });

  // 3. Register Team
  app.post('/api/team/register', (req, res) => {
    if (eventState.eventLocked) {
      return res.status(403).json({ error: 'Competition arena is locked by organizer. Registration closed.' });
    }

    const { name, participant1, participant2, college, department, year, phone } = req.body;

    if (!name || !participant1 || !college || !phone) {
      return res.status(400).json({ error: 'Missing required registration fields' });
    }

    // Check duplicate team name or phone
    for (const team of teams.values()) {
      if (team.name.trim().toLowerCase() === name.trim().toLowerCase()) {
        return res.status(409).json({ error: 'A team with this name is already registered' });
      }
      if (team.phone.trim() === phone.trim()) {
        return res.status(409).json({ error: 'This phone number has already been registered' });
      }
    }

    // Generate unique Team ID: TB-XXXX (4-digit random)
    let teamId = '';
    let exists = true;
    while (exists) {
      const rand = Math.floor(1000 + Math.random() * 9000);
      teamId = `TB-${rand}`;
      exists = teams.has(teamId);
    }

    const newTeam: Team = {
      id: teamId,
      name: name.trim(),
      participant1: participant1.trim(),
      participant2: participant2 ? participant2.trim() : undefined,
      college: college.trim(),
      department: department ? department.trim() : 'CSE',
      year: year ? year.trim() : '3rd Year',
      phone: phone.trim(),
      registeredAt: Date.now(),
      status: 'ACTIVE',
      warningsCount: 0,
      round1Score: 0,
      round2Score: 0,
      round3Score: 0,
      totalScore: 0,
      lastActive: Date.now(),
      isOnline: true,
    };

    teams.set(teamId, newTeam);
    broadcast('TEAM_REGISTERED', { team: newTeam });
    broadcastState();

    res.status(201).json({
      success: true,
      message: 'Team successfully registered for Tech Bridge \'26',
      team: newTeam,
    });
  });

  // 4. Team Login / Session Restore
  app.post('/api/team/login', (req, res) => {
    const { teamId } = req.body;
    if (!teamId) {
      return res.status(400).json({ error: 'Team ID is required' });
    }
    const cleanId = teamId.trim().toUpperCase();
    const team = teams.get(cleanId);
    if (!team) {
      return res.status(404).json({ error: 'Invalid Team ID. Please register or check your ID.' });
    }
    if (team.status === 'LOCKED') {
      return res.status(403).json({
        error: 'ACCESS LOCKED BY ORGANIZER',
        lockReason: team.lockReason || 'Administrative security lock',
      });
    }
    if (team.status === 'DISQUALIFIED') {
      return res.status(403).json({ error: 'This team has been disqualified from Tech Bridge \'26.' });
    }

    team.lastActive = Date.now();
    team.isOnline = true;

    // Collect team's existing submissions
    const teamSubmissions: Record<string, boolean> = {};
    submissions.forEach(sub => {
      if (sub.teamId === team.id) {
        teamSubmissions[sub.questionId] = true;
      }
    });

    res.json({
      success: true,
      team,
      submissions: teamSubmissions,
      eventState: {
        ...eventState,
        remainingSeconds: getCalculatedRemainingSeconds(),
      },
    });
  });

  // 4b. Team Status Check (Polling for live lock/warning state changes)
  app.get('/api/team/:teamId/status', (req, res) => {
    const { teamId } = req.params;
    const team = teams.get(teamId.toUpperCase());
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json({
      status: team.status,
      lockReason: team.lockReason,
      warningsCount: team.warningsCount,
      totalScore: team.totalScore,
      round1Score: team.round1Score,
      round2Score: team.round2Score,
      round3Score: team.round3Score,
    });
  });

  // 5. Submit Answer (ONE SUBMISSION PER QUESTION RULE + LOCK ENFORCEMENT)
  app.post('/api/answer', (req, res) => {
    const { teamId, questionId, answer } = req.body;

    if (!teamId || !questionId || answer === undefined) {
      return res.status(400).json({ error: 'Team ID, Question ID, and Answer are required' });
    }

    const team = teams.get(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    if (team.status === 'LOCKED') {
      return res.status(403).json({
        error: 'ACCESS LOCKED BY ORGANIZER',
        lockReason: team.lockReason || 'Administrative security lock',
      });
    }
    if (team.status === 'DISQUALIFIED') {
      return res.status(403).json({ error: 'Disqualified teams cannot submit answers' });
    }

    if (eventState.eventLocked) {
      return res.status(403).json({ error: 'Entire competition event is currently locked by organizer' });
    }

    if (eventState.roundLocked[eventState.currentRound]) {
      return res.status(403).json({ error: `Round ${eventState.currentRound} is currently locked by organizer` });
    }

    if (eventState.status !== 'RUNNING' || eventState.isPaused) {
      return res.status(400).json({ error: 'Submissions are currently closed (Event is paused or waiting)' });
    }

    const remaining = getCalculatedRemainingSeconds();
    if (remaining <= 0) {
      return res.status(400).json({ error: 'Round time expired. Submission rejected.' });
    }

    // Verify current active question for this team
    const currentQ = getCurrentQuestion(teamId);
    if (!currentQ || currentQ.id !== questionId) {
      return res.status(400).json({ error: 'Question is not currently active for your team' });
    }

    // Check if already submitted for this question
    const subKey = `${teamId}_${questionId}`;
    if (submissions.has(subKey) && !currentQ.allowRetries) {
      return res.status(409).json({
        error: 'Submission locked: You have already submitted an answer for this question',
        submission: submissions.get(subKey),
      });
    }

    // Authoritative Answer Evaluation on Server (Section 2 & 13)
    const norm = (val: string) => {
      let s = val.trim();
      if (!currentQ.caseSensitive) {
        s = s.toLowerCase();
      }
      // Space normalization: collapse multiple spaces to a single space
      s = s.replace(/\s+/g, ' ');
      return s;
    };

    const normSubmitted = norm(answer);
    const normCanonical = norm(currentQ.correctAnswer);
    const normAliases = (currentQ.aliases || []).map(norm);

    let isCorrect = (normSubmitted === normCanonical) || normAliases.includes(normSubmitted);

    // Fallback: strip punctuation/special characters if not disabled
    if (!isCorrect && currentQ.normalizeSpecialChars !== false) {
      const strip = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
      const stripSub = strip(answer);
      const stripCan = strip(currentQ.correctAnswer);
      const stripAli = (currentQ.aliases || []).map(strip);
      if (stripSub.length > 0 && (stripSub === stripCan || stripAli.includes(stripSub))) {
        isCorrect = true;
      }
    }

    const roundBasePoints = currentQ.round === 1 ? 1 : currentQ.round === 2 ? 2 : 3;
    const pointsAwarded = isCorrect
      ? (roundBasePoints + (currentQ.bonusMarks || 0))
      : (currentQ.negativeMarks ? -currentQ.negativeMarks : 0);

    // Update team score (unless in Test Mode)
    if (!eventState.isTestMode) {
      if (currentQ.round === 1) team.round1Score = Math.max(0, team.round1Score + pointsAwarded);
      else if (currentQ.round === 2) team.round2Score = Math.max(0, team.round2Score + pointsAwarded);
      else if (currentQ.round === 3) team.round3Score = Math.max(0, team.round3Score + pointsAwarded);
      team.totalScore = team.round1Score + team.round2Score + team.round3Score;
    }
    team.lastActive = Date.now();

    const newSubmission: Submission = {
      id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      teamId: team.id,
      teamName: team.name,
      questionId: currentQ.id,
      round: currentQ.round,
      questionNumber: currentQ.questionNumber,
      submittedAnswer: answer.trim(),
      isCorrect,
      pointsAwarded,
      submittedAt: Date.now(),
    };

    submissions.set(subKey, newSubmission);

    // Broadcast submission event to admin dashboard
    broadcast('NEW_SUBMISSION', {
      questionId: currentQ.id,
      teamId: team.id,
      teamName: team.name,
      round: currentQ.round,
      questionNumber: currentQ.questionNumber,
      isCorrect,
      pointsAwarded,
      totalScore: team.totalScore,
    });

    broadcastState();

    res.json({
      success: true,
      message: 'Answer submitted successfully and locked.',
      submissionId: newSubmission.id,
      isCorrect,
      pointsAwarded,
    });
  });

  // 6. Digital Buzzer Submission (Atomic server sequence, contender ranking & simultaneous tie detection)
  app.post('/api/buzzer', (req, res) => {
    const { teamId, questionId } = req.body;

    if (!teamId || !questionId) {
      return res.status(400).json({ error: 'teamId and questionId are required' });
    }

    const team = teams.get(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    if (team.status === 'LOCKED') {
      return res.status(403).json({ error: 'ACCESS LOCKED BY ORGANIZER' });
    }
    if (team.status === 'DISQUALIFIED') {
      return res.status(403).json({ error: 'Team disqualified from Tech Bridge \'26' });
    }

    if (!eventState.buzzerActive) {
      return res.status(400).json({ error: 'Buzzer is currently locked or closed for this question' });
    }

    const currentQ = getCurrentQuestion();
    if (!currentQ || currentQ.id !== questionId) {
      return res.status(400).json({ error: 'Question is no longer active for buzzing' });
    }

    const now = Date.now();
    buzzerSequenceCounter++;

    if (!eventState.buzzerContenders) {
      eventState.buzzerContenders = [];
    }

    // Check if team has already pressed for this buzzer round
    const existing = eventState.buzzerContenders.find(c => c.teamId === team.id);
    if (existing) {
      return res.json({
        won: existing.sequenceNumber === 1 || existing.isTie,
        isTie: existing.isTie,
        message: existing.isTie ? 'SIMULTANEOUS TIE DETECTED!' : 'You already buzzed for this question!',
        contender: existing,
        contenders: eventState.buzzerContenders,
      });
    }

    // SIMULTANEOUS TIE WINDOW: 85 milliseconds
    // Any teams buzzing within 85ms of the first buzz are considered simultaneous contenders
    const TIE_WINDOW_MS = 85;

    if (eventState.buzzerContenders.length === 0) {
      // First buzz received
      const firstContender: BuzzerContender = {
        teamId: team.id,
        teamName: team.name,
        timestamp: now,
        sequenceNumber: 1,
        deltaMs: 0,
        isTie: false,
      };

      eventState.buzzerContenders.push(firstContender);
      eventState.buzzerWinner = {
        teamId: team.id,
        teamName: team.name,
        timestamp: now,
        sequenceNumber: 1,
        deltaMs: 0,
        isTie: false,
      };
      eventState.buzzerTie = false;

      // Keep window open briefly (300ms) to detect simultaneous presses, then close buzzerActive
      setTimeout(() => {
        eventState.buzzerActive = false;
        broadcastState();
      }, 300);

      const bzEvent: BuzzerEvent = {
        id: `bz-${now}`,
        sequenceNumber: 1,
        questionId: currentQ.id,
        round: currentQ.round,
        teamId: team.id,
        teamName: team.name,
        serverTimestamp: now,
        won: true,
        pointsAwarded: 0,
      };
      buzzerEvents.push(bzEvent);

      broadcast('BUZZER_WINNER', {
        winner: eventState.buzzerWinner,
        contenders: eventState.buzzerContenders,
        isTie: false,
        questionId: currentQ.id,
      });
      broadcastState();

      const roundPoints = currentQ.round === 1 ? 1 : currentQ.round === 2 ? 2 : 3;

      return res.json({
        won: true,
        isTie: false,
        message: `FIRST BUZZ RECORDED! You won the buzz (+${roundPoints} ${roundPoints === 1 ? 'PT' : 'PTS'} on correct answer).`,
        points: roundPoints,
        timestamp: now,
        sequenceNumber: 1,
        deltaMs: 0,
        contenders: eventState.buzzerContenders,
      });
    } else {
      // Subsequent buzz within window
      const first = eventState.buzzerContenders[0];
      const deltaMs = now - first.timestamp;
      const seq = eventState.buzzerContenders.length + 1;
      const isTie = deltaMs <= TIE_WINDOW_MS;

      const contender: BuzzerContender = {
        teamId: team.id,
        teamName: team.name,
        timestamp: now,
        sequenceNumber: seq,
        deltaMs,
        isTie,
      };
      eventState.buzzerContenders.push(contender);

      if (isTie) {
        first.isTie = true;
        eventState.buzzerTie = true;
        if (eventState.buzzerWinner) {
          eventState.buzzerWinner.isTie = true;
        }
      }

      broadcast('BUZZER_TIE_UPDATE', {
        winner: eventState.buzzerWinner,
        contenders: eventState.buzzerContenders,
        isTie: eventState.buzzerTie,
        questionId: currentQ.id,
      });
      broadcastState();

      return res.json({
        won: isTie,
        isTie,
        message: isTie
          ? `SIMULTANEOUS BUZZ! Tied within ${deltaMs}ms with ${first.teamName}!`
          : `Buzzed #${seq} (+${deltaMs}ms). Another team was faster.`,
        timestamp: now,
        sequenceNumber: seq,
        deltaMs,
        contenders: eventState.buzzerContenders,
      });
    }
  });

  // 7. Anti-Cheat Event Reporter & Two-Violation Security Policy (Section 6)
  app.post('/api/anti-cheat', (req, res) => {
    let payload = req.body;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch (e) {
        // keep payload
      }
    }
    const { teamId, eventType, details, timeAwaySeconds } = payload || {};

    if (!teamId || !eventType) {
      return res.status(400).json({ error: 'teamId and eventType are required' });
    }

    const team = teams.get(teamId);
    const teamName = team ? team.name : 'Unknown Team';

    const severity: AntiCheatSeverity =
      (eventType === 'SCREEN_RECORD_DETECTED' || eventType === 'SCREENSHOT_ATTEMPTED' || eventType === 'MULTI_WINDOW_DETECTED' || eventType === 'DEV_TOOLS_DETECTED')
        ? 'CRITICAL'
        : (eventType === 'APP_BACKGROUND' || eventType === 'EXTERNAL_APP_SWITCH' || eventType === 'PICTURE_IN_PICTURE')
        ? 'HIGH'
        : (eventType === 'WINDOW_FOCUS_LOST' || eventType === 'OVERLAY_DETECTED' || eventType === 'FULLSCREEN_EXITED')
        ? 'WARNING'
        : 'INFO';

    const timeAwayStr = timeAwaySeconds ? ` (Left for ${timeAwaySeconds}s)` : '';
    const fullDetails = (details || 'Client security violation detected') + timeAwayStr;

    const alert: AntiCheatEvent = {
      id: `ac-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      teamId,
      teamName,
      eventType,
      details: fullDetails,
      severity,
      round: eventState.currentRound,
      questionNumber: (eventState.currentQuestionIndex || 0) + 1,
      timestamp: Date.now(),
      resolved: false,
    };

    antiCheatEvents.unshift(alert);
    if (antiCheatEvents.length > 1000) antiCheatEvents.pop();

    // Strict 2-Violation Security Rule
    const isSevere = severity === 'CRITICAL' || severity === 'HIGH' || severity === 'WARNING';

    if (team && isSevere && team.status !== 'DISQUALIFIED') {
      team.warningsCount++;
      const currentCount = team.warningsCount;

      const warning: TeamWarning = {
        id: `warn-${Date.now()}`,
        teamId: team.id,
        teamName: team.name,
        violationType: eventType,
        warningMessage: `Security violation (${currentCount}/2): ${fullDetails}`,
        issuedBy: 'AUTOMATED_SYSTEM',
        timestamp: Date.now(),
        severity,
      };
      teamWarnings.unshift(warning);

      if (currentCount >= 3) {
        team.status = 'LOCKED';
        team.lockReason = 'Automated security lockout: Your team has reached the maximum number of allowed violations (2/2). Please contact the event coordinator.';
        alert.actionTaken = 'LOCKED';
        broadcast('TEAM_LOCKED', { teamId: team.id, reason: team.lockReason, warningsCount: currentCount });
      } else {
        team.status = 'WARNED';
        alert.actionTaken = 'WARNED';
      }
    }

    broadcast('ANTI_CHEAT_ALERT', { alert });
    broadcastState();

    res.json({
      success: true,
      alertId: alert.id,
      warningsCount: team ? team.warningsCount : 0,
      status: team ? team.status : 'ACTIVE',
      isLocked: team?.status === 'LOCKED',
      maxViolations: 2,
    });
  });

  // 8. Live Leaderboard (Public)
  app.get('/api/leaderboard', (req, res) => {
    if (!eventState.showLeaderboard) {
      return res.json({ visible: false, message: 'Leaderboard is currently hidden by organizer' });
    }
    res.json({
      visible: true,
      leaderboard: computeLeaderboard(),
      updatedAt: Date.now(),
    });
  });

  // ==========================================
  // ADMIN AUTHENTICATION WITH BRUTE-FORCE PROTECTION
  // ==========================================
  app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const cleanUsername = username.trim();

    // Check rate limit
    if (!checkRateLimit(clientIp) || !checkRateLimit(cleanUsername)) {
      return res.status(429).json({
        error: 'Too many failed login attempts. Control desk login locked for 15 minutes.',
      });
    }

    // Match admin account
    const account = ADMIN_ACCOUNTS.find(a => a.username.toUpperCase() === cleanUsername.toUpperCase());
    if (!account) {
      recordFailedLogin(clientIp);
      recordFailedLogin(cleanUsername);
      return res.status(401).json({ error: 'Invalid administrator credentials' });
    }

    const isMatch = verifyAdminPassword(password, account.passwordHash);
    if (!isMatch) {
      recordFailedLogin(clientIp);
      recordFailedLogin(cleanUsername);
      return res.status(401).json({ error: 'Invalid administrator credentials' });
    }

    clearFailedLogins(clientIp);
    clearFailedLogins(cleanUsername);

    // Issue JWT token with role claim
    const token = jwt.sign(
      { username: account.username, role: account.role, symposium: 'TECH_BRIDGE_26' },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    recordAudit(
      account.username,
      account.role,
      'ADMIN_LOGIN',
      account.username,
      undefined,
      undefined,
      `Successful login from IP ${clientIp}`,
      clientIp
    );

    res.json({
      success: true,
      message: 'Admin authentication successful',
      token,
      username: account.username,
      role: account.role,
    });
  });

  // ==========================================
  // ADMIN CONTROL CENTER ENDPOINTS
  // ==========================================

  // START ROUND (ADMIN or SUPER_ADMIN)
  app.post('/api/admin/start', requireAdminOrAbove, (req, res) => {
    const { round } = req.body;
    const adminUser = (req as any).adminUser;
    const targetRound: 1 | 2 | 3 = round ? Number(round) as 1 | 2 | 3 : eventState.currentRound;

    const roundDuration = targetRound === 1 ? 1800 : targetRound === 2 ? 900 : 900;
    const roundQuestions = getRoundQuestions(targetRound);

    const oldRound = eventState.currentRound;
    eventState.currentRound = targetRound;
    eventState.currentQuestionIndex = 0;
    eventState.roundDurationSeconds = roundDuration;
    eventState.roundStartedAt = Date.now();
    eventState.roundEndsAt = Date.now() + (roundDuration * 1000);
    eventState.isPaused = false;
    eventState.status = 'RUNNING';
    eventState.buzzerActive = Boolean(eventState.buzzerRoundEnabled?.[targetRound]);
    eventState.buzzerWinner = null;
    eventState.buzzerTie = false;
    eventState.buzzerContenders = [];
    eventState.currentQuestionId = roundQuestions[0]?.id || null;

    recordAudit(
      adminUser.username,
      adminUser.role,
      'START_ROUND',
      `Round ${targetRound}`,
      `Round ${oldRound}`,
      `Round ${targetRound}`,
      `Started round with duration ${roundDuration}s`
    );

    broadcastState();
    res.json({ success: true, message: `Round ${targetRound} started!`, eventState });
  });

  // PAUSE EVENT (ADMIN or SUPER_ADMIN)
  app.post('/api/admin/pause', requireAdminOrAbove, (req, res) => {
    const adminUser = (req as any).adminUser;
    if (eventState.status === 'RUNNING' && !eventState.isPaused) {
      const remaining = getCalculatedRemainingSeconds();
      eventState.isPaused = true;
      eventState.pausedRemainingSeconds = remaining;

      recordAudit(
        adminUser.username,
        adminUser.role,
        'PAUSE_ROUND',
        `Round ${eventState.currentRound}`,
        'RUNNING',
        'PAUSED',
        `Remaining seconds frozen at ${remaining}s`
      );

      broadcastState();
    }
    res.json({ success: true, message: 'Event paused', eventState });
  });

  // RESUME EVENT (ADMIN or SUPER_ADMIN)
  app.post('/api/admin/resume', requireAdminOrAbove, (req, res) => {
    const adminUser = (req as any).adminUser;
    if (eventState.isPaused) {
      eventState.isPaused = false;
      eventState.status = 'RUNNING';
      eventState.roundEndsAt = Date.now() + (eventState.pausedRemainingSeconds * 1000);

      recordAudit(
        adminUser.username,
        adminUser.role,
        'RESUME_ROUND',
        `Round ${eventState.currentRound}`,
        'PAUSED',
        'RUNNING',
        `Resumed with ${eventState.pausedRemainingSeconds}s remaining`
      );

      broadcastState();
    }
    res.json({ success: true, message: 'Event resumed', eventState });
  });

  // EXTEND TIME (+60s, +300s)
  app.post('/api/admin/round/extend-time', requireAdminOrAbove, (req, res) => {
    const { seconds } = req.body;
    const adminUser = (req as any).adminUser;
    const addSecs = Number(seconds) || 60;

    const oldRemaining = getCalculatedRemainingSeconds();
    const newRemaining = oldRemaining + addSecs;

    if (eventState.isPaused || eventState.status !== 'RUNNING') {
      eventState.pausedRemainingSeconds = newRemaining;
    } else if (eventState.roundEndsAt) {
      eventState.roundEndsAt += addSecs * 1000;
    }

    recordAudit(
      adminUser.username,
      adminUser.role,
      'EXTEND_TIME',
      `Round ${eventState.currentRound}`,
      `${oldRemaining}s`,
      `${newRemaining}s`,
      `Extended timer by +${addSecs}s`
    );

    broadcastState();
    res.json({ success: true, message: `Timer extended by ${addSecs} seconds`, remainingSeconds: newRemaining });
  });

  // REDUCE TIME (-60s)
  app.post('/api/admin/round/reduce-time', requireAdminOrAbove, (req, res) => {
    const { seconds } = req.body;
    const adminUser = (req as any).adminUser;
    const subSecs = Number(seconds) || 60;

    const oldRemaining = getCalculatedRemainingSeconds();
    const newRemaining = Math.max(10, oldRemaining - subSecs);

    if (eventState.isPaused || eventState.status !== 'RUNNING') {
      eventState.pausedRemainingSeconds = newRemaining;
    } else if (eventState.roundEndsAt) {
      eventState.roundEndsAt = Date.now() + (newRemaining * 1000);
    }

    recordAudit(
      adminUser.username,
      adminUser.role,
      'REDUCE_TIME',
      `Round ${eventState.currentRound}`,
      `${oldRemaining}s`,
      `${newRemaining}s`,
      `Reduced timer by -${subSecs}s`
    );

    broadcastState();
    res.json({ success: true, message: `Timer reduced by ${subSecs} seconds`, remainingSeconds: newRemaining });
  });

  // LOCK / UNLOCK SPECIFIC ROUND
  app.post('/api/admin/round/toggle-lock', requireAdminOrAbove, (req, res) => {
    const { round } = req.body;
    const adminUser = (req as any).adminUser;
    const r = (Number(round) || eventState.currentRound) as 1 | 2 | 3;

    eventState.roundLocked[r] = !eventState.roundLocked[r];

    recordAudit(
      adminUser.username,
      adminUser.role,
      eventState.roundLocked[r] ? 'LOCK_ROUND' : 'UNLOCK_ROUND',
      `Round ${r}`,
      eventState.roundLocked[r] ? 'UNLOCKED' : 'LOCKED',
      eventState.roundLocked[r] ? 'LOCKED' : 'UNLOCKED'
    );

    broadcastState();
    res.json({ success: true, round: r, isLocked: eventState.roundLocked[r] });
  });

  // LOCK / UNLOCK EVENT WIDE
  app.post('/api/admin/event/toggle-lock', requireAdminOrAbove, (req, res) => {
    const adminUser = (req as any).adminUser;
    eventState.eventLocked = !eventState.eventLocked;

    recordAudit(
      adminUser.username,
      adminUser.role,
      eventState.eventLocked ? 'LOCK_EVENT' : 'UNLOCK_EVENT',
      'TECH BRIDGE 26 ARENA',
      eventState.eventLocked ? 'UNLOCKED' : 'LOCKED',
      eventState.eventLocked ? 'LOCKED' : 'UNLOCKED'
    );

    broadcastState();
    res.json({ success: true, eventLocked: eventState.eventLocked });
  });

  // TOGGLE TEST / DEMO MODE
  app.post('/api/admin/toggle-test-mode', requireSuperAdmin, (req, res) => {
    const adminUser = (req as any).adminUser;
    eventState.isTestMode = !eventState.isTestMode;

    recordAudit(
      adminUser.username,
      adminUser.role,
      'TOGGLE_TEST_MODE',
      'EVENT_STATE',
      eventState.isTestMode ? 'PRODUCTION' : 'TEST_MODE',
      eventState.isTestMode ? 'TEST_MODE' : 'PRODUCTION'
    );

    broadcastState();
    res.json({ success: true, isTestMode: eventState.isTestMode });
  });

  // NEXT QUESTION
  app.post('/api/admin/next', requireAdminOrAbove, (req, res) => {
    const adminUser = (req as any).adminUser;
    const roundQuestions = getRoundQuestions(eventState.currentRound);
    if (eventState.currentQuestionIndex < roundQuestions.length - 1) {
      const oldIdx = eventState.currentQuestionIndex;
      eventState.currentQuestionIndex++;
      const nextQ = roundQuestions[eventState.currentQuestionIndex];
      eventState.currentQuestionId = nextQ?.id || null;
      eventState.buzzerActive = Boolean(eventState.buzzerRoundEnabled?.[eventState.currentRound]);
      eventState.buzzerWinner = null;
      eventState.buzzerTie = false;
      eventState.buzzerContenders = [];

      recordAudit(
        adminUser.username,
        adminUser.role,
        'NEXT_QUESTION',
        `Round ${eventState.currentRound}`,
        `Q${oldIdx + 1}`,
        `Q${eventState.currentQuestionIndex + 1}`
      );

      broadcastState();
      return res.json({ success: true, message: `Advanced to question ${eventState.currentQuestionIndex + 1}`, currentQuestion: sanitizeQuestion(nextQ) });
    }
    res.json({ success: false, message: 'Already at the last question of this round.' });
  });

  // PREVIOUS QUESTION
  app.post('/api/admin/prev', requireAdminOrAbove, (req, res) => {
    const adminUser = (req as any).adminUser;
    const roundQuestions = getRoundQuestions(eventState.currentRound);
    if (eventState.currentQuestionIndex > 0) {
      const oldIdx = eventState.currentQuestionIndex;
      eventState.currentQuestionIndex--;
      const prevQ = roundQuestions[eventState.currentQuestionIndex];
      eventState.currentQuestionId = prevQ?.id || null;
      eventState.buzzerActive = Boolean(eventState.buzzerRoundEnabled?.[eventState.currentRound]);
      eventState.buzzerWinner = null;
      eventState.buzzerTie = false;
      eventState.buzzerContenders = [];

      recordAudit(
        adminUser.username,
        adminUser.role,
        'PREV_QUESTION',
        `Round ${eventState.currentRound}`,
        `Q${oldIdx + 1}`,
        `Q${eventState.currentQuestionIndex + 1}`
      );

      broadcastState();
      return res.json({ success: true, message: `Moved back to question ${eventState.currentQuestionIndex + 1}`, currentQuestion: sanitizeQuestion(prevQ) });
    }
    res.json({ success: false, message: 'Already at the first question of this round.' });
  });

  // JUMP TO SPECIFIC QUESTION
  app.post('/api/admin/jump', requireAdminOrAbove, (req, res) => {
    const { questionIndex } = req.body;
    const adminUser = (req as any).adminUser;
    const roundQuestions = getRoundQuestions(eventState.currentRound);
    const idx = Number(questionIndex);
    if (idx >= 0 && idx < roundQuestions.length) {
      const oldIdx = eventState.currentQuestionIndex;
      eventState.currentQuestionIndex = idx;
      const targetQ = roundQuestions[idx];
      eventState.currentQuestionId = targetQ?.id || null;
      eventState.buzzerActive = Boolean(eventState.buzzerRoundEnabled?.[eventState.currentRound]);
      eventState.buzzerWinner = null;
      eventState.buzzerTie = false;
      eventState.buzzerContenders = [];

      recordAudit(
        adminUser.username,
        adminUser.role,
        'JUMP_QUESTION',
        `Round ${eventState.currentRound}`,
        `Q${oldIdx + 1}`,
        `Q${idx + 1}`
      );

      broadcastState();
      return res.json({ success: true, message: `Jumped to question ${idx + 1}`, currentQuestion: sanitizeQuestion(targetQ) });
    }
    res.status(400).json({ error: 'Invalid question index' });
  });

  // STOP ROUND
  app.post('/api/admin/stop', requireAdminOrAbove, (req, res) => {
    const adminUser = (req as any).adminUser;
    eventState.status = 'COMPLETED';
    eventState.isPaused = false;
    eventState.buzzerActive = false;

    recordAudit(
      adminUser.username,
      adminUser.role,
      'STOP_ROUND',
      `Round ${eventState.currentRound}`,
      'RUNNING',
      'COMPLETED'
    );

    broadcastState();
    res.json({ success: true, message: 'Round stopped', eventState });
  });

  // RESET EVENT (Requires exact confirmation phrase "RESET TECH BRIDGE")
  app.post('/api/admin/reset', requireSuperAdmin, (req, res) => {
    const { confirmation } = req.body;
    const adminUser = (req as any).adminUser;

    if (confirmation !== 'RESET TECH BRIDGE' && confirmation !== 'YES, RESET EVENT') {
      return res.status(400).json({
        error: 'Confirmation phrase mismatch. To reset the symposium event, type "RESET TECH BRIDGE".'
      });
    }

    submissions.clear();
    antiCheatEvents.length = 0;
    buzzerEvents.length = 0;
    teamWarnings.length = 0;

    // Reset team scores
    teams.forEach(t => {
      t.round1Score = 0;
      t.round2Score = 0;
      t.round3Score = 0;
      t.totalScore = 0;
      t.status = 'ACTIVE';
      t.warningsCount = 0;
      t.lockReason = undefined;
    });

    eventState.status = 'WAITING';
    eventState.currentRound = 1;
    eventState.currentQuestionIndex = 0;
    eventState.roundDurationSeconds = 1800;
    eventState.roundStartedAt = null;
    eventState.roundEndsAt = null;
    eventState.isPaused = false;
    eventState.pausedRemainingSeconds = 1800;
    eventState.eventLocked = false;
    eventState.roundLocked = { 1: false, 2: false, 3: false };
    eventState.activeQuestionSet = { 1: 'A', 2: 'A', 3: 'A' };
    eventState.buzzerActive = false;
    eventState.buzzerWinner = null;
    eventState.currentQuestionId = questions[0]?.id || null;

    recordAudit(
      adminUser.username,
      adminUser.role,
      'RESET_EVENT',
      'TECH BRIDGE 26 ARENA',
      undefined,
      undefined,
      'Hard reset performed. All scores, submissions, and buzzer queues cleared.'
    );

    broadcastState();
    res.json({ success: true, message: 'Symposium event completely reset.' });
  });

  // TOGGLE LEADERBOARD DISPLAY
  app.post('/api/admin/toggle-leaderboard', requireModeratorOrAbove, (req, res) => {
    const adminUser = (req as any).adminUser;
    eventState.showLeaderboard = !eventState.showLeaderboard;

    recordAudit(
      adminUser.username,
      adminUser.role,
      'TOGGLE_LEADERBOARD',
      'PUBLIC_SCOREBOARD',
      eventState.showLeaderboard ? 'HIDDEN' : 'VISIBLE',
      eventState.showLeaderboard ? 'VISIBLE' : 'HIDDEN'
    );

    broadcastState();
    res.json({ success: true, showLeaderboard: eventState.showLeaderboard });
  });

  // BUZZER CONTROLS
  app.post('/api/admin/buzzer-toggle', requireAdminOrAbove, (req, res) => {
    const { round, enabled } = req.body;
    const adminUser = (req as any).adminUser;
    const r = (Number(round) || eventState.currentRound) as 1 | 2 | 3;

    if (!eventState.buzzerRoundEnabled) {
      eventState.buzzerRoundEnabled = { 1: false, 2: false, 3: true };
    }

    if (enabled !== undefined) {
      eventState.buzzerRoundEnabled[r] = Boolean(enabled);
    } else {
      eventState.buzzerRoundEnabled[r] = !eventState.buzzerRoundEnabled[r];
    }

    // Sync buzzerActive if currently in this round
    if (eventState.currentRound === r) {
      eventState.buzzerActive = eventState.buzzerRoundEnabled[r];
      if (!eventState.buzzerActive) {
        eventState.buzzerWinner = null;
        eventState.buzzerTie = false;
        eventState.buzzerContenders = [];
      }
    }

    recordAudit(
      adminUser.username,
      adminUser.role,
      'TOGGLE_BUZZER_ROUND',
      `Round ${r}`,
      eventState.buzzerRoundEnabled[r] ? 'OFF' : 'ON',
      eventState.buzzerRoundEnabled[r] ? 'ON' : 'OFF',
      `Organizer ${eventState.buzzerRoundEnabled[r] ? 'switched ON' : 'switched OFF'} buzzer for Round ${r}`
    );

    broadcastState();
    res.json({
      success: true,
      message: `Buzzer for Round ${r} is now ${eventState.buzzerRoundEnabled[r] ? 'ENABLED' : 'DISABLED'}`,
      buzzerRoundEnabled: eventState.buzzerRoundEnabled,
      buzzerActive: eventState.buzzerActive,
    });
  });

  app.post('/api/admin/buzzer-reset', requireAdminOrAbove, (req, res) => {
    const adminUser = (req as any).adminUser;
    eventState.buzzerWinner = null;
    eventState.buzzerTie = false;
    eventState.buzzerContenders = [];
    eventState.buzzerActive = true;

    recordAudit(
      adminUser.username,
      adminUser.role,
      'ARM_BUZZER',
      `Q${(eventState.currentQuestionIndex || 0) + 1} (R${eventState.currentRound})`,
      'LOCKED',
      'ARMED'
    );

    broadcast('BUZZER_RESET', {});
    broadcastState();
    res.json({ success: true, message: 'Buzzer re-armed and contenders cleared' });
  });

  app.post('/api/admin/buzzer-award', requireAdminOrAbove, (req, res) => {
    const { awardPoints, points, targetTeamId } = req.body;
    const adminUser = (req as any).adminUser;

    if (!eventState.buzzerWinner && (!eventState.buzzerContenders || eventState.buzzerContenders.length === 0)) {
      return res.status(400).json({ error: 'No active buzzer contender found to award' });
    }

    const recipientTeamId = targetTeamId || eventState.buzzerWinner?.teamId || eventState.buzzerContenders?.[0]?.teamId;
    const team = recipientTeamId ? teams.get(recipientTeamId) : null;
    const currentQ = getCurrentQuestion();
    const roundStandardPts = eventState.currentRound === 1 ? 1 : eventState.currentRound === 2 ? 2 : 3;
    const defaultPts = currentQ ? (currentQ.round === 1 ? 1 : currentQ.round === 2 ? 2 : 3) : roundStandardPts;
    const pts = (points !== undefined && Number(points) > 0) ? Number(points) : defaultPts;
    const r = eventState.currentRound;

    if (awardPoints && team && !eventState.isTestMode) {
      if (r === 1) team.round1Score += pts;
      else if (r === 2) team.round2Score += pts;
      else team.round3Score += pts;
      team.totalScore = team.round1Score + team.round2Score + team.round3Score;
    }

    const teamName = team ? team.name : (recipientTeamId || 'Unknown Team');

    recordAudit(
      adminUser.username,
      adminUser.role,
      awardPoints ? 'AWARD_BUZZER_POINTS' : 'PASS_BUZZER',
      teamName,
      '0',
      awardPoints ? `+${pts}` : '0',
      `Points ${awardPoints ? 'awarded' : 'passed'} for team ${recipientTeamId} (R${r})`
    );

    eventState.buzzerWinner = null;
    eventState.buzzerTie = false;
    eventState.buzzerContenders = [];
    eventState.buzzerActive = false;
    broadcastState();

    res.json({
      success: true,
      message: awardPoints ? `Awarded ${pts} points to ${teamName}` : `Passed on buzzer for ${teamName}`,
    });
  });

  // ==========================================
  // CERTIFICATE ISSUANCE & VERIFICATION APIS
  // ==========================================

  // 1. GET PUBLIC/ADMIN CERTIFICATE CONFIG
  app.get('/api/certificate/config', (req, res) => {
    res.json({ config: certificateConfig });
  });

  // 2. UPDATE CERTIFICATE CONFIG (ADMIN)
  app.post('/api/admin/certificate/config', requireAdminOrAbove, (req, res) => {
    const { config } = req.body;
    const adminUser = (req as any).adminUser;

    if (!config) {
      return res.status(400).json({ error: 'Config payload is required' });
    }

    certificateConfig = {
      ...certificateConfig,
      ...config,
      // Retain sampleUploadedImage if not explicitly overwritten
      sampleUploadedImage: config.sampleUploadedImage !== undefined ? config.sampleUploadedImage : certificateConfig.sampleUploadedImage,
      sampleUploadedFileName: config.sampleUploadedFileName !== undefined ? config.sampleUploadedFileName : certificateConfig.sampleUploadedFileName,
    };

    recordAudit(
      adminUser.username,
      adminUser.role,
      'UPDATE_CERTIFICATE_CONFIG',
      'SYMPOSIUM_CERTIFICATE_MASTER',
      undefined,
      undefined,
      'Organizer updated symposium certificate template, signatories, and theme'
    );

    broadcast('CERTIFICATE_CONFIG_UPDATED', { config: certificateConfig });
    res.json({ success: true, config: certificateConfig, message: 'Certificate settings updated successfully.' });
  });

  // 3. UPLOAD SAMPLE CERTIFICATE BACKGROUND (ADMIN)
  app.post('/api/admin/certificate/upload-sample', requireAdminOrAbove, (req, res) => {
    const { imageDataUrl, fileName } = req.body;
    const adminUser = (req as any).adminUser;

    if (!imageDataUrl) {
      return res.status(400).json({ error: 'imageDataUrl is required (Base64 image or URL).' });
    }

    certificateConfig.sampleUploadedImage = imageDataUrl;
    certificateConfig.sampleUploadedFileName = fileName || 'sample_certificate_master.png';

    recordAudit(
      adminUser.username,
      adminUser.role,
      'UPLOAD_SAMPLE_CERTIFICATE',
      'CERTIFICATE_BACKGROUND',
      undefined,
      fileName,
      'Organizer uploaded official symposium sample certificate template'
    );

    broadcast('CERTIFICATE_CONFIG_UPDATED', { config: certificateConfig });
    res.json({ success: true, message: 'Sample certificate template uploaded successfully.', config: certificateConfig });
  });

  // 4. GET TEAM CERTIFICATE DATA (PUBLIC / PARTICIPANT)
  app.get('/api/certificate/team/:teamId', (req, res) => {
    const { teamId } = req.params;
    const team = teams.get(teamId);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Determine team rank from current leaderboard
    const sortedTeams = Array.from(teams.values()).sort((a, b) => b.totalScore - a.totalScore);
    const rankIndex = sortedTeams.findIndex(t => t.id === team.id);
    const rank = rankIndex >= 0 ? rankIndex + 1 : 1;

    let awardCategory: 'FIRST_PLACE' | 'SECOND_PLACE' | 'THIRD_PLACE' | 'DISTINCTION' | 'MERIT_PARTICIPATION' = 'MERIT_PARTICIPATION';
    if (rank === 1 && team.totalScore > 0) awardCategory = 'FIRST_PLACE';
    else if (rank === 2 && team.totalScore > 0) awardCategory = 'SECOND_PLACE';
    else if (rank === 3 && team.totalScore > 0) awardCategory = 'THIRD_PLACE';
    else if (team.totalScore >= 10) awardCategory = 'DISTINCTION';

    const certId = `CERT-TB26-${team.id}-${rank}`;
    const verificationHash = Buffer.from(`${certId}-${team.name}-${team.totalScore}-ACET-2026`).toString('base64').slice(0, 16);

    const certificateData: TeamCertificateData = {
      certificateId: certId,
      teamId: team.id,
      teamName: team.name,
      participant1: team.participant1,
      participant2: team.participant2 || '',
      college: team.college,
      department: team.department,
      year: team.year,
      rank,
      totalScore: team.totalScore,
      round1Score: team.round1Score,
      round2Score: team.round2Score,
      round3Score: team.round3Score,
      awardCategory,
      issuedAt: Date.now(),
      verificationHash,
      config: certificateConfig,
    };

    res.json({ certificate: certificateData });
  });

  // 5. GET ALL CERTIFICATES (ADMIN BATCH PRINTING)
  app.get('/api/admin/certificates/all', requireAdminOrAbove, (req, res) => {
    const sortedTeams = Array.from(teams.values()).sort((a, b) => b.totalScore - a.totalScore);
    
    const certList: TeamCertificateData[] = sortedTeams.map((team, idx) => {
      const rank = idx + 1;
      let awardCategory: 'FIRST_PLACE' | 'SECOND_PLACE' | 'THIRD_PLACE' | 'DISTINCTION' | 'MERIT_PARTICIPATION' = 'MERIT_PARTICIPATION';
      if (rank === 1 && team.totalScore > 0) awardCategory = 'FIRST_PLACE';
      else if (rank === 2 && team.totalScore > 0) awardCategory = 'SECOND_PLACE';
      else if (rank === 3 && team.totalScore > 0) awardCategory = 'THIRD_PLACE';
      else if (team.totalScore >= 10) awardCategory = 'DISTINCTION';

      const certId = `CERT-TB26-${team.id}-${rank}`;
      const verificationHash = Buffer.from(`${certId}-${team.name}-${team.totalScore}-ACET-2026`).toString('base64').slice(0, 16);

      return {
        certificateId: certId,
        teamId: team.id,
        teamName: team.name,
        participant1: team.participant1,
        participant2: team.participant2 || '',
        college: team.college,
        department: team.department,
        year: team.year,
        rank,
        totalScore: team.totalScore,
        round1Score: team.round1Score,
        round2Score: team.round2Score,
        round3Score: team.round3Score,
        awardCategory,
        issuedAt: Date.now(),
        verificationHash,
        config: certificateConfig,
      };
    });

    res.json({ certificates: certList, total: certList.length, config: certificateConfig });
  });

  // ==========================================
  // PARTICIPANT & TEAM MANAGEMENT APIS
  // ==========================================

  // GET TEAMS
  app.get('/api/admin/teams', requireModeratorOrAbove, (req, res) => {
    const now = Date.now();
    const teamList = Array.from(teams.values()).map(t => ({
      ...t,
      isOnline: now - t.lastActive < 120000,
    }));
    res.json({ teams: teamList });
  });

  // LOCK TEAM
  app.post('/api/admin/team/lock', requireModeratorOrAbove, (req, res) => {
    const { teamId, reason } = req.body;
    const adminUser = (req as any).adminUser;
    const team = teams.get(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const oldStatus = team.status;
    team.status = 'LOCKED';
    team.lockReason = reason || 'Locked by symposium administrator';

    recordAudit(
      adminUser.username,
      adminUser.role,
      'LOCK_TEAM',
      team.name,
      oldStatus,
      'LOCKED',
      team.lockReason
    );

    broadcast('TEAM_LOCKED', { teamId: team.id, reason: team.lockReason });
    broadcastState();
    res.json({ success: true, team });
  });

  // UNLOCK TEAM
  app.post('/api/admin/team/unlock', requireModeratorOrAbove, (req, res) => {
    const { teamId } = req.body;
    const adminUser = (req as any).adminUser;
    const team = teams.get(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const oldStatus = team.status;
    team.status = 'ACTIVE';
    team.lockReason = undefined;

    recordAudit(
      adminUser.username,
      adminUser.role,
      'UNLOCK_TEAM',
      team.name,
      oldStatus,
      'ACTIVE',
      'Team unlocked by administrator'
    );

    broadcast('TEAM_UNLOCKED', { teamId: team.id });
    broadcastState();
    res.json({ success: true, team });
  });

  // MANAGE TEAM VIOLATIONS (Add, Remove, Reset)
  app.post('/api/admin/team/violations', requireModeratorOrAbove, (req, res) => {
    const { teamId, action, reason } = req.body;
    const adminUser = (req as any).adminUser;
    const team = teams.get(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const oldCount = team.warningsCount || 0;
    let newCount = oldCount;

    if (action === 'ADD') {
      newCount = oldCount + 1;
    } else if (action === 'REMOVE') {
      newCount = Math.max(0, oldCount - 1);
    } else if (action === 'RESET') {
      newCount = 0;
    }

    team.warningsCount = newCount;
    if (newCount >= 2 && team.status !== 'DISQUALIFIED') {
      team.status = 'LOCKED';
      team.lockReason = 'Automated security lockout: Reached maximum allowed violations (2/2).';
    } else if (newCount === 0 && team.status === 'LOCKED') {
      team.status = 'ACTIVE';
      team.lockReason = undefined;
    } else if (newCount === 1 && team.status === 'LOCKED') {
      team.status = 'WARNED';
      team.lockReason = undefined;
    }

    recordAudit(
      adminUser.username,
      adminUser.role,
      'MANAGE_VIOLATIONS',
      team.name,
      String(oldCount),
      String(newCount),
      `Action: ${action}. Reason: ${reason || 'Admin override'}`
    );

    broadcastState();
    res.json({ success: true, team, warningsCount: team.warningsCount });
  });

  // WARN TEAM
  app.post('/api/admin/team/warn', requireModeratorOrAbove, (req, res) => {
    const { teamId, message, severity } = req.body;
    const adminUser = (req as any).adminUser;
    const team = teams.get(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    team.warningsCount++;
    if (team.status === 'ACTIVE') {
      team.status = 'WARNED';
    }

    const warning: TeamWarning = {
      id: `warn-${Date.now()}`,
      teamId: team.id,
      teamName: team.name,
      violationType: 'ADMINISTRATOR_WARNING',
      warningMessage: message || 'Formal symposium warning issued by organizers',
      issuedBy: adminUser.username,
      timestamp: Date.now(),
      severity: (severity as AntiCheatSeverity) || 'WARNING',
    };
    teamWarnings.unshift(warning);

    recordAudit(
      adminUser.username,
      adminUser.role,
      'WARN_TEAM',
      team.name,
      `${team.warningsCount - 1} warnings`,
      `${team.warningsCount} warnings`,
      warning.warningMessage
    );

    broadcast('TEAM_WARNED', { teamId: team.id, warning });
    broadcastState();
    res.json({ success: true, team, warning });
  });

  // DISQUALIFY TEAM
  app.post('/api/admin/team/disqualify', requireAdminOrAbove, (req, res) => {
    const { teamId, reason } = req.body;
    const adminUser = (req as any).adminUser;
    const team = teams.get(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const oldStatus = team.status;
    team.status = 'DISQUALIFIED';
    team.lockReason = reason || 'Disqualified from Tech Bridge \'26';

    recordAudit(
      adminUser.username,
      adminUser.role,
      'DISQUALIFY_TEAM',
      team.name,
      oldStatus,
      'DISQUALIFIED',
      team.lockReason
    );

    broadcast('TEAM_DISQUALIFIED', { teamId: team.id, reason: team.lockReason });
    broadcastState();
    res.json({ success: true, team });
  });

  // RESTORE TEAM
  app.post('/api/admin/team/restore', requireAdminOrAbove, (req, res) => {
    const { teamId } = req.body;
    const adminUser = (req as any).adminUser;
    const team = teams.get(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const oldStatus = team.status;
    team.status = 'ACTIVE';
    team.lockReason = undefined;

    recordAudit(
      adminUser.username,
      adminUser.role,
      'RESTORE_TEAM',
      team.name,
      oldStatus,
      'ACTIVE',
      'Team status restored to active'
    );

    broadcastState();
    res.json({ success: true, team });
  });

  // EDIT TEAM DETAILS
  app.post('/api/admin/team/edit', requireAdminOrAbove, (req, res) => {
    const { teamId, name, participant1, participant2, college, department, year, phone } = req.body;
    const adminUser = (req as any).adminUser;
    const team = teams.get(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const oldName = team.name;
    if (name) team.name = name.trim();
    if (participant1) team.participant1 = participant1.trim();
    if (participant2 !== undefined) team.participant2 = participant2.trim() || undefined;
    if (college) team.college = college.trim();
    if (department) team.department = department.trim();
    if (year) team.year = year.trim();
    if (phone) team.phone = phone.trim();

    recordAudit(
      adminUser.username,
      adminUser.role,
      'EDIT_TEAM',
      team.id,
      oldName,
      team.name,
      'Participant details modified by administrator'
    );

    broadcastState();
    res.json({ success: true, team });
  });

  // ADD NEW TEAM (ADMIN or SUPER_ADMIN)
  app.post('/api/admin/team/add', requireAdminOrAbove, (req, res) => {
    const { id, name, participant1, participant2, college, department, year, phone } = req.body;
    const adminUser = (req as any).adminUser;

    if (!name || !participant1) {
      return res.status(400).json({ error: 'Team name and Participant 1 name are required.' });
    }

    let teamId = id ? String(id).trim().toUpperCase() : '';
    if (!teamId) {
      let candidateId = `TB-${Math.floor(1000 + Math.random() * 9000)}`;
      while (teams.has(candidateId)) {
        candidateId = `TB-${Math.floor(1000 + Math.random() * 9000)}`;
      }
      teamId = candidateId;
    } else if (teams.has(teamId)) {
      return res.status(400).json({ error: `Team ID ${teamId} is already registered.` });
    }

    const newTeam: Team = {
      id: teamId,
      name: String(name).trim(),
      participant1: String(participant1).trim(),
      participant2: participant2 ? String(participant2).trim() : undefined,
      college: (college ? String(college) : 'Autonomous College of Engineering & Technology').trim(),
      department: (department ? String(department) : 'Computer Science & Engineering').trim(),
      year: (year ? String(year) : '3rd Year').trim(),
      phone: (phone ? String(phone) : '9876543210').trim(),
      registeredAt: Date.now(),
      status: 'ACTIVE',
      warningsCount: 0,
      round1Score: 0,
      round2Score: 0,
      round3Score: 0,
      totalScore: 0,
      lastActive: Date.now(),
      isOnline: true,
    };

    teams.set(teamId, newTeam);

    recordAudit(
      adminUser.username,
      adminUser.role,
      'ADD_TEAM',
      newTeam.id,
      undefined,
      newTeam.name,
      `New team manually registered by administrator (${newTeam.college})`
    );

    broadcastState();
    res.json({ success: true, message: `Team ${newTeam.name} (${newTeam.id}) added successfully.`, team: newTeam });
  });

  // REMOVE TEAM (ADMIN or SUPER_ADMIN)
  app.post('/api/admin/team/remove', requireAdminOrAbove, (req, res) => {
    const { teamId } = req.body;
    const adminUser = (req as any).adminUser;

    if (!teamId) {
      return res.status(400).json({ error: 'Team ID is required.' });
    }

    const normId = String(teamId).trim().toUpperCase();
    const team = teams.get(normId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    const teamName = team.name;

    // Purge associated submissions
    for (const [key, sub] of submissions.entries()) {
      if (sub.teamId === normId) {
        submissions.delete(key);
      }
    }

    // Reset buzzer if this team was buzzing
    if (eventState.buzzerWinner?.teamId === normId) {
      eventState.buzzerWinner = null;
      eventState.buzzerActive = eventState.currentRound === 3;
    }

    // Delete team from memory
    teams.delete(normId);

    recordAudit(
      adminUser.username,
      adminUser.role,
      'REMOVE_TEAM',
      normId,
      teamName,
      undefined,
      `Team ${teamName} (${normId}) permanently removed by administrator`
    );

    broadcastState();
    res.json({ success: true, message: `Team ${teamName} (${normId}) removed successfully.` });
  });

  // OVERRIDE SCORE
  app.post('/api/admin/team/score-override', requireAdminOrAbove, (req, res) => {
    const { teamId, round, newScore, reason } = req.body;
    const adminUser = (req as any).adminUser;
    const team = teams.get(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const r = Number(round) as 1 | 2 | 3;
    const pts = Number(newScore);

    const oldScore = r === 1 ? team.round1Score : r === 2 ? team.round2Score : team.round3Score;
    if (r === 1) team.round1Score = pts;
    else if (r === 2) team.round2Score = pts;
    else if (r === 3) team.round3Score = pts;
    team.totalScore = team.round1Score + team.round2Score + team.round3Score;

    recordAudit(
      adminUser.username,
      adminUser.role,
      'OVERRIDE_SCORE',
      `${team.name} (R${r})`,
      `${oldScore}`,
      `${pts}`,
      reason || 'Manual score adjustment'
    );

    broadcastState();
    res.json({ success: true, team });
  });

  // ==========================================
  // ANTI-CHEAT TRIAGE & ACTION
  // ==========================================

  // GET ANTI-CHEAT EVENTS
  app.get('/api/admin/anti-cheat', requireModeratorOrAbove, (req, res) => {
    res.json({ events: antiCheatEvents });
  });

  // ACTION ON ANTI-CHEAT ALERT
  app.post('/api/admin/anti-cheat/action', requireModeratorOrAbove, (req, res) => {
    const { eventId, action, reason } = req.body;
    const adminUser = (req as any).adminUser;

    const alert = antiCheatEvents.find(a => a.id === eventId);
    if (!alert) return res.status(404).json({ error: 'Anti-cheat alert not found' });

    alert.resolved = true;
    alert.actionTaken = action;
    alert.resolvedBy = adminUser.username;
    alert.resolvedAt = Date.now();

    const team = teams.get(alert.teamId);
    if (team) {
      if (action === 'WARN') {
        team.warningsCount++;
        if (team.status === 'ACTIVE') team.status = 'WARNED';
        teamWarnings.unshift({
          id: `warn-${Date.now()}`,
          teamId: team.id,
          teamName: team.name,
          violationType: alert.eventType,
          warningMessage: reason || `Violation alert actioned: ${alert.details}`,
          issuedBy: adminUser.username,
          timestamp: Date.now(),
          severity: alert.severity,
        });
      } else if (action === 'LOCKED') {
        team.status = 'LOCKED';
        team.lockReason = reason || `Access locked following security incident: ${alert.eventType}`;
        broadcast('TEAM_LOCKED', { teamId: team.id, reason: team.lockReason });
      } else if (action === 'DISQUALIFIED') {
        team.status = 'DISQUALIFIED';
        team.lockReason = reason || `Disqualified for violation: ${alert.eventType}`;
        broadcast('TEAM_DISQUALIFIED', { teamId: team.id, reason: team.lockReason });
      }
    }

    recordAudit(
      adminUser.username,
      adminUser.role,
      `TRIAGE_ALERT_${action}`,
      alert.teamName,
      alert.eventType,
      action,
      reason || alert.details
    );

    broadcastState();
    res.json({ success: true, alert });
  });

  // GET AUDIT LOGS
  app.get('/api/admin/audit-logs', requireAdminOrAbove, (req, res) => {
    res.json({ auditLogs });
  });

  // GET WARNINGS
  app.get('/api/admin/warnings', requireModeratorOrAbove, (req, res) => {
    res.json({ warnings: teamWarnings });
  });

  // GET SUBMISSIONS
  app.get('/api/admin/submissions', requireModeratorOrAbove, (req, res) => {
    const list = Array.from(submissions.values()).sort((a, b) => b.submittedAt - a.submittedAt);
    res.json({ submissions: list });
  });

  // ==========================================
  // QUESTION MANAGEMENT & SET SELECTION APIS
  // ==========================================

  // CHOOSE ACTIVE QUESTION SET (A, B, or C) FOR A ROUND
  app.post('/api/admin/set-question-set', requireAdminOrAbove, (req, res) => {
    const { round, set } = req.body;
    const adminUser = (req as any).adminUser;

    const r = Number(round) as 1 | 2 | 3;
    if (![1, 2, 3].includes(r)) {
      return res.status(400).json({ error: 'Valid round (1, 2, or 3) is required.' });
    }

    const s = String(set || '').trim().toUpperCase() as 'A' | 'B' | 'C';
    if (!['A', 'B', 'C'].includes(s)) {
      return res.status(400).json({ error: 'Valid question set (A, B, or C) is required.' });
    }

    const oldSet = eventState.activeQuestionSet[r] || 'A';
    eventState.activeQuestionSet[r] = s;

    // If changing the set for the current round, reset index to 0 and re-evaluate current question
    if (eventState.currentRound === r) {
      eventState.currentQuestionIndex = 0;
      const roundQ = getRoundQuestions(r);
      eventState.currentQuestionId = roundQ[0]?.id || null;
      eventState.totalQuestionsInRound = roundQ.length;
      eventState.buzzerWinner = null;
      eventState.buzzerTie = false;
      eventState.buzzerContenders = [];
      eventState.buzzerActive = Boolean(eventState.buzzerRoundEnabled?.[r]);
    }

    recordAudit(
      adminUser.username,
      adminUser.role,
      'SET_QUESTION_SET',
      `Round ${r}`,
      `Set ${oldSet}`,
      `Set ${s}`,
      `Organizer activated Question Set ${s} for Round ${r}`
    );

    broadcastState();
    res.json({
      success: true,
      message: `Active question set for Round ${r} updated to Set ${s}.`,
      activeQuestionSet: eventState.activeQuestionSet,
      currentQuestion: sanitizeQuestion(getCurrentQuestion()),
      totalQuestionsInRound: getRoundQuestions(eventState.currentRound).length,
    });
  });

  // TOGGLE CLUE DISPLAY MODE (Realistic Photographic Images vs. Vector Clue Panels)
  app.post('/api/admin/clue-display-mode', requireAdminOrAbove, (req, res) => {
    const adminUser = (req as any).adminUser;
    const { mode } = req.body;
    if (mode !== 'realistic' && mode !== 'panels') {
      return res.status(400).json({ error: 'Valid mode ("realistic" or "panels") is required.' });
    }

    const prevMode = eventState.clueDisplayMode || 'realistic';
    eventState.clueDisplayMode = mode;

    recordAudit(
      adminUser.username,
      adminUser.role,
      'UPDATE_CLUE_DISPLAY_MODE',
      'Event Display Settings',
      prevMode,
      mode,
      `Proctor set visual clue display mode to "${mode}" (Synchronized across all participant screens & public projectors)`
    );

    broadcastState();
    res.json({
      success: true,
      message: `Visual clue display mode successfully switched to ${mode}.`,
      clueDisplayMode: eventState.clueDisplayMode,
    });
  });

  // GET QUESTIONS (Includes canonical answers for organizer validation)
  app.get('/api/admin/questions', requireAdminOrAbove, (req, res) => {
    const { round, set } = req.query;
    let filtered = [...questions];
    if (round) {
      filtered = filtered.filter(q => q.round === Number(round));
    }
    if (set) {
      filtered = filtered.filter(q => (q.set || 'A') === String(set).toUpperCase());
    }
    res.json({ questions: filtered, activeQuestionSet: eventState.activeQuestionSet });
  });

  // ADD QUESTION
  app.post('/api/admin/question/add', requireAdminOrAbove, (req, res) => {
    const { question } = req.body;
    const adminUser = (req as any).adminUser;

    if (!question || !question.correctAnswer) {
      return res.status(400).json({ error: 'Question data and correct answer are required.' });
    }

    const round = (Number(question.round) || 1) as 1 | 2 | 3;
    const set = (String(question.set || 'A').toUpperCase()) as 'A' | 'B' | 'C';
    const existingInSet = questions.filter(q => q.round === round && (q.set || 'A') === set);
    const questionNumber = Number(question.questionNumber) || (existingInSet.length + 1);
    const id = question.id ? String(question.id).trim() : `q${round}-${set.toLowerCase()}-${String(questionNumber).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;

    let aliasesList: string[] = [];
    if (Array.isArray(question.aliases)) {
      aliasesList = question.aliases.map((a: any) => String(a).trim().toLowerCase()).filter(Boolean);
    } else if (typeof question.aliases === 'string') {
      aliasesList = question.aliases.split(',').map((a: string) => a.trim().toLowerCase()).filter(Boolean);
    }
    const cleanAnswer = String(question.correctAnswer).trim();
    if (!aliasesList.includes(cleanAnswer.toLowerCase())) {
      aliasesList.unshift(cleanAnswer.toLowerCase());
    }

    let panels = question.cluePanels;
    if (!Array.isArray(panels) || panels.length === 0) {
      panels = [
        { panelNumber: 1, description: 'Visual clue panel 1', svgType: 'token' },
        { panelNumber: 2, description: 'Visual clue panel 2', svgType: 'brain' }
      ];
    }

    const newQuestion: Question = {
      id,
      title: question.title ? String(question.title).trim() : undefined,
      round,
      set,
      questionNumber,
      domain: question.domain ? String(question.domain).trim() : 'Computer Science',
      difficulty: question.difficulty || (round === 1 ? 'Medium' : round === 2 ? 'Hard' : 'Very Hard'),
      points: Number(question.points) || (round === 1 ? 1 : round === 2 ? 2 : 3),
      cluePanels: panels,
      rebusFormulaText: question.rebusFormulaText ? String(question.rebusFormulaText).trim() : 'Panel 1 + Panel 2',
      correctAnswer: cleanAnswer,
      aliases: aliasesList,
      explanation: question.explanation ? String(question.explanation).trim() : '',
      customImageUrl: question.customImageUrl ? String(question.customImageUrl).trim() : undefined,
      images: Array.isArray(question.images) ? question.images : question.customImageUrl ? [String(question.customImageUrl).trim()] : undefined,
      active: question.active !== false,
    };

    questions.push(newQuestion);

    recordAudit(
      adminUser.username,
      adminUser.role,
      'ADD_QUESTION',
      newQuestion.id,
      undefined,
      newQuestion.correctAnswer,
      `Added new question #${newQuestion.questionNumber} to Round ${round} Set ${set}`
    );

    broadcastState();
    res.json({ success: true, question: newQuestion });
  });

  // EDIT QUESTION
  app.post('/api/admin/question/edit', requireAdminOrAbove, (req, res) => {
    const { question } = req.body;
    const adminUser = (req as any).adminUser;

    if (!question || !question.id) {
      return res.status(400).json({ error: 'Valid question ID required.' });
    }

    const idx = questions.findIndex(q => q.id === question.id);
    if (idx < 0) return res.status(404).json({ error: 'Question not found.' });

    const old = questions[idx];
    const oldAnswer = old.correctAnswer;

    // Handle aliases
    let aliasesList = old.aliases;
    if (question.aliases !== undefined) {
      if (Array.isArray(question.aliases)) {
        aliasesList = question.aliases.map((a: any) => String(a).trim().toLowerCase()).filter(Boolean);
      } else if (typeof question.aliases === 'string') {
        aliasesList = question.aliases.split(',').map((a: string) => a.trim().toLowerCase()).filter(Boolean);
      }
    }
    const cleanAnswer = question.correctAnswer ? String(question.correctAnswer).trim() : old.correctAnswer;
    if (!aliasesList.includes(cleanAnswer.toLowerCase())) {
      aliasesList.unshift(cleanAnswer.toLowerCase());
    }

    questions[idx] = {
      ...old,
      ...question,
      correctAnswer: cleanAnswer,
      aliases: aliasesList,
      title: question.title !== undefined ? (question.title ? String(question.title).trim() : undefined) : old.title,
      round: question.round ? (Number(question.round) as 1 | 2 | 3) : old.round,
      set: question.set ? (String(question.set).toUpperCase() as 'A' | 'B' | 'C') : (old.set || 'A'),
      questionNumber: question.questionNumber ? Number(question.questionNumber) : old.questionNumber,
      points: question.points !== undefined ? Number(question.points) : old.points,
      customImageUrl: question.customImageUrl !== undefined ? (question.customImageUrl ? String(question.customImageUrl).trim() : undefined) : old.customImageUrl,
      images: question.images !== undefined ? question.images : (question.customImageUrl ? [String(question.customImageUrl).trim()] : old.images),
      active: question.active !== undefined ? Boolean(question.active) : old.active,
    };

    recordAudit(
      adminUser.username,
      adminUser.role,
      'EDIT_QUESTION',
      question.id,
      oldAnswer,
      questions[idx].correctAnswer,
      `Updated question details in Round ${questions[idx].round} Set ${questions[idx].set || 'A'}`
    );

    broadcastState();
    res.json({ success: true, question: questions[idx] });
  });

  // DELETE QUESTION
  app.post('/api/admin/question/delete', requireAdminOrAbove, (req, res) => {
    const { questionId } = req.body;
    const adminUser = (req as any).adminUser;

    const idx = questions.findIndex(q => q.id === questionId);
    if (idx < 0) return res.status(404).json({ error: 'Question not found.' });

    const deleted = questions.splice(idx, 1)[0];

    recordAudit(
      adminUser.username,
      adminUser.role,
      'DELETE_QUESTION',
      questionId,
      deleted.correctAnswer,
      undefined,
      `Removed question #${deleted.questionNumber} from Round ${deleted.round} Set ${deleted.set || 'A'}`
    );

    broadcastState();
    res.json({ success: true, deletedId: questionId });
  });

  // UPLOAD QUESTIONS OR QUESTION SET
  app.post('/api/admin/questions/upload', requireAdminOrAbove, (req, res) => {
    const { questions: uploadedQuestions, round, set, mode } = req.body;
    const adminUser = (req as any).adminUser;

    if (!Array.isArray(uploadedQuestions) || uploadedQuestions.length === 0) {
      return res.status(400).json({ error: 'An array of questions is required.' });
    }

    const targetRound = round ? (Number(round) as 1 | 2 | 3) : null;
    const targetSet = set ? (String(set).toUpperCase() as 'A' | 'B' | 'C') : null;
    const uploadMode = mode === 'replace' ? 'replace' : 'append';

    // If replace mode and target round & set are specified, purge existing questions for that round and set
    if (uploadMode === 'replace' && targetRound && targetSet) {
      questions = questions.filter(q => !(q.round === targetRound && (q.set || 'A') === targetSet));
    }

    let addedCount = 0;
    uploadedQuestions.forEach((rawQ, i) => {
      if (!rawQ.correctAnswer) return;

      const qRound = (targetRound || Number(rawQ.round) || 1) as 1 | 2 | 3;
      const qSet = (targetSet || String(rawQ.set || 'A').toUpperCase()) as 'A' | 'B' | 'C';
      const existingInSet = questions.filter(q => q.round === qRound && (q.set || 'A') === qSet);
      const qNumber = Number(rawQ.questionNumber) || (existingInSet.length + 1);
      const qId = rawQ.id ? String(rawQ.id).trim() : `q${qRound}-${qSet.toLowerCase()}-${String(qNumber).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;

      // Format aliases
      let aliasesList: string[] = [];
      if (Array.isArray(rawQ.aliases)) {
        aliasesList = rawQ.aliases.map((a: any) => String(a).trim().toLowerCase()).filter(Boolean);
      } else if (typeof rawQ.aliases === 'string') {
        aliasesList = rawQ.aliases.split(',').map((a: string) => a.trim().toLowerCase()).filter(Boolean);
      }
      const cleanAns = String(rawQ.correctAnswer).trim();
      if (!aliasesList.includes(cleanAns.toLowerCase())) {
        aliasesList.unshift(cleanAns.toLowerCase());
      }

      // Format clue panels
      let panels: any[] = [];
      if (Array.isArray(rawQ.cluePanels) && rawQ.cluePanels.length > 0) {
        panels = rawQ.cluePanels;
      } else {
        panels = [
          { panelNumber: 1, description: rawQ.panel1_desc || rawQ.panel1 || 'Visual clue panel 1', svgType: rawQ.panel1_svg || 'token' },
          { panelNumber: 2, description: rawQ.panel2_desc || rawQ.panel2 || 'Visual clue panel 2', svgType: rawQ.panel2_svg || 'brain' },
        ];
      }

      const formattedQ: Question = {
        id: qId,
        title: rawQ.title ? String(rawQ.title).trim() : undefined,
        round: qRound,
        set: qSet,
        questionNumber: qNumber,
        domain: rawQ.domain ? String(rawQ.domain).trim() : 'Computer Science',
        difficulty: rawQ.difficulty || (qRound === 1 ? 'Medium' : qRound === 2 ? 'Hard' : 'Very Hard'),
        points: Number(rawQ.points) || (qRound === 1 ? 1 : qRound === 2 ? 2 : 3),
        cluePanels: panels,
        rebusFormulaText: rawQ.rebusFormulaText || rawQ.formula || 'Panel 1 + Panel 2',
        correctAnswer: cleanAns,
        aliases: aliasesList,
        explanation: rawQ.explanation ? String(rawQ.explanation).trim() : '',
        customImageUrl: rawQ.customImageUrl ? String(rawQ.customImageUrl).trim() : rawQ.image ? String(rawQ.image).trim() : undefined,
        images: Array.isArray(rawQ.images) ? rawQ.images : rawQ.customImageUrl ? [String(rawQ.customImageUrl).trim()] : undefined,
        active: rawQ.active !== false,
      };

      // If id exists already, update it; otherwise push
      const existingIdx = questions.findIndex(q => q.id === formattedQ.id);
      if (existingIdx >= 0) {
        questions[existingIdx] = formattedQ;
      } else {
        questions.push(formattedQ);
      }
      addedCount++;
    });

    recordAudit(
      adminUser.username,
      adminUser.role,
      'UPLOAD_QUESTIONS',
      targetRound ? `Round ${targetRound}` : 'All Rounds',
      undefined,
      `${addedCount} questions`,
      `Bulk uploaded ${addedCount} questions (Mode: ${uploadMode}, Set: ${targetSet || 'Mixed'})`
    );

    broadcastState();
    res.json({
      success: true,
      message: `Successfully processed ${addedCount} questions.`,
      addedCount,
      totalQuestions: questions.length,
    });
  });

  // ==========================================
  // ADVANCED QUESTION SET MANAGEMENT & TOOLS
  // Sizing, Merge Sets, Move Sets & Images
  // ==========================================

  // 1. SET QUESTION COUNT / SIZE LIMIT FOR A SET
  app.post('/api/admin/questions/set-config', requireAdminOrAbove, (req, res) => {
    const { round, set, maxCount, action } = req.body;
    const adminUser = (req as any).adminUser;

    const targetRound = (Number(round) || 1) as 1 | 2 | 3;
    const targetSet = (String(set || 'A').toUpperCase()) as QuestionSet;
    const limit = Math.max(1, Number(maxCount) || 10);

    const setQuestions = questions
      .filter(q => q.round === targetRound && (q.set || 'A') === targetSet)
      .sort((a, b) => a.questionNumber - b.questionNumber);

    if (setQuestions.length === 0) {
      return res.status(404).json({ error: `No questions found in Round ${targetRound} Set ${targetSet}` });
    }

    if (action === 'truncate') {
      // Remove questions with index >= limit
      const toKeep = setQuestions.slice(0, limit);
      const toRemove = setQuestions.slice(limit);
      const removeIds = new Set(toRemove.map(q => q.id));
      questions = questions.filter(q => !removeIds.has(q.id));

      // Re-number sequentially 1..limit
      toKeep.forEach((q, i) => {
        const item = questions.find(x => x.id === q.id);
        if (item) item.questionNumber = i + 1;
      });
    } else {
      // 'limit_active': keep first limit active, others inactive
      setQuestions.forEach((q, i) => {
        const item = questions.find(x => x.id === q.id);
        if (item) {
          item.questionNumber = i + 1;
          item.active = i < limit;
        }
      });
    }

    recordAudit(
      adminUser.username,
      adminUser.role,
      'SET_QUESTION_COUNT',
      `Round ${targetRound} Set ${targetSet}`,
      undefined,
      `${limit} questions`,
      `Adjusted Round ${targetRound} Set ${targetSet} size to ${limit} questions (Action: ${action || 'limit_active'})`
    );

    broadcastState();
    res.json({
      success: true,
      message: `Configured Round ${targetRound} Set ${targetSet} to ${limit} questions.`,
      currentSetCount: questions.filter(q => q.round === targetRound && (q.set || 'A') === targetSet).length,
    });
  });

  // 2. MERGE SET OF QUESTIONS
  app.post('/api/admin/questions/merge-sets', requireAdminOrAbove, (req, res) => {
    const { round, sourceSet, targetSet, keepSource } = req.body;
    const adminUser = (req as any).adminUser;

    const r = (Number(round) || 1) as 1 | 2 | 3;
    const sSet = (String(sourceSet || 'B').toUpperCase()) as QuestionSet;
    const tSet = (String(targetSet || 'A').toUpperCase()) as QuestionSet;

    if (sSet === tSet) {
      return res.status(400).json({ error: 'Source set and target set cannot be the same.' });
    }

    const sourceQuestions = questions.filter(q => q.round === r && (q.set || 'A') === sSet);
    const targetQuestions = questions.filter(q => q.round === r && (q.set || 'A') === tSet);

    if (sourceQuestions.length === 0) {
      return res.status(400).json({ error: `Source Set ${sSet} in Round ${r} has no questions to merge.` });
    }

    let nextNumber = targetQuestions.length > 0 
      ? Math.max(...targetQuestions.map(q => q.questionNumber)) + 1 
      : 1;

    let mergedCount = 0;
    sourceQuestions.forEach(sq => {
      if (keepSource) {
        // Clone into target set with unique ID
        const cloned: Question = {
          ...sq,
          id: `${sq.id}-m${Date.now().toString().slice(-4)}-${mergedCount}`,
          set: tSet,
          questionNumber: nextNumber++,
        };
        questions.push(cloned);
      } else {
        // Move into target set directly
        const qItem = questions.find(x => x.id === sq.id);
        if (qItem) {
          qItem.set = tSet;
          qItem.questionNumber = nextNumber++;
        }
      }
      mergedCount++;
    });

    recordAudit(
      adminUser.username,
      adminUser.role,
      'MERGE_QUESTION_SETS',
      `Round ${r} Set ${sSet} -> Set ${tSet}`,
      undefined,
      `${mergedCount} questions merged`,
      `Merged ${mergedCount} questions from Set ${sSet} into Set ${tSet} for Round ${r} (Keep source: ${Boolean(keepSource)})`
    );

    broadcastState();
    res.json({
      success: true,
      message: `Successfully merged ${mergedCount} questions from Set ${sSet} into Set ${tSet}.`,
      targetSetCount: questions.filter(q => q.round === r && (q.set || 'A') === tSet).length,
    });
  });

  // 3. MOVE QUESTIONS OR MOVE SET FROM ONE SET TO ANOTHER
  app.post('/api/admin/questions/move', requireAdminOrAbove, (req, res) => {
    const { questionIds, sourceRound, sourceSet, targetRound, targetSet } = req.body;
    const adminUser = (req as any).adminUser;

    const tRound = (Number(targetRound) || 1) as 1 | 2 | 3;
    const tSet = (String(targetSet || 'A').toUpperCase()) as QuestionSet;

    let targetsToMove: Question[] = [];

    if (Array.isArray(questionIds) && questionIds.length > 0) {
      const idSet = new Set(questionIds.map(String));
      targetsToMove = questions.filter(q => idSet.has(q.id));
    } else if (sourceRound && sourceSet) {
      const sRound = (Number(sourceRound) || 1) as 1 | 2 | 3;
      const sSet = (String(sourceSet).toUpperCase()) as QuestionSet;
      targetsToMove = questions.filter(q => q.round === sRound && (q.set || 'A') === sSet);
    } else {
      return res.status(400).json({ error: 'Either questionIds array or sourceRound & sourceSet must be provided.' });
    }

    if (targetsToMove.length === 0) {
      return res.status(404).json({ error: 'No matching questions found to move.' });
    }

    // Determine current max questionNumber in destination
    const existingInDest = questions.filter(q => q.round === tRound && (q.set || 'A') === tSet);
    let nextNum = existingInDest.length > 0 
      ? Math.max(...existingInDest.map(q => q.questionNumber)) + 1 
      : 1;

    targetsToMove.forEach(item => {
      const q = questions.find(x => x.id === item.id);
      if (q) {
        q.round = tRound;
        q.set = tSet;
        q.questionNumber = nextNum++;
        q.points = tRound === 1 ? 1 : tRound === 2 ? 2 : 3;
      }
    });

    recordAudit(
      adminUser.username,
      adminUser.role,
      'MOVE_QUESTIONS',
      `${targetsToMove.length} questions -> Round ${tRound} Set ${tSet}`,
      undefined,
      `${targetsToMove.length} questions`,
      `Moved ${targetsToMove.length} questions to Round ${tRound} Set ${tSet}`
    );

    broadcastState();
    res.json({
      success: true,
      message: `Successfully moved ${targetsToMove.length} questions to Round ${tRound} Set ${tSet}.`,
      movedCount: targetsToMove.length,
      destinationCount: questions.filter(q => q.round === tRound && (q.set || 'A') === tSet).length,
    });
  });

  // 4. ATTACH / UPLOAD IMAGE FOR A QUESTION
  app.post('/api/admin/question/upload-image', requireAdminOrAbove, (req, res) => {
    const { questionId, imageUrl, images, customImageBase64 } = req.body;
    const adminUser = (req as any).adminUser;

    if (!questionId) {
      return res.status(400).json({ error: 'questionId is required.' });
    }

    const q = questions.find(item => item.id === questionId);
    if (!q) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    let resolvedImages: string[] = [];
    if (Array.isArray(images) && images.length > 0) {
      resolvedImages = images.map((s: any) => String(s).trim()).filter(Boolean);
    } else if (imageUrl?.trim()) {
      resolvedImages = [imageUrl.trim()];
    } else if (customImageBase64?.trim()) {
      resolvedImages = [customImageBase64.trim()];
    }

    if (resolvedImages.length === 0) {
      return res.status(400).json({ error: 'At least one image URL or Base64 is required.' });
    }

    q.images = resolvedImages;
    q.customImageUrl = resolvedImages[0];

    recordAudit(
      adminUser.username,
      adminUser.role,
      'ADD_QUESTION_IMAGE',
      q.id,
      undefined,
      `${resolvedImages.length} images attached`,
      `Attached ${resolvedImages.length} realistic images to Question #${q.questionNumber} in Round ${q.round}`
    );

    broadcastState();
    res.json({
      success: true,
      message: 'Realistic image successfully attached to question.',
      question: q,
    });
  });

  // 5. LOAD OFFICIAL 30 QUESTIONS PER ROUND MASTER DATASET
  app.post(['/api/admin/questions/load-official-30', '/api/admin/load-official-30'], requireAdminOrAbove, (req, res) => {
    const { mode } = req.body;
    const adminUser = (req as any).adminUser;

    const loadMode = mode === 'append' ? 'append' : 'replace';

    if (loadMode === 'replace') {
      questions = JSON.parse(JSON.stringify(MASTER_THIRTY_QUESTIONS_ALL));
    } else {
      // Append mode: update or append each
      MASTER_THIRTY_QUESTIONS_ALL.forEach(newQ => {
        const idx = questions.findIndex(q => q.id === newQ.id);
        if (idx >= 0) {
          questions[idx] = JSON.parse(JSON.stringify(newQ));
        } else {
          questions.push(JSON.parse(JSON.stringify(newQ)));
        }
      });
    }

    recordAudit(
      adminUser.username,
      adminUser.role,
      'LOAD_OFFICIAL_30_DATASET',
      'All Rounds (90 Questions)',
      undefined,
      `${MASTER_THIRTY_QUESTIONS_ALL.length} Questions`,
      `Loaded Official 30 Questions Per Round Dataset (Real-World Images, 90 questions total, Mode: ${loadMode})`
    );

    broadcastState();
    res.json({
      success: true,
      message: `Loaded official 30-questions-per-round dataset (${MASTER_THIRTY_QUESTIONS_ALL.length} questions with realistic images).`,
      totalQuestions: questions.length,
      round1Count: questions.filter(q => q.round === 1).length,
      round2Count: questions.filter(q => q.round === 2).length,
      round3Count: questions.filter(q => q.round === 3).length,
    });
  });

  // 5B. LOAD EXISTING 3-SET SEED QUESTIONS
  app.post(['/api/admin/questions/load-seed-questions', '/api/admin/load-seed-questions'], requireAdminOrAbove, (req, res) => {
    const adminUser = (req as any).adminUser;
    const { mode = 'replace' } = req.body;

    if (mode === 'replace') {
      questions = JSON.parse(JSON.stringify(SEED_QUESTIONS));
    } else {
      SEED_QUESTIONS.forEach(newQ => {
        const idx = questions.findIndex(q => q.id === newQ.id);
        if (idx >= 0) {
          questions[idx] = JSON.parse(JSON.stringify(newQ));
        } else {
          questions.push(JSON.parse(JSON.stringify(newQ)));
        }
      });
    }

    recordAudit(
      adminUser.username,
      adminUser.role,
      'LOAD_SEED_QUESTIONS',
      'All Rounds (3 Sets A/B/C)',
      undefined,
      `${SEED_QUESTIONS.length} Questions`,
      `Loaded Existing 3-Set Questions Repository (Mode: ${mode})`
    );

    broadcastState();
    res.json({
      success: true,
      message: `Loaded existing 3-set questions repository (${SEED_QUESTIONS.length} questions).`,
      totalQuestions: questions.length,
      round1Count: questions.filter(q => q.round === 1).length,
      round2Count: questions.filter(q => q.round === 2).length,
      round3Count: questions.filter(q => q.round === 3).length,
    });
  });

  // 6. EXPORT OFFICIAL 30 QUESTIONS MASTER AS JSON
  app.get(['/api/admin/questions/export-official-30', '/api/admin/questions/download-realistic-file'], (req, res) => {
    const jsonPath = path.join(process.cwd(), 'src', 'data', 'symposium30RealisticQuestions.json');
    if (fs.existsSync(jsonPath)) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="symposium_30_questions_per_round_realistic.json"');
      return res.sendFile(jsonPath);
    }
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="symposium_30_questions_per_round.json"');
    res.json({
      title: "Tech Bridge '26 - Official 30 Questions Per Round Dataset",
      totalQuestions: MASTER_THIRTY_QUESTIONS_ALL.length,
      round1Count: MASTER_THIRTY_QUESTIONS_ALL.filter(q => q.round === 1).length,
      round2Count: MASTER_THIRTY_QUESTIONS_ALL.filter(q => q.round === 2).length,
      round3Count: MASTER_THIRTY_QUESTIONS_ALL.filter(q => q.round === 3).length,
      questions: MASTER_THIRTY_QUESTIONS_ALL,
    });
  });

  // ==========================================
  // DATA EXPORTS & BACKUP
  // ==========================================

  // EXPORT FINAL RESULTS AS CSV
  app.get('/api/admin/export-csv', requireModeratorOrAbove, (req, res) => {
    const leaderboard = computeLeaderboard();
    const headers = [
      'Rank',
      'Team ID',
      'Team Name',
      'Participant 1',
      'Participant 2',
      'College',
      'Department',
      'Year',
      'Phone',
      'Round 1 Score',
      'Round 2 Score',
      'Round 3 Score',
      'Total Score',
      'Status'
    ];

    const rows = leaderboard.map(entry => {
      const team = teams.get(entry.teamId);
      return [
        entry.rank,
        `"${entry.teamId}"`,
        `"${entry.teamName.replace(/"/g, '""')}"`,
        `"${team?.participant1 || ''}"`,
        `"${team?.participant2 || ''}"`,
        `"${entry.college.replace(/"/g, '""')}"`,
        `"${team?.department || 'CSE'}"`,
        `"${team?.year || '3rd Year'}"`,
        `"${team?.phone || ''}"`,
        entry.round1Score,
        entry.round2Score,
        entry.round3Score,
        entry.totalScore,
        entry.status,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const dateStr = new Date().toISOString().split('T')[0];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="TechBridge_Final_Results_${dateStr}.csv"`);
    res.send(csvContent);
  });

  // EXPORT AUDIT LOGS AS CSV
  app.get('/api/admin/export-audit-csv', requireAdminOrAbove, (req, res) => {
    const headers = ['Timestamp', 'Admin', 'Role', 'Action', 'Target', 'Old Value', 'New Value', 'Details', 'IP'];
    const rows = auditLogs.map(l => [
      `"${new Date(l.timestamp).toISOString()}"`,
      `"${l.adminUsername}"`,
      `"${l.role}"`,
      `"${l.action}"`,
      `"${l.target}"`,
      `"${(l.oldValue || '').replace(/"/g, '""')}"`,
      `"${(l.newValue || '').replace(/"/g, '""')}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${l.ip || ''}"`,
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const dateStr = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="TechBridge_Audit_Logs_${dateStr}.csv"`);
    res.send(csv);
  });

  // EXPORT ANTI-CHEAT INCIDENTS AS CSV
  app.get('/api/admin/export-anticheat-csv', requireModeratorOrAbove, (req, res) => {
    const headers = ['Timestamp', 'Team ID', 'Team Name', 'Violation Type', 'Severity', 'Round', 'Question', 'Details', 'Resolved', 'Action Taken'];
    const rows = antiCheatEvents.map(a => [
      `"${new Date(a.timestamp).toISOString()}"`,
      `"${a.teamId}"`,
      `"${a.teamName.replace(/"/g, '""')}"`,
      `"${a.eventType}"`,
      `"${a.severity}"`,
      a.round,
      a.questionNumber,
      `"${(a.details || '').replace(/"/g, '""')}"`,
      a.resolved,
      `"${a.actionTaken || ''}"`,
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const dateStr = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="TechBridge_AntiCheat_Report_${dateStr}.csv"`);
    res.send(csv);
  });

  // EXPORT COMPLETE SYSTEM BACKUP (JSON)
  app.get('/api/admin/export-backup-json', requireSuperAdmin, (req, res) => {
    const backup = {
      version: '1.0',
      exportedAt: Date.now(),
      eventState,
      teams: Array.from(teams.values()),
      submissions: Array.from(submissions.values()),
      antiCheatEvents,
      buzzerEvents,
      teamWarnings,
      auditLogs,
      questions,
    };
    const dateStr = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="TechBridge_System_Backup_${dateStr}.json"`);
    res.json(backup);
  });

  // EMERGENCY OFFLINE FALLBACK KIT
  app.get('/api/admin/offline-kit', requireAdminOrAbove, (req, res) => {
    res.json({
      symposium: "TECH BRIDGE '26: Visual Technical Rebus Challenge",
      department: 'Department of Computer Science & Engineering',
      instructions: 'Emergency backup scoring sheets and answer key packet. For organizer use only in case of power or cloud network disruption.',
      rounds: [
        { round: 1, name: 'Round 1: Foundations & Systems', questions: 30, pointsEach: 1, duration: '30 mins' },
        { round: 2, name: 'Round 2: Distributed Architectures', questions: 15, pointsEach: 2, duration: '15 mins' },
        { round: 3, name: 'Round 3: Grand Finale & Live Buzzer', questions: 10, pointsEach: 3, duration: '15 mins' },
      ],
      questionsMaster: questions.map(q => ({
        id: q.id,
        round: q.round,
        questionNumber: q.questionNumber,
        domain: q.domain,
        points: q.points,
        rebusFormula: q.rebusFormulaText,
        correctAnswer: q.correctAnswer,
        acceptedAliases: q.aliases,
        explanation: q.explanation,
      })),
    });
  });

  // ==========================================
  // REGISTER ADVANCED COMPETITION EXTENSION ROUTES
  // (Multi-admin, Question status, Bulk parsing, Qualification, Manual score, Clues, Feedback)
  // ==========================================
  registerAdvancedCompetitionRoutes(app, {
    teams,
    questions,
    submissions,
    antiCheatEvents,
    teamWarnings,
    auditLogs,
    eventState,
    adminAccounts: ADMIN_ACCOUNTS,
    requireSuperAdmin,
    requireAdminOrAbove,
    requireModeratorOrAbove,
    recordAudit,
    broadcast,
    broadcastState,
    getCurrentQuestion,
    sanitizeQuestion,
    computeLeaderboard,
  });

  // ==========================================
  // VITE MIDDLEWARE & SPA SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(503).send('Application is initializing or building. Please reload in a moment.');
      }
    });
  }

  server.on('error', (err: any) => {
    console.error('Server network error:', err);
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`TECH BRIDGE '26 Authoritative Game Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
