import React from 'react';
import { RebusCluePanel } from '../types';

interface RebusClueRendererProps {
  panels: RebusCluePanel[];
  formulaText?: string; // Kept in interface for compatibility, but never rendered below questions per instructions
  largeDisplay?: boolean;
  customImageUrl?: string;
  images?: string[];
  watermarkText?: string;
  displayMode?: 'realistic' | 'panels' | 'both';
}

export const RebusClueRenderer: React.FC<RebusClueRendererProps> = ({
  panels,
  largeDisplay = false,
  customImageUrl,
  images,
  watermarkText,
  displayMode = 'realistic',
}) => {
  // Aggregate all available realistic images
  const allImages: string[] = [];
  if (images && images.length > 0) {
    allImages.push(...images);
  } else if (customImageUrl) {
    allImages.push(customImageUrl);
  }

  const hasRealisticImages = allImages.length > 0;
  // If mode is realistic but question doesn't have realistic images yet, fall back to panels
  const showRealistic = (displayMode === 'realistic' || displayMode === 'both') && hasRealisticImages;
  const showPanels = displayMode === 'panels' || (displayMode === 'realistic' && !hasRealisticImages) || displayMode === 'both';

  return (
    <div 
      className="w-full flex flex-col items-center select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 1. REALISTIC PHOTOGRAPHIC IMAGERY (Connected visual clues: Image 1 + Image 2 = Technical Answer) */}
      {showRealistic && (
        <div className={`w-full mb-6 ${largeDisplay ? 'max-w-5xl' : 'max-w-3xl'}`}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFEFF] border border-[#06B6D4]/30 text-[11px] font-tech font-bold text-[#0891B2] tracking-wider shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-pulse" />
              REAL-WORLD PHOTOGRAPHIC CLUES ({allImages.length} CONNECTED IMAGES)
            </span>
          </div>

          <div className={`w-full flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 ${
            allImages.length >= 3 ? 'sm:grid sm:grid-cols-3' : 'sm:flex'
          }`}>
            {allImages.map((imgUrl, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && allImages.length < 3 && (
                  <div className="flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white border-2 border-[#06B6D4]/50 shadow-md font-tech font-bold text-lg sm:text-xl text-[#0891B2] shrink-0 select-none animate-pulse">
                    +
                  </div>
                )}
                <div className="relative flex-1 w-full rounded-2xl overflow-hidden border border-[#DCE6F0] bg-white shadow-md group">
                  {/* Clue Index Badge */}
                  <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md border border-[#06B6D4]/40 text-[10px] font-tech font-bold text-[#0891B2] tracking-wider shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />
                    CLUE {idx + 1}
                  </div>

                  {/* Anti-Screen Capture Dynamic Watermark Overlay */}
                  <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center opacity-15 select-none overflow-hidden">
                    <div className="rotate-[-25deg] whitespace-nowrap text-[12px] font-mono-code font-bold text-[#0891B2] tracking-widest text-center">
                      {watermarkText || "TECH BRIDGE '26 • PROCTOR CONTROLLED • STRICT CONFIDENTIAL"}
                    </div>
                  </div>

                  {/* Realistic Photo Image */}
                  <img
                    src={imgUrl}
                    alt={`Technical Clue ${idx + 1}`}
                    draggable={false}
                    referrerPolicy="no-referrer"
                    className={`w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] pointer-events-none select-none ${
                      largeDisplay ? 'h-60 sm:h-80' : 'h-44 sm:h-56'
                    }`}
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* 2. EXISTING VECTOR CLUE PANELS (Visual cryptographic illustrations without descriptions) */}
      {showPanels && (
        <div className={`w-full grid gap-4 ${
          panels.length === 2 
            ? (largeDisplay ? 'grid-cols-2 max-w-4xl' : 'grid-cols-1 md:grid-cols-2 max-w-2xl')
            : panels.length === 3
            ? (largeDisplay ? 'grid-cols-3 max-w-5xl' : 'grid-cols-1 md:grid-cols-3 max-w-3xl')
            : (largeDisplay ? 'grid-cols-2 lg:grid-cols-4 max-w-6xl' : 'grid-cols-2 max-w-3xl')
        }`}>
          {panels.map((panel, idx) => (
            <div
              key={panel.panelNumber || idx}
              className={`relative flex flex-col items-center justify-between rounded-xl border border-[#DCE6F0] bg-white p-4 transition-all duration-300 shadow-sm print:bg-white print:border-gray-300 print:shadow-none print:p-2.5 ${
                largeDisplay ? 'min-h-[300px] p-6' : 'min-h-[190px]'
              }`}
            >
              {/* Panel Header Tag */}
              <div className="w-full flex items-center justify-between border-b border-[#DCE6F0] pb-2 mb-2 print:border-gray-200">
                <span className="font-tech text-xs tracking-widest text-[#0891B2] font-semibold px-2 py-0.5 rounded bg-[#ECFEFF] border border-[#06B6D4]/30 print:bg-gray-100 print:text-black print:border-gray-300">
                  PANEL {panel.panelNumber || idx + 1}
                </span>
                <span className="text-[11px] font-mono-code text-[#64748B] tracking-wider print:text-gray-600">
                  VISUAL CLUE
                </span>
              </div>

              {/* Panel SVG Art (Symbolic Conceptual Rebus Clue - NO descriptions shown per user directive) */}
              <div className={`w-full flex items-center justify-center my-auto text-[#172033] ${
                largeDisplay ? 'h-48' : 'h-32'
              }`}>
                <PanelVectorArt type={panel.svgType} large={largeDisplay} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NOTE: All synthesis text below the questions is strictly removed per user instruction */}
    </div>
  );
};

// Render rich, distinct vector graphics for each conceptual clue without any text description
export const PanelVectorArt: React.FC<{ type: string; large?: boolean }> = ({ type, large }) => {
  const size = large ? 140 : 96;

  switch (type) {
    case 'brain':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.3)]">
          <path d="M30 40C22 40 18 46 18 54C18 64 26 68 32 72C36 74 40 82 50 82C60 82 64 74 68 72C74 68 82 64 82 54C82 46 78 40 70 40C70 30 62 22 50 22C38 22 30 30 30 40Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="rgba(6,182,212,0.06)" />
          <path d="M50 22V82M35 34C40 38 45 42 50 42C55 42 60 38 65 34M30 52C38 52 42 58 50 58C58 58 62 52 70 52M32 68C40 66 45 70 50 70C55 70 60 66 68 68" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" opacity="0.8" />
          <circle cx="34" cy="44" r="2.5" fill="#38bdf8" />
          <circle cx="66" cy="44" r="2.5" fill="#38bdf8" />
          <circle cx="50" cy="58" r="3" fill="#06b6d4" />
        </svg>
      );

    case 'leak':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-sky-400">
          <rect x="25" y="24" width="50" height="12" rx="2" stroke="currentColor" strokeWidth="2.5" fill="rgba(56,189,248,0.1)" />
          <rect x="42" y="36" width="16" height="18" stroke="currentColor" strokeWidth="2.5" fill="rgba(56,189,248,0.15)" />
          <path d="M50 54C50 54 44 64 44 70C44 73.3 46.7 76 50 76C53.3 76 56 73.3 56 70C56 64 50 54 50 54Z" fill="#38bdf8" />
          <path d="M50 79C50 79 46 84 46 87C46 89.2 47.8 91 50 91C52.2 91 54 89.2 54 87C54 84 50 79 50 79Z" fill="#0284c7" opacity="0.85" />
          <ellipse cx="50" cy="94" rx="22" ry="3" fill="rgba(56,189,248,0.3)" />
        </svg>
      );

    case 'plates':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-amber-400">
          <ellipse cx="50" cy="80" rx="36" ry="7" stroke="currentColor" strokeWidth="2.5" fill="rgba(251,191,36,0.1)" />
          <ellipse cx="50" cy="66" rx="34" ry="7" stroke="currentColor" strokeWidth="2.5" fill="rgba(251,191,36,0.15)" />
          <ellipse cx="50" cy="52" rx="32" ry="7" stroke="currentColor" strokeWidth="2.5" fill="rgba(251,191,36,0.2)" />
          <ellipse cx="50" cy="38" rx="30" ry="7" stroke="currentColor" strokeWidth="2.5" fill="rgba(251,191,36,0.25)" />
          <ellipse cx="50" cy="24" rx="28" ry="7" stroke="currentColor" strokeWidth="2.5" fill="rgba(251,191,36,0.3)" />
          <path d="M50 14V18M45 16H55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'overflow':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-rose-400">
          <path d="M28 35H72L65 82H35L28 35Z" stroke="currentColor" strokeWidth="2.5" fill="rgba(244,63,94,0.08)" />
          <path d="M24 38C32 42 42 32 50 38C58 44 68 34 76 38" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M28 38C22 42 20 54 22 66" stroke="currentColor" strokeWidth="2.5" strokeDasharray="2 4" />
          <path d="M72 38C78 44 80 56 78 68" stroke="currentColor" strokeWidth="2.5" strokeDasharray="2 4" />
          <circle cx="20" cy="72" r="3" fill="#f43f5e" />
          <circle cx="80" cy="74" r="3" fill="#f43f5e" />
          <path d="M50 20V28M46 24L50 28L54 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'cpu':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-cyan-400">
          <rect x="26" y="26" width="48" height="48" rx="6" stroke="currentColor" strokeWidth="2.5" fill="rgba(6,182,212,0.12)" />
          <rect x="36" y="36" width="28" height="28" rx="3" stroke="#38bdf8" strokeWidth="2" fill="rgba(56,189,248,0.2)" />
          {/* Pins Top & Bottom */}
          <path d="M34 16V26M50 16V26M66 16V26M34 74V84M50 74V84M66 74V84" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          {/* Pins Left & Right */}
          <path d="M16 34H26M16 50H26M16 66H26M74 34H84M74 50H84M74 66H84" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          {/* Central Silicon Core */}
          <circle cx="50" cy="50" r="4" fill="#38bdf8" />
        </svg>
      );

    case 'terminal':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-emerald-400">
          <rect x="18" y="24" width="64" height="52" rx="6" stroke="currentColor" strokeWidth="2.5" fill="rgba(16,185,129,0.08)" />
          <line x1="18" y1="36" x2="82" y2="36" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="26" cy="30" r="2" fill="#ef4444" />
          <circle cx="32" cy="30" r="2" fill="#eab308" />
          <circle cx="38" cy="30" r="2" fill="#10b981" />
          {/* Prompt >_ */}
          <path d="M28 48L36 54L28 60" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="40" y1="60" x2="52" y2="60" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'shield_check':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-teal-400">
          <path d="M50 18L76 28V52C76 68 64 80 50 84C36 80 24 68 24 52V28L50 18Z" stroke="currentColor" strokeWidth="2.5" fill="rgba(20,184,166,0.12)" />
          <path d="M38 52L46 60L64 42" stroke="#2dd4bf" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'book_library':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-amber-300">
          <path d="M20 28C32 24 46 26 50 30C54 26 68 24 80 28V76C68 72 54 74 50 78C46 74 32 72 20 76V28Z" stroke="currentColor" strokeWidth="2.5" fill="rgba(252,211,77,0.1)" />
          <line x1="50" y1="30" x2="50" y2="78" stroke="currentColor" strokeWidth="2" />
          <path d="M26 40C34 38 42 39 46 41M26 52C34 50 42 51 46 53M54 41C58 39 66 38 74 40M54 53C58 51 66 50 74 52" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        </svg>
      );

    case 'wire_circuit':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-cyan-400">
          <rect x="22" y="22" width="56" height="56" rx="8" stroke="currentColor" strokeWidth="2" fill="rgba(6,182,212,0.06)" />
          <circle cx="34" cy="34" r="4" fill="#06b6d4" />
          <circle cx="66" cy="34" r="4" fill="#06b6d4" />
          <circle cx="34" cy="66" r="4" fill="#06b6d4" />
          <circle cx="66" cy="66" r="4" fill="#06b6d4" />
          <circle cx="50" cy="50" r="5" stroke="#38bdf8" strokeWidth="2" fill="#0284c7" />
          <path d="M34 34H50V50M66 34V50H50M34 66V50M66 66H50" stroke="currentColor" strokeWidth="2" />
        </svg>
      );

    case 'cube_grid':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-indigo-400">
          {/* Top cube */}
          <path d="M50 18L68 28L50 38L32 28L50 18Z" stroke="currentColor" strokeWidth="2" fill="rgba(129,140,248,0.2)" />
          <path d="M32 28V46L50 56V38L32 28Z" stroke="currentColor" strokeWidth="2" fill="rgba(129,140,248,0.12)" />
          <path d="M68 28V46L50 56V38L68 28Z" stroke="currentColor" strokeWidth="2" fill="rgba(129,140,248,0.16)" />
          {/* Bottom Left Cube */}
          <path d="M30 48L44 56L30 64L16 56L30 48Z" stroke="currentColor" strokeWidth="1.5" fill="rgba(129,140,248,0.15)" />
          <path d="M16 56V72L30 80V64L16 56Z" stroke="currentColor" strokeWidth="1.5" fill="rgba(129,140,248,0.1)" />
          <path d="M44 56V72L30 80V64L44 56Z" stroke="currentColor" strokeWidth="1.5" fill="rgba(129,140,248,0.12)" />
          {/* Bottom Right Cube */}
          <path d="M70 48L84 56L70 64L56 56L70 48Z" stroke="currentColor" strokeWidth="1.5" fill="rgba(129,140,248,0.15)" />
          <path d="M56 56V72L70 80V64L56 56Z" stroke="currentColor" strokeWidth="1.5" fill="rgba(129,140,248,0.1)" />
          <path d="M84 56V72L70 80V64L84 56Z" stroke="currentColor" strokeWidth="1.5" fill="rgba(129,140,248,0.12)" />
        </svg>
      );

    case 'lightning':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-yellow-400">
          <path d="M56 16L28 50H50L44 84L72 46H50L56 16Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="rgba(250,204,21,0.2)" />
        </svg>
      );

    case 'gear_spin':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-slate-300">
          <circle cx="50" cy="50" r="18" stroke="currentColor" strokeWidth="2.5" fill="rgba(203,213,225,0.1)" />
          <circle cx="50" cy="50" r="8" stroke="currentColor" strokeWidth="2" fill="#475569" />
          <path d="M50 16V24M50 76V84M16 50H24M76 50H84M26 26L32 32M68 68L74 74M26 74L32 68M68 32L74 26" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );

    case 'server_farm':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-blue-400">
          {/* Server Rack 1 */}
          <rect x="22" y="20" width="56" height="16" rx="3" stroke="currentColor" strokeWidth="2" fill="rgba(96,165,250,0.1)" />
          <circle cx="30" cy="28" r="2.5" fill="#34d399" />
          <circle cx="38" cy="28" r="2.5" fill="#38bdf8" />
          <line x1="50" y1="28" x2="70" y2="28" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
          {/* Server Rack 2 */}
          <rect x="22" y="42" width="56" height="16" rx="3" stroke="currentColor" strokeWidth="2" fill="rgba(96,165,250,0.1)" />
          <circle cx="30" cy="50" r="2.5" fill="#34d399" />
          <circle cx="38" cy="50" r="2.5" fill="#38bdf8" />
          <line x1="50" y1="50" x2="70" y2="50" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
          {/* Server Rack 3 */}
          <rect x="22" y="64" width="56" height="16" rx="3" stroke="currentColor" strokeWidth="2" fill="rgba(96,165,250,0.1)" />
          <circle cx="30" cy="72" r="2.5" fill="#34d399" />
          <circle cx="38" cy="72" r="2.5" fill="#38bdf8" />
          <line x1="50" y1="72" x2="70" y2="72" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
        </svg>
      );

    case 'arrows_sync':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-cyan-400">
          <path d="M50 20C66 20 80 34 80 50C80 56 78 62 74 68" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M68 68H76V60" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M50 80C34 80 20 66 20 50C20 44 22 38 26 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M32 32H24V40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="50" cy="50" r="6" fill="#06b6d4" />
        </svg>
      );

    case 'water_bucket':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-sky-400">
          <path d="M26 36L34 82H66L74 36H26Z" stroke="currentColor" strokeWidth="2.5" fill="rgba(56,189,248,0.15)" />
          <path d="M28 36C28 22 72 22 72 36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Water level */}
          <path d="M32 54C40 50 60 58 68 54" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
          <circle cx="50" cy="66" r="3" fill="#38bdf8" />
        </svg>
      );

    case 'traffic_light':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-slate-400">
          <rect x="36" y="16" width="28" height="68" rx="6" stroke="currentColor" strokeWidth="2.5" fill="#0f172a" />
          <circle cx="50" cy="30" r="7" fill="#ef4444" className="drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
          <circle cx="50" cy="50" r="7" fill="#eab308" />
          <circle cx="50" cy="70" r="7" fill="#10b981" />
        </svg>
      );

    case 'umbrella':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-violet-400">
          <path d="M18 52C18 34 32 20 50 20C68 20 82 34 82 52H18Z" stroke="currentColor" strokeWidth="2.5" fill="rgba(167,139,250,0.15)" />
          <line x1="50" y1="20" x2="50" y2="76" stroke="currentColor" strokeWidth="2.5" />
          <path d="M50 76C50 82 42 82 42 76" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>
      );

    case 'wifi_signal':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-sky-400">
          <path d="M18 36C38 18 62 18 82 36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M28 48C42 34 58 34 72 48" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M38 60C45 52 55 52 62 60" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <circle cx="50" cy="74" r="5" fill="currentColor" />
        </svg>
      );

    case 'wrench_tool':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-slate-300">
          <path d="M68 24C62 20 54 22 50 26L28 70C26 74 28 78 32 80C36 82 40 80 42 76L64 34C68 30 76 30 78 36L86 34L84 20L72 20L68 24Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="rgba(203,213,225,0.15)" />
          <circle cx="34" cy="74" r="3" fill="#64748b" />
        </svg>
      );

    case 'puzzle_piece':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-fuchsia-400">
          <path d="M26 26H42C42 20 58 20 58 26H74V42C80 42 80 58 74 58V74H58C58 68 42 68 42 74H26V58C32 58 32 42 26 42V26Z" stroke="currentColor" strokeWidth="2.5" fill="rgba(232,121,249,0.12)" />
        </svg>
      );

    case 'search_glass':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-cyan-400">
          <circle cx="44" cy="44" r="22" stroke="currentColor" strokeWidth="3" fill="rgba(6,182,212,0.1)" />
          <line x1="60" y1="60" x2="82" y2="82" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <circle cx="44" cy="44" r="14" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
      );

    case 'table':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-emerald-400">
          <rect x="20" y="24" width="60" height="52" rx="4" stroke="currentColor" strokeWidth="2.5" fill="rgba(16,185,129,0.08)" />
          <line x1="20" y1="40" x2="80" y2="40" stroke="currentColor" strokeWidth="2" />
          <line x1="20" y1="56" x2="80" y2="56" stroke="currentColor" strokeWidth="1.5" />
          <line x1="40" y1="24" x2="40" y2="76" stroke="currentColor" strokeWidth="2" />
          <line x1="60" y1="24" x2="60" y2="76" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );

    case 'pipe':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-slate-300">
          <path d="M20 34H56C64 34 70 40 70 48V80H54V54C54 50 50 46 46 46H20V34Z" stroke="currentColor" strokeWidth="2.5" fill="rgba(148,163,184,0.15)" />
          <rect x="16" y="30" width="6" height="20" rx="1" fill="currentColor" />
          <rect x="50" y="76" width="24" height="6" rx="1" fill="currentColor" />
        </svg>
      );

    case 'balance':
    case 'scale':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-teal-400">
          <line x1="50" y1="20" x2="50" y2="82" stroke="currentColor" strokeWidth="3" />
          <path d="M35 82H65" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <line x1="22" y1="34" x2="78" y2="34" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          {/* Left Pan */}
          <line x1="22" y1="34" x2="14" y2="56" stroke="currentColor" strokeWidth="1.5" />
          <line x1="22" y1="34" x2="30" y2="56" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 56H34C34 64 10 64 10 56Z" fill="rgba(45,212,191,0.2)" stroke="currentColor" strokeWidth="2" />
          {/* Right Pan */}
          <line x1="78" y1="34" x2="70" y2="56" stroke="currentColor" strokeWidth="1.5" />
          <line x1="78" y1="34" x2="86" y2="56" stroke="currentColor" strokeWidth="1.5" />
          <path d="M66 56H90C90 64 66 64 66 56Z" fill="rgba(45,212,191,0.2)" stroke="currentColor" strokeWidth="2" />
        </svg>
      );

    case 'clock':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-amber-400">
          <circle cx="50" cy="52" r="32" stroke="currentColor" strokeWidth="2.5" fill="rgba(251,191,36,0.1)" />
          <circle cx="50" cy="52" r="3" fill="currentColor" />
          <line x1="50" y1="52" x2="50" y2="30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="50" y1="52" x2="66" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <rect x="46" y="14" width="8" height="6" rx="1" fill="currentColor" />
        </svg>
      );

    case 'brush':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-pink-400">
          <path d="M30 70L66 30L74 38L38 78H30V70Z" stroke="currentColor" strokeWidth="2" fill="rgba(244,114,182,0.15)" />
          <path d="M66 30L72 22C74 20 78 20 80 22C82 24 82 28 80 30L74 38" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M26 84C32 84 36 80 36 78" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'key_lock':
    case 'lock_key':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-yellow-400">
          <rect x="26" y="44" width="48" height="42" rx="6" stroke="currentColor" strokeWidth="2.5" fill="rgba(250,204,21,0.1)" />
          <path d="M36 44V32C36 24.3 42.3 18 50 18C57.7 18 64 24.3 64 32V44" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <circle cx="50" cy="62" r="5" fill="currentColor" />
          <path d="M50 67V75" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'road_deadlock':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-orange-400">
          <rect x="36" y="10" width="28" height="80" fill="rgba(148,163,184,0.1)" stroke="#475569" strokeWidth="1.5" />
          <rect x="10" y="36" width="80" height="28" fill="rgba(148,163,184,0.1)" stroke="#475569" strokeWidth="1.5" />
          <rect x="42" y="18" width="16" height="12" rx="2" fill="#f97316" />
          <rect x="70" y="42" width="12" height="16" rx="2" fill="#ef4444" />
          <rect x="42" y="70" width="16" height="12" rx="2" fill="#eab308" />
          <rect x="18" y="42" width="12" height="16" rx="2" fill="#06b6d4" />
          <path d="M38 38L62 38M62 38L62 62M62 62L38 62M38 62L38 38" stroke="#f97316" strokeWidth="2" strokeDasharray="3 3" />
        </svg>
      );

    case 'docker_whale':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-cyan-300">
          <rect x="32" y="30" width="10" height="8" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
          <rect x="44" y="30" width="10" height="8" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
          <rect x="56" y="30" width="10" height="8" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
          <rect x="38" y="20" width="10" height="8" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
          <rect x="50" y="20" width="10" height="8" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
          <path d="M18 52C22 42 42 42 66 42C78 42 86 48 88 56C88 64 78 72 58 72C38 72 22 68 18 52Z" fill="rgba(6,182,212,0.2)" stroke="currentColor" strokeWidth="2.5" />
          <path d="M18 52C14 46 10 44 8 48C6 52 10 58 14 58Z" fill="currentColor" />
          <circle cx="78" cy="52" r="2" fill="#0f172a" />
          <path d="M14 78C26 75 36 81 48 78C60 75 70 81 82 78" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'tree':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-emerald-400">
          <circle cx="50" cy="22" r="8" fill="rgba(52,211,153,0.2)" stroke="currentColor" strokeWidth="2.5" />
          <line x1="44" y1="28" x2="30" y2="48" stroke="currentColor" strokeWidth="2" />
          <line x1="56" y1="28" x2="70" y2="48" stroke="currentColor" strokeWidth="2" />
          <circle cx="30" cy="52" r="7" fill="rgba(52,211,153,0.2)" stroke="currentColor" strokeWidth="2" />
          <circle cx="70" cy="52" r="7" fill="rgba(52,211,153,0.2)" stroke="currentColor" strokeWidth="2" />
          <line x1="26" y1="58" x2="18" y2="76" stroke="currentColor" strokeWidth="1.5" />
          <line x1="34" y1="58" x2="42" y2="76" stroke="currentColor" strokeWidth="1.5" />
          <line x1="66" y1="58" x2="58" y2="76" stroke="currentColor" strokeWidth="1.5" />
          <line x1="74" y1="58" x2="82" y2="76" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="18" cy="80" r="5" fill="currentColor" />
          <circle cx="42" cy="80" r="5" fill="currentColor" />
          <circle cx="58" cy="80" r="5" fill="currentColor" />
          <circle cx="82" cy="80" r="5" fill="currentColor" />
        </svg>
      );

    case 'firewall':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-orange-500">
          <rect x="18" y="25" width="64" height="52" stroke="currentColor" strokeWidth="2.5" fill="rgba(249,115,22,0.12)" />
          <line x1="18" y1="42" x2="82" y2="42" stroke="currentColor" strokeWidth="2" />
          <line x1="18" y1="59" x2="82" y2="59" stroke="currentColor" strokeWidth="2" />
          <line x1="40" y1="25" x2="40" y2="42" stroke="currentColor" strokeWidth="2" />
          <line x1="62" y1="25" x2="62" y2="42" stroke="currentColor" strokeWidth="2" />
          <line x1="30" y1="42" x2="30" y2="59" stroke="currentColor" strokeWidth="2" />
          <line x1="52" y1="42" x2="52" y2="59" stroke="currentColor" strokeWidth="2" />
          <line x1="74" y1="42" x2="74" y2="59" stroke="currentColor" strokeWidth="2" />
          <path d="M50 14C45 24 40 28 40 38C40 45 44 49 50 49C56 49 60 45 60 38C60 28 55 24 50 14Z" fill="#ea580c" opacity="0.9" />
        </svg>
      );

    case 'cloud':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-sky-400">
          <path d="M30 68H72C80.8 68 88 60.8 88 52C88 43.6 81.6 36.8 73.4 36.1C71.6 25.6 62.4 18 51.5 18C41.2 18 32.5 24.8 30.1 34.6C23.3 35.8 18 41.8 18 49C18 59.5 26.5 68 30 68Z" stroke="currentColor" strokeWidth="2.5" fill="rgba(56,189,248,0.12)" />
          <circle cx="44" cy="46" r="3" fill="#38bdf8" />
          <circle cx="60" cy="42" r="3" fill="#38bdf8" />
          <circle cx="54" cy="56" r="3" fill="#38bdf8" />
          <line x1="44" y1="46" x2="60" y2="42" stroke="currentColor" strokeWidth="1.5" />
          <line x1="44" y1="46" x2="54" y2="56" stroke="currentColor" strokeWidth="1.5" />
          <line x1="60" y1="42" x2="54" y2="56" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );

    case 'cookie':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-amber-500">
          <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="2.5" fill="rgba(245,158,11,0.15)" />
          <circle cx="42" cy="38" r="3.5" fill="#78350f" />
          <circle cx="58" cy="42" r="3.5" fill="#78350f" />
          <circle cx="36" cy="58" r="3.5" fill="#78350f" />
          <circle cx="54" cy="62" r="3.5" fill="#78350f" />
          <circle cx="66" cy="56" r="3" fill="#78350f" />
        </svg>
      );

    case 'handshake':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-emerald-400">
          <path d="M18 42L36 32L50 46L36 58Z" stroke="currentColor" strokeWidth="2.5" fill="rgba(52,211,153,0.1)" />
          <path d="M82 42L64 32L50 46L64 58Z" stroke="currentColor" strokeWidth="2.5" fill="rgba(52,211,153,0.1)" />
          <path d="M42 42L58 56M46 38L62 52M38 46L54 60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M30 76L42 76L46 68L52 84L58 72L62 76L74 76" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'pipeline':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-indigo-400">
          <rect x="16" y="40" width="68" height="20" rx="2" stroke="currentColor" strokeWidth="2.5" fill="rgba(129,140,248,0.12)" />
          <ellipse cx="16" cy="50" rx="4" ry="10" stroke="currentColor" strokeWidth="2" />
          <ellipse cx="84" cy="50" rx="4" ry="10" stroke="currentColor" strokeWidth="2" />
          <line x1="33" y1="40" x2="33" y2="60" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />
          <line x1="50" y1="40" x2="50" y2="60" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />
          <line x1="67" y1="40" x2="67" y2="60" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />
          <circle cx="24" cy="50" r="3" fill="#818cf8" />
          <circle cx="41" cy="50" r="3" fill="#818cf8" />
          <circle cx="58" cy="50" r="3" fill="#818cf8" />
          <circle cx="75" cy="50" r="3" fill="#818cf8" />
        </svg>
      );

    case 'cache':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-fuchsia-400">
          <rect x="22" y="26" width="56" height="48" rx="6" stroke="currentColor" strokeWidth="2.5" fill="rgba(232,121,249,0.1)" />
          <rect x="32" y="36" width="36" height="28" rx="3" stroke="currentColor" strokeWidth="2" fill="rgba(232,121,249,0.2)" />
          <path d="M52 20L42 48H52L46 68L62 42H52L58 20H52Z" fill="#e879f9" opacity="0.9" />
        </svg>
      );

    case 'git_branch':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-rose-400">
          <circle cx="34" cy="28" r="6" stroke="currentColor" strokeWidth="2.5" fill="rgba(244,63,94,0.2)" />
          <circle cx="34" cy="72" r="6" stroke="currentColor" strokeWidth="2.5" fill="rgba(244,63,94,0.2)" />
          <circle cx="68" cy="46" r="6" stroke="currentColor" strokeWidth="2.5" fill="rgba(244,63,94,0.3)" />
          <line x1="34" y1="34" x2="34" y2="66" stroke="currentColor" strokeWidth="2.5" />
          <path d="M34 66C34 52 68 56 68 52" stroke="currentColor" strokeWidth="2.5" fill="none" />
        </svg>
      );

    case 'neural':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-pink-400">
          <circle cx="26" cy="32" r="5" fill="currentColor" />
          <circle cx="26" cy="68" r="5" fill="currentColor" />
          <circle cx="50" cy="24" r="5" fill="#f472b6" />
          <circle cx="50" cy="50" r="5" fill="#f472b6" />
          <circle cx="50" cy="76" r="5" fill="#f472b6" />
          <circle cx="74" cy="50" r="6" fill="#fb7185" />
          <line x1="26" y1="32" x2="50" y2="24" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          <line x1="26" y1="32" x2="50" y2="50" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          <line x1="26" y1="68" x2="50" y2="50" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          <line x1="26" y1="68" x2="50" y2="76" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          <line x1="50" y1="24" x2="74" y2="50" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          <line x1="50" y1="50" x2="74" y2="50" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
          <line x1="50" y1="76" x2="74" y2="50" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        </svg>
      );

    case 'network_mesh':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-cyan-400">
          {/* Interconnected Mesh Lines */}
          <line x1="25" y1="35" x2="50" y2="20" stroke="currentColor" strokeWidth="2" opacity="0.6" />
          <line x1="25" y1="35" x2="75" y2="35" stroke="currentColor" strokeWidth="2" opacity="0.5" />
          <line x1="25" y1="35" x2="35" y2="75" stroke="currentColor" strokeWidth="2" opacity="0.6" />
          <line x1="25" y1="35" x2="50" y2="55" stroke="currentColor" strokeWidth="2.5" opacity="0.9" />
          <line x1="50" y1="20" x2="75" y2="35" stroke="currentColor" strokeWidth="2" opacity="0.6" />
          <line x1="50" y1="20" x2="50" y2="55" stroke="currentColor" strokeWidth="2.5" opacity="0.8" />
          <line x1="75" y1="35" x2="65" y2="75" stroke="currentColor" strokeWidth="2" opacity="0.6" />
          <line x1="75" y1="35" x2="50" y2="55" stroke="currentColor" strokeWidth="2.5" opacity="0.9" />
          <line x1="35" y1="75" x2="65" y2="75" stroke="currentColor" strokeWidth="2" opacity="0.6" />
          <line x1="35" y1="75" x2="50" y2="55" stroke="currentColor" strokeWidth="2.5" opacity="0.8" />
          <line x1="65" y1="75" x2="50" y2="55" stroke="currentColor" strokeWidth="2.5" opacity="0.8" />
          {/* Mesh Nodes */}
          <circle cx="50" cy="20" r="5" fill="#38bdf8" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="25" cy="35" r="5" fill="#38bdf8" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="75" cy="35" r="5" fill="#38bdf8" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="35" cy="75" r="5" fill="#38bdf8" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="65" cy="75" r="5" fill="#38bdf8" stroke="currentColor" strokeWidth="1.5" />
          {/* Central Hub Node */}
          <circle cx="50" cy="55" r="8" fill="rgba(6,182,212,0.25)" stroke="#06b6d4" strokeWidth="2.5" />
          <circle cx="50" cy="55" r="3.5" fill="#22d3ee" />
        </svg>
      );

    case 'daemon':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-purple-400">
          {/* Background Service Halo / Process Ring */}
          <circle cx="50" cy="54" r="36" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
          {/* Daemon Horns */}
          <path d="M32 38C26 26 20 28 22 20C30 22 36 30 38 34" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" fill="rgba(192,132,252,0.2)" />
          <path d="M68 38C74 26 80 28 78 20C70 22 64 30 62 34" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" fill="rgba(192,132,252,0.2)" />
          {/* Daemon Head Crest */}
          <circle cx="50" cy="52" r="22" stroke="currentColor" strokeWidth="2.5" fill="rgba(168,85,247,0.15)" />
          {/* Glowing Eyes */}
          <circle cx="42" cy="48" r="3.5" fill="#f43f5e" />
          <circle cx="58" cy="48" r="3.5" fill="#f43f5e" />
          {/* Sly Smile */}
          <path d="M42 58C46 63 54 63 58 58" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          {/* Background Process Gear Accent */}
          <path d="M47 78H53M44 82H56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        </svg>
      );

    case 'matrix':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-emerald-400">
          {/* Matrix Left Bracket */}
          <path d="M28 22H20V78H28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          {/* Matrix Right Bracket */}
          <path d="M72 22H80V78H72" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          {/* 3x3 Grid Points / Elements */}
          <circle cx="34" cy="34" r="4" fill="#34d399" />
          <circle cx="50" cy="34" r="4" fill="#10b981" />
          <circle cx="66" cy="34" r="4" fill="#34d399" />
          <circle cx="34" cy="50" r="4" fill="#10b981" />
          <circle cx="50" cy="50" r="5" fill="#6ee7b7" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="66" cy="50" r="4" fill="#10b981" />
          <circle cx="34" cy="66" r="4" fill="#34d399" />
          <circle cx="50" cy="66" r="4" fill="#10b981" />
          <circle cx="66" cy="66" r="4" fill="#34d399" />
        </svg>
      );

    case 'token':
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-cyan-400">
          <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="2.5" fill="rgba(6,182,212,0.1)" />
          <circle cx="50" cy="50" r="26" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
          <polygon points="50,30 65,40 65,60 50,70 35,60 35,40" stroke="currentColor" strokeWidth="2" fill="rgba(6,182,212,0.15)" />
          <circle cx="50" cy="50" r="4" fill="#38bdf8" />
        </svg>
      );
  }
};
