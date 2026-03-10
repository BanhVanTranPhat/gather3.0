# Coding Rules & Conventions – The Gathering

> Last updated: **2026-03-08**

---

## 1. Ngôn ngữ & Công cụ

- **TypeScript** là ngôn ngữ duy nhất cho cả frontend và backend. Không viết `.js` trừ config files (next.config.js, tailwind.config.js).
- **Yarn** là package manager chính. Không dùng `npm` để tránh lockfile conflict.
- **ESLint** + **TypeScript strict mode** để đảm bảo code quality.

---

## 2. Cấu trúc thư mục

### Frontend (`frontend/`)

```
app/                    # Next.js App Router pages
  ├── [feature]/        # Mỗi feature là 1 folder (play/, admin/, editor/...)
  │   ├── page.tsx      # Route entry
  │   └── [Component].tsx  # Feature-specific components
components/             # Shared/reusable components
utils/                  # Utility functions, classes, helpers
  ├── pixi/             # PixiJS game engine code
  ├── video-chat/       # Agora RTC wrapper
  ├── auth/             # Auth utilities
  └── backend/          # Backend API client
public/                 # Static assets (sprites, tiles, gather assets from gathertown/mapmaking)
```

### Backend (`backend/src/`)

```
models/       # Mongoose models (1 file per model)
routes/       # Express route handlers (1 file per resource)
sockets/      # Socket.IO event handlers
index.ts      # Server entry point
db.ts         # Database connection
auth.ts       # JWT middleware
```

---

## 3. Quy tắc đặt tên

### Files & Folders

| Loại | Convention | Ví dụ |
|---|---|---|
| React component | PascalCase | `PlaySidebar.tsx`, `ChatPanel.tsx` |
| Utility / helper | camelCase | `generateToken.ts`, `formatEmailToName.ts` |
| Route handler (backend) | camelCase | `realms.ts`, `profiles.ts` |
| Model (backend) | PascalCase | `User.ts`, `ChatMessage.ts` |
| Type / Interface file | camelCase | `socket-types.ts`, `route-types.ts` |
| CSS / Style | kebab-case hoặc module | `globals.css` |
| Constants | camelCase file, UPPER_SNAKE content | `constants.tsx` → `MAX_PLAYERS = 30` |

### Variables & Functions

| Loại | Convention | Ví dụ |
|---|---|---|
| Variable | camelCase | `playerCount`, `isConnected` |
| Function | camelCase | `handleJoinRealm()`, `toggleCamera()` |
| React Component | PascalCase | `PlayNavbar`, `VideoTile` |
| React Hook | camelCase với `use` prefix | `useModal()`, `useLobbyChat()` |
| Constant | UPPER_SNAKE_CASE | `BUBBLE_Y`, `MAX_PROXIMITY_RANGE` |
| Interface / Type | PascalCase, prefix `I` cho interface (optional) | `IRealm`, `ConnectionResponse` |
| Enum value | UPPER_SNAKE_CASE | `ContentType.GUIDE` |
| Boolean | `is`, `has`, `should` prefix | `isOnline`, `hasRemoteVideoTrack` |
| Event handler | `on` hoặc `handle` prefix | `onPlayerJoined`, `handleClick` |
| Signal / Event name | camelCase | `remoteVideoPublished`, `joinedRealm` |

### Database

| Loại | Convention | Ví dụ |
|---|---|---|
| Collection name | lowercase plural (auto by Mongoose) | `users`, `realms`, `chatmessages` |
| Field name | camelCase | `displayName`, `createdAt`, `mapTemplate` |
| Index field | Ghi chú trong schema | `{ email: 1 }`, `{ realmId: 1 }` |

---

## 4. Quy tắc Code Style

### TypeScript

- Strict mode bật (`strict: true` trong tsconfig)
- Không dùng `any` trừ khi thật sự cần thiết (ghi comment lý do)
- Prefer `interface` cho object shapes, `type` cho unions/intersections
- Sử dụng `readonly` cho props không thay đổi
- Destructure parameters khi ≥2 props

### React

- Functional components only (không dùng class components)
- Hooks: `useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`
- Tách logic phức tạp vào custom hooks (`hooks/`)
- `'use client'` directive chỉ khi component cần client-side features
- Tránh `useEffect` cho derived state — dùng computed values hoặc `useMemo`

### Express (Backend)

- Mỗi route file export 1 `Router`
- Middleware authenticate (`requireAuth`) áp dụng per-route, không global
- Validation bằng Zod schemas trước khi xử lý business logic
- Error handling: `express-async-errors` wrap, custom error middleware
- Response format nhất quán: `{ success: boolean, data?, message?, error? }`

### Socket.IO

- Event names: camelCase (`joinRealm`, `playerMoved`)
- Validate payload bằng Zod trước khi xử lý
- Server-authoritative state: client gửi intent, server validate và broadcast
- Debounce movement events phía server để giảm traffic

---

## 5. Git Workflow

### Branch Strategy

