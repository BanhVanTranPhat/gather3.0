# Project Plan – The Gathering

> Development timeline: **29/02/2026 – 04/05/2026** (9 weeks)  
> Methodology: **Agile / Scrum** – 2-week sprints  
> Last updated: **2026-03-08**

---

## 1. Timeline overview

```
Sprint 1 ──── Sprint 2 ──── Sprint 3 ──── Sprint 4 ──── Sprint 5
29/02         15/03         29/03         12/04         26/04 ── 04/05
Foundation    Core RT       Communication  Features      Polish & Demo
```

```mermaid
gantt
    dateFormat  DD/MM/YYYY
    title Project Timeline – The Gathering (29/02/2026 – 04/05/2026)

    section Sprints
    Sprint_1_Foundation      :29/02/2026, 14/03/2026
    Sprint_2_Core_Realtime   :15/03/2026, 28/03/2026
    Sprint_3_Communication   :29/03/2026, 11/04/2026
    Sprint_4_Features_Admin  :12/04/2026, 25/04/2026
    Sprint_5_Polish_Demo     :26/04/2026, 04/05/2026
```

| Sprint | Dates | Main goal |
|:---:|---|---|
| **Sprint 1** | 29/02 – 14/03 | Foundation: authentication, database, project setup, basic map |
| **Sprint 2** | 15/03 – 28/03 | Core Real-time: Multiplayer, Avatar, Socket.IO |
| **Sprint 3** | 29/03 – 11/04 | Communication: Chat, Video/Audio (Agora), Proximity |
| **Sprint 4** | 12/04 – 25/04 | Features: Events, Library, Forum, Admin, Editor |
| **Sprint 5** | 26/04 – 04/05 | Polish, Testing, Documentation, Demo Package |

---

## 1.5. Mid-term vs Final Defense Checkpoint

**Mid-term Presentation (12/03/2026): What we have achieved so far**
* **Foundation & Architecture:** Setup Next.js, Express, MongoDB, Socket.IO, PixiJS.
* **Authentication:** Email/Password, Google OAuth, OTP verification.
* **Core Real-time Engine:** Multiplayer movement, Avatar rendering, Realm CRUD.
* **Communication (Basic):** Real-time text chat (UI & Engine integrated).
* **Map Editor:** Visual editor for admins to paint tiles and setup spawnpoints (Completed ahead of schedule).

**Final Defense Target (04/05/2026): What remains to be completed**
* **Advanced Communication:** Agora RTC for Proximity Video/Audio calls.
* **Social Features:** Calendar (Events), Library (Resources), Forum.
* **Administration:** Comprehensive Admin/Host Dashboard.
* **Polish & Demo:** Thorough bug fixing, UI/UX optimization, performance tuning, and final documentation.

---

## 2. Sprint details

### Sprint 1: Foundation (29/02 – 14/03)

**Goal**: Set up the project, authentication, database, and basic user interface.

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

**Milestone**: Users can register, log in, create a space, and see a basic 2D map.

---

### Sprint 2: Core real-time (15/03 – 28/03)

**Goal**: Implement multiplayer real-time features, avatar movement, and presence tracking.

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

**Milestone**: Multiple users can join the same space, move in real time, and see each other on the map.

---

### Sprint 3: Communication (29/03 – 11/04)

**Goal**: Deliver the chat system, video/audio calls, and proximity-based interaction.

| ID | Task | Assignee | Priority | Status |
|---|---|---|:---:|---|
| S3-01 | Chat models: ChatChannel, ChatMessage | Backend | P0 | Done |
| S3-02 | Chat API: channels CRUD, messages CRUD, pagination | Backend | P0 | Done |
| S3-03 | Chat UI: Channel list, DM list, Message view, Composer | Frontend | P0 | Done |
| S3-04 | Real-time chat via Socket.IO (chatMessage, typing indicators) | Full-stack | P0 | Done |
| S3-05 | Auto-create default channels (general, social) per realm | Backend | P1 | Done |
| S3-06 | Agora RTC integration: joinChannel, toggleCamera, toggleMic | Frontend | P0 | Pending |
| S3-07 | Proximity detection system (3-tile range, proximityId) | Backend | P0 | Pending |
| S3-08 | Proximity call prompt: request/accept/reject workflow | Full-stack | P0 | Pending |
| S3-09 | Camera bubble on character head (PixiJS + Agora MediaStream) | Frontend | P0 | Pending |
| S3-10 | Remote video display: see other players' cameras on sprites | Frontend | P0 | Pending |
| S3-11 | Video call panel: draggable, resizable, minimize without disconnect | Frontend | P1 | Pending |
| S3-12 | Play Navbar: mic/cam toggles, emoji reactions, status, leave | Frontend | P1 | Pending |

**Milestone**: Real-time chat works, proximity-based video calls are stable, and camera bubbles appear above characters.

---

