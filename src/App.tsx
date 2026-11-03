import React, { useState, useEffect } from 'react';
import { GuruPage } from './pages/GuruPage';
import { GraduationCap, MessageCircle } from 'lucide-react';
import { ChatbotPage } from './pages/ChatbotPage';

export const App: React.FC = () => {
  const [route, setRoute] = useState<string>(() => {
    const h = window.location.hash;
    if (h === '#/guru' || h === '#guru') return '#/guru';
    if (h === '#/chatbot' || h === '#chatbot') return '#/chatbot';
    return '#/guru';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const h = window.location.hash;
      if (h === '#/guru' || h === '#guru') {
        setRoute('#/guru');
      } else if (h === '#/chatbot' || h === '#chatbot') {
        setRoute('#/chatbot');
      } else {
        setRoute('#/guru');
        if (h !== '#/guru') window.history.replaceState(null, '', '#/guru');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (r: string) => {
    window.location.hash = r;
    setRoute(r);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-bg text-tx selection:bg-tint selection:text-pri">
      {/* Navbar Utama */}
      <header className="bg-pri text-white px-4 sm:px-8 py-3.5 shadow-md sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-bold text-base sm:text-lg tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-tint animate-pulse" />
              Question Bank Guru PJOK
            </span>
            <span className="text-xs bg-white/15 px-2.5 py-0.5 rounded-full font-medium">
              Anotasi &amp; Evaluasi Guru
            </span>
          </div>

          {/* Navigasi Hash Tabs */}
          <nav className="flex items-center gap-1.5 bg-black/20 p-1 rounded-btn self-start sm:self-auto" aria-label="Navigasi Halaman">
            <button
              type="button"
              onClick={() => navigateTo('#/guru')}
              className={`px-3.5 py-1.5 rounded-btn text-xs font-bold transition-all flex items-center gap-1.5 ${
                route === '#/guru'
                  ? 'bg-white text-pri shadow-sm scale-[1.02]'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Ruang Guru (/guru)
            </button>

            <button
              type="button"
              onClick={() => navigateTo('#/chatbot')}
              className={`px-3.5 py-1.5 rounded-btn text-xs font-bold transition-all flex items-center gap-1.5 ${
                route === '#/chatbot'
                  ? 'bg-white text-pri shadow-sm scale-[1.02]'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Chatbot PJOK
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1">
        {route === '#/guru' ? (
          <GuruPage />
        ) : route === '#/chatbot' ? (
          <ChatbotPage />
        ) : (
          <GuruPage />
        )}
      </main>

      {/* Footer Wajib di Kedua Halaman */}
      <footer className="mt-8 border-t border-bd bg-white/80 py-4 px-4 text-center text-xs text-mute">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Jawaban dihasilkan model AI dan dapat keliru.
          </span>
          <span className="text-[11px] text-mute/80">
            Skripsi FTI Universitas Tarumanagara • Qwen2.5-1.5B (SFT vs SFT+DPO)
          </span>
        </div>
      </footer>
    </div>
  );
};

export default App;
