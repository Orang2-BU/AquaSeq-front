# 09 — Kontrak API: Web ↔ Backend

> Kebutuhan web AquaSeq terhadap backend Go (`https://github.com/Orang2-BU/AquaSeq-back`). Dibaca bersama teman backend.
> Istilah baku: "data eDNA air tambak" (bukan data hasil qPCR), "data eDNA dari sampel air" (bukan dataset hasil qPCR dari lab), "kadar jejak patogen" (bukan angka Ct/copies), "kontrol kualitas" (bukan kontrol PPC di tampilan), "panel jejak penyakit" (bukan panel qPCR).
> Status: ✅ ACC sisi web 24 Okt 2026, menunggu persetujuan tim backend · Dasar: commit backend `767f56c` (6 endpoint, tanpa auth).
> ✅ = sudah ada di backend · ⬜ = perlu dibuat · 🔧 = ada, perlu diubah. Web membangun semua ⬜ dengan mock (`API_MODE=mock`) sampai backend siap.

## 1. Aturan umum
- **Base URL:** `{API_BASE_URL}/api/v1`. Hanya server Next.js yang memanggil backend; browser tidak pernah memanggil backend langsung (CORS tidak perlu dibuka untuk browser).
- **Amplop respons** (mengikuti backend yang sudah ada):
  - Sukses: `{ "success": true, "data": {...}, "error": null }`
  - Gagal: `{ "success": false, "data": null, "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": { "email": "Format email salah" } } }`
- **Kode galat yang dipakai web:** `BAD_REQUEST`, `VALIDATION_ERROR` (dengan `fields`), `UNAUTHORIZED` (401, token tidak ada/kedaluwarsa), `FORBIDDEN` (403, peran/lokasi tidak berhak), `NOT_FOUND`, `CONFLICT` (mis. kode kolam sudah dipakai), `RATE_LIMITED`, `EXPIRED` (undangan kedaluwarsa), `INTERNAL`.
- **Pesan galat** Bahasa Indonesia, menyebut masalah dan cara memperbaiki (ditampilkan langsung ke pengguna).
- **Format:** JSON snake_case; waktu ISO 8601 dengan zona (`2026-10-24T06:31:00+07:00`); tanggal `YYYY-MM-DD`; ID UUID.
- **Daftar** memakai `?page=1&per_page=20` dan mengembalikan `data: { items: [...], total: 57 }`.
- **Unggah file** memakai `multipart/form-data`, maks 4 foto × 1 MB per laporan, CSV maks 2 MB.

## 2. Auth (⬜ semua)
Mekanisme usulan: **JWT access token (15 menit) + refresh token (30 hari, rotasi tiap dipakai)**. Server Next.js menyimpan keduanya di cookie `httpOnly; Secure; SameSite=Lax` dan mengirim `Authorization: Bearer <access>` ke backend.

| Method | Endpoint | Body | Data respons | Catatan |
|---|---|---|---|---|
| POST | `/auth/register` | `full_name, email, password, phone_wa?` | `user, access_token, refresh_token, expires_in` | Membuat akun **pemilik**; email sudah dipakai → `CONFLICT` dengan `fields.email` |
| POST | `/auth/login` | `email, password` | `user, access_token, refresh_token, expires_in` | Rate limit per IP + email; gagal → `UNAUTHORIZED` dengan pesan generik (tidak membedakan email salah dan sandi salah) |
| POST | `/auth/refresh` | `refresh_token` | `access_token, refresh_token, expires_in` | Refresh lama langsung tidak berlaku |
| POST | `/auth/logout` | `refresh_token` | `{}` | Mencabut refresh token |
| GET | `/auth/me` | — | `user` + `memberships: [{ farm_id, farm_name, role }]` | `role`: `pemilik` / `teknisi` |
| POST | `/auth/password/forgot` | `email` | `{}` | Selalu 200 (tidak membocorkan email terdaftar); kirim email berisi tautan `{WEB_URL}/atur-sandi?token=...` |
| POST | `/auth/password/reset` | `token, password` | `{}` | Token sekali pakai, 1 jam |
| POST | `/auth/demo` | `role: pemilik/teknisi` | `user, access_token, refresh_token, expires_in` | Masuk ke akun demo SIMULASI (bisa dimatikan lewat env backend) |
| PATCH | `/auth/me` | `full_name, phone_wa` (`null` = hapus) | `user` | **Usulan baru (P33)**. `phone_wa` format `62…` |
| POST | `/auth/password` | `current_password, new_password` | `{}` | **Usulan baru (P33)**. Sandi lama salah → `VALIDATION_ERROR` dengan `fields.current_password` |

