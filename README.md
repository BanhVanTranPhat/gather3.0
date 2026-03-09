# Gather Clone

[Watch the demo](https://www.youtube.com/watch?v=AnhsC7Fmt20)

A clone of Gather.town featuring fully customizable spaces and seamless proximity based video chat.

The project is a fork of Realms, my previous project inspired by Gather. You can check it out [here.](https://github.com/trevorwrightdev/realms)

The app was designed to include the core features of Gather, including:

- Customizable spaces using tilesets
- Proximity video chat
- Private area video chat 
- Multiplayer networking
- Tile-based movement

Built as a TypeScript web app primarily using Next.js, Express, MongoDB, Socket.io, TailwindCSS, and Pixi.js.

### How to install

First, clone the repo.
`git clone https://github.com/trevorwrightdev/gather-clone.git`

Install client dependencies.
```bash
cd frontend
npm install
```

Install server dependencies.
```bash
cd backend
npm install
```

Create a .env file in the `backend` directory with the following variables:
```
FRONTEND_URL=
MONGODB_URI=
JWT_SECRET=
```

Create a .env.local file in the `frontend` directory with the following variables:
```
NEXT_PUBLIC_BASE_URL=
NEXT_PUBLIC_BACKEND_URL=
# Optional: for "Đăng nhập bằng Google" on signin
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

For video chat (optional), add:
```
NEXT_PUBLIC_AGORA_APP_ID=
APP_CERTIFICATE=
```

Lastly, run `npm run dev` in both the `frontend` and `backend` directories.

### Troubleshooting

- **404 on `_next/static/chunks/main-app.js` or `app-pages-internals.js`**  
  Clear the Next.js build and restart: from `frontend` run `yarn clean` (or `npm run clean`) then `yarn dev`. Hard-refresh the page (Ctrl+Shift+R / Cmd+Shift+R) or try an incognito window.

- **Đăng nhập / đăng ký không được (Cannot sign in or register)**  
  Backend phải chạy trước. Trong thư mục `backend` chạy `npm run dev` (port 4000). Nếu backend tắt, trang signin sẽ báo: "Không kết nối được server..."

- **Google OAuth (Đăng nhập bằng Google)**  
  Tạo OAuth 2.0 Client ID (Web application) trong [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials. Thêm **Authorized JavaScript origins**: `http://localhost:3000` và domain production. Thêm **Authorized redirect URIs** tương ứng. Đặt `NEXT_PUBLIC_GOOGLE_CLIENT_ID` trong `frontend/.env.local`.
