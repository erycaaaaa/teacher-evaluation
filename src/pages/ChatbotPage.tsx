import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { AlertCircle, Bot, Loader2, RefreshCw, Send, User } from 'lucide-react';
import {
  cekHealth,
  ChatApiError,
  kirimChat,
} from '../lib/chatApi';
import type { ChatResponse, ModelStage } from '../lib/chatApi';

interface Message {
  id: number;
  role: 'user' | 'bot';
  text: string;
  response?: ChatResponse;
  showContext?: boolean;
}

function getFriendlyError(error: unknown): string {
  if (error instanceof ChatApiError) {
    if (error.kind === 'auth') return 'Akses ditolak, periksa API key.';
    if (error.kind === 'validation') return 'Pertanyaan atau konteks tidak valid.';
    if (error.kind === 'server') return error.status === 500
      ? 'Model gagal menjawab, coba lagi.'
      : 'Server gagal memproses permintaan.';
    if (error.kind === 'timeout') return 'Server tidak merespons dalam 60 detik. Silakan coba lagi.';
  }
  return 'Server tidak dapat dihubungi. Pastikan API sedang aktif.';
}

export const ChatbotPage: React.FC = () => {
  const [context, setContext] = useState('');
  const [pertanyaan, setPertanyaan] = useState('');
  const [modelStage, setModelStage] = useState<ModelStage>('sft');
  const [availableStages, setAvailableStages] = useState<ModelStage[]>(['sft', 'dpo']);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [formError, setFormError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(0);
  const sendingRef = useRef(false);

  const checkApi = async () => {
    setIsCheckingHealth(true);
    try {
      const health = await cekHealth();
      const stages = health.model_stages.filter(
        (stage): stage is ModelStage => stage === 'sft' || stage === 'dpo',
      );
      setApiOnline(true);
      setAvailableStages(stages);
      const defaultStage = health.default_stage === 'dpo' ? 'dpo' : 'sft';
      setModelStage(stages.includes(defaultStage) ? defaultStage : stages[0] ?? 'sft');
    } catch {
      setApiOnline(false);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    void checkApi();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sendingRef.current || apiOnline !== true) return;
    const contextValue = context.trim();
    const questionValue = pertanyaan.trim();

    if (!contextValue) {
      setFormError('Konteks materi wajib diisi (maksimal 12.000 karakter).');
      return;
    }
    if (!questionValue) {
      setFormError('Pertanyaan wajib diisi (maksimal 1.000 karakter).');
      return;
    }

    if (contextValue.length > 12_000) {
      setFormError('Konteks materi maksimal 12.000 karakter.');
      return;
    }
    if (questionValue.length > 1_000) {
      setFormError('Pertanyaan maksimal 1.000 karakter.');
      return;
    }
    if (!availableStages.includes(modelStage)) {
      setFormError('Model yang dipilih tidak tersedia pada API.');
      return;
    }

    setFormError('');
    setRequestError('');
    sendingRef.current = true;
    messageIdRef.current += 1;
    setMessages(current => [
      ...current,
      { id: messageIdRef.current, role: 'user', text: questionValue },
    ]);
    setPertanyaan('');
    setIsSending(true);

    try {
      const response = await kirimChat({
        context: contextValue,
        pertanyaan: questionValue,
        model_stage: modelStage,
        terapkan_chunking: true,
      });
      messageIdRef.current += 1;
      setMessages(current => [
        ...current,
        {
          id: messageIdRef.current,
          role: 'bot',
          text: response.jawaban,
          response,
          showContext: false,
        },
      ]);
    } catch (error) {
      const friendlyError = getFriendlyError(error);
      setRequestError(friendlyError);
      if (error instanceof ChatApiError && error.kind === 'network') setApiOnline(false);
    } finally {
      sendingRef.current = false;
      setIsSending(false);
    }
  };

  const toggleContext = (id: number) => {
    setMessages(current => current.map(message =>
      message.id === id ? { ...message, showContext: !message.showContext } : message
    ));
  };

  return (
    <div className="max-w-[900px] mx-auto px-4 py-8">
      <section className="rounded-card border border-bd bg-white shadow-sm overflow-hidden">
        <header className="bg-pri text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-tint" />
            <div>
              <h1 className="font-bold text-lg">Chatbot PJOK</h1>
              <p className="text-xs text-white/75">Tanyakan materi PJOK kepada model AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-300' : 'bg-red-300'}`} />
            <span>{apiOnline === null ? 'Memeriksa API...' : apiOnline ? 'API online' : 'API offline'}</span>
            <button
              type="button"
              onClick={() => void checkApi()}
              disabled={isCheckingHealth}
              aria-label="Periksa koneksi API"
              className="p-1.5 rounded-btn hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        <div className="p-5 space-y-4">
          {apiOnline === false && (
            <div role="status" className="p-3 rounded-btn bg-amber-50 border border-amber-300 text-amber-900 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>API sedang offline. Server tidak dapat dihubungi. Pastikan API sedang aktif.</span>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div>
              <label htmlFor="chat-context" className="block text-xs font-semibold text-tx mb-1">
                Konteks / materi PJOK
              </label>
              <textarea
                id="chat-context"
                value={context}
                onChange={event => {
                  setContext(event.target.value);
                  setFormError('');
                }}
                maxLength={12_000}
                rows={4}
                className="w-full px-3 py-2 text-sm rounded-btn border border-bdi focus:ring-blue-600"
              />
              <div className="text-right text-[11px] text-mute">
                {context.length.toLocaleString('id-ID')} / 12.000
              </div>
            </div>
            <div>
              <label htmlFor="chat-model" className="block text-xs font-semibold text-tx mb-1">
                Model
              </label>
              <select
                id="chat-model"
                value={modelStage}
                onChange={event => setModelStage(event.target.value === 'dpo' ? 'dpo' : 'sft')}
                className="w-full px-3 py-2 text-sm rounded-btn border border-bdi bg-white"
              >
                <option value="sft" disabled={!availableStages.includes('sft')}>SFT</option>
                <option value="dpo" disabled={!availableStages.includes('dpo')}>DPO</option>
              </select>
            </div>
          </div>

          <div
            className="min-h-[240px] max-h-[50vh] overflow-y-auto rounded-card border border-bd bg-bg/60 p-4 space-y-3"
            aria-live="polite"
            aria-label="Percakapan"
          >
            {messages.length === 0 && <p className="text-sm text-mute text-center py-12">Belum ada percakapan.</p>}
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${message.role === 'user' ? 'justify-end' : ''}`}
              >
                {message.role === 'bot' && <Bot className="w-5 h-5 text-pri shrink-0 mt-1" />}
                <div className={`max-w-[85%] rounded-card px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  message.role === 'user'
                    ? 'bg-pri text-white'
                    : 'bg-white border border-bd text-tx'
                }`}>
                  {message.text}
                  {message.response && (
                    <div className="mt-2 pt-2 border-t border-bd/60 text-[11px] text-mute">
                      {message.response.model_stage.toUpperCase()} · {message.response.processing_time_ms} ms
                    </div>
                  )}
                  {message.response && (
                    <button
                      type="button"
                      onClick={() => toggleContext(message.id)}
                      className="mt-2 text-xs font-semibold text-pri hover:underline"
                    >
                      {message.showContext ? 'Sembunyikan konteks yang dipakai' : 'Lihat konteks yang dipakai'}
                    </button>
                  )}
                  {message.response && message.showContext && (
                    <div className="mt-2 p-2 rounded-btn bg-bg/60 border border-bd/60 text-xs whitespace-pre-wrap">
                      {message.response.konteks_dipakai}
                    </div>
                  )}
                </div>
                {message.role === 'user' && <User className="w-5 h-5 text-mute shrink-0 mt-1" />}
              </div>
            ))}
            {isSending && (
              <div className="flex items-center gap-2 text-sm text-mute">
                <Bot className="w-5 h-5 text-pri" />
                <span>sedang menjawab...</span>
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {formError && <p role="alert" className="text-sm text-danger">{formError}</p>}
          {requestError && <p role="alert" className="text-sm text-danger">{requestError}</p>}

          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="flex-1">
              <label htmlFor="chat-question" className="sr-only">Pertanyaan</label>
              <textarea
                id="chat-question"
                value={pertanyaan}
                onChange={event => {
                  setPertanyaan(event.target.value);
                  setFormError('');
                }}
                maxLength={1_000}
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-btn border border-bdi focus:ring-blue-600"
              />
              <div className="text-right text-[11px] text-mute">
                {pertanyaan.length.toLocaleString('id-ID')} / 1.000
              </div>
            </div>
            <button
              type="submit"
              disabled={apiOnline !== true || isCheckingHealth || isSending || !pertanyaan.trim() || !context.trim()}
              className="min-h-[44px] px-4 rounded-btn bg-pri text-white hover:bg-pri-hover font-bold text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Kirim
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