`user`: `{ id, full_name, email, phone_wa }`. `expires_in` = umur access token dalam detik; web memakainya sebagai `maxAge` cookie access, jadi saat cookie hilang web tahu harus memanggil `/auth/refresh`. Pemilik baru tanpa lokasi mengembalikan `memberships: []` di `/auth/me`.

## 3. Lokasi, kolam, anggota
| Method | Endpoint | Status | Body / query | Data respons | Siapa |
|---|---|---|---|---|---|
| GET | `/farms` | ⬜ | — | `items: Farm[]` (lokasi tempat user jadi anggota, **termasuk yang diarsipkan**; web memisahkannya lewat `archived_at`) | semua |
| POST | `/farms` | 🔧 | `name, regency, address?` | `Farm` | pemilik (pemilik = user pembuat; `owner_name/phone` diambil dari user) |
| PATCH | `/farms/{id}` | ⬜ | sebagian field | `Farm` | pemilik lokasi |
| POST | `/farms/{id}/archive` | ⬜ | — | `Farm` | pemilik lokasi |
| GET | `/farms/{id}/ponds` | ⬜ | `?status=ACTIVE&assignee_id=` | `items: Pond[]` **termasuk `latest_result`** | pemilik: semua; teknisi: hanya kolam yang ditugaskan |
| POST | `/farms/{id}/ponds` | 🔧 | `pond_code, name?, system, area_sqm?, stocked_at?, assignee_id?` | `Pond` | pemilik; `pond_code` huruf besar, `^[A-Z0-9-]{1,12}$`, unik per lokasi → bentrok `CONFLICT` dengan `fields.pond_code`. Onboarding memanggil endpoint ini per kode (maks 50) |
| GET | `/ponds/{id}` | ⬜ | — | `Pond` + `latest_result` + `latest_water_log` | pemilik / teknisi pemegang |
| PATCH | `/ponds/{id}` | ⬜ | sebagian field: `pond_code`, `system`, `area_sqm` (boleh `null`), `assignee_id`, `wa_target`; kode bentrok → `CONFLICT` dengan `fields.pond_code` | `Pond` | pemilik |
| POST | `/ponds/{id}/archive` | ⬜ | — | `Pond` | pemilik; kolam hilang dari daftar dan dilepas dari teknisinya, riwayat tetap |
| GET | `/farms/{id}/members` | ⬜ | — | `items: Member[]`, `invitations: PendingInvitation[]` (belum dipakai/dibatalkan, termasuk yang kedaluwarsa) | pemilik |
| PATCH | `/farms/{id}/members/{user_id}` | ⬜ | `active` | `Member` | pemilik; menonaktifkan juga melepas kolam teknisi itu |
| PUT | `/farms/{id}/members/{user_id}/ponds` | ⬜ | `pond_ids[]` | `Member` | pemilik; atomik: kolam terpilih pindah ke teknisi ini, kolam lamanya yang tidak dipilih dilepas; teknisi nonaktif → `VALIDATION_ERROR` |
| POST | `/farms/{id}/invitations` | ⬜ | `email, pond_ids[]` | `Invitation` | pemilik; backend mengirim email berisi `{WEB_URL}/undangan/{token}` |
| DELETE | `/invitations/{id}` | ⬜ | — | `{}` | pemilik; token undangan langsung tidak berlaku |
| GET | `/invitations/by-token/{token}` | ⬜ | — | `farm_name, owner_name, email, pond_codes[], expired` | publik; sudah dipakai/dibatalkan/tidak ada → `NOT_FOUND` |
| POST | `/invitations/by-token/{token}/accept` | ⬜ | `full_name, password` | `user, access_token, refresh_token, expires_in` | publik; token sekali pakai, kedaluwarsa 7 hari → `EXPIRED`; email sudah punya akun → `CONFLICT`. Kolam undangan langsung dipegang teknisi baru |

