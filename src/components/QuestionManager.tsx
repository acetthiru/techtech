import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Upload, 
  Trash2, 
  Edit3, 
  Layers, 
  Filter, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  FileCode, 
  Copy, 
  X, 
  RefreshCw,
  Eye,
  Check,
  Image,
  ArrowRightLeft,
  GitMerge,
  Sliders,
  Sparkles,
  CheckSquare,
  Square
} from 'lucide-react';
import { Question, RoundNumber, QuestionSet } from '../types';
import { PanelVectorArt } from './RebusClueRenderer';

const SVG_OPTIONS = [
  { value: 'brain', label: 'Brain / Intelligence' },
  { value: 'token', label: 'Token / Coins' },
  { value: 'leak', label: 'Water Leak / Drop' },
  { value: 'plates', label: 'Stack / Plates' },
  { value: 'overflow', label: 'Overflow / Spilling' },
  { value: 'road_deadlock', label: 'Road Deadlock' },
  { value: 'pipe', label: 'Pipe / Pipeline' },
  { value: 'cpu', label: 'CPU / Processor' },
  { value: 'cache', label: 'Cache / Memory Slot' },
  { value: 'tree', label: 'Tree / Binary Tree' },
  { value: 'table', label: 'Database / Table' },
  { value: 'server_farm', label: 'Server Rack / Cloud' },
  { value: 'key_lock', label: 'Key & Lock / Crypto' },
  { value: 'clock', label: 'Clock / Timer' },
  { value: 'arrows_sync', label: 'Sync / Loop' },
  { value: 'balance', label: 'Balance / Scale' },
  { value: 'book_library', label: 'Library / Index' },
  { value: 'cube_grid', label: 'Matrix / Grid' },
  { value: 'gear_spin', label: 'Gear / Execution' },
  { value: 'lightning', label: 'Lightning / Speed' },
  { value: 'magnet', label: 'Magnet / Attraction' },
  { value: 'network_mesh', label: 'Network Mesh' },
  { value: 'puzzle_piece', label: 'Puzzle Piece' },
  { value: 'search_glass', label: 'Search Glass' },
  { value: 'shield_check', label: 'Security Shield' },
  { value: 'terminal', label: 'CLI / Terminal' },
  { value: 'traffic_light', label: 'Semaphore / Light' },
  { value: 'umbrella', label: 'Umbrella / Coverage' },
  { value: 'water_bucket', label: 'Bucket / Buffer' },
  { value: 'wifi_signal', label: 'WiFi / Radio' },
  { value: 'wire_circuit', label: 'Circuit / Wire' },
  { value: 'wrench_tool', label: 'Tool / Repair' },
];

interface QuestionManagerProps {
  questions: Question[];
  activeQuestionSet: Record<RoundNumber, QuestionSet>;
  currentRound: RoundNumber;
  adminToken: string | null;
  onRefresh: () => void;
  onSelectQuestionSet: (round: RoundNumber, set: QuestionSet) => Promise<void>;
  onDeleteQuestion: (questionId: string) => Promise<void>;
  onSaveQuestion: (question: Partial<Question>, isEdit: boolean) => Promise<void>;
  onUploadQuestions: (questions: any[], round?: RoundNumber, set?: QuestionSet, mode?: 'replace' | 'append') => Promise<void>;
  onSetConfig?: (round: RoundNumber, set: QuestionSet, maxCount: number, action: 'limit_active' | 'truncate') => Promise<void>;
  onMergeSets?: (round: RoundNumber, sourceSet: QuestionSet, targetSet: QuestionSet, keepSource: boolean) => Promise<void>;
  onMoveQuestions?: (payload: { questionIds?: string[]; sourceRound?: number; sourceSet?: string; targetRound: number; targetSet: string }) => Promise<void>;
  onAttachImage?: (questionId: string, imageUrl: string) => Promise<void>;
  onLoadOfficial30?: (mode: 'replace' | 'append') => Promise<void>;
}

