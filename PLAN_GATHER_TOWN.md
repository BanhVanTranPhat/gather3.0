# Kế hoạch làm gather-clone giống Gather Town

Tài liệu này liệt kê các tính năng cần làm/hoàn thiện để gather-clone gần với Gather Town, gồm: zoom map, chat (gửi tin trong play), invite (modal), hiệu ứng, và các API/framework gợi ý.

---

## Tổng quan hiện trạng

| Tính năng | Trạng thái | Ghi chú |
|-----------|------------|--------|
| Layout (sidebar + map + bottom bar) | ✅ Có | PlayTopBar, PlaySidebar, PlayNavbar |
| User list (online/offline) | ✅ Có | Signal `playersInRoom`, PlaySidebar |
| Copy invite link | ✅ Có | PlaySidebar nút Invite + copy |
| Chat nhận tin | ✅ Có | ChatLog + socket `receiveMessage` |
| Chat gửi tin trong play | ✅ Có | ChatLog input + signal `message` |
| Zoom map (play) | ✅ Có | MapZoomControls, wheel, zoomIn/Out |
| Invite modal | ✅ Có | InviteModal, mở từ sidebar |
| Hiệu ứng UI (Framer Motion) | ✅ Có | InviteModal, ChatLog |
| Mini-map | ✅ Có | MiniMap component, signal minimapPosition |
| Proximity video + ngồi ghế + popup | ✅ Có | Đã implement trước đó |

---

## 1. Zoom in / out map

**Mục tiêu:** Người chơi zoom map bằng nút +/- hoặc scroll chuột (giống Gather).

**Cách làm:**

- **Backend:** Không cần.
- **Frontend – PlayApp (Pixi):**
  - Thêm `minScale`, `maxScale` (ví dụ 0.6, 3) và biến `scale` có thể thay đổi.
  - Thêm method `zoomTo(newScale: number)` (và nếu muốn zoom quanh điểm: `zoomTo(newScale, centerX?, centerY?)`).
  - Trong `zoomTo`: clamp scale, `this.scale = newScale`, `this.app.stage.scale.set(this.scale)`, sau đó gọi `moveCameraToPlayer()` để giữ camera theo player (vì camera đang dùng pivot).
  - Expose `zoomIn()`, `zoomOut()` (tăng/giảm scale một bước, rồi gọi `zoomTo`).
- **UI zoom:**
  - Tạo component `MapZoomControls.tsx` (nút `+`, `-`, có thể thêm nút “fit” nếu cần).
  - Component này cần gọi PlayApp: dùng **signal** (ví dụ `signal.emit('mapZoomIn')` / `'mapZoomOut'`) và trong PlayApp `signal.on('mapZoomIn', this.zoomIn)` tương ứng.
  - Vì PlayApp được tạo trong PixiApp (ref), có thể thay signal bằng ref/callback từ PixiApp lên PlayClient rồi truyền xuống MapZoomControls; signal đơn giản hơn.
- **Scroll chuột (optional):**
  - Trong PlayApp (hoặc container canvas): lắng nghe `wheel` trên canvas, `deltaY` âm → zoom in, dương → zoom out, gọi `zoomTo(this.scale + step)` (step phụ thuộc deltaY). Cần `preventDefault()` để trang không scroll.

**File cần sửa/tạo:**

- `gather-clone/frontend/utils/pixi/PlayApp.ts`: thêm `zoomTo`, `zoomIn`, `zoomOut`, đăng ký signal hoặc event wheel.
- `gather-clone/frontend/app/play/MapZoomControls.tsx`: component nút zoom (và đặt cạnh map, ví dụ góc phải như ảnh Gather).

**Tham khảo:** Editor đã có zoom trong `EditorApp.ts` (`zoomTo`, `setScale`, clamp 0.6–3). Có thể copy logic clamp và bước zoom, nhưng Play dùng camera theo player (pivot) nên không copy phần position chuột.

---

## 2. Chat (gửi tin trong play + UI)

**Mục tiêu:** Trong màn play, người chơi gõ tin nhắn và gửi được (room broadcast), hiển thị trong ChatLog.

**Đã có:**

- Socket: `sendMessage` / `receiveMessage` (backend `sockets.ts`).
- PlayApp: `signal.on('message', ...)` → `server.socket.emit('sendMessage', message)` và `player.setMessage(message)`.
- ChatLog: nhận `newMessage` và hiển thị danh sách tin.

**Thiếu:**

- Ở play không có chỗ **nhập và gửi** tin (không có component nào emit `signal('message', text)`).

**Cách làm:**

- Thêm **ô nhập + nút gửi** vào ChatLog (hoặc component con bên trong panel chat).
- Khi user gửi:
  - Gọi `signal.emit('message', content)` (content là string đã trim).
  - Giữ nguyên: PlayApp đã listen `'message'` và emit socket + setMessage; ChatLog đã listen `'newMessage'` nên tin vẫn hiển thị như hiện tại.