- `Farm`: `{ id, name, regency, address, owner_id, provenance: "simulasi"|"nyata", archived_at, created_at, pond_count, technician_count, at_risk_count }`. Tiga angka terakhir untuk kartu lokasi (P27): jumlah kolam, teknisi aktif, dan kolam dengan sampel terakhir kelas 3-4.
- `/auth/me` hanya memuat lokasi yang **belum** diarsipkan di `memberships`.
- `Pond`: `{ id, farm_id, pond_code, name, system: "intensif"|"bioflok", area_sqm, current_cycle, stocked_at, assignee: { id, full_name } | null, wa_target, status, latest_result: SdriResult | null, latest_sampling_date, trend }`. `trend` = `RAPID_INCREASE`|`MODERATE_INCREASE`|`STABLE`|`DECREASING`|`INSUFFICIENT_DATA` (sama dengan `internal/trajectory`); ikut di daftar supaya P14 tidak memanggil trajectory per kolam.
- `Member`: `{ user_id, full_name, email, role, active, pond_codes[], open_tasks }` (`pond_codes` hanya kolam aktif)
- `PendingInvitation`: `{ id, email, pond_codes[], expires_at }`. Token undangan hanya disimpan sebagai hash di backend dan tidak pernah dikirim ke web; satu-satunya jalan ke teknisi adalah email.

## 4. Sampel, skor, tren
| Method | Endpoint | Status | Body / query | Data respons | Siapa |
|---|---|---|---|---|---|
| POST | `/sdri/calculate` | ✅ | `ct_ppc, s_qpcr, s_bio, s_chem` | `SdriResult` | (dipakai internal backend) |
| POST | `/sdri/preview` | ⬜ | `features` (sama dengan `/samples`) | `SdriResult` + `nh3_mg_l` + `copies_per_ml` per patogen | publik, rate limit; dipakai kalkulator landing. Tidak menyimpan apa pun |
| POST | `/samples` | 🔧 | lihat bawah | `sample_id, sdri_result` | pemilik |
| POST | `/samples/batch` | ⬜ | `run: { lab_name, instrument, tested_at, file_name }`, `samples: [ ...sama dengan /samples ]` | `batch_id, results: [{ sample_code, sample_id, sdri_result }]` | pemilik; satu CSV = satu batch, atomik |
| GET | `/batches?farm_id=` | ⬜ | — | `items: [{ batch_id, lab_name, tested_at, sample_count, rejected_count }]` | pemilik |
| GET | `/batches/{id}` | ⬜ | — | `BatchSummary` + `samples: [{ sample_id, sample_code, pond: { id, pond_code }, sdri_result }]` + `meta: { wells: [Well + sample_code], standards }` (termasuk well NTC) | pemilik |
| GET | `/ponds/{id}/samples` | ⬜ | `?page=` | `items: [{ sample_id, sampling_date, cycle_day, sdri_result }]` | pemilik / teknisi pemegang (tanpa `meta`) |
| GET | `/samples/{id}` | ⬜ | — | `Sample` lengkap: `features`, `meta`, `sdri_result` (dengan `s_qpcr`, `s_bio`, `s_chem`, `z_score`), `copies_per_ml`, `nh3_mg_l` | pemilik |
| GET | `/ponds/{id}/trajectory` | ✅ | — | `data_points, slope, trend, trajectory_alert, alert_message, history[]` | pemilik / teknisi pemegang |
| POST | `/cycles/outcome` | ✅ | `pond_id, cycle_number, outcome, actual_harvest_kg?, outbreak_date?, primary_suspect_pathogen?` | `status, message` | pemilik (perlu auth) |
| GET | `/ponds/{id}/cycles` | ⬜ | — | `items: [{ cycle_number, outcome, actual_harvest_kg, outbreak_date, primary_suspect_pathogen, notes }]` | pemilik |

