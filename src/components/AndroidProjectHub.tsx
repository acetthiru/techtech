import React, { useState } from 'react';
import { 
  FileCode2, 
  ShieldCheck, 
  Terminal, 
  Smartphone, 
  Layers, 
  CheckCircle2, 
  Copy, 
  Check, 
  Download,
  Code
} from 'lucide-react';

export const AndroidProjectHub: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#DCE6F0] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#06B6D4] to-[#2563EB] flex items-center justify-center text-white font-bold shadow-md shadow-cyan-500/20">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-tech text-xl font-bold text-[#172033] tracking-wider">
                  NATIVE ANDROID PARTICIPANT APPLICATION
                </h1>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  KOTLIN + COMPOSE
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-1">
                Namespace: <span className="font-mono text-[#0891B2] font-semibold">org.cse.techbridge26</span> • Min SDK: 26 (Android 8.0+) • Target SDK: 34
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Architectural Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#DCE6F0] shadow-sm">
          <div className="flex items-center gap-2 text-[#0891B2] mb-2">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider">FLAG_SECURE</h3>
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Blocks Android system screenshot utilities, recent-app task thumbnails, screen-mirroring, and video recording hardware APIs.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#DCE6F0] shadow-sm">
          <div className="flex items-center gap-2 text-[#7C3AED] mb-2">
            <Layers className="w-5 h-5" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider">LOCKTASK & ANTI-MULTIWINDOW</h3>
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Disables split-screen mode (<code className="text-[#7C3AED] font-semibold">resizeableActivity="false"</code>) and triggers real-time cloud violation alerts if multi-window or picture-in-picture is opened.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#DCE6F0] shadow-sm">
          <div className="flex items-center gap-2 text-[#2563EB] mb-2">
            <Terminal className="w-5 h-5" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider">MICROSECOND BUZZER</h3>
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Native Round 3 Digital Buzzer with haptic tactile vibration feedback and atomic server timestamp locking.
          </p>
        </div>
      </div>

      {/* Codebase Structure Showcase */}
      <div className="bg-white border border-[#DCE6F0] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#DCE6F0] mb-4">
          <div className="flex items-center gap-2 text-[#172033]">
            <Code className="w-4 h-4 text-[#0891B2]" />
            <span className="font-tech text-sm font-bold tracking-wider">
              PROJECT REPOSITORY HIERARCHY
            </span>
          </div>
          <span className="text-xs font-mono text-[#64748B]">Android Studio Iguana / Jellyfish ready</span>
        </div>

        <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#DCE6F0] text-xs font-mono text-[#172033] space-y-1">
          <div>📁 android/</div>
          <div className="pl-4">├── 📄 build.gradle.kts (Root Build)</div>
          <div className="pl-4">└── 📁 app/</div>
          <div className="pl-8">├── 📄 build.gradle.kts (App Module: Compose BOM, OkHttp, Retrofit, Coil)</div>
          <div className="pl-8">└── 📁 src/main/</div>
          <div className="pl-12">├── 📄 AndroidManifest.xml (FLAG_SECURE, Orientation lock, LockTask)</div>
          <div className="pl-12">└── 📁 java/org/cse/techbridge26/</div>
          <div className="pl-16">├── 📄 MainActivity.kt (LifecycleObserver, Multi-window detection, Compose root)</div>
          <div className="pl-16">├── 📁 security/</div>
          <div className="pl-20">└── 📄 AntiCheatManager.kt (Real-time telemetry reporting)</div>
          <div className="pl-16">├── 📁 network/</div>
          <div className="pl-20">└── 📄 ApiClient.kt (Authoritative HTTP/WebSocket client)</div>
          <div className="pl-16">└── 📁 ui/</div>
          <div className="pl-20">├── 📁 theme/ (Technical Competition Theme)</div>
          <div className="pl-20">└── 📁 screens/</div>
          <div className="pl-24">├── 📄 HomeScreen.kt (Team registration & authentication)</div>
          <div className="pl-24">├── 📄 QuestionScreen.kt (Rebus viewer & single-submission)</div>
          <div className="pl-24">└── 📄 BuzzerScreen.kt (Round 3 digital buzzer)</div>
        </div>
      </div>

      {/* APK Compilation Instructions */}
      <div className="bg-white border border-[#DCE6F0] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#DCE6F0] mb-4">
          <div className="flex items-center gap-2 text-[#172033]">
            <Terminal className="w-4 h-4 text-[#0891B2]" />
            <span className="font-tech text-sm font-bold tracking-wider">
              APK BUILD & DEPLOYMENT INSTRUCTIONS
            </span>
          </div>
          <button
            onClick={() => handleCopy(`./gradlew assembleRelease`, 'buildCmd')}
            className="flex items-center gap-1 text-xs text-[#2563EB] hover:text-[#1D4ED8] font-mono font-semibold cursor-pointer"
          >
            {copiedSection === 'buildCmd' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Command</span>
          </button>
        </div>

        <div className="space-y-4 text-xs text-[#64748B] leading-relaxed">
          <p>
            To generate the production APK for symposium contestant devices, run the following in your terminal:
          </p>
          <pre className="p-3 bg-[#F8FAFC] border border-[#DCE6F0] rounded-xl font-mono text-[#0891B2] overflow-x-auto">
{`# 1. Navigate to android directory
cd android

# 2. Build Release APK with ProGuard minification & resource shrinking
./gradlew assembleRelease

# 3. Output APK location
# app/build/outputs/apk/release/app-release.apk

# 4. Install onto participant Android devices via ADB
adb install -r app/build/outputs/apk/release/app-release.apk`}
          </pre>
          <p className="text-[#64748B]">
            <strong className="text-[#172033]">Mobile Data Compatibility:</strong> The participant app uses public HTTPS cloud endpoints with automatic reconnection handling and exponential backoff retry queues. Participants can compete using campus Wi-Fi or their personal 4G/5G mobile data.
          </p>
        </div>
      </div>
    </div>
  );
};
