# 💖 Bức Tâm Thư — Romantic & Cinematic Web Experience

Website hoạt động hoàn toàn **Client-side (Static Site)**, có thể đưa trực tiếp lên **GitHub Pages** và truy cập ngay mà không cần NodeJS, build tool, server hay database.

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
10. **Bộ Sưu Tập Khoảnh Khắc (Love Gallery)**: Thẻ hình ảnh kính mờ hiệu ứng nghiêng 3D (card tilt parallax) kèm bộ xem ảnh Lightbox toàn màn hình.
11. **Dòng Thời Gian Tình Yêu (Love Journey Timeline)**: Trục thời gian phát sáng dọc thân trang, hiển thị các cột mốc ý nghĩa khi cuộn trang.
12. **Đồng Hồ Đếm Thời Gian Realtime**: Bộ đếm thời gian bên nhau tính chính xác từng Ngày, Giờ, Phút, Giây.
13. **Trích Dẫn Lãng Mạn (Quotes Generator)**: Bộ sưu tập những câu nói truyền cảm hứng tình yêu kèm chuyển cảnh hiệu ứng hạt.
14. **Pháo Hoa & Bão Trái Tim (Grand Finale)**: Màn trình diễn pháo hoa canvas rực rỡ kết hợp Confetti trái tim chúc mừng khi đọc xong lá thư.
15. **Âm Thanh Hybrids (Sound Engine)**: Tự động phát nhạc nền (`sounds/background.mp3`), đồng bộ nút bấm tiện ích và hiệu ứng âm thanh. Tích hợp bộ tổng hợp âm thanh **Web Audio API Synthesizer** phát tiếng lật trang, nhấp chuột và gõ phím chân thực.
16. **Con Trỏ Phát Sáng (Custom Glowing Cursor)**: Con trỏ phát sáng với vệt hạt mịn và hiệu ứng sóng nước (ripple) khi nhấp chuột.

---

## 📂 Cấu Trúc Project

```
milove/
│
├── index.html              # HTML5 Semantic Layout & CDN References
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
│   ├── gallery.css         # Bộ sưu tập ảnh 3D & Lightbox Popup
│   ├── timeline.css        # Trục thời gian cuộn trang & Nút mốc kỷ niệm
│   ├── effects.css         # Con trỏ phát sáng, Đếm thời gian & Pháo hoa
│   └── responsive.css     # Tối ưu giao diện cho Mobile, Tablet & Desktop
│
├── js/
│   ├── app.js                    # Khởi tạo & Điều phối toàn bộ ứng dụng
│   ├── audio.js                  # Engine âm thanh (HTML5 + Web Audio Synth paper/click)
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
│   ├── countdown.js              # Bộ đếm ngày yêu nhau realtime
│   ├── gallery.js                # Hiệu ứng card tilt 3D & Lightbox modal
│   ├── timeline.js               # ScrollTrigger xuất hiện mốc kỷ niệm
│   ├── quotes.js                 # Bộ tạo trích dẫn lãng mạn
│   └── scroll.js                 # Cuộn mượt Lenis & GSAP ScrollTrigger
│
├── assets/
│   ├── images/             # Ảnh kỷ niệm JPG, PNG nghệ thuật
│   ├── icons/              # Icon hệ thống
│   └── fonts/              # Font chữ dự phòng
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

## 🌐 Cách Deploy Lên GitHub Pages (Miễn Phí 100%)

Website sử dụng **100% đường dẫn tương đối** (`./css/style.css`, `./sounds/background.mp3`), đảm bảo hoạt động hoàn hảo ngay sau khi bật GitHub Pages:

1. Đăng nhập vào tài khoản [GitHub](https://github.com).
2. Tạo một Repository mới (ví dụ tên: `milove`).
3. Push toàn bộ source code trong thư mục lên Repository:
   ```bash
   git init
   git add .
   git commit -m "First commit"
   git branch -M main
   git remote add origin https://github.com/ngimnee/milove.git
   git push -u origin main
   ```
4. Trên GitHub, truy cập vào **Settings** của Repository -> Chọn **Pages** (ở cột bên trái).
5. Tại mục **Build and deployment**:
   - **Source**: Chọn `Deploy from a branch`.
   - **Branch**: Chọn `main` / Thư mục `/ (root)`.
   - Nhấn **Save**.
6. Sau 1 - 2 phút, website của bạn sẽ hoạt động tại đường dẫn:
   ```
   https://ngimnee.github.io/milove/
   ```

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

---

## 🛠️ Công Nghệ Sử Dụng

- **HTML5 & CSS3**: Glassmorphism, 3D Transforms (`perspective`, `transform-origin`), CSS Gradients, Flexbox/Grid, Keyframe Animations.
- **JavaScript (ES6+)**: Modular IIFE Pattern, Web Audio API Synthesizer (phát âm thanh lật trang & gõ phím).
- **Three.js (r128)**: 3D Particle Starfield & Nebula Shader Scene.
- **GSAP 3**: Smooth Open/Close Timelines & Dynamic Dock Reveal.
- **Canvas Confetti**: Celebration Heart Burst Launcher.
- **Font Awesome 6 & Google Fonts**: Cinzel, Dancing Script, Playfair Display, Be Vietnam Pro.

---

## 📄 Giấy Phép (License)

Dự án được phát triển bởi [ngimnee]. Vui lòng không sao chép, chỉnh sửa hoặc sử dụng lại dưới bất kỳ hình thức nào khi chưa có sự cho phép của tác giả.
