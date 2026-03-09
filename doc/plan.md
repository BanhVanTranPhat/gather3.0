# Project Plan – The Gathering

> Kế hoạch phát triển: **01/03/2026 – 03/05/2026** (9 tuần)  
> Phương pháp: **Agile / Scrum** – Sprint 2 tuần  
> Last updated: **2026-03-08**

---

## 1. Tổng quan Timeline

```
Sprint 1 ──── Sprint 2 ──── Sprint 3 ──── Sprint 4 ──── Sprint 5
01/03         15/03         29/03         12/04         26/04 ── 03/05
Foundation    Core RT       Communication  Features      Polish & Demo
```

| Sprint | Thời gian | Mục tiêu chính |
|:---:|---|---|
| **Sprint 1** | 01/03 – 14/03 | Foundation: Auth, DB, Project Setup, Map cơ bản |
| **Sprint 2** | 15/03 – 28/03 | Core Real-time: Multiplayer, Avatar, Socket.IO |
| **Sprint 3** | 29/03 – 11/04 | Communication: Chat, Video/Audio (Agora), Proximity |
| **Sprint 4** | 12/04 – 25/04 | Features: Events, Library, Forum, Admin, Editor |
| **Sprint 5** | 26/04 – 03/05 | Polish, Testing, Documentation, Demo Package |

---

## 2. Chi tiết từng Sprint

### Sprint 1: Foundation (01/03 – 14/03)

**Mục tiêu**: Setup project, authentication, database, và giao diện cơ bản.

| ID | Task | Assignee | Priority | Status |
|---|---|---|:---:|---|
| S1-01 | Setup monorepo: frontend (Next.js) + backend (Express + TS) | Team | P0 | Done |
| S1-02 | Cấu hình MongoDB + Mongoose models (User, Profile, Realm) | Backend | P0 | Done |
| S1-03 | Auth: Email/Password register + login + JWT | Backend | P0 | Done |
| S1-04 | Auth: Google OAuth integration | Backend | P1 | Done |
| S1-05 | Auth: OTP verification (Nodemailer) | Backend | P1 | Done |
| S1-06 | Frontend: Sign-in page UI | Frontend | P0 | Done |
| S1-07 | Frontend: Landing page (Hero, Features, CTA) | Frontend | P1 | Done |
| S1-08 | Frontend: Space manager dashboard (/app) | Frontend | P0 | Done |
| S1-09 | Realm CRUD API (create, read, update, delete) | Backend | P0 | Done |
| S1-10 | PixiJS: Basic map rendering + tilemap loader | Frontend | P0 | Done |
| S1-11 | Avatar system: skin selection + sprite rendering | Frontend | P1 | Done |

**Milestone**: User có thể đăng ký, đăng nhập, tạo space, và thấy bản đồ 2D cơ bản.

---

### Sprint 2: Core Real-time (15/03 – 28/03)

**Mục tiêu**: Multiplayer real-time, avatar movement, presence tracking.

| ID | Task | Assignee | Priority | Status |
|---|---|---|:---:|---|
| S2-01 | Socket.IO server: joinRealm, disconnect, presence | Backend | P0 | Done |
| S2-02 | Player movement broadcasting (movePlayer, teleport) | Backend | P0 | Done |
| S2-03 | PixiJS Player class: sprite animation, name tag, movement | Frontend | P0 | Done |
| S2-04 | Multi-room support: teleporters, spawnpoints | Frontend | P0 | Done |
| S2-05 | In-game bubble messages (sendMessage/receiveMessage) | Full-stack | P1 | Done |
| S2-06 | Online/offline member tracking | Backend | P0 | Done |
| S2-07 | Minimap + Overview map + Zoom controls | Frontend | P1 | Done |
| S2-08 | Zone system: Named zones, door markers, zone popup | Frontend | P1 | Done |
| S2-09 | Play Sidebar: People panel (online + offline members) | Frontend | P0 | Done |
| S2-10 | Position memory: Save/restore last position per realm | Full-stack | P1 | Done |
| S2-11 | Invite link: Share ID generation + join via link | Full-stack | P1 | Done |

