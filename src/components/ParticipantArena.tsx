import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Send, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  Smartphone, 
  Trophy, 
  User, 
  Users, 
  School, 
  Phone, 
  Sparkles,
  RefreshCw,
  Maximize2,
  BookOpen,
  FileText,
  Check,
  X,
  ShieldCheck,
  LogOut,
  ArrowRight,
  ArrowLeft,
  Award,
  Download,
  Lightbulb,
  MessageSquare,
  Star,
  Sun
} from 'lucide-react';
import { EventState, PublicQuestion, Team, LeaderboardEntry, TeamCertificateData, RoundNumber } from '../types';
import { RebusClueRenderer } from './RebusClueRenderer';
import { CertificateRenderer } from './CertificateRenderer';
import { playBuzzerSound, playSuccessChime, triggerCelebrationConfetti } from '../utils/vfx';
import { useScreenWakeLock, acquireWakeLock, releaseWakeLock } from '../utils/wakeLock';

interface ParticipantArenaProps {
  eventState: EventState | null;
  currentQuestion: PublicQuestion | null;
  remainingSeconds: number;
  leaderboard: LeaderboardEntry[] | null;
  onRefreshState: () => void;
}

export const ParticipantArena: React.FC<ParticipantArenaProps> = ({
  eventState,
  currentQuestion,
  remainingSeconds,
  leaderboard,
  onRefreshState,
}) => {
  // Team state stored locally to simulate installed Android client session
  const [currentTeam, setCurrentTeam] = useState<Team | null>(() => {
    try {
      const saved = localStorage.getItem('techbridge_team_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Registration / Join Form states
  const [isRegisterMode, setIsRegisterMode] = useState(true);
  const [teamName, setTeamName] = useState('');
  const [participant1, setParticipant1] = useState('');
  const [participant2, setParticipant2] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [year, setYear] = useState('3rd Year');
  const [phone, setPhone] = useState('');
  const [joinTeamId, setJoinTeamId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Contest Interaction states
  const [answerInput, setAnswerInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, { answer: string; isCorrect: boolean }>>(() => {
    try {
      const saved = localStorage.getItem('techbridge_submitted_answers');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  // Anti-Cheat Warning Modal (Strict 2-Violation System)
  const [antiCheatWarning, setAntiCheatWarning] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  // Dedicated Screenshot Prohibited Warning Modal
  const [screenshotWarning, setScreenshotWarning] = useState(false);

  // Full-Screen Security Blackout Shield State (Active upon external app switch, blur, or screenshot)
  const [securityShieldActive, setSecurityShieldActive] = useState(false);
  const [shieldReason, setShieldReason] = useState<string>('');
  const lastAwayTimestampRef = useRef<number | null>(null);

  // Responsive Fullscreen Frame Mode (adapts automatically to mobile or laptop size)
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);

  // Round Buzzer states
  const [buzzerLoading, setBuzzerLoading] = useState(false);
  const [buzzerFeedback, setBuzzerFeedback] = useState<string | null>(null);

  // Certificate Modal & Data states
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [teamCertificate, setTeamCertificate] = useState<TeamCertificateData | null>(null);
  const [certificateLoading, setCertificateLoading] = useState(false);

  // Participant Feedback Modal states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackDepth, setFeedbackDepth] = useState(5);
  const [feedbackDesign, setFeedbackDesign] = useState(5);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const handleFetchCertificate = async () => {
    if (!currentTeam) return;
    setCertificateLoading(true);
    try {
      const res = await fetch(`/api/certificate/team/${currentTeam.id}`);
      if (res.ok) {
        const data = await res.json();
        setTeamCertificate(data.certificate);
        setShowCertificateModal(true);
        triggerCelebrationConfetti();
        playSuccessChime();
      }
    } catch {
      // ignore
    } finally {
      setCertificateLoading(false);
    }
  };

  // Fullscreen Mode Helper (Cross-browser, Mobile & Laptop aware)
  const [isFullscreen, setIsFullscreen] = useState(false);
  const requestFullscreenMode = () => {
    try {
      const doc = document as any;
      const docEl = document.documentElement as any;
      if (!doc.fullscreenElement && !doc.webkitFullscreenElement && !doc.mozFullScreenElement && !doc.msFullscreenElement) {
        if (docEl.requestFullscreen) {
          docEl.requestFullscreen().catch(() => {});
        } else if (docEl.webkitRequestFullscreen) {
          docEl.webkitRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
          docEl.mozRequestFullScreen();
        } else if (docEl.msRequestFullscreen) {
          docEl.msRequestFullscreen();
        }
      }
    } catch {
      // ignore
    }
  };

  // Screen Wake Lock: Automatically prevent screen timeout when participant enters competition arena
  const { isActive: isWakeLockActive, acquire: reacquireWakeLock, release: releaseScreenWakeLock } = useScreenWakeLock(Boolean(currentTeam));

  // Auto-adapt fullscreen & screen awake experience upon candidate login/registration
  const autoEnterFullscreenOnLogin = () => {
    setIsPhoneFrame(false);
    requestFullscreenMode();
    acquireWakeLock();
  };

  // Submit Feedback Handler
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam) return;
    setFeedbackSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: currentTeam.id,
          teamName: currentTeam.name,
          college: currentTeam.college,
          rating: feedbackRating,
          questionQuality: feedbackDepth,
          rebusDesign: feedbackDesign,
          comments: feedbackComments.trim(),
        }),
      });
      if (res.ok) {
        setFeedbackSuccess(true);
        setTimeout(() => {
          setShowFeedbackModal(false);
          setFeedbackSuccess(false);
        }, 2000);
      }
    } catch {
      // network silent
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // Show Leaderboard Modal
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);

  // Contest Rules Modal (displayed automatically on login)
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [hasAcknowledgedRules, setHasAcknowledgedRules] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('techbridge_rules_acknowledged') === 'true';
    } catch {
      return false;
    }
  });

  // Prompt rules modal automatically if user enters arena without prior acknowledgment
  useEffect(() => {
    if (currentTeam && !hasAcknowledgedRules) {
      setShowRulesModal(true);
    }
  }, [currentTeam, hasAcknowledgedRules]);

  const handleAcknowledgeRules = () => {
    setHasAcknowledgedRules(true);
    try {
      sessionStorage.setItem('techbridge_rules_acknowledged', 'true');
    } catch {
      // ignore
    }
    setShowRulesModal(false);
    autoEnterFullscreenOnLogin();
  };

  // Automatically ensure fullscreen and adaptive screen size whenever a team is logged in
  useEffect(() => {
    if (currentTeam) {
      autoEnterFullscreenOnLogin();

      // One-time gesture listener in case browser required direct user interaction
      const handleUserGesture = () => {
        requestFullscreenMode();
        window.removeEventListener('click', handleUserGesture);
        window.removeEventListener('touchstart', handleUserGesture);
      };
      window.addEventListener('click', handleUserGesture, { once: true });
      window.addEventListener('touchstart', handleUserGesture, { once: true });

      return () => {
        window.removeEventListener('click', handleUserGesture);
        window.removeEventListener('touchstart', handleUserGesture);
      };
    }
  }, [currentTeam?.id]);

  // Participant Logout Modal States (Requires submitting 2 times and entering EXIT text)
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutStep, setLogoutStep] = useState<1 | 2>(1);
  const [logoutExitInput, setLogoutExitInput] = useState('');
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const handleOpenLogoutModal = () => {
    setLogoutStep(1);
    setLogoutExitInput('');
    setLogoutError(null);
    setShowLogoutModal(true);
  };

  const handleCloseLogoutModal = () => {
    setShowLogoutModal(false);
    setLogoutStep(1);
    setLogoutExitInput('');
    setLogoutError(null);
  };

  const handleLogoutStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (logoutExitInput.trim().toUpperCase() !== 'EXIT') {
      setLogoutError('Verification failed: You must enter the exact word EXIT to continue.');
      return;
    }
    setLogoutError(null);
    setLogoutStep(2);
  };

  const handleFinalLogout = () => {
    try {
      localStorage.removeItem('techbridge_team_session');
      sessionStorage.removeItem('techbridge_rules_acknowledged');
    } catch {
      // ignore
    }
    releaseScreenWakeLock();
    releaseWakeLock();
    setHasAcknowledgedRules(false);
    setCurrentTeam(null);
    setAnswerInput('');
    setSubmissionFeedback(null);
    handleCloseLogoutModal();
    onRefreshState();
  };

  // Sync team session in local storage
  useEffect(() => {
    if (currentTeam) {
      localStorage.setItem('techbridge_team_session', JSON.stringify(currentTeam));
    } else {
      localStorage.removeItem('techbridge_team_session');
    }
  }, [currentTeam]);

  // Live poll team status from server (checks for lock, warn, or disqualification)
  useEffect(() => {
    if (!currentTeam) return;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/team/${currentTeam.id}/status`);
        if (res.ok) {
          const data = await res.json();
          if (
            data.status !== currentTeam.status ||
            data.lockReason !== currentTeam.lockReason ||
            data.warningsCount !== currentTeam.warningsCount
          ) {
            setCurrentTeam(prev => prev ? { ...prev, ...data } : null);
          }
        }
      } catch (err) {
        // silent
      }
    };

    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [currentTeam?.id, currentTeam?.status, currentTeam?.lockReason, currentTeam?.warningsCount]);

  // Sync submitted answers in local storage
  useEffect(() => {
    localStorage.setItem('techbridge_submitted_answers', JSON.stringify(submittedAnswers));
  }, [submittedAnswers]);

  // Reset input when question changes
  useEffect(() => {
    setAnswerInput('');
    setSubmissionFeedback(null);
  }, [currentQuestion?.id]);

  // ==========================================
  // ANTI-CHEAT DETECTION (Client-side enforcement)
  // Strict 2-Violation Lockout System with Instant Blackout Shield
  // Active immediately upon login/entering the competition
  // Blocks: External apps (Gemini, ChatGPT), tab change, blur, screenshot keys, print, inspect
  // ==========================================
  useEffect(() => {
    // ARMED AS SOON AS PARTICIPANT LOGS IN OR ENTERS ARENA
    if (!currentTeam) return;

    const reportViolation = (eventType: string, details: string, timeAway?: number) => {
      const payload = JSON.stringify({
        teamId: currentTeam.id,
        eventType,
        details,
        timeAwaySeconds: timeAway,
      });

      // 1. Try Navigator sendBeacon (guarantees delivery even if tab is minimized or closing)
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        try {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon('/api/anti-cheat', blob);
        } catch {
          // ignore
        }
      }

      // 2. Fetch with keepalive
      fetch('/api/anti-cheat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        lastAwayTimestampRef.current = Date.now();
        reportViolation('APP_BACKGROUND', 'Participant minimized or switched away from the competition tab/app (possible Gemini / ChatGPT / AI tool access).');
        setSecurityShieldActive(true);
        setShieldReason('Tab switch or app minimization detected! Switching away to external apps, AI tools (ChatGPT, Gemini), or other browsers is strictly forbidden. Your screen has been shielded.');
      } else {
        if (lastAwayTimestampRef.current) {
          const awaySec = Math.round((Date.now() - lastAwayTimestampRef.current) / 1000);
          lastAwayTimestampRef.current = null;
          if (awaySec > 1) {
            reportViolation('APP_BACKGROUND', `Participant returned after leaving competition arena for ${awaySec} seconds.`, awaySec);
          }
        }
      }
    };

    const handleFullscreenChange = () => {
      const inFs = Boolean(document.fullscreenElement);
      setIsFullscreen(inFs);
      if (!inFs) {
        reportViolation('FULLSCREEN_EXITED', 'Participant exited fullscreen lockdown mode during competition.');
        setSecurityShieldActive(true);
        setShieldReason('Fullscreen competition mode was exited. Fullscreen lockdown is strictly required to prevent side-by-side search or AI windows.');
      }
    };

    const handleWindowBlur = () => {
      reportViolation('WINDOW_FOCUS_LOST', 'Window focus lost. Split-screen, overlay, or external application activated.');
      setSecurityShieldActive(true);
      setShieldReason('Window focus lost! External applications (ChatGPT, Gemini, search engines, screen clippers) are blocked during competition.');
    };

    const handleResize = () => {
      if (window.innerWidth < 450 && window.innerHeight < 450) {
        reportViolation('MULTI_WINDOW_DETECTED', 'Small viewport dimensions detected (probable multi-window or picture-in-picture).');
        setSecurityShieldActive(true);
        setShieldReason('Multi-window or split-screen mode detected. The competition requires full window view.');
      }
    };

    // Keyboard Anti-Screenshot & DevTools Interception
    const handleKeyDown = (e: KeyboardEvent) => {
      const isPrintScreen = e.key === 'PrintScreen' || e.code === 'PrintScreen';
      const isMacScreenshot = (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5'));
      const isWinSnipping = (e.key === 's' || e.key === 'S') && ((e.metaKey && e.shiftKey) || (e.ctrlKey && e.shiftKey));
      const isPrint = (e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P');
      const isDevTools = e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c'));
      const isViewSource = (e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U');
      const isSavePage = (e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S') && !e.shiftKey;

      if (isPrintScreen || isMacScreenshot || isWinSnipping || isPrint || isDevTools || isViewSource || isSavePage) {
        e.preventDefault();
        e.stopPropagation();

        // Clear clipboard so intercepted screen grab contains nothing
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText('SECURITY BREACH: SCREENSHOTS & CLIPBOARD COPYING ARE BLOCKED BY TECH BRIDGE PROCTOR');
          }
        } catch {}

        const isScreenshot = isPrintScreen || isMacScreenshot || isWinSnipping;
        const triggerType = isScreenshot 
          ? 'SCREENSHOT_ATTEMPTED' 
          : isDevTools 
          ? 'DEV_TOOLS_DETECTED' 
          : 'SUSPICIOUS_TYPING';

        reportViolation(triggerType, `Participant triggered forbidden shortcut: ${e.key} (Blocked by Anti-Cheat)`);
        
        if (isScreenshot) {
          setScreenshotWarning(true);
        } else {
          setSecurityShieldActive(true);
          setShieldReason('Screen capture or developer tool shortcut detected and blocked! Inspecting or navigating away is strictly prohibited.');
        }
      }
    };

    // Prevent context menu (no save image, no inspect image)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Prevent copy on competition text
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      reportViolation('SUSPICIOUS_TYPING', 'Participant attempted to copy arena text to clipboard.');
      setAntiCheatWarning({
        visible: true,
        message: 'Copying questions or clues to clipboard is strictly prohibited.',
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopy);
    };
  }, [currentTeam]);

  // Register Team
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !participant1.trim() || !college.trim() || !phone.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setFormLoading(true);
    setFormError(null);
    try {
      const res = await fetch('/api/team/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: teamName.trim(),
          participant1: participant1.trim(),
          participant2: participant2.trim() || undefined,
          college: college.trim(),
          department: department.trim(),
          year: year.trim(),
          phone: phone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register team');
      }
      setCurrentTeam(data.team);
      autoEnterFullscreenOnLogin();
      setShowRulesModal(true);
      onRefreshState();
    } catch (err: any) {
      setFormError(err.message || 'Registration failed');
    } finally {
      setFormLoading(false);
    }
  };

  // Join Existing Team
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinTeamId.trim()) {
      setFormError('Please enter your Team ID');
      return;
    }

    setFormLoading(true);
    setFormError(null);
    try {
      const res = await fetch('/api/team/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: joinTeamId.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Team login failed');
      }
      setCurrentTeam(data.team);
      autoEnterFullscreenOnLogin();
      setShowRulesModal(true);
      onRefreshState();
    } catch (err: any) {
      setFormError(err.message || 'Login failed');
    } finally {
      setFormLoading(false);
    }
  };

  // Submit Answer
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam || !currentQuestion || !answerInput.trim()) return;

    if (submittedAnswers[currentQuestion.id]) {
      setSubmissionFeedback('You have already submitted an answer for this question.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionFeedback(null);
    try {
      const res = await fetch('/api/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: currentTeam.id,
          questionId: currentQuestion.id,
          answer: answerInput.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Submission rejected by server');
      }

      setSubmittedAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: {
          answer: answerInput.trim(),
          isCorrect: data.isCorrect,
        },
      }));

      const roundPts = currentQuestion.round === 1 ? 1 : currentQuestion.round === 2 ? 2 : 3;
      const ptsEarned = data.pointsAwarded !== undefined ? data.pointsAwarded : roundPts;

      if (data.isCorrect) {
        playSuccessChime();
        triggerCelebrationConfetti();
        setSubmissionFeedback(`CORRECT! +${ptsEarned} ${ptsEarned === 1 ? 'PT' : 'PTS'} awarded to your team tally!`);
      } else {
        setSubmissionFeedback('Answer locked & submitted. Single submission rule enforced.');
      }
      onRefreshState();
    } catch (err: any) {
      setSubmissionFeedback(err.message || 'Submission error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Round Buzzer Press with Web Audio & Microsecond Tie Detection
  const handleBuzzerPress = async () => {
    if (!currentTeam || !currentQuestion || buzzerLoading) return;
    playBuzzerSound();
    setBuzzerLoading(true);
    setBuzzerFeedback(null);
    try {
      const res = await fetch('/api/buzzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: currentTeam.id,
          questionId: currentQuestion.id,
        }),
      });
      const data = await res.json();
      const roundPts = eventState.currentRound === 1 ? 1 : eventState.currentRound === 2 ? 2 : 3;
      if (data.won) {
        if (data.isTie) {
          setBuzzerFeedback(`⚡ SIMULTANEOUS TIE DETECTED! You buzzed simultaneously (+${roundPts} ${roundPts === 1 ? 'PT' : 'PTS'}). Stand by for organizer award.`);
        } else {
          setBuzzerFeedback(`🥇 YOU WON THE BUZZ! (+${roundPts} ${roundPts === 1 ? 'PT' : 'PTS'} if answered correctly). Please speak or submit your answer now.`);
          triggerCelebrationConfetti();
        }
      } else {
        setBuzzerFeedback(data.message || 'BUZZ LOCKED: Another contestant registered first.');
      }
      onRefreshState();
    } catch (err: any) {
      setBuzzerFeedback('Buzzer communication error');
    } finally {
      setBuzzerLoading(false);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentSubmission = currentQuestion ? submittedAnswers[currentQuestion.id] : null;

  // ==========================================
  // VIEW: REGISTRATION / LOGIN
  // ==========================================
  if (!currentTeam) {
    return (
      <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-[#DCE6F0] rounded-2xl p-6 sm:p-8 shadow-md">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#ECFEFF] border border-[#06B6D4]/30 text-[#0891B2] mx-auto flex items-center justify-center mb-3 shadow-sm">
              <Smartphone className="w-6 h-6" />
            </div>
            <h1 className="font-tech text-2xl font-bold text-[#172033] tracking-wider">
              TECH BRIDGE '26
            </h1>
            <p className="text-xs text-[#64748B] mt-1 font-semibold">
              Visual Technical Rebus Challenge • Contestant Portal
            </p>
          </div>

          {/* Toggle Register vs Join */}
          <div className="grid grid-cols-2 p-1 bg-[#F1F5F9] rounded-xl border border-[#DCE6F0] mb-6">
            <button
              id="participant-tab-register"
              type="button"
              onClick={() => { setIsRegisterMode(true); setFormError(null); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                isRegisterMode ? 'bg-white text-[#0891B2] shadow-sm font-bold border border-[#DCE6F0]' : 'text-[#64748B] hover:text-[#172033]'
              }`}
            >
              New Team Registration
            </button>
            <button
              id="participant-tab-join"
              type="button"
              onClick={() => { setIsRegisterMode(false); setFormError(null); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                !isRegisterMode ? 'bg-white text-[#0891B2] shadow-sm font-bold border border-[#DCE6F0]' : 'text-[#64748B] hover:text-[#172033]'
              }`}
            >
              Enter with Team ID
            </button>
          </div>

          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          {isRegisterMode ? (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#172033] mb-1">
                  Team Name *
                </label>
                <div className="relative">
                  <input
                    id="reg-team-name"
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. AlgoKnights"
                    className="w-full px-3 py-2 bg-white border border-[#DCE6F0] rounded-lg text-sm text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#172033] mb-1">
                    Participant 1 (Lead) *
                  </label>
                  <input
                    id="reg-p1-name"
                    type="text"
                    required
                    value={participant1}
                    onChange={(e) => setParticipant1(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-3 py-2 bg-white border border-[#DCE6F0] rounded-lg text-sm text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#172033] mb-1">
                    Participant 2 (Optional)
                  </label>
                  <input
                    id="reg-p2-name"
                    type="text"
                    value={participant2}
                    onChange={(e) => setParticipant2(e.target.value)}
                    placeholder="Teammate Name"
                    className="w-full px-3 py-2 bg-white border border-[#DCE6F0] rounded-lg text-sm text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#172033] mb-1">
                  College Name *
                </label>
                <input
                  id="reg-college"
                  type="text"
                  required
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="Engineering College Name"
                  className="w-full px-3 py-2 bg-white border border-[#DCE6F0] rounded-lg text-sm text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#06B6D4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#172033] mb-1">
                    Department
                  </label>
                  <select
                    id="reg-dept"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#DCE6F0] rounded-lg text-xs text-[#172033] focus:outline-none focus:border-[#06B6D4]"
                  >
                    <option>Computer Science & Engineering</option>
                    <option>Information Technology</option>
                    <option>Artificial Intelligence & Data Science</option>
                    <option>Cybersecurity</option>
                    <option>Electronics & Communication</option>
                    <option>Other Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#172033] mb-1">
                    Year of Study
                  </label>
                  <select
                    id="reg-year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#DCE6F0] rounded-lg text-xs text-[#172033] focus:outline-none focus:border-[#06B6D4]"
                  >
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#172033] mb-1">
                  Mobile Phone Number *
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-2 bg-white border border-[#DCE6F0] rounded-lg text-sm text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#06B6D4]"
                />
              </div>

              <button
                id="btn-register-submit"
                type="submit"
                disabled={formLoading}
                className="w-full mt-4 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white font-bold text-sm tracking-wide transition-all shadow-md hover:from-[#0891B2] hover:to-[#1D4ED8] disabled:opacity-50 cursor-pointer"
              >
                {formLoading ? 'GENERATING TEAM ID...' : 'REGISTER & ENTER ARENA'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#172033] mb-1">
                  Unique Team ID *
                </label>
                <input
                  id="join-team-id"
                  type="text"
                  required
                  value={joinTeamId}
                  onChange={(e) => setJoinTeamId(e.target.value.toUpperCase())}
                  placeholder="e.g. TB-7001"
                  className="w-full px-4 py-3 bg-[#ECFEFF] border border-[#06B6D4]/40 rounded-xl text-center text-lg font-mono-code font-bold tracking-widest text-[#0891B2] focus:outline-none focus:border-[#06B6D4]"
                />
                <p className="text-[11px] text-[#64748B] text-center mt-2">
                  Enter the 6-character Team ID assigned upon registration.
                </p>
              </div>

              <button
                id="btn-join-submit"
                type="submit"
                disabled={formLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white font-bold text-sm tracking-wide transition-all shadow-md hover:from-[#0891B2] hover:to-[#1D4ED8] disabled:opacity-50 cursor-pointer"
              >
                {formLoading ? 'VERIFYING...' : 'RESTORE ARENA SESSION'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // MODAL: 2-STEP LOGOUT WITH "EXIT" VERIFICATION
  // ==========================================
  const renderLogoutModal = () => {
    if (!showLogoutModal) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
        <div className="w-full max-w-md bg-white border border-[#DCE6F0] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
          {/* Modal Header */}
          <div className="flex items-start justify-between pb-3 border-b border-[#DCE6F0]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 shadow-sm">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-tech text-base font-bold text-[#172033] tracking-wide">
                    TERMINAL LOGOUT
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-code font-bold bg-rose-100 text-rose-700 border border-rose-300">
                    2-STEP VERIFY
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B]">
                  Autonomous College of Engineering & Technology • CSE
                </p>
              </div>
            </div>
            <button
              onClick={handleCloseLogoutModal}
              className="text-[#64748B] hover:text-[#172033] p-1 rounded-lg transition-colors cursor-pointer"
              title="Cancel and stay in arena"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step Progress Indicators */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono-code">
            <div
              className={`p-2 rounded-xl border transition-all ${
                logoutStep === 1
                  ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold'
              }`}
            >
              <div className="text-[10px] text-[#64748B]">SUBMISSION 1 OF 2</div>
              <div>{logoutStep > 1 ? '✓ "EXIT" Confirmed' : '1. Enter "EXIT"'}</div>
            </div>
            <div
              className={`p-2 rounded-xl border transition-all ${
                logoutStep === 2
                  ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                  : 'bg-[#F8FAFC] border-[#DCE6F0] text-[#64748B]'
              }`}
            >
              <div className="text-[10px] text-[#64748B]">SUBMISSION 2 OF 2</div>
              <div>2. Final Confirmation</div>
            </div>
          </div>

          {/* STEP 1: Enter "EXIT" and Submit Confirmation 1 */}
          {logoutStep === 1 && (
            <form onSubmit={handleLogoutStep1} className="space-y-4">
              <div className="p-3.5 bg-[#F8FAFC] border border-[#DCE6F0] rounded-2xl text-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-700 font-semibold text-[11px]">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>Accidental Exit Protection</span>
                </div>
                <p className="text-[#172033] leading-relaxed">
                  You are attempting to log out from team session:
                  <span className="block mt-1 font-bold text-[#0891B2] font-mono-code">
                    {currentTeam?.name} ({currentTeam?.id})
                  </span>
                </p>
                <p className="text-[#64748B] text-[11px]">
                  To prevent accidental exits during live competition, please submit confirmation twice and enter the required exit text.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="input-logout-exit" className="text-xs font-mono-code text-[#172033] font-semibold">
                    ENTER EXIT TEXT *
                  </label>
                  <span className="text-[10px] font-mono-code text-[#64748B]">
                    Type: <strong className="text-rose-600">EXIT</strong>
                  </span>
                </div>

                <div className="relative">
                  <input
                    id="input-logout-exit"
                    type="text"
                    autoFocus
                    required
                    value={logoutExitInput}
                    onChange={(e) => {
                      setLogoutExitInput(e.target.value);
                      if (logoutError) setLogoutError(null);
                    }}
                    placeholder="Type EXIT to continue"
                    className="w-full px-4 py-2.5 bg-white border border-[#DCE6F0] rounded-xl text-[#172033] font-mono-code font-bold tracking-widest text-center text-sm focus:outline-none focus:border-rose-500 transition-colors uppercase placeholder:normal-case placeholder:font-normal placeholder:tracking-normal placeholder:text-[#94A3B8]"
                  />
                  {logoutExitInput.trim().toUpperCase() === 'EXIT' && (
                    <div className="absolute right-3 top-2.5 text-emerald-600 flex items-center gap-1 text-[11px] font-mono-code font-bold">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {logoutExitInput.trim().toUpperCase() === 'EXIT' ? (
                  <p className="text-[11px] text-emerald-700 font-mono-code flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Text verified. Click below to submit confirmation 1.
                  </p>
                ) : (
                  <p className="text-[11px] text-[#64748B] font-mono-code">
                    Submit button will activate once "EXIT" is entered.
                  </p>
                )}

                {logoutError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                    <span>{logoutError}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#DCE6F0]">
                <button
                  type="button"
                  onClick={handleCloseLogoutModal}
                  className="px-4 py-2.5 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#172033] font-semibold text-xs transition-colors cursor-pointer"
                >
                  CANCEL & STAY
                </button>
                <button
                  id="btn-submit-logout-step1"
                  type="submit"
                  disabled={logoutExitInput.trim().toUpperCase() !== 'EXIT'}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-tech font-bold text-xs tracking-wider transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <span>SUBMIT CONFIRMATION (1/2)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Final Confirmation (Submission 2 of 2) */}
          {logoutStep === 2 && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-mono-code">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Text "EXIT" Verified • Submission 1 of 2 Complete</span>
              </div>

              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-2.5 text-[#172033]">
                <div className="flex items-center gap-2 text-rose-700 font-tech font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>SUBMIT 2ND CONFIRMATION TO EXIT</span>
                </div>
                <p className="leading-relaxed">
                  Please submit your final confirmation (2 of 2) to log out from this device:
                </p>
                <div className="p-2.5 bg-white rounded-xl font-mono-code text-[11px] space-y-1 text-[#64748B] border border-[#DCE6F0]">
                  <div>Team Name: <strong className="text-[#0891B2]">{currentTeam?.name}</strong></div>
                  <div>Team ID: <strong className="text-[#172033]">{currentTeam?.id}</strong></div>
                  <div>College: <span className="text-[#64748B]">{currentTeam?.college}</span></div>
                </div>
                <p className="text-[11px] text-[#64748B]">
                  You can restore your arena session at any time with Team ID: <strong className="text-[#0891B2] font-mono-code">{currentTeam?.id}</strong>.
                </p>
              </div>

              <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-[#DCE6F0]">
                <button
                  type="button"
                  onClick={() => setLogoutStep(1)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#172033] font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>BACK TO STEP 1</span>
                </button>
                <button
                  id="btn-submit-logout-step2"
                  type="button"
                  onClick={handleFinalLogout}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-tech font-bold text-xs tracking-wider transition-all flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>SUBMIT FINAL LOGOUT (2/2)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ==========================================
  // VIEW: PARTICIPANT LOCKED BY ORGANIZER
  // ==========================================
  if (currentTeam.status === 'LOCKED') {
    return (
      <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#F5F9FC]">
        <div className="w-full max-w-md bg-white border border-[#DCE6F0] rounded-3xl p-8 shadow-md text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-tech text-xl font-bold text-[#172033] tracking-wider">
              ACCESS LOCKED BY ORGANIZER
            </h2>
            <p className="text-xs text-purple-700 font-mono-code mt-1 font-semibold">
              TECH BRIDGE '26 • Security Enforcement
            </p>
          </div>
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-900 text-left space-y-2">
            <div className="font-mono-code font-bold uppercase text-[10px] text-purple-700">
              REASON FOR LOCKOUT
            </div>
            <p className="text-xs leading-relaxed">
              {currentTeam.lockReason || 'Access to answering, buzzer, and round participation has been locked by symposium administrators due to repeated anti-cheat anomalies or organizer intervention.'}
            </p>
          </div>
          <div className="p-3 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-xs font-mono-code text-[#64748B] flex items-center justify-between">
            <span>TEAM ID: <strong className="text-[#0891B2]">{currentTeam.id}</strong></span>
            <span className="font-semibold text-[#172033]">{currentTeam.name}</span>
          </div>
          <p className="text-[11px] text-[#64748B] font-mono-code">
            Please report to the CSE Department symposium organizer desk in person to request review.
          </p>
          <button
            id="btn-locked-logout"
            onClick={handleOpenLogoutModal}
            className="w-full py-2.5 px-4 rounded-xl bg-[#F1F5F9] hover:bg-rose-50 text-[#172033] hover:text-rose-600 font-mono-code text-xs font-semibold border border-[#DCE6F0] hover:border-rose-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>LOGOUT & EXIT TERMINAL</span>
          </button>
        </div>
        {renderLogoutModal()}
      </div>
    );
  }

  // ==========================================
  // VIEW: PARTICIPANT DISQUALIFIED
  // ==========================================
  if (currentTeam.status === 'DISQUALIFIED') {
    return (
      <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#F5F9FC]">
        <div className="w-full max-w-md bg-white border border-rose-200 rounded-3xl p-8 shadow-md text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-tech text-xl font-bold text-rose-600 tracking-wider">
              TEAM DISQUALIFIED
            </h2>
            <p className="text-xs text-[#64748B] font-mono-code mt-1">
              TECH BRIDGE '26 • Competition Rules Violation
            </p>
          </div>
          <p className="text-xs text-[#172033] leading-relaxed">
            {currentTeam.lockReason || 'This team has been disqualified from participating in TECH BRIDGE \'26 by the organizing committee.'}
          </p>
          <div className="p-3 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-xs font-mono-code text-[#64748B] flex items-center justify-between">
            <span>TEAM ID: <strong className="text-rose-600">{currentTeam.id}</strong></span>
            <span className="font-semibold text-[#172033]">{currentTeam.name}</span>
          </div>

          {/* Certificate Award Option for Eliminated/Disqualified Teams */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-left">
            <div className="text-xs font-bold text-amber-800 font-tech flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600" />
              OFFICIAL SYMPOSIUM CERTIFICATE
            </div>
            <p className="text-[11px] text-[#64748B]">
              Your official participation record is saved. You can claim and download your verified symposium participation certificate.
            </p>
            <button
              id="btn-eliminated-certificate"
              onClick={handleFetchCertificate}
              disabled={certificateLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs font-tech tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>{certificateLoading ? 'GENERATING CERTIFICATE...' : 'CLAIM & VIEW CERTIFICATE'}</span>
            </button>
          </div>

          <button
            id="btn-disqualified-logout"
            onClick={handleOpenLogoutModal}
            className="w-full py-2.5 px-4 rounded-xl bg-[#F1F5F9] hover:bg-rose-50 text-[#172033] hover:text-rose-600 font-mono-code text-xs font-semibold border border-[#DCE6F0] hover:border-rose-200 flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>LOGOUT & EXIT TERMINAL</span>
          </button>
        </div>
        {renderLogoutModal()}
      </div>
    );
  }

  // ==========================================
  // VIEW: PARTICIPANT CONTEST ARENA
  // ==========================================
  return (
    <div className="w-full min-h-[calc(100vh-4rem)] p-4 flex flex-col items-center">
      {/* Device Viewport Selector */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-3 text-xs text-[#64748B]">
        <div className="flex items-center gap-2">
          <span className="font-mono-code text-[#0891B2] font-bold">{currentTeam.id}</span>
          <span>•</span>
          <span className="text-[#172033] font-semibold truncate max-w-[180px]">{currentTeam.name}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={() => setShowRulesModal(true)}
            className="flex items-center gap-1.5 text-[#0891B2] hover:text-[#06B6D4] px-2.5 py-1 rounded-lg bg-white border border-[#06B6D4]/30 font-medium transition-all shadow-sm cursor-pointer"
            title="View Official Symposium Rules & Regulations"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Rules</span>
          </button>
          <button
            onClick={() => setShowLeaderboardModal(true)}
            className="flex items-center gap-1 text-[#64748B] hover:text-[#0891B2] px-2 py-1 rounded-lg bg-white border border-[#DCE6F0] shadow-sm cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Leaderboard</span>
          </button>
          <button
            id="btn-nav-certificate"
            onClick={handleFetchCertificate}
            disabled={certificateLoading}
            className="flex items-center gap-1.5 text-amber-700 hover:text-amber-800 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 font-medium transition-all shadow-sm cursor-pointer"
            title="View & Download Official Symposium Certificate"
          >
            <Award className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Certificate</span>
          </button>
          {eventState?.feedbackActive && (
            <button
              id="btn-nav-feedback"
              onClick={() => setShowFeedbackModal(true)}
              className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-300 font-medium transition-all animate-pulse shadow-sm cursor-pointer"
              title="Submit Symposium Participant Feedback"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Feedback</span>
            </button>
          )}
          {/* Screen Wake Lock Status / Control */}
          <button
            id="btn-nav-wakelock"
            onClick={() => {
              if (isWakeLockActive) {
                releaseScreenWakeLock();
              } else {
                reacquireWakeLock();
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono-code transition-all shadow-sm cursor-pointer ${
              isWakeLockActive 
                ? 'bg-amber-50 border-amber-300 text-amber-800' 
                : 'bg-white border-[#DCE6F0] text-[#64748B] hover:text-[#172033]'
            }`}
            title={isWakeLockActive ? "Screen Awake Active: Display will NOT sleep or timeout during the competition" : "Click to activate continuous screen awake"}
          >
            <Sun className={`w-3.5 h-3.5 ${isWakeLockActive ? 'text-amber-500 animate-pulse' : 'text-[#64748B]'}`} />
            <span className="hidden md:inline">{isWakeLockActive ? 'Screen Awake' : 'Keep Awake'}</span>
            {isWakeLockActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />}
          </button>
          <button
            id="btn-nav-fullscreen"
            onClick={requestFullscreenMode}
            className="hidden sm:flex items-center gap-1 text-[#64748B] hover:text-[#0891B2] px-2 py-1 rounded-lg bg-white border border-[#DCE6F0] shadow-sm cursor-pointer"
            title="Enter Fullscreen Anti-Cheat Mode"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{isFullscreen ? 'Fullscreen' : 'Focus'}</span>
          </button>
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="flex items-center gap-1 text-[#64748B] hover:text-[#0891B2] px-2 py-1 rounded-lg bg-white border border-[#DCE6F0] shadow-sm cursor-pointer"
          >
            {isPhoneFrame ? <Maximize2 className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isPhoneFrame ? 'Full Width' : 'Simulate Phone'}</span>
          </button>
          <button
            id="btn-participant-logout"
            onClick={handleOpenLogoutModal}
            className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 px-2.5 py-1 rounded-lg bg-white border border-rose-200 hover:bg-rose-50 transition-all font-medium shadow-sm cursor-pointer"
            title="Log out of participant session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Container (Adaptive Fullscreen for Mobile or Laptop) */}
      <div className={`w-full transition-all duration-300 ${
        isPhoneFrame 
          ? 'max-w-md bg-white border border-[#DCE6F0] rounded-3xl p-4 sm:p-5 shadow-md my-auto min-h-[640px]' 
          : 'w-full max-w-full md:max-w-4xl xl:max-w-5xl bg-white border border-[#DCE6F0] rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-md'
      }`}>
        {/* Mobile Status Bar simulation */}
        <div className="w-full flex items-center justify-between border-b border-[#DCE6F0] pb-3 mb-4">
          <div>
            <span className="text-[10px] font-mono-code tracking-wider text-[#64748B] uppercase font-bold">
              COMPETITOR ARENA
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-tech text-base font-bold text-[#172033]">
                ROUND {eventState?.currentRound || 1}
              </span>
              <span className="text-xs text-[#0891B2] font-mono-code font-bold">
                {currentQuestion ? `• Q${currentQuestion.questionNumber.toString().padStart(2, '0')}` : ''}
              </span>
              {isWakeLockActive && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono-code font-semibold bg-amber-50 border border-amber-200 text-amber-700">
                  <Sun className="w-2.5 h-2.5 text-amber-500 animate-pulse" />
                  NO SLEEP
                </span>
              )}
            </div>
          </div>

          {/* Real-time Countdown Timer */}
          <div className="text-right">
            <span className="text-[10px] font-mono-code text-[#64748B] uppercase font-bold">
              REMAINING
            </span>
            <div className={`font-mono-code text-base font-bold ${
              remainingSeconds <= 60 ? 'text-rose-600 animate-pulse' : 'text-[#0891B2]'
            }`}>
              {formatTimer(remainingSeconds)}
            </div>
          </div>
        </div>

        {/* Status & Security Alerts Banners */}
        {currentTeam.warningsCount > 0 && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold font-tech tracking-wider uppercase text-[11px] block text-amber-800">
                SECURITY NOTICE • {currentTeam.warningsCount} VIOLATION{currentTeam.warningsCount > 1 ? 'S' : ''} RECORDED
              </span>
              <span className="text-[11px] leading-relaxed block text-amber-700 mt-0.5">
                {currentTeam.warningsCount >= 2
                  ? 'CRITICAL WARNING: Multiple security anomalies logged. A 3rd violation triggers automatic account lockout.'
                  : 'Anti-cheat monitoring recorded window loss or app minimization. Keep the app focused in foreground.'}
              </span>
            </div>
          </div>
        )}

        {eventState?.eventLocked && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Entire competition arena is locked by organizer command desk.</span>
          </div>
        )}

        {eventState?.roundLocked?.[eventState.currentRound] && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Round {eventState.currentRound} is currently locked by organizer.</span>
          </div>
        )}

        {eventState?.isTestMode && (
          <div className="mb-4 py-1.5 px-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] font-mono-code text-amber-800 text-center font-bold">
            DRY RUN / TEST MODE ACTIVE • SCORES ARE NOT COUNTED TOWARDS FINAL STANDINGS
          </div>
        )}

        {/* CONDITION 1: WAITING FOR ORGANIZER */}
        {eventState?.status !== 'RUNNING' ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#ECFEFF] border border-[#06B6D4]/30 flex items-center justify-center text-[#0891B2] mb-4 animate-pulse shadow-sm">
              <RefreshCw className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <h2 className="font-tech text-xl font-bold text-[#172033] tracking-wider">
              {eventState?.status === 'PAUSED' ? 'ROUND PAUSED' : 'WAITING FOR ORGANIZER'}
            </h2>
            <p className="text-xs text-[#64748B] max-w-xs mt-2 leading-relaxed">
              {eventState?.status === 'PAUSED'
                ? 'The symposium coordinator has temporarily paused the timer. Stand by.'
                : 'Your team is registered and connected. Questions will automatically appear when the round starts.'}
            </p>

            {/* Team details preview card */}
            <div className="w-full mt-6 p-4 rounded-xl bg-[#F8FAFC] border border-[#DCE6F0] text-left">
              <div className="text-[11px] font-mono-code text-[#0891B2] font-bold mb-2">
                AUTHENTICATED TEAM PROFILE
              </div>
              <div className="text-sm font-bold text-[#172033]">{currentTeam.name}</div>
              <div className="text-xs text-[#64748B] mt-0.5">{currentTeam.college}</div>
              <div className="text-xs text-[#64748B] mt-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#64748B]" />
                <span>{currentTeam.participant1} {currentTeam.participant2 ? `& ${currentTeam.participant2}` : ''}</span>
              </div>
            </div>
          </div>
        ) : (
          /* CONDITION 2: LIVE COMPETITION ROUND */
          <div className="w-full flex flex-col">
            {currentQuestion ? (
              <>
                {/* Domain & Point Badge */}
                <div className="w-full flex items-center justify-between mb-3">
                  <span className="text-xs text-[#64748B] font-mono-code font-semibold truncate max-w-[200px]">
                    {currentQuestion.domain}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono-code font-bold bg-[#ECFEFF] border border-[#06B6D4]/30 text-[#0891B2]">
                    +{currentQuestion.round === 1 ? 1 : currentQuestion.round === 2 ? 2 : 3} {currentQuestion.round === 1 ? 'PT' : 'PTS'}
                  </span>
                </div>

                {/* Rebus Clue Graphic Container */}
                <div className="w-full mb-4">
                  <RebusClueRenderer
                    panels={currentQuestion.cluePanels}
                    customImageUrl={currentQuestion.customImageUrl}
                    images={currentQuestion.images}
                    watermarkText={`TEAM: ${currentTeam?.id || ''} • ${currentTeam?.name || ''} • ${currentTeam?.participant1 || ''}`}
                    displayMode={eventState.clueDisplayMode || 'realistic'}
                  />
                </div>

                {/* LIVE DIGITAL BUZZER (Admin-controlled per round) */}
                {(() => {
                  const isBuzzerActiveForRound = Boolean(
                    eventState.buzzerRoundEnabled?.[eventState.currentRound as RoundNumber] ?? (eventState.currentRound === 3)
                  );
                  if (!isBuzzerActiveForRound && !eventState.buzzerActive) return null;

                  const roundPoints = eventState.currentRound === 1 ? 1 : eventState.currentRound === 2 ? 2 : 3;

                  return (
                    <div className="w-full flex flex-col items-center my-4 py-2 border-t border-[#DCE6F0]">
                      <div className="text-center mb-3">
                        <div className="text-xs font-mono-code uppercase text-rose-600 font-bold tracking-wider flex items-center justify-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${eventState.buzzerActive ? 'bg-rose-500 animate-ping' : 'bg-slate-400'}`} />
                          ROUND {eventState.currentRound}: LIVE DIGITAL BUZZER (+{roundPoints} {roundPoints === 1 ? 'PT' : 'PTS'})
                        </div>
                        <div className="text-[11px] text-[#64748B]">
                          First atomic server timestamp unlocks answer submission
                        </div>
                      </div>

                      {/* Simultaneous Microsecond Tie Detected Alert */}
                      {eventState.buzzerTie && (
                        <div className="w-full mb-3 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-center animate-pulse shadow-sm">
                          <div className="text-xs font-bold font-tech flex items-center justify-center gap-1.5 text-amber-800">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            SIMULTANEOUS TIE DETECTED!
                          </div>
                          <p className="text-[11px] text-amber-700 mt-0.5">
                            Multiple teams buzzed within the 85ms microsecond delta window! Stand by for organizer award.
                          </p>
                        </div>
                      )}

                      {/* Big Digital Buzzer Button with VFX Aura & Sound */}
                      <button
                        id="btn-digital-buzzer"
                        onClick={handleBuzzerPress}
                        disabled={buzzerLoading || !eventState.buzzerActive}
                        className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center font-tech font-extrabold text-xl tracking-wider transition-all duration-200 select-none shadow-xl active:scale-95 cursor-pointer ${
                          eventState.buzzerWinner?.teamId === currentTeam.id
                            ? 'bg-emerald-600 border-emerald-300 text-white animate-bounce'
                            : eventState.buzzerActive
                            ? 'bg-rose-600 hover:bg-rose-500 border-rose-300 text-white animate-pulse ring-4 ring-rose-300'
                            : 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {eventState.buzzerWinner?.teamId === currentTeam.id ? (
                          <>
                            <span>YOU WON</span>
                            <span className="text-[10px] font-mono-code font-bold text-emerald-100">
                              +{roundPoints} {roundPoints === 1 ? 'PT' : 'PTS'} • ANSWER
                            </span>
                          </>
                        ) : eventState.buzzerActive ? (
                          <>
                            <span className="text-2xl">BUZZ</span>
                            <span className="text-[10px] font-mono-code font-normal">
                              +{roundPoints} {roundPoints === 1 ? 'PT' : 'PTS'} • TAP FAST
                            </span>
                          </>
                        ) : (
                          <>
                            <span>LOCKED</span>
                            <span className="text-[10px] font-mono-code font-normal">BUZZ CLOSED</span>
                          </>
                        )}
                      </button>

                      {buzzerFeedback && (
                        <div className="mt-3 text-xs font-mono-code text-center text-amber-800 font-semibold p-2 bg-amber-50 rounded-lg border border-amber-200">
                          {buzzerFeedback}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* UNLOCKED PROGRESSIVE CLUES */}
                {currentQuestion.clues && currentQuestion.clues.length > 0 && (
                  <div className="w-full my-3 p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-mono-code font-bold text-amber-800">
                      <Lightbulb className="w-4 h-4 text-amber-600 animate-pulse" />
                      <span>UNLOCKED PROGRESSIVE CLUES ({currentQuestion.clues.length})</span>
                    </div>
                    <div className="space-y-1.5">
                      {currentQuestion.clues.map((c, i) => (
                        <div key={c.id || i} className="text-xs text-amber-900 bg-white p-2.5 rounded-lg border border-amber-200 flex items-start gap-2 shadow-xs">
                          <span className="font-mono-code text-amber-700 font-bold shrink-0">#{i + 1}:</span>
                          <span className="leading-relaxed">{c.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ONE-SUBMISSION ANSWER FORM */}
                <div className="w-full mt-2 pt-3 border-t border-[#DCE6F0]">
                  {currentSubmission ? (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                      <div className="flex items-center gap-2 mb-1">
                        <Lock className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-mono-code font-bold uppercase tracking-wider">
                          QUESTION LOCKED & SUBMITTED
                        </span>
                      </div>
                      <p className="text-xs text-[#172033]">
                        Submitted Answer: <span className="font-mono-code font-bold text-[#0891B2] uppercase">{currentSubmission.answer}</span>
                      </p>
                      <p className="text-[11px] text-[#64748B] mt-1">
                        Only one submission is permitted per question. Waiting for organizer to advance.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitAnswer} className="space-y-3">
                      {(() => {
                        const isBuzzerActiveForRound = Boolean(
                          eventState.buzzerRoundEnabled?.[eventState.currentRound as RoundNumber] ?? (eventState.currentRound === 3)
                        );
                        const isBlockedByBuzzer = (isBuzzerActiveForRound || eventState.buzzerActive) && eventState.buzzerWinner?.teamId !== currentTeam.id;

                        return (
                          <>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-mono-code font-semibold text-[#172033] uppercase">
                                  Your Answer:
                                </label>
                                <span className="text-[10px] text-[#64748B] font-mono-code">
                                  MULTI-WORD ACCEPTED
                                </span>
                              </div>
                              <div className="relative">
                                <input
                                  id="participant-answer-input"
                                  type="text"
                                  required
                                  disabled={isSubmitting || isBlockedByBuzzer}
                                  value={answerInput}
                                  autoCapitalize="characters"
                                  autoCorrect="off"
                                  autoComplete="off"
                                  spellCheck={false}
                                  inputMode="text"
                                  onChange={(e) => setAnswerInput(e.target.value.toUpperCase())}
                                  onKeyDown={(e) => {
                                    if (e.key === ' ' || e.code === 'Space') {
                                      e.stopPropagation();
                                    }
                                  }}
                                  placeholder={isBlockedByBuzzer ? 'Win buzzer to unlock answering' : 'ENTER TECHNICAL TERM...'}
                                  className="w-full px-4 py-2.5 bg-white border border-[#DCE6F0] rounded-xl text-sm font-mono-code uppercase font-semibold text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#06B6D4] disabled:opacity-50"
                                />
                              </div>

                              {/* Mobile Keyboard Helpers: Dedicated Space & Backspace Touch Buttons */}
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  type="button"
                                  onClick={() => setAnswerInput(prev => prev + ' ')}
                                  disabled={isSubmitting || isBlockedByBuzzer}
                                  className="flex-1 py-1.5 px-3 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#DCE6F0] text-xs font-mono-code font-semibold text-[#0891B2] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                  title="Insert space for multi-word answers on mobile virtual keyboard"
                                >
                                  <span>␣</span>
                                  <span>Insert Space</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAnswerInput(prev => prev.slice(0, -1))}
                                  disabled={isSubmitting || isBlockedByBuzzer || !answerInput}
                                  className="py-1.5 px-3 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#DCE6F0] text-xs font-mono-code text-[#64748B] hover:text-[#172033] transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
                                  title="Backspace one character"
                                >
                                  ⌫ Back
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAnswerInput('')}
                                  disabled={isSubmitting || isBlockedByBuzzer || !answerInput}
                                  className="py-1.5 px-3 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#DCE6F0] text-xs font-mono-code text-[#64748B] hover:text-[#172033] transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
                                  title="Clear input"
                                >
                                  Clear
                                </button>
                              </div>
                            </div>

                            <button
                              id="btn-submit-answer"
                              type="submit"
                              disabled={isSubmitting || !answerInput.trim() || isBlockedByBuzzer}
                              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white font-tech font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:from-[#0891B2] hover:to-[#1D4ED8] cursor-pointer"
                            >
                              <Send className="w-4 h-4" />
                              <span>{isSubmitting ? 'VERIFYING...' : 'SUBMIT ANSWER'}</span>
                            </button>
                          </>
                        );
                      })()}

                      {submissionFeedback && (
                        <p className="text-xs text-[#0891B2] text-center font-mono-code font-bold">
                          {submissionFeedback}
                        </p>
                      )}
                    </form>
                  )}
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-[#64748B] text-sm font-mono-code">
                No active question found for this round.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ANTI-CHEAT WARNING MODAL */}
      {antiCheatWarning.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white border border-rose-300 rounded-2xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="font-tech text-lg font-bold text-rose-600 tracking-wider">
              SECURITY WARNING
            </h3>
            <p className="text-xs text-[#172033] mt-2 leading-relaxed">
              {antiCheatWarning.message}
            </p>
            <button
              onClick={() => setAntiCheatWarning({ visible: false, message: '' })}
              className="mt-5 w-full py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs tracking-wider font-tech transition-all cursor-pointer shadow-md"
            >
              ACKNOWLEDGE & RETURN
            </button>
          </div>
        </div>
      )}

      {/* FULL VIEWPORT SECURITY BLACKOUT SHIELD (Immediate protection against external apps & screenshots) */}
      {securityShieldActive && (
        <div className="fixed inset-0 z-[9999] bg-[#172033]/90 flex items-center justify-center p-6 text-center select-none backdrop-blur-xl">
          <div className="w-full max-w-lg bg-white border border-rose-300 rounded-3xl p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 mx-auto flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-9 h-9 animate-pulse" />
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-code font-bold bg-rose-100 text-rose-700 border border-rose-300">
                PROCTOR SECURITY INTERVENTION
              </span>
              <h2 className="font-tech text-xl sm:text-2xl font-bold text-rose-600 tracking-wider mt-2">
                ARENA LOCKDOWN ACTIVATED
              </h2>
            </div>

            <div className="bg-[#F8FAFC] border border-rose-200 rounded-2xl p-4 text-left space-y-2">
              <div className="flex items-center gap-2 text-rose-700 font-mono-code text-xs font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>RESTRICTION PROTOCOL:</span>
              </div>
              <p className="text-xs text-[#172033] leading-relaxed font-sans">
                {shieldReason || 'External activity detected. All question content has been hidden to preserve academic integrity.'}
              </p>
              <div className="pt-2 border-t border-[#DCE6F0] text-[11px] font-mono-code text-[#64748B]">
                Team: <strong className="text-[#0891B2]">{currentTeam?.id}</strong> ({currentTeam?.name}) • Status: Recorded
              </div>
            </div>

            <p className="text-[11px] text-[#64748B] leading-relaxed">
              External AI apps (ChatGPT, Gemini), search engines, screenshot utilities, and multi-window views are strictly banned. Two violations will result in permanent lockout.
            </p>

            <button
              onClick={() => {
                setSecurityShieldActive(false);
                setShieldReason('');
                requestFullscreenMode();
              }}
              className="w-full py-3 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-tech font-bold text-sm tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
            >
              RESUME COMPETITION & RE-ENTER FULLSCREEN
            </button>
          </div>
        </div>
      )}

      {/* DEDICATED PROCTOR SCREENSHOT ATTEMPT WARNING DIALOG */}
      {screenshotWarning && (
        <div className="fixed inset-0 z-[99999] bg-[#172033]/90 backdrop-blur-xl flex items-center justify-center p-6 text-center select-none">
          <div className="w-full max-w-md bg-white border border-rose-300 rounded-3xl p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 mx-auto flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-9 h-9 animate-bounce" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono-code font-bold bg-rose-100 text-rose-700 border border-rose-300">
                PROCTOR SECURITY VIOLATION
              </span>
              <h2 className="font-tech text-xl sm:text-2xl font-bold text-rose-600 tracking-wider mt-2">
                SCREENSHOTS ARE NOT ALLOWED!
              </h2>
            </div>

            <div className="bg-[#F8FAFC] border border-rose-200 rounded-2xl p-4 text-left space-y-2">
              <p className="text-xs text-[#172033] leading-relaxed font-sans">
                Taking screenshots, using snipping tools, or capturing the screen is strictly prohibited during the competition.
              </p>
              <div className="pt-2 border-t border-[#DCE6F0] text-[11px] font-mono-code text-amber-700 font-semibold">
                ⚠️ Warning: This incident has been logged and reported to the proctor. Continuing this activity will result in immediate disqualification.
              </div>
            </div>

            <button
              onClick={() => {
                setScreenshotWarning(false);
                requestFullscreenMode();
              }}
              className="w-full py-3 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-tech font-bold text-sm tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
            >
              I UNDERSTAND • RETURN TO COMPETITION
            </button>
          </div>
        </div>
      )}

      {/* LEADERBOARD MODAL */}
      {showLeaderboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-[#DCE6F0] rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE6F0] mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="font-tech text-base font-bold text-[#172033]">
                  LIVE LEADERBOARD
                </h3>
              </div>
              <button
                onClick={() => setShowLeaderboardModal(false)}
                className="text-xs text-[#64748B] hover:text-[#172033] cursor-pointer"
              >
                Close
              </button>
            </div>

            {leaderboard && leaderboard.length > 0 ? (
              <div className="max-h-72 overflow-y-auto space-y-2">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.teamId}
                    className={`flex items-center justify-between p-2.5 rounded-lg border ${
                      entry.teamId === currentTeam.id
                        ? 'bg-[#ECFEFF] border-[#06B6D4]/40'
                        : 'bg-[#F8FAFC] border-[#DCE6F0]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-6 text-center font-mono-code text-xs font-bold ${
                        entry.rank === 1 ? 'text-amber-500 font-black' : entry.rank === 2 ? 'text-slate-600 font-bold' : entry.rank === 3 ? 'text-amber-700 font-bold' : 'text-[#64748B]'
                      }`}>
                        #{entry.rank}
                      </span>
                      <div>
                        <div className="text-xs font-semibold text-[#172033] truncate max-w-[160px]">
                          {entry.teamName}
                        </div>
                        <div className="text-[10px] text-[#64748B] font-mono-code">
                          {entry.teamId}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono-code font-bold text-sm text-[#0891B2]">
                        {entry.totalScore}
                      </span>
                      <span className="text-[10px] text-[#64748B] ml-1">pts</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#64748B] text-center py-6">
                Leaderboard not yet published by organizer.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: OFFICIAL SYMPOSIUM RULES & REGULATIONS
          ========================================== */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white border border-[#DCE6F0] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#DCE6F0]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#ECFEFF] border border-[#06B6D4]/30 flex items-center justify-center text-[#0891B2] shrink-0 shadow-sm">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-tech text-base sm:text-lg font-bold text-[#172033] tracking-wide">
                      TECH BRIDGE '26 RULES
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-code font-bold bg-[#ECFEFF] text-[#0891B2] border border-[#06B6D4]/30">
                      MANDATORY
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    Autonomous College of Engineering & Technology • Department of CSE
                  </p>
                </div>
              </div>
              {hasAcknowledgedRules && (
                <button
                  onClick={() => setShowRulesModal(false)}
                  className="text-[#64748B] hover:text-[#172033] p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Scrollable Rules Content */}
            <div className="space-y-4 overflow-y-auto pr-1 text-xs text-[#172033] leading-relaxed">
              {/* Rule 1 */}
              <div className="p-3.5 bg-[#F8FAFC] border border-[#DCE6F0] rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-[#0891B2] font-tech font-bold text-xs uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-[#ECFEFF] border border-[#06B6D4]/30 flex items-center justify-center text-[11px]">1</span>
                  Competition Format & Rounds
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-white border border-[#DCE6F0] shadow-xs">
                    <div className="font-bold text-[#172033] text-[11px]">Round 1: Foundations</div>
                    <div className="text-[10px] text-[#64748B] mt-0.5">30 Rebus • 30 Mins</div>
                    <div className="text-[10px] text-[#0891B2] font-mono-code mt-1 font-semibold">1 pt each</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#DCE6F0] shadow-xs">
                    <div className="font-bold text-[#172033] text-[11px]">Round 2: Systems</div>
                    <div className="text-[10px] text-[#64748B] mt-0.5">15 Rebus • 15 Mins</div>
                    <div className="text-[10px] text-[#0891B2] font-mono-code mt-1 font-semibold">2 pts each</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#DCE6F0] shadow-xs">
                    <div className="font-bold text-[#172033] text-[11px]">Round 3: Grand Finale</div>
                    <div className="text-[10px] text-[#64748B] mt-0.5">10 Rebus • Digital Buzzer</div>
                    <div className="text-[10px] text-amber-700 font-mono-code mt-1 font-semibold">3 pts • 15s window</div>
                  </div>
                </div>
              </div>

              {/* Rule 2 */}
              <div className="p-3.5 bg-[#F8FAFC] border border-[#DCE6F0] rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 font-tech font-bold text-xs uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[11px]">2</span>
                  Single Submission & Auto-Grading Policy
                </div>
                <p className="text-[#172033]">
                  • Exactly <strong>ONE submission</strong> is permitted per question. Answers are locked permanently upon submission.
                </p>
                <p className="text-[#64748B] text-[11px]">
                  • The auto-grading engine is case-insensitive and trims extraneous whitespace and punctuation. Common industry acronyms and recognized technical variations are accepted.
                </p>
              </div>

              {/* Rule 3 */}
              <div className="p-3.5 bg-[#F8FAFC] border border-[#DCE6F0] rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-tech font-bold text-xs uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-[11px]">3</span>
                  Automated Anti-Cheat & Proctoring
                </div>
                <p className="text-[#172033]">
                  Leaving the app window, switching tabs, opening split-screens, or backgrounding the window triggers real-time security alerts on the organizer console:
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1 text-center font-mono-code text-[10px]">
                  <div className="p-2 rounded-lg bg-white border border-[#DCE6F0]">
                    <div className="text-[#64748B] font-bold">1st Incident</div>
                    <div className="text-[#0891B2] font-semibold">Security Warning (Strike 1)</div>
                  </div>
                  <div className="p-2 rounded-lg bg-rose-50 border border-rose-200">
                    <div className="text-rose-700 font-bold">2nd Incident</div>
                    <div className="text-rose-800 font-bold">Terminal Lockout (Strike 2)</div>
                  </div>
                </div>
              </div>

              {/* Rule 4 */}
              <div className="p-3.5 bg-[#F8FAFC] border border-[#DCE6F0] rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 text-purple-700 font-tech font-bold text-xs uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-[11px]">4</span>
                  Code of Conduct & Fairness
                </div>
                <p className="text-[#64748B] text-[11px]">
                  • Collaboration is strictly restricted to your registered teammate. Use of secondary search devices, AI assistants, or unauthorized aids is grounds for immediate disqualification.
                </p>
                <p className="text-[#64748B] text-[11px]">
                  • Screen Sleep Prevention: Display timeout is automatically disabled while in the competition arena so your screen stays continuously active without dimming or shutting down.
                </p>
                <p className="text-[#64748B] text-[11px]">
                  • Decisions of the symposium faculty jury and Department of CSE organizers are final.
                </p>
              </div>
            </div>

            {/* Modal Footer / Acceptance Action */}
            <div className="pt-3 border-t border-[#DCE6F0] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Session monitored by ACET CSE Security Protocol</span>
              </div>
              <button
                id="btn-acknowledge-rules"
                type="button"
                onClick={handleAcknowledgeRules}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#2563EB] hover:from-[#0891B2] hover:to-[#1D4ED8] text-white font-bold text-xs font-tech tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>I AGREE & ENTER COMPETITION ARENA</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2-Step Logout Verification Modal */}
      {renderLogoutModal()}

      {/* Official Team Certificate Modal */}
      {showCertificateModal && teamCertificate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white border border-[#DCE6F0] rounded-3xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE6F0]">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="font-tech text-base font-bold text-[#172033] tracking-wide">
                  OFFICIAL SYMPOSIUM CERTIFICATE • {teamCertificate.teamName}
                </h3>
              </div>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="text-[#64748B] hover:text-[#172033] p-1 rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <CertificateRenderer
              certificate={teamCertificate}
              onClose={() => setShowCertificateModal(false)}
            />
          </div>
        </div>
      )}

      {/* Official Symposium Participant Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-[#DCE6F0] rounded-3xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE6F0]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <h3 className="font-tech text-base font-bold text-[#172033] tracking-wide">
                  SYMPOSIUM PARTICIPANT FEEDBACK
                </h3>
              </div>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-[#64748B] hover:text-[#172033] p-1 rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedbackSuccess ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-tech text-base font-bold text-emerald-800">
                  THANK YOU FOR YOUR FEEDBACK!
                </h4>
                <p className="text-xs text-[#64748B]">
                  Your review and rating have been recorded for the Department of CSE Symposium records.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono-code text-[#172033] mb-1.5 font-bold uppercase">
                    Overall Event Organization & Experience
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className={`p-1.5 rounded-lg transition-transform hover:scale-110 cursor-pointer ${
                          feedbackRating >= star ? 'text-amber-400' : 'text-slate-300'
                        }`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                    <span className="text-xs font-mono-code font-bold text-amber-600 ml-2">
                      {feedbackRating}/5 Stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono-code text-[#172033] mb-1.5 font-bold uppercase">
                    Question Quality & Technical Depth
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackDepth(star)}
                        className={`p-1.5 rounded-lg transition-transform hover:scale-110 cursor-pointer ${
                          feedbackDepth >= star ? 'text-[#0891B2]' : 'text-slate-300'
                        }`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                    <span className="text-xs font-mono-code font-bold text-[#0891B2] ml-2">
                      {feedbackDepth}/5 Stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono-code text-[#172033] mb-1.5 font-bold uppercase">
                    Visual Rebus Platform & UI Quality
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackDesign(star)}
                        className={`p-1.5 rounded-lg transition-transform hover:scale-110 cursor-pointer ${
                          feedbackDesign >= star ? 'text-purple-600' : 'text-slate-300'
                        }`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                    <span className="text-xs font-mono-code font-bold text-purple-600 ml-2">
                      {feedbackDesign}/5 Stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono-code text-[#172033] mb-1 font-bold uppercase">
                    Comments, Feedback or Testimonials
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackComments}
                    onChange={(e) => setFeedbackComments(e.target.value)}
                    placeholder="Share your experience, thoughts on the rebus puzzles, or suggestions for the organizers..."
                    className="w-full px-3 py-2 bg-white border border-[#DCE6F0] rounded-xl text-xs text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-4 py-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-xs font-semibold text-[#172033] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={feedbackSubmitting}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-tech font-bold text-xs tracking-wider transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{feedbackSubmitting ? 'SUBMITTING...' : 'SUBMIT FEEDBACK'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
