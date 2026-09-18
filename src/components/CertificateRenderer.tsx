import React, { useRef } from 'react';
import { 
  Award, 
  Printer, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode, 
  X, 
  Sparkles,
  ExternalLink,
  Layers,
  FileCheck
} from 'lucide-react';
import { TeamCertificateData } from '../types';
import confetti from 'canvas-confetti';

interface CertificateRendererProps {
  certificate: TeamCertificateData;
  onClose?: () => void;
  isModal?: boolean;
}

export const CertificateRenderer: React.FC<CertificateRendererProps> = ({
  certificate,
  onClose,
  isModal = true,
}) => {
  const certRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}
    window.print();
  };

  const getAwardLabel = (category: string) => {
    switch (category) {
      case 'FIRST_PLACE':
        return { text: 'FIRST PLACE WINNER', color: 'text-amber-400', badge: 'GOLD LAUREL' };
      case 'SECOND_PLACE':
        return { text: 'FIRST RUNNER-UP', color: 'text-slate-300', badge: 'SILVER LAUREL' };
      case 'THIRD_PLACE':
        return { text: 'SECOND RUNNER-UP', color: 'text-amber-600', badge: 'BRONZE LAUREL' };
      case 'DISTINCTION':
        return { text: 'CERTIFICATE OF DISTINCTION', color: 'text-cyan-400', badge: 'TOP PERFORMER' };
      default:
        return { text: 'CERTIFICATE OF MERIT & PARTICIPATION', color: 'text-emerald-400', badge: 'HONORABLE CONTENDER' };
    }
  };

  const awardInfo = getAwardLabel(certificate.awardCategory);
  const cfg = certificate.config;

  const content = (
    <div className="w-full max-w-4xl mx-auto bg-white text-[#24324A] rounded-2xl border border-[#E8E3EF] shadow-xl overflow-hidden print:bg-white print:text-black print:border-none print:shadow-none print:m-0 print:p-0 print:max-w-none">
      {/* Top Action Toolbar (Hidden in Print) */}
      <div className="p-4 bg-[#F7F3FC] border-b border-[#E8E3EF] flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#C83A87]/10 text-[#C83A87]">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold font-tech tracking-wider text-[#24324A]">
              OFFICIAL SYMPOSIUM CERTIFICATE
            </div>
            <div className="text-[10px] font-mono text-[#667085]">
              ID: {certificate.certificateId} • Verified Hash: {certificate.verificationHash}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C83A87] to-[#55C7D9] hover:brightness-110 text-white font-bold text-xs font-tech tracking-wider flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT / SAVE PDF</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-[#FFFDF5] text-[#667085] hover:text-[#24324A] transition border border-[#E8E3EF] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Actual Certificate Sheet */}
      <div 
        ref={certRef}
        className="relative p-8 sm:p-12 min-h-[620px] flex flex-col justify-between overflow-hidden bg-white print:bg-white print:text-black print:p-8"
        style={
          cfg.sampleUploadedImage
            ? {
                backgroundImage: `url(${cfg.sampleUploadedImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        {/* Decorative Watermark & Borders */}
        <div className="absolute inset-3 border-2 border-[#C83A87]/30 rounded-xl pointer-events-none print:border-black/50" />
        <div className="absolute inset-5 border border-[#55C7D9]/30 rounded-lg pointer-events-none print:border-black/30" />
        <div className="absolute top-4 left-4 text-[#C83A87]/70 text-[9px] font-mono tracking-widest print:text-gray-600">
          ◆ ACHARIYA • CSE ◆
        </div>
        <div className="absolute top-4 right-4 text-[#C83A87]/70 text-[9px] font-mono tracking-widest print:text-gray-600">
          ◆ ACETCM'26 • TECH BRIDGE ◆
        </div>

        {/* Certificate Header */}
        <div className="text-center relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7F3FC] border border-[#E8E3EF] text-[#C83A87] text-[11px] sm:text-xs font-mono font-bold tracking-widest uppercase print:bg-gray-100 print:text-black print:border-black">
            <ShieldCheck className="w-3.5 h-3.5" />
            {cfg.institution || "ACHARIYA COLLEGE OF ENGINEERING TECHNOLOGY"}
          </div>

          <h2 className="text-xs sm:text-sm font-mono text-[#667085] uppercase tracking-widest font-semibold print:text-gray-700">
            {cfg.department || "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING"}
          </h2>

          <div className="text-[11px] font-mono font-bold text-[#55C7D9] tracking-wider uppercase">
            CONDUCTING ACETCM'26 • NATIONAL LEVEL SYMPOSIUM
          </div>

          <div className="pt-1">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-wider font-tech text-[#24324A] print:text-black">
              {cfg.symposiumName || "ACETCM'26"}
            </h1>
            <p className="text-xs sm:text-sm font-tech text-[#C83A87] tracking-widest mt-0.5 print:text-gray-800">
              {cfg.eventTitle || "TECH BRIDGE '26 • VISUAL TECHNICAL REBUS COMPETITION"}
            </p>
          </div>

          <div className="pt-2">
            <span className={`inline-block text-xs sm:text-sm font-extrabold uppercase px-4 py-1.5 rounded-full border border-[#E8E3EF] bg-[#F7F3FC] tracking-widest text-[#C83A87] print:border-black print:bg-gray-100 print:text-black`}>
              ★ {awardInfo.text} ★
            </span>
          </div>
        </div>

        {/* Certificate Recipient & Citation Body */}
        <div className="text-center relative z-10 my-6 space-y-4 max-w-2xl mx-auto">
          <p className="text-xs sm:text-sm text-[#667085] italic print:text-gray-700">
            This is to officially certify that the team
          </p>

          <div className="py-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#C83A87] font-tech tracking-wider print:text-black">
              "{certificate.teamName}"
            </div>
            <div className="text-xs font-mono text-[#667085] mt-1 print:text-gray-700">
              (Team ID: {certificate.teamId} • Final Score: {certificate.totalScore} pts • Rank #{certificate.rank})
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-sm sm:text-base font-bold text-[#24324A] print:text-black">
            <span>Comprising</span>
            <span className="px-3 py-1 bg-[#F7F3FC] border border-[#E8E3EF] rounded-lg text-[#24324A] print:bg-transparent print:border-black print:text-black">
              {certificate.participant1}
            </span>
            {certificate.participant2 && (
              <>
                <span>&</span>
                <span className="px-3 py-1 bg-[#F7F3FC] border border-[#E8E3EF] rounded-lg text-[#24324A] print:bg-transparent print:border-black print:text-black">
                  {certificate.participant2}
                </span>
              </>
            )}
          </div>

          <p className="text-xs sm:text-sm text-[#667085] leading-relaxed print:text-gray-800">
            representing <strong className="text-[#24324A] print:text-black font-semibold">{certificate.college}</strong> ({certificate.department}, {certificate.year}),
            has actively participated and demonstrated exemplary aptitude in technical rebus decoding, logic analysis, and rapid speed deduction at the ACETCM'26 Tech Bridge arena.
          </p>
        </div>

        {/* Certificate Footer: Seal & Signatories */}
        <div className="relative z-10 pt-6 border-t border-[#E8E3EF] print:border-black space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 items-end gap-4 text-center">
            {/* Signatory 1: Event Coordinator */}
            <div className="space-y-1">
              <div className="h-8 flex items-center justify-center text-xs italic font-serif text-[#C83A87] print:text-black">
                [Signature Verified]
              </div>
              <div className="border-t border-[#E8E3EF] pt-1 print:border-black">
                <div className="text-xs font-bold text-[#24324A] print:text-black">
                  {cfg.signatory1?.name || "Mrs. K. Janani"}
                </div>
                <div className="text-[10px] text-[#667085] font-mono print:text-gray-600">
                  {cfg.signatory1?.designation || "AP / CSE"} • {cfg.signatory1?.title || "Event Coordinator"}
                </div>
              </div>
            </div>

            {/* Official Seal / Security */}
            <div className="flex flex-col items-center justify-center space-y-1 py-1">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#C83A87]/60 flex flex-col items-center justify-center text-[#C83A87] bg-[#F7F3FC] print:border-black print:text-black">
                <ShieldCheck className="w-6 h-6" />
                <span className="text-[6.5px] font-mono font-bold tracking-tighter text-center leading-tight">
                  ACHARIYA<br/>ACETCM'26
                </span>
              </div>
              <div className="text-[9px] font-mono text-[#667085] tracking-wider print:text-gray-600">
                DATE: {cfg.date || "MARCH 2026"}
              </div>
            </div>

            {/* Signatory 2 & 3: Student Coordinators */}
            <div className="space-y-1">
              <div className="h-8 flex items-center justify-center text-xs italic font-serif text-[#C83A87] print:text-black">
                [Signature Verified]
              </div>
              <div className="border-t border-[#E8E3EF] pt-1 print:border-black">
                <div className="text-xs font-bold text-[#24324A] print:text-black">
                  Ms. Angel R &bull; Mr. Thirumurugan S
                </div>
                <div className="text-[9px] text-[#667085] font-mono print:text-gray-600">
                  Student Coordinators (9487883582 / 9042789495)
                </div>
              </div>
            </div>
          </div>

          {/* II Year Coordinators Note on Certificate */}
          <div className="pt-2 border-t border-[#E8E3EF] print:border-black/20 text-center">
            <div className="text-[9.5px] font-mono text-[#667085] print:text-gray-700">
              <span className="font-semibold text-[#24324A] print:text-black">II Year Coordinators:</span> A. Kamalambiga | R. Dharshini | P. Arthi | Gowsikram V | Swedha Sree. M
            </div>
          </div>

          <div className="flex items-center justify-between text-[8.5px] font-mono text-[#667085] pt-2 print:text-gray-600">
            <span>CERTIFICATE SERIAL: {certificate.certificateId}</span>
            <span>ACHARIYA COLLEGE OF ENGINEERING TECHNOLOGY • CSE SYMPOSIUM</span>
            <span>VERIFICATION CODE: {certificate.verificationHash}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isModal) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#172033]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      {content}
    </div>
  );
};