export const QuestionManager: React.FC<QuestionManagerProps> = ({
  questions,
  activeQuestionSet,
  currentRound,
  adminToken,
  onRefresh,
  onSelectQuestionSet,
  onDeleteQuestion,
  onSaveQuestion,
  onUploadQuestions,
  onSetConfig,
  onMergeSets,
  onMoveQuestions,
  onAttachImage,
  onLoadOfficial30,
}) => {
  // Filtering & search
  const [filterRound, setFilterRound] = useState<'ALL' | RoundNumber>('ALL');
  const [filterSet, setFilterSet] = useState<'ALL' | QuestionSet>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadRound, setUploadRound] = useState<RoundNumber>(1);
  const [uploadSet, setUploadSet] = useState<QuestionSet>('A');
  const [uploadMode, setUploadMode] = useState<'replace' | 'append'>('replace');
  const [uploadJsonText, setUploadJsonText] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Set Configuration Modal (Select how many questions a set has)
  const [showSetConfigModal, setShowSetConfigModal] = useState(false);
  const [configRound, setConfigRound] = useState<RoundNumber>(1);
  const [configSet, setConfigSet] = useState<QuestionSet>('A');
  const [configCount, setConfigCount] = useState<number>(10);
  const [configAction, setConfigAction] = useState<'limit_active' | 'truncate'>('limit_active');

  // Merge Sets Modal
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeRound, setMergeRound] = useState<RoundNumber>(1);
  const [mergeSourceSet, setMergeSourceSet] = useState<QuestionSet>('B');
  const [mergeTargetSet, setMergeTargetSet] = useState<QuestionSet>('A');
  const [mergeKeepSource, setMergeKeepSource] = useState<boolean>(true);

  // Move Questions Modal
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveMode, setMoveMode] = useState<'selected' | 'entire_set'>('entire_set');
  const [moveSourceRound, setMoveSourceRound] = useState<RoundNumber>(1);
  const [moveSourceSet, setMoveSourceSet] = useState<QuestionSet>('B');
  const [moveTargetRound, setMoveTargetRound] = useState<RoundNumber>(1);
  const [moveTargetSet, setMoveTargetSet] = useState<QuestionSet>('A');

  // Question Selection (for bulk move/actions)
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  // Attach Image Modal (Multiple Connected Realistic Images)
  const [showAttachImageModal, setShowAttachImageModal] = useState(false);
  const [targetQuestionForImage, setTargetQuestionForImage] = useState<Question | null>(null);
  const [imageUrl1ToAttach, setImageUrl1ToAttach] = useState('');
  const [imageUrl2ToAttach, setImageUrl2ToAttach] = useState('');
  const [imageUrl3ToAttach, setImageUrl3ToAttach] = useState('');

  // Load Official 30 Bank Modal
  const [showOfficialBankModal, setShowOfficialBankModal] = useState(false);
  const [officialBankMode, setOfficialBankMode] = useState<'replace' | 'append'>('replace');

  // Operational Notification Banner
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Question Form State for Add / Edit
  const [formData, setFormData] = useState<{
    round: RoundNumber;
    set: QuestionSet;
    questionNumber: number;
    domain: string;
    difficulty: 'Medium' | 'Hard' | 'Very Hard';
    points: number;
    correctAnswer: string;
    aliases: string;
    rebusFormulaText: string;
    explanation: string;
    panel1Desc: string;
    panel1Svg: string;
    panel2Desc: string;
    panel2Svg: string;
    customImageUrl: string;
    active: boolean;
  }>({
    round: 1,
    set: 'A',
    questionNumber: 1,
    domain: 'Computer Science',
    difficulty: 'Medium',
    points: 1,
    correctAnswer: '',
    aliases: '',
    rebusFormulaText: 'Panel 1 + Panel 2',
    explanation: '',
    panel1Desc: '',
    panel1Svg: 'token',
    panel2Desc: '',
    panel2Svg: 'brain',
    customImageUrl: '',
    active: true,
  });

  const resetForm = () => {
    setFormData({
      round: currentRound || 1,
      set: activeQuestionSet?.[currentRound || 1] || 'A',
      questionNumber: 1,
      domain: 'Computer Science',
      difficulty: (currentRound === 1 ? 'Medium' : currentRound === 2 ? 'Hard' : 'Very Hard'),
      points: currentRound === 1 ? 1 : currentRound === 2 ? 2 : 3,
      correctAnswer: '',
      aliases: '',
      rebusFormulaText: 'Panel 1 + Panel 2',
      explanation: '',
      panel1Desc: '',
      panel1Svg: 'token',
      panel2Desc: '',
      panel2Svg: 'brain',
      customImageUrl: '',
      active: true,
    });
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (q: Question) => {
    setEditingQuestion(q);
    setFormData({
      round: q.round,
      set: q.set || 'A',
      questionNumber: q.questionNumber,
      domain: q.domain,
      difficulty: q.difficulty,
      points: q.points,
      correctAnswer: q.correctAnswer,
      aliases: q.aliases.join(', '),
      rebusFormulaText: q.rebusFormulaText,
      explanation: q.explanation,
      panel1Desc: q.cluePanels[0]?.description || '',
      panel1Svg: q.cluePanels[0]?.svgType || 'token',
      panel2Desc: q.cluePanels[1]?.description || '',
      panel2Svg: q.cluePanels[1]?.svgType || 'brain',
      customImageUrl: q.customImageUrl || (q.images && q.images[0]) || '',
      active: q.active !== false,
    });
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.correctAnswer.trim()) {
      alert('Authoritative correct answer is required.');
      return;
    }

    setActionLoading(true);
    try {
      const payload: Partial<Question> = {
        id: editingQuestion?.id,
        round: formData.round,
        set: formData.set,
        questionNumber: Number(formData.questionNumber),
        domain: formData.domain.trim(),
        difficulty: formData.difficulty,
        points: Number(formData.points),
        correctAnswer: formData.correctAnswer.trim(),
        aliases: formData.aliases
          .split(',')
          .map((a) => a.trim().toLowerCase())
          .filter(Boolean),
        rebusFormulaText: formData.rebusFormulaText.trim() || 'Panel 1 + Panel 2',
        explanation: formData.explanation.trim(),
        active: formData.active,
        customImageUrl: formData.customImageUrl?.trim() || undefined,
        cluePanels: [
          {
            panelNumber: 1,
            description: formData.panel1Desc.trim() || 'Visual clue panel 1',
            svgType: formData.panel1Svg,
          },
          {
            panelNumber: 2,
            description: formData.panel2Desc.trim() || 'Visual clue panel 2',
            svgType: formData.panel2Svg,
          },
        ],
      };

      await onSaveQuestion(payload, !!editingQuestion);
      setShowAddModal(false);
      setEditingQuestion(null);
      setFeedbackNotice(`Question #${payload.questionNumber} saved successfully with realistic imagery.`);
      setTimeout(() => setFeedbackNotice(null), 3500);
      onRefresh();
    } catch (err: any) {
      alert(`Error saving question: ${err?.message || 'Server error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Set Count Configuration Handler
  const handleSetConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (onSetConfig) {
        await onSetConfig(configRound, configSet, configCount, configAction);
      } else {
        await fetch('/api/admin/questions/set-config', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
          },
          body: JSON.stringify({
            round: configRound,
            set: configSet,
            maxCount: configCount,
            action: configAction,
          }),
        });
      }
      setShowSetConfigModal(false);
      setFeedbackNotice(`Set ${configSet} in Round ${configRound} configured to ${configCount} questions (${configAction}).`);
      setTimeout(() => setFeedbackNotice(null), 3500);
      onRefresh();
    } catch (err: any) {
      alert(`Failed to set question count: ${err?.message || 'Network error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Merge Sets Handler
  const handleMergeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mergeSourceSet === mergeTargetSet) {
      alert('Source set and target set cannot be the same.');
      return;
    }
    setActionLoading(true);
    try {
      if (onMergeSets) {
        await onMergeSets(mergeRound, mergeSourceSet, mergeTargetSet, mergeKeepSource);
      } else {
        await fetch('/api/admin/questions/merge-sets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
          },
          body: JSON.stringify({
            round: mergeRound,
            sourceSet: mergeSourceSet,
            targetSet: mergeTargetSet,
            keepSource: mergeKeepSource,
          }),
        });
      }
      setShowMergeModal(false);
      setFeedbackNotice(`Merged Round ${mergeRound} Set ${mergeSourceSet} into Set ${mergeTargetSet} successfully.`);
      setTimeout(() => setFeedbackNotice(null), 3500);
      onRefresh();
    } catch (err: any) {
      alert(`Failed to merge sets: ${err?.message || 'Network error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Move Questions Handler
  const handleMoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = moveMode === 'selected' 
        ? {
            questionIds: selectedQuestionIds,
            targetRound: moveTargetRound,
            targetSet: moveTargetSet,
          }
        : {
            sourceRound: moveSourceRound,
            sourceSet: moveSourceSet,
            targetRound: moveTargetRound,
            targetSet: moveTargetSet,
          };

      if (onMoveQuestions) {
        await onMoveQuestions(payload);
      } else {
        await fetch('/api/admin/questions/move', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
          },
          body: JSON.stringify(payload),
        });
      }
      setShowMoveModal(false);
      setSelectedQuestionIds([]);
      setFeedbackNotice(`Questions moved to Round ${moveTargetRound} Set ${moveTargetSet} successfully.`);
      setTimeout(() => setFeedbackNotice(null), 3500);
      onRefresh();
    } catch (err: any) {
      alert(`Failed to move questions: ${err?.message || 'Network error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Attach Images Handler (2-3 connected realistic photographic clues)
  const handleAttachImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetQuestionForImage) return;
    setActionLoading(true);
    try {
      const imagesToSave = [imageUrl1ToAttach.trim(), imageUrl2ToAttach.trim(), imageUrl3ToAttach.trim()].filter(Boolean);
      
      if (onAttachImage) {
        await onAttachImage(targetQuestionForImage.id, imagesToSave[0] || '');
      } else {
        await fetch('/api/admin/question/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
          },
          body: JSON.stringify({
            questionId: targetQuestionForImage.id,
            images: imagesToSave,
            imageUrl: imagesToSave[0] || '',
          }),
        });
      }
      setShowAttachImageModal(false);
      setTargetQuestionForImage(null);
      setImageUrl1ToAttach('');
      setImageUrl2ToAttach('');
      setImageUrl3ToAttach('');
      setFeedbackNotice(`${imagesToSave.length} connected realistic images attached to Question #${targetQuestionForImage.questionNumber}.`);
      setTimeout(() => setFeedbackNotice(null), 3500);
      onRefresh();
    } catch (err: any) {
      alert(`Failed to attach images: ${err?.message || 'Network error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Load Official 30 Bank Handler
  const handleLoadOfficialBankSubmit = async () => {
    setActionLoading(true);
    try {
      if (onLoadOfficial30) {
        await onLoadOfficial30(officialBankMode);
      } else {
        await fetch('/api/admin/questions/load-official-30', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
          },
          body: JSON.stringify({ mode: officialBankMode }),
        });
      }
      setShowOfficialBankModal(false);
      setFeedbackNotice(`Official 90 questions bank (30 Qs per round with realistic images) successfully loaded.`);
      setTimeout(() => setFeedbackNotice(null), 4500);
      onRefresh();
    } catch (err: any) {
      alert(`Failed to load official 30 questions bank: ${err?.message || 'Network error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Load Existing 3-Set Repository Handler
  const handleLoadSeedQuestions = async () => {
    if (!window.confirm("Load existing 3-set questions repository (Set A, Set B, Set C for each round)?")) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/questions/load-seed-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({ mode: 'replace' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load existing 3 sets');
      }
      setFeedbackNotice(`Existing 3-set questions repository successfully loaded (${data.totalQuestions} questions across Set A, B, C).`);
      setTimeout(() => setFeedbackNotice(null), 4500);
      onRefresh();
    } catch (err: any) {
      alert(`Failed to load existing questions: ${err?.message || 'Network error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!questionToDelete) return;
    setActionLoading(true);
    try {
      await onDeleteQuestion(questionToDelete.id);
      setQuestionToDelete(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadSubmit = async () => {
    setUploadError(null);
    if (!uploadJsonText.trim()) {
      setUploadError('Please enter valid JSON or load a sample template.');
      return;
    }

    try {
      const parsed = JSON.parse(uploadJsonText);
      const questionsList = Array.isArray(parsed) ? parsed : parsed.questions;
      if (!Array.isArray(questionsList) || questionsList.length === 0) {
        setUploadError('JSON must contain an array of questions.');
        return;
      }

      setActionLoading(true);
      await onUploadQuestions(questionsList, uploadRound, uploadSet, uploadMode);
      setShowUploadModal(false);
      setUploadJsonText('');
    } catch (err: any) {
      setUploadError(`Invalid JSON syntax: ${err?.message || 'Check commas and braces'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const loadSampleTemplate = () => {
    const sample = [
      {
        questionNumber: 1,
        round: uploadRound,
        set: uploadSet,
        domain: 'Operating Systems',
        difficulty: 'Medium',
        points: uploadRound === 1 ? 1 : uploadRound === 2 ? 2 : 3,
        rebusFormulaText: 'Panel 1 (Resource) + Panel 2 (Hold)',
        correctAnswer: 'Deadlock',
        aliases: ['deadlock', 'circular wait', 'mutual exclusion'],
        explanation: 'Processes blocked waiting for resources held by each other.',
        cluePanels: [
          { panelNumber: 1, description: '4-way grid traffic deadlock junction', svgType: 'road_deadlock' },
          { panelNumber: 2, description: 'Interlocking security key and closed lock', svgType: 'key_lock' },
        ],
      },
      {
        questionNumber: 2,
        round: uploadRound,
        set: uploadSet,
        domain: 'Computer Architecture',
        difficulty: 'Hard',
        points: uploadRound === 1 ? 1 : uploadRound === 2 ? 2 : 3,
        rebusFormulaText: 'Panel 1 (Fast SRAM) + Panel 2 (Direct Map)',
        correctAnswer: 'Cache Memory',
        aliases: ['cache', 'cache memory', 'l1 cache'],
        explanation: 'High-speed buffer between CPU registers and main memory.',
        cluePanels: [
          { panelNumber: 1, description: 'Multi-level high speed silicon memory unit', svgType: 'cache' },
          { panelNumber: 2, description: 'Microprocessor core executing high-frequency clock', svgType: 'cpu' },
        ],
      },
    ];

    setUploadJsonText(JSON.stringify(sample, null, 2));
    setUploadError(null);
  };

  // Filter questions list
  const filteredQuestions = questions.filter((q) => {
    if (filterRound !== 'ALL' && q.round !== filterRound) return false;
    if (filterSet !== 'ALL' && (q.set || 'A') !== filterSet) return false;
    if (searchQuery.trim()) {
      const s = searchQuery.toLowerCase();
      const matchNumber = `q${q.questionNumber}`.includes(s) || `#${q.questionNumber}`.includes(s);
      const matchAnswer = q.correctAnswer.toLowerCase().includes(s);
      const matchDomain = q.domain.toLowerCase().includes(s);
      const matchFormula = q.rebusFormulaText.toLowerCase().includes(s);
      const matchAliases = q.aliases.some((a) => a.toLowerCase().includes(s));
      if (!matchNumber && !matchAnswer && !matchDomain && !matchFormula && !matchAliases) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. ACTIVE QUESTION SET CONTROLLER FOR EACH ROUND */}
      <div className="bg-white border border-[#DCE6F0] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#7C3AED]" />
              <h3 className="font-tech text-base font-bold text-[#172033] tracking-wider">
                AUTHORITATIVE QUESTION SET SELECTOR
              </h3>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Admin selects which set of questions participants will receive for each round (Set A, Set B, or Set C). Only the chosen set is active.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="py-1.5 px-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#DCE6F0] text-xs font-mono text-[#172033] flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#0891B2]" />
              SYNC BANK
            </button>
          </div>
        </div>

        {/* 3 Round Set Selector Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {([1, 2, 3] as const).map((r) => {
            const activeSet = activeQuestionSet?.[r] || 'A';
            const isCurrentRound = currentRound === r;

            return (
              <div
                key={r}
                className={`p-4 rounded-xl border transition ${
                  isCurrentRound
                    ? 'bg-cyan-50/50 border-[#06B6D4] shadow-sm'
                    : 'bg-[#F8FAFC] border-[#DCE6F0]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-tech text-xs font-bold text-[#172033]">
                      ROUND {r}
                    </span>
                    {isCurrentRound && (
                      <span className="px-1.5 py-0.5 rounded-lg text-[9px] font-mono bg-cyan-100 text-[#0891B2] border border-cyan-200 font-bold">
                        LIVE STAGE
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-[#7C3AED] font-bold">
                    Active: Set {activeSet}
                  </span>
                </div>

                <p className="text-[11px] text-[#64748B] mb-3">
                  Choose participant set for Round {r}:
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {(['A', 'B', 'C'] as const).map((setName) => {
                    const isSelected = activeSet === setName;
                    const count = questions.filter(
                      (q) => q.round === r && (q.set || 'A') === setName
                    ).length;

                    return (
                      <button
                        key={setName}
                        onClick={() => onSelectQuestionSet(r, setName)}
                        className={`py-2 px-2 rounded-lg border text-center transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#7C3AED] border-[#7C3AED] text-white shadow-sm font-bold'
                            : 'bg-white border-[#DCE6F0] text-[#64748B] hover:text-[#172033] hover:border-[#CBD5E1]'
                        }`}
                      >
                        <div className="font-mono text-xs">SET {setName}</div>
                        <div className="text-[10px] opacity-80 font-mono mt-0.5">
                          {count} Qs
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* SET MANAGEMENT TOOLBAR & BULK ACTIONS */}
        <div className="pt-4 border-t border-[#DCE6F0] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowSetConfigModal(true)}
              className="py-1.5 px-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-cyan-200 text-xs font-mono text-[#0891B2] font-semibold flex items-center gap-1.5 transition shadow-sm active:scale-95 cursor-pointer"
              title="Set how many questions a set has (limit active or truncate)"
            >
              <Sliders className="w-3.5 h-3.5 text-[#0891B2]" />
              <span>SET QUESTION COUNT</span>
            </button>

            <button
              onClick={() => setShowMergeModal(true)}
              className="py-1.5 px-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-purple-200 text-xs font-mono text-[#7C3AED] font-semibold flex items-center gap-1.5 transition shadow-sm active:scale-95 cursor-pointer"
              title="Merge questions from one set into another set"
            >
              <GitMerge className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>MERGE SETS</span>
            </button>

            <button
              onClick={() => {
                setMoveMode(selectedQuestionIds.length > 0 ? 'selected' : 'entire_set');
                setShowMoveModal(true);
              }}
              className="py-1.5 px-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-amber-200 text-xs font-mono text-amber-700 font-semibold flex items-center gap-1.5 transition shadow-sm active:scale-95 cursor-pointer"
              title="Move questions or entire set to another set or round"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />
              <span>MOVE QUESTIONS {selectedQuestionIds.length > 0 ? `(${selectedQuestionIds.length} SELECTED)` : 'SET'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowOfficialBankModal(true)}
              className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs font-tech tracking-wider flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
              title="Load pre-built official 90 questions bank (30 Qs per round with realistic images)"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>LOAD 30 Qs / ROUND (REALISTIC)</span>
            </button>

            <button
              onClick={handleLoadSeedQuestions}
              disabled={actionLoading}
              className="py-1.5 px-3.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-indigo-200 text-indigo-700 font-bold text-xs font-tech tracking-wider flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Load existing questions repository having 3 sets (A, B, C) in each round"
            >
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>USE EXISTING 3 SETS (A, B, C)</span>
            </button>

            <a
              href="/api/admin/questions/download-realistic-file"
              download="symposium_30_questions_per_round_realistic.json"
              className="py-1.5 px-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#DCE6F0] text-xs font-mono text-emerald-700 flex items-center gap-1.5 transition"
              title="Download separate 30 Qs / round realistic dataset file"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>DOWNLOAD 30-Q FILE</span>
            </a>
          </div>
        </div>

        {/* FEEDBACK NOTICE BANNER */}
        {feedbackNotice && (
          <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-xs text-[#0891B2] font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0891B2] shrink-0" />
            <span>{feedbackNotice}</span>
          </div>
        )}
      </div>

      {/* 2. QUESTION BANK BROWSER & CRUD ACTION TOOLBAR */}
      <div className="bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h3 className="font-tech text-base font-bold text-[#172033] tracking-wider">
              QUESTION REPOSITORY & REBUS EDITOR
            </h3>
            <p className="text-xs text-[#64748B]">
              Total {questions.length} questions banked across 3 rounds and sets (A, B, C). Edit, delete, add, or upload sets at any time.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={openAddModal}
              className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#2563EB] hover:from-[#0891B2] hover:to-[#1D4ED8] text-white font-bold text-xs font-tech tracking-wider flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              ADD QUESTION
            </button>

            <button
              onClick={() => {
                setUploadError(null);
                setShowUploadModal(true);
              }}
              className="py-2 px-3.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs font-tech tracking-wider flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              UPLOAD SET
            </button>

            <a
              href="/api/admin/offline-kit"
              target="_blank"
              rel="noreferrer"
              className="py-2 px-3.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#DCE6F0] text-xs font-mono text-[#0891B2] flex items-center gap-1.5 transition font-semibold"
            >
              <Download className="w-4 h-4" />
              OFFLINE JSON
            </a>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-[#DCE6F0]">
          {/* Round Filter */}
          <div className="sm:col-span-3">
            <label className="block text-[10px] font-mono text-[#64748B] font-semibold mb-1">
              FILTER BY ROUND:
            </label>
            <div className="flex rounded-xl bg-[#F8FAFC] p-1 border border-[#DCE6F0]">
              {(['ALL', 1, 2, 3] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFilterRound(r)}
                  className={`flex-1 py-1 text-center rounded-lg font-mono text-xs font-semibold transition cursor-pointer ${
                    filterRound === r
                      ? 'bg-[#06B6D4] text-white font-bold'
                      : 'text-[#64748B] hover:text-[#172033]'
                  }`}
                >
                  {r === 'ALL' ? 'All' : `R${r}`}
                </button>
              ))}
            </div>
          </div>

          {/* Set Filter */}
          <div className="sm:col-span-4">
            <label className="block text-[10px] font-mono text-[#64748B] font-semibold mb-1">
              FILTER BY SET:
            </label>
            <div className="flex rounded-xl bg-[#F8FAFC] p-1 border border-[#DCE6F0]">
              {(['ALL', 'A', 'B', 'C'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilterSet(s)}
                  className={`flex-1 py-1 text-center rounded-lg font-mono text-xs font-semibold transition cursor-pointer ${
                    filterSet === s
                      ? 'bg-[#7C3AED] text-white font-bold'
                      : 'text-[#64748B] hover:text-[#172033]'
                  }`}
                >
                  {s === 'ALL' ? 'All' : `Set ${s}`}
                </button>
              ))}
            </div>
          </div>

          {/* Search Query */}
          <div className="sm:col-span-5">
            <label className="block text-[10px] font-mono text-[#64748B] font-semibold mb-1">
              SEARCH QUESTIONS:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by answer, domain, #, or formula..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-xs font-mono text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:border-[#06B6D4]"
              />
            </div>
          </div>
        </div>

        {/* Filter Results Info Banner */}
        <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B] bg-[#F8FAFC] px-3 py-2 rounded-xl border border-[#DCE6F0]">
          <span>
            Showing <strong className="text-[#0891B2]">{filteredQuestions.length}</strong> of {questions.length} questions
          </span>
          <span>
            {filterRound !== 'ALL' && <span className="mr-2">Round {filterRound}</span>}
            {filterSet !== 'ALL' && <span>Set {filterSet}</span>}
          </span>
        </div>

        {/* Question Cards & Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#DCE6F0] text-[#64748B] font-mono">
                <th className="pb-3 px-2 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={filteredQuestions.length > 0 && selectedQuestionIds.length === filteredQuestions.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedQuestionIds(filteredQuestions.map(q => q.id));
                      } else {
                        setSelectedQuestionIds([]);
                      }
                    }}
                    className="rounded bg-white border-[#CBD5E1] text-[#06B6D4] focus:ring-0 cursor-pointer"
                    title="Select all filtered questions"
                  />
                </th>
                <th className="pb-3 px-3">Q#</th>
                <th className="pb-3 px-3">ROUND / SET</th>
                <th className="pb-3 px-3">DOMAIN</th>
                <th className="pb-3 px-3">VECTOR PANELS</th>
                <th className="pb-3 px-3">REALISTIC IMAGES</th>
                <th className="pb-3 px-3">AUTHORITATIVE ANSWER</th>
                <th className="pb-3 px-3">ALIASES</th>
                <th className="pb-3 px-3 text-center">PTS</th>
                <th className="pb-3 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredQuestions.map((q) => {
                const isRoundActiveSet = (activeQuestionSet?.[q.round] || 'A') === (q.set || 'A');
                const isSelected = selectedQuestionIds.includes(q.id);
                const questionImages = q.images && q.images.length > 0 ? q.images : q.customImageUrl ? [q.customImageUrl] : [];

                return (
                  <tr 
                    key={q.id} 
                    className={`transition-colors ${
                      isSelected ? 'bg-cyan-50/60' : 'hover:bg-[#F8FAFC]'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-2 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedQuestionIds(prev => [...prev, q.id]);
                          } else {
                            setSelectedQuestionIds(prev => prev.filter(id => id !== q.id));
                          }
                        }}
                        className="rounded bg-white border-[#CBD5E1] text-[#06B6D4] focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Q Number */}
                    <td className="py-3 px-3 font-mono font-bold text-[#0891B2]">
                      #{q.questionNumber}
                    </td>

                    {/* Round & Set */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[#172033] font-semibold">
                          R{q.round}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-50 text-[#7C3AED] border border-purple-200">
                          Set {q.set || 'A'}
                        </span>
                        {isRoundActiveSet && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200" title="This set is currently attending the live round">
                            ACTIVE
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Domain */}
                    <td className="py-3 px-3 text-[#172033] font-medium">
                      <div>{q.domain}</div>
                      <span className="text-[10px] font-mono text-[#64748B]">
                        {q.difficulty}
                      </span>
                    </td>

                    {/* Vector Clue Panels */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        {q.cluePanels.map((p, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#DCE6F0] flex items-center justify-center p-1 shadow-sm"
                            title={`Panel ${p.panelNumber || idx + 1}`}
                          >
                            <PanelVectorArt type={p.svgType} large={false} />
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Realistic Images */}
                    <td className="py-3 px-3">
                      {questionImages.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setTargetQuestionForImage(q);
                            setImageUrl1ToAttach(questionImages[0] || '');
                            setImageUrl2ToAttach(questionImages[1] || '');
                            setImageUrl3ToAttach(questionImages[2] || '');
                            setShowAttachImageModal(true);
                          }}
                          className="flex items-center gap-2 group text-left cursor-pointer"
                          title="Click to edit connected realistic images"
                        >
                          <div className="flex items-center gap-1">
                            {questionImages.slice(0, 3).map((imgUrl, i) => (
                              <React.Fragment key={i}>
                                {i > 0 && <span className="text-[10px] font-bold text-[#0891B2] select-none">+</span>}
                                <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#DCE6F0] bg-white shrink-0 shadow-sm">
                                  <img
                                    src={imgUrl}
                                    alt={`Clue ${i + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                </div>
                              </React.Fragment>
                            ))}
                          </div>
                          <span className="text-[10px] font-mono text-[#0891B2] underline group-hover:text-[#06B6D4] whitespace-nowrap">
                            {questionImages.length} Real {questionImages.length === 1 ? 'Clue' : 'Clues'}
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setTargetQuestionForImage(q);
                            setImageUrl1ToAttach('');
                            setImageUrl2ToAttach('');
                            setImageUrl3ToAttach('');
                            setShowAttachImageModal(true);
                          }}
                          className="text-[10px] font-mono text-[#64748B] hover:text-[#0891B2] py-1 px-2 rounded-lg bg-[#F8FAFC] border border-[#DCE6F0] hover:border-[#06B6D4] transition flex items-center gap-1 cursor-pointer"
                        >
                          <Image className="w-3 h-3" />
                          <span>+ Attach Images</span>
                        </button>
                      )}
                    </td>

                    {/* Correct Answer */}
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700 text-sm">
                      {q.correctAnswer}
                    </td>

                    {/* Aliases */}
                    <td className="py-3 px-3 font-mono text-[#64748B] max-w-[150px] truncate" title={q.aliases.join(', ')}>
                      {q.aliases.join(', ') || '—'}
                    </td>

                    {/* Points */}
                    <td className="py-3 px-3 font-mono font-bold text-center text-[#0891B2]">
                      +{q.points}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setTargetQuestionForImage(q);
                            const qImgs = (q.images && q.images.length > 0) ? q.images : (q.customImageUrl ? [q.customImageUrl] : []);
                            setImageUrl1ToAttach(qImgs[0] || '');
                            setImageUrl2ToAttach(qImgs[1] || '');
                            setImageUrl3ToAttach(qImgs[2] || '');
                            setShowAttachImageModal(true);
                          }}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            (q.images && q.images.length > 0) || q.customImageUrl
                              ? 'bg-purple-50 border border-purple-200 text-[#7C3AED] hover:bg-purple-100'
                              : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#7C3AED] border border-[#DCE6F0]'
                          }`}
                          title="Attach / Edit Realistic Clue Images"
                        >
                          <Image className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedQuestionIds([q.id]);
                            setMoveMode('selected');
                            setMoveTargetRound(q.round);
                            setMoveTargetSet(q.set === 'A' ? 'B' : 'A');
                            setShowMoveModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] hover:text-amber-600 transition border border-[#DCE6F0] cursor-pointer"
                          title="Move Question to another Set / Round"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(q)}
                          className="p-1.5 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#172033] hover:text-[#0891B2] transition border border-[#DCE6F0] cursor-pointer"
                          title="Edit Question"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setQuestionToDelete(q)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition border border-rose-200 cursor-pointer"
                          title="Delete Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==========================================
          MODAL: ADD / EDIT QUESTION
          ========================================== */}
      {(showAddModal || editingQuestion) && (
        <div className="fixed inset-0 z-50 bg-[#172033]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-[#DCE6F0] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DCE6F0] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-[#0891B2]">
                  {editingQuestion ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-tech text-base font-bold text-[#172033] tracking-wider">
                    {editingQuestion ? 'EDIT QUESTION' : 'ADD NEW QUESTION'}
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Define rebus visual formula, answer validation, and clue vector graphics.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingQuestion(null);
                }}
                className="text-[#64748B] hover:text-[#172033] p-1.5 rounded-lg hover:bg-[#F1F5F9] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              {/* Row 1: Round, Set, Question Number, Points */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-mono text-[#64748B] mb-1 font-semibold">ROUND</label>
                  <select
                    value={formData.round}
                    onChange={(e) => {
                      const r = Number(e.target.value) as RoundNumber;
                      setFormData({
                        ...formData,
                        round: r,
                        points: r === 1 ? 1 : r === 2 ? 2 : 3,
                        difficulty: r === 1 ? 'Medium' : r === 2 ? 'Hard' : 'Very Hard',
                      });
                    }}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#172033] font-mono focus:border-[#06B6D4]"
                  >
                    <option value={1}>Round 1</option>
                    <option value={2}>Round 2</option>
                    <option value={3}>Round 3</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[#64748B] mb-1 font-semibold">SET</label>
                  <select
                    value={formData.set}
                    onChange={(e) => setFormData({ ...formData, set: e.target.value as QuestionSet })}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#172033] font-mono focus:border-[#06B6D4]"
                  >
                    <option value="A">Set A</option>
                    <option value="B">Set B</option>
                    <option value="C">Set C</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[#64748B] mb-1 font-semibold">QUESTION #</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.questionNumber}
                    onChange={(e) => setFormData({ ...formData, questionNumber: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#172033] font-mono focus:border-[#06B6D4]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-mono text-[#64748B] mb-1 font-semibold">POINTS</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#172033] font-mono focus:border-[#06B6D4]"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Domain, Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[#64748B] mb-1 font-semibold">DOMAIN / TOPIC</label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    placeholder="e.g. Operating Systems, Networks, DBMS..."
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#172033] font-mono focus:border-[#06B6D4]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-mono text-[#64748B] mb-1 font-semibold">DIFFICULTY</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#172033] font-mono focus:border-[#06B6D4]"
                  >
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Very Hard">Very Hard</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Correct Answer & Aliases */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[#64748B] mb-1 font-semibold">
                    AUTHORITATIVE CORRECT ANSWER *
                  </label>
                  <input
                    type="text"
                    value={formData.correctAnswer}
                    onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                    placeholder="e.g. Deadlock"
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-emerald-300 rounded-xl text-emerald-800 font-mono font-bold focus:border-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="block font-mono text-[#64748B] mb-1 font-semibold">
                    ACCEPTED SYNONYMS / ALIASES (COMMA SEPARATED)
                  </label>
                  <input
                    type="text"
                    value={formData.aliases}
                    onChange={(e) => setFormData({ ...formData, aliases: e.target.value })}
                    placeholder="e.g. circular wait, mutual exclusion"
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#172033] font-mono focus:border-[#06B6D4]"
                  />
                </div>
              </div>

              {/* Row 4: Rebus Formula Text */}
              <div>
                <label className="block font-mono text-[#64748B] mb-1 font-semibold">
                  REBUS SYNTHESIS FORMULA TEXT
                </label>
                <input
                  type="text"
                  value={formData.rebusFormulaText}
                  onChange={(e) => setFormData({ ...formData, rebusFormulaText: e.target.value })}
                  placeholder="e.g. Panel 1 (Process) + Panel 2 (Circular Wait)"
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-amber-700 font-mono focus:border-amber-500 font-medium"
                  required
                />
              </div>

              {/* Clue Panel 1 */}
              <div className="p-3.5 bg-[#F8FAFC] border border-[#DCE6F0] rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between font-mono text-xs font-bold text-[#0891B2]">
                  <span>CLUE PANEL 1</span>
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#DCE6F0] flex items-center justify-center shadow-sm">
                    <PanelVectorArt type={formData.panel1Svg} large={false} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[11px] text-[#64748B] mb-1 font-semibold">PANEL 1 SVG DIAGRAM</label>
                    <select
                      value={formData.panel1Svg}
                      onChange={(e) => setFormData({ ...formData, panel1Svg: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#DCE6F0] rounded-xl text-[#172033] font-mono text-xs"
                    >
                      {SVG_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] text-[#64748B] mb-1 font-semibold">PANEL 1 CLUE DESCRIPTION</label>
                    <input
                      type="text"
                      value={formData.panel1Desc}
                      onChange={(e) => setFormData({ ...formData, panel1Desc: e.target.value })}
                      placeholder="e.g. 4-way intersection grid deadlock"
                      className="w-full px-3 py-2 bg-white border border-[#DCE6F0] rounded-xl text-[#172033] font-mono text-xs"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Clue Panel 2 */}
              <div className="p-3.5 bg-[#F8FAFC] border border-[#DCE6F0] rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between font-mono text-xs font-bold text-[#0891B2]">
                  <span>CLUE PANEL 2</span>
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#DCE6F0] flex items-center justify-center shadow-sm">
                    <PanelVectorArt type={formData.panel2Svg} large={false} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[11px] text-[#64748B] mb-1 font-semibold">PANEL 2 SVG DIAGRAM</label>
                    <select
                      value={formData.panel2Svg}
                      onChange={(e) => setFormData({ ...formData, panel2Svg: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#DCE6F0] rounded-xl text-[#172033] font-mono text-xs"
                    >
                      {SVG_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] text-[#64748B] mb-1 font-semibold">PANEL 2 CLUE DESCRIPTION</label>
                    <input
                      type="text"
                      value={formData.panel2Desc}
                      onChange={(e) => setFormData({ ...formData, panel2Desc: e.target.value })}
                      placeholder="e.g. Interlocking padlock and key"
                      className="w-full px-3 py-2 bg-white border border-[#DCE6F0] rounded-xl text-[#172033] font-mono text-xs"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Realistic / Real-World Question Clue Image */}
              <div className="p-3.5 bg-[#F8FAFC] border border-[#DCE6F0] rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between font-mono text-xs font-bold text-[#7C3AED]">
                  <span className="flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5" />
                    REALISTIC REAL-WORLD CLUE IMAGE (OPTIONAL / REBUS ENHANCER)
                  </span>
                  {formData.customImageUrl && (
                    <span className="text-[10px] text-emerald-700 font-mono font-bold">URL Attached</span>
                  )}
                </div>

                <div className="space-y-2">
                  <input
                    type="url"
                    value={formData.customImageUrl}
                    onChange={(e) => setFormData({ ...formData, customImageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/... or paste direct realistic photograph URL"
                    className="w-full px-3 py-2 bg-white border border-[#DCE6F0] rounded-xl text-[#7C3AED] font-mono text-xs focus:outline-none focus:border-[#7C3AED]"
                  />

                  {formData.customImageUrl && (
                    <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-[#DCE6F0]">
                      <div className="w-16 h-12 rounded-lg overflow-hidden border border-purple-200 bg-[#F1F5F9] shrink-0">
                        <img
                          src={formData.customImageUrl}
                          alt="Clue visual preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.opacity = '0.3';
                          }}
                        />
                      </div>
                      <div className="text-[11px] font-mono text-[#64748B]">
                        Realistic photograph rendered with anti-screenshot security watermark in live arena.
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, customImageUrl: '' })}
                        className="ml-auto text-xs text-rose-600 hover:text-rose-700 font-mono cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  )}

                  {/* Quick Presets */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] font-mono text-[#64748B] font-semibold">PRESETS:</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, customImageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80' })}
                      className="px-2 py-0.5 rounded bg-white hover:bg-[#F1F5F9] border border-[#DCE6F0] text-[10px] font-mono text-[#172033] cursor-pointer"
                    >
                      Datacenter Rack
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, customImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80' })}
                      className="px-2 py-0.5 rounded bg-white hover:bg-[#F1F5F9] border border-[#DCE6F0] text-[10px] font-mono text-[#172033] cursor-pointer"
                    >
                      Microchip PCB
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, customImageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80' })}
                      className="px-2 py-0.5 rounded bg-white hover:bg-[#F1F5F9] border border-[#DCE6F0] text-[10px] font-mono text-[#172033] cursor-pointer"
                    >
                      Fiber Cable
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, customImageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80' })}
                      className="px-2 py-0.5 rounded bg-white hover:bg-[#F1F5F9] border border-[#DCE6F0] text-[10px] font-mono text-[#172033] cursor-pointer"
                    >
                      Cyber Matrix
                    </button>
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block font-mono text-[#64748B] mb-1 font-semibold">
                  TECHNICAL EXPLANATION / RATIONALE (FOR EVALUATOR KEY)
                </label>
                <textarea
                  rows={2}
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Explain why this answer represents the synthesis of the clues..."
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#172033] font-mono text-xs focus:border-[#06B6D4]"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-q-active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded bg-white border-[#CBD5E1] text-[#06B6D4] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="chk-q-active" className="text-[#172033] font-mono cursor-pointer font-medium">
                  Question Active in Competition Pool
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#DCE6F0]">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingQuestion(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#172033] font-bold text-xs border border-[#DCE6F0] cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#2563EB] hover:from-[#0891B2] hover:to-[#1D4ED8] text-white font-bold text-xs font-tech tracking-wider shadow-md shadow-cyan-500/10 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {actionLoading ? 'SAVING...' : editingQuestion ? 'SAVE MODIFICATIONS' : 'CREATE QUESTION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: BULK UPLOAD QUESTIONS / SET
          ========================================== */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-[#172033]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-purple-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DCE6F0] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-[#7C3AED]">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-tech text-base font-bold text-[#172033] tracking-wider">
                    BULK UPLOAD QUESTION SET
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Import or replace an entire set of questions using standard JSON syntax.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowUploadModal(false)}
                className="text-[#64748B] hover:text-[#172033] p-1.5 rounded-lg hover:bg-[#F1F5F9] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Destination Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl">
                <div>
                  <label className="block font-mono text-[#64748B] mb-1 font-semibold">TARGET ROUND</label>
                  <select
                    value={uploadRound}
                    onChange={(e) => setUploadRound(Number(e.target.value) as RoundNumber)}
                    className="w-full px-3 py-1.5 bg-white border border-[#DCE6F0] rounded-lg text-[#172033] font-mono focus:border-[#06B6D4]"
                  >
                    <option value={1}>Round 1</option>
                    <option value={2}>Round 2</option>
                    <option value={3}>Round 3</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[#64748B] mb-1 font-semibold">TARGET SET</label>
                  <select
                    value={uploadSet}
                    onChange={(e) => setUploadSet(e.target.value as QuestionSet)}
                    className="w-full px-3 py-1.5 bg-white border border-[#DCE6F0] rounded-lg text-[#172033] font-mono focus:border-[#06B6D4]"
                  >
                    <option value="A">Set A</option>
                    <option value="B">Set B</option>
                    <option value="C">Set C</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[#64748B] mb-1 font-semibold">UPLOAD MODE</label>
                  <select
                    value={uploadMode}
                    onChange={(e) => setUploadMode(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-white border border-[#DCE6F0] rounded-lg text-[#172033] font-mono focus:border-[#06B6D4]"
                  >
                    <option value="replace">Replace questions in this set</option>
                    <option value="append">Append to existing questions</option>
                  </select>
                </div>
              </div>

              {/* Template Loader & File input helper */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-[#64748B] font-semibold">
                  Paste JSON Array:
                </span>
                <button
                  type="button"
                  onClick={loadSampleTemplate}
                  className="px-3 py-1 rounded-lg bg-purple-50 text-[#7C3AED] hover:bg-purple-100 border border-purple-200 font-mono text-xs flex items-center gap-1.5 transition font-semibold cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  Load Sample JSON Template
                </button>
              </div>

              <textarea
                rows={10}
                value={uploadJsonText}
                onChange={(e) => setUploadJsonText(e.target.value)}
                placeholder='[
  {
    "questionNumber": 1,
    "domain": "Operating Systems",
    "correctAnswer": "Deadlock",
    "aliases": ["deadlock"],
    "rebusFormulaText": "Panel 1 + Panel 2",
    "cluePanels": [
      { "panelNumber": 1, "description": "4-way road traffic deadlock", "svgType": "road_deadlock" },
      { "panelNumber": 2, "description": "Security lock and key", "svgType": "key_lock" }
    ]
  }
]'
                className="w-full p-3 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl font-mono text-xs text-[#172033] focus:outline-none focus:border-[#7C3AED] leading-relaxed"
              />

              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#172033] font-bold text-xs border border-[#DCE6F0] cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  disabled={actionLoading || !uploadJsonText.trim()}
                  onClick={handleUploadSubmit}
                  className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs font-tech tracking-wider shadow-md shadow-purple-600/10 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {actionLoading ? 'PROCESSING...' : 'VALIDATE & IMPORT QUESTIONS'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: CONFIRM DELETE QUESTION
          ========================================== */}
      {questionToDelete && (
        <div className="fixed inset-0 z-50 bg-[#172033]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-rose-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-tech text-base font-bold tracking-wider text-[#172033]">
                CONFIRM QUESTION REMOVAL
              </h3>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed">
              Are you sure you want to delete Question #{questionToDelete.questionNumber} (Round {questionToDelete.round}, Set {questionToDelete.set || 'A'})?
            </p>

            <div className="p-3 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-xs space-y-1 font-mono text-[#64748B]">
              <div>Answer: <strong className="text-emerald-700">{questionToDelete.correctAnswer}</strong></div>
              <div>Domain: {questionToDelete.domain}</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setQuestionToDelete(null)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#172033] font-bold text-xs border border-[#DCE6F0] cursor-pointer"
              >
                CANCEL
              </button>
              <button
                disabled={actionLoading}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-tech tracking-wider disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {actionLoading ? 'REMOVING...' : 'PERMANENTLY DELETE'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: SET QUESTION COUNT CONFIGURATION
          ========================================== */}
      {showSetConfigModal && (
        <div className="fixed inset-0 z-50 bg-[#172033]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-cyan-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE6F0] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-[#0891B2]">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-tech text-base font-bold text-[#172033] tracking-wider">
                    CONFIGURE SET QUESTION COUNT
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Define the exact active question quota for a specific competition set.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSetConfigModal(false)}
                className="text-[#64748B] hover:text-[#172033] p-1.5 rounded-lg hover:bg-[#F1F5F9] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSetConfigSubmit} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">TARGET ROUND</label>
                  <select
                    value={configRound}
                    onChange={(e) => setConfigRound(Number(e.target.value) as RoundNumber)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#172033]"
                  >
                    <option value={1}>Round 1 (Buzzer)</option>
                    <option value={2}>Round 2 (Rebus Matrix)</option>
                    <option value={3}>Round 3 (Rapid Fire)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#64748B] mb-1 font-semibold">TARGET SET</label>
                  <select
                    value={configSet}
                    onChange={(e) => setConfigSet(e.target.value as QuestionSet)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#172033]"
                  >
                    <option value="A">Set A</option>
                    <option value="B">Set B</option>
                    <option value="C">Set C</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">
                  MAXIMUM QUESTIONS FOR THIS SET (ACTIVE QUOTA)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={configCount}
                    onChange={(e) => setConfigCount(Number(e.target.value))}
                    className="w-28 px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#0891B2] font-bold text-sm"
                    required
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[5, 10, 15, 20, 25, 30].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setConfigCount(num)}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer ${
                          configCount === num
                            ? 'bg-cyan-50 border-[#06B6D4] text-[#0891B2] font-bold'
                            : 'bg-white border-[#DCE6F0] text-[#64748B] hover:text-[#172033]'
                        }`}
                      >
                        {num} Qs
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2 p-3 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl">
                <label className="block text-[#172033] font-semibold mb-1">EXCESS QUESTIONS POLICY:</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="excessAction"
                    value="limit_active"
                    checked={configAction === 'limit_active'}
                    onChange={() => setConfigAction('limit_active')}
                    className="text-[#06B6D4] bg-white border-[#CBD5E1]"
                  />
                  <span className="text-[#334155]">
                    <strong className="text-[#0891B2]">Limit Active Quota:</strong> Keep excess questions in reserve (deactivate active flag, non-destructive).
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="excessAction"
                    value="truncate"
                    checked={configAction === 'truncate'}
                    onChange={() => setConfigAction('truncate')}
                    className="text-rose-500 bg-white border-[#CBD5E1]"
                  />
                  <span className="text-[#334155]">
                    <strong className="text-rose-600">Truncate Set:</strong> Permanently delete questions beyond the chosen count limit.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSetConfigModal(false)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#172033] font-bold text-xs border border-[#DCE6F0] cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#2563EB] hover:from-[#0891B2] hover:to-[#1D4ED8] text-white font-bold text-xs font-tech tracking-wider disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? 'SAVING...' : 'APPLY SET CONFIGURATION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: MERGE QUESTION SETS
          ========================================== */}
      {showMergeModal && (
        <div className="fixed inset-0 z-50 bg-[#172033]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-purple-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE6F0] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-[#7C3AED]">
                  <GitMerge className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-tech text-base font-bold text-[#172033] tracking-wider">
                    MERGE QUESTION SETS
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Consolidate questions from one set into another with automatic sequential renumbering.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMergeModal(false)}
                className="text-[#64748B] hover:text-[#172033] p-1.5 rounded-lg hover:bg-[#F1F5F9] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMergeSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[#64748B] mb-1 font-semibold">TARGET ROUND</label>
                <select
                  value={mergeRound}
                  onChange={(e) => setMergeRound(Number(e.target.value) as RoundNumber)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#172033]"
                >
                  <option value={1}>Round 1</option>
                  <option value={2}>Round 2</option>
                  <option value={3}>Round 3</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl items-center">
                <div>
                  <label className="block text-amber-700 mb-1 font-bold">SOURCE SET (FROM)</label>
                  <select
                    value={mergeSourceSet}
                    onChange={(e) => setMergeSourceSet(e.target.value as QuestionSet)}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-amber-800 font-bold"
                  >
                    <option value="A">Set A</option>
                    <option value="B">Set B</option>
                    <option value="C">Set C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-emerald-700 mb-1 font-bold">TARGET SET (MERGE INTO)</label>
                  <select
                    value={mergeTargetSet}
                    onChange={(e) => setMergeTargetSet(e.target.value as QuestionSet)}
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-emerald-800 font-bold"
                  >
                    <option value="A">Set A</option>
                    <option value="B">Set B</option>
                    <option value="C">Set C</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mergeKeepSource}
                    onChange={(e) => setMergeKeepSource(e.target.checked)}
                    className="text-[#7C3AED] bg-white border-[#CBD5E1] rounded"
                  />
                  <span className="text-[#334155]">
                    Duplicate questions into Target (keep original questions in Source Set)
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMergeModal(false)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#172033] font-bold text-xs border border-[#DCE6F0] cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || mergeSourceSet === mergeTargetSet}
                  className="px-5 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs font-tech tracking-wider disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? 'MERGING...' : 'EXECUTE SET MERGE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: MOVE QUESTIONS BETWEEN SETS / ROUNDS
          ========================================== */}
      {showMoveModal && (
        <div className="fixed inset-0 z-50 bg-[#172033]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-amber-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE6F0] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-tech text-base font-bold text-[#172033] tracking-wider">
                    MOVE QUESTIONS
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Transfer selected questions or an entire set to a different Round or Set.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMoveModal(false)}
                className="text-[#64748B] hover:text-[#172033] p-1.5 rounded-lg hover:bg-[#F1F5F9] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMoveSubmit} className="space-y-4 text-xs font-mono">
              {/* Move Mode Selector */}
              <div className="flex rounded-xl bg-[#F8FAFC] p-1 border border-[#DCE6F0]">
                <button
                  type="button"
                  onClick={() => setMoveMode('selected')}
                  disabled={selectedQuestionIds.length === 0}
                  className={`flex-1 py-1.5 rounded-lg text-center font-bold transition cursor-pointer ${
                    moveMode === 'selected'
                      ? 'bg-amber-600 text-white'
                      : 'text-[#64748B] hover:text-[#172033] disabled:opacity-40'
                  }`}
                >
                  Move Selected ({selectedQuestionIds.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMoveMode('entire_set')}
                  className={`flex-1 py-1.5 rounded-lg text-center font-bold transition cursor-pointer ${
                    moveMode === 'entire_set'
                      ? 'bg-amber-600 text-white'
                      : 'text-[#64748B] hover:text-[#172033]'
                  }`}
                >
                  Move Entire Set
                </button>
              </div>

              {moveMode === 'entire_set' ? (
                <div className="p-3 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl space-y-3">
                  <div className="text-amber-700 font-bold">SOURCE SET TO MOVE:</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#64748B] mb-1 font-semibold">SOURCE ROUND</label>
                      <select
                        value={moveSourceRound}
                        onChange={(e) => setMoveSourceRound(Number(e.target.value) as RoundNumber)}
                        className="w-full px-3 py-2 bg-white border border-[#DCE6F0] rounded-xl text-[#172033]"
                      >
                        <option value={1}>Round 1</option>
                        <option value={2}>Round 2</option>
                        <option value={3}>Round 3</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#64748B] mb-1 font-semibold">SOURCE SET</label>
                      <select
                        value={moveSourceSet}
                        onChange={(e) => setMoveSourceSet(e.target.value as QuestionSet)}
                        className="w-full px-3 py-2 bg-white border border-[#DCE6F0] rounded-xl text-[#172033]"
                      >
                        <option value="A">Set A</option>
                        <option value="B">Set B</option>
                        <option value="C">Set C</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#334155]">
                  Moving <strong className="text-amber-700">{selectedQuestionIds.length}</strong> selected questions.
                </div>
              )}

              {/* Destination */}
              <div className="p-3 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl space-y-3">
                <div className="text-emerald-700 font-bold">DESTINATION LOCATION:</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#64748B] mb-1 font-semibold">DESTINATION ROUND</label>
                    <select
                      value={moveTargetRound}
                      onChange={(e) => setMoveTargetRound(Number(e.target.value) as RoundNumber)}
                      className="w-full px-3 py-2 bg-white border border-[#DCE6F0] rounded-xl text-[#172033]"
                    >
                      <option value={1}>Round 1</option>
                      <option value={2}>Round 2</option>
                      <option value={3}>Round 3</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#64748B] mb-1 font-semibold">DESTINATION SET</label>
                    <select
                      value={moveTargetSet}
                      onChange={(e) => setMoveTargetSet(e.target.value as QuestionSet)}
                      className="w-full px-3 py-2 bg-white border border-[#DCE6F0] rounded-xl text-[#172033]"
                    >
                      <option value="A">Set A</option>
                      <option value="B">Set B</option>
                      <option value="C">Set C</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMoveModal(false)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#172033] font-bold text-xs border border-[#DCE6F0] cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs font-tech tracking-wider disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? 'MOVING...' : 'CONFIRM MOVE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: ATTACH REALISTIC IMAGE TO QUESTION
          ========================================== */}
      {showAttachImageModal && targetQuestionForImage && (
        <div className="fixed inset-0 z-50 bg-[#172033]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-purple-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE6F0] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-[#7C3AED]">
                  <Image className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-tech text-base font-bold text-[#172033] tracking-wider">
                    ATTACH CONNECTED REALISTIC IMAGES
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Question #{targetQuestionForImage.questionNumber} (Round {targetQuestionForImage.round}, Set {targetQuestionForImage.set || 'A'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAttachImageModal(false);
                  setTargetQuestionForImage(null);
                }}
                className="text-[#64748B] hover:text-[#172033] p-1.5 rounded-lg hover:bg-[#F1F5F9] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAttachImageSubmit} className="space-y-4 text-xs font-mono max-h-[80vh] overflow-y-auto pr-1">
              <div className="p-3 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl space-y-1">
                <div>Domain: <span className="text-[#172033] font-semibold">{targetQuestionForImage.domain}</span></div>
                <div>Answer: <strong className="text-emerald-700">{targetQuestionForImage.correctAnswer}</strong></div>
                <div className="text-[11px] text-[#0891B2]">
                  Provide 2 or 3 distinct photographic clues that together connect to reveal "{targetQuestionForImage.correctAnswer}".
                </div>
              </div>

              {/* Image 1 URL */}
              <div>
                <label className="block text-[#0891B2] mb-1 font-bold">
                  IMAGE 1 URL (PRIMARY CLUE)
                </label>
                <input
                  type="url"
                  value={imageUrl1ToAttach}
                  onChange={(e) => setImageUrl1ToAttach(e.target.value)}
                  placeholder="https://images.unsplash.com/... or realistic image URL"
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#06B6D4]"
                />
              </div>

              {/* Image 2 URL */}
              <div>
                <label className="block text-[#0891B2] mb-1 font-bold">
                  IMAGE 2 URL (CONNECTED SECOND CLUE)
                </label>
                <input
                  type="url"
                  value={imageUrl2ToAttach}
                  onChange={(e) => setImageUrl2ToAttach(e.target.value)}
                  placeholder="https://images.unsplash.com/... or realistic image URL"
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#06B6D4]"
                />
              </div>

              {/* Image 3 URL (Optional) */}
              <div>
                <label className="block text-[#64748B] mb-1 font-bold">
                  IMAGE 3 URL (OPTIONAL THIRD CLUE)
                </label>
                <input
                  type="url"
                  value={imageUrl3ToAttach}
                  onChange={(e) => setImageUrl3ToAttach(e.target.value)}
                  placeholder="Optional 3rd connected image URL"
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl text-[#172033] focus:outline-none focus:border-[#06B6D4]"
                />
              </div>

              {/* Connected Realistic Preview */}
              {([imageUrl1ToAttach.trim(), imageUrl2ToAttach.trim(), imageUrl3ToAttach.trim()].some(Boolean)) && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] text-[#64748B] font-bold uppercase">
                    CONNECTED REBUS IMAGE PREVIEW:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[imageUrl1ToAttach.trim(), imageUrl2ToAttach.trim(), imageUrl3ToAttach.trim()]
                      .filter(Boolean)
                      .map((url, i) => (
                        <div
                          key={i}
                          className="h-32 rounded-xl overflow-hidden border border-[#DCE6F0] bg-white flex items-center justify-center relative shadow-sm"
                        >
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-white/90 text-[10px] font-bold text-[#0891B2] z-10 border border-[#DCE6F0]">
                            CLUE {i + 1}
                          </span>
                          <img
                            src={url}
                            alt={`Preview ${i + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.opacity = '0.3';
                            }}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAttachImageModal(false);
                    setTargetQuestionForImage(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#172033] font-bold text-xs border border-[#DCE6F0] cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#2563EB] hover:from-[#0891B2] hover:to-[#1D4ED8] text-white font-bold text-xs font-tech tracking-wider disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? 'SAVING...' : 'SAVE CONNECTED IMAGES'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: LOAD OFFICIAL 30 QUESTIONS PER ROUND
          ========================================== */}
      {showOfficialBankModal && (
        <div className="fixed inset-0 z-50 bg-[#172033]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-emerald-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE6F0] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-tech text-base font-bold text-[#172033] tracking-wider">
                    LOAD MASTER 30 Qs / ROUND BANK
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Instantly provision 90 competition questions with realistic high-resolution imagery.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOfficialBankModal(false)}
                className="text-[#64748B] hover:text-[#172033] p-1.5 rounded-lg hover:bg-[#F1F5F9] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="p-3.5 bg-[#F8FAFC] border border-[#DCE6F0] rounded-2xl space-y-2">
                <div className="text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>MASTER SPECIFICATION INCLUDES:</span>
                </div>
                <ul className="space-y-1.5 text-[#334155] pl-2">
                  <li>• <strong>Round 1 (Buzzer):</strong> 30 Questions (Set A: 10, Set B: 10, Set C: 10) — 1 Point</li>
                  <li>• <strong>Round 2 (Rebus Matrix):</strong> 30 Questions (Set A: 10, Set B: 10, Set C: 10) — 2 Points</li>
                  <li>• <strong>Round 3 (Rapid Fire):</strong> 30 Questions (Set A: 10, Set B: 10, Set C: 10) — 3 Points</li>
                  <li>• <strong>Imagery:</strong> 90 realistic real-world technology photographs (CPUs, fiber optics, datacenters, cryptography, OS kernels).</li>
                </ul>
              </div>

              <div className="space-y-2 p-3 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl">
                <div className="text-[#172033] font-bold mb-1">LOAD MODE:</div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="officialMode"
                    value="replace"
                    checked={officialBankMode === 'replace'}
                    onChange={() => setOfficialBankMode('replace')}
                    className="text-emerald-600 bg-white border-[#CBD5E1]"
                  />
                  <span className="text-[#334155]">
                    <strong className="text-emerald-700">Replace Repository:</strong> Wipe temporary test questions and install the clean 90-question master dataset.
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="officialMode"
                    value="append"
                    checked={officialBankMode === 'append'}
                    onChange={() => setOfficialBankMode('append')}
                    className="text-[#06B6D4] bg-white border-[#CBD5E1]"
                  />
                  <span className="text-[#334155]">
                    <strong className="text-[#0891B2]">Append:</strong> Keep existing custom questions and append any missing official questions.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOfficialBankModal(false)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#172033] font-bold text-xs border border-[#DCE6F0] cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleLoadOfficialBankSubmit}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs font-tech tracking-wider shadow-md shadow-emerald-700/10 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? 'PROVISIONING 90 QUESTIONS...' : 'LOAD 90 QUESTIONS NOW'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