**Milestone**: Nhiều user cùng vào 1 space, di chuyển real-time, thấy nhau trên bản đồ.

---

### Sprint 3: Communication (29/03 – 11/04)

**Mục tiêu**: Chat system, video/audio calls, proximity-based interaction.

| ID | Task | Assignee | Priority | Status |
|---|---|---|:---:|---|
| S3-01 | Chat models: ChatChannel, ChatMessage | Backend | P0 | Done |
| S3-02 | Chat API: channels CRUD, messages CRUD, pagination | Backend | P0 | Done |
| S3-03 | Chat UI: Channel list, DM list, Message view, Composer | Frontend | P0 | Done |
| S3-04 | Real-time chat via Socket.IO (chatMessage, typing indicators) | Full-stack | P0 | Done |
| S3-05 | Auto-create default channels (general, social) per realm | Backend | P1 | Done |
| S3-06 | Agora RTC integration: joinChannel, toggleCamera, toggleMic | Frontend | P0 | Done |
| S3-07 | Proximity detection system (3-tile range, proximityId) | Backend | P0 | Done |
| S3-08 | Proximity call prompt: request/accept/reject workflow | Full-stack | P0 | Done |
| S3-09 | Camera bubble on character head (PixiJS + Agora MediaStream) | Frontend | P0 | Done |
| S3-10 | Remote video display: see other players' cameras on sprites | Frontend | P0 | Done |
| S3-11 | Video call panel: draggable, resizable, minimize without disconnect | Frontend | P1 | Done |
| S3-12 | Play Navbar: mic/cam toggles, emoji reactions, status, leave | Frontend | P1 | Done |

**Milestone**: Chat hoạt động real-time, video call proximity-based, thấy camera trên đầu nhân vật.

---

### Sprint 4: Features & Admin (12/04 – 25/04)

**Mục tiêu**: Các tính năng bổ sung và quản trị hệ thống.

| ID | Task | Assignee | Priority | Status |
|---|---|---|:---:|---|
| S4-01 | Event model + API (CRUD, RSVP, pagination) | Backend | P1 | Done |
| S4-02 | Calendar panel UI: create/view/RSVP events | Frontend | P1 | Done |
| S4-03 | Resource model + API (CRUD, search, filter by type) | Backend | P1 | Done |
| S4-04 | Library panel UI: browse, search, add resources | Frontend | P1 | Done |
| S4-05 | Forum models (Thread, Post) + API | Backend | P1 | Done |
| S4-06 | Forum panel UI: threads, replies, create/delete | Frontend | P1 | Done |
| S4-07 | Admin routes: stats, user management, CRUD all entities | Backend | P1 | Done |
| S4-08 | Admin dashboard UI: charts, tables, management tools | Frontend | P1 | Done |
| S4-09 | Map Editor: tile painting, special tiles, room management | Frontend | P1 | Done |
| S4-10 | Focus Room: Lofi music integration | Frontend | P2 | Done |
| S4-11 | View Selector: Simplified / Immersive / Auto modes | Frontend | P2 | Done |
| S4-12 | Sidebar collapse/expand (Gather.town style) | Frontend | P1 | Done |

**Milestone**: Hệ thống có đầy đủ tính năng MVP: events, library, forum, admin, editor.

---

### Sprint 5: Polish & Demo (26/04 – 03/05)

**Mục tiêu**: Bug fixes, UI polish, testing, documentation, demo preparation.

