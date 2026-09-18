import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, AlertCircle, RefreshCw, Search, Filter, Check, X, ShieldAlert } from 'lucide-react';
import { EventState, Question } from '../../types';

interface AnsweredMonitoringPanelProps {
  adminToken: string | null;
  eventState: EventState | null;
  questions: Question[];
}

export const AnsweredMonitoringPanel: React.FC<AnsweredMonitoringPanelProps> = ({
  adminToken,
  eventState,
  questions,
}) => {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('');
  const [statusData, setStatusData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ANSWERED' | 'NOT_ANSWERED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Default to current question
  useEffect(() => {
    if (eventState?.currentQuestionId && !selectedQuestionId) {
      setSelectedQuestionId(eventState.currentQuestionId);
    } else if (questions.length > 0 && !selectedQuestionId) {
      setSelectedQuestionId(questions[0].id);
    }
  }, [eventState, questions]);

  const fetchStatus = async () => {
    if (!selectedQuestionId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/question/${selectedQuestionId}/team-status`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStatusData(data);
      }
    } catch (err) {
      console.error('Failed to fetch team status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedQuestionId && adminToken) {
      fetchStatus();
      const interval = setInterval(fetchStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedQuestionId, adminToken]);

  const total = statusData?.totalTeams || 0;
  const answered = statusData?.answeredCount || 0;
  const notAnswered = statusData?.notAnsweredCount || 0;
  const correct = statusData?.correctCount || 0;
  const incorrect = statusData?.incorrectCount || 0;
  const progressPercent = total > 0 ? Math.round((answered / total) * 100) : 0;

  const filteredAnswered = (statusData?.answeredTeams || []).filter((t: any) =>
    t.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.college?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.submittedAnswer?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNotAnswered = (statusData?.notAnsweredTeams || []).filter((t: any) =>
    t.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.college?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#172033] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Answered / Not Answered Live Monitor
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Real-time participant progress tracking and answer status per question
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#172033]">Question:</span>
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

          <button
            onClick={fetchStatus}
            disabled={loading}
            className="flex items-center gap-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#172033] px-3 py-1.5 rounded-xl text-sm border border-[#DCE6F0] transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Progress Metric Banner */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white border border-[#DCE6F0] rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-[#64748B] block mb-1 font-medium">Total Eligible Teams</span>
          <span className="text-2xl font-black text-[#172033]">{total}</span>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-emerald-800 block mb-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Answered (Y)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-800">{answered}</span>
            <span className="text-xs font-semibold text-emerald-700">({progressPercent}%)</span>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-amber-800 block mb-1 flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Remaining (Z)
          </span>
          <span className="text-2xl font-black text-amber-800">{notAnswered}</span>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-blue-800 block mb-1 font-medium">Correct Answers</span>
          <span className="text-2xl font-black text-blue-800">{correct}</span>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-rose-800 block mb-1 font-medium">Incorrect Answers</span>
          <span className="text-2xl font-black text-rose-800">{incorrect}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border border-[#DCE6F0] rounded-2xl p-4 shadow-xs">
        <div className="flex justify-between items-center text-xs text-[#64748B] mb-2">
          <span className="font-semibold text-[#172033]">Live Submission Completion</span>
          <span>{answered} of {total} Teams Submitted ({progressPercent}%)</span>
        </div>
        <div className="w-full h-3 bg-[#F1F5F9] rounded-full overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#DCE6F0]">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeFilter === 'ALL'
                ? 'bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#172033]'
            }`}
          >
            All Teams ({total})
          </button>
          <button
            onClick={() => setActiveFilter('ANSWERED')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeFilter === 'ANSWERED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#172033]'
            }`}
          >
            Answered ({answered})
          </button>
          <button
            onClick={() => setActiveFilter('NOT_ANSWERED')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeFilter === 'NOT_ANSWERED'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#172033]'
            }`}
          >
            Not Answered ({notAnswered})
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search teams or answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#DCE6F0] text-[#172033] pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:border-[#06B6D4]"
          />
        </div>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Answered Teams Table */}
        {(activeFilter === 'ALL' || activeFilter === 'ANSWERED') && (
          <div className="bg-white border border-[#DCE6F0] rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-[#F8FAFC] px-4 py-3 border-b border-[#DCE6F0] flex items-center justify-between">
              <span className="font-semibold text-sm text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Answered Teams ({filteredAnswered.length})
              </span>
              <span className="text-xs text-[#64748B]">Green = Submitted</span>
            </div>

            <div className="divide-y divide-[#DCE6F0] max-h-96 overflow-y-auto">
              {filteredAnswered.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#64748B]">
                  No submissions yet for this question.
                </div>
              ) : (
                filteredAnswered.map((team: any) => (
                  <div key={team.teamId} className="p-3.5 hover:bg-[#F8FAFC] transition flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#172033] truncate">{team.teamName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#F1F5F9] text-[#64748B]">
                          {team.college}
                        </span>
                      </div>
                      <div className="text-xs text-[#64748B] mt-1 flex items-center gap-3">
                        <span className="text-[#172033] font-mono">
                          Answer: <strong className="text-[#0891B2]">"{team.submittedAnswer}"</strong>
                        </span>
                        <span>•</span>
                        <span className="text-[#64748B]">
                          {new Date(team.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {team.isCorrect ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                          <Check className="w-3.5 h-3.5" /> Correct (+{team.pointsAwarded})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-300 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                          <X className="w-3.5 h-3.5" /> Incorrect
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Not Answered Teams Table */}
        {(activeFilter === 'ALL' || activeFilter === 'NOT_ANSWERED') && (
          <div className="bg-white border border-[#DCE6F0] rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-[#F8FAFC] px-4 py-3 border-b border-[#DCE6F0] flex items-center justify-between">
              <span className="font-semibold text-sm text-amber-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                Not Answered Teams ({filteredNotAnswered.length})
              </span>
              <span className="text-xs text-[#64748B]">Yellow = Pending</span>
            </div>

            <div className="divide-y divide-[#DCE6F0] max-h-96 overflow-y-auto">
              {filteredNotAnswered.length === 0 ? (
                <div className="p-8 text-center text-xs text-emerald-700 font-semibold">
                  🎉 All teams have submitted an answer!
                </div>
              ) : (
                filteredNotAnswered.map((team: any) => (
                  <div key={team.teamId} className="p-3.5 hover:bg-[#F8FAFC] transition flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#172033] truncate">{team.teamName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#F1F5F9] text-[#64748B]">
                          {team.college}
                        </span>
                      </div>
                      <div className="text-xs text-[#64748B] mt-1 flex items-center gap-2">
                        <span>Status: <strong className="text-[#172033]">{team.status}</strong></span>
                        <span>•</span>
                        <span>
                          {team.isOnline ? (
                            <span className="text-emerald-600 font-semibold">● Online</span>
                          ) : (
                            <span className="text-[#64748B]">○ Away</span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-300 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5 animate-pulse text-amber-600" /> Pending
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
