import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, Printer, CheckCircle2, ShieldAlert, Award, FileText, RefreshCw, BarChart2 } from 'lucide-react';

interface EventReportsPanelProps {
  adminToken: string | null;
}

export const EventReportsPanel: React.FC<EventReportsPanelProps> = ({ adminToken }) => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reports/event-summary', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchSummary();
    }
  }, [adminToken]);

  const handleDownloadXLSX = () => {
    // Initiate direct download with auth token parameter or window download
    window.location.href = `/api/admin/reports/export-xlsx`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#172033] flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            Official Event Reports & Multi-Sheet Exports
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Department of Computer Science & Engineering • TECH BRIDGE '26 Comprehensive Dossier
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#172033] px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#DCE6F0] transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Print Summary
          </button>
          <a
            href="/api/admin/reports/export-xlsx"
            download="TECH_BRIDGE_26_Official_Report.xlsx"
            className="flex items-center gap-2 bg-gradient-to-r from-[#06B6D4] to-[#2563EB] hover:from-[#0891B2] hover:to-[#1D4ED8] text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download Complete XLSX Workbook
          </a>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#DCE6F0] rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-[#64748B] block mb-1 font-medium">Total Teams Enrolled</span>
          <span className="text-2xl font-black text-[#172033]">{summary?.stats?.totalTeams || 0}</span>
          <span className="text-[11px] text-emerald-700 font-medium block mt-1">
            {summary?.stats?.activeTeams || 0} Active • {summary?.stats?.lockedTeams || 0} Locked
          </span>
        </div>

        <div className="bg-white border border-[#DCE6F0] rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-[#64748B] block mb-1 font-medium">Answer Submissions</span>
          <span className="text-2xl font-black text-[#0891B2]">{summary?.stats?.totalSubmissions || 0}</span>
          <span className="text-[11px] text-[#64748B] block mt-1">
            {summary?.stats?.totalCorrect || 0} Correct ({summary?.stats?.completionRate || 0}%)
          </span>
        </div>

        <div className="bg-white border border-[#DCE6F0] rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-[#64748B] block mb-1 font-medium">Anti-Cheat Violations</span>
          <span className="text-2xl font-black text-rose-700">{summary?.stats?.antiCheatViolationsCount || 0}</span>
          <span className="text-[11px] text-rose-600 font-medium block mt-1">
            {summary?.stats?.lockedTeams || 0} Teams Locked (2-violation rule)
          </span>
        </div>

        <div className="bg-white border border-[#DCE6F0] rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-[#64748B] block mb-1 font-medium">Manual Adjustments</span>
          <span className="text-2xl font-black text-blue-700">{summary?.stats?.manualScoreAdjustmentsCount || 0}</span>
          <span className="text-[11px] text-blue-600 font-medium block mt-1">
            Audited & verified by Super Admin
          </span>
        </div>
      </div>

      {/* Report Cards Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CSV Export Links */}
        <div className="bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#172033] flex items-center gap-2">
            <Download className="w-4 h-4 text-[#0891B2]" />
            Individual CSV Datasets
          </h3>

          <div className="space-y-2.5">
            <a
              href="/api/admin/export-csv"
              className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#DCE6F0] text-xs transition"
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="font-semibold text-[#172033] block">Official Leaderboard & Standings</span>
                  <span className="text-[11px] text-[#64748B]">Ranks, Round 1-3 scores, colleges</span>
                </div>
              </div>
              <span className="text-[#2563EB] font-bold">Download CSV</span>
            </a>

            <a
              href="/api/admin/export-anticheat-csv"
              className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#DCE6F0] text-xs transition"
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <div>
                  <span className="font-semibold text-[#172033] block">Anti-Cheat Incident Dossier</span>
                  <span className="text-[11px] text-[#64748B]">Focus loss, app background, time away</span>
                </div>
              </div>
              <span className="text-[#2563EB] font-bold">Download CSV</span>
            </a>

            <a
              href="/api/admin/export-audit-csv"
              className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#DCE6F0] text-xs transition"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="font-semibold text-[#172033] block">Super Admin Audit Trail Ledger</span>
                  <span className="text-[11px] text-[#64748B]">Every timer change, score adjustment, lockout</span>
                </div>
              </div>
              <span className="text-[#2563EB] font-bold">Download CSV</span>
            </a>
          </div>
        </div>

        {/* Top 10 Snapshot */}
        <div className="bg-white border border-[#DCE6F0] rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#172033] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#0891B2]" />
              Leaderboard Top 10 Snapshot
            </h3>
            <span className="text-xs text-[#64748B]">Live Standings</span>
          </div>

          <div className="divide-y divide-[#DCE6F0] max-h-60 overflow-y-auto">
            {(summary?.leaderboardTop10 || []).map((t: any) => (
              <div key={t.teamId} className="py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="font-mono font-bold text-[#0891B2] w-5">#{t.rank}</span>
                  <div className="truncate">
                    <span className="font-semibold text-[#172033] block truncate">{t.teamName}</span>
                    <span className="text-[10px] text-[#64748B] block truncate">{t.college}</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-[#172033] text-sm shrink-0">
                  {t.totalScore} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
