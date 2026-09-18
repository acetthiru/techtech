/**
 * TECH BRIDGE '26 - Comprehensive Type Definitions
 * Visual Technical Rebus Challenge (CSE Department Technical Symposium)
 */

export type EventStatus = 'WAITING' | 'RUNNING' | 'PAUSED' | 'COMPLETED';

export type RoundNumber = 1 | 2 | 3;

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'REPORT_MANAGER' | 'DISPLAY_ONLY';

export type TeamStatus = 'ACTIVE' | 'WARNED' | 'LOCKED' | 'DISQUALIFIED';

export type QuestionStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED' | 'DELETED';

export interface Participant {
  name: string;
}

export interface QuestionClue {
  id: string;
  text: string;
  order: number;
  enabledForAll?: boolean;
  enabledTeamIds?: string[];
}

export interface Team {
  id: string; // Unique Team ID, e.g. "TB-8041"
  name: string;
  participant1: string;
  participant2?: string;
  college: string;
  department: string;
  year: string;
  phone: string;
  registeredAt: number;
  status: TeamStatus;
  lockReason?: string;
  warningsCount: number;
  round1Score: number;
  round2Score: number;
  round3Score: number;
  totalScore: number;
  lastActive: number;
  isOnline?: boolean;
  currentQuestionId?: string; // Team-specific authoritative question override
  assignedSet?: QuestionSet;
  isQualified?: boolean;
  qualificationRound?: number;
  manualScoreAdjustment?: number;
  enabledClues?: string[]; // Clue IDs unlocked specifically for this team
}

export interface RebusCluePanel {
  panelNumber: number;
  description: string; // Meaningful clue description for visual panel
  svgType: 'brain' | 'leak' | 'plates' | 'overflow' | 'road_deadlock' | 'docker_whale' | 'garbage' | 'tree' | 'scale' | 'zero_day' | 'lock_key' | 'network_packet' | 'firewall' | 'cloud' | 'cookie' | 'race_flag' | 'thread' | 'git_branch' | 'bus' | 'pipeline' | 'cache' | 'matrix' | 'hash_table' | 'token' | 'handshake' | 'daemon' | 'semaphore' | 'quantum' | 'neural' | 'sql_inject' | 'cpu' | 'wire_circuit' | 'lightning' | 'brush' | 'wrench_tool' | 'search_glass' | 'water_bucket' | 'balance' | 'shield_check' | 'clock' | 'cube_grid' | 'gear_spin' | 'umbrella' | 'traffic_light' | string;
  subText?: string;
}

export type QuestionSet = 'A' | 'B' | 'C';

export interface Question {
  id: string; // e.g. "q001"
  title?: string;
  round: RoundNumber;
  set?: QuestionSet; // Question Set: 'A' | 'B' | 'C' (defaults to 'A')
  questionNumber: number;
  domain: string; // e.g. "Operating Systems", "Networking", "DBMS", "Algorithms"
  difficulty: 'Medium' | 'Hard' | 'Very Hard';
  points: number; // 1 for R1, 2 for R2, 3 for R3
  negativeMarks?: number;
  bonusMarks?: number;
  cluePanels: RebusCluePanel[];
  rebusFormulaText: string; // e.g. "Panel 1 + Panel 2"
  correctAnswer: string; // AUTHORITATIVE: NEVER sent to participant client!
  aliases: string[]; // Variations accepted
  explanation: string;
  active: boolean;
  status?: QuestionStatus;
  caseSensitive?: boolean;
  normalizeSpaces?: boolean;
  normalizeSpecialChars?: boolean;
  clues?: QuestionClue[];
  images?: string[];
  customImageUrl?: string;
  diagramUrl?: string;
  allowRetries?: boolean;
  usedInCompletedRound?: boolean;
}

export interface ManualScoreAdjustment {
  id: string;
  teamId: string;
  teamName: string;
  adminUsername: string;
  round: RoundNumber;
  oldScore: number;
  newScore: number;
  adjustment: number;
  reason: string;
  timestamp: number;
}

export interface EventFeedback {
  id: string;
  teamId: string;
  teamName: string;
  overallRating: number; // 1 to 5
  questionQuality: number; // 1 to 5
  difficulty: number; // 1 to 5
  userExperience: number; // 1 to 5
  eventOrganization: number; // 1 to 5
  comments?: string;
  timestamp: number;
}

export interface ImportReviewItem {
  id: string;
  questionNumber: number;
  title: string;
  round: RoundNumber;
  set: QuestionSet;
  domain: string;
  difficulty: 'Medium' | 'Hard' | 'Very Hard';
  points: number;
  correctAnswer: string;
  aliases: string[];
  explanation: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  detectedFrom?: string;
  cluePanels?: RebusCluePanel[];
  rebusFormulaText?: string;
  notes?: string;
}

// Client-safe version of Question (strictly hides correctAnswer and aliases)
export type PublicQuestion = Omit<Question, 'correctAnswer' | 'aliases' | 'explanation'>;

