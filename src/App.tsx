/**
 * TECH BRIDGE '26: Visual Technical Rebus Challenge
 * CSE Department Technical Symposium Official Application
 */
import React, { useState, useEffect, useRef } from 'react';
import { TopNav, AppViewMode } from './components/TopNav';
import { ParticipantArena } from './components/ParticipantArena';
import { AdminDashboard } from './components/AdminDashboard';
import { PublicDisplay } from './components/PublicDisplay';
import { EventLandingPage } from './components/EventLandingPage';
import { EventState, PublicQuestion, LeaderboardEntry } from './types';

export default function App() {
  // Mode detection from URL query parameters or default landing page
  const [currentMode, setCurrentMode] = useState<AppViewMode>(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view === 'display' || window.location.pathname === '/display') return 'display';
    if (view === 'admin') return 'admin';
    if (view === 'participant') return 'participant';
    return 'landing'; // Default front landing page for any visitor entering the site
  });

  // Authoritative State from Server
  const [eventState, setEventState] = useState<EventState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<PublicQuestion | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(1800);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // Sound synthesizer using standard Web Audio API (no external asset dependencies)
  const playChime = (type: 'buzz' | 'success' | 'alert') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'buzz') {
        const t = ctx.currentTime;
        // Stadium gameshow buzzer with detuned saw oscillators, overtone, and bass punch
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();
        const subKick = ctx.createOscillator();
        const masterGain = ctx.createGain();

        masterGain.gain.setValueAtTime(0.001, t);
        masterGain.gain.linearRampToValueAtTime(0.35, t + 0.015);
        masterGain.gain.setValueAtTime(0.35, t + 0.28);
        masterGain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
        masterGain.connect(ctx.destination);

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(165, t);
        osc1.connect(masterGain);

        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(172, t); // 7Hz raspy beating
        osc2.connect(masterGain);

        osc3.type = 'square';
        osc3.frequency.setValueAtTime(330, t);
        const osc3Gain = ctx.createGain();
        osc3Gain.gain.setValueAtTime(0.15, t);
        osc3.connect(osc3Gain);
        osc3Gain.connect(masterGain);

        subKick.type = 'sine';
        subKick.frequency.setValueAtTime(90, t);
        subKick.frequency.exponentialRampToValueAtTime(45, t + 0.08);
        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.35, t);
        subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        subKick.connect(subGain);
        subGain.connect(ctx.destination);

        osc1.start(t);
        osc2.start(t);
        osc3.start(t);
        subKick.start(t);

        osc1.stop(t + 0.39);
        osc2.stop(t + 0.39);
        osc3.stop(t + 0.39);
        subKick.stop(t + 0.09);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {
      // Audio context blocked until user interaction
    }
  };

  // Fetch Authoritative State from REST endpoint as fallback / bootstrap
  const fetchState = async () => {
    try {
      const res = await fetch('/api/event');
      if (res.ok) {
        const data = await res.json();
        setEventState(data);
        setCurrentQuestion(data.currentQuestion);
        setRemainingSeconds(data.remainingSeconds);
        if (data.leaderboard) setLeaderboard(data.leaderboard);
      }
    } catch (err) {
      // Silent error during server restart
    }
  };

  // Setup WebSocket Real-time Synchronization
  useEffect(() => {
    let unmounted = false;

    const connectWebSocket = () => {
      if (unmounted) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (unmounted) return;
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        if (unmounted) return;
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'INIT_STATE' || msg.type === 'EVENT_STATE') {
            const state = msg.payload;
            setEventState(state);
            setCurrentQuestion(state.currentQuestion);
            setRemainingSeconds(state.remainingSeconds);
            if (state.leaderboard) setLeaderboard(state.leaderboard);
          } else if (msg.type === 'BUZZER_WINNER') {
            playChime('buzz');
            fetchState();
          } else if (msg.type === 'ROUND_EXPIRED') {
            playChime('alert');
            fetchState();
          } else if (msg.type === 'NEW_SUBMISSION') {
            fetchState();
          }
        } catch {
          // malformed packet ignored
        }
      };

      ws.onclose = () => {
        if (unmounted) return;
        setIsConnected(false);
        // Reconnect after 2 seconds
        reconnectTimeoutRef.current = window.setTimeout(connectWebSocket, 2000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    fetchState();
    connectWebSocket();

    return () => {
      unmounted = true;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Synchronized countdown ticker (decrements every second if running & not paused)
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (eventState?.status === 'RUNNING' && !eventState.isPaused && prev > 0) {
          return prev - 1;
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [eventState?.status, eventState?.isPaused]);

  // Keep URL query synchronized when switching modes
  const handleModeChange = (mode: AppViewMode = 'participant') => {
    setCurrentMode(mode);
    const url = new URL(window.location.href);
    if (mode === 'landing') {
      url.searchParams.delete('view');
    } else {
      url.searchParams.set('view', mode);
    }
    window.history.replaceState({}, '', url.toString());
  };

  // If on Landing Page, render the dedicated pictorial front entrance
  if (currentMode === 'landing') {
    return (
      <EventLandingPage
        onEnterEvent={handleModeChange}
        eventStatus={eventState?.status}
        currentRound={eventState?.currentRound}
        totalTeams={leaderboard?.length || 0}
      />
    );
  }

  // If in Projector Display Mode, hide TopNav for a clean 1080p presentation stage
  if (currentMode === 'display') {
    return (
      <div className="relative theme-competition-arena bg-[#FFFDF5] text-[#24324A]">
        <PublicDisplay
          eventState={eventState}
          currentQuestion={currentQuestion}
          remainingSeconds={remainingSeconds}
        />
        {/* Floating return button for quick navigation */}
        <button
          onClick={() => handleModeChange('landing')}
          className="fixed bottom-3 right-3 px-3 py-1.5 rounded-lg bg-white/95 hover:bg-white border border-[#E8E3EF] text-[11px] text-[#C83A87] hover:text-[#55C7D9] backdrop-blur font-mono-code transition-all shadow-md"
        >
          Return to Landing
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-competition-arena bg-[#FFFDF5] text-[#24324A] flex flex-col font-sans">
      <TopNav
        currentMode={currentMode}
        onModeChange={handleModeChange}
        eventState={eventState}
        isConnected={isConnected}
        remainingSeconds={remainingSeconds}
      />

      <main className="flex-1 bg-[#FFFDF5]">
        {currentMode === 'participant' && (
          <ParticipantArena
            eventState={eventState}
            currentQuestion={currentQuestion}
            remainingSeconds={remainingSeconds}
            leaderboard={leaderboard}
            onRefreshState={fetchState}
          />
        )}

        {currentMode === 'admin' && (
          <AdminDashboard
            eventState={eventState}
            remainingSeconds={remainingSeconds}
            onRefreshState={fetchState}
          />
        )}
      </main>
    </div>
  );
}
