import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Trash2, Edit3, Check, RefreshCw, Layers, ArrowRight, HelpCircle } from 'lucide-react';
import { ImportReviewItem, RoundNumber, QuestionSet } from '../../types';

interface BulkQuestionImportPanelProps {
  adminToken: string | null;
  onQuestionsImported: () => void;
}

export const BulkQuestionImportPanel: React.FC<BulkQuestionImportPanelProps> = ({
  adminToken,
  onQuestionsImported,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [detectedFormat, setDetectedFormat] = useState<'AUTO' | 'JSON' | 'TEXT' | 'CSV'>('AUTO');
  const [defaultRound, setDefaultRound] = useState<RoundNumber>(1);
  const [defaultSet, setDefaultSet] = useState<QuestionSet>('A');
  const [parsing, setParsing] = useState(false);
  const [queue, setQueue] = useState<ImportReviewItem[]>([]);
  const [editingItem, setEditingItem] = useState<ImportReviewItem | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/admin/questions/review-queue', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setQueue(data.queue || []);
      }
    } catch (err) {
      console.error('Failed to fetch review queue:', err);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchQueue();
    }
  }, [adminToken]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputText(content);
      if (file.name.endsWith('.json')) setDetectedFormat('JSON');
      else if (file.name.endsWith('.csv')) setDetectedFormat('CSV');
      else setDetectedFormat('TEXT');
    };
    reader.readAsText(file);
  };

  const handleParse = async () => {
    if (!inputText.trim()) {
      setMessage({ type: 'error', text: 'Please paste or upload document content to parse' });
      return;
    }

    setParsing(true);
    setMessage(null);

    try {
      let format = detectedFormat;
      if (format === 'AUTO') {
        format = inputText.trim().startsWith('[') || inputText.trim().startsWith('{') ? 'JSON' : 'TEXT';
      }

      const res = await fetch('/api/admin/questions/parse-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          content: inputText,
          format,
          defaultRound,
          defaultSet,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        setInputText('');
        fetchQueue();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to parse questions' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setParsing(false);
    }
  };

  const handleApproveAll = async () => {
    if (queue.length === 0) return;
    try {
      const res = await fetch('/api/admin/questions/review-queue/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ itemIds: queue.map(q => q.id) }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        fetchQueue();
        onQuestionsImported();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/questions/review-queue/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        fetchQueue();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      const res = await fetch(`/api/admin/questions/review-queue/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(editingItem),
      });
      if (res.ok) {
        setEditingItem(null);
        fetchQueue();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#172033] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#0891B2]" />
            Bulk Question Import & Document Parser (Review Queue)
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Splits documents (DOCX, PDF text, CSV, JSON) into individual questions with AI-assisted parsing and an approval staging queue
          </p>
        </div>

        <button
          onClick={fetchQueue}
          className="flex items-center gap-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#172033] px-3 py-1.5 rounded-xl text-xs font-semibold border border-[#DCE6F0] transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
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
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          {message.text}
        </div>
      )}

      {/* Input / Upload Console */}
      <div className="bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-sm font-bold text-[#172033] flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#0891B2]" />
            Document Ingestion & Splitter
          </h3>

          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-[#172033]">Default Target:</label>
            <select
              value={defaultRound}
              onChange={(e) => setDefaultRound(Number(e.target.value) as RoundNumber)}
              className="bg-[#F8FAFC] border border-[#DCE6F0] text-[#172033] rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-[#06B6D4]"
            >
              <option value={1}>Round 1</option>
              <option value={2}>Round 2</option>
              <option value={3}>Round 3</option>
            </select>
            <select
              value={defaultSet}
              onChange={(e) => setDefaultSet(e.target.value as QuestionSet)}
              className="bg-[#F8FAFC] border border-[#DCE6F0] text-[#172033] rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-[#06B6D4]"
            >
              <option value="A">Set A</option>
              <option value="B">Set B</option>
              <option value="C">Set C</option>
            </select>
          </div>
        </div>

        <textarea
          rows={5}
          placeholder={`Paste text from your Word/PDF docx or JSON here. Format example:
Question 1: Visual Rebus challenge for Operating System
Answer: Deadlock
Aliases: circular wait, resource stall
Points: 1

Question 2: Distributed consensus algorithm
Answer: Raft
Aliases: Paxos, consensus protocol
Points: 2`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl p-3.5 text-xs font-mono text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#06B6D4]"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#172033] px-3 py-1.5 rounded-xl text-xs font-semibold border border-[#DCE6F0] cursor-pointer transition">
            <FileText className="w-3.5 h-3.5 text-[#0891B2]" />
            Upload File (TXT, JSON, CSV)
            <input type="file" accept=".txt,.json,.csv" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleParse}
            disabled={parsing}
            className="bg-gradient-to-r from-[#06B6D4] to-[#2563EB] hover:from-[#0891B2] hover:to-[#1D4ED8] text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md flex items-center gap-2 transition cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            {parsing ? 'Splitting & Parsing...' : 'Parse & Add to Review Queue'}
          </button>
        </div>
      </div>

      {/* Review Queue */}
      <div className="bg-white border border-[#DCE6F0] rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-[#F8FAFC] px-5 py-3.5 border-b border-[#DCE6F0] flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="font-bold text-sm text-[#172033] flex items-center gap-2">
              Import Review Queue ({queue.length} Staged Questions)
            </span>
            <span className="text-xs text-[#64748B]">
              Questions must be validated here before committing to live competition question bank
            </span>
          </div>

          {queue.length > 0 && (
            <button
              onClick={handleApproveAll}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" /> Approve & Commit All ({queue.length})
            </button>
          )}
        </div>

        <div className="divide-y divide-[#DCE6F0] max-h-[500px] overflow-y-auto">
          {queue.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#64748B]">
              Review queue is empty. Paste or upload question documents above to stage questions.
            </div>
          ) : (
            queue.map((item) => (
              <div key={item.id} className="p-4 hover:bg-[#F8FAFC] transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-[#172033]">Q{item.questionNumber}: {item.title}</span>
                    <span className="px-2 py-0.5 rounded bg-[#ECFEFF] text-[#0891B2] border border-[#06B6D4]/30 text-[10px] font-mono">
                      Round {item.round} • Set {item.set}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#F1F5F9] text-[#64748B] text-[10px]">
                      {item.domain} • {item.points} pts
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        item.confidence === 'HIGH'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      Confidence: {item.confidence}
                    </span>
                  </div>

                  <div className="text-xs text-[#172033] bg-[#F8FAFC] p-2.5 rounded-xl border border-[#DCE6F0] flex flex-wrap gap-4 font-mono">
                    <div>
                      Answer: <strong className="text-emerald-700">"{item.correctAnswer}"</strong>
                    </div>
                    {item.aliases && item.aliases.length > 0 && (
                      <div>
                        Accepted Aliases: <span className="text-[#64748B]">[{item.aliases.join(', ')}]</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="p-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#172033] border border-[#DCE6F0] transition cursor-pointer"
                    title="Edit Item"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
                    title="Reject Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DCE6F0] rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#172033] flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-[#0891B2]" />
              Edit Staged Question
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#172033] font-medium block mb-1">Title / Prompt</label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl p-2.5 text-[#172033] focus:outline-none focus:border-[#06B6D4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#172033] font-medium block mb-1">Correct Answer</label>
                  <input
                    type="text"
                    value={editingItem.correctAnswer}
                    onChange={(e) => setEditingItem({ ...editingItem, correctAnswer: e.target.value })}
                    className="w-full bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl p-2.5 text-[#172033] font-mono focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
                <div>
                  <label className="text-[#172033] font-medium block mb-1">Points</label>
                  <input
                    type="number"
                    value={editingItem.points}
                    onChange={(e) => setEditingItem({ ...editingItem, points: Number(e.target.value) })}
                    className="w-full bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl p-2.5 text-[#172033] focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#172033] font-medium block mb-1">Aliases (comma separated)</label>
                <input
                  type="text"
                  value={(editingItem.aliases || []).join(', ')}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      aliases: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl p-2.5 text-[#172033] font-mono focus:outline-none focus:border-[#06B6D4]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#DCE6F0]">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#F1F5F9] text-[#172033] hover:bg-[#E2E8F0] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white hover:from-[#0891B2] hover:to-[#1D4ED8] cursor-pointer shadow-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
