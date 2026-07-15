# Hướng dẫn triển khai bản "dữ liệu thật" (đọc trước khi deploy)

Bản này đã thay thế toàn bộ dữ liệu giả (`Math.random()`) và tài khoản giả (localStorage) bằng:
- **Giá thị trường thật**: lấy qua thư viện `vnstock-js` (tổng hợp từ TCBS/VNDirect/SSI/DNSE, không cần API key).
- **Tài khoản, số dư, danh mục, lệnh**: lưu thật trong **Firestore**, xác thực thật qua **Firebase Authentication**. Giao dịch dùng **tiền ảo** (không phải tiền thật — xem phần "Giới hạn" bên dưới).

Không có bước nào ở đây cần bạn tự viết thêm code — chỉ cần cấu hình vài thứ trên Firebase Console và Vercel.

## 1. Bật Firestore + Email/Password trên Firebase Console

Vào https://console.firebase.google.com/ → chọn project `trading-project-5707b` (project đã có sẵn trong code):

1. **Authentication → Sign-in method** → bật **Email/Password** (Google đã bật sẵn).
2. **Firestore Database** → **Create database** → chọn chế độ **Production mode**, chọn region gần Việt Nam (vd `asia-southeast1`).
3. Sau khi tạo xong, vào tab **Rules**, dán nội dung file `firestore.rules` (đã có sẵn trong repo) rồi **Publish**. Rule này chặn mọi client ghi trực tiếp — mọi thay đổi số dư/lệnh chỉ được phép qua backend, để không ai tự sửa số dư qua console trình duyệt.

## 2. Tạo Service Account cho backend (Admin SDK)

Backend (`/api/...`, chạy trên Vercel) cần quyền admin để đọc/ghi Firestore và xác thực token:

1. Firebase Console → biểu tượng ⚙️ → **Project settings → Service accounts**.
2. Bấm **Generate new private key** → tải file JSON về.
3. Mở file JSON đó, bạn sẽ cần 3 giá trị: `project_id`, `client_email`, `private_key`.

## 3. Cấu hình biến môi trường trên Vercel

Vào project trên Vercel (`viettrade-pro`) → **Settings → Environment Variables**, thêm:

| Tên biến | Giá trị |
|---|---|
| `FIREBASE_PROJECT_ID` | `project_id` trong file JSON |
| `FIREBASE_CLIENT_EMAIL` | `client_email` trong file JSON |
| `FIREBASE_PRIVATE_KEY` | `private_key` trong file JSON (dán nguyên văn, giữ cả `\n`) |
| `ADMIN_EMAILS` | email của bạn, vd `ban@gmail.com` (đây sẽ là tài khoản quản trị viên) |

Đặt cho cả 3 môi trường Production/Preview/Development rồi **Redeploy**.

> Lưu ý về `ADMIN_EMAILS`: tài khoản chỉ được gán quyền admin **tại thời điểm đăng ký/đăng nhập lần đầu**. Nếu bạn đã có tài khoản trước đó, hãy xoá user đó trong Firebase Console (Authentication + Firestore) rồi đăng ký lại, hoặc tự sửa field `role` thành `admin` trong Firestore console cho document `users/{uid}`.

## 4. Đẩy code lên GitHub rồi Vercel tự deploy

Repo hiện tại: `https://github.com/PhanQuocAnhVLU/Trading`. Bạn tải file zip đính kèm bên dưới, giải nén đè lên repo local, rồi:

```bash
git add -A
git commit -m "Chuyển sang dữ liệu thị trường thật + backend Firestore thật"
git push
```

Vercel sẽ tự build và deploy lại (nó đã liên kết với GitHub repo của bạn).

## 5. Kiểm tra sau khi deploy

- Mở web → **Đăng ký** tài khoản mới bằng email bạn đã set trong `ADMIN_EMAILS` → sẽ tự có quyền admin.
- Vào `/admin/login` đăng nhập bằng tài khoản đó → nếu vào được trang quản trị nghĩa là đã đúng.
- Trang **Bảng giá / Tổng quan**: giá phải khác giá demo cũ (VN-INDEX thật, không random mỗi giây).
- Nếu bảng giá báo lỗi, mở Vercel → **Deployments → Functions logs** để xem lỗi cụ thể từ `vnstock-js` (có thể do đổi mã chỉ số — xem ghi chú trong `api/_lib/vnstockClient.js`).

## Giới hạn hiện tại (thành thật với bạn)

- **Đây vẫn là tiền ảo**, không phải tiền thật — như đã thống nhất ở Tầng 2. Muốn giao dịch tiền thật, bạn cần hợp tác với một công ty chứng khoán được cấp phép (xem lại phần tư vấn trong hội thoại).
- **Khớp lệnh tức thời**: khi đặt lệnh LO, hệ thống khớp ngay tại giá thị trường thực nếu giá đặt thoả điều kiện, không có sổ lệnh chờ khớp qua thời gian như sàn thật (chưa có matching engine liên tục). Có thể nâng cấp sau nếu bạn cần.
- **Giá mở cửa (open)** không có sẵn từ nguồn dữ liệu công khai, tạm dùng giá tham chiếu để thay thế; **room khối ngoại (%)** tạm để 0% (nguồn dữ liệu miễn phí không có trường này).
- Dữ liệu tổng hợp từ các endpoint công khai của TCBS/VNDirect/SSI/DNSE (không chính thức, không cam kết SLA) — nếu một trong các nguồn đổi cấu trúc, giá có thể tạm gián đoạn cho tới khi thư viện `vnstock-js` cập nhật.
