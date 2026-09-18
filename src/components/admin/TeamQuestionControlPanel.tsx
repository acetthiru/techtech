import React, { useState } from 'react';
import { Target, Users, Check, AlertTriangle, RefreshCw, Send, HelpCircle } from 'lucide-react';
import { Question, Team } from '../../types';

interface TeamQuestionControlPanelProps {
  adminToken: string | null;
  questions: Question[];
  teams: Team[];
  onSuccess: () => void;
}

export const TeamQuestionControlPanel: React.FC<TeamQuestionControlPanelProps> = ({
  adminToken,
  questions,
  teams,
  onSuccess,
}) => {
  const [targetType, setTargetType] = useState<'ALL' | 'SELECTED' | 'INDIVIDUAL'>('ALL');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(questions[0]?.id || '');
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [singleTeamId, setSingleTeamId] = useState<string>(teams[0]?.id || '');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const toggleTeamSelect = (id: string) => {
    setSelectedTeamIds(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleApply = async () => {
    if (!selectedQuestionId) {
      setMessage({ type: 'error', text: 'Please select a question to assign' });
      return;
    }

    let targetIds: string[] = [];
    if (targetType === 'ALL') {
      targetIds = teams.map(t => t.id);
    } else if (targetType === 'SELECTED') {
      if (selectedTeamIds.length === 0) {
        setMessage({ type: 'error', text: 'Please select at least one team' });
        return;
      }
      targetIds = selectedTeamIds;
    } else if (targetType === 'INDIVIDUAL') {
      if (!singleTeamId) {
        setMessage({ type: 'error', text: 'Please select a team' });
        return;
      }
      targetIds = [singleTeamId];
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/teams/set-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          target: targetType,
          teamIds: targetIds,
          questionId: selectedQuestionId,
          reason: reason || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Question successfully assigned' });
        onSuccess();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to assign question' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/teams/reset-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ teamIds: teams.map(t => t.id) }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Reset all team question overrides to synchronized round question.' });
        onSuccess();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#172033] flex items-center gap-2">
            <Target className="w-5 h-5 text-[#0891B2]" />
            Team-Specific Question Control
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Assign custom questions to all teams, selected teams, or individual teams (Tie-breakers, technical re-tests, make-up challenges)
          </p>
        </div>

        <button
          onClick={handleReset}
          disabled={loading}
          className="flex items-center gap-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#172033] px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-[#DCE6F0] transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset All to Round Sync
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Column */}
        <div className="lg:col-span-1 bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#172033]">1. Select Target Scope</h3>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setTargetType('ALL')}
              className={`p-2.5 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 border cursor-pointer ${
                targetType === 'ALL'
                  ? 'bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white border-transparent shadow-xs'
                  : 'bg-[#F8FAFC] text-[#64748B] border-[#DCE6F0] hover:bg-[#F1F5F9]'
              }`}
            >
              <Users className="w-4 h-4" />
              All Teams
            </button>
            <button
              onClick={() => setTargetType('SELECTED')}
              className={`p-2.5 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 border cursor-pointer ${
                targetType === 'SELECTED'
                  ? 'bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white border-transparent shadow-xs'
                  : 'bg-[#F8FAFC] text-[#64748B] border-[#DCE6F0] hover:bg-[#F1F5F9]'
              }`}
            >
              <Target className="w-4 h-4" />
              Selected
            </button>
            <button
              onClick={() => setTargetType('INDIVIDUAL')}
              className={`p-2.5 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 border cursor-pointer ${
                targetType === 'INDIVIDUAL'
                  ? 'bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white border-transparent shadow-xs'
                  : 'bg-[#F8FAFC] text-[#64748B] border-[#DCE6F0] hover:bg-[#F1F5F9]'
              }`}
            >
              <Users className="w-4 h-4" />
              Single Team
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#172033] block mb-1.5">2. Target Question</label>
            <select
              value={selectedQuestionId}
              onChange={(e) => setSelectedQuestionId(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#DCE6F0] text-[#172033] rounded-xl p-2.5 text-sm focus:outline-none focus:border-[#06B6D4]"
            >
              {questions.map((q) => (
                <option key={q.id} value={q.id}>
                  R{q.round} Q{q.questionNumber}: {q.rebusFormulaText || q.domain} ({q.points} pts)
                </option>
              ))}
            </select>
          </div>

          {targetType === 'INDIVIDUAL' && (
            <div>
              <label className="text-xs font-semibold text-[#172033] block mb-1.5">Select Team</label>
              <select
                value={singleTeamId}
                onChange={(e) => setSingleTeamId(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#DCE6F0] text-[#172033] rounded-xl p-2.5 text-sm focus:outline-none focus:border-[#06B6D4]"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.college}) - Current: {t.currentQuestionId ? 'Custom Assigned' : 'Sync'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-[#172033] block mb-1.5">Reason / Notes (Audit Log)</label>
            <input
              type="text"
              placeholder="e.g. Tie-breaker, Network Re-test"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#DCE6F0] text-[#172033] rounded-xl p-2.5 text-sm placeholder:text-[#94A3B8] focus:outline-none focus:border-[#06B6D4]"
            />
          </div>

          <button
            onClick={handleApply}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#06B6D4] to-[#2563EB] hover:from-[#0891B2] hover:to-[#1D4ED8] text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Transmitting...' : 'Push Question to Target'}
          </button>
        </div>

        {/* Selected Teams Matrix */}
        <div className="lg:col-span-2 bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#172033]">
              Team Roster Status ({teams.length} Teams)
            </h3>
            {targetType === 'SELECTED' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTeamIds(teams.map(t => t.id))}
                  className="text-xs text-[#2563EB] font-semibold hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-[#DCE6F0]">|</span>
                <button
                  onClick={() => setSelectedTeamIds([])}
                  className="text-xs text-[#64748B] hover:underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
            {teams.map((t) => {
              const isSelected = selectedTeamIds.includes(t.id) || (targetType === 'INDIVIDUAL' && singleTeamId === t.id);
              const customQ = questions.find(q => q.id === t.currentQuestionId);

              return (
                <div
                  key={t.id}
                  onClick={() => targetType === 'SELECTED' && toggleTeamSelect(t.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    targetType === 'SELECTED' && isSelected
                      ? 'bg-cyan-50 border-[#06B6D4] text-[#172033]'
                      : 'bg-[#F8FAFC] border-[#DCE6F0] text-[#64748B] hover:bg-[#F1F5F9]'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-semibold text-xs block text-[#172033] truncate">{t.name}</span>
                    <span className="text-[11px] text-[#64748B] block truncate">{t.college}</span>
                    {customQ ? (
                      <span className="text-[10px] text-[#0891B2] font-mono font-medium mt-0.5 inline-block">
                        Active: Q{customQ.questionNumber} (R{customQ.round})
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-600 font-mono font-medium mt-0.5 inline-block">
                        Round Synchronized
                      </span>
                    )}
                  </div>

                  {targetType === 'SELECTED' && (
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#06B6D4] border-[#06B6D4] text-white' : 'border-[#CBD5E1]'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
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
