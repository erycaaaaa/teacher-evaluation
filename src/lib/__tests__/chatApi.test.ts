import { afterEach, describe, expect, it, vi } from 'vitest';
import { cekHealth, ChatApiError, kirimChat } from '../chatApi';

vi.mock('../chatConfig', () => ({
  CHAT_API_CONFIG: {
    baseUrl: 'https://api.test',
    apiKey: 'test-key',
  },
}));

describe('chatApi', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('checks health and returns the exact API response', async () => {
    const health = {
      status: 'ok',
      model_stages: ['sft', 'dpo'],
      default_stage: 'sft',
      cuda: true,
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => health,
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(cekHealth()).resolves.toEqual(health);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.test/health',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('posts the contract request with required headers and returns the API response', async () => {
    const result = {
      jawaban: 'Jawaban dari API.',
      konteks_dipakai: 'Konteks terpilih.',
      model_stage: 'sft',
      processing_time_ms: 1234,
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => result,
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(kirimChat({
      context: 'Materi PJOK',
      pertanyaan: 'Apa itu pemanasan?',
      model_stage: 'sft',
      terapkan_chunking: true,
    })).resolves.toEqual(result);

    const [, request] = fetchMock.mock.calls[0];
    expect(request.headers).toEqual({
      'Content-Type': 'application/json',
      'X-API-Key': 'test-key',
      'ngrok-skip-browser-warning': 'true',
    });
    expect(JSON.parse(request.body)).toEqual({
      context: 'Materi PJOK',
      pertanyaan: 'Apa itu pemanasan?',
      max_new_tokens: 128,
      model_stage: 'sft',
      terapkan_chunking: true,
    });
    expect(request.signal).toBeInstanceOf(AbortSignal);
  });

  it('rejects invalid input without calling the API', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(kirimChat({ context: '', pertanyaan: 'Soal' }))
      .rejects.toMatchObject({ kind: 'validation' });
    await expect(kirimChat({ context: 'Materi', pertanyaan: 'x'.repeat(1001) }))
      .rejects.toMatchObject({ kind: 'validation' });
    await expect(kirimChat({ context: 'x'.repeat(12001), pertanyaan: 'Soal' }))
      .rejects.toMatchObject({ kind: 'validation' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    [401, 'auth'],
    [422, 'validation'],
    [500, 'server'],
  ] as const)('maps HTTP %s to a friendly API error', async (status, kind) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status }));
    await expect(kirimChat({ context: 'Materi', pertanyaan: 'Soal' }))
      .rejects.toMatchObject({ kind, status });
  });

  it('does not fabricate an answer when the network fails or the response is malformed', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(kirimChat({ context: 'Materi', pertanyaan: 'Soal' }))
      .rejects.toBeInstanceOf(ChatApiError);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ jawaban: 'not a complete ChatResponse' }),
    }));
    await expect(kirimChat({ context: 'Materi', pertanyaan: 'Soal' }))
      .rejects.toMatchObject({ kind: 'protocol' });
  });
});
