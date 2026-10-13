# 💖 MiLove

---

## 🌟 Tính Năng Nổi Bật

1. **Loading Screen Điện Ảnh**: Vòng xoay ngân hà orbital, trái tim nhịp đập glowing, thanh tiến trình % mượt mà.
2. **Cinematic Intro**: Các dòng chữ tâm sự hiển thị theo thứ tự với hiệu ứng mờ nhòe (blur), phát sáng (glow) và xuất hiện tinh tế.
3. **Vũ Trụ 3D Three.js**: Hàng nghìn ngôi sao lấp lánh, tinh vân huyền ảo, phản ứng tương tác theo chuyển động con trỏ chuột.
4. **Phong Bì 3D Tương Tác (Interactive Envelope)**: Phong bì 3D với con dấu sáp (wax seal), hiệu ứng lắc nhẹ khi di chuột, tự động mở nắp và đẩy lá thư lên toàn màn hình.
5. **Lá Thư Typewriter & Cuộn Thông Minh**: Hiệu ứng gõ chữ từng ký tự đồng bộ âm thanh phím chân thực. Tự động cuộn theo dòng chữ gõ, tích hợp nhận diện cuộn thông minh (`isScrolledUp`) không gây giật lag và phân định vùng cuộn độc lập giữa thư và trang web.
6. **Album Kỷ Niệm 3D (Love Memory Book)**: Quyển album da 3D với hiệu ứng lật trang gập gáy chân thực (`transform-origin: left center`), bóng cuộn trang nghệ thuật, âm thanh xào giấy Web Audio API, đánh số trang thông minh (*Trang Bìa*, *Trang 1 / 8* ... *Trang 8 / 8*, *Trang Kết*) và lưu trữ trạng thái trang mở gần nhất (`localStorage`).
7. **Floating Utilities Dock**: Thanh tiện ích nổi cố định góc phải (🎵 Audio + 📖 Memory Book) phong cách Glassmorphism, tự động ẩn gọn khi mở album kỷ niệm và hiển thị tooltip khi rê chuột.
8. **Hiệu Ứng Trái Tim & Hoa Anh Đào Rơi**: 300 trái tim mây mờ cùng cánh hoa anh đào (Sakura) 3D rơi tự nhiên trên nền canvas.
9. **Sao Băng (Meteor Streaks)**: Các vệt sao băng rực rỡ lướt qua bầu trời đêm định kỳ từ 5 đến 10 giây.
10. **Bộ Sưu Tập Khoảnh Khắc (Love Gallery)**: Thẻ hình ảnh kính mờ hiệu ứng nghiêng 3D (card tilt parallax) kết hợp hiển thị giải mã ảnh bảo mật cùng bộ xem ảnh Lightbox toàn màn hình.
11. **Dòng Thời Gian Tình Yêu (Love Journey Timeline)**: Trục thời gian phát sáng dọc thân trang, hiển thị các cột mốc ý nghĩa khi cuộn trang.
12. **Đồng Hồ Đếm Thời Gian Realtime**: Bộ đếm thời gian bên nhau tính chính xác từng Ngày, Giờ, Phút, Giây.
13. **Trích Dẫn Lãng Mạn (Quotes Generator)**: Bộ sưu tập những câu nói truyền cảm hứng tình yêu kèm chuyển cảnh hiệu ứng hạt.
14. **Pháo Hoa & Bão Trái Tim (Grand Finale)**: Màn trình diễn pháo hoa canvas rực rỡ kết hợp Confetti trái tim chúc mừng khi đọc xong lá thư.
15. **Âm Thanh Hybrids (Sound Engine)**: Tự động phát nhạc nền (`sounds/background.mp3`), đồng bộ nút bấm tiện ích và hiệu ứng âm thanh. Tích hợp bộ tổng hợp âm thanh **Web Audio API Synthesizer** phát tiếng lật trang, nhấp chuột và gõ phím chân thực.
16. **Con Trỏ Phát Sáng (Custom Glowing Cursor)**: Con trỏ phát sáng với vệt hạt mịn và hiệu ứng sóng nước (ripple) khi nhấp chuột.
17. **Hệ Thống Bảo Mật & Mã Hóa Hình Ảnh Client-side (AES-256-GCM / Web Crypto API)**: Công cụ mã hóa hình ảnh offline `encrypt-tool.html`. Dữ liệu hình ảnh được mã hóa bảo mật lưu tại `js/image-data.js` và giải mã bất đồng bộ cache-first với `ImageProvider` & `ImageDecoder` thông qua Blob ObjectURL giúp tối ưu trải nghiệm và bảo mật.
18. **Chuẩn Xem Trước Link Chia Sẻ (Open Graph & Social Preview)**: Tích hợp đầy đủ thẻ meta Open Graph cho Facebook, Zalo, Messenger, iMessage với kích thước ảnh xem trước 1200x630 chuẩn sắc nét.
19. **Ngày Đặc Biệt (Special Days — "Dấu Niêm Phong Của Hôm Nay")**: Đúng vào sinh nhật, ngày kỷ niệm, Valentine, 08/03, 20/10…, ngay sau màn loading (trước "Có những lời…") hiện một con dấu sáp khắc ngày hôm đó giữa mưa tim. Chạm vào con dấu → vài lời thì thầm → một thiên hà tình yêu thu nhỏ hiện ra (đĩa xoáy phát sáng, trái tim kết từ ánh sao, ảnh kỷ niệm xoay quanh như hành tinh) cùng lời chúc trên giấy thư, có nhạc riêng nếu cấu hình. Hôm sau website trở lại bình thường. Xem mục **Ngày Đặc Biệt** bên dưới.
20. **Chia Sẻ & Mã QR**: Nút **Chia sẻ** ở khối kết "Cảm Ơn Em Vì Tất Cả" mở một cửa sổ có thẻ QR dẫn thẳng tới website, kèm các nút **Sao chép liên kết**, **Tải thẻ QR** và (trên trình duyệt hỗ trợ, thường là điện thoại) **Gửi qua ứng dụng** để mở bảng chia sẻ của máy (Zalo, Messenger, tin nhắn…). Xem mục **Mã QR Chia Sẻ** bên dưới.

