import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock,
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Eye, 
  EyeOff, 
  Radio, 
  AlertTriangle, 
  Users, 
  Trophy, 
  BookOpen, 
  Download, 
  Plus, 
  Check, 
  X, 
  Clock, 
  Award,
  Search,
  FileSpreadsheet,
  ShieldAlert,
  History,
  Trash2,
  Edit3,
  Sliders,
  CheckCircle2,
  XCircle,
  Activity,
  LogOut,
  RefreshCw,
  FileText,
  UserPlus,
  Upload,
  Layers,
  Filter,
  Copy,
  Target,
  MessageSquare,
  BarChart2,
  Lightbulb,
  Image as ImageIcon
} from 'lucide-react';
import { 
  EventState, 
  Team, 
  Question, 
  Submission, 
  AntiCheatEvent, 
  LeaderboardEntry,
  AuditLogEntry,
  TeamWarning,
  AdminRole,
  AntiCheatSeverity,
  QuestionSet,
  RoundNumber
} from '../types';
import { RebusClueRenderer } from './RebusClueRenderer';
import { EmergencyOfflineModal } from './EmergencyOfflineModal';
import { QuestionManager } from './QuestionManager';
import { AdminCertificateManager } from './AdminCertificateManager';
import { AnsweredMonitoringPanel } from './admin/AnsweredMonitoringPanel';
import { TeamQuestionControlPanel } from './admin/TeamQuestionControlPanel';
import { DynamicClueControlPanel } from './admin/DynamicClueControlPanel';
import { ManualScoreAdjustmentPanel } from './admin/ManualScoreAdjustmentPanel';
import { QualificationPanel } from './admin/QualificationPanel';
import { BulkQuestionImportPanel } from './admin/BulkQuestionImportPanel';
import { MultipleAdminManagementPanel } from './admin/MultipleAdminManagementPanel';
import { EventReportsPanel } from './admin/EventReportsPanel';
import { FeedbackResultsPanel } from './admin/FeedbackResultsPanel';

