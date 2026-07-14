# VietTrade Pro — Enterprise Stock Trading Platform (MVP)

Frontend triển khai theo bộ tài liệu thiết kế `trading-platform-docs/` (PRD, IA, Design System, Frontend Architecture...), với giao diện nâng cấp theo phong cách **trading terminal chuyên nghiệp** (lấy cảm hứng Bloomberg Terminal / TradingView).

## Giao diện — "Trading Terminal" theme

- **Bảng màu**: nền graphite-navy gần đen, accent kép **teal-cyan** (hành động chính) + **amber gold** (nhấn phụ), giữ nguyên màu tăng/giảm/trần/sàn/tham chiếu theo chuẩn CTCK Việt Nam
- **Typography**: Space Grotesk (tiêu đề/số liệu lớn), Inter (giao diện), JetBrains Mono (bảng giá, số liệu — căn số đều tabular)
- **Ticker tape**: dải giá chạy ngang liên tục ở đầu trang (cả màn hình đăng nhập lẫn ứng dụng chính)
- **Biểu đồ nến thật**: dùng `lightweight-charts` (thư viện lõi của TradingView) cho trang chi tiết mã — nến + volume, không phải biểu đồ đường giả
- **Sổ lệnh có depth bar**: thanh độ sâu dư mua/dư bán trực quan như phần mềm giao dịch thật
- **Bản đồ nhiệt thị trường** (heatmap) theo khối lượng giao dịch, giống Finviz/TradingView
- **Sparkline** mini-chart xu hướng trong danh sách top tăng/giảm và bản đồ nhiệt
- **Bảng giá 3 cột dư mua/dư bán** — đúng cấu trúc iBoard SSI/VNDirect/HOSE (Giá 3/KL3 → Giá 1/KL1 hai bên, cột khớp lệnh ở giữa), cột màu trần/sàn/tham chiếu, room + khối lượng khối ngoại mua/bán mỗi mã
- **Trạng thái phiên giao dịch thực** (ATO 9:00-9:15 → Liên tục → Nghỉ trưa → Liên tục → ATC 14:30-14:45 → Thoả thuận → Đóng cửa), tự cập nhật theo giờ thực, cuối tuần hiển thị đóng cửa
- **Độ rộng thị trường** (market breadth) — thanh tỉ lệ mã tăng/giảm/đứng giá/trần/sàn theo thời gian thực
- **Hiệu ứng chuyển động**: số liệu đếm mượt (`framer-motion`), chuyển trang mượt, glow/pulse cho trạng thái live, nhấp nháy giá khi cập nhật

## Đã triển khai (MVP scope theo PRD 1.10)

- **Auth**: Đăng ký / Đăng nhập (mock, lưu local), route guard `RequireAuth`
- **Dashboard**: chỉ số thị trường (số liệu animate), heatmap, top tăng/giảm kèm sparkline, tổng tài sản
- **Market**: bảng giá real-time mô phỏng + sparkline mỗi dòng, lọc theo ngành, tìm kiếm, trang chi tiết mã (biểu đồ nến thật + sổ lệnh depth bar)
- **Trading**: đặt lệnh LO (Mua/Bán), sổ lệnh trong ngày, huỷ lệnh, lịch sử khớp lệnh
- **Portfolio**: danh mục sở hữu, P&L, biểu đồ phân bổ tài sản
- **Watchlist**: nhiều danh sách theo dõi tuỳ chỉnh
- **Alerts**: cảnh báo giá vượt/giảm ngưỡng, trung tâm thông báo
- **Reports**: sao kê giao dịch, xuất CSV
- **Settings**: hồ sơ, đổi mật khẩu, Light/Dark theme (mặc định Dark — đúng chất terminal)
- **Admin**: bảng điều khiển quản trị **có quyền hành động thật** — khoá/mở khoá tài khoản, điều chỉnh số dư tiền mặt bất kỳ user nào, xoá tài khoản, buộc huỷ lệnh đang chờ khớp của bất kỳ ai, tạm dừng/mở lại giao dịch theo từng mã cổ phiếu (đăng nhập riêng tại `/admin/login`)

