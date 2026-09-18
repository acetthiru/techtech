import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, RefreshCw, ToggleLeft, ToggleRight, Check, Users } from 'lucide-react';
import { EventFeedback } from '../../types';

interface FeedbackResultsPanelProps {
  adminToken: string | null;
  feedbackActive: boolean;
  onToggleFeedback: () => void;
}

export const FeedbackResultsPanel: React.FC<FeedbackResultsPanelProps> = ({
  adminToken,
  feedbackActive,
  onToggleFeedback,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/feedback', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchFeedback();
    }
  }, [adminToken]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#172033] flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#0891B2]" />
            Participant Feedback & Ratings
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Real-time participant evaluation across event organization, question quality, and platform UX
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleFeedback}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
              feedbackActive
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-[#F1F5F9] border-[#DCE6F0] text-[#172033] hover:bg-[#E2E8F0]'
            }`}
          >
            {feedbackActive ? (
              <>
                <ToggleRight className="w-4 h-4 text-emerald-600" />
                Feedback Portal Open
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4 text-[#64748B]" />
                Feedback Portal Closed
              </>
            )}
          </button>

          <button
            onClick={fetchFeedback}
            className="p-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#172033] rounded-xl border border-[#DCE6F0] transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Ratings Averages Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white border border-[#DCE6F0] rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-[#64748B] block mb-1 font-medium">Overall Rating</span>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-black text-[#0891B2]">{data?.averageOverall || 0}</span>
            <span className="text-xs text-[#64748B]">/ 5</span>
          </div>
          {renderStars(data?.averageOverall || 0)}
        </div>

        <div className="bg-white border border-[#DCE6F0] rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-[#64748B] block mb-1 font-medium">Question Quality</span>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-black text-[#172033]">{data?.averageQuality || 0}</span>
            <span className="text-xs text-[#64748B]">/ 5</span>
          </div>
          {renderStars(data?.averageQuality || 0)}
        </div>

        <div className="bg-white border border-[#DCE6F0] rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-[#64748B] block mb-1 font-medium">Difficulty Balance</span>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-black text-[#172033]">{data?.averageDifficulty || 0}</span>
            <span className="text-xs text-[#64748B]">/ 5</span>
          </div>
          {renderStars(data?.averageDifficulty || 0)}
        </div>

        <div className="bg-white border border-[#DCE6F0] rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-[#64748B] block mb-1 font-medium">Platform UX</span>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-black text-[#172033]">{data?.averageUX || 0}</span>
            <span className="text-xs text-[#64748B]">/ 5</span>
          </div>
          {renderStars(data?.averageUX || 0)}
        </div>

        <div className="bg-white border border-[#DCE6F0] rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-[#64748B] block mb-1 font-medium">Event Organization</span>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-black text-[#172033]">{data?.averageOrganization || 0}</span>
            <span className="text-xs text-[#64748B]">/ 5</span>
          </div>
          {renderStars(data?.averageOrganization || 0)}
        </div>
      </div>

      {/* Feedbacks List */}
      <div className="bg-white border border-[#DCE6F0] rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-[#F8FAFC] px-5 py-3.5 border-b border-[#DCE6F0] flex items-center justify-between">
          <span className="font-bold text-sm text-[#172033]">
            Participant Responses ({data?.total || 0} Submitted)
          </span>
          <span className="text-xs text-[#64748B]">Feedback Log</span>
        </div>

        <div className="divide-y divide-[#DCE6F0] max-h-96 overflow-y-auto">
          {(!data?.feedbacks || data.feedbacks.length === 0) ? (
            <div className="p-12 text-center text-xs text-[#64748B]">
              No feedback submissions received yet. Make sure the Feedback Portal is open.
            </div>
          ) : (
            data.feedbacks.map((f: EventFeedback) => (
              <div key={f.id} className="p-4 hover:bg-[#F8FAFC] transition space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#172033]">{f.teamName}</span>
                    <span className="text-xs text-[#64748B]">• {new Date(f.timestamp).toLocaleTimeString()}</span>
                  </div>
                  {renderStars(f.overallRating)}
                </div>

                {f.comments && (
                  <p className="text-xs text-[#172033] bg-[#F8FAFC] p-3 rounded-xl border border-[#DCE6F0] font-sans">
                    "{f.comments}"
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-[11px] text-[#64748B]">
                  <span>Questions: <strong className="text-[#172033]">{f.questionQuality}/5</strong></span>
                  <span>Difficulty: <strong className="text-[#172033]">{f.difficulty}/5</strong></span>
                  <span>UX: <strong className="text-[#172033]">{f.userExperience}/5</strong></span>
                  <span>Organization: <strong className="text-[#172033]">{f.eventOrganization}/5</strong></span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