Body `/samples` (🔧 perubahan yang diminta):
```json
{
  "pond_id": "uuid",
  "sample_code": "B3-1023",
  "sampling_date": "2026-10-23",
  "cycle_day": 41,
  "source_type": "GSI_LAB",
  "features": {
    "ct_ahpnd": 33.1, "ct_wssv": null, "ct_ehp": 35.2, "ct_amoa": 26.0, "ct_16s": 18.0, "ct_ppc": 19.9,
    "do_mg_l": 4.6, "tom_mg_l": 62.0, "ph": 7.8, "salinity_ppt": 18.0, "temp_c": 29.4, "tan_mg_l": 0.62,
    "no2_mg_l": 0.3, "h2s_mg_l": 0.004, "alkalinity": 128
  },
  "meta": {
    "wells": [{ "position": "C7", "target": "pirA", "ct": 33.05, "tm": 81.2, "excluded_reason": null }],
    "standards": [{ "copies_rxn": 100000, "ct": 19.8 }],
    "water_log_id": "uuid | null"
  }
}
```
Perubahan: tambah `sample_code`, `meta` (data well mentah dari CSV untuk rincian skor), kolom `no2_mg_l`, `h2s_mg_l`, `alkalinity` di tabel `sample_features` (sudah ada di `domain.SampleFeatures` dan dipakai rumus `S_Chem`, tapi belum ada di `sql/schema.sql`). Ct `null` = tidak teramplifikasi.

- `BatchSummary` (`GET /batches`): `{ batch_id, lab_name, instrument, tested_at, file_name, sample_count, rejected_count, created_at }`.
- `Well`: `{ position, target, ct | null, tm | null, excluded_reason | null }`. Web meringkas Ct (rata-rata replikat yang tidak dikeluarkan) dan memeriksa kontrol sebelum kirim; gerbang PPC dan skor tetap di backend.
- `WaterLog`: `{ id, pond: { id, pond_code }, measured_at, temp_c, ph, do_mg_l, tan_mg_l, no2_mg_l, h2s_mg_l, tom_mg_l, alkalinity, salinity_ppt, transparency_cm, nh3_mg_l, recorded_by: { id, full_name } }`.
- `GET /ponds/{id}/cycles` mengembalikan siklus terbaru dulu; `POST /cycles/outcome` (✅) dipakai apa adanya.
- `SdriResult` (sudah ada): `{ status: "VALID"|"REJECTED_INHIBITOR"|"REJECTED_INVALID_QC", z_score, probability_pct, risk_class: 1-4 (0 bila ditolak), risk_level, s_qpcr, s_bio, s_chem, model_version, recommendation, predicted_disease?: string, disease_name?: string, evidence?: [{ feature: string, value: number, threshold: number, status: string }], mitigation_actions?: [{ action: string, source: string, priority: "tinggi"|"sedang"|"rendah" }], ai_explanation?: string, confidence?: number, trajectory_anomaly?: boolean, forecast_7d?: number }`

## 4b. Ingesti Dokumen Lab Multi-Format (AI Lapis C)
| Method | Endpoint | Status | Body | Data respons | Siapa |
|---|---|---|---|---|---|
| POST | `/documents/ingest` | ⬜ | multipart file (`.csv`, `.pdf`, `.xlsx`, `.docx`) | `{ file_name, file_type, run: { lab_name, instrument, tested_at }, samples: RawSampleRecord[], warnings: [{ code, message, location? }] }` | pemilik |
Web menerima hasil ekstraksi terstruktur (fitur mentah nullable, well, status QC, tanpa kewajiban mencocokkan kolam di hulu) sebelum tahap pemetaan kolam dan pengiriman batch.

## 4c. Insight Pola & Prakiraan Kolam (AI Lapis B)
| Method | Endpoint | Status | Body / query | Data respons | Siapa |
|---|---|---|---|---|---|
| GET | `/ponds/{id}/insights` | ⬜ | — | `Insights` | pemilik / teknisi pemegang |

- `Insights`: `{ pond_id, status: "OK"|"INSUFFICIENT_DATA"|"QC_REJECTED", anomaly: { score, flagged, contributors: [{ feature, value, baseline, deviation }], earlier_than_class_steps?, synthetic }, forecast_7d: { horizon_days, predicted_probability_pct: number|null, method: "THEIL_SEN_LOGIT", data_points, status, synthetic, disclaimer }, forecast_14d?, similar_cases: [{ case: { id, pond_id, sdri_class, action, outcome, synthetic }, distance, similarity? }], explanation: { disease_potential, evidence_reason, actions: [{ action, source }], seven_day_outlook, full_narrative } | null }`.