| ID | Task | Assignee | Priority | Status |
|---|---|---|:---:|---|
| S5-01 | Bug fixing: camera visibility, sidebar zoom, position memory | Full-stack | P0 | Done |
| S5-02 | UI polish: responsive, loading states, error handling | Frontend | P0 | In Progress |
| S5-03 | Performance: Socket.IO throttling, PixiJS rendering optimize | Full-stack | P1 | In Progress |
| S5-04 | Security review: rate limiting, input validation, CORS | Backend | P1 | In Progress |
| S5-05 | Documentation: techstack.md, plan.md, rules.md | Team | P0 | In Progress |
| S5-06 | Documentation: update charter.md, SRS.md | Team | P0 | In Progress |
| S5-07 | Testing: manual test tất cả use cases chính | Team | P0 | Pending |
| S5-08 | Demo preparation: scripts, sample data, presentation | Team | P0 | Pending |
| S5-09 | Code cleanup: remove unused files, consistent naming | Full-stack | P1 | In Progress |
| S5-10 | Deploy preparation: .env examples, README, run scripts | Team | P1 | Pending |

**Milestone**: Sản phẩm demo-ready, documentation hoàn chỉnh, presentation sẵn sàng.

---

## 3. Milestones & Deliverables

| Ngày | Milestone | Deliverable |
|---|---|---|
| 14/03 | **M1** – Foundation Complete | Auth hoạt động, map render, space CRUD |
| 28/03 | **M2** – Real-time Multiplayer | Multiplayer movement, presence, zones |
| 11/04 | **M3** – Communication Ready | Chat + Video calls + Proximity hoạt động |
| 25/04 | **M4** – Feature Complete | Events, Library, Forum, Admin, Editor hoàn thành |
| 03/05 | **M5** – Demo Ready | Bug-free, polished UI, docs, demo package |

---

## 4. Phân chia trách nhiệm

| Vai trò | Phạm vi | Thành viên |
|---|---|---|
| **Project Manager** | Sprint planning, tracking, risk management | PM |
| **Frontend Developer** | Next.js, PixiJS, React components, Tailwind UI | FE Dev |
| **Backend Developer** | Express, MongoDB, Socket.IO, API design | BE Dev |
| **Full-stack** | Integration, Agora RTC, real-time features | Full-stack Dev |

---

## 5. Risk Management

| Risk | Xác suất | Ảnh hưởng | Mitigation |
|---|:---:|:---:|---|
| Agora free tier hết quota | Thấp | Cao | Monitor usage, fallback to Testing Mode (no token) |
| PixiJS performance với nhiều sprites | Trung bình | Trung bình | Throttle rendering, limit players per room (30) |
| Socket.IO race conditions | Trung bình | Cao | Server-authoritative state, debounce events |
| Browser WebRTC compatibility | Thấp | Trung bình | Test Chrome/Edge/Firefox, Agora handles NAT |
| MongoDB query performance | Thấp | Trung bình | Index strategy, pagination, limit query results |
| Sprint delay / scope creep | Trung bình | Cao | MoSCoW prioritization, cut P2 features nếu cần |

---

## 6. Definition of Done (DoD)

Một task được coi là **Done** khi:

1. Code hoàn thành và pass TypeScript compilation (không lỗi type)
2. Tính năng hoạt động đúng theo requirement
3. UI phù hợp design system (Tailwind, dark/light theme tùy page)
4. Không có regression trên các tính năng hiện có
5. Code đã được commit lên GitHub với message rõ ràng
6. Documentation cập nhật (nếu thay đổi API hoặc architecture)

---

## 7. Communication Plan

| Hoạt động | Tần suất | Mô tả |
|---|---|---|
| Sprint Planning | Đầu mỗi sprint (2 tuần) | Review backlog, commit scope, ước lượng |
| Daily Standup | Hàng ngày (15 phút) | Đã làm, sẽ làm, blockers |
| Sprint Review | Cuối sprint | Demo increment, thu thập feedback |
| Sprint Retro | Cuối sprint | Cải thiện quy trình |
| Code Review | Mỗi PR | Review bởi ≥1 member trước merge |