## Quan trọng — đây là bản mô phỏng, không phải hệ thống production

Vì đây là đồ án frontend, các phần sau được **giả lập hoàn toàn trên trình duyệt**, chưa có backend thật:

- Không có server/API/database thật — toàn bộ dữ liệu lưu ở `localStorage` qua Zustand `persist`
- Giá cổ phiếu là **dữ liệu giả lập** (random walk trong biên độ trần/sàn), không phải dữ liệu sàn giao dịch thật
- Khớp lệnh là mô phỏng (delay 2-3s rồi tự "khớp"), không có matching engine thật
- Không có 2FA, KYC, mã hoá, hay các yêu cầu bảo mật tài chính thật (nêu trong PRD mục G4) — cần backend riêng
- Chưa làm: Research, News, module Admin nâng cao, i18n, TypeScript, TanStack Query, WebSocket thật, Radix UI, testing (Vitest/Playwright), virtualization cho bảng giá lớn — đây là các hạng mục Phase 2 theo Roadmap gốc

Phù hợp để: demo giao diện, nộp đồ án, luyện tập UI/UX theo tài liệu. **Không dùng để giao dịch thật.**

## Đăng nhập bằng Google (Firebase Auth)

Đã tích hợp Firebase Authentication thật (project `trading-project-5707b`) cho cả trang Đăng nhập và Đăng ký.

**Quan trọng — bắt buộc phải làm trước khi nút Google hoạt động trên domain Vercel:**

1. Vào [Firebase Console](https://console.firebase.google.com) → chọn project `trading-project-5707b`
2. **Authentication → Sign-in method** → bật provider **Google** nếu chưa bật
3. **Authentication → Settings → Authorized domains** → bấm **Add domain**, thêm domain Vercel của bạn (ví dụ `trading-two-xi.vercel.app`)

Nếu bỏ qua bước 3, khi bấm "Đăng nhập bằng Google" sẽ báo lỗi `auth/unauthorized-domain`.

Tài khoản đăng nhập Google lần đầu sẽ tự động được tạo hồ sơ nhà đầu tư với 200.000.000₫ tiền demo, giống như đăng ký thường. Mục Cài đặt → Bảo mật sẽ ẩn phần đổi mật khẩu đối với tài khoản Google (vì mật khẩu do Google quản lý).

## Chạy dự án

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # build production vào /dist
npm run preview   # xem thử bản build
```

## Deploy lên Vercel

Repo đã có sẵn `vercel.json` (rewrite toàn bộ route về `index.html` để React Router hoạt động đúng khi refresh trang con như `/market/VNM`).

1. Push toàn bộ code này lên GitHub (thay vì chỉ folder docs như trước)
2. Import repo vào Vercel, Preset chọn **Vite**, giữ nguyên Build Command/Output mặc định
3. Deploy

## Khu vực quản trị — tách riêng hoàn toàn khỏi giao diện người dùng

- Trang đăng nhập công khai (`/login`) **không còn hiển thị** thông tin tài khoản admin
- Quản trị viên đăng nhập tại **`/admin/login`** — URL riêng, không có liên kết nào từ giao diện người dùng trỏ tới, giao diện tối giản kiểu "internal tool" khác hẳn thương hiệu VietTrade
- Sau khi đăng nhập, admin vào bảng điều khiển riêng (`AdminLayout`) — không dùng chung sidebar/ticker tape/menu với nhà đầu tư
- Người dùng thường (hoặc chưa đăng nhập) cố truy cập `/admin` sẽ tự động được chuyển hướng, không lộ bất kỳ gợi ý nào về khu vực quản trị

## Tài khoản demo

| Vai trò | Đăng nhập tại | Email | Mật khẩu |
|---|---|---|---|
| Nhà đầu tư | `/login` | Tự đăng ký ở trang Đăng ký | — |
| Quản trị viên | `/admin/login` | admin@demo.vn | admin123 |

Tài khoản nhà đầu tư mới được cấp 200.000.000₫ tiền demo.
