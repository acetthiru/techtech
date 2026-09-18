import React, { useState, useRef, useEffect } from 'react';
import { 
  Smartphone, 
  ShieldAlert, 
  Tv, 
  Wifi,
  WifiOff,
  Clock,
  Lock,
  Home
} from 'lucide-react';
import { EventState } from '../types';

export type AppViewMode = 'landing' | 'participant' | 'admin' | 'display';

interface TopNavProps {
  currentMode: AppViewMode;
  onModeChange: (mode: AppViewMode) => void;
  eventState: EventState | null;
  isConnected: boolean;
  remainingSeconds: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentMode,
  onModeChange,
  eventState,
  isConnected,
  remainingSeconds,
}) => {
  // Proctor Admin Access Detection (Explicit intentional 5 rapid desktop clicks on logo)
  const [clickCount, setClickCount] = useState(0);
  const clickTimerRef = useRef<number | null>(null);
  const [adminUnlocked, setAdminUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('techbridge_admin_unlocked') === 'true' || currentMode === 'admin';
    } catch {
      return currentMode === 'admin';
    }
  });

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
    };
  }, []);

  const triggerAdminAccess = () => {
    setAdminUnlocked(true);
    try {
      sessionStorage.setItem('techbridge_admin_unlocked', 'true');
    } catch {}
    onModeChange('admin');
  };

  const handleLogoClick = () => {
    const next = clickCount + 1;
    if (next >= 5) {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
      setClickCount(0);
      triggerAdminAccess();
      return;
    }

    setClickCount(next);

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }
    
    clickTimerRef.current = window.setTimeout(() => {
      // If it was just 1 click and not during locked test or in participant arena, navigate to landing
      if (next === 1 && currentMode !== 'admin' && currentMode !== 'participant') {
        onModeChange('landing');
      }
      setClickCount(0);
      clickTimerRef.current = null;
    }, 400);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = () => {
    if (!eventState) return null;
    switch (eventState.status) {
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#8DD8B5]/20 text-[#065F46] border border-[#8DD8B5]/50 font-mono-code">
            <span className="w-2 h-2 rounded-full bg-[#8DD8B5] animate-pulse" />
            LIVE • R{eventState.currentRound}
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F6D76B]/25 text-[#9A7B0C] border border-[#F6D76B]/60 font-mono-code">
            <span className="w-2 h-2 rounded-full bg-[#F6D76B]" />
            PAUSED
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F7F3FC] text-[#C83A87] border border-[#E8E3EF] font-mono-code">
            COMPLETED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#55C7D9]/15 text-[#0E7490] border border-[#55C7D9]/40 font-mono-code">
            STANDBY
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E8E3EF] bg-white/95 backdrop-blur-md select-none shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Official Symposium Logo */}
        <div 
          onClick={handleLogoClick}
          className="flex items-center gap-3 cursor-pointer group active:scale-95 transition-transform"
          title={currentMode === 'participant' ? "TECH BRIDGE '26 Arena" : "Return to ACETCM'26 Landing Page"}
        >
          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-[#F7F3FC] border border-[#E8E3EF] flex items-center justify-center shadow-xs p-0.5 group-hover:border-[#C83A87]/50 transition-colors">
            <img
              src="/tech_bridge_logo.jpg"
              alt="TECH BRIDGE '26 Logo"
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (!target.src.includes('official_techbridge_logo.png')) {
                  target.src = '/official_techbridge_logo.png';
                }
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-tech text-base sm:text-lg font-bold tracking-wider text-[#24324A] group-hover:text-[#C83A87] transition-colors">
                ACETCM'26
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono-code px-1.5 py-0.5 rounded bg-[#F7F3FC] border border-[#E8E3EF] text-[#C83A87] font-semibold">
                CSE SYMPOSIUM
              </span>
            </div>
            <p className="text-[11px] text-[#667085] hidden sm:block">
              ACHARIYA COLLEGE OF ENGINEERING TECHNOLOGY
            </p>
          </div>
        </div>

        {/* Global Timer & Status (if live) */}
        <div className="hidden md:flex items-center gap-3">
          {getStatusBadge()}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F7F3FC] border border-[#E8E3EF] text-xs font-mono-code text-[#24324A]">
            <Clock className="w-3.5 h-3.5 text-[#55C7D9]" />
            <span className="text-[#667085]">ROUND TIMER:</span>
            <span className={`font-semibold ${remainingSeconds <= 60 ? 'text-rose-600 animate-pulse' : 'text-[#24324A]'}`}>
              {formatTime(remainingSeconds)}
            </span>
          </div>
        </div>

        {/* View Mode Switcher: Landing (hidden for participants), Participant, Admin, Projector */}
        <div className="flex items-center gap-1 bg-[#F7F3FC] p-1 rounded-xl border border-[#E8E3EF] overflow-x-auto">
          {currentMode !== 'participant' && (
            <button
              id="nav-btn-landing"
              onClick={() => onModeChange('landing')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentMode === 'landing'
                  ? 'bg-gradient-to-r from-[#C83A87] to-[#E2559F] text-white font-bold shadow-xs'
                  : 'text-[#667085] hover:text-[#24324A] hover:bg-white'
              }`}
              title="Event Landing Page"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Landing</span>
            </button>
          )}

          <button
            id="nav-btn-participant"
            onClick={() => onModeChange('participant')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentMode === 'participant'
                ? 'bg-gradient-to-r from-[#C83A87] to-[#55C7D9] text-white font-bold shadow-xs'
                : 'text-[#667085] hover:text-[#24324A] hover:bg-white'
            }`}
            title="Participant Mobile Arena"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Arena</span>
          </button>

          {(adminUnlocked || currentMode === 'admin') && (
            <button
              id="nav-btn-admin"
              onClick={() => onModeChange('admin')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentMode === 'admin'
                  ? 'bg-gradient-to-r from-[#C83A87] to-[#24324A] text-white font-bold shadow-xs'
                  : 'text-[#667085] hover:text-[#24324A] hover:bg-white'
              }`}
              title="Admin Organizer Control Center"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          <button
            id="nav-btn-display"
            onClick={() => onModeChange('display')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentMode === 'display'
                ? 'bg-gradient-to-r from-[#55C7D9] to-[#8DD8B5] text-[#24324A] font-bold shadow-xs'
                : 'text-[#667085] hover:text-[#24324A] hover:bg-white'
            }`}
            title="Public Projector Display (/display)"
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Projector</span>
          </button>
        </div>

        {/* Real-time Connection Indicator */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-1 text-[11px] text-[#065F46] font-mono-code bg-[#8DD8B5]/20 px-2.5 py-1 rounded-lg border border-[#8DD8B5]/50">
              <Wifi className="w-3 h-3" />
              <span className="hidden lg:inline">SYNCED</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-[#DC2626] font-mono-code bg-[#FEF2F2] px-2.5 py-1 rounded-lg border border-[#FECACA]">
              <WifiOff className="w-3 h-3" />
              <span className="hidden lg:inline">RECONNECTING</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
