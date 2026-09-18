import React, { useState } from 'react';
import { 
  Printer, 
  ShieldAlert, 
  FileText, 
  CheckCircle2, 
  Filter, 
  Layers, 
  HelpCircle, 
  Eye, 
  BookOpen,
  Download,
  FileCode
} from 'lucide-react';
import { SEED_QUESTIONS } from '../data/seedQuestions';
import { Question, RoundNumber, QuestionSet } from '../types';
import { PanelVectorArt } from './RebusClueRenderer';

export const EmergencyOfflineModal: React.FC = () => {
  const [selectedRound, setSelectedRound] = useState<'ALL' | RoundNumber>('ALL');
  const [selectedSet, setSelectedSet] = useState<'ALL' | QuestionSet>('ALL');
  const [packetMode, setPacketMode] = useState<'MASTER_KEY' | 'STUDENT_EXAM'>('MASTER_KEY');

  const filteredQuestions = SEED_QUESTIONS.filter((q) => {
    if (selectedRound !== 'ALL' && q.round !== selectedRound) return false;
    if (selectedSet !== 'ALL' && (q.set || 'A') !== selectedSet) return false;
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHtml = (mode: 'MASTER_KEY' | 'STUDENT_EXAM') => {
    const title = mode === 'MASTER_KEY'
      ? 'TechBridge26_Official_Evaluation_Key'
      : 'TechBridge26_Candidate_Exam_Sheet';

    const questionsHtml = filteredQuestions.map((q, idx) => `
      <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin-bottom: 20px; page-break-inside: avoid; font-family: sans-serif;">
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px;">
          <div>
            <strong style="font-size: 15px; color: #0f172a;">QUESTION #${idx + 1} &bull; ROUND ${q.round} (SET ${q.set || 'A'})</strong>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Domain: ${q.domain} &bull; Difficulty: ${q.difficulty} &bull; Points: ${q.points} pt(s)</div>
          </div>
          <div style="font-size: 12px; font-weight: bold; color: #475569;">ID: ${q.id}</div>
        </div>

        <div style="font-size: 13px; font-weight: 600; color: #1e293b; margin-bottom: 10px;">
          Decipher the visual technical computer science rebus from the clue panels below:
        </div>

        <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 12px;">
          ${q.cluePanels.map((p, pIdx) => `
            <div style="border: 1px solid #94a3b8; border-radius: 6px; padding: 8px; width: 140px; text-align: center; background: #f8fafc;">
              <div style="font-size: 10px; font-weight: bold; color: #0284c7; margin-bottom: 4px;">PANEL ${p.panelNumber || pIdx + 1}</div>
              <div style="font-size: 11px; font-weight: 600; color: #0f172a; margin-bottom: 2px;">${p.subText || p.svgType}</div>
              <div style="font-size: 9px; color: #64748b; font-style: italic;">${p.description}</div>
            </div>
          `).join('')}
        </div>

        <div style="font-size: 12px; font-family: monospace; background: #f1f5f9; padding: 6px 10px; border-radius: 4px; margin-bottom: 10px; border: 1px solid #e2e8f0;">
          <strong>REBUS FORMULA:</strong> ${q.rebusFormulaText}
        </div>

        ${mode === 'MASTER_KEY' ? `
          <div style="background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 6px; padding: 10px; margin-top: 10px;">
            <div style="font-size: 13px; font-weight: bold; color: #065f46;">CORRECT ANSWER: ${q.correctAnswer}</div>
            ${q.aliases && q.aliases.length > 0 ? `<div style="font-size: 11px; color: #047857;">Accepted Aliases: ${q.aliases.join(', ')}</div>` : ''}
            <div style="font-size: 11px; color: #047857; margin-top: 4px;"><strong>Technical Explanation:</strong> ${q.explanation}</div>
          </div>
        ` : `
          <div style="border: 2px dashed #94a3b8; border-radius: 6px; padding: 14px; margin-top: 10px; background: #fafafa;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 12px; font-weight: bold; color: #475569;">CANDIDATE ANSWER BLANK:</span>
              <span style="font-size: 11px; color: #64748b;">SCORE: [ &nbsp; &nbsp; &nbsp; / ${q.points} ]</span>
            </div>
            <div style="margin-top: 16px; border-bottom: 1.5px solid #334155; height: 24px;"></div>
          </div>
        `}
      </div>
    `).join('');

    const htmlDoc = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title} - Tech Bridge '26</title>
        <style>
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; color: #0f172a; max-width: 900px; margin: 0 auto; }
          .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
          .title { font-size: 20px; font-weight: bold; }
          .sub { font-size: 13px; color: #475569; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div style="font-size: 11px; font-weight: bold; color: #0284c7;">DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING &bull; ACET</div>
            <div class="title">TECH BRIDGE '26 &bull; VISUAL TECHNICAL REBUS CHALLENGE</div>
            <div class="sub">${mode === 'MASTER_KEY' ? 'CONFIDENTIAL EVALUATOR MASTER KEY & MARKING SCHEME' : 'OFFICIAL CANDIDATE EXAM SHEET & REBUS WORKBOOK'}</div>
          </div>
          <div style="text-align: right; font-size: 11px; font-family: monospace;">
            <div>Round: ${selectedRound} &bull; Set: ${selectedSet}</div>
            <div>Questions: ${filteredQuestions.length}</div>
            <div>Date: March 2026</div>
          </div>
        </div>
        ${questionsHtml}
      </body>
      </html>
    `;

    const blob = new Blob([htmlDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}_R${selectedRound}_Set${selectedSet}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const payload = {
      title: "TECH BRIDGE '26 REBUS PACKET",
      exportedAt: new Date().toISOString(),
      round: selectedRound,
      set: selectedSet,
      totalQuestions: filteredQuestions.length,
      questions: filteredQuestions,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TechBridge26_Questions_R${selectedRound}_Set${selectedSet}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Action & Filter Bar (Hidden on Print) */}
      <div className="bg-white border border-[#DCE6F0] rounded-2xl p-5 sm:p-6 shadow-sm print:hidden space-y-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-tech text-xl font-bold text-[#172033] tracking-wider">
                EMERGENCY OFFLINE PACKET & REBUS DIAGRAMS
              </h1>
              <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                CSE SYMPOSIUM OFFICIAL
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Complete printable visual question booklet containing technical rebus clue diagrams, synthesis formulas, and evaluation keys for contingency power/network failure.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => handleDownloadHtml('MASTER_KEY')}
              className="py-2.5 px-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs font-tech tracking-wider flex items-center gap-1.5 border border-emerald-200 shadow-xs transition cursor-pointer"
              title="Download standalone HTML document of the Evaluation Key"
            >
              <Download className="w-4 h-4" />
              DOWNLOAD EVALUATION KEY
            </button>

            <button
              onClick={() => handleDownloadHtml('STUDENT_EXAM')}
              className="py-2.5 px-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs font-tech tracking-wider flex items-center gap-1.5 border border-blue-200 shadow-xs transition cursor-pointer"
              title="Download standalone HTML document of the Candidate Exam Sheet"
            >
              <Download className="w-4 h-4" />
              DOWNLOAD CANDIDATE SHEET
            </button>

            <button
              onClick={handlePrint}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#2563EB] hover:from-[#0891B2] hover:to-[#1D4ED8] text-white font-bold text-xs font-tech tracking-wider flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              PRINT PACKET
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#DCE6F0] text-xs">
          {/* Round Filter */}
          <div>
            <label className="block text-[11px] font-mono font-medium text-[#172033] mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#0891B2]" />
              SELECT ROUND:
            </label>
            <div className="flex rounded-xl bg-[#F8FAFC] p-1 border border-[#DCE6F0]">
              {(['ALL', 1, 2, 3] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRound(r)}
                  className={`flex-1 py-1 px-2 text-center rounded-lg font-mono text-xs font-semibold transition cursor-pointer ${
                    selectedRound === r
                      ? 'bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#172033]'
                  }`}
                >
                  {r === 'ALL' ? 'All' : `R${r}`}
                </button>
              ))}
            </div>
          </div>

          {/* Question Set Filter */}
          <div>
            <label className="block text-[11px] font-mono font-medium text-[#172033] mb-1.5 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#7C3AED]" />
              SELECT QUESTION SET:
            </label>
            <div className="flex rounded-xl bg-[#F8FAFC] p-1 border border-[#DCE6F0]">
              {(['ALL', 'A', 'B', 'C'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSet(s)}
                  className={`flex-1 py-1 px-2 text-center rounded-lg font-mono text-xs font-semibold transition cursor-pointer ${
                    selectedSet === s
                      ? 'bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#172033]'
                  }`}
                >
                  {s === 'ALL' ? 'All Sets' : `Set ${s}`}
                </button>
              ))}
            </div>
          </div>

          {/* Packet Mode Toggle */}
          <div>
            <label className="block text-[11px] font-mono font-medium text-[#172033] mb-1.5 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              PRINT PACKET FORMAT:
            </label>
            <div className="flex rounded-xl bg-[#F8FAFC] p-1 border border-[#DCE6F0]">
              <button
                type="button"
                onClick={() => setPacketMode('MASTER_KEY')}
                className={`flex-1 py-1 px-2 text-center rounded-lg font-mono text-xs font-semibold transition cursor-pointer ${
                  packetMode === 'MASTER_KEY'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#172033]'
                }`}
              >
                Evaluator Key
              </button>
              <button
                type="button"
                onClick={() => setPacketMode('STUDENT_EXAM')}
                className={`flex-1 py-1 px-2 text-center rounded-lg font-mono text-xs font-semibold transition cursor-pointer ${
                  packetMode === 'STUDENT_EXAM'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#172033]'
                }`}
              >
                Candidate Exam Sheet
              </button>
            </div>
          </div>
        </div>

        {/* Selected Summary */}
        <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B] bg-[#F8FAFC] px-3 py-2 rounded-xl border border-[#DCE6F0]">
          <span>
            Displaying <strong className="text-[#0891B2] font-bold">{filteredQuestions.length}</strong> questions in current print packet
          </span>
          <span className="text-[#64748B]">
            Mode: <span className="text-[#172033] font-semibold">{packetMode === 'MASTER_KEY' ? 'Master Answer Key (Answers & Diagrams Visible)' : 'Candidate Exam (Diagrams & Answer Blanks)'}</span>
          </span>
        </div>
      </div>

      {/* Printable Document Body */}
      <div className="bg-white border border-[#DCE6F0] rounded-2xl p-6 sm:p-10 space-y-8 text-xs text-[#172033] print:bg-white print:text-black print:border-none print:p-0 print:m-0 shadow-sm">
        {/* Document Official Cover Header */}
        <div className="border-b-2 border-[#DCE6F0] pb-6 print:border-black print:pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="inline-block text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-lg bg-cyan-50 text-[#0891B2] border border-[#06B6D4]/30 print:bg-gray-100 print:text-black print:border-black font-semibold">
                DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING
              </div>
              <h2 className="text-xl font-bold uppercase tracking-wider text-[#172033] print:text-black font-tech">
                TECH BRIDGE '26 • VISUAL TECHNICAL REBUS CHALLENGE
              </h2>
              <p className="text-xs text-[#0891B2] font-mono font-medium print:text-gray-800">
                OFFICIAL EMERGENCY CONTINGENCY QUESTION PACKET & DIAGRAM FOLIO
              </p>
            </div>

            <div className="text-right font-mono text-[11px] text-[#64748B] print:text-black">
              <div>CONFIDENTIAL ID: TB26-OFFLINE</div>
              <div>DATE: SYMPOSIUM DAY 2026</div>
              <div className="font-bold text-rose-600 print:text-black">
                {packetMode === 'MASTER_KEY' ? 'ORGANIZER MASTER KEY' : 'OFFLINE CANDIDATE EXAM SHEET'}
              </div>
            </div>
          </div>

          {packetMode === 'STUDENT_EXAM' && (
            <div className="mt-4 p-3 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl print:border-black print:bg-gray-50 text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
              <div>TEAM ID: _______________</div>
              <div>TEAM NAME: ___________________</div>
              <div>COLLEGE: _____________________</div>
              <div>SCORE: ______ / {filteredQuestions.reduce((acc, q) => acc + q.points, 0)}</div>
            </div>
          )}
        </div>

        {/* Round Summary Pill Banner */}
        <div className="grid grid-cols-3 gap-3 print:gap-2">
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#DCE6F0] print:bg-white print:border-gray-400">
            <div className="text-[10px] font-mono font-bold text-[#0891B2] print:text-black">ROUND 1: FOUNDATIONS</div>
            <div className="text-[11px] text-[#64748B] print:text-gray-700">1 pt/Q • 3 Sets (A, B, C) • Core CS & DSA</div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#DCE6F0] print:bg-white print:border-gray-400">
            <div className="text-[10px] font-mono font-bold text-[#7C3AED] print:text-black">ROUND 2: DISTRIBUTED</div>
            <div className="text-[11px] text-[#64748B] print:text-gray-700">2 pts/Q • 3 Sets (A, B, C) • Cloud & Systems</div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#DCE6F0] print:bg-white print:border-gray-400">
            <div className="text-[10px] font-mono font-bold text-[#2563EB] print:text-black">ROUND 3: GRAND FINALE</div>
            <div className="text-[11px] text-[#64748B] print:text-gray-700">3 pts/Q • 3 Sets (A, B, C) • AI & Hardware</div>
          </div>
        </div>

        {/* Individual Question Cards with Full Rebus Vector Diagrams */}
        <div className="space-y-6 print:space-y-4">
          {filteredQuestions.map((q, qIndex) => (
            <div
              key={q.id}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-[#DCE6F0] shadow-sm print:bg-white print:border-2 print:border-gray-400 print:shadow-none print:p-4 print:mb-4"
              style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            >
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#DCE6F0] print:border-gray-300 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-50 text-[#0891B2] font-mono font-bold text-xs border border-[#06B6D4]/30 print:bg-black print:text-white print:border-black">
                    Q#{q.questionNumber}
                  </span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-lg bg-[#F1F5F9] border border-[#DCE6F0] text-[#172033] print:bg-gray-100 print:text-black print:border-gray-400">
                    ROUND {q.round} • SET {q.set || 'A'}
                  </span>
                  <span className="font-tech text-xs text-[#172033] font-semibold print:text-black">
                    {q.domain}
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                    q.difficulty === 'Very Hard'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 print:text-black'
                      : q.difficulty === 'Hard'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200 print:text-black'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200 print:text-black'
                  }`}>
                    {q.difficulty}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-cyan-50 text-[#0891B2] font-bold border border-[#06B6D4]/30 print:bg-gray-200 print:text-black print:border-gray-400">
                    +{q.points} PTS
                  </span>
                </div>
              </div>

              {/* REBUS VISUAL DIAGRAM PANELS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {q.cluePanels.map((panel, pIdx) => (
                  <div
                    key={panel.panelNumber || pIdx}
                    className="flex flex-col items-center justify-between rounded-xl border border-[#DCE6F0] bg-[#F8FAFC] p-4 print:bg-gray-50 print:border-2 print:border-gray-400 print:p-3"
                  >
                    {/* Panel Header */}
                    <div className="w-full flex items-center justify-between mb-2">
                      <span className="font-mono text-[11px] font-bold text-[#0891B2] print:text-black">
                        PANEL {panel.panelNumber || (pIdx + 1)}
                      </span>
                      <span className="text-[10px] font-mono text-[#94A3B8] print:text-gray-600 uppercase">
                        [{panel.svgType}]
                      </span>
                    </div>

                    {/* SVG Vector Diagram */}
                    <div className="my-2 p-2 flex items-center justify-center bg-white border border-[#DCE6F0] rounded-xl print:bg-white print:border print:border-gray-300 print:p-1 w-full max-w-[200px] h-[110px]">
                      <PanelVectorArt type={panel.svgType} large={false} />
                    </div>

                    {/* Clue Description */}
                    <p className="mt-2 text-center text-xs text-[#172033] print:text-black font-medium leading-relaxed">
                      {panel.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Synthesis Formula */}
              <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#DCE6F0] print:bg-gray-100 print:border-gray-300 mb-3 flex items-center gap-2 font-mono text-xs">
                <span className="text-[#0891B2] font-bold print:text-black">SYNTHESIS FORMULA:</span>
                <span className="text-[#2563EB] print:text-gray-900 font-semibold">{q.rebusFormulaText}</span>
              </div>

              {/* Mode-Specific Answer Box */}
              {packetMode === 'MASTER_KEY' ? (
                /* Master Answer Key Section for Evaluator */
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 print:bg-gray-100 print:border-black space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 print:text-black" />
                      <span className="text-[11px] font-mono font-bold text-emerald-800 print:text-black">
                        AUTHORITATIVE ANSWER:
                      </span>
                      <span className="font-mono font-bold text-sm text-emerald-900 print:text-black underline underline-offset-2">
                        {q.correctAnswer}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-emerald-800 print:text-gray-800">
                    <span className="font-bold text-emerald-950 print:text-black">ACCEPTED SYNONYMS: </span>
                    {q.aliases.join(', ') || 'None'}
                  </div>

                  {q.explanation && (
                    <div className="text-[11px] text-emerald-800 print:text-gray-700 italic pt-1 border-t border-emerald-200 print:border-gray-300">
                      <strong>Rationale:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ) : (
                /* Offline Candidate Exam Answer Form Section */
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DCE6F0] print:bg-white print:border-black space-y-2">
                  <div className="font-mono text-xs text-[#172033] print:text-black">
                    <strong>WRITE TEAM ANSWER:</strong> ____________________________________________________________________
                  </div>
                  <div className="font-mono text-[10px] text-[#64748B] print:text-gray-600 flex justify-between">
                    <span>Proctor Signature: _______________________</span>
                    <span>Points Awarded: [  0  ] [  +{q.points}  ]</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Master Quick-Scoring Reference Matrix Table (At end of packet) */}
        {packetMode === 'MASTER_KEY' && (
          <div className="pt-8 border-t-2 border-[#DCE6F0] print:border-black" style={{ pageBreakBefore: 'always', breakBefore: 'page' }}>
            <div className="text-center mb-4">
              <h3 className="font-tech text-base font-bold text-[#172033] print:text-black uppercase tracking-wider">
                MASTER RAPID EVALUATION MATRIX • ALL QUESTION SETS
              </h3>
              <p className="text-xs text-[#64748B] font-mono print:text-gray-700">
                Quick grading reference table for symposium judges and proctors
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-[#DCE6F0] print:border-black text-[11px]">
                <thead>
                  <tr className="bg-[#F1F5F9] print:bg-gray-200 text-[#172033] print:text-black font-mono font-semibold">
                    <th className="p-2 border border-[#DCE6F0] print:border-black">Q#</th>
                    <th className="p-2 border border-[#DCE6F0] print:border-black">RND</th>
                    <th className="p-2 border border-[#DCE6F0] print:border-black">SET</th>
                    <th className="p-2 border border-[#DCE6F0] print:border-black">DOMAIN</th>
                    <th className="p-2 border border-[#DCE6F0] print:border-black">REBUS FORMULA</th>
                    <th className="p-2 border border-[#DCE6F0] print:border-black">CORRECT ANSWER</th>
                    <th className="p-2 border border-[#DCE6F0] print:border-black text-right">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuestions.map((q) => (
                    <tr key={`matrix-${q.id}`} className="border-b border-[#DCE6F0] hover:bg-[#F8FAFC] print:border-gray-400">
                      <td className="p-2 font-mono font-bold text-[#0891B2] print:text-black">#{q.questionNumber}</td>
                      <td className="p-2 font-mono">R{q.round}</td>
                      <td className="p-2 font-mono font-bold text-[#7C3AED] print:text-black">Set {q.set || 'A'}</td>
                      <td className="p-2 text-[#64748B] print:text-gray-800">{q.domain}</td>
                      <td className="p-2 font-mono text-[#2563EB] print:text-gray-900">{q.rebusFormulaText}</td>
                      <td className="p-2 font-mono font-bold text-emerald-700 print:text-black">{q.correctAnswer}</td>
                      <td className="p-2 font-mono font-bold text-right text-[#172033]">+{q.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
