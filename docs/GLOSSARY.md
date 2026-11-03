# Glossary

## Tujuan

Menyamakan istilah domain, UI, dan API.

| Istilah | Definisi |
|---|---|
| A/B blind | Label penempatan jawaban yang menyembunyikan identitas model selama evaluasi. |
| Anotasi | Pemberian label Yes/No pada setiap baris jawaban template Feedback. |
| Context | Materi PJOK yang menyertai template, paket, atau request chatbot. |
| DPO | Direct Preference Optimization; tahap model penelitian yang dievaluasi terhadap SFT. |
| Feedback | Sheet notebook berisi kolom `id, kelas, pertanyaan, context, jawaban, status`. |
| FastAPI | Framework Python yang menyediakan API chatbot dalam notebook. |
| Final test | Paket evaluasi dengan `set=final_test`, disiapkan di notebook. |
| Guru | Pengguna Ruang Guru yang melakukan anotasi atau evaluasi. |
| Kaggle Secrets | Penyimpanan credential notebook seperti `NGROK_AUTHTOKEN` dan `CHAT_API_KEY`. |
| localStorage | Penyimpanan browser per origin; bukan database bersama. |
| ngrok | Tunnel sementara ke FastAPI pada notebook. |
| Paket evaluasi | JSON versi 2 dengan tugas, konteks, kandidat jawaban, dan set validasi/final test. |
| SFT | Supervised fine-tuning; model pembanding pada evaluasi. |
| `model_stage` | Field API chat untuk stage `sft` atau `dpo`. |
| `konteks_dipakai` | Konteks yang dipilih backend untuk menjawab. |

## Dokumen Terkait

- [PRD](./PRD.md)
- [Data dictionary](./DATA_DICTIONARY.md)
- [API](./API.md)
- [Architecture](./ARCHITECTURE.md)

**Diperbarui:** 2026-10-27 · **Versi dokumen:** 1.1.0
