import React, { useState, useEffect } from 'react';
import { Sliders, Plus, Minus, Hash, Check, AlertTriangle, RefreshCw, History, Users, Target } from 'lucide-react';
import { Team, RoundNumber, ManualScoreAdjustment } from '../../types';

interface ManualScoreAdjustmentPanelProps {
  adminToken: string | null;
  teams: Team[];
  onSuccess: () => void;
}

export const ManualScoreAdjustmentPanel: React.FC<ManualScoreAdjustmentPanelProps> = ({
  adminToken,
  teams,
  onSuccess,
}) => {
  const [targetMode, setTargetMode] = useState<'INDIVIDUAL' | 'SELECTED' | 'ALL'>('INDIVIDUAL');
  const [singleTeamId, setSingleTeamId] = useState<string>(teams[0]?.id || '');
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [round, setRound] = useState<RoundNumber>(1);
  const [adjustmentType, setAdjustmentType] = useState<'ADD' | 'SUBTRACT' | 'SET'>('ADD');
  const [amount, setAmount] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ManualScoreAdjustment[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/admin/scores/history', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.adjustments || []);
      }
    } catch (err) {
      console.error('Failed to fetch score adjustments history:', err);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchHistory();
    }
  }, [adminToken]);

  const toggleTeamSelect = (id: string) => {
    setSelectedTeamIds(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleApply = async () => {
    if (!reason.trim()) {
      setMessage({ type: 'error', text: 'Please enter a justification reason for the audit trail' });
      return;
    }

    let targetIds: string[] = [];
    if (targetMode === 'ALL') {
      targetIds = teams.map(t => t.id);
    } else if (targetMode === 'SELECTED') {
      if (selectedTeamIds.length === 0) {
        setMessage({ type: 'error', text: 'Please select at least one team' });
        return;
      }
      targetIds = selectedTeamIds;
    } else {
      if (!singleTeamId) {
        setMessage({ type: 'error', text: 'Please select a team' });
        return;
      }
      targetIds = [singleTeamId];
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/scores/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          target: targetMode,
          teamIds: targetIds,
          round,
          adjustmentType,
          amount,
          reason,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Score adjusted successfully' });
        setReason('');
        fetchHistory();
        onSuccess();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to adjust score' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#172033] flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#0891B2]" />
            Manual Score Adjustment Engine
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Authoritatively award bonus marks, deduct penalty points, or set exact scores with audit logging
          </p>
        </div>

        <button
          onClick={fetchHistory}
          className="flex items-center gap-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#172033] px-3 py-1.5 rounded-xl text-xs font-semibold border border-[#DCE6F0] transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh History
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
        {/* Adjustment Controls */}
        <div className="lg:col-span-1 bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#172033]">1. Adjustment Parameters</h3>

          <div>
            <label className="text-xs font-semibold text-[#172033] block mb-1.5">Target Scope</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTargetMode('INDIVIDUAL')}
                className={`py-2 px-1 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  targetMode === 'INDIVIDUAL'
                    ? 'bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white border-transparent shadow-xs'
                    : 'bg-[#F8FAFC] text-[#64748B] border-[#DCE6F0] hover:bg-[#F1F5F9]'
                }`}
              >
                Individual
              </button>
              <button
                onClick={() => setTargetMode('SELECTED')}
                className={`py-2 px-1 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  targetMode === 'SELECTED'
                    ? 'bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white border-transparent shadow-xs'
                    : 'bg-[#F8FAFC] text-[#64748B] border-[#DCE6F0] hover:bg-[#F1F5F9]'
                }`}
              >
                Selected
              </button>
              <button
                onClick={() => setTargetMode('ALL')}
                className={`py-2 px-1 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  targetMode === 'ALL'
                    ? 'bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white border-transparent shadow-xs'
                    : 'bg-[#F8FAFC] text-[#64748B] border-[#DCE6F0] hover:bg-[#F1F5F9]'
                }`}
              >
                All Teams
              </button>
            </div>
          </div>

          {targetMode === 'INDIVIDUAL' && (
            <div>
              <label className="text-xs font-semibold text-[#172033] block mb-1.5">Select Team</label>
              <select
                value={singleTeamId}
                onChange={(e) => setSingleTeamId(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#DCE6F0] text-[#172033] rounded-xl p-2.5 text-sm focus:outline-none focus:border-[#06B6D4]"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (Total: {t.totalScore} pts)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#172033] block mb-1.5">Round</label>
              <select
                value={round}
                onChange={(e) => setRound(Number(e.target.value) as RoundNumber)}
                className="w-full bg-[#F8FAFC] border border-[#DCE6F0] text-[#172033] rounded-xl p-2 text-sm focus:outline-none focus:border-[#06B6D4]"
              >
                <option value={1}>Round 1</option>
                <option value={2}>Round 2</option>
                <option value={3}>Round 3</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#172033] block mb-1.5">Action</label>
              <select
                value={adjustmentType}
                onChange={(e) => setAdjustmentType(e.target.value as any)}
                className="w-full bg-[#F8FAFC] border border-[#DCE6F0] text-[#172033] rounded-xl p-2 text-sm focus:outline-none focus:border-[#06B6D4]"
              >
                <option value="ADD">Add (+)</option>
                <option value="SUBTRACT">Deduct (-)</option>
                <option value="SET">Set Fixed (=)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#172033] block mb-1.5">
              {adjustmentType === 'SET' ? 'Target Score Value' : 'Points Amount (Delta)'}
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-[#F8FAFC] border border-[#DCE6F0] text-[#172033] rounded-xl p-2.5 text-sm focus:outline-none focus:border-[#06B6D4]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#172033] block mb-1.5">
              Justification / Reason (Mandatory Audit)
            </label>
            <input
              type="text"
              placeholder="e.g. Bonus for rapid insight, dispute resolution"
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
            <Check className="w-4 h-4" />
            {loading ? 'Committing...' : 'Commit Score Adjustment'}
          </button>
        </div>

        {/* Selected Teams Roster & Ledger */}
        <div className="lg:col-span-2 space-y-6">
          {targetMode === 'SELECTED' && (
            <div className="bg-white border border-[#DCE6F0] rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-[#172033]">
                  Select Recipient Teams ({selectedTeamIds.length} Selected)
                </span>
                <button
                  onClick={() => setSelectedTeamIds(teams.map(t => t.id))}
                  className="text-xs text-[#2563EB] font-semibold hover:underline cursor-pointer"
                >
                  Select All
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto">
                {teams.map(t => {
                  const isSelected = selectedTeamIds.includes(t.id);
                  return (
                    <div
                      key={t.id}
                      onClick={() => toggleTeamSelect(t.id)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between ${
                        isSelected ? 'bg-cyan-50 border-[#06B6D4] text-[#172033]' : 'bg-[#F8FAFC] border-[#DCE6F0] text-[#64748B] hover:bg-[#F1F5F9]'
                      }`}
                    >
                      <span className="truncate">{t.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#0891B2]" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Audit History Table */}
          <div className="bg-white border border-[#DCE6F0] rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-[#F8FAFC] px-4 py-3 border-b border-[#DCE6F0] flex items-center justify-between">
              <span className="font-semibold text-sm text-[#172033] flex items-center gap-1.5">
                <History className="w-4 h-4 text-[#0891B2]" />
                Score Adjustment History Ledger ({history.length})
              </span>
              <span className="text-xs text-[#64748B]">Authoritative Audit Trail</span>
            </div>

            <div className="divide-y divide-[#DCE6F0] max-h-80 overflow-y-auto">
              {history.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#64748B]">
                  No manual score adjustments recorded yet.
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="p-3.5 hover:bg-[#F8FAFC] transition flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#172033] truncate">{item.teamName}</span>
                        <span className="px-2 py-0.5 rounded bg-[#ECFEFF] text-[#0891B2] text-[10px] font-mono border border-[#06B6D4]/30">
                          Round {item.round}
                        </span>
                      </div>
                      <p className="text-[#64748B] truncate">
                        Reason: <strong className="text-[#172033]">"{item.reason}"</strong>
                      </p>
                      <p className="text-[#94A3B8] text-[10px]">
                        Admin: {item.adminUsername} • {new Date(item.timestamp).toLocaleTimeString()}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-sm font-bold font-mono px-2 py-0.5 rounded-lg ${
                          item.adjustment >= 0
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {item.adjustment >= 0 ? `+${item.adjustment}` : item.adjustment} pts
                      </span>
                      <div className="text-[10px] text-[#64748B] mt-1 font-mono">
                        {item.oldScore} ➔ {item.newScore}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
