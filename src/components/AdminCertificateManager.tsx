import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Upload, 
  Save, 
  Printer, 
  Eye, 
  Check, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck, 
  FileImage, 
  X, 
  Trash2, 
  Users,
  Download
} from 'lucide-react';
import { CertificateConfig, Team, TeamCertificateData } from '../types';
import { CertificateRenderer } from './CertificateRenderer';

interface AdminCertificateManagerProps {
  adminToken: string | null;
  teamsList: Team[];
  onShowMessage: (msg: string) => void;
}

export const AdminCertificateManager: React.FC<AdminCertificateManagerProps> = ({
  adminToken,
  teamsList,
  onShowMessage,
}) => {
  const [config, setConfig] = useState<CertificateConfig>({
    symposiumName: "ACETCM'26",
    eventTitle: "NATIONAL LEVEL SYMPOSIUM • TECH BRIDGE '26",
    department: "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING",
    institution: "ACHARIYA COLLEGE OF ENGINEERING TECHNOLOGY",
    date: "MARCH 2026",
    signatory1: { title: "Event Coordinator", name: "Mrs. K. Janani", designation: "AP / CSE" },
    signatory2: { title: "Student Coordinators", name: "Ms. Angel R (9487883582) & Mr. Thirumurugan S (9042789495)", designation: "Student Coordinators" },
    signatory3: { title: "II Year Coordinators", name: "A. Kamalambiga | R. Dharshini | P. Arthi | Gowsikram V | Swedha Sree. M", designation: "II Year Coordinators" },
    templateTheme: 'CYBER_TECH',
    customSealText: "ACHARIYA • CSE SYMPOSIUM ACETCM'26 • VERIFIED",
    sampleUploadedImage: null,
    sampleUploadedFileName: null,
    enabledForCompleted: true,
  });

  const [loading, setLoading] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teamsList[0]?.id || '');
  const [previewCert, setPreviewCert] = useState<TeamCertificateData | null>(null);
  const [showBatchPrint, setShowBatchPrint] = useState(false);
  const [allCertificates, setAllCertificates] = useState<TeamCertificateData[]>([]);

  useEffect(() => {
    fetchConfig();
  }, []);

  useEffect(() => {
    if (teamsList.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teamsList[0].id);
    }
  }, [teamsList, selectedTeamId]);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/certificate/config');
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setConfig(data.config);
        }
      }
    } catch {}
  };

  const handleSaveConfig = async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/certificate/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ config }),
      });
      const data = await res.json();
      if (res.ok) {
        onShowMessage('Certificate layout & signatories saved successfully!');
        if (data.config) setConfig(data.config);
      } else {
        onShowMessage(data.error || 'Failed to save certificate settings');
      }
    } catch {
      onShowMessage('Error saving certificate settings');
    } finally {
      setLoading(false);
    }
  };

  // Handle Sample Certificate Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowMessage('Please upload a valid image file (PNG, JPG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      if (!adminToken) return;
      try {
        const res = await fetch('/api/admin/certificate/upload-sample', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            imageDataUrl: dataUrl,
            fileName: file.name,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          onShowMessage('Sample certificate template uploaded & set as master background!');
          if (data.config) setConfig(data.config);
        } else {
          onShowMessage(data.error || 'Failed to upload template');
        }
      } catch {
        onShowMessage('Error uploading template');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSample = async () => {
    if (!adminToken) return;
    const updated = {
      ...config,
      sampleUploadedImage: null,
      sampleUploadedFileName: null,
    };
    setConfig(updated);
    try {
      const res = await fetch('/api/admin/certificate/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ config: updated }),
      });
      if (res.ok) {
        onShowMessage('Sample template removed. Reverted to default cyber theme.');
      }
    } catch {}
  };

  const handlePreviewTeamCert = async (teamId: string) => {
    try {
      const res = await fetch(`/api/certificate/team/${teamId}`);
      if (res.ok) {
        const data = await res.json();
        setPreviewCert(data.certificate);
      }
    } catch {
      onShowMessage('Could not generate certificate preview');
    }
  };

  const handleFetchAllCertificates = async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/admin/certificates/all', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAllCertificates(data.certificates || []);
        setShowBatchPrint(true);
      }
    } catch {
      onShowMessage('Error generating batch certificates');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-tech text-base font-bold text-[#172033] tracking-wider flex items-center gap-2">
              CERTIFICATE ENGINE & SAMPLE TEMPLATE MASTER
            </h2>
            <p className="text-xs text-[#64748B]">
              Upload sample certificates, customize official signatories, and auto-issue verified merit certificates to all teams.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleFetchAllCertificates}
            className="py-2 px-3.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#172033] text-xs font-bold font-tech flex items-center gap-2 transition border border-[#DCE6F0] cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#0891B2]" />
            BATCH PRINT ALL ({teamsList.length})
          </button>
          <button
            onClick={handleSaveConfig}
            disabled={loading}
            className="py-2 px-4 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#2563EB] hover:from-[#0891B2] hover:to-[#1D4ED8] text-white font-bold text-xs font-tech tracking-wider flex items-center gap-2 shadow-md shadow-cyan-500/10 transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            SAVE SETTINGS
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Template Upload & Institution Info */}
        <div className="space-y-6">
          {/* Sample Certificate Template Upload Card */}
          <div className="bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#0891B2] uppercase font-bold flex items-center gap-2">
                <FileImage className="w-4 h-4" />
                SAMPLE CERTIFICATE BACKGROUND UPLOAD
              </span>
              {config.sampleUploadedImage && (
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  SAMPLE ACTIVE
                </span>
              )}
            </div>

            <p className="text-xs text-[#64748B]">
              Upload the official scanned sample certificate format provided by the college. The participant's team name, college, score, rank, and security verification seal will overlay automatically!
            </p>

            {config.sampleUploadedImage ? (
              <div className="space-y-3">
                <div className="relative rounded-xl border border-[#DCE6F0] overflow-hidden bg-[#F8FAFC] max-h-48 group">
                  <img 
                    src={config.sampleUploadedImage} 
                    alt="Sample Certificate Template" 
                    className="w-full h-48 object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                    <span className="text-xs font-mono text-white truncate">
                      {config.sampleUploadedFileName || 'Uploaded Sample Certificate'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex-1 py-2 px-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#172033] text-xs font-bold text-center cursor-pointer transition border border-[#DCE6F0] flex items-center justify-center gap-2">
                    <Upload className="w-3.5 h-3.5 text-[#0891B2]" />
                    REPLACE SAMPLE IMAGE
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>

                  <button
                    onClick={handleRemoveSample}
                    className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    REMOVE
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#CBD5E1] hover:border-[#06B6D4] rounded-xl p-6 cursor-pointer bg-[#F8FAFC] transition group">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 text-[#0891B2] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-[#172033] group-hover:text-[#0891B2]">
                  Click to Upload Sample Certificate (PNG / JPG / WebP)
                </span>
                <span className="text-[10px] text-[#94A3B8] mt-1 font-mono">
                  Max size: 8MB • Landscape recommended (A4 ratio)
                </span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* Institution & Symposium Metadata */}
          <div className="bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm space-y-3">
            <span className="text-xs font-mono text-[#0891B2] uppercase font-bold block">
              SYMPOSIUM & INSTITUTION METADATA
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[#172033] mb-1 font-mono text-[11px] font-medium">INSTITUTION NAME:</label>
                <input
                  type="text"
                  value={config.institution}
                  onChange={(e) => setConfig({ ...config, institution: e.target.value })}
                  className="w-full bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl p-2.5 text-[#172033] font-medium focus:border-[#06B6D4] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#172033] mb-1 font-mono text-[11px] font-medium">DEPARTMENT:</label>
                <input
                  type="text"
                  value={config.department}
                  onChange={(e) => setConfig({ ...config, department: e.target.value })}
                  className="w-full bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl p-2.5 text-[#172033] font-medium focus:border-[#06B6D4] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#172033] mb-1 font-mono text-[11px] font-medium">SYMPOSIUM BANNER:</label>
                <input
                  type="text"
                  value={config.symposiumName}
                  onChange={(e) => setConfig({ ...config, symposiumName: e.target.value })}
                  className="w-full bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl p-2.5 text-[#172033] font-medium focus:border-[#06B6D4] outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[#172033] mb-1 font-mono text-[11px] font-medium">EVENT TITLE & CHALLENGE:</label>
                <input
                  type="text"
                  value={config.eventTitle}
                  onChange={(e) => setConfig({ ...config, eventTitle: e.target.value })}
                  className="w-full bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl p-2.5 text-[#172033] font-medium focus:border-[#06B6D4] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#172033] mb-1 font-mono text-[11px] font-medium">DATE OF SYMPOSIUM:</label>
                <input
                  type="text"
                  value={config.date}
                  onChange={(e) => setConfig({ ...config, date: e.target.value })}
                  className="w-full bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl p-2.5 text-[#172033] font-medium focus:border-[#06B6D4] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#172033] mb-1 font-mono text-[11px] font-medium">SEAL SECURITY TEXT:</label>
                <input
                  type="text"
                  value={config.customSealText}
                  onChange={(e) => setConfig({ ...config, customSealText: e.target.value })}
                  className="w-full bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl p-2.5 text-[#172033] font-medium focus:border-[#06B6D4] outline-none"
                />
              </div>
            </div>

            {/* Participant Availability Toggle */}
            <div className="pt-3 border-t border-[#DCE6F0] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#172033]">Participant Self-Service Download</div>
                <div className="text-[10px] text-[#64748B]">
                  Allows teams to view & download their certificate once competition finishes or on elimination
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfig({ ...config, enabledForCompleted: !config.enabledForCompleted })}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                  config.enabledForCompleted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#F1F5F9] text-[#64748B]'
                }`}
              >
                {config.enabledForCompleted ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Signatories Customizer & Test Preview */}
        <div className="space-y-6">
          {/* Signatories Configuration */}
          <div className="bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm space-y-4">
            <span className="text-xs font-mono text-[#0891B2] uppercase font-bold block">
              OFFICIAL SIGNATORIES
            </span>

            {/* Signatory 1 */}
            <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#DCE6F0] space-y-2 text-xs">
              <span className="text-[10px] font-mono text-[#0891B2] font-bold uppercase">
                SIGNATORY 1 (Staff Coordinator)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Role Title"
                  value={config.signatory1.title}
                  onChange={(e) => setConfig({
                    ...config,
                    signatory1: { ...config.signatory1, title: e.target.value }
                  })}
                  className="bg-white border border-[#DCE6F0] rounded-lg p-2 text-[#172033] outline-none focus:border-[#06B6D4]"
                />
                <input
                  type="text"
                  placeholder="Name"
                  value={config.signatory1.name}
                  onChange={(e) => setConfig({
                    ...config,
                    signatory1: { ...config.signatory1, name: e.target.value }
                  })}
                  className="bg-white border border-[#DCE6F0] rounded-lg p-2 text-[#172033] outline-none focus:border-[#06B6D4]"
                />
                <input
                  type="text"
                  placeholder="Designation"
                  value={config.signatory1.designation}
                  onChange={(e) => setConfig({
                    ...config,
                    signatory1: { ...config.signatory1, designation: e.target.value }
                  })}
                  className="bg-white border border-[#DCE6F0] rounded-lg p-2 text-[#172033] outline-none focus:border-[#06B6D4]"
                />
              </div>
            </div>

            {/* Signatory 2 */}
            <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#DCE6F0] space-y-2 text-xs">
              <span className="text-[10px] font-mono text-[#0891B2] font-bold uppercase">
                SIGNATORY 2 (Head of Department)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Role Title"
                  value={config.signatory2.title}
                  onChange={(e) => setConfig({
                    ...config,
                    signatory2: { ...config.signatory2, title: e.target.value }
                  })}
                  className="bg-white border border-[#DCE6F0] rounded-lg p-2 text-[#172033] outline-none focus:border-[#06B6D4]"
                />
                <input
                  type="text"
                  placeholder="Name"
                  value={config.signatory2.name}
                  onChange={(e) => setConfig({
                    ...config,
                    signatory2: { ...config.signatory2, name: e.target.value }
                  })}
                  className="bg-white border border-[#DCE6F0] rounded-lg p-2 text-[#172033] outline-none focus:border-[#06B6D4]"
                />
                <input
                  type="text"
                  placeholder="Designation"
                  value={config.signatory2.designation}
                  onChange={(e) => setConfig({
                    ...config,
                    signatory2: { ...config.signatory2, designation: e.target.value }
                  })}
                  className="bg-white border border-[#DCE6F0] rounded-lg p-2 text-[#172033] outline-none focus:border-[#06B6D4]"
                />
              </div>
            </div>

            {/* Signatory 3 */}
            <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#DCE6F0] space-y-2 text-xs">
              <span className="text-[10px] font-mono text-[#0891B2] font-bold uppercase">
                SIGNATORY 3 (Principal)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Role Title"
                  value={config.signatory3.title}
                  onChange={(e) => setConfig({
                    ...config,
                    signatory3: { ...config.signatory3, title: e.target.value }
                  })}
                  className="bg-white border border-[#DCE6F0] rounded-lg p-2 text-[#172033] outline-none focus:border-[#06B6D4]"
                />
                <input
                  type="text"
                  placeholder="Name"
                  value={config.signatory3.name}
                  onChange={(e) => setConfig({
                    ...config,
                    signatory3: { ...config.signatory3, name: e.target.value }
                  })}
                  className="bg-white border border-[#DCE6F0] rounded-lg p-2 text-[#172033] outline-none focus:border-[#06B6D4]"
                />
                <input
                  type="text"
                  placeholder="Designation"
                  value={config.signatory3.designation}
                  onChange={(e) => setConfig({
                    ...config,
                    signatory3: { ...config.signatory3, designation: e.target.value }
                  })}
                  className="bg-white border border-[#DCE6F0] rounded-lg p-2 text-[#172033] outline-none focus:border-[#06B6D4]"
                />
              </div>
            </div>
          </div>

          {/* Test Preview Generator */}
          <div className="bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm space-y-4">
            <span className="text-xs font-mono text-[#0891B2] uppercase font-bold block">
              LIVE CERTIFICATE PREVIEW
            </span>

            <div className="flex items-center gap-3">
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="flex-1 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl p-2.5 text-xs text-[#172033] outline-none focus:border-[#06B6D4]"
              >
                {teamsList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.id}) • {t.college} • {t.totalScore} pts
                  </option>
                ))}
              </select>

              <button
                onClick={() => selectedTeamId && handlePreviewTeamCert(selectedTeamId)}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#2563EB] hover:from-[#0891B2] hover:to-[#1D4ED8] text-white font-bold text-xs font-tech tracking-wider flex items-center gap-2 shadow-md transition cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                PREVIEW
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Certificate Modal Preview */}
      {previewCert && (
        <CertificateRenderer
          certificate={previewCert}
          onClose={() => setPreviewCert(null)}
          isModal={true}
        />
      )}

      {/* Batch Print Sheet (Printed or Previewed) */}
      {showBatchPrint && (
        <div className="fixed inset-0 z-50 bg-[#172033]/80 backdrop-blur-md flex flex-col p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto w-full mb-4 flex items-center justify-between print:hidden">
            <div className="text-white font-tech font-bold text-sm">
              BATCH CERTIFICATES ({allCertificates.length} Teams Ready for Print)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#2563EB] text-white font-bold text-xs font-tech flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                PRINT ALL CERTIFICATES
              </button>
              <button
                onClick={() => setShowBatchPrint(false)}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto w-full space-y-8 print:space-y-0">
            {allCertificates.map((cert) => (
              <div key={cert.certificateId} className="print:break-after-page mb-8 print:mb-0">
                <CertificateRenderer certificate={cert} isModal={false} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