## 4d. Versi Model & Kalibrasi (AI Lapis B)
| Method | Endpoint | Status | Body / query | Data respons | Siapa |
|---|---|---|---|---|---|
| GET | `/models` | ⬜ | — | `items: ModelVersion[]` | semua anggota |
| POST | `/models/{version}/promote` | ⬜ | `note: string` | `ModelVersion` | pemilik saja |

- `ModelVersion`: `{ version: string, status: "kandidat"|"aktif"|"arsip", metrics: Record<string, number|string>, n_labels: number, synthetic: boolean, trained_at?: string, promoted_at?: string|null, promoted_by?: string|null, note?: string|null }`. V1 beku (bobot empiris GSI), V2 kandidat hasil kalibrasi siklus. Promosi model mewajibkan catatan konsekuensi dan tercatat nama pemilik + waktu.

## 5. Kimia air (⬜)
| Method | Endpoint | Body / query | Data respons | Siapa |
|---|---|---|---|---|
| POST | `/ponds/{id}/water-logs` | `measured_at, temp_c, ph, do_mg_l, tan_mg_l, no2_mg_l?, h2s_mg_l?, tom_mg_l?, alkalinity?, salinity_ppt?, transparency_cm?` | `WaterLog` + `nh3_mg_l` (Emerson, dihitung backend) | teknisi pemegang / pemilik |
| GET | `/ponds/{id}/water-logs` | `?from=&to=&page=` | `items: WaterLog[]` | pemilik / teknisi pemegang |
| GET | `/farms/{id}/water-logs` | `?pond_id=&from=&to=&page=` | `items: WaterLog[]` | pemilik |
| PATCH | `/water-logs/{id}` | sebagian field | `WaterLog` | pencatat, maks 1 jam setelah dibuat |

Validasi rentang di backend (web juga memvalidasi untuk umpan balik cepat): suhu 15-40 °C, pH 5-10, DO 0-20, TAN 0-20, NO₂ 0-20, H₂S 0-2, TOM 0-500, alkalinitas 0-400, salinitas 0-60, kecerahan 0-200.

## 6. Peringatan (⬜)
| Method | Endpoint | Data respons | Siapa |
|---|---|---|---|
| GET | `/farms/{id}/alerts` | `items: [{ id, pond_id, pond_code, kind: "RISK_CLASS"|"REJECTED"|"TRAJECTORY", risk_class, probability_pct, message, sample_id, since, acked_at, open_task_id }]` | pemilik |
| POST | `/alerts/{id}/ack` | `Alert` | pemilik |

Aturan munculnya peringatan (diusulkan): sampel terakhir kolam kelas 3 atau 4, sampel ditolak (`REJECTED_*`), atau `trajectory_alert = true`. Hilang setelah di-ack atau ada sampel baru yang tidak memenuhi aturan.

## 7. Tugas (⬜)
| Method | Endpoint | Body / query | Data respons | Siapa |
|---|---|---|---|---|
| GET | `/farms/{id}/tasks` | `?status=&assignee_id=&pond_id=&page=` | `items: Task[]` | pemilik |
| GET | `/me/tasks` | `?date=today|upcoming|overdue` | `items: Task[]` | teknisi |
| POST | `/tasks` | `pond_id, assignee_id, kind, title, instruction, due_at, source_sample_id?, source_alert_id?` | `Task` | pemilik |
| GET | `/tasks/{id}` | — | `Task` + `reports[]` + `history[]` | pemilik / teknisi yang ditugaskan |
| PATCH | `/tasks/{id}` | pemilik: `title, instruction, due_at, assignee_id` (sebelum dilaporkan), `status: selesai|diminta_ulang|batal` + `owner_note` (wajib untuk diminta_ulang); teknisi: `status: dikerjakan` | `Task` | sesuai peran |
| POST | `/tasks/{id}/reports` | multipart: `note`, `measured` (JSON), `photos[]` (maks 4) | `TaskReport` | teknisi yang ditugaskan; status → `dilaporkan` |
| GET | `/files/{id}` | — | file (foto) dengan header cache privat | anggota lokasi terkait |

