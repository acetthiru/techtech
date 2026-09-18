import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Sparkles, 
  Tv, 
  ShieldAlert, 
  Users, 
  Brain, 
  Cpu, 
  Award, 
  Zap, 
  Layers, 
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import { AppViewMode } from './TopNav';

interface EventLandingPageProps {
  onEnterEvent: (mode?: AppViewMode) => void;
  eventStatus?: string;
  currentRound?: number;
  totalTeams?: number;
}

export const EventLandingPage: React.FC<EventLandingPageProps> = ({
  onEnterEvent,
  eventStatus = 'WAITING',
  currentRound = 1,
  totalTeams = 0,
}) => {
  return (
    <div id="event-landing-root" className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Symposium Header Banner */}
      <header id="landing-header" className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden border border-amber-500/40 shadow-md shadow-amber-500/10 p-0.5 bg-slate-900 flex-shrink-0">
              <img 
                src="/tech_bridge_logo.jpg" 
                alt="Tech Bridge Logo" 
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/event-logo.png';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-tech text-lg font-bold tracking-wider text-white">
                  ACETCM'26 • TECH BRIDGE
                </span>
                <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-semibold uppercase">
                  National Level Symposium
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                ACHARIYA COLLEGE OF ENGINEERING TECHNOLOGY • Department of CSE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="landing-quick-admin-btn"
              onClick={() => onEnterEvent('admin')}
              className="text-xs text-slate-400 hover:text-cyan-400 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-cyan-500/30 bg-slate-900/60 transition flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Proctor Admin</span>
            </button>
            <button
              id="landing-quick-display-btn"
              onClick={() => onEnterEvent('display')}
              className="text-xs text-slate-400 hover:text-amber-400 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-amber-500/30 bg-slate-900/60 transition flex items-center gap-1.5"
            >
              <Tv className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Projector View</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Landing Hero Container */}
      <main id="landing-main-content" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 md:py-10 flex flex-col justify-center">
        
        {/* Central Card with The Official Symposium Visual Rebus Poster Artwork */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-amber-500/30 bg-slate-900/90 shadow-2xl shadow-amber-950/30 group"
        >
          {/* Ambient Lighting Glow Behind Poster */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Featured Image Canvas */}
          <div className="relative w-full aspect-[16/9] max-h-[620px] overflow-hidden bg-slate-950">
            <img 
              src="/tech_bridge_landing.jpg" 
              alt="TECH BRIDGE - Connect, Think, Solve" 
              className="w-full h-full object-cover object-center transform group-hover:scale-[1.01] transition-transform duration-700"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/tech_bridge_poster.jpg';
              }}
            />
            {/* Subtle Gradient Overlays for Readability and Mood */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-slate-950/40" />

            {/* Hero CTA Block Anchored at Bottom of Poster */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8 flex items-center justify-end z-10">
              {/* Main Glowing Entry Button */}
              <motion.button
                id="btn-enter-event-main"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onEnterEvent('participant')}
                className="relative group/btn overflow-hidden px-8 py-4 rounded-xl font-tech font-bold text-base sm:text-lg tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 hover:from-amber-300 hover:via-orange-300 hover:to-amber-200 shadow-xl shadow-amber-500/30 flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer border border-amber-200/60"
              >
                {/* Sheen animation */}
                <div className="absolute inset-0 w-1/2 h-full bg-white/30 skew-x-12 -translate-x-full group-hover/btn:translate-x-[300%] transition-transform duration-1000" />
                
                <span>ENTER INTO THE EVENT</span>
                <ArrowRight className="w-5 h-5 text-slate-950 group-hover/btn:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Feature Pillars from the Artwork */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <div className="bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/40 p-4 rounded-xl transition duration-300">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-2.5 text-amber-400">
              <Brain className="w-4 h-4" />
            </div>
            <h3 className="font-tech text-sm font-bold text-white">Visual Rebus Puzzles</h3>
            <p className="text-xs text-slate-400 mt-1">
              Photographic clue panels representing core computer science concepts, architectures, and algorithms.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/40 p-4 rounded-xl transition duration-300">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-2.5 text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-tech text-sm font-bold text-white">Live Digital Buzzer</h3>
            <p className="text-xs text-slate-400 mt-1">
              Sub-millisecond authoritative lockout in Round 3 Grand Finale with automated tie detection.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 hover:border-emerald-500/40 p-4 rounded-xl transition duration-300">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="font-tech text-sm font-bold text-white">Anti-Cheat Defense</h3>
            <p className="text-xs text-slate-400 mt-1">
              Active tab-switch detection, automated screenshot prevention, and real-time proctor surveillance.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 hover:border-purple-500/40 p-4 rounded-xl transition duration-300">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-2.5 text-purple-400">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="font-tech text-sm font-bold text-white">Verified Certificates</h3>
            <p className="text-xs text-slate-400 mt-1">
              Digitally signed participation and winner certificates for all qualifying college symposium teams.
            </p>
          </div>
        </div>

        {/* Symposium Organizing Committee & Coordinators Information Panel */}
        <div className="mt-6 rounded-2xl bg-slate-900/80 border border-cyan-500/30 p-5 md:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <h3 className="font-tech text-sm sm:text-base font-bold text-white tracking-wider">
                  SYMPOSIUM ORGANIZING COMMITTEE • ACETCM'26
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Department of Computer Science and Engineering • ACHARIYA COLLEGE OF ENGINEERING TECHNOLOGY
              </p>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 rounded-full text-[11px] font-mono-code font-bold bg-cyan-950/80 border border-cyan-800 text-cyan-300">
              National Level Symposium
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Event Coordinator */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono-code text-cyan-400 uppercase font-bold tracking-wider">
                  EVENT COORDINATOR
                </span>
                <h4 className="font-tech text-base font-bold text-white mt-1">
                  Mrs. K. Janani
                </h4>
                <p className="text-xs text-slate-300 font-mono-code mt-0.5">
                  AP / CSE
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                Department of CSE, ACET
              </div>
            </div>

            {/* Student Coordinators */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono-code text-amber-400 uppercase font-bold tracking-wider">
                  STUDENT COORDINATORS
                </span>
                <div className="space-y-2 mt-1.5 text-xs font-mono-code">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-100 font-semibold">Ms. Angel R</span>
                    <a href="tel:9487883582" className="text-cyan-400 hover:underline">9487883582</a>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-100 font-semibold">Mr. Thirumurugan S</span>
                    <a href="tel:9042789495" className="text-cyan-400 hover:underline">9042789495</a>
                  </div>
                </div>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                Contact for queries & registration assistance
              </div>
            </div>

            {/* II Year Coordinators */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono-code text-emerald-400 uppercase font-bold tracking-wider">
                  II YEAR COORDINATORS
                </span>
                <div className="mt-1.5 space-y-1 text-xs text-slate-300">
                  <div className="font-mono-code">A. Kamalambiga &bull; R. Dharshini</div>
                  <div className="font-mono-code">P. Arthi &bull; Gowsikram V &bull; Swedha Sree. M</div>
                </div>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                Event Logistics & Arena Support
              </div>
            </div>
          </div>
        </div>

        {/* Quick Launch Role Selector */}
        <div className="mt-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <Users className="w-4 h-4 text-amber-400" />
            <span>Select direct access portal:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="role-participant-launch"
              onClick={() => onEnterEvent('participant')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow"
            >
              Participant Arena
            </button>
            <button
              id="role-projector-launch"
              onClick={() => onEnterEvent('display')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition"
            >
              Projector Big Screen
            </button>
            <button
              id="role-proctor-launch"
              onClick={() => onEnterEvent('admin')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition"
            >
              Organizers & Faculty Admin
            </button>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer id="landing-footer" className="w-full border-t border-slate-800/80 bg-slate-950/80 py-4 px-4 sm:px-6 text-center text-xs text-slate-400 font-mono-code">
        <p>DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING • ACHARIYA COLLEGE OF ENGINEERING TECHNOLOGY</p>
        <p className="text-[11px] text-slate-400 mt-0.5">ACETCM'26 • NATIONAL LEVEL SYMPOSIUM • TECH BRIDGE '26 Visual Rebus Platform</p>
      </footer>
    </div>
  );
};