interface AdminDashboardProps {
  eventState: EventState | null;
  remainingSeconds: number;
  onRefreshState: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  eventState,
  remainingSeconds,
  onRefreshState,
}) => {
  // Admin Session State
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return sessionStorage.getItem('techbridge_admin_token') || null;
  });
  const [adminRole, setAdminRole] = useState<AdminRole>(() => {
    return (sessionStorage.getItem('techbridge_admin_role') as AdminRole) || 'SUPER_ADMIN';
  });
  const [adminUsername, setAdminUsername] = useState<string>(() => {
    return sessionStorage.getItem('techbridge_admin_username') || 'ACETTHIRU';
  });

  // Login Form States (NO credentials hardcoded in placeholders or default values)
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Active Admin Sub-View (Full Section Reorganization)
  const [activeTab, setActiveTab] = useState<
    | 'control'
    | 'teams'
    | 'monitoring'
    | 'questions'
    | 'bulk_import'
    | 'team_questions'
    | 'clues'
    | 'score_adjust'
    | 'qualification'
    | 'anticheat'
    | 'leaderboard'
    | 'reports'
    | 'feedback'
    | 'admins'
    | 'certificates'
    | 'audit'
    | 'offline'
  >('control');

  // Loaded Data States
  const [teamsList, setTeamsList] = useState<Team[]>([]);
  const [submissionsList, setSubmissionsList] = useState<Submission[]>([]);
  const [antiCheatList, setAntiCheatList] = useState<AntiCheatEvent[]>([]);
  const [auditLogsList, setAuditLogsList] = useState<AuditLogEntry[]>([]);
  const [warningsList, setWarningsList] = useState<TeamWarning[]>([]);
  const [questionsList, setQuestionsList] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | AntiCheatSeverity>('ALL');

  // Control Modals
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [controlMessage, setControlMessage] = useState<string | null>(null);

  // Team Edit Modal
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  // Add Team Modal
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [newTeamForm, setNewTeamForm] = useState({
    id: '',
    name: '',
    participant1: '',
    participant2: '',
    college: 'Autonomous College of Engineering & Technology',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    phone: '',
  });
  const [addTeamLoading, setAddTeamLoading] = useState(false);
  const [addTeamError, setAddTeamError] = useState<string | null>(null);

  // Remove Team Modal
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [removeTeamLoading, setRemoveTeamLoading] = useState(false);

  // Question Edit / Add Modal
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null);

  // Logout Handler
  const handleLogout = () => {
    setAdminToken(null);
    sessionStorage.removeItem('techbridge_admin_token');
    sessionStorage.removeItem('techbridge_admin_role');
    sessionStorage.removeItem('techbridge_admin_username');
  };

  // Safe fetch helper for admin background polling
  const safeFetchAdmin = async (url: string, token: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.status === 401) {
        return { status: 401, ok: false, data: null };
      }
      if (!res.ok) {
        return { status: res.status, ok: false, data: null };
      }
      const data = await res.json();
      return { status: 200, ok: true, data };
    } catch {
      // Quietly return fallback on network interruptions or dev server reload
      return { status: 0, ok: false, data: null };
    }
  };

  // Fetch admin protected data
  const fetchAdminData = async () => {
    if (!adminToken) return;

    try {
      const [teamsRes, subsRes, acRes, qRes, auditRes, warnRes] = await Promise.all([
        safeFetchAdmin('/api/admin/teams', adminToken),
        safeFetchAdmin('/api/admin/submissions', adminToken),
        safeFetchAdmin('/api/admin/anti-cheat', adminToken),
        safeFetchAdmin('/api/admin/questions', adminToken),
        safeFetchAdmin('/api/admin/audit-logs', adminToken),
        safeFetchAdmin('/api/admin/warnings', adminToken),
      ]);

      // If token expired or was invalidated on the server, cleanly logout
      if (
        teamsRes.status === 401 ||
        subsRes.status === 401 ||
        acRes.status === 401 ||
        qRes.status === 401 ||
        auditRes.status === 401 ||
        warnRes.status === 401
      ) {
        handleLogout();
        setLoginError('Admin session expired or invalidated. Please sign in again.');
        return;
      }

      if (teamsRes.ok && teamsRes.data) {
        setTeamsList(teamsRes.data.teams || []);
      }
      if (subsRes.ok && subsRes.data) {
        setSubmissionsList(subsRes.data.submissions || []);
      }
      if (acRes.ok && acRes.data) {
        setAntiCheatList(acRes.data.events || []);
      }
      if (qRes.ok && qRes.data) {
        setQuestionsList(qRes.data.questions || []);
      }
      if (auditRes.ok && auditRes.data) {
        setAuditLogsList(auditRes.data.auditLogs || []);
      }
      if (warnRes.ok && warnRes.data) {
        setWarningsList(warnRes.data.warnings || []);
      }
    } catch {
      // Polling network blips handled smoothly
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchAdminData();
      const interval = setInterval(fetchAdminData, 5000);
      return () => clearInterval(interval);
    }
  }, [adminToken]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Authentication failed. Verify credentials.');
        setLoginLoading(false);
        return;
      }

      setAdminToken(data.token);
      setAdminRole(data.role);
      setAdminUsername(data.username);
      sessionStorage.setItem('techbridge_admin_token', data.token);
      sessionStorage.setItem('techbridge_admin_role', data.role);
      sessionStorage.setItem('techbridge_admin_username', data.username);
      setLoginLoading(false);
      onRefreshState();
    } catch (err) {
      setLoginError('Unable to connect to authentication gateway.');
      setLoginLoading(false);
    }
  };

  // Generic Admin Control Command
  const sendControl = async (endpoint: string, body: any = {}) => {
    if (!adminToken) return;
    setControlMessage(null);
    try {
      const res = await fetch(`/api/admin/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(body),
      });

      if (res.status === 401) {
        handleLogout();
        setLoginError('Admin session expired or invalidated. Please sign in again.');
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setControlMessage(data.error || 'Command failed');
      } else {
        setControlMessage(data.message || 'Command executed successfully');
        onRefreshState();
        fetchAdminData();
      }
      setTimeout(() => setControlMessage(null), 3500);
    } catch {
      setControlMessage('Network error communicating with command desk');
      setTimeout(() => setControlMessage(null), 3500);
    }
  };

  // Anti-Cheat Action Handler
  const handleAntiCheatAction = async (eventId: string, action: 'WARN' | 'LOCK' | 'LOCKED' | 'DISQUALIFY' | 'DISQUALIFIED' | 'DISMISSED', reason?: string) => {
    await sendControl('anti-cheat/action', { eventId, action, reason });
  };

  // Team Action Handler
  const handleTeamAction = async (teamId: string, action: 'LOCK' | 'UNLOCK' | 'WARN' | 'DISQUALIFY' | 'RESTORE', reason?: string) => {
    if (action === 'LOCK') {
      await sendControl('team/lock', { teamId, reason: reason || 'Organizer security lock' });
    } else if (action === 'UNLOCK') {
      await sendControl('team/unlock', { teamId });
    } else if (action === 'WARN') {
      await sendControl('team/warn', { teamId, message: reason || 'Symposium warning issued by organizer' });
    } else if (action === 'DISQUALIFY') {
      await sendControl('team/disqualify', { teamId, reason: reason || 'Disqualified by organizer' });
    } else if (action === 'RESTORE') {
      await sendControl('team/restore', { teamId });
    }
  };

  // Team Edit Save
  const handleSaveTeamEdit = async () => {
    if (!editingTeam) return;
    await sendControl('team/edit', editingTeam);
    setEditingTeam(null);
  };

  // Add New Team
  const handleAddTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamForm.name.trim() || !newTeamForm.participant1.trim()) {
      setAddTeamError('Team name and Participant 1 name are required.');
      return;
    }
    setAddTeamLoading(true);
    setAddTeamError(null);
    try {
      const res = await fetch('/api/admin/team/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(newTeamForm),
      });

      if (res.status === 401) {
        handleLogout();
        setLoginError('Admin session expired or invalidated. Please sign in again.');
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add team');
      }
      setShowAddTeamModal(false);
      setNewTeamForm({
        id: '',
        name: '',
        participant1: '',
        participant2: '',
        college: 'Autonomous College of Engineering & Technology',
        department: 'Computer Science & Engineering',
        year: '3rd Year',
        phone: '',
      });
      setControlMessage(`Team ${data.team.name} (${data.team.id}) added successfully.`);
      fetchAdminData();
      onRefreshState();
    } catch (err: any) {
      setAddTeamError(err.message || 'Failed to register team.');
    } finally {
      setAddTeamLoading(false);
    }
  };

  // Remove Team
  const handleConfirmRemoveTeam = async () => {
    if (!teamToDelete) return;
    setRemoveTeamLoading(true);
    try {
      const res = await fetch('/api/admin/team/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ teamId: teamToDelete.id }),
      });

      if (res.status === 401) {
        handleLogout();
        setLoginError('Admin session expired or invalidated. Please sign in again.');
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to remove team');
      }
      setControlMessage(`Team ${teamToDelete.name} (${teamToDelete.id}) permanently removed.`);
      fetchAdminData();
      onRefreshState();
    } catch (err: any) {
      setControlMessage(`Error removing team: ${err.message}`);
    } finally {
      setRemoveTeamLoading(false);
    }
  };

  // Format timer
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ==========================================
  // VIEW: UN-AUTHENTICATED LOGIN SCREEN
  // ==========================================
  if (!adminToken) {
    return (
      <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#F5F9FC]">
        <div className="w-full max-w-md bg-white border border-[#DCE6F0] rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-[#06B6D4]/30 flex items-center justify-center text-[#0891B2] mb-3 shadow-md shadow-cyan-500/10">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="font-tech text-xl font-bold text-[#172033] tracking-wider">
              ORGANIZER COMMAND DESK
            </h1>
            <p className="text-xs text-[#64748B] font-mono-code mt-1">
              TECH BRIDGE '26 • CSE Symposium Control Center
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono-code text-[#64748B] mb-1 font-semibold">
                OPERATOR USERNAME
              </label>
              <input
                id="input-admin-username"
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#172033] text-sm font-mono-code focus:outline-none focus:border-[#06B6D4] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-mono-code text-[#64748B] mb-1 font-semibold">
                SECURE ACCESS KEY
              </label>
              <input
                id="input-admin-password"
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#172033] text-sm font-mono-code focus:outline-none focus:border-[#06B6D4] transition-all"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-mono-code text-[#64748B]">Symposium Operator Security Gateway</span>
              <span className="text-[10px] font-mono-code text-[#64748B]">Restricted Faculty / Admin Access</span>
            </div>

            <button
              id="btn-admin-submit-login"
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#2563EB] hover:from-[#0891B2] hover:to-[#1D4ED8] text-white font-bold text-xs font-tech tracking-wider transition-all disabled:opacity-50 mt-2 shadow-md shadow-cyan-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loginLoading ? 'AUTHENTICATING GATEWAY...' : 'VERIFY & ENTER COMMAND DESK'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#DCE6F0] text-center">
            <span className="text-[10px] font-mono-code text-[#64748B] block">
              ROLE-BASED AUTHORIZATION ENFORCED • SERVER-AUTHORITATIVE
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Active question in bank for current round and chosen set
  const currentStageRound = (eventState?.currentRound || 1) as RoundNumber;
  const currentActiveSet = eventState?.activeQuestionSet?.[currentStageRound] || 'A';
  const roundQuestions = questionsList
    .filter((q) => q.round === currentStageRound && (q.set || 'A') === currentActiveSet && q.active)
    .sort((a, b) => a.questionNumber - b.questionNumber);
  const activeQuestion = roundQuestions[eventState?.currentQuestionIndex || 0] || null;

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Admin Status Bar */}
      <div className="bg-white border border-[#DCE6F0] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-[#06B6D4]/30 flex items-center justify-center text-[#0891B2]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-tech text-lg font-bold text-[#172033] tracking-wider">
                CONTROL CENTER
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold bg-cyan-50 text-[#0891B2] border border-[#06B6D4]/30">
                {adminRole.replace('_', ' ')}
              </span>
              {eventState?.isTestMode && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
                  TEST / DRY-RUN MODE ACTIVE
                </span>
              )}
              {eventState?.eventLocked && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  ARENA LOCKED
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748B]">
              Session: <span className="text-[#172033] font-mono-code font-semibold">{adminUsername}</span> • Authoritative symposium game engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => sendControl('toggle-test-mode')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono-code font-bold transition-all cursor-pointer ${
              eventState?.isTestMode
                ? 'bg-amber-100 border-amber-400 text-amber-900'
                : 'bg-[#F8FAFC] border-[#DCE6F0] text-[#64748B] hover:text-[#172033]'
            }`}
            title="Toggle test mode to exercise buzzer and questions without affecting scores"
          >
            {eventState?.isTestMode ? 'TEST MODE: ON' : 'TEST MODE: OFF'}
          </button>

          <button
            onClick={() => sendControl('event/toggle-lock')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono-code font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              eventState?.eventLocked
                ? 'bg-rose-50 border-rose-300 text-rose-700'
                : 'bg-[#F8FAFC] border-[#DCE6F0] text-[#64748B] hover:text-[#172033]'
            }`}
          >
            {eventState?.eventLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{eventState?.eventLocked ? 'UNLOCK ARENA' : 'LOCK ARENA'}</span>
          </button>

          <button
            onClick={fetchAdminData}
            className="p-2 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#DCE6F0] text-[#64748B] hover:text-[#172033] cursor-pointer"
            title="Refresh All Server Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] hover:bg-rose-50 border border-[#DCE6F0] hover:border-rose-200 text-[#64748B] hover:text-rose-700 text-xs font-mono-code flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>LOGOUT</span>
          </button>
        </div>
      </div>

      {/* Control Message Toast */}
      {controlMessage && (
        <div className="p-3 bg-cyan-50 border border-[#06B6D4]/50 rounded-xl text-xs font-mono-code text-[#0891B2] flex items-center justify-between animate-fadeIn">
          <span>{controlMessage}</span>
          <button onClick={() => setControlMessage(null)} className="text-[#0891B2] hover:text-[#172033] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#DCE6F0] pb-2 overflow-x-auto text-xs scrollbar-thin">
        <button
          onClick={() => setActiveTab('control')}
          className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'control'
              ? 'bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#172033] hover:bg-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Live Control
        </button>

        <button
          onClick={() => setActiveTab('teams')}
          className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'teams'
              ? 'bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#172033] hover:bg-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Teams ({teamsList.length})
        </button>

        <button
          onClick={() => setActiveTab('monitoring')}
          className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'monitoring'
              ? 'bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#172033] hover:bg-white'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Answer Monitor
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'questions'
              ? 'bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#172033] hover:bg-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Questions ({questionsList.length})
        </button>

        <button
          onClick={() => setActiveTab('bulk_import')}
          className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'bulk_import'
              ? 'bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#172033] hover:bg-white'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          Bulk Import & Queue
        </button>

        <button
          onClick={() => setActiveTab('team_questions')}
          className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'team_questions'
              ? 'bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#172033] hover:bg-white'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          Team Question
        </button>

        <button
          onClick={() => setActiveTab('clues')}
          className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'clues'
              ? 'bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#172033] hover:bg-white'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          Clues & Hints
        </button>

        <button
          onClick={() => setActiveTab('score_adjust')}
          className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'score_adjust'
              ? 'bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#172033] hover:bg-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Score Adjust
        </button>

        <button
          onClick={() => setActiveTab('qualification')}
          className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'qualification'
              ? 'bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#172033] hover:bg-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          Qualification
        </button>

        <button
          onClick={() => setActiveTab('anticheat')}
          className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'anticheat'
              ? 'bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#172033] hover:bg-white'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Anti-Cheat ({antiCheatList.filter(a => !a.resolved).length})
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'leaderboard'
              ? 'bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#172033] hover:bg-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          Leaderboard
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#172033] hover:bg-white'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          Reports & XLSX
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'feedback'
              ? 'bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#172033] hover:bg-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Feedback
        </button>

        {adminRole === 'SUPER_ADMIN' && (
          <button
            onClick={() => setActiveTab('admins')}
            className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'admins'
                ? 'bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#172033] hover:bg-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Accounts
          </button>
        )}

        <button
          onClick={() => setActiveTab('certificates')}
          className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'certificates'
              ? 'bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#172033] hover:bg-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          Certificates
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#172033] hover:bg-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Audit Logs
        </button>

        <button
          onClick={() => setActiveTab('offline')}
          className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'offline'
              ? 'bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#172033] hover:bg-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Offline Packet
        </button>
      </div>

      {/* ==========================================
          TAB 1: ROUND & TIMER CONTROLS
          ========================================== */}
      {activeTab === 'control' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 bg-white border border-[#DCE6F0] rounded-xl shadow-xs">
              <span className="text-[10px] font-mono-code text-[#64748B] block uppercase font-medium">EVENT STATUS</span>
              <span className="text-sm font-bold text-[#172033]">{eventState?.status}</span>
            </div>
            <div className="p-3 bg-white border border-[#DCE6F0] rounded-xl shadow-xs">
              <span className="text-[10px] font-mono-code text-[#64748B] block uppercase font-medium">CURRENT ROUND</span>
              <span className="text-sm font-bold text-[#0891B2]">ROUND {eventState?.currentRound}</span>
            </div>
            <div className="p-3 bg-white border border-[#DCE6F0] rounded-xl shadow-xs">
              <span className="text-[10px] font-mono-code text-[#64748B] block uppercase font-medium">ROUND TIMER</span>
              <span className="text-sm font-bold font-mono-code text-[#172033]">{formatTimer(remainingSeconds)}</span>
            </div>
            <div className="p-3 bg-white border border-[#DCE6F0] rounded-xl shadow-xs">
              <span className="text-[10px] font-mono-code text-[#64748B] block uppercase font-medium">TEAMS ONLINE</span>
              <span className="text-sm font-bold text-emerald-600">{eventState?.stats?.onlineTeams || 0} / {teamsList.length}</span>
            </div>
            <div className="p-3 bg-white border border-[#DCE6F0] rounded-xl shadow-xs">
              <span className="text-[10px] font-mono-code text-[#64748B] block uppercase font-medium">LOCKED TEAMS</span>
              <span className="text-sm font-bold text-amber-600">{eventState?.stats?.lockedTeams || 0}</span>
            </div>
            <div className="p-3 bg-white border border-[#DCE6F0] rounded-xl shadow-xs">
              <span className="text-[10px] font-mono-code text-[#64748B] block uppercase font-medium">SECURITY ALERTS</span>
              <span className="text-sm font-bold text-rose-600">{antiCheatList.filter(a => !a.resolved).length}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary Event Control Deck */}
            <div className="lg:col-span-2 bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm space-y-6">
              <div>
                <h3 className="font-tech text-sm font-bold text-[#0891B2] uppercase tracking-wider mb-1">
                  ROUND STAGE EXECUTION
                </h3>
                <p className="text-xs text-[#64748B]">
                  Switch rounds, start synchronized timers, or freeze the competition stage.
                </p>
              </div>

              {/* Round Switcher & Starter */}
              <div className="grid grid-cols-3 gap-3">
                {([1, 2, 3] as const).map((r) => {
                  const isCur = eventState?.currentRound === r;
                  const isLocked = eventState?.roundLocked?.[r];
                  const currentRoundSet = eventState?.activeQuestionSet?.[r] || 'A';
                  return (
                    <div key={r} className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DCE6F0] flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-tech text-xs font-bold text-[#172033]">
                          ROUND {r}
                        </span>
                        {isLocked && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono-code bg-rose-50 text-rose-700 border border-rose-200">
                            LOCKED
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono-code text-[#64748B]">
                        <span>{r === 1 ? '30m • 1 pt' : r === 2 ? '15m • 2 pts' : '15m • 3 pts'}</span>
                        <span className="text-[#7C3AED] font-bold">Set {currentRoundSet}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 pt-1 border-t border-[#DCE6F0]">
                        <button
                          onClick={() => sendControl('start', { round: r })}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold font-tech transition-all cursor-pointer ${
                            isCur && eventState?.status === 'RUNNING'
                              ? 'bg-[#06B6D4] text-white shadow-xs'
                              : 'bg-white hover:bg-[#F1F5F9] border border-[#DCE6F0] text-[#172033]'
                          }`}
                        >
                          START
                        </button>
                        <button
                          onClick={() => sendControl('round/toggle-lock', { round: r })}
                          className="py-1.5 px-2 rounded-lg text-xs font-mono-code bg-white hover:bg-[#F1F5F9] border border-[#DCE6F0] text-[#64748B] hover:text-[#172033] cursor-pointer"
                        >
                          {isLocked ? 'UNLOCK' : 'LOCK'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Question Set Selector for Current Round */}
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#DCE6F0] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#7C3AED]" />
                    <span className="font-tech text-xs font-bold text-[#172033] tracking-wider">
                      PARTICIPANT QUESTION SET • ROUND {eventState?.currentRound || 1}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono-code text-[#7C3AED] font-bold">
                    ACTIVE: SET {eventState?.activeQuestionSet?.[eventState?.currentRound || 1] || 'A'}
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B]">
                  Select which set of questions participants attend for Round {eventState?.currentRound || 1}. Switching updates all student screens immediately:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(['A', 'B', 'C'] as const).map((s) => {
                    const curR = (eventState?.currentRound || 1) as RoundNumber;
                    const isActive = (eventState?.activeQuestionSet?.[curR] || 'A') === s;
                    const count = questionsList.filter((q) => q.round === curR && (q.set || 'A') === s).length;
                    return (
                      <button
                        key={s}
                        onClick={() => sendControl('set-question-set', { round: curR, set: s })}
                        className={`py-2 px-3 rounded-lg border text-center transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#7C3AED] border-[#6D28D9] text-white shadow-sm font-bold'
                            : 'bg-white border-[#DCE6F0] text-[#64748B] hover:text-[#172033] hover:border-slate-300'
                        }`}
                      >
                        <div className="font-mono-code text-xs">SET {s}</div>
                        <div className="text-[10px] font-mono-code opacity-80">{count} Questions</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Visual Clue Display Mode Toggle (Realistic Connected Images vs Vector Clue Panels) */}
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#DCE6F0] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#0891B2]" />
                    <span className="font-tech text-xs font-bold text-[#172033] tracking-wider">
                      VISUAL CLUE DISPLAY MODE (ALL PARTICIPANT SCREENS & PROJECTORS)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono-code text-[#0891B2] font-bold uppercase">
                    ACTIVE: {eventState?.clueDisplayMode === 'panels' ? 'VECTOR PANELS' : 'REAL PHOTOGRAPHIC'}
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B]">
                  Switch between realistic real-world connected photos (2-3 connected images per question) or cryptographic vector clue panels:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/admin/clue-display-mode', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${adminToken}`,
                          },
                          body: JSON.stringify({ mode: 'realistic' }),
                        });
                        const data = await res.json();
                        if (data.success) {
                          setControlMessage('Switched all screens to Real-World Photographic Clues!');
                          fetchAdminData();
                        }
                      } catch (err: any) {
                        setControlMessage(err.message || 'Failed to update mode');
                      }
                    }}
                    className={`py-2.5 px-3 rounded-lg border text-left transition-all cursor-pointer ${
                      (eventState?.clueDisplayMode || 'realistic') === 'realistic'
                        ? 'bg-cyan-50 border-[#06B6D4] text-[#0891B2] shadow-xs font-bold'
                        : 'bg-white border-[#DCE6F0] text-[#64748B] hover:text-[#172033] hover:border-slate-300'
                    }`}
                  >
                    <div className="font-tech text-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
                      REALISTIC IMAGES
                    </div>
                    <div className="text-[10px] font-sans opacity-70 mt-0.5">
                      2-3 connected photographic clues per question
                    </div>
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/admin/clue-display-mode', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${adminToken}`,
                          },
                          body: JSON.stringify({ mode: 'panels' }),
                        });
                        const data = await res.json();
                        if (data.success) {
                          setControlMessage('Switched all screens to Vector Clue Panels!');
                          fetchAdminData();
                        }
                      } catch (err: any) {
                        setControlMessage(err.message || 'Failed to update mode');
                      }
                    }}
                    className={`py-2.5 px-3 rounded-lg border text-left transition-all cursor-pointer ${
                      eventState?.clueDisplayMode === 'panels'
                        ? 'bg-purple-50 border-[#7C3AED] text-[#7C3AED] shadow-xs font-bold'
                        : 'bg-white border-[#DCE6F0] text-[#64748B] hover:text-[#172033] hover:border-slate-300'
                    }`}
                  >
                    <div className="font-tech text-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                      VECTOR CLUE PANELS
                    </div>
                    <div className="text-[10px] font-sans opacity-70 mt-0.5">
                      Cryptographic SVG panels without descriptions
                    </div>
                  </button>
                </div>
              </div>

              {/* Timer Controls: Pause, Resume, Stop, +1m, +5m, -1m */}
              <div className="pt-4 border-t border-[#DCE6F0]">
                <div className="text-[11px] font-mono-code text-[#64748B] uppercase mb-2 font-medium">
                  Timer Synchronization & Adjustments
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {eventState?.isPaused ? (
                    <button
                      onClick={() => sendControl('resume')}
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-tech tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5" />
                      RESUME
                    </button>
                  ) : (
                    <button
                      onClick={() => sendControl('pause')}
                      disabled={eventState?.status !== 'RUNNING'}
                      className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs font-tech tracking-wider flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-xs"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      PAUSE
                    </button>
                  )}

                  <button
                    onClick={() => sendControl('stop')}
                    disabled={eventState?.status === 'COMPLETED' || eventState?.status === 'WAITING'}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-[#172033] border border-[#DCE6F0] font-bold text-xs font-tech tracking-wider flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
                  >
                    STOP
                  </button>

                  <button
                    onClick={() => sendControl('round/extend-time', { seconds: 60 })}
                    className="py-2.5 px-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#DCE6F0] text-[#0891B2] font-bold text-xs font-mono-code cursor-pointer"
                  >
                    +1 MIN
                  </button>

                  <button
                    onClick={() => sendControl('round/extend-time', { seconds: 300 })}
                    className="py-2.5 px-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#DCE6F0] text-[#0891B2] font-bold text-xs font-mono-code cursor-pointer"
                  >
                    +5 MINS
                  </button>
                </div>
              </div>

              {/* Question Navigation */}
              <div className="pt-4 border-t border-[#DCE6F0]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono-code text-[#64748B] uppercase font-medium">
                    QUESTION NAVIGATION (ACTIVE: Q{(eventState?.currentQuestionIndex || 0) + 1} / {eventState?.totalQuestionsInRound})
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => sendControl('prev')}
                    className="py-2.5 px-3 rounded-xl bg-[#F8FAFC] border border-[#DCE6F0] text-[#172033] hover:text-[#0891B2] text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    PREVIOUS QUESTION
                  </button>
                  <button
                    onClick={() => sendControl('next')}
                    className="py-2.5 px-3 rounded-xl bg-[#F8FAFC] border border-[#DCE6F0] text-[#172033] hover:text-[#0891B2] text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>NEXT QUESTION</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Reset Event Button (Guarded) */}
              <div className="pt-4 border-t border-[#DCE6F0] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-rose-600">Emergency Event Reset</div>
                  <div className="text-[10px] text-[#64748B]">Clears all submissions, resets round 1, zeroes scores</div>
                </div>
                <button
                  onClick={() => setShowResetModal(true)}
                  className="py-2 px-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold font-mono-code flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  RESET EVENT
                </button>
              </div>
            </div>

            {/* Side Column: Round 3 Digital Buzzer & Active Clue Inspector */}
            <div className="space-y-6">
              {/* Round-By-Round Digital Buzzer Engine */}
              <div className="bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${eventState?.buzzerActive ? 'bg-rose-500 animate-ping' : 'bg-slate-300'}`} />
                    <h3 className="font-tech text-sm font-bold text-[#172033] tracking-wider">
                      DIGITAL BUZZER ENGINE
                    </h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono-code font-bold ${
                    eventState?.buzzerActive ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-[#F8FAFC] text-[#64748B] border border-[#DCE6F0]'
                  }`}>
                    {eventState?.buzzerActive ? 'BUZZER ARMED' : 'LOCKED'}
                  </span>
                </div>

                {/* Per-Round Buzzer Switches (R1, R2, R3) */}
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#DCE6F0] space-y-2">
                  <div className="text-[10px] font-mono-code text-[#0891B2] uppercase font-bold flex items-center justify-between">
                    <span>ROUND BUZZER PERMISSIONS</span>
                    <span className="text-[#64748B]">ADMIN CONTROL</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {([1, 2, 3] as const).map((rNum) => {
                      const isEnabled = eventState?.buzzerRoundEnabled?.[rNum] ?? (rNum === 3);
                      return (
                        <button
                          key={rNum}
                          type="button"
                          onClick={() => sendControl('buzzer-toggle', { round: rNum })}
                          className={`py-2 px-2.5 rounded-lg text-xs font-mono-code font-bold flex flex-col items-center gap-1 transition-all border cursor-pointer ${
                            isEnabled
                              ? 'bg-cyan-50 border-[#06B6D4] text-[#0891B2] shadow-xs'
                              : 'bg-white border-[#DCE6F0] text-[#64748B] hover:text-[#172033]'
                          }`}
                        >
                          <span>ROUND {rNum}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded ${isEnabled ? 'bg-[#06B6D4] text-white font-bold' : 'bg-slate-200 text-slate-600'}`}>
                            {isEnabled ? 'ON' : 'OFF'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Simultaneous Tie Warning Alert */}
                {eventState?.buzzerTie && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 space-y-1 shadow-xs">
                    <div className="text-xs font-bold font-tech tracking-wider text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      SIMULTANEOUS TIE DETECTED!
                    </div>
                    <p className="text-[11px] text-amber-800 leading-tight">
                      Multiple contestants pressed the buzzer within the 85ms microsecond delta window! Review contenders below and decide which team to recognize.
                    </p>
                  </div>
                )}

                {/* Contenders List & Winner */}
                {eventState?.buzzerContenders && eventState.buzzerContenders.length > 0 ? (
                  <div className="space-y-2.5">
                    <div className="text-[10px] font-mono-code text-[#64748B] uppercase font-bold flex items-center justify-between">
                      <span>BUZZ TIMESTAMP CONTENDERS ({eventState.buzzerContenders.length})</span>
                      <span>DELTA (MS)</span>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {eventState.buzzerContenders.map((contender, idx) => (
                        <div
                          key={`${contender.teamId}-${idx}`}
                          className={`p-3 rounded-xl border transition-all ${
                            idx === 0
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                              : contender.isTie
                              ? 'bg-amber-50 border-amber-300 text-amber-900'
                              : 'bg-[#F8FAFC] border-[#DCE6F0] text-[#172033]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-mono-code font-bold px-1.5 py-0.5 rounded ${
                                idx === 0 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                              }`}>
                                #{idx + 1}
                              </span>
                              <span className="font-bold text-xs text-[#172033]">
                                {contender.teamName}
                              </span>
                              {contender.isTie && (
                                <span className="text-[9px] font-mono-code px-1.5 py-0.2 bg-amber-100 text-amber-800 border border-amber-300 rounded font-bold">
                                  TIE
                                </span>
                              )}
                            </div>

                            <span className="text-[10px] font-mono-code text-[#0891B2] font-bold">
                              {contender.timeDeltaMs === 0 ? 'FIRST BUZZ' : `+${contender.timeDeltaMs}ms`}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[10px] font-mono-code text-[#64748B]">
                            <span>ID: {contender.teamId}</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => sendControl('buzzer-award', { awardPoints: true, points: (eventState?.currentRound === 1 ? 1 : eventState?.currentRound === 2 ? 2 : 3), teamId: contender.teamId })}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                                +{eventState?.currentRound === 1 ? 1 : eventState?.currentRound === 2 ? 2 : 3} {eventState?.currentRound === 1 ? 'PT' : 'PTS'}
                              </button>
                              <button
                                onClick={() => sendControl('buzzer-award', { awardPoints: false, teamId: contender.teamId })}
                                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-[#DCE6F0] text-[#64748B] font-bold text-[10px] cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                                PASS
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : eventState?.buzzerWinner ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 mb-4 space-y-2">
                    <div className="text-[10px] font-mono-code uppercase text-emerald-700 font-bold">
                      FIRST BUZZ RECORDED • SEQ #{eventState.buzzerWinner.sequenceNumber}
                    </div>
                    <div className="text-base font-bold text-[#172033]">
                      {eventState.buzzerWinner.teamName}
                    </div>
                    <div className="text-xs font-mono-code text-[#64748B]">
                      Team ID: {eventState.buzzerWinner.teamId}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-200">
                      <button
                        onClick={() => sendControl('buzzer-award', { awardPoints: true, points: (eventState?.currentRound === 1 ? 1 : eventState?.currentRound === 2 ? 2 : 3) })}
                        className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        +{eventState?.currentRound === 1 ? 1 : eventState?.currentRound === 2 ? 2 : 3} {eventState?.currentRound === 1 ? 'PT' : 'PTS'} (CORRECT)
                      </button>
                      <button
                        onClick={() => sendControl('buzzer-award', { awardPoints: false })}
                        className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 border border-[#DCE6F0] text-[#172033] text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        PASS / WRONG
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#DCE6F0] text-center mb-4">
                    <Radio className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <span className="text-xs font-mono-code text-[#64748B] block">
                      {eventState?.buzzerActive ? 'Buzzer is ARMED & waiting for contestants...' : 'Buzzer is currently locked'}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => sendControl('buzzer-reset')}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-tech tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5" />
                  RE-ARM BUZZER FOR ALL TEAMS
                </button>
              </div>

              {/* Active Clue Inspector (With Authoritative Answer Key for Organizers) */}
              {activeQuestion && (
                <div className="bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#DCE6F0]">
                    <span className="text-[10px] font-mono-code text-[#0891B2] uppercase font-bold">
                      ACTIVE QUESTION PREVIEW
                    </span>
                    <span className="text-xs font-mono-code text-[#64748B]">
                      ID: {activeQuestion.id} • {activeQuestion.points} {activeQuestion.points === 1 ? 'pt' : 'pts'}
                    </span>
                  </div>

                  <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-[#DCE6F0]">
                    <RebusClueRenderer
                      panels={activeQuestion.cluePanels}
                      customImageUrl={activeQuestion.customImageUrl}
                      images={activeQuestion.images}
                      displayMode={eventState?.clueDisplayMode || 'realistic'}
                    />
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono-code text-emerald-800 uppercase font-bold block">
                      OFFICIAL AUTHORITATIVE ANSWER
                    </span>
                    <span className="font-mono-code font-bold text-sm text-emerald-900 block">
                      {activeQuestion.correctAnswer}
                    </span>
                    {activeQuestion.aliases.length > 0 && (
                      <span className="text-[10px] font-mono-code text-[#64748B] block">
                        Accepted Variations: {activeQuestion.aliases.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 2: PARTICIPANTS & LOCK CONTROLS
          ========================================== */}
      {activeTab === 'teams' && (
        <div className="bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-tech text-base font-bold text-[#172033] tracking-wider">
                REGISTERED CONTESTANT TEAMS
              </h3>
              <p className="text-xs text-[#64748B]">
                Manage team authorizations, contact details, lock/unlock access, or issue warnings.
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                id="btn-admin-add-team"
                onClick={() => { setShowAddTeamModal(true); setAddTeamError(null); }}
                className="py-2 px-3.5 rounded-xl bg-[#06B6D4] hover:bg-[#0891B2] text-white font-bold text-xs font-tech tracking-wider flex items-center gap-1.5 shadow-xs whitespace-nowrap transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>ADD TEAM</span>
              </button>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#64748B]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Team ID, name, college..."
                  className="w-full pl-9 pr-3 py-1.5 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#06B6D4] font-mono-code"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#DCE6F0] text-[#64748B] font-mono-code">
                  <th className="pb-3 px-3">TEAM ID</th>
                  <th className="pb-3 px-3">TEAM NAME</th>
                  <th className="pb-3 px-3">PARTICIPANTS</th>
                  <th className="pb-3 px-3">COLLEGE</th>
                  <th className="pb-3 px-3">SCORE (R1/R2/R3)</th>
                  <th className="pb-3 px-3">STATUS</th>
                  <th className="pb-3 px-3">WARNINGS</th>
                  <th className="pb-3 px-3 text-right">CONTROLS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE6F0]">
                {teamsList
                  .filter(t => 
                    t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.college.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((t) => (
                    <tr key={t.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-3 font-mono-code font-bold text-[#0891B2]">
                        {t.id}
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#172033]">
                        {t.name}
                        {t.isOnline && (
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 ml-2" title="Online" />
                        )}
                      </td>
                      <td className="py-3 px-3 text-[#172033]">
                        {t.participant1} {t.participant2 ? `& ${t.participant2}` : ''}
                      </td>
                      <td className="py-3 px-3 text-[#64748B] max-w-[180px] truncate">{t.college}</td>
                      <td className="py-3 px-3 font-mono-code text-[#172033]">
                        {t.round1Score} / {t.round2Score} / {t.round3Score} = <span className="font-bold text-[#0891B2]">{t.totalScore}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono-code font-bold ${
                          t.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : t.status === 'WARNED'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : t.status === 'LOCKED'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {t.status}
                        </span>
                        {t.lockReason && (
                          <div className="text-[10px] text-[#64748B] truncate max-w-[140px]" title={t.lockReason}>
                            {t.lockReason}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono-code font-bold">
                        <span className={t.warningsCount >= 2 ? 'text-rose-600' : t.warningsCount > 0 ? 'text-amber-600' : 'text-[#64748B]'}>
                          {t.warningsCount}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            onClick={() => setEditingTeam(t)}
                            className="px-2 py-1 rounded bg-[#F8FAFC] hover:bg-slate-200 border border-[#DCE6F0] text-[#172033] text-[10px] font-bold cursor-pointer"
                            title="Edit participant details"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => handleTeamAction(t.id, 'WARN')}
                            className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold cursor-pointer"
                          >
                            WARN
                          </button>

                          {t.status === 'LOCKED' ? (
                            <button
                              onClick={() => handleTeamAction(t.id, 'UNLOCK')}
                              className="px-2 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold cursor-pointer"
                            >
                              UNLOCK
                            </button>
                          ) : (
                            <button
                              onClick={() => handleTeamAction(t.id, 'LOCK')}
                              className="px-2 py-1 rounded bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-[10px] font-bold cursor-pointer"
                            >
                              LOCK
                            </button>
                          )}

                          {t.status === 'DISQUALIFIED' ? (
                            <button
                              onClick={() => handleTeamAction(t.id, 'RESTORE')}
                              className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-[10px] font-bold cursor-pointer"
                            >
                              RESTORE
                            </button>
                          ) : (
                            <button
                              onClick={() => handleTeamAction(t.id, 'DISQUALIFY')}
                              className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[10px] font-bold cursor-pointer"
                            >
                              DISQUALIFY
                            </button>
                          )}

                          <button
                            onClick={() => setTeamToDelete(t)}
                            className="px-2 py-1 rounded bg-[#F8FAFC] hover:bg-rose-50 border border-[#DCE6F0] text-[#64748B] hover:text-rose-700 text-[10px] font-bold transition-all cursor-pointer"
                            title="Remove team from symposium"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 3: ANTI-CHEAT SECURITY CENTER & TRIAGE
          ========================================== */}
      {activeTab === 'anticheat' && (
        <div className="space-y-6">
          {/* Policy Banner */}
          <div className="bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-tech text-base font-bold text-[#172033] tracking-wider">
                    REAL-TIME ANTI-CHEATING INCIDENT TRIAGE
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Rule Policy: 1st Violation = Warning • 2nd = Strict Warning • 3rd = Automatic Account Lockout
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/api/admin/export-anticheat-csv"
                  download
                  className="py-1.5 px-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#DCE6F0] text-xs font-mono-code text-[#0891B2] flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  EXPORT CSV
                </a>
              </div>
            </div>

            {/* Severity Filter Tabs */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#DCE6F0]">
              {(['ALL', 'CRITICAL', 'HIGH', 'WARNING', 'INFO'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono-code font-bold transition-all cursor-pointer ${
                    severityFilter === sev
                      ? 'bg-[#06B6D4] text-white'
                      : 'bg-[#F8FAFC] border border-[#DCE6F0] text-[#64748B] hover:text-[#172033]'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Incident Log Table with Action Buttons */}
          <div className="bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm">
            {antiCheatList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#DCE6F0] text-[#64748B] font-mono-code">
                      <th className="pb-3 px-3">TIMESTAMP</th>
                      <th className="pb-3 px-3">TEAM</th>
                      <th className="pb-3 px-3">SEVERITY</th>
                      <th className="pb-3 px-3">INCIDENT TYPE</th>
                      <th className="pb-3 px-3">STAGE / Q</th>
                      <th className="pb-3 px-3">DETAILS</th>
                      <th className="pb-3 px-3">STATUS</th>
                      <th className="pb-3 px-3 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE6F0]">
                    {antiCheatList
                      .filter(a => severityFilter === 'ALL' || a.severity === severityFilter)
                      .map((alert) => (
                        <tr key={alert.id} className="hover:bg-[#F8FAFC]">
                          <td className="py-3 px-3 font-mono-code text-[#64748B] whitespace-nowrap">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="py-3 px-3 font-semibold text-[#172033]">
                            {alert.teamName} <span className="text-[10px] font-mono-code text-[#64748B]">({alert.teamId})</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono-code font-bold ${
                              alert.severity === 'CRITICAL'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : alert.severity === 'HIGH'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : alert.severity === 'WARNING'
                                ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {alert.severity}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono-code text-amber-700 font-bold">
                            {alert.eventType}
                          </td>
                          <td className="py-3 px-3 font-mono-code text-[#64748B]">
                            R{alert.round} / Q{alert.questionNumber}
                          </td>
                          <td className="py-3 px-3 text-[#172033] max-w-xs truncate" title={alert.details}>
                            {alert.details}
                          </td>
                          <td className="py-3 px-3">
                            {alert.resolved ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-slate-100 text-[#64748B]">
                                {alert.actionTaken || 'RESOLVED'}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                                UNRESOLVED
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              <button
                                onClick={() => handleAntiCheatAction(alert.id, 'WARN')}
                                className="px-2 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 text-[10px] font-bold cursor-pointer"
                                title="Issue official warning to team"
                              >
                                WARN
                              </button>
                              <button
                                onClick={() => handleAntiCheatAction(alert.id, 'LOCKED')}
                                className="px-2 py-1 rounded bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 text-[10px] font-bold cursor-pointer"
                                title="Lock team access"
                              >
                                LOCK
                              </button>
                              <button
                                onClick={() => handleAntiCheatAction(alert.id, 'DISQUALIFY')}
                                className="px-2 py-1 rounded bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-[10px] font-bold cursor-pointer"
                                title="Disqualify team from competition"
                              >
                                DISQUALIFY
                              </button>
                              <button
                                onClick={() => handleAntiCheatAction(alert.id, 'DISMISSED')}
                                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-[#DCE6F0] text-[#64748B] text-[10px] font-bold cursor-pointer"
                                title="Dismiss alert as false positive"
                              >
                                DISMISS
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-[#64748B] font-mono-code text-xs">
                No security anomalies recorded. Competition arena is clean.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 4: LEADERBOARD & RESULTS
          ========================================== */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-tech text-base font-bold text-amber-600 tracking-wider">
                COMPETITION STANDINGS & PODIUM
              </h3>
              <p className="text-xs text-[#64748B]">
                Live rankings computed server-side across all three rounds
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => sendControl('toggle-leaderboard')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono-code font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  eventState?.showLeaderboard
                    ? 'bg-[#06B6D4] text-white border-[#0891B2]'
                    : 'bg-[#F8FAFC] text-[#64748B] border-[#DCE6F0]'
                }`}
              >
                {eventState?.showLeaderboard ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{eventState?.showLeaderboard ? 'PUBLIC SCOREBOARD: VISIBLE' : 'PUBLIC SCOREBOARD: HIDDEN'}</span>
              </button>

              <a
                href="/api/admin/export-csv"
                download
                className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs font-tech tracking-wider flex items-center gap-2 shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4" />
                EXPORT CSV
              </a>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#DCE6F0] text-[#64748B] font-mono-code">
                  <th className="pb-3 px-3">RANK</th>
                  <th className="pb-3 px-3">TEAM</th>
                  <th className="pb-3 px-3">COLLEGE</th>
                  <th className="pb-3 px-3 text-center">R1 (1 pt)</th>
                  <th className="pb-3 px-3 text-center">R2 (2 pts)</th>
                  <th className="pb-3 px-3 text-center">R3 (3 pts)</th>
                  <th className="pb-3 px-3 text-right">TOTAL PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE6F0]">
                {[...teamsList]
                  .sort((a, b) => b.totalScore - a.totalScore)
                  .map((t, index) => (
                    <tr key={t.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-3 font-mono-code font-extrabold text-sm text-[#172033]">
                        {index === 0 ? '🥇 #1' : index === 1 ? '🥈 #2' : index === 2 ? '🥉 #3' : `#${index + 1}`}
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#172033]">
                        {t.name} <span className="text-[10px] font-mono-code text-[#64748B]">({t.id})</span>
                      </td>
                      <td className="py-3 px-3 text-[#64748B]">{t.college}</td>
                      <td className="py-3 px-3 font-mono-code text-center text-[#172033]">{t.round1Score}</td>
                      <td className="py-3 px-3 font-mono-code text-center text-[#172033]">{t.round2Score}</td>
                      <td className="py-3 px-3 font-mono-code text-center text-[#172033]">{t.round3Score}</td>
                      <td className="py-3 px-3 font-mono-code font-extrabold text-[#0891B2] text-right text-base">
                        {t.totalScore}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 5: QUESTION BANK & SET MANAGER
          ========================================== */}
      {activeTab === 'questions' && (
        <QuestionManager
          questions={questionsList}
          activeQuestionSet={eventState?.activeQuestionSet || { 1: 'A', 2: 'A', 3: 'A' }}
          currentRound={(eventState?.currentRound || 1) as RoundNumber}
          adminToken={adminToken}
          onRefresh={fetchAdminData}
          onSelectQuestionSet={async (round, set) => {
            await sendControl('set-question-set', { round, set });
          }}
          onDeleteQuestion={async (questionId) => {
            await sendControl('question/delete', { questionId });
          }}
          onSaveQuestion={async (question, isEdit) => {
            if (isEdit) {
              await sendControl('question/edit', { question });
            } else {
              await sendControl('question/add', { question });
            }
          }}
          onUploadQuestions={async (questions, round, set, mode) => {
            await sendControl('questions/upload', { questions, round, set, mode });
          }}
          onSetConfig={async (round, set, maxCount, action) => {
            await sendControl('questions/set-config', { round, set, maxCount, action });
          }}
          onMergeSets={async (round, sourceSet, targetSet, keepSource) => {
            await sendControl('questions/merge-sets', { round, sourceSet, targetSet, keepSource });
          }}
          onMoveQuestions={async (payload) => {
            await sendControl('questions/move', payload);
          }}
          onAttachImage={async (questionId, imageUrl) => {
            await sendControl('question/upload-image', { questionId, imageUrl });
          }}
          onLoadOfficial30={async (mode) => {
            await sendControl('questions/load-official-30', { mode });
          }}
        />
      )}

      {/* ==========================================
          TAB 6: AUDIT LOGS & SYSTEM BACKUP
          ========================================== */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          {/* Export Controls Bar */}
          <div className="bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-tech text-base font-bold text-[#172033] tracking-wider">
                ADMINISTRATIVE AUDIT TRAIL & SYSTEM ARCHIVE
              </h3>
              <p className="text-xs text-[#64748B]">
                Immutable chronological log of all administrator actions, timer modifications, and security incidents.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/api/admin/export-audit-csv"
                download
                className="py-1.5 px-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#DCE6F0] text-xs font-mono-code text-[#0891B2] flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                AUDIT CSV
              </a>

              <a
                href="/api/admin/export-backup-json"
                download
                className="py-1.5 px-3 rounded-xl bg-[#06B6D4] hover:bg-[#0891B2] text-white font-bold text-xs font-tech tracking-wider flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                SYSTEM BACKUP JSON
              </a>
            </div>
          </div>

          {/* Audit Trail Table */}
          <div className="bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm">
            {auditLogsList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#DCE6F0] text-[#64748B] font-mono-code">
                      <th className="pb-3 px-3">TIMESTAMP</th>
                      <th className="pb-3 px-3">ADMINISTRATOR</th>
                      <th className="pb-3 px-3">ACTION</th>
                      <th className="pb-3 px-3">TARGET</th>
                      <th className="pb-3 px-3">OLD VALUE</th>
                      <th className="pb-3 px-3">NEW VALUE</th>
                      <th className="pb-3 px-3">DETAILS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE6F0] font-mono-code">
                    {auditLogsList.map((log) => (
                      <tr key={log.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-2.5 px-3 text-[#64748B] whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-2.5 px-3 text-[#0891B2] font-bold">
                          {log.adminUsername} <span className="text-[9px] text-[#64748B]">({log.role})</span>
                        </td>
                        <td className="py-2.5 px-3 text-amber-700 font-bold">
                          {log.action}
                        </td>
                        <td className="py-2.5 px-3 text-[#172033]">
                          {log.target}
                        </td>
                        <td className="py-2.5 px-3 text-[#64748B]">
                          {log.oldValue || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-emerald-600">
                          {log.newValue || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-[#64748B] max-w-xs truncate" title={log.details}>
                          {log.details || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-[#64748B] font-mono-code text-xs">
                Audit trail initialized. Actions will be logged here in real-time.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          TAB: ANSWERED / NOT ANSWERED MONITORING
          ========================================== */}
      {activeTab === 'monitoring' && (
        <AnsweredMonitoringPanel
          adminToken={adminToken}
          eventState={eventState}
          questions={questionsList}
        />
      )}

      {/* ==========================================
          TAB: BULK QUESTION IMPORT & REVIEW QUEUE
          ========================================== */}
      {activeTab === 'bulk_import' && (
        <BulkQuestionImportPanel
          adminToken={adminToken}
          onQuestionsImported={() => {
            fetchAdminData();
            onRefreshState();
          }}
        />
      )}

      {/* ==========================================
          TAB: TEAM-SPECIFIC QUESTION CONTROL
          ========================================== */}
      {activeTab === 'team_questions' && (
        <TeamQuestionControlPanel
          adminToken={adminToken}
          questions={questionsList}
          teams={teamsList}
          onSuccess={() => {
            fetchAdminData();
            onRefreshState();
          }}
        />
      )}

      {/* ==========================================
          TAB: DYNAMIC CLUES & PROGRESSIVE HINTS
          ========================================== */}
      {activeTab === 'clues' && (
        <DynamicClueControlPanel
          adminToken={adminToken}
          eventState={eventState}
          questions={questionsList}
          teams={teamsList}
          onSuccess={() => {
            fetchAdminData();
            onRefreshState();
          }}
        />
      )}

      {/* ==========================================
          TAB: MANUAL SCORE ADJUSTMENT ENGINE
          ========================================== */}
      {activeTab === 'score_adjust' && (
        <ManualScoreAdjustmentPanel
          adminToken={adminToken}
          teams={teamsList}
          onSuccess={() => {
            fetchAdminData();
            onRefreshState();
          }}
        />
      )}

      {/* ==========================================
          TAB: ROUND QUALIFICATION & ADVANCEMENT
          ========================================== */}
      {activeTab === 'qualification' && (
        <QualificationPanel
          adminToken={adminToken}
          currentRound={eventState?.currentRound || 1}
          teams={teamsList}
          onSuccess={() => {
            fetchAdminData();
            onRefreshState();
          }}
        />
      )}

      {/* ==========================================
          TAB: EVENT REPORTS & XLSX DOSSIER
          ========================================== */}
      {activeTab === 'reports' && (
        <EventReportsPanel adminToken={adminToken} />
      )}

      {/* ==========================================
          TAB: PARTICIPANT FEEDBACK & EVALUATION
          ========================================== */}
      {activeTab === 'feedback' && (
        <FeedbackResultsPanel
          adminToken={adminToken}
          feedbackActive={Boolean(eventState?.feedbackActive)}
          onToggleFeedback={() => sendControl('feedback/toggle')}
        />
      )}

      {/* ==========================================
          TAB: MULTIPLE ADMIN ACCOUNTS (SUPER ADMIN)
          ========================================== */}
      {activeTab === 'admins' && adminRole === 'SUPER_ADMIN' && (
        <MultipleAdminManagementPanel
          adminToken={adminToken}
          currentUsername={adminUsername}
        />
      )}

      {/* ==========================================
          TAB: CERTIFICATES & SAMPLE TEMPLATE MASTER
          ========================================== */}
      {activeTab === 'certificates' && (
        <div className="space-y-6">
          <AdminCertificateManager
            adminToken={adminToken}
            teamsList={teamsList}
            onShowMessage={(msg) => setControlMessage(msg)}
          />
        </div>
      )}

      {/* ==========================================
          TAB 7: EMERGENCY OFFLINE PACKET & SCORING LEDGER
          ========================================== */}
      {activeTab === 'offline' && (
        <div className="space-y-6">
          <EmergencyOfflineModal />
        </div>
      )}

      {/* ==========================================
          MODAL: EDIT TEAM DETAILS
          ========================================== */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-[#DCE6F0] rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE6F0]">
              <h3 className="font-tech text-base font-bold text-[#172033]">
                EDIT TEAM ({editingTeam.id})
              </h3>
              <button onClick={() => setEditingTeam(null)} className="text-[#64748B] hover:text-[#172033] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-mono-code text-[#64748B] mb-1 font-medium">TEAM NAME</label>
                <input
                  type="text"
                  value={editingTeam.name}
                  onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#172033]"
                />
              </div>

              <div>
                <label className="block font-mono-code text-[#64748B] mb-1 font-medium">PARTICIPANT 1</label>
                <input
                  type="text"
                  value={editingTeam.participant1}
                  onChange={(e) => setEditingTeam({ ...editingTeam, participant1: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#172033]"
                />
              </div>

              <div>
                <label className="block font-mono-code text-[#64748B] mb-1 font-medium">PARTICIPANT 2</label>
                <input
                  type="text"
                  value={editingTeam.participant2 || ''}
                  onChange={(e) => setEditingTeam({ ...editingTeam, participant2: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#172033]"
                />
              </div>

              <div>
                <label className="block font-mono-code text-[#64748B] mb-1 font-medium">COLLEGE</label>
                <input
                  type="text"
                  value={editingTeam.college}
                  onChange={(e) => setEditingTeam({ ...editingTeam, college: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#172033]"
                />
              </div>

              <div>
                <label className="block font-mono-code text-[#64748B] mb-1 font-medium">PHONE NUMBER</label>
                <input
                  type="text"
                  value={editingTeam.phone}
                  onChange={(e) => setEditingTeam({ ...editingTeam, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#172033] font-mono-code"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCE6F0]">
              <button
                onClick={() => setEditingTeam(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-[#DCE6F0] text-[#172033] font-bold text-xs cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={handleSaveTeamEdit}
                className="px-4 py-2 rounded-xl bg-[#06B6D4] hover:bg-[#0891B2] text-white font-bold text-xs font-tech tracking-wider cursor-pointer shadow-xs"
              >
                SAVE CHANGES
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: ADD NEW TEAM
          ========================================== */}
      {showAddTeamModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-[#DCE6F0] rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE6F0]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-[#0891B2]">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-tech text-base font-bold text-[#172033] tracking-wide">
                    REGISTER NEW CONTESTANT TEAM
                  </h3>
                  <p className="text-[11px] text-[#64748B]">Add an authorized participating team to the symposium roster</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddTeamModal(false)}
                className="text-[#64748B] hover:text-[#172033] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addTeamError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{addTeamError}</span>
              </div>
            )}

            <form onSubmit={handleAddTeamSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono-code text-[#172033] mb-1 font-medium">TEAM NAME *</label>
                  <input
                    type="text"
                    required
                    value={newTeamForm.name}
                    onChange={(e) => setNewTeamForm({ ...newTeamForm, name: e.target.value })}
                    placeholder="e.g. ByteBrigade"
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
                <div>
                  <label className="block font-mono-code text-[#172033] mb-1 font-medium">TEAM ID (OPTIONAL)</label>
                  <input
                    type="text"
                    value={newTeamForm.id}
                    onChange={(e) => setNewTeamForm({ ...newTeamForm, id: e.target.value.toUpperCase() })}
                    placeholder="Leave blank for auto TB-XXXX"
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#172033] font-mono-code focus:outline-none focus:border-[#06B6D4] uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono-code text-[#172033] mb-1 font-medium">PARTICIPANT 1 (LEAD) *</label>
                  <input
                    type="text"
                    required
                    value={newTeamForm.participant1}
                    onChange={(e) => setNewTeamForm({ ...newTeamForm, participant1: e.target.value })}
                    placeholder="Contestant 1 Name"
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
                <div>
                  <label className="block font-mono-code text-[#172033] mb-1 font-medium">PARTICIPANT 2 (OPTIONAL)</label>
                  <input
                    type="text"
                    value={newTeamForm.participant2}
                    onChange={(e) => setNewTeamForm({ ...newTeamForm, participant2: e.target.value })}
                    placeholder="Contestant 2 Name"
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono-code text-[#172033] mb-1 font-medium">COLLEGE / INSTITUTION *</label>
                <input
                  type="text"
                  required
                  value={newTeamForm.college}
                  onChange={(e) => setNewTeamForm({ ...newTeamForm, college: e.target.value })}
                  placeholder="e.g. Autonomous College of Engineering & Technology"
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#06B6D4]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-mono-code text-[#172033] mb-1 font-medium">DEPARTMENT</label>
                  <input
                    type="text"
                    value={newTeamForm.department}
                    onChange={(e) => setNewTeamForm({ ...newTeamForm, department: e.target.value })}
                    placeholder="Computer Science & Engineering"
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
                <div>
                  <label className="block font-mono-code text-[#172033] mb-1 font-medium">YEAR</label>
                  <select
                    value={newTeamForm.year}
                    onChange={(e) => setNewTeamForm({ ...newTeamForm, year: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#06B6D4]"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono-code text-[#172033] mb-1 font-medium">CONTACT PHONE</label>
                <input
                  type="tel"
                  value={newTeamForm.phone}
                  onChange={(e) => setNewTeamForm({ ...newTeamForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#172033] font-mono-code focus:outline-none focus:border-[#06B6D4]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCE6F0]">
                <button
                  type="button"
                  onClick={() => setShowAddTeamModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-[#DCE6F0] text-[#172033] font-bold text-xs cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={addTeamLoading}
                  className="px-5 py-2 rounded-xl bg-[#06B6D4] hover:bg-[#0891B2] text-white font-bold text-xs font-tech tracking-wider disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {addTeamLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>REGISTERING...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>REGISTER TEAM</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: CONFIRM REMOVE TEAM
          ========================================== */}
      {teamToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-rose-200 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-tech text-base font-bold tracking-wider">
                CONFIRM TEAM REMOVAL
              </h3>
            </div>

            <p className="text-xs text-[#172033] leading-relaxed">
              Are you sure you want to permanently remove team <span className="text-rose-600 font-bold">{teamToDelete.name}</span> (<span className="font-mono-code text-[#0891B2]">{teamToDelete.id}</span>)?
            </p>

            <div className="p-3 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-xs space-y-1 text-[#64748B]">
              <div className="font-bold text-rose-600">Warning: Permanent Action</div>
              <div>• All submissions recorded for this team will be permanently deleted.</div>
              <div>• Any active buzzer or warning status for this team will be cleared.</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setTeamToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-[#DCE6F0] text-[#172033] font-bold text-xs cursor-pointer"
              >
                CANCEL
              </button>
              <button
                disabled={removeTeamLoading}
                onClick={handleConfirmRemoveTeam}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-tech tracking-wider disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {removeTeamLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>REMOVING...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>PERMANENTLY REMOVE</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: SAFE RESET CONFIRMATION
          ========================================== */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-rose-200 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-tech text-base font-bold tracking-wider">
                CONFIRM DESTRUCTIVE EVENT RESET
              </h3>
            </div>

            <p className="text-xs text-[#172033] leading-relaxed">
              This action will permanently erase all team submissions, reset all scores to 0, unlock locked teams, and revert the competition back to Round 1 Waiting state.
            </p>

            <div className="p-3 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-xs font-mono-code text-[#64748B]">
              Type <span className="text-rose-600 font-bold">RESET TECH BRIDGE</span> to confirm:
            </div>

            <input
              type="text"
              value={resetConfirmInput}
              onChange={(e) => setResetConfirmInput(e.target.value)}
              placeholder="RESET TECH BRIDGE"
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-rose-300 rounded-xl text-sm font-mono-code text-rose-700 focus:outline-none focus:border-rose-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setResetConfirmInput('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-[#DCE6F0] text-[#172033] font-bold text-xs cursor-pointer"
              >
                CANCEL
              </button>
              <button
                disabled={resetConfirmInput !== 'RESET TECH BRIDGE'}
                onClick={async () => {
                  await sendControl('reset', { confirmation: resetConfirmInput });
                  setShowResetModal(false);
                  setResetConfirmInput('');
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-tech tracking-wider disabled:opacity-40 cursor-pointer shadow-xs"
              >
                PERMANENTLY RESET EVENT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