---

## 📂 Cấu Trúc Project

```
milove/
│
├── index.html              # HTML5 Semantic Layout & CDN References
├── encrypt-tool.html       # Công cụ mã hóa hình ảnh offline
├── favicon.ico             # Favicon SVG Icon
├── README.md               # Hướng dẫn chi tiết project
│
├── css/
│   ├── style.css           # Token màu sắc, Glassmorphic & CSS Variables
│   ├── loading.css         # Màn hình chờ & Vòng xoay orbital
│   ├── intro.css           # Intro điện ảnh & Chữ mờ nhòe phát sáng
│   ├── galaxy.css          # Container Three.js & Tiêu đề dải ngân hà
│   ├── letter.css          # Phong bì 3D, Con dấu sáp & Giấy thư cuộn độc lập
│   ├── memory-book.css     # Album kỷ niệm 3D, Floating Utilities Dock & Controls
│   ├── special-events.css  # Ngày đặc biệt: layout chung + theme màu
│   ├── share.css           # Nút Chia sẻ ở khối kết & cửa sổ thẻ QR
│   ├── gallery.css         # Bộ sưu tập ảnh 3D & Lightbox Popup
│   ├── timeline.css        # Trục thời gian cuộn trang & Nút mốc kỷ niệm
│   ├── effects.css         # Con trỏ phát sáng, Đếm thời gian & Pháo hoa
│   └── responsive.css     # Tối ưu giao diện cho Mobile, Tablet & Desktop
│
├── js/
│   ├── app.js                    # Khởi tạo & Điều phối toàn bộ ứng dụng
│   ├── audio.js                  # Engine âm thanh (HTML5 + Web Audio Synth paper/click)
│   ├── crypto.js                 # Thuật toán mã hóa & giải mã AES-256-GCM (Web Crypto API)
│   ├── image-data.js             # Lưu trữ dữ liệu hình ảnh mã hóa
│   ├── image-decoder.js          # Khởi tạo khóa & giải mã chuỗi Base64 thành Blob ObjectURL
│   ├── image-provider.js         # Quản lý bộ nhớ tạm (Cache-first) & Preload ảnh background
│   ├── cursor.js                 # Con trỏ glowing & Hiệu ứng sóng nước
│   ├── galaxy.js                 # Engine Three.js 3D Starfield & Nebula
│   ├── hearts.js                 # Canvas particle trái tim lơ lửng
│   ├── sakura.js                 # Canvas cánh hoa anh đào rơi 3D
│   ├── meteor.js                 # Engine vệt sao băng lướt qua bầu trời
│   ├── fireworks.js              # Engine pháo hoa & Bão confetti trái tim
│   ├── loading.js                # Preloader % mượt mà
│   ├── intro.js                  # Chuỗi GSAP reveal lời dẫn Intro
│   ├── typing.js                 # Typewriter gõ chữ lá thư & Auto-scroll thông minh
│   ├── memory-book-storage.js    # Quản lý localStorage trạng thái Album
│   ├── memory-book-state.js      # Lưu trữ runtime state của Album
│   ├── memory-book-renderer.js   # Render DOM 3D Album, Bìa Trước/Sau & Preloading
│   ├── memory-book-navigation.js # Phím mũi tên, phím Esc, cử chỉ vuốt touch & button
│   ├── memory-book-animation.js  # GSAP timelines mở/đóng Album & hiệu ứng Dock
│   ├── memory-book-entry.js      # Giao diện Floating Utilities Dock (Audio + Book)
│   ├── memory-book-controller.js # Điều phối chính của Album & Tiếng lật trang
│   ├── lunar-calendar.js            # Đổi dương lịch → âm lịch Việt Nam (Tết, Trung thu)
│   ├── special-events-data.js       # ✏️ Cấu hình ngày đặc biệt (nơi duy nhất cần sửa)
│   ├── special-events-detector.js   # Nhận biết hôm nay là ngày gì (giờ máy người xem) + debug
│   ├── special-events-renderer.js   # Dựng giao diện từ cấu hình
│   ├── special-events-animation.js  # Chuỗi chuyển động GSAP (có bản reduced-motion)
│   ├── special-events-effects.js    # Hạt tim / hoa / lấp lánh / bánh kem bóng bay (1 canvas, tự hủy)
│   ├── special-events-heart.js      # Trái tim hạt sáng 3D + vòng ảnh, kéo để xoay
│   ├── special-events-controller.js # Vòng đời: khóa trang, nhạc, dọn dẹp
│   ├── share.js                  # Cửa sổ Chia sẻ: thẻ QR, sao chép link, Web Share API
│   ├── countdown.js              # Bộ đếm ngày yêu nhau realtime
│   ├── gallery.js                # Hiệu ứng card tilt 3D & Lightbox modal
│   ├── timeline.js               # ScrollTrigger xuất hiện mốc kỷ niệm
│   ├── quotes.js                 # Bộ tạo trích dẫn lãng mạn
│   └── scroll.js                 # Cuộn mượt Lenis & GSAP ScrollTrigger
│
├── assets/
│   ├── images/             # Ảnh kỷ niệm JPG, PNG nghệ thuật
│   ├── icons/              # Icon hệ thống
│   ├── fonts/              # Font chữ dự phòng
│   ├── qr-milove.png       # Thẻ QR chia sẻ (hiện trong cửa sổ Chia sẻ, dùng để gửi/in)
│   └── qr-milove.svg       # QR trơn dạng vector (bản dự phòng, trang không còn dùng)
│
├── tools/
│   └── make-qr-card.js     # Script tạo lại thẻ QR (chạy trên máy, không thuộc website)
│
└── sounds/
    ├── background.mp3      # Nhạc nền lãng mạn chính
    └── don-gian-anh-yeu-em.mp3 # Nhạc nền dự phòng
```

