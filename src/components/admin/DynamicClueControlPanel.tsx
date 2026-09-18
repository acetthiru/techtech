import React, { useState } from 'react';
import { Lightbulb, Eye, EyeOff, Users, Target, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { Question, Team, EventState } from '../../types';

interface DynamicClueControlPanelProps {
  adminToken: string | null;
  eventState: EventState | null;
  questions: Question[];
  teams: Team[];
  onSuccess: () => void;
}

export const DynamicClueControlPanel: React.FC<DynamicClueControlPanelProps> = ({
  adminToken,
  eventState,
  questions,
  teams,
  onSuccess,
}) => {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(
    eventState?.currentQuestionId || questions[0]?.id || ''
  );
  const [targetMode, setTargetMode] = useState<'ALL' | 'SELECTED'>('ALL');
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  const activeQuestion = questions.find(q => q.id === selectedQuestionId) || questions[0];
  const activeCluesMap = eventState?.activeCluesByQuestion || {};

  // Standard progressive clues for question (if not defined in question data, generate standard progressive clues)
  const availableClues = activeQuestion?.clues && activeQuestion.clues.length > 0
    ? activeQuestion.clues
    : [
        {
          id: `${activeQuestion?.id || 'q'}-clue-1`,
          label: 'Visual Clue 1: Domain Association',
          text: `Focus on core ${activeQuestion?.domain || 'Computer Science'} concepts. Examine the primary icon closely.`,
          penaltyPoints: 0,
        },
        {
          id: `${activeQuestion?.id || 'q'}-clue-2`,
          label: 'Visual Clue 2: Rebus Structural Hint',
          text: `Formula pattern: ${activeQuestion?.rebusFormulaText || 'Combine the two panels'}. Notice the word length.`,
          penaltyPoints: 1,
        },
        {
          id: `${activeQuestion?.id || 'q'}-clue-3`,
          label: 'Visual Clue 3: First & Last Character Hint',
          text: `Starts with "${(activeQuestion?.correctAnswer || 'A')[0]}" and ends with "${(activeQuestion?.correctAnswer || 'Z').slice(-1)}".`,
          penaltyPoints: 2,
        },
      ];

  const toggleClue = async (clueId: string, currentEnabled: boolean) => {
    setLoading(clueId);
    try {
      const res = await fetch('/api/admin/clues/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          questionId: activeQuestion.id,
          clueId,
          enabled: !currentEnabled,
          target: targetMode,
          teamIds: targetMode === 'SELECTED' ? selectedTeamIds : [],
        }),
      });

      if (res.ok) {
        onSuccess();
      }
    } catch (err) {
      console.error('Failed to toggle clue:', err);
    } finally {
      setLoading(null);
    }
  };

  const toggleTeamSelect = (id: string) => {
    setSelectedTeamIds(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#172033] flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#0891B2]" />
            Dynamic Clue & Hint Management
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Gradually reveal progressive hints to all teams or selected teams to assist struggling participants
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#172033]">Select Question:</span>
          <select
            value={selectedQuestionId}
            onChange={(e) => setSelectedQuestionId(e.target.value)}
            className="bg-[#F8FAFC] border border-[#DCE6F0] text-[#172033] rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-[#06B6D4]"
          >
            {questions.map((q) => (
              <option key={q.id} value={q.id}>
                R{q.round} Q{q.questionNumber}: {q.rebusFormulaText || q.domain}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clue Control Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[#DCE6F0] rounded-2xl p-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#172033]">Release Scope:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setTargetMode('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  targetMode === 'ALL'
                    ? 'bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white shadow-xs'
                    : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#172033]'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> All Teams
              </button>
              <button
                onClick={() => setTargetMode('SELECTED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  targetMode === 'SELECTED'
                    ? 'bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white shadow-xs'
                    : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#172033]'
                }`}
              >
                <Target className="w-3.5 h-3.5" /> Selected Teams Only ({selectedTeamIds.length})
              </button>
            </div>
          </div>

          {availableClues.map((clue, idx) => {
            const isEnabled = Boolean(activeCluesMap[clue.id]);
            const conf = activeCluesMap[clue.id];
            const isProcessing = loading === clue.id;

            return (
              <div
                key={clue.id}
                className={`p-5 rounded-2xl border transition ${
                  isEnabled
                    ? 'bg-[#ECFEFF]/60 border-[#06B6D4] shadow-sm'
                    : 'bg-white border-[#DCE6F0]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#0891B2] px-2.5 py-0.5 rounded-full bg-[#ECFEFF] border border-[#06B6D4]/30">
                        Level {idx + 1}
                      </span>
                      <h4 className="text-base font-bold text-[#172033]">{clue.label}</h4>
                      {clue.penaltyPoints > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
                          -{clue.penaltyPoints} Pts penalty
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#172033] bg-[#F8FAFC] p-3 rounded-xl border border-[#DCE6F0] font-mono">
                      {clue.text}
                    </p>
                    {isEnabled && (
                      <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1 pt-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Visible to {conf?.allTeams ? 'All Teams' : `${conf?.teamIds?.length || 0} Selected Teams`}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => toggleClue(clue.id, isEnabled)}
                    disabled={isProcessing}
                    className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      isEnabled
                        ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs'
                    }`}
                  >
                    {isEnabled ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        {isProcessing ? 'Revoking...' : 'Revoke Clue'}
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        {isProcessing ? 'Releasing...' : 'Release Clue'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Team Selection List when targetMode === 'SELECTED' */}
        <div className="lg:col-span-1 bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Target Recipients ({selectedTeamIds.length}/{teams.length})
            </h3>
            {targetMode === 'SELECTED' && (
              <button
                onClick={() => setSelectedTeamIds(teams.map(t => t.id))}
                className="text-xs text-[#2563EB] hover:underline font-semibold cursor-pointer"
              >
                Select All
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1">
            {teams.map((t) => {
              const isSelected = selectedTeamIds.includes(t.id);

              return (
                <div
                  key={t.id}
                  onClick={() => targetMode === 'SELECTED' && toggleTeamSelect(t.id)}
                  className={`p-2.5 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between ${
                    targetMode === 'SELECTED' && isSelected
                      ? 'bg-cyan-50 border-[#06B6D4] text-[#172033]'
                      : 'bg-[#F8FAFC] border-[#DCE6F0] text-[#64748B] hover:bg-[#F1F5F9]'
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className="font-semibold block truncate text-[#172033]">{t.name}</span>
                    <span className="text-[10px] text-[#64748B] block truncate">{t.college}</span>
                  </div>

                  {targetMode === 'SELECTED' && (
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#06B6D4] border-[#06B6D4] text-white' : 'border-[#CBD5E1] bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