```
main                    # Production-ready code
├── develop             # Integration branch
│   ├── feature/xxx     # Feature branches
│   ├── fix/xxx         # Bug fix branches
│   └── hotfix/xxx      # Urgent production fixes
```

| Branch | Mô tả | Merge vào |
|---|---|---|
| `main` | Code ổn định, demo-ready | — |
| `develop` | Tích hợp features mới | `main` (khi release) |
| `feature/[name]` | Phát triển tính năng | `develop` |
| `fix/[name]` | Sửa bug | `develop` |
| `hotfix/[name]` | Sửa bug khẩn cấp | `main` + `develop` |

### Branch Naming

```
feature/add-chat-panel
feature/agora-video-integration
fix/sidebar-zoom-issue
fix/camera-visibility
hotfix/auth-token-expire
```

---

## 6. Commit Convention

Format: **Conventional Commits**

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

### Types

| Type | Mô tả | Ví dụ |
|---|---|---|
| `feat` | Tính năng mới | `feat(chat): add DM channel support` |
| `fix` | Sửa bug | `fix(player): resolve camera bubble position` |
| `refactor` | Tái cấu trúc (không thay đổi behavior) | `refactor(sidebar): switch from fixed to flex layout` |
| `style` | Thay đổi UI/CSS (không logic) | `style(navbar): update button colors` |
| `docs` | Documentation | `docs: update techstack.md` |
| `chore` | Maintenance, config, dependencies | `chore: update TypeScript to 5.4.5` |
| `perf` | Performance optimization | `perf(pixi): reduce video frame rate to 15fps` |
| `test` | Testing | `test(auth): add login endpoint tests` |

### Scope (optional)

- Frontend: `chat`, `sidebar`, `navbar`, `player`, `pixi`, `agora`, `admin`, `editor`, `landing`
- Backend: `auth`, `realms`, `sockets`, `models`, `routes`, `db`
- Chung: `deps`, `config`, `ci`

### Rules

- Subject line ≤ 72 ký tự
- Viết bằng tiếng Anh
- Dùng imperative mood: "add", "fix", "update" (không dùng "added", "fixes", "updated")
- Không kết thúc bằng dấu chấm
- Body (nếu có): giải thích WHY, không phải WHAT

### Ví dụ

```
feat(chat): add real-time typing indicators

Emit chatTyping event when user types in message composer.
Server broadcasts to other users in the same channel.

Closes #45
```

```
fix(player): prevent camera bubble from overriding remote video

Add hasRemoteVideoTrack flag to skip setMediaState
when an active Agora remote video track exists.
```

---

## 7. Code Review Checklist

Trước khi merge PR, reviewer kiểm tra:

- [ ] TypeScript compile không lỗi
- [ ] Không có `any` không cần thiết
- [ ] Naming conventions nhất quán
- [ ] Không có hardcoded values (dùng constants/env)
- [ ] Input validation (Zod) cho API endpoints và socket events
- [ ] Error handling đầy đủ (try/catch, error responses)
- [ ] Không có console.log dư thừa (chỉ giữ error logging)
- [ ] UI responsive ở mức cơ bản
- [ ] Không phá vỡ tính năng hiện có (regression)
- [ ] Commit messages đúng convention

---

## 8. Environment Variables

### Quy tắc

- Sensitive values (API keys, secrets): chỉ trong `.env` / `.env.local`, KHÔNG commit
- Public values (frontend): prefix `NEXT_PUBLIC_`
- `.env.example` phải có danh sách tất cả biến cần thiết (với giá trị mẫu)

### Frontend (.env.local)

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
NEXT_PUBLIC_AGORA_APP_ID=your_agora_app_id
APP_CERTIFICATE=your_agora_certificate
GOOGLE_CLIENT_ID=your_google_client_id
```

### Backend (.env)

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/gathering
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

## 9. Quy tắc bảo mật

1. **Input validation**: Mọi request body, query params, socket payloads phải qua Zod validation
2. **Rate limiting**: Auth endpoints giới hạn 5 requests/15 phút
3. **Password**: Hash bằng bcrypt (10 rounds), không lưu plain text
4. **JWT**: Access token TTL 7 ngày, không expose secret
5. **CORS**: Chỉ allow `CLIENT_URL`, không dùng wildcard `*` trên production
6. **File upload**: Nếu có, giới hạn 10MB, whitelist mime types
7. **NoSQL injection**: Validate IDs là string/UUID, không accept objects trong query
8. **XSS**: Sanitize user-generated content trước khi render

---

## 10. Performance Guidelines

1. **MongoDB**: Index trên các field query thường xuyên (`realmId`, `channelId`, `timestamp`)
2. **Pagination**: Mọi list endpoint phải hỗ trợ pagination, limit tối đa 500 items
3. **Socket.IO**: Throttle movement events (tối đa 10/s), batch updates khi có thể
4. **PixiJS**: Limit video frame update 15fps (canvas-based), cleanup textures khi player leave
5. **Agora**: Lazy join channel (chỉ khi proximity detected), leave khi rời xa
6. **Frontend**: Lazy load components cho routes ít dùng (admin, editor)