---

## 🚀 Cách Chạy Trực Tiếp Ở Máy Local

Website **không cần NodeJS**, **không cần npm**, **không cần build**.

1. Tải source code hoặc clone repository về máy:
   ```bash
   git clone https://github.com/ngimnee/milove.git
   ```
2. Mở trực tiếp file `index.html` bằng bất kỳ trình duyệt nào (Chrome, Edge, Safari, Firefox) hoặc dùng extension **Live Server** trong VS Code.

---

## 🖼️ Tùy Chỉnh Ảnh Preview Khi Chia Sẻ Link (Open Graph)

Để hiển thị ảnh xem trước khi gửi link qua Zalo, Messenger, Facebook, iMessage:

1. Đặt ảnh preview tại đường dẫn: `assets/images/anh-va-em-chibi.png` (Kích thước đề xuất: **1200 x 630 px**).

2. **Cách xóa cache khi ảnh preview không hiện:**
   - Facebook/Messenger: Dán link vào [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) và chọn **Scrape Again**.
   - Zalo: Dán link vào [Zalo Debugger](https://developers.zalo.me/tools/debug-sharing) và chọn **Xóa Cache**.

---

## 📲 Mã QR Chia Sẻ

Ở cuối trang, khối "Cảm Ơn Em Vì Tất Cả" có nút **Chia sẻ**. Bấm vào sẽ mở cửa sổ hiện thẻ QR `assets/qr-milove.png` cùng các nút sao chép liên kết, tải thẻ QR và (trên trình duyệt hỗ trợ) gửi qua ứng dụng. Người dùng điện thoại gửi link trực tiếp, người ngồi máy tính để người khác quét mã bằng điện thoại.

QR là mã **tĩnh**: link được mã hóa thẳng vào hình ảnh nên **không bao giờ hết hạn**. QR chỉ ngừng hoạt động khi chính đường link bị hỏng.

### Link được chia sẻ nằm ở đâu

Link chia sẻ luôn là link công khai cố định, không phụ thuộc link người xem đang mở (kể cả khi đang thử `?specialEvent=...`). Link được khai báo ở hằng `SHARE_URL` đầu file `js/share.js`:

```javascript
const SHARE_URL = 'https://ngimnee.github.io/milove/';
```

> ⚠️ Nếu đổi tên repo hoặc username GitHub, link `ngimnee.github.io/milove` đổi theo và **mọi QR cũ sẽ hỏng**. Khi đó làm lần lượt: sửa `SHARE_URL` trong `js/share.js` → tạo lại QR (các mục bên dưới) → sửa chữ địa chỉ trong thẻ (`URL_LABEL` trong `tools/make-qr-card.js`) → gửi lại QR mới cho mọi người. Muốn bền hơn, hãy gắn tên miền riêng cho GitHub Pages rồi tạo QR từ tên miền đó.

### Cách 1: Tạo QR trơn bằng một lệnh

Cần cài sẵn [Node.js](https://nodejs.org). Chạy trong thư mục dự án:

```bash
npx qrcode -t svg -o assets/qr-milove.svg -e H --margin 2 -d 2a1740 -l ffffff "https://ngimnee.github.io/milove/"
```

Muốn xuất ảnh PNG thì đổi `-t png`, đổi tên file đầu ra và thêm `-w 1024` (rộng 1024px):

```bash
npx qrcode -t png -o assets/qr-milove.png -w 1024 -e H --margin 2 -d 2a1740 -l ffffff "https://ngimnee.github.io/milove/"
```

| Tham số | Ý nghĩa |
|---|---|
| `-t svg` / `-t png` | Định dạng ảnh. SVG là vector, phóng to không vỡ, hợp để in. |
| `-o <file>` | Đường dẫn file kết quả. |
| `-w 1024` | Chiều rộng ảnh (px), chỉ dùng cho PNG. |
| `-e H` | Mức sửa lỗi cao nhất (khôi phục được ~30%), giúp QR vẫn quét được khi mờ, trầy hoặc có ảnh chèn giữa. Các mức thấp hơn: `L` 7%, `M` 15%, `Q` 25%. |
| `--margin 2` | Viền trắng quanh QR, tính theo số ô. Nên để từ 2 trở lên để máy quét nhận ra mép QR. |
| `-d 2a1740` / `-l ffffff` | Màu ô QR (đậm) / màu nền (sáng), dạng hex. Ô QR phải **đậm hơn nền nhiều**, nếu không điện thoại khó quét. |
| `"https://…"` | Nội dung được mã hóa, thay bằng link của bạn. |

> ℹ️ Trang không còn dùng `assets/qr-milove.svg` (đây là QR trơn kiểu cũ), giữ lại làm bản dự phòng.

### Cách 2: Tạo thẻ QR đẹp (bản đang dùng trên website)

`assets/qr-milove.png` là một tấm thẻ 1080 × 1316px gồm: tiêu đề "Bức Tâm Thư" chữ thư pháp, QR chấm tròn chuyển màu hồng–tím với ba góc bo tròn, ảnh khuôn mặt cắt tròn ở giữa, dòng "Quét mã để mở thư" và địa chỉ trang. Thẻ được vẽ bằng script `tools/make-qr-card.js` (script chỉ chạy trên máy bạn, **không phải một phần của website**, nên website vẫn không cần npm hay build).

**Bước 1 – Cài thư viện ra ngoài dự án** (một lần duy nhất). Cài vào thư mục tạm để dự án không bị thêm `node_modules` hay `package.json`:

```powershell
# Windows (PowerShell)
npm i --prefix "$env:TEMP\qrtool" qrcode sharp
$env:NODE_PATH = "$env:TEMP\qrtool\node_modules"
```

```bash
# macOS / Linux
npm i --prefix /tmp/qrtool qrcode sharp
export NODE_PATH=/tmp/qrtool/node_modules
```

(`$env:NODE_PATH` / `export NODE_PATH` chỉ có tác dụng trong cửa sổ terminal đang mở. Mở terminal mới thì đặt lại biến này.)

**Bước 2 – Chạy script** trong thư mục dự án:

```bash
node tools/make-qr-card.js
```

Chạy không tham số sẽ tạo lại đúng `assets/qr-milove.png` cho `https://ngimnee.github.io/milove/`. Muốn đổi link, ảnh ở giữa hoặc nơi lưu, truyền tham số theo thứ tự:

```bash
node tools/make-qr-card.js "<link>" "<ảnh giữa>" "<file xuất>"
# ví dụ
node tools/make-qr-card.js "https://ten-mien-cua-ban.vn/" ./assets/images/anh-va-em-chibi.png ./assets/qr-milove.png
```

**Bước 3 – Chỉnh nội dung thẻ** (tùy chọn): mở `tools/make-qr-card.js`, sửa các hằng ở đầu file:

| Hằng | Việc |
|---|---|
| `TITLE`, `SUBTITLE`, `CAPTION`, `URL_LABEL` | Chữ trên thẻ: tiêu đề, dòng phụ, dòng "Quét mã…", địa chỉ trang. |
| `PHOTO_CROP` | Vùng cắt vuông (`left`, `top`, `width`, `height`, tính bằng px của ảnh gốc) quanh khuôn mặt. Đổi ảnh khác thì chỉnh số này cho khuôn mặt nằm giữa. |
| `PHOTO_SIZE` | Kích thước ảnh tròn ở giữa QR. Đừng làm quá lớn (xem lưu ý bên dưới). |
| `FONT_TITLE`, `FONT_DISPLAY`, `FONT_TEXT` | Font chữ của tiêu đề và các dòng chữ. |

Màu sắc (nền, mảng màu, gradient ô QR, vòng viền ảnh) nằm trong khối `<defs>` của chuỗi SVG trong cùng file.

**Lưu ý khi chỉnh để QR vẫn quét được**
- Giữ mức sửa lỗi `H` và để ảnh ở giữa (tính cả vòng viền trắng) che dưới khoảng 15% diện tích mã (hiện khoảng 9%). Muốn ảnh to hơn thì phải tăng `CLEAR_RADIUS` tương ứng và kiểm tra lại bằng cách quét thử.
- Giữ ô QR đậm trên nền trắng (panel trắng quanh QR là có chủ ý), đừng đổi sang QR sáng trên nền tối vì nhiều ứng dụng quét không đọc được.
- Chấm tròn đang có bán kính `0.52` ô để các chấm chạm nhau. Làm chấm nhỏ hơn hoặc đổi sang hình khác (ví dụ trái tim) có thể khiến một số máy quét đọc kém, nếu đổi thì phải thử lại.
- Tiêu đề dùng font **Lucida Calligraphy**, các dòng còn lại dùng **Segoe UI Variable**, đều có sẵn trên Windows. Trên máy không có font này, chữ sẽ rơi về font dự phòng và nhìn khác đi. Chọn font khác nên thử có đủ dấu tiếng Việt (nhất là `ư`, `ứ`), vì font thiếu glyph sẽ bị thay bằng chữ khác kiểu.

### Kiểm tra QR trước khi gửi / in

1. Mở thẻ QR rồi quét bằng **camera điện thoại thật**, xác nhận mở đúng trang (nên thử cả iPhone và Android nếu có).
2. Thử quét ở nhiều khoảng cách và khi ảnh đang thu nhỏ trên màn hình.
3. Khi in, nên in tối thiểu khoảng **3 × 3 cm** cho riêng ô QR, dùng file có độ phân giải cao hoặc SVG.
4. Sau khi push lên GitHub Pages, quét lại một lần nữa trên bản đã deploy.

### Lưu ý quan trọng

- **Tránh dịch vụ QR "động" (dynamic)** của các trang tạo QR miễn phí: bản dùng thử thường hết hạn và bắt trả phí, khi đó QR trỏ qua link trung gian của họ và sẽ ngừng hoạt động. Cách trong mục này tạo QR tĩnh ngay trên máy bạn nên không bị vấn đề đó.
- Cửa sổ Chia sẻ lấy ảnh từ `assets/qr-milove.png`. Nếu đổi tên file, nhớ sửa lại hai chỗ trong `index.html` (ảnh hiển thị `.share-card-img` và nút **Tải thẻ QR**).

---

## ✏️ Hướng Dẫn Tùy Chỉnh Nội Dung

### 1. Thay Đổi Nội Dung Lá Thư & Chữ Ký
Mở file `js/typing.js`, thay đổi nội dung biến `LETTER_CONTENT` và `SIGNATURE`:
```javascript
const LETTER_CONTENT = `Gửi em, người con gái đã làm thay đổi cả thế giới của anh...

[Nhập nội dung tâm sự của bạn ở đây]`;

const SIGNATURE = "Mãi yêu em ❤️";
```

### 2. Thay Đổi Nội Dung & Ảnh Trong Album Kỷ Niệm
Mở file `js/memory-book-renderer.js`, cập nhật danh sách `PAGES_DATA`:
```javascript
const PAGES_DATA = [
  { type: 'cover-front', title: 'MiLove', subtitle: 'Album Kỷ Niệm Tình Yêu' },
  { type: 'memory', title: 'Khoảnh Khắc Đầu Tiên', date: '17 Tháng 03', image: './assets/images/khoanh-khac-dau-tien.png', description: '...' },
  // Thêm các trang kỷ niệm tùy thích...
  { type: 'cover-back', title: 'Trái Tim Anh Luôn Có Em', subtitle: 'Cảm Ơn Em Vì Tất Cả' }
];
```

### 3. Thay Đổi Ngày Bắt Đầu Yêu Nhau (Đồng Hồ Đếm)
Mở file `js/countdown.js`, thay đổi biến `START_DATE`:
```javascript
const START_DATE = new Date('2023-02-14T00:00:00');
```

### 4. Mã Hóa & Cập Nhật Hình Ảnh Mới (`encrypt-tool.html`)
Website hỗ trợ công cụ mã hóa ảnh **AES-256-GCM** hoàn toàn offline:
1. Mở file `encrypt-tool.html` bằng trình duyệt web.
2. Cấu hình / Nhập **Khóa Mã Hóa (AES Secret Key)**.
3. Chọn/kéo thả các file ảnh kỷ niệm mới cần cập nhật.
4. Xuất file `image-data.js` và chép đè vào thư mục `js/image-data.js` của dự án.

---

## 🎁 Ngày Đặc Biệt (Special Days)

Mỗi ngày đặc biệt là một "chương" chỉ mở **đúng ngày đó theo giờ trên máy người xem** (không lưu trạng thái, không cần server). Thứ tự: Loading → **Ngày đặc biệt** → "Có những lời…" → phong thư. Ngày thường website chạy y như cũ. Nếu nhiều sự kiện trùng ngày, sự kiện có `priority` cao nhất được chọn (sinh nhật 100 > mốc ngày yêu 90 > kỷ niệm 80 > tuỳ chỉnh 60 > ngày lễ 40).

Vì trình duyệt chỉ cho phát nhạc sau khi người xem tương tác, trải nghiệm mở đầu bằng con dấu "Chạm vào con dấu để mở món quà" — cú chạm đó vừa là khoảnh khắc mở quà vừa bật nhạc.

Mọi thứ chỉnh ở **một file**: `js/special-events-data.js`. Nếu lỡ gõ sai cú pháp trong file này, website vẫn chạy bình thường (chỉ bỏ qua ngày đặc biệt) và Console sẽ báo lỗi.

**Sinh nhật** — điền tháng/ngày ở đầu file (để `null` là tắt):
```javascript
const BIRTHDAY_EM  = { month: 1, day: 2 };
const BIRTHDAY_ANH = { month: 1, day: 2 };
```

**Ngày kỷ niệm** tự lấy từ `START_DATE` trong `js/countdown.js` (bộ đếm ngày yêu), không cần nhập lại. Trong chữ có thể dùng `{years}` → số năm bên nhau.

**Mốc ngày yêu** (`love-days`) — hiện vào đúng ngày thứ 100, 200, 300, 365, 500, 1000, 1500, 2000, 2500, 3000, 3650, 4000, 5000, 7000, 10000 kể từ `START_DATE`, đếm y như bộ đếm trên trang (ngày yêu nhau là ngày 0). Sửa danh sách `milestones` trong `LOVE_DAYS` để thêm/bớt mốc; trong chữ dùng `{days}` (tự định dạng 1.000, 2.000…). Mốc 365 trùng đúng kỷ niệm 1 năm nên hôm đó hiện trải nghiệm mốc ngày (ưu tiên 90 > kỷ niệm 80).

**Ngày âm lịch** — `date: { lunar: { month: 8, day: 15 } }` (lặp lại mỗi năm). Đang dùng cho Tết Nguyên Đán (mùng 1 tháng Giêng) và Rằm Trung thu; thêm ngày âm khác chỉ cần đổi tháng/ngày. Đổi âm ↔ dương theo lịch Việt Nam (UTC+7) trong `js/lunar-calendar.js`; tháng nhuận không tính. Thử nhanh bằng `?specialDate=2027-02-06` hoặc `?specialEvent=mid-autumn`.

**Thêm sự kiện mới** — thêm một object vào `events`:
```javascript
{
  id: 'first-date',
  priority: PRIORITY.CUSTOM,
  date: { since: new Date(2026, 2, 17) },   // hoặc { month: 12, day: 24 } / { year: 2027, month: 1, day: 1 }
  theme: 'cosmos',                          // rose | rosegold | aurora | cosmos | blossom | lilac
  particles: ['hearts', 'sparkles'],        // một hoặc nhiều: hearts | petals | sparkles | birthday (bánh kem, bóng bay, hộp quà)
  burst: 'hearts',                          // bùng lúc con dấu vỡ: fireworks | hearts | null
  feature: PHOTOS.toTinh,                              // ảnh nổi bật của ngày (tuỳ chọn, bỏ dòng này nếu không cần)
  images: featuring(PHOTOS.lanDauGap, PHOTOS.hoTay),   // 2 ảnh này trước, rồi mọi ảnh còn lại
  duration: 135000,                         // ms trước khi tự sang phần tiếp (null = chờ bấm)
  music: null,
  content: {
    gate: 'Hôm nay là ngày mình hẹn hò lần đầu…',   // dòng chữ trên con dấu
    label: 'Buổi hẹn đầu tiên',
    prelude: ['Câu thì thầm thứ nhất…'],
    title: '…',
    message: 'Dòng 1\nDòng 2'
  }
}
```

**Trái tim & ảnh** — trái tim lơ lửng làm từ hàng nghìn hạt sáng hồng đỏ (vỏ phồng hai mặt, lấp lánh, vệt sáng chạy dọc viền, tia lửa toả ra từ mép, hai vòng sáng dưới mũi tim, nhịp đập nhẹ) trên đĩa xoáy nhiều dải màu. Lúc mở, 8 ảnh lần lượt bay ra từ trái tim, kéo theo vệt sáng và đáp xuống mép đĩa với một gợn sóng sáng; mỗi ảnh đứng trên một vòng sáng nhỏ, xếp đều và thò ra / nằm trên rìa / thụt vào theo nhịp ba (không thành hình vuông khi nhìn từ trên xuống). Ảnh gần người xem nhất được làm nổi bật: to hơn, nhấc lên, sáng hơn, có tia sáng và hiện chú thích, rồi chuyển dần sang ảnh kế tiếp khi bàn xoay quay. Tim, đĩa và vòng ảnh nằm chung một bàn xoay: tự quay chậm 360° quanh trục dọc, kéo ngang (chuột hoặc vuốt) để xoay tay, thả ra sẽ trôi rồi quay tiếp; vuốt dọc vẫn cuộn trang. Người dùng bật "giảm chuyển động" thấy một khung hình đứng yên, chỉ xoay khi tự kéo. Code: `js/special-events-heart.js`.

**Ảnh nổi bật của ngày (`feature`)** — mỗi sự kiện đặt được một ảnh riêng để làm nổi ngày đó (sinh nhật em → "Anh & em", kỷ niệm → "Ngày tỏ tình", …). Ảnh được cắt theo hình trái tim và là phần thân của tim: ngả sang tông hồng của tim, tối dần ra mép, xoay và đập đúng cùng tim (nhìn nghiêng thì mỏng lại, nhìn từ phía sau vẫn đúng chiều); lớp hạt sáng bao quanh, và các hạt sáng nằm phía trước ảnh được làm mờ thành một lớp mỏng (chỉ còn vài hạt lấp lánh) để thấy trọn ảnh mà ánh sáng của tim vẫn chạy trên đó, nên ảnh và tim là một. Ảnh hiện dần ngay sau khi 8 ảnh trên vòng đáp xuống, không có chú thích, và tự bị loại khỏi vòng để không lặp. Đổi ảnh: sửa `feature: PHOTOS.<tên>` hoặc `{ src, caption }` trong `js/special-events-data.js`; `feature: null` (hoặc bỏ dòng) thì không có. Chỉnh độ lớn của ảnh trong tim: `HERO.fill` trong `js/special-events-heart.js`.

**Thời lượng** — theo độ dài nhạc: sinh nhật giữ nguyên bản 44 giây (`duration: 41000`), nhạc dài hơn ~50 giây thì chỉ phát tối đa ~55 giây rồi tự chuyển, không cần cắt file (`vay-cuoi.mp3` dài 1 phút 29, `duration: 55000`); mặc định ngày không có nhạc riêng 45 giây. Tự chuyển sang phần tiếp ngay trước khi hết nhạc, nhạc nhỏ dần rồi nhạc nền quay lại. Chạm/cuộn vào thiệp thì không tự đóng nữa. Lúc nào cũng có thể bấm **Bỏ qua** hoặc **Tâm Thư →**.

**Ảnh**: Ảnh dùng chung khai báo một lần trong `PHOTOS` (key trong `js/image-data.js` + chú thích viết tay dưới ảnh). Ảnh mới có thể là file thường, nên là WebP ~1200px: `{ src: './assets/special-events/valentine/photo.webp', caption: 'Hà Nội' }`. Ảnh lỗi/thiếu chỉ để lại khung trống, không làm hỏng trang.

**Nhạc riêng** — đặt file vào `assets/special-events/<id>/music.mp3` rồi khai báo `music: { src: './assets/special-events/<id>/music.mp3', volume: 0.6 }`. Nhạc nền nhỏ dần → nhạc riêng → khi kết thúc nhạc nền quay lại đúng đoạn đang phát. `music: null` thì giữ nhạc nền. File lỗi/thiếu → tự quay về nhạc nền, không lỗi.

> **Sinh nhật & kỷ niệm đã có nhạc riêng**: `./sounds/happy-birthday.mp3` và `./sounds/vay-cuoi.mp3` (đặt cạnh `background.mp3` có sẵn). Nếu đổi tên/vị trí file thì nhớ sửa lại đường dẫn `music.src` tương ứng trong `js/special-events-data.js`.

> Luôn dùng đường dẫn tương đối bắt đầu bằng `./` để chạy đúng cả local lẫn `https://ngimnee.github.io/milove/`.

**Test không cần chờ đúng ngày** (chỉ có tác dụng khi thêm vào URL, không lưu lại):
- `?specialEvent=valentine` — mở thẳng một sự kiện theo `id` (kể cả khi chưa điền ngày).
- `?specialDate=2027-05-08` (hoặc `05-08`) — giả lập hôm nay là ngày đó, chạy đúng logic nhận diện + priority.

Ví dụ: `index.html?specialEvent=birthday-em`, hoặc sau khi deploy: `https://ngimnee.github.io/milove/?specialDate=02-14`.

**Deploy**: chỉ cần commit & push như bình thường, GitHub Pages phục vụ file tĩnh, không có bước build.

---

## 🛠️ Công Nghệ Sử Dụng

- **HTML5 & CSS3**: Glassmorphism, 3D Transforms (`perspective`, `transform-origin`), CSS Gradients, Flexbox/Grid, Keyframe Animations.
- **JavaScript (ES6+)**: Modular IIFE Pattern, Web Audio API Synthesizer (phát âm thanh lật trang & gõ phím).
- **Web Crypto API (AES-256-GCM)**: Hệ thống mã hóa & giải mã hình ảnh client-side an toàn, hiệu năng cao.
- **Three.js (r128)**: 3D Particle Starfield & Nebula Shader Scene.
- **GSAP 3**: Smooth Open/Close Timelines & Dynamic Dock Reveal.
- **Canvas Confetti**: Celebration Heart Burst Launcher.
- **Font Awesome 6 & Google Fonts**: Cinzel, Dancing Script, Playfair Display, Be Vietnam Pro.

---

## 📄 Giấy Phép (License)

Dự án được phát triển bởi [ngimnee]. Vui lòng không sao chép, chỉnh sửa hoặc sử dụng lại dưới bất kỳ hình thức nào khi chưa có sự cho phép của tác giả.