- `GET /tasks/{id}`: `reports: [{ id, note, measured: { do_mg_l, … } | null, photos: [{ id, url }], reported_by: { id, full_name }, reported_at }]`, `history: [{ status, by: { id, full_name }, note, at }]`.
- `Task`: `{ id, farm_id, pond: { id, pond_code }, assignee: { id, full_name }, created_by: { id, full_name }, kind: "tindakan"|"ambil_sampel"|"catat_air", title, instruction, due_at, status: "baru"|"dikerjakan"|"dilaporkan"|"selesai"|"diminta_ulang"|"batal", owner_note, source_sample_id, overdue, created_at }`
- `TaskReport`: `{ id, note, measured, photos: [{ id, url }], reported_by, reported_at }`

## 8. Notifikasi, aktivitas, WhatsApp
| Method | Endpoint | Status | Data respons | Siapa |
|---|---|---|---|---|
| GET | `/me/notifications` | ⬜ | `items: [{ id, kind, title, entity, entity_id, read_at, created_at }], unread`. `kind`: `tugas_baru`, `laporan_masuk`, `peringatan_baru`, `tugas_selesai`, `tugas_terlambat`; `entity`: `task`, `pond`, `sample`, `batch` | semua |
| POST | `/me/notifications/read` | ⬜ | body `ids[]` atau `all: true` | semua |
| GET | `/farms/{id}/activity` | ⬜ | `items: [{ actor, action, entity, entity_id, detail, at }]` | pemilik |
| POST | `/reports/whatsapp` | ✅ | `whatsapp_message` | pemilik (perlu auth) |

## 9. Otorisasi (wajib di backend)
- Setiap endpoint (kecuali `health`, `sdri/preview`, auth publik, undangan by-token) butuh access token valid → selain itu `401`.
- Pemilik hanya bisa membaca/menulis data lokasi miliknya; teknisi hanya lokasi tempat dia anggota aktif, dan hanya kolam dengan `assignee_id = dia` → selain itu `403` (bukan `404`, supaya web bisa menampilkan "Akses ditolak").
- Teknisi tidak menerima `meta` (data well) dan tidak bisa mengakses batch, anggota, undangan, aktivitas.
- Tes otomatis lintas akun di backend: pemilik A vs pemilik B, teknisi vs kolam lain.

## 10. Pertanyaan untuk tim backend
| # | Pertanyaan | Usulan web |
|---|---|---|
| K1 | Rentang PPC: README 18-22, `docs/prd.md` 25-31,5. Mana yang dipakai engine? | Satu nilai, ditulis di README dan dikembalikan di respons (`ppc_range`) supaya web menampilkan alasan penolakan yang sama |
| K2 | `S_Chem` memakai NO₂ dan H₂S, tapi `sql/schema.sql` belum punya kolomnya | Tambah kolom (lihat §4) |
| K3 | Pesan WhatsApp memakai emoji 🚨 | Boleh di isi pesan WA; web tidak memakai emoji di UI-nya sendiri |
| K4 | Akun demo dan reset data harian | `POST /auth/demo` + job reset harian di backend |
| K5 | Penyimpanan foto (disk/S3/MinIO)? | Bebas, asal `GET /files/{id}` memeriksa hak akses |
| K6 | Email (undangan, reset sandi) lewat apa? | SMTP via env; di dev cukup dicetak ke log (mock web juga mencetak tautan undangan ke log server) |
| K7 | `domain.RiskClass` di backend bernilai 0/1/2/4 dan 9 (ditolak), sedangkan kontrak memakai 1-4 dan 0 (ditolak) | Ikuti kontrak: Aman 1, Waspada ringan 2, Waspada tinggi 3, Bahaya 4, ditolak 0. Web memetakan kelas hanya di `src/lib/risk.ts` |
| K8 | Pesan WA backend memakai `primary_driver` teks bebas | Web mengisi subskor terbesar, mis. "Beban patogen (S_qPCR 3,3)". Backend boleh menggantinya bila punya pemicu yang lebih tepat |
