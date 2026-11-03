import { CHAT_API_CONFIG } from './chatConfig';

export type ModelStage = 'sft' | 'dpo';

export interface ChatRequest {
  context: string;
  pertanyaan: string;
  max_new_tokens?: number;
  model_stage?: ModelStage;
  terapkan_chunking?: boolean;
}

export interface ChatResponse {
  jawaban: string;
  konteks_dipakai: string;
  model_stage: string;
  processing_time_ms: number;
}

export interface HealthResponse {
  status: string;
  model_stages: string[];
  default_stage: string;
  cuda: boolean;
}

export type ChatApiErrorKind = 'auth' | 'validation' | 'server' | 'network' | 'timeout' | 'protocol';

export class ChatApiError extends Error {
  constructor(
    readonly kind: ChatApiErrorKind,
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ChatApiError';
  }
}

const REQUEST_TIMEOUT_MS = 60_000;
const HEALTH_TIMEOUT_MS = 15_000;
const MAX_CONTEXT_LENGTH = 12_000;
const MAX_QUESTION_LENGTH = 1_000;

function getBaseUrl(): string {
  const rawUrl = CHAT_API_CONFIG.baseUrl.trim();
  if (!rawUrl) throw new ChatApiError('network', 'URL API belum diatur.');

  try {
    const url = new URL(rawUrl);
    if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
      throw new Error('HTTPS required');
    }
    return `${url.origin}${url.pathname.replace(/\/+$/, '')}`;
  } catch {
    throw new ChatApiError('network', 'URL API tidak valid.');
  }
}

function getFriendlyError(status: number): ChatApiError {
  if (status === 401) return new ChatApiError('auth', 'Akses ditolak, periksa API key.', status);
  if (status === 422) return new ChatApiError('validation', 'Pertanyaan atau konteks tidak valid.', status);
  if (status === 500) return new ChatApiError('server', 'Model gagal menjawab, coba lagi.', status);
  return new ChatApiError('server', 'Permintaan ke API gagal.', status);
}

async function fetchJson<T>(
  path: '/health' | '/chat',
  init: RequestInit,
  timeoutMs: number,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${getBaseUrl()}${path}`, {
      ...init,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      throw new ChatApiError('timeout', 'Permintaan melewati batas waktu 60 detik.');
    }
    throw new ChatApiError(
      'network',
      'Server tidak dapat dihubungi. Pastikan API aktif dan origin website diizinkan CORS.',
    );
  }

  if (!response.ok) throw getFriendlyError(response.status);
  try {
    return (await response.json()) as T;
  } catch {
    throw new ChatApiError('protocol', 'Respons API tidak valid.');
  }
}

export async function cekHealth(): Promise<HealthResponse> {
  const response = await fetchJson<HealthResponse>(
    '/health',
    { method: 'GET', headers: { 'ngrok-skip-browser-warning': 'true' } },
    HEALTH_TIMEOUT_MS,
  );
  if (
    response.status !== 'ok' ||
    !Array.isArray(response.model_stages) ||
    typeof response.default_stage !== 'string' ||
    typeof response.cuda !== 'boolean'
  ) {
    throw new ChatApiError('protocol', 'Respons /health tidak sesuai kontrak API.');
  }
  return response;
}

export async function kirimChat(request: ChatRequest): Promise<ChatResponse> {
  const context = request.context.trim();
  const pertanyaan = request.pertanyaan.trim();
  if (!context || context.length > MAX_CONTEXT_LENGTH) {
    throw new ChatApiError('validation', 'Konteks wajib diisi dan maksimal 12.000 karakter.');
  }
  if (!pertanyaan || pertanyaan.length > MAX_QUESTION_LENGTH) {
    throw new ChatApiError('validation', 'Pertanyaan wajib diisi dan maksimal 1.000 karakter.');
  }

  const body: ChatRequest = {
    context,
    pertanyaan,
    max_new_tokens: request.max_new_tokens ?? 128,
    model_stage: request.model_stage ?? 'sft',
    terapkan_chunking: request.terapkan_chunking ?? true,
  };

  const response = await fetchJson<ChatResponse>(
    '/chat',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': CHAT_API_CONFIG.apiKey.trim(),
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(body),
    },
    REQUEST_TIMEOUT_MS,
  );

  if (
    typeof response.jawaban !== 'string' ||
    typeof response.konteks_dipakai !== 'string' ||
    typeof response.model_stage !== 'string' ||
    !Number.isInteger(response.processing_time_ms)
  ) {
    throw new ChatApiError('protocol', 'Respons /chat tidak sesuai kontrak API.');
  }
  return response;
}
