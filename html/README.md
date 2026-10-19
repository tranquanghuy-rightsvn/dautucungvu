# Đầu tư cùng Vũ: website tĩnh (HTML/CSS/JS)

Không cần build. Chạy thử:

```bash
python3 -m http.server 5173
# mở http://127.0.0.1:5173
```

## Các trang

| Trang | URL | File gốc (sửa ở đây) |
|---|---|---|
| Trang chủ | `/` | `index.html` |
| Khóa học (video, miễn phí / có phí) | `/khoa-hoc/` | `khoa-hoc/index.html` |
| Mở tài khoản / chuyển ID | `/mo-tai-khoan/` | `mo-tai-khoan/index.html` |
| Tin tức (lọc theo mã, chủ đề, từ khóa) | `/tin-tuc/` | `tin-tuc/index.html` |
| Đọc bài viết | `/bai-viet/<slug>/` | sinh từ `scripts/article-template.html` + `news` trong `data.js` |
| Gói hội viên | `/premium/` | `premium/index.html` |
| Thanh toán QR | `/thanh-toan/?goi=3` hoặc `?khoa=<id>` | `thanh-toan/index.html` |
| Tổng quan (sau đăng nhập) | `/dashboard/` | `dashboard/index.html` |

URL chuẩn của mỗi trang là `/slug/` (file `slug/index.html`). Mọi link trong site đều có dấu `/` cuối nên Cloudflare phục vụ thẳng, không phải redirect.

Tiêu đề, mô tả, canonical, Open Graph, JSON-LD của từng trang, `robots.txt` và `sitemap.xml` sinh từ `scripts/seo.py` (domain `https://dautucungvu.com`). **Sửa tiêu đề / mô tả trong file đó rồi chạy `python3 scripts/seo.py`**.

## Sửa nội dung: chỉ cần `assets/js/data.js`

| Muốn sửa | Mục trong `data.js` |
|---|---|
| Số điện thoại, link Zalo, mạng xã hội | `site.contact` |
| Câu ưu đãi 50 triệu, slogan | `site.offerTitle`, `site.offerText`, `site.slogan` |
| Tài khoản nhận tiền / mã QR | `site.payment` (điền `bankId` + `accountNo` + `accountName` để QR tự có số tiền và nội dung, hoặc đặt ảnh QR vào `assets/img/` rồi ghi vào `qrImage`) |
| Giá hội viên, các mức tháng | `site.membership` (mặc định 68.000đ, 1/3/6/12 tháng) |
| Video hướng dẫn mở tài khoản, chuyển ID | `site.videos`, hoặc riêng từng công ty: `brokers[].openVideo`, `transferVideo` |
| Link mở tài khoản, mã giới thiệu, mã môi giới của từng công ty | `brokers[].openUrl`, `refCode`, `transferUrl`, `transferCode` |
| Khóa học: tên, mô tả, giá, bài học, link video | `courses` (`price: 0` là miễn phí, `preview: true` cho học thử) |
| Bài viết (`slug` = đường dẫn), thẻ (mã CP + chủ đề), quyền xem | `news`, xong chạy `python3 scripts/seo.py` |
| Danh sách chủ đề tin và từ khóa tìm kiếm | `newsTags` |

Video: dán link YouTube hoặc mã video. Để trống thì trang hiện khung "Video sẽ được cập nhật sớm".

### Quyền xem (`access`)

| Giá trị | Ai xem được |
|---|---|
| `public` | Tất cả |
| `user` | Đã đăng nhập |
| `member` | Hội viên còn hạn, hoặc tài khoản 50 triệu |
| `vip` | Chỉ tài khoản mở / chuyển ID 50 triệu |

Khóa có phí: người đã mua khóa đó hoặc tài khoản 50 triệu. Hội viên hết hạn tự về thành viên thường.

Để xem thử giao diện theo từng vai trò: bấm **Đăng nhập** rồi chọn một nút trong mục "Xem thử theo vai trò".

## Cấu trúc

```
assets/
  css/core.css      tokens, header, footer, nút, thẻ, video, giá, nhãn quyền
  css/pages.css     style riêng từng trang
  js/data.js        CẤU HÌNH + DỮ LIỆU (sửa ở đây)
  js/ui.js          header/footer, đăng nhập & phân quyền (giả lập), hộp mở khóa, video, biểu đồ SVG
  js/pages/*.js     logic từng trang
  img/vu.jpg        ảnh đại diện (hero), vu-128.jpg (logo, favicon)
scripts/seo.py          sinh khối SEO trong <head>, trang bai-viet/<slug>/, robots.txt, sitemap.xml
scripts/article-template.html   khung trang bài viết
```

## Phải làm trước khi chạy thật

Hiện là website tĩnh, chưa có máy chủ. Các phần sau mới chỉ chạy ở trình duyệt để demo:

- **Đăng nhập & phân quyền** lưu trong trình duyệt (`localStorage`), người dùng có thể tự sửa. Nội dung trả phí (bài viết, link video) phải được máy chủ kiểm tra quyền trước khi trả về; hiện tại nội dung nằm sẵn trong `data.js` nên ai xem mã nguồn cũng đọc được.
- **Thanh toán**: bấm "Tôi đã chuyển khoản" chỉ ghi đơn vào trình duyệt người mua. Cần một nơi lưu đơn (backend, Google Sheet, Firebase...) để Vũ xem, xác nhận và kích hoạt hội viên / khóa học cho đúng tài khoản, tính thời hạn từ ngày kích hoạt.
- **Tài khoản 50 triệu**: việc kiểm tra mở tài khoản / chuyển ID, mức vốn và thu hồi quyền là thủ công; cần trang quản trị để bật / tắt quyền `vip` cho từng người.
- **Dữ liệu thị trường** (chỉ số, giá cổ phiếu) là dữ liệu minh họa, cần API thật.
- **Logo công ty chứng khoán** đang hiển thị dạng chữ; dùng logo thật cần thỏa thuận với từng công ty.