- Optional: phím Enter gửi, Shift+Enter xuống dòng (nếu dùng textarea).
- Optional: giới hạn độ dài tin (ví dụ 500 ký tự), hiển thị “Username: content” trong ChatLog (đã có username từ message).

**File cần sửa:**

- `gather-clone/frontend/app/play/ChatLog.tsx`: thêm state `inputValue`, input (hoặc textarea), nút Send; onSend → `signal.emit('message', inputValue)`, clear input.

**Nâng cao (sau):**

- Kênh (#general, #social): cần backend thêm channel cho message và UI tab kênh.
- DM: cần backend (lưu DM, socket event DM) và UI chọn user + hội thoại riêng.

---

## 3. Invite (modal giống Gather)

**Mục tiêu:** Có modal “Invite collaborators” với link mời, nút Copy, có thể mở từ sidebar (thay vì chỉ copy ngay).

**Đã có:**

- PlaySidebar: block Invite + copy link (`inviteUrl` từ PlayClient).
- `inviteUrl` = `origin/play/${realmId}?shareId=...` (đã có shareId và by-share API).

**Cách làm:**

- Tạo component **InviteModal** (hoặc `InviteCollaboratorsModal.tsx`):
  - Props: `open`, `onClose`, `inviteUrl`, optional `roomName`.
  - Nội dung: title “Invite collaborators”, ô hiển thị link (read-only), nút “Copy”, nút đóng.
  - Copy: `navigator.clipboard.writeText(inviteUrl)`, có thể toast “Đã copy!”.
- Trong PlaySidebar: thay (hoặc bổ sung) hành vi nút “Invite”: mở modal thay vì copy trực tiếp; trong modal vẫn có nút Copy.
- PlayClient (hoặc PlaySidebar) giữ state `showInviteModal`; khi mở modal truyền `inviteUrl` vào.

**Optional:**

- Tab “Members” / “Guests” (nếu sau này có phân quyền member/guest).
- “Invite with email”: mở mailto hoặc form gửi email (cần backend gửi email).
- Web Share API: `navigator.share({ url: inviteUrl, title: roomName })` nếu trình duyệt hỗ trợ, fallback là Copy.

**File cần tạo/sửa:**

- `gather-clone/frontend/components/InviteModal.tsx` (hoặc `app/play/InviteModal.tsx`): modal UI.
- `gather-clone/frontend/app/play/PlaySidebar.tsx`: nút Invite mở modal; render InviteModal khi `showInviteModal`.

---

## 4. Hiệu ứng & framework / API gợi ý

**Đã dùng:**

- **GSAP:** animation (fade, tween) trong project.
- **Pixi.js:** render map, avatar, tile.
- **Tailwind:** UI.

**Có thể thêm (không bắt buộc):**

- **Framer Motion** (`framer-motion`): cho UI (modal xuất hiện/ẩn, sidebar đóng/mở, nút hover). Dùng cho InviteModal, ChatLog panel, PlaySidebar drawer.
- **React Spring:** thay thế Framer Motion nếu ưu tiên animation nhẹ.
- **Lottie:** nếu muốn hiệu ứng “loading” hoặc icon animation phức tạp (cần file JSON Lottie).

**API bên ngoài (optional):**

- **Web Share API:** share link mời (đã nói ở Invite).
- **Clipboard API:** đã dùng cho copy link.
- Không cần API riêng cho zoom/chat/invite; backend hiện tại (Socket.io, Express, MongoDB) đủ cho chat room và realm/share.

---

## 5. Thứ tự ưu tiên gợi ý

| Bước | Nội dung | Độ ưu tiên |
|------|----------|------------|
| 1 | **Chat gửi tin trong play** – Thêm input + gửi vào ChatLog, emit `message` | Cao |
| 2 | **Zoom map** – zoomTo/zoomIn/zoomOut trong PlayApp + MapZoomControls (+ wheel nếu muốn) | Cao |
| 3 | **Invite modal** – Modal “Invite collaborators” + Copy, mở từ nút Invite | Trung bình |
| 4 | **Hiệu ứng UI** – Framer Motion (hoặc tương đương) cho modal/panel | Thấp |
| 5 | **Mini-map** – Thu nhỏ bản đồ góc màn hình (clone view Pixi hoặc tilemap thu nhỏ) | Thấp / sau |

---

## 6. Checklist triển khai nhanh

- [x] **Zoom:** PlayApp `zoomTo`, `zoomIn`, `zoomOut`; signal; MapZoomControls (+/-); wheel.
- [x] **Chat:** ChatLog input + nút Send; emit `signal('message', content)`.
- [x] **Invite modal:** InviteModal component; PlaySidebar mở modal; Copy trong modal.
- [x] **Effects:** Framer Motion cho InviteModal và ChatLog (AnimatePresence + motion).
- [x] **Mini-map:** PlayApp emit `minimapPosition` (throttled); MiniMap component góc trái dưới.

Sau khi làm xong 1–5, gather-clone đã có: zoom map, chat gửi/nhận, invite modal, hiệu ứng UI, và mini-map.
