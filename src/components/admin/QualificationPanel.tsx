import React, { useState, useEffect } from 'react';
import { Award, Users, CheckCircle2, AlertTriangle, RefreshCw, ChevronRight, Check, XCircle, ShieldCheck } from 'lucide-react';
import { RoundNumber, Team } from '../../types';

interface QualificationPanelProps {
  adminToken: string | null;
  currentRound: RoundNumber;
  teams: Team[];
  onSuccess: () => void;
}

export const QualificationPanel: React.FC<QualificationPanelProps> = ({
  adminToken,
  currentRound,
  teams,
  onSuccess,
}) => {
  const [targetRound, setTargetRound] = useState<RoundNumber>(currentRound);
  const [topCount, setTopCount] = useState<number>(10);
  const [previewData, setPreviewData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPreview = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/qualification/preview?round=${targetRound}&topCount=${topCount}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPreviewData(data);
      }
    } catch (err) {
      console.error('Failed to preview qualification:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchPreview();
    }
  }, [targetRound, topCount, adminToken]);

  const handleApplyQualification = async () => {
    if (!previewData?.teams) return;
    const qualifiedIds = previewData.teams.filter((t: any) => t.isQualified).map((t: any) => t.teamId);
    const disqualifiedIds = previewData.teams.filter((t: any) => !t.isQualified).map((t: any) => t.teamId);

    if (!confirm(`Are you sure you want to advance ${qualifiedIds.length} teams to the next round and eliminate the remaining teams?`)) {
      return;
    }

    setApplying(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/qualification/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          round: targetRound,
          qualifiedTeamIds: qualifiedIds,
          disqualifiedTeamIds: disqualifiedIds,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        fetchPreview();
        onSuccess();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to apply qualification' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setApplying(false);
    }
  };

  const handleTeamOverride = async (teamId: string, isQualified: boolean) => {
    try {
      const res = await fetch('/api/admin/qualification/override', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          teamId,
          isQualified,
          reason: 'Manual Admin override from qualification console',
        }),
      });

      if (res.ok) {
        fetchPreview();
        onSuccess();
      }
    } catch (err) {
      console.error('Failed to override qualification:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#172033] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#0891B2]" />
            Round Qualification & Advancement Engine
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Calculate cutoffs, detect boundary ties, and authorize advancing teams to subsequent competition stages
          </p>
        </div>

        <button
          onClick={fetchPreview}
          disabled={loading}
          className="flex items-center gap-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#172033] px-3 py-1.5 rounded-xl text-xs font-semibold border border-[#DCE6F0] transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Preview
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
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
          {message.text}
        </div>
      )}

      {/* Configuration Strip */}
      <div className="bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#172033]">Evaluating Round:</span>
            <select
              value={targetRound}
              onChange={(e) => setTargetRound(Number(e.target.value) as RoundNumber)}
              className="bg-[#F8FAFC] border border-[#DCE6F0] text-[#172033] rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-[#06B6D4]"
            >
              <option value={1}>Round 1 (Foundations & Systems)</option>
              <option value={2}>Round 2 (Distributed Architectures)</option>
              <option value={3}>Round 3 (Grand Finale)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#172033]">Advancing Slots:</span>
            <input
              type="number"
              min={1}
              max={teams.length || 50}
              value={topCount}
              onChange={(e) => setTopCount(Math.max(1, Number(e.target.value)))}
              className="w-20 bg-[#F8FAFC] border border-[#DCE6F0] text-[#172033] rounded-xl px-3 py-1.5 text-sm text-center focus:outline-none focus:border-[#06B6D4]"
            />
            <span className="text-xs text-[#64748B]">Teams</span>
          </div>

          {previewData && (
            <div className="bg-cyan-50 border border-[#06B6D4]/40 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#0891B2]">
              Cutoff Score: <strong className="text-[#172033] text-sm">{previewData.cutOffScore} pts</strong>
            </div>
          )}
        </div>

        <button
          onClick={handleApplyQualification}
          disabled={applying || loading}
          className="bg-gradient-to-r from-[#06B6D4] to-[#2563EB] hover:from-[#0891B2] hover:to-[#1D4ED8] text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-md transition cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4" />
          {applying ? 'Applying Cuts...' : `Apply Qualification (Top ${topCount})`}
        </button>
      </div>

      {/* Tie Alert Banner */}
      {previewData?.hasBoundaryTies && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-amber-900 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-sm block text-amber-950">
              Boundary Tie Detected! ({previewData.boundaryTies.length} Teams at cutoff)
            </span>
            <p className="mt-1 text-amber-800">
              Multiple teams share the exact cutoff score of {previewData.cutOffScore} points. Use the manual override toggles below or conduct a sudden-death question using Team Question Control.
            </p>
          </div>
        </div>
      )}

      {/* Preview Table */}
      <div className="bg-white border border-[#DCE6F0] rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-[#F8FAFC] px-5 py-3 border-b border-[#DCE6F0] flex items-center justify-between">
          <span className="font-bold text-sm text-[#172033]">
            Ranked Qualification Roster (Round {targetRound})
          </span>
          <span className="text-xs text-[#64748B]">
            Top {previewData?.qualifiedCount || 0} / {previewData?.totalTeams || 0} Teams Marked Qualified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F1F5F9] border-b border-[#DCE6F0] text-[#64748B] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-4">College</th>
                <th className="py-3 px-4 text-center">R{targetRound} Score</th>
                <th className="py-3 px-4 text-center">Cumulative Score</th>
                <th className="py-3 px-4 text-center">Qualification Status</th>
                <th className="py-3 px-4 text-right">Manual Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE6F0]">
              {(previewData?.teams || []).map((t: any) => {
                const teamRecord = teams.find(item => item.id === t.teamId);
                const isCurrentlyQualified = teamRecord?.isQualified ?? t.isQualified;

                return (
                  <tr
                    key={t.teamId}
                    className={`hover:bg-[#F8FAFC] transition ${
                      isCurrentlyQualified ? 'bg-emerald-50/40' : 'bg-transparent'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#172033]">
                      #{t.rank}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#172033]">
                      {t.teamName}
                    </td>
                    <td className="py-3 px-4 text-[#64748B]">
                      {t.college}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-[#0891B2] text-sm">
                      {t.roundScore}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-[#172033]">
                      {t.totalScore}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isCurrentlyQualified ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold px-2.5 py-1 rounded-full text-[11px]">
                          <Check className="w-3.5 h-3.5" /> Qualified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-[#F1F5F9] border border-[#DCE6F0] text-[#64748B] px-2.5 py-1 rounded-full text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Below Cut
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleTeamOverride(t.teamId, !isCurrentlyQualified)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl border transition cursor-pointer ${
                          isCurrentlyQualified
                            ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {isCurrentlyQualified ? 'Revoke Cut' : 'Force Qualify'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
