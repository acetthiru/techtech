import React from 'react';
import { Clock, Tv, Maximize, Radio, Sun } from 'lucide-react';
import { EventState, PublicQuestion } from '../types';
import { RebusClueRenderer } from './RebusClueRenderer';
import { useScreenWakeLock } from '../utils/wakeLock';

interface PublicDisplayProps {
  eventState: EventState | null;
  currentQuestion: PublicQuestion | null;
  remainingSeconds: number;
}

export const PublicDisplay: React.FC<PublicDisplayProps> = ({
  eventState,
  currentQuestion,
  remainingSeconds,
}) => {
  // Prevent auditorium projector from sleeping during symposium
  const { isActive: isWakeLockActive } = useScreenWakeLock(true);
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const getRoundName = (r: number) => {
    switch (r) {
      case 1:
        return 'ROUND 1: FOUNDATIONS & CORE SYSTEMS';
      case 2:
        return 'ROUND 2: DISTRIBUTED ARCHITECTURES & SECURITY';
      case 3:
        return 'ROUND 3: GRAND FINALE & LIVE DIGITAL BUZZER';
      default:
        return 'SYMPOSIUM ARENA';
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FFFDF5] text-[#24324A] flex flex-col justify-between p-6 sm:p-10 select-none">
      {/* Top Projector Header */}
      <header className="w-full flex items-center justify-between border-b border-[#E8E3EF] pb-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#C83A87] to-[#55C7D9] flex items-center justify-center font-tech text-white font-black text-xl shadow-md">
            TB
          </div>
          <div>
            <h1 className="font-tech text-2xl sm:text-3xl font-bold tracking-wider text-[#24324A]">
              ACETCM'26 • TECH BRIDGE
            </h1>
            <p className="text-xs sm:text-sm text-[#C83A87] font-mono-code font-semibold">
              Visual Technical Rebus Challenge • Achariya College of Engineering Technology
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Synchronized Server Timer */}
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white border border-[#E8E3EF] shadow-xs">
            <Clock className="w-6 h-6 text-[#55C7D9]" />
            <div className="text-right">
              <span className="text-[10px] font-mono-code text-[#667085] block uppercase font-bold">
                ROUND TIMER
              </span>
              <span className={`font-mono-code text-2xl sm:text-3xl font-extrabold ${
                remainingSeconds <= 60 ? 'text-rose-600 animate-pulse' : 'text-[#24324A]'
              }`}>
                {formatTimer(remainingSeconds)}
              </span>
            </div>
          </div>

          {isWakeLockActive && (
            <div 
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F6D76B]/25 border border-[#F6D76B]/60 text-[#9A7B0C] text-xs font-mono-code font-bold"
              title="Projector Screen Awake: Sleep timeout disabled"
            >
              <Sun className="w-4 h-4 text-[#9A7B0C] animate-pulse" />
              <span>AWAKE</span>
            </div>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-white hover:bg-[#F7F3FC] border border-[#E8E3EF] text-[#667085] hover:text-[#24324A] transition-all shadow-xs"
            title="Toggle Fullscreen"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Presentation Stage */}
      <main className="w-full flex-1 flex flex-col items-center justify-center py-6">
        {eventState?.status !== 'RUNNING' ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-[#F7F3FC] border border-[#E8E3EF] flex items-center justify-center text-[#C83A87] mx-auto mb-6 shadow-xs">
              <Tv className="w-10 h-10 animate-pulse" />
            </div>
            <h2 className="font-tech text-3xl sm:text-4xl font-bold text-[#24324A] tracking-wider">
              {eventState?.status === 'PAUSED' ? 'ROUND TEMPORARILY PAUSED' : 'WAITING FOR ROUND COMMENCEMENT'}
            </h2>
            <p className="text-sm text-[#667085] mt-3 font-mono-code">
              Contestants: Prepare your participant app devices.
            </p>
          </div>
        ) : currentQuestion ? (
          <div className="w-full max-w-5xl flex flex-col items-center">
            {/* Round & Question Title */}
            <div className="w-full flex items-center justify-between mb-4 px-2">
              <span className="font-tech text-base sm:text-lg font-bold text-[#C83A87] tracking-wider">
                {getRoundName(eventState.currentRound)}
              </span>
              <span className="font-mono-code text-sm sm:text-base font-extrabold px-3 py-1 rounded-lg bg-[#F7F3FC] text-[#C83A87] border border-[#E8E3EF] shadow-2xs">
                QUESTION {currentQuestion.questionNumber.toString().padStart(2, '0')} / {eventState.totalQuestionsInRound}
              </span>
            </div>

            {/* The Visual Rebus Clue Viewport (Crisp, High Res Vector Art & Realistic Clues) */}
            <div className="w-full bg-white border border-[#E8E3EF] rounded-3xl p-6 sm:p-8 shadow-sm">
              <RebusClueRenderer
                panels={currentQuestion.cluePanels}
                customImageUrl={currentQuestion.customImageUrl}
                images={currentQuestion.images}
                largeDisplay={true}
                displayMode={eventState.clueDisplayMode || 'realistic'}
              />
            </div>

            {/* Domain & Buzzer Alert (Zero answers, Zero names revealed) */}
            <div className="w-full mt-5 flex items-center justify-between px-2">
              <span className="text-xs font-mono-code text-[#667085] uppercase tracking-wider font-semibold">
                DOMAIN: {currentQuestion.domain} • VALUE: {currentQuestion.round === 1 ? 1 : currentQuestion.round === 2 ? 2 : 3} {currentQuestion.round === 1 ? 'POINT' : 'POINTS'}
              </span>

              {(eventState.currentRound === 3 || eventState.buzzerActive || eventState.buzzerWinner) && (
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${eventState.buzzerActive ? 'bg-[#C83A87] animate-ping' : 'bg-[#667085]'}`} />
                  <span className="text-xs font-mono-code font-bold text-[#C83A87] uppercase tracking-wider">
                    {eventState.buzzerActive ? 'DIGITAL BUZZER LIVE' : eventState.buzzerWinner ? 'BUZZ RECORDED' : 'BUZZ LOCKED'}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-[#667085] text-sm font-mono-code">
            Awaiting question broadcast...
          </div>
        )}
      </main>

      {/* Bottom Display Footer */}
      <footer className="w-full border-t border-[#E8E3EF] pt-4 flex items-center justify-between text-xs text-[#667085] font-mono-code">
        <div>ACETCM'26 • TECH BRIDGE • OFFICIAL STAGE DISPLAY</div>
        <div>NO PHONE USE OUTSIDE COMPETITION APP • SINGLE SUBMISSION LOCKED</div>
      </footer>
    </div>
  );
};
