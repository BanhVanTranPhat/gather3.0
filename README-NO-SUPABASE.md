# gather-clone – dùng backend riêng (giống Gather, không Supabase/Agora)

Project đã được cấu hình để **không dùng Supabase và Agora**, chỉ dùng backend Express + MongoDB + JWT giống [Gather](../Gather).

## Env

- **Backend** `gather-clone/backend/.env`: `PORT`, `FRONTEND_URL`, `MONGODB_URI`, `JWT_SECRET`
- **Frontend** `gather-clone/frontend/.env.local`: `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_BASE_URL`

## Chạy

1. **Backend**
   ```bash
   cd gather-clone/backend
   npm install
   npm run dev
   ```
   Server chạy tại `http://localhost:4000` (hoặc PORT trong .env).

2. **Frontend**
   ```bash
   cd gather-clone/frontend
   npm install
   npm run dev
   ```
   Mở `http://localhost:3000`.

## Auth

- **Đăng ký**: `POST /auth/register` body `{ email, password, displayName? }`
- **Đăng nhập**: `POST /auth/login` body `{ email, password }`
- **Me**: `GET /auth/me` header `Authorization: Bearer <token>`

Token trả về từ login/register, frontend lưu vào `localStorage` key `gather_clone_token`.

## API Realms & Profiles

- `GET /realms` – danh sách realms của user
- `GET /realms/:id` – chi tiết realm
- `GET /realms/by-share/:shareId` – theo share_id
- `POST /realms` – tạo realm (body: `name`, `map_data?`)
- `PATCH /realms/:id` – cập nhật (`map_data`, `name`, `share_id`, `only_owner`)
- `DELETE /realms/:id` – xóa realm
- `GET /profiles/me` – profile (skin, visited_realms)
- `PATCH /profiles/me` – cập nhật profile

## Frontend – backend API

`frontend/utils/backendApi.ts`: `getToken`, `setToken`, `api`, `authLogin`, `authRegister`, `authLogout`.

`frontend/utils/auth/`: server/client auth gọi backend (createClient, getSession, getUser).
- Tạo realm: `api.post('/realms', { name, map_data })`.
- Lưu realm: `api.patch('/realms/' + id, { map_data })`.
- Danh sách realms: `api.get('/realms')`.
- Lấy realm theo id/shareId: `api.get('/realms/' + id)` hoặc `api.get('/realms/by-share/' + shareId)`.

Voice/video (Agora) đã bỏ; nếu cần có thể tích hợp WebRTC/SFU giống Gather sau.