### Sprint 4: Features & Admin (12/04 – 25/04)

**Goal**: Build supporting features and system administration tools.

| ID | Task | Assignee | Priority | Status |
|---|---|---|:---:|---|
| S4-01 | Event model + API (CRUD, RSVP, pagination) | Backend | P1 | Pending |
| S4-02 | Calendar panel UI: create/view/RSVP events | Frontend | P1 | Pending |
| S4-03 | Resource model + API (CRUD, search, filter by type) | Backend | P1 | Pending |
| S4-04 | Library panel UI: browse, search, add resources | Frontend | P1 | Pending |
| S4-05 | Forum models (Thread, Post) + API | Backend | P1 | Pending |
| S4-06 | Forum panel UI: threads, replies, create/delete | Frontend | P1 | Pending |
| S4-07 | Admin routes: stats, user management, CRUD all entities | Backend | P1 | Pending |
| S4-08 | Admin dashboard UI: charts, tables, management tools | Frontend | P1 | Pending |
| S4-09 | Map Editor: tile painting, special tiles, room management | Frontend | P1 | Done |
| S4-10 | Focus Room: Lofi music integration | Frontend | P2 | Pending |
| S4-11 | View Selector: Simplified / Immersive / Auto modes | Frontend | P2 | Pending |
| S4-12 | Sidebar collapse/expand (Gather.town style) | Frontend | P1 | Pending |

**Milestone**: The system reaches feature-complete status for the MVP: events, library, forum, admin, editor.

---

### Sprint 5: Polish & Demo (26/04 – 04/05)

**Goal**: Bug fixing, UI polish, testing, documentation, and demo preparation.

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

**Milestone**: Demo-ready product with complete documentation and prepared presentation.

---

## 3. Milestones & deliverables

| Date | Milestone | Deliverable |
|---|---|---|
| 14/03 | **M1** – Foundation Complete | Authentication working, map rendering, space CRUD |
| 28/03 | **M2** – Real-time Multiplayer | Multiplayer movement, presence, zones |
| 11/04 | **M3** – Communication Ready | Chat + video calls + proximity features working |
| 25/04 | **M4** – Feature Complete | Events, Library, Forum, Admin, Editor implemented |
| 04/05 | **M5** – Demo Ready | Bug-free, polished UI, docs, demo package |

---

## 4. Team responsibilities

| Member | Main responsibilities |
|---|---|
| **Phạm Nguyễn Thiên Lộc (Leader)** | Overall planning, sprint coordination, risk management, final presentation lead |
| **Lê Tấn Đạt** | Authentication flows (login, OTP, Google OAuth), user profile and avatar customization (avatar editor + in-game integration) |
| **Lê Thới Duy** | Events & Calendar feature (calendar UI, event CRUD & RSVP, related backend APIs) |
| **Bành Văn Trần Phát** | Core virtual space (PixiJS map, movement), real-time features (Socket.IO, chat, proximity calls), Agora video integration, map editor, admin dashboard, library, forum, and cross-cutting integration |

> Note: The sprint breakdown in sections 2–3 maps to these responsibilities (e.g., Sprint 1 auth tasks to Đạt, Sprint 3 Calendar tasks to Duy, real-time and remaining features primarily to Phát under Lộc's coordination).

---

## 5. Risk management

| Risk | Likelihood | Impact | Mitigation |
|---|:---:|:---:|---|
| Agora free tier quota exceeded | Low | High | Monitor usage, fall back to Testing Mode (no token) |
| PixiJS performance with many sprites | Medium | Medium | Throttle rendering, limit players per room (30) |
| Socket.IO race conditions | Medium | High | Server-authoritative state, debounce events |
| Browser WebRTC compatibility issues | Low | Medium | Test on Chrome/Edge/Firefox, rely on Agora’s NAT handling |
| MongoDB query performance | Low | Medium | Index strategy, pagination, limit query results |
| Sprint delay / scope creep | Medium | High | Use MoSCoW prioritization, cut P2 features when needed |

---

## 6. Definition of Done (DoD)

A task is considered **Done** when:

1. Code is complete and passes TypeScript compilation (no type errors).
2. The feature behaves correctly according to the requirements.
3. UI follows the design system (Tailwind, appropriate dark/light theme per page).
4. There is no regression on existing features.
5. Code has been committed to GitHub with a clear, conventional commit message.
6. Documentation is updated when APIs or architecture change.

---

## 7. Communication plan

| Activity | Frequency | Description |
|---|---|---|
| Sprint Planning | At the beginning of each sprint (2 weeks) | Review backlog, commit scope, estimate effort |
| Daily Standup | Daily (15 minutes) | What was done, what will be done, blockers |
| Sprint Review | End of each sprint | Demo the increment, gather feedback |
| Sprint Retrospective | End of each sprint | Improve process, adjust Definition of Done |
| Code Review | Every PR | Reviewed by ≥1 member before merge |