export interface Submission {
  id: string;
  teamId: string;
  teamName: string;
  questionId: string;
  round: RoundNumber;
  questionNumber: number;
  submittedAnswer: string;
  isCorrect: boolean;
  pointsAwarded: number;
  submittedAt: number;
}

export interface BuzzerEvent {
  id: string;
  sequenceNumber: number;
  questionId: string;
  round: RoundNumber;
  teamId: string;
  teamName: string;
  serverTimestamp: number;
  won: boolean;
  pointsAwarded: number;
}

export type AntiCheatEventType = 
  | 'APP_BACKGROUND'
  | 'WINDOW_FOCUS_LOST'
  | 'MULTI_WINDOW_DETECTED'
  | 'SCREEN_RECORD_DETECTED'
  | 'DEV_TOOLS_DETECTED'
  | 'PICTURE_IN_PICTURE'
  | 'SUSPICIOUS_TYPING'
  | 'OVERLAY_DETECTED';

export type AntiCheatSeverity = 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';

export interface AntiCheatEvent {
  id: string;
  teamId: string;
  teamName: string;
  eventType: AntiCheatEventType;
  details: string;
  severity: AntiCheatSeverity;
  round: number;
  questionNumber: number;
  timestamp: number;
  resolved: boolean;
  actionTaken?: 'WARNED' | 'LOCKED' | 'DISQUALIFIED' | 'DISMISSED';
  resolvedBy?: string;
  resolvedAt?: number;
}

export interface TeamWarning {
  id: string;
  teamId: string;
  teamName: string;
  violationType: string;
  warningMessage: string;
  issuedBy: string;
  timestamp: number;
  severity: AntiCheatSeverity;
}

export interface AuditLogEntry {
  id: string;
  adminUsername: string;
  role: AdminRole;
  action: string;
  target: string;
  oldValue?: string;
  newValue?: string;
  details?: string;
  timestamp: number;
  ip?: string;
}

export interface EventState {
  status: EventStatus;
  currentRound: RoundNumber;
  currentQuestionIndex: number;
  totalQuestionsInRound: number;
  roundDurationSeconds: number; // 1800 (30m) for R1, 900 (15m) for R2, 900 (15m) for R3
  roundStartedAt: number | null;
  roundEndsAt: number | null;
  isPaused: boolean;
  pausedRemainingSeconds: number;
  showLeaderboard: boolean;
  eventLocked: boolean;
  roundLocked: Record<RoundNumber, boolean>;
  activeQuestionSet: Record<RoundNumber, QuestionSet>;
  isTestMode: boolean;
  buzzerActive: boolean;
  buzzerSequence: number;
  buzzerWinner: {
    teamId: string;
    teamName: string;
    timestamp: number;
    sequenceNumber: number;
    deltaMs?: number;
    isTie?: boolean;
  } | null;
  buzzerTie?: boolean;
  buzzerContenders?: BuzzerContender[];
  buzzerRoundEnabled?: Record<RoundNumber, boolean>;
  currentQuestionId: string | null;
  serverTime: number;
  feedbackActive?: boolean;
  activeCluesByQuestion?: Record<string, { allTeams: boolean; teamIds: string[] }>;
  qualificationThresholds?: Record<number, number>;
  teamQuestionOverrides?: Record<string, string>;
  clueDisplayMode?: 'realistic' | 'panels';
  stats: {
    totalTeams: number;
    onlineTeams: number;
    lockedTeams: number;
    disqualifiedTeams: number;
    activeWarnings: number;
    totalSubmissions: number;
  };
}

export interface BuzzerContender {
  teamId: string;
  teamName: string;
  timestamp: number;
  sequenceNumber: number;
  deltaMs: number;
  isTie: boolean;
}

export interface CertificateConfig {
  symposiumName: string;
  eventTitle: string;
  department: string;
  institution: string;
  date: string;
  signatory1: { title: string; name: string; designation: string };
  signatory2: { title: string; name: string; designation: string };
  signatory3: { title: string; name: string; designation: string };
  templateTheme: 'CYBER_TECH' | 'GOLD_ACADEMIC' | 'PREMIUM_DARK';
  customLogoUrl?: string;
  customSealText: string;
  sampleUploadedImage?: string | null;
  sampleUploadedFileName?: string | null;
  enabledForCompleted: boolean;
}

export interface TeamCertificateData {
  certificateId: string;
  teamId: string;
  teamName: string;
  participant1: string;
  participant2: string;
  college: string;
  department: string;
  year?: string;
  rank: number;
  totalScore: number;
  round1Score: number;
  round2Score: number;
  round3Score: number;
  awardCategory: 'FIRST_PLACE' | 'SECOND_PLACE' | 'THIRD_PLACE' | 'DISTINCTION' | 'MERIT_PARTICIPATION';
  issuedAt: number;
  verificationHash: string;
  config: CertificateConfig;
}

export interface LeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  college: string;
  round1Score: number;
  round2Score: number;
  round3Score: number;
  totalScore: number;
  status: TeamStatus;
  submissionCount: number;
  lastActive: number;
}

export interface AdminUser {
  username: string;
  role: AdminRole;
  token: string;
  expiresAt: number;
}
