/* --------------------------------------------------------------------------
   SPECIAL DAYS - DATA (nơi duy nhất cần chỉnh)
   Mỗi object trong `events` là một "chương" chỉ mở đúng ngày của nó, ngay sau màn loading và trước lời dẫn "Có những lời...".
   Thêm ngày mới = thêm một object, không cần sửa code ở file khác.

   date:
     { lunar: { month: 8, day: 15 } }     → ngày âm lịch (Việt Nam), lặp lại mỗi năm
     { daysSince: date, milestones: [365, 1000] } → đúng ngày thứ N kể từ `date` (dùng {days} trong chữ)
     { month: 2, day: 14 }                → lặp lại mỗi năm
     { year: 2027, month: 1, day: 1 }     → chỉ đúng ngày đó
     { since: new Date(2026, 2, 17) }     → mỗi năm kể từ năm sau; dùng {years} (1) hoặc {years2} (01) trong chữ
     null                                 → chưa cấu hình, event tự tắt
   images: ảnh thò ra thụt vào dọc mép đĩa, xoay cùng trái tim (tối đa 8).
           featuring(A, B) = A, B trước rồi tới mọi ảnh còn lại trong PHOTOS.
           Dùng PHOTOS bên dưới, hoặc { src: './assets/special-events/<id>/photo.webp', caption: '...' }.
           src là key trong js/encrypted-special-data.js hoặc js/encrypted-data.js (ảnh đã mã hóa) hoặc đường dẫn tương đối.
   feature: ảnh nổi bật của ngày đó (tuỳ chọn): ảnh được cắt theo hình trái tim, là phần thân của tim:
            xoay, đập và sáng cùng tim (hiện dần ngay sau khi các ảnh trên vòng đáp xuống), không có chú thích. Dùng PHOTOS hoặc { src, caption }.
            Ảnh này không lặp lại trên vòng. null = không có.
   music:  null (giữ nhạc nền) hoặc { src: './assets/special-events/<id>/music.mp3', volume: 0.6 }
   theme:  rose | rosegold | aurora | cosmos | blossom | lilac  (css/special-events.css)
   particles: một hoặc nhiều trong hearts | petals | sparkles | birthday (bánh kem, bóng bay, hộp quà)      burst: fireworks | hearts | null
   duration: ms sau khi mở con dấu trước khi tự tiếp tục (null = chờ người xem bấm).
             Có nhạc riêng thì đặt = độ dài file trừ ~3 giây (để nhạc kịp nhỏ dần rồi chuyển
             về nhạc nền). Nhạc ngắn hơn ~50 giây thì giữ nguyên độ dài; dài hơn thì đặt tối đa
             ~55000 (không cần cắt file: tới lúc đó nhạc tự nhỏ dần rồi chuyển về màn hình chính).
             Nếu có chạm/kéo/cuộn thì thiệp ở lại thêm 10 giây sau thời lượng này rồi mới tự đóng.
             Luôn có nút Bỏ qua / Tâm Thư.
   priority: trùng ngày thì event có priority cao nhất được chọn
   -------------------------------------------------------------------------- */

const SpecialEventsData = (function () {
  'use strict';

  // Chỉ cần tháng/ngày. Để null tới khi điền ngày thật, ví dụ: { month: 10, day: 20 }
  const BIRTHDAY_EM = { month: 12, day: 27 };
  const BIRTHDAY_ANH = { month: 1, day: 22 };
  const VALENTINE = { month: 2, day: 14 };
  const WOMENS_DAY = { month: 3, day: 8 };
  const VIETNAMESE_WOMENS_DAY = { month: 10, day: 20 };
  const CHILDRENS_DAY = { month: 6, day: 1 };
  const ANNIVERSARY = { since: CountdownEngine.getStartDate() };  // Ngày yêu nhau dùng chung với bộ đếm thời gian (START_DATE trong js/countdown.js)
  const NEW_YEAR = { month: 1, day: 1 };
  const LUNAR_NEW_YEAR = { lunar: { month: 1, day: 1 } };      // mùng 1 Tết (âm lịch)
  const MID_AUTUMN = { lunar: { month: 8, day: 15 } };         // Rằm Trung thu (âm lịch)
  // Các mốc ngày yêu, đếm từ ngày yêu nhau y như bộ đếm trên trang (ngày yêu nhau = ngày 0).
  const LOVE_DAYS = {
    daysSince: CountdownEngine.getStartDate(),
    milestones: [200, 500, 1000, 1500, 2000, 2500, 3000, 3650, 4000, 5000, 6000, 10000]
  };

  const PRIORITY = {
    BIRTHDAY: 100,
    MILESTONE: 90,
    ANNIVERSARY: 80,
    CUSTOM: 60,
    HOLIDAY: 40
  };

  // Ảnh dùng chung cho mọi dịp (key trong js/encrypted-special-data.js hoặc js/encrypted-data.js + chú thích viết tay dưới ảnh)
  const PHOTOS = {
    anhVaEm: { src: 'anh-va-em-chibi', caption: 'Anh & em' },
    lanDauGap: { src: 'khoanh-khac-dau-tien', caption: 'Lần đầu gặp' },
    hoTay: { src: 'ho-tay-voi-em', caption: 'Hồ Tây với em' },
    boHoaDau: { src: 'bo-hoa-dau-tien', caption: 'Bó hoa đầu tiên' },
    thaiBinh: { src: 'date-cung-thai-binh', caption: 'Thái Bình' },
    toTinh: { src: 'bo-hoa-to-tinh', caption: 'Ngày tỏ tình' },
    cafeDatSet: { src: 'cafe-dat-set', caption: 'Cafe & đất sét' },
    noiXa: { src: 'loi-yeu-noi-xa-nho', caption: 'Nơi xa nhớ em' },
    duLich: { src: 'du-lich-nibi', caption: 'Chuyến đi đầu tiên' }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // IMAGES: mỗi ảnh khai báo MỘT lần, tên gọi mô tả nội dung ảnh (em = ảnh em, anh = ảnh anh, hai-dua = ảnh hai đứa).
  //   src   = key trong js/encrypted-special-data.js hoặc js/encrypted-data.js (cùng tên, ghi chú ngày dùng nằm ngay trên mỗi ảnh ở file đó)
  //   focus = [x, y] tâm chủ thể trong ảnh, từ 0 đến 1 (x: trái→phải, y: trên→dưới). Khi ảnh bị cắt cho vừa
  //           hình tròn hoặc hình trái tim, khung cắt luôn ôm quanh điểm này nên mặt/người không bị cắt mất.
  //   (không có caption nên không hiện chữ dưới ảnh; muốn có thì thêm caption: '...')
  //
  // DAY_PHOTOS: bộ ảnh của TỪNG NGÀY. feature = ảnh trong thân trái tim, ring = 8 ảnh xoay quanh (theo thứ tự).
  // ══════════════════════════════════════════════════════════════════════════
  const IMAGES = {
    // ── Ảnh của em ──
    // Em đeo kính tròn, selfie cận mặt, anh áp sát phía sau
    emDeoKinhSelfieOmAnh: { src: 'em-deo-kinh-selfie-om-anh', focus: [0.5, 0.5] },
    // Bó hoa hồng sophia ngày tỏ tình, em ôm hoa (ảnh đã có sẵn trong album)
    boHoaToTinh: { src: 'bo-hoa-to-tinh', focus: [0.5, 0.5] },
    // Em trong studio, nền nâu có các ngôi sao xanh, đặt ngón tay lên môi
    emStudioNenSaoChamMoi: { src: 'em-studio-nen-sao-cham-moi', focus: [0.5, 0.45] },
    // Em selfie, ôm bó hoa cẩm chướng hồng
    emSelfieBoHoaCamChuong: { src: 'em-selfie-bo-hoa-cam-chuong', focus: [0.5, 0.32] },
    // Em đứng nghiêng cạnh bức tường phủ lá xanh, ôm bó hoa hồng (lần chụp 1)
    emTuongLaBoHoaHongLan1: { src: 'em-tuong-la-bo-hoa-hong-lan-1', focus: [0.55, 0.55] },
    // Em trong studio nền nâu có sao xanh, chụm hai ngón tay trước ngực
    emStudioNenSaoChiHaiNgonTay: { src: 'em-studio-nen-sao-chi-hai-ngon-tay', focus: [0.5, 0.5] },
    // Em mặc blazer đen, ngồi cạnh bàn gỗ ở quán cafe ngoài trời buổi tối
    emCafeDemBlazerDenBanGo: { src: 'em-cafe-dem-blazer-den-ban-go', focus: [0.5, 0.5] },
    // Em selfie với sticker Doraemon, đang uống trà sữa
    emSelfieStickerDoraemon: { src: 'em-selfie-sticker-doraemon', focus: [0.5, 0.45] },
    // Em mặc áo xanh ngọc, ngồi bên bàn cafe có nắng
    emAoXanhNgocCafeNang: { src: 'em-ao-xanh-ngoc-cafe-nang', focus: [0.52, 0.5] },
    // Em mặc váy trắng, ngồi cạnh kệ gốm và hoa nhiều màu
    emVayTrangGocGomHoa: { src: 'em-vay-trang-goc-gom-hoa', focus: [0.55, 0.5] },
    // Em đứng nghiêng cạnh bức tường phủ lá xanh, ôm bó hoa hồng (lần chụp 2)
    emTuongLaBoHoaHongLan2: { src: 'em-tuong-la-bo-hoa-hong-lan-2', focus: [0.55, 0.55] },
    // Em mặc blazer đen, ngồi trên sofa ở quán cafe cổ điển
    emNgoiSofaCafeBlazerDen: { src: 'em-ngoi-sofa-cafe-blazer-den', focus: [0.52, 0.5] },
    // Em mặc áo xanh nhạt dài, đeo kính râm, ngồi trên ban công gỗ có chậu cây
    emAoXanhNhatBanCongGo: { src: 'em-ao-xanh-nhat-ban-cong-go', focus: [0.5, 0.4] },
    // Em trong studio nền nâu có sao xanh, hai tay chụm dưới cằm
    emStudioNenSaoHaiTayDuoiCam: { src: 'em-studio-nen-sao-hai-tay-duoi-cam', focus: [0.5, 0.5] },
    // Em mặc áo xanh ngọc, giơ chữ V bên bàn ăn
    emAoXanhNgocChuVQuanAn: { src: 'em-ao-xanh-ngoc-chu-v-quan-an', focus: [0.5, 0.5] },
    // Em ngồi bên cửa sổ quán cafe, hai bên là bình hoa ly hồng
    emNgoiCuaSoCafeHoaLy: { src: 'em-ngoi-cua-so-cafe-hoa-ly', focus: [0.5, 0.65] },
    // Em selfie cận mặt, tóc đen dài, mặc váy đen hoa trắng, tay chống má
    emSelfieCanMatVayDenHoaTrang: { src: 'em-selfie-can-mat-vay-den-hoa-trang', focus: [0.5, 0.4] },
    // Em selfie đắp mặt nạ tím, quấn khăn trên đầu, ôm chú cún trắng, có sticker
    emSelfieMatNaTimOmCunTrang: { src: 'em-selfie-mat-na-tim-om-cun-trang', focus: [0.5, 0.45] },
    // Ảnh dọc ghép đôi hai khung: em ngồi bên cửa sổ quán cafe có hoa ly hồng, viền đen ở trên và dưới
    emNgoiCuaSoCafeHoaLyGhepDoi: { src: 'em-ngoi-cua-so-cafe-hoa-ly-ghep-doi', focus: [0.5, 0.33] },
    // ── Ảnh của anh ──
    // Anh ngồi trên sofa trong quán cafe phong cách cổ điển, cạnh đèn đứng
    anhNgoiSofaCafeCoDien: { src: 'anh-ngoi-sofa-cafe-co-dien', focus: [0.55, 0.68] },
    // Anh đeo kính râm, ngồi trên tảng đá lớn dưới bóng cây cạnh nước
    anhNgoiDaLonDeoKinhRam: { src: 'anh-ngoi-da-lon-deo-kinh-ram', focus: [0.5, 0.55] },
    // Anh đứng tựa lan can gỗ, ngắm núi đá vôi phủ cây xanh
    anhDungNgamNuiDaVoi: { src: 'anh-dung-ngam-nui-da-voi', focus: [0.5, 0.62] },
    // Anh selfie trong ánh sáng tối, mặc áo khoác đen
    anhSelfieAoKhoacDen: { src: 'anh-selfie-ao-khoac-den', focus: [0.5, 0.4] },
    // Anh mặc áo sọc đen trắng, ngồi đọc sách ở quán cafe ngoài trời buổi tối
    anhDocSachCafeBanDem: { src: 'anh-doc-sach-cafe-ban-dem', focus: [0.46, 0.5] },
    // ── Ảnh của hai đứa (và hình ảnh chung) ──
    // Hai đứa chụp gương vòm khung gỗ, anh ôm em từ phía sau
    haiDuaGuongVomGoAnhOmEm: { src: 'hai-dua-guong-vom-go-anh-om-em', focus: [0.5, 0.5] },
    // Hai đứa trong photobooth, anh hôn má em, em đeo kính và giơ chữ V
    haiDuaPhotoboothAnhHonEmChuV: { src: 'hai-dua-photobooth-anh-hon-em-chu-v', focus: [0.5, 0.5] },
    // Hai đứa trong photobooth, anh hôn má em, em nhắm mắt cười
    haiDuaPhotoboothAnhHonEmNhamMat: { src: 'hai-dua-photobooth-anh-hon-em-nham-mat', focus: [0.5, 0.5] },
    // Hai bàn tay giơ chữ V đặt trên chân, ghép đôi hai khung
    haiBanTayChuVChongLenNhau: { src: 'hai-ban-tay-chu-v-chong-len-nhau', focus: [0.5, 0.3] },
    // Hai đứa chụp gương có hình trang trí Noel vẽ trên kính, trong quán cafe
    haiDuaGuongNoelCafe: { src: 'hai-dua-guong-noel-cafe', focus: [0.5, 0.52] },
    // Hai bàn tay ghép hình trái tim trước hai tháp phát sáng bên hồ, ban đêm
    haiBanTayGhepTraiTimThapDen: { src: 'hai-ban-tay-ghep-trai-tim-thap-den', focus: [0.5, 0.5] },
    // Hai đứa chụp gương vòm khung gỗ (toàn thân), anh ôm em từ phía sau
    haiDuaGuongVomGoToanThan: { src: 'hai-dua-guong-vom-go-toan-than', focus: [0.5, 0.4] }
  };

  const DAY_PHOTOS = {
    // ── Kỷ niệm ngày yêu (08/05 hằng năm, từ năm 2027) ──
    anniversary: {
      feature: IMAGES.haiDuaPhotoboothAnhHonEmChuV,   // Hai đứa trong photobooth, anh hôn má em, em đeo kính và giơ chữ V
      ring: [
        IMAGES.haiDuaGuongVomGoAnhOmEm,   // 1. Hai đứa chụp gương vòm khung gỗ, anh ôm em từ phía sau
        IMAGES.boHoaToTinh,   // 2. Bó hoa hồng sophia ngày tỏ tình, em ôm hoa (ảnh đã có sẵn trong album)
        IMAGES.haiDuaGuongNoelCafe,   // 3. Hai đứa chụp gương có hình trang trí Noel vẽ trên kính, trong quán cafe
        IMAGES.haiBanTayChuVChongLenNhau,   // 4. Hai bàn tay giơ chữ V đặt trên chân, ghép đôi hai khung
        IMAGES.anhNgoiSofaCafeCoDien,   // 5. Anh ngồi trên sofa trong quán cafe phong cách cổ điển, cạnh đèn đứng
        IMAGES.haiBanTayGhepTraiTimThapDen,   // 6. Hai bàn tay ghép hình trái tim trước hai tháp phát sáng bên hồ, ban đêm
        IMAGES.emTuongLaBoHoaHongLan1,   // 7. Em đứng nghiêng cạnh bức tường phủ lá xanh, ôm bó hoa hồng (lần chụp 1)
        IMAGES.emSelfieBoHoaCamChuong   // 8. Em selfie, ôm bó hoa cẩm chướng hồng
      ]
    },

    // ── Mốc ngày yêu (tròn 200, 500, 1000… ngày) ──
    loveDays: {
      feature: IMAGES.haiDuaPhotoboothAnhHonEmNhamMat,   // Hai đứa trong photobooth, anh hôn má em, em nhắm mắt cười
      ring: [
        IMAGES.haiDuaGuongVomGoToanThan,   // 1. Hai đứa chụp gương vòm khung gỗ (toàn thân), anh ôm em từ phía sau
        IMAGES.haiDuaGuongNoelCafe,   // 2. Hai đứa chụp gương có hình trang trí Noel vẽ trên kính, trong quán cafe
        IMAGES.emStudioNenSaoChamMoi,   // 3. Em trong studio, nền nâu có các ngôi sao xanh, đặt ngón tay lên môi
        IMAGES.emTuongLaBoHoaHongLan2,   // 4. Em đứng nghiêng cạnh bức tường phủ lá xanh, ôm bó hoa hồng (lần chụp 2)
        IMAGES.anhNgoiSofaCafeCoDien,   // 5. Anh ngồi trên sofa trong quán cafe phong cách cổ điển, cạnh đèn đứng
        IMAGES.haiBanTayChuVChongLenNhau,   // 6. Hai bàn tay giơ chữ V đặt trên chân, ghép đôi hai khung
        IMAGES.haiBanTayGhepTraiTimThapDen,   // 7. Hai bàn tay ghép hình trái tim trước hai tháp phát sáng bên hồ, ban đêm
        IMAGES.emStudioNenSaoHaiTayDuoiCam   // 8. Em trong studio nền nâu có sao xanh, hai tay chụm dưới cằm
      ]
    },

    // ── Tết Dương lịch (01/01) + Tết Nguyên Đán (mùng 1) — dùng chung một bộ ──
    newYear: {
      feature: IMAGES.haiDuaGuongNoelCafe,   // Hai đứa chụp gương có hình trang trí Noel vẽ trên kính, trong quán cafe
      ring: [
        IMAGES.emAoXanhNhatBanCongGo,   // 1. Em mặc áo xanh nhạt dài, đeo kính râm, ngồi trên ban công gỗ có chậu cây
        IMAGES.emCafeDemBlazerDenBanGo,   // 2. Em mặc blazer đen, ngồi cạnh bàn gỗ ở quán cafe ngoài trời buổi tối
        IMAGES.emNgoiSofaCafeBlazerDen,   // 3. Em mặc blazer đen, ngồi trên sofa ở quán cafe cổ điển
        IMAGES.haiBanTayChuVChongLenNhau,   // 4. Hai bàn tay giơ chữ V đặt trên chân, ghép đôi hai khung
        IMAGES.haiBanTayGhepTraiTimThapDen,   // 5. Hai bàn tay ghép hình trái tim trước hai tháp phát sáng bên hồ, ban đêm
        IMAGES.haiDuaGuongVomGoToanThan,   // 6. Hai đứa chụp gương vòm khung gỗ (toàn thân), anh ôm em từ phía sau
        IMAGES.emVayTrangGocGomHoa,   // 7. Em mặc váy trắng, ngồi cạnh kệ gốm và hoa nhiều màu
        IMAGES.emSelfieBoHoaCamChuong   // 8. Em selfie, ôm bó hoa cẩm chướng hồng
      ]
    },

    // ── Sinh nhật em (27/12) ──
    birthdayEm: {
      feature: IMAGES.emStudioNenSaoChamMoi,   // Em trong studio, nền nâu có các ngôi sao xanh, đặt ngón tay lên môi
      ring: [
        IMAGES.emStudioNenSaoChiHaiNgonTay,   // 1. Em trong studio nền nâu có sao xanh, chụm hai ngón tay trước ngực
        IMAGES.emStudioNenSaoHaiTayDuoiCam,   // 2. Em trong studio nền nâu có sao xanh, hai tay chụm dưới cằm
        IMAGES.emVayTrangGocGomHoa,   // 3. Em mặc váy trắng, ngồi cạnh kệ gốm và hoa nhiều màu
        IMAGES.emAoXanhNgocCafeNang,   // 4. Em mặc áo xanh ngọc, ngồi bên bàn cafe có nắng
        IMAGES.emCafeDemBlazerDenBanGo,   // 5. Em mặc blazer đen, ngồi cạnh bàn gỗ ở quán cafe ngoài trời buổi tối
        IMAGES.emSelfieStickerDoraemon,   // 6. Em selfie với sticker Doraemon, đang uống trà sữa
        IMAGES.haiDuaGuongVomGoAnhOmEm,   // 7. Hai đứa chụp gương vòm khung gỗ, anh ôm em từ phía sau
        IMAGES.haiDuaGuongNoelCafe   // 8. Hai đứa chụp gương có hình trang trí Noel vẽ trên kính, trong quán cafe
      ]
    },

    // ── Sinh nhật anh (22/1) ──
    birthdayAnh: {
      feature: IMAGES.anhNgoiSofaCafeCoDien,   // Anh ngồi trên sofa trong quán cafe phong cách cổ điển, cạnh đèn đứng
      ring: [
        IMAGES.anhDungNgamNuiDaVoi,   // 1. Anh đứng tựa lan can gỗ, ngắm núi đá vôi phủ cây xanh
        IMAGES.anhDocSachCafeBanDem,   // 2. Anh mặc áo sọc đen trắng, ngồi đọc sách ở quán cafe ngoài trời buổi tối
        IMAGES.anhNgoiDaLonDeoKinhRam,   // 3. Anh đeo kính râm, ngồi trên tảng đá lớn dưới bóng cây cạnh nước
        IMAGES.anhSelfieAoKhoacDen,   // 4. Anh selfie trong ánh sáng tối, mặc áo khoác đen
        IMAGES.haiDuaGuongVomGoAnhOmEm,   // 5. Hai đứa chụp gương vòm khung gỗ, anh ôm em từ phía sau
        IMAGES.haiDuaGuongNoelCafe,   // 6. Hai đứa chụp gương có hình trang trí Noel vẽ trên kính, trong quán cafe
        IMAGES.haiDuaPhotoboothAnhHonEmNhamMat,   // 7. Hai đứa trong photobooth, anh hôn má em, em nhắm mắt cười
        IMAGES.haiBanTayGhepTraiTimThapDen   // 8. Hai bàn tay ghép hình trái tim trước hai tháp phát sáng bên hồ, ban đêm
      ]
    },

    // ── Quốc tế Phụ nữ (08/03) + Phụ nữ Việt Nam (20/10) — dùng chung một bộ ──
    womensDay: {
      // Đúng theo thư mục womens-day của bạn: noi-bat.jpg là ảnh nổi bật, W01…W08 là 8 ảnh vòng theo thứ tự
      feature: IMAGES.emCafeDemBlazerDenBanGo,   // noi-bat.jpg · Em mặc blazer đen, ngồi cạnh bàn gỗ ở quán cafe ngoài trời buổi tối
      ring: [
        IMAGES.emNgoiSofaCafeBlazerDen,   // W01 · Em mặc blazer đen, ngồi trên sofa ở quán cafe cổ điển
        IMAGES.emStudioNenSaoHaiTayDuoiCam,   // W02 · Em trong studio nền nâu có sao xanh, hai tay chụm dưới cằm
        IMAGES.emAoXanhNgocChuVQuanAn,   // W03 · Em mặc áo xanh ngọc, giơ chữ V bên bàn ăn
        IMAGES.haiDuaPhotoboothAnhHonEmNhamMat,   // W04 · Hai đứa trong photobooth, anh hôn má em, em nhắm mắt cười
        IMAGES.emSelfieCanMatVayDenHoaTrang,   // W05 · Em selfie cận mặt, tóc đen dài, mặc váy đen hoa trắng, tay chống má
        IMAGES.emSelfieMatNaTimOmCunTrang,   // W06 · Em selfie đắp mặt nạ tím, quấn khăn trên đầu, ôm chú cún trắng, có sticker
        IMAGES.emNgoiCuaSoCafeHoaLyGhepDoi,   // W07 · Ảnh dọc ghép đôi hai khung: em ngồi bên cửa sổ quán cafe có hoa ly hồng
        IMAGES.emNgoiCuaSoCafeHoaLy   // W08 · Em ngồi bên cửa sổ quán cafe, hai bên là bình hoa ly hồng
      ]
    },

    // ── Valentine (14/02) ──
    valentine: {
      feature: IMAGES.haiDuaPhotoboothAnhHonEmChuV,   // Hai đứa trong photobooth, anh hôn má em, em đeo kính và giơ chữ V
      ring: [
        IMAGES.boHoaToTinh,   // 1. Bó hoa hồng sophia ngày tỏ tình, em ôm hoa (ảnh đã có sẵn trong album)
        IMAGES.haiDuaGuongNoelCafe,   // 2. Hai đứa chụp gương có hình trang trí Noel vẽ trên kính, trong quán cafe
        IMAGES.haiDuaGuongVomGoAnhOmEm,   // 3. Hai đứa chụp gương vòm khung gỗ, anh ôm em từ phía sau
        IMAGES.emDeoKinhSelfieOmAnh,   // 4. Em đeo kính tròn, selfie cận mặt, anh áp sát phía sau
        IMAGES.haiDuaPhotoboothAnhHonEmNhamMat,   // 5. Hai đứa trong photobooth, anh hôn má em, em nhắm mắt cười
        IMAGES.haiBanTayGhepTraiTimThapDen,   // 6. Hai bàn tay ghép hình trái tim trước hai tháp phát sáng bên hồ, ban đêm
        IMAGES.haiBanTayChuVChongLenNhau,   // 7. Hai bàn tay giơ chữ V đặt trên chân, ghép đôi hai khung
        IMAGES.emSelfieBoHoaCamChuong   // 8. Em selfie, ôm bó hoa cẩm chướng hồng
      ]
    },

    // ── Rằm Trung thu (15/8 âm lịch) ──
    midAutumn: {
      feature: null,   // không có ảnh nổi bật: trái tim chỉ là hạt sáng
      ring: [
        IMAGES.emCafeDemBlazerDenBanGo,   // 1. Em mặc blazer đen, ngồi cạnh bàn gỗ ở quán cafe ngoài trời buổi tối
        IMAGES.anhDocSachCafeBanDem,   // 2. Anh mặc áo sọc đen trắng, ngồi đọc sách ở quán cafe ngoài trời buổi tối
        IMAGES.emNgoiSofaCafeBlazerDen,   // 3. Em mặc blazer đen, ngồi trên sofa ở quán cafe cổ điển
        IMAGES.haiBanTayChuVChongLenNhau,   // 4. Hai bàn tay giơ chữ V đặt trên chân, ghép đôi hai khung
        IMAGES.haiDuaGuongNoelCafe,   // 5. Hai đứa chụp gương có hình trang trí Noel vẽ trên kính, trong quán cafe
        IMAGES.haiDuaGuongVomGoAnhOmEm,   // 6. Hai đứa chụp gương vòm khung gỗ, anh ôm em từ phía sau
        IMAGES.emVayTrangGocGomHoa,   // 7. Em mặc váy trắng, ngồi cạnh kệ gốm và hoa nhiều màu
        IMAGES.haiBanTayGhepTraiTimThapDen   // 8. Hai bàn tay ghép hình trái tim trước hai tháp phát sáng bên hồ, ban đêm
      ]
    },

    // ── Quốc tế Thiếu nhi (01/06 hằng năm) ──
    childrensDay: {
      feature: IMAGES.emSelfieStickerDoraemon,   // Em selfie với sticker Doraemon, đang uống trà sữa
      ring: [
        IMAGES.emAoXanhNgocChuVQuanAn,   // 1. Em mặc áo xanh ngọc, giơ chữ V bên bàn ăn
        IMAGES.emStudioNenSaoChiHaiNgonTay,   // 2. Em trong studio nền nâu có sao xanh, chụm hai ngón tay trước ngực
        IMAGES.emDeoKinhSelfieOmAnh,   // 3. Em đeo kính tròn, selfie cận mặt, anh áp sát phía sau
        IMAGES.haiBanTayChuVChongLenNhau,   // 4. Hai bàn tay giơ chữ V đặt trên chân, ghép đôi hai khung
        IMAGES.emAoXanhNgocCafeNang,   // 5. Em mặc áo xanh ngọc, ngồi bên bàn cafe có nắng
        IMAGES.emStudioNenSaoHaiTayDuoiCam,   // 6. Em trong studio nền nâu có sao xanh, hai tay chụm dưới cằm
        IMAGES.haiDuaPhotoboothAnhHonEmChuV,   // 7. Hai đứa trong photobooth, anh hôn má em, em đeo kính và giơ chữ V
        IMAGES.anhNgoiDaLonDeoKinhRam   // 8. Anh đeo kính râm, ngồi trên tảng đá lớn dưới bóng cây cạnh nước
      ]
    }
  };

  const defaults = {
    enabled: true,
    priority: PRIORITY.CUSTOM,
    theme: 'rose',
    particles: ['hearts'],
    burst: 'hearts',
    images: [],
    feature: null,
    music: null,
    duration: 45000,
    content: {
      gate: 'Hôm nay là một ngày đặc biệt…',
      hint: 'Chạm vào con dấu để mở món quà',
      prelude: [],
      action: 'Tâm Thư'
    }
  };

  // Ảnh chọn riêng cho dịp đó đứng trước, các ảnh còn lại trong PHOTOS nối tiếp phía sau
  // Một ảnh gõ sai tên (PHOTOS.xyz chưa khai báo) chỉ bị bỏ qua và báo ở console, không làm hỏng cả màn hình
  const featuring = (...first) => {
    if (first.includes(undefined)) {
      console.warn('[SpecialEvents] featuring(): có ảnh chưa khai báo trong PHOTOS, đã bỏ qua.');
    }
    const picked = first.filter(Boolean);
    return [...picked, ...Object.values(PHOTOS).filter(photo => !picked.includes(photo))];
  };

  const events = [
    {
      id: 'birthday-em',
      priority: PRIORITY.BIRTHDAY,
      date: BIRTHDAY_EM,
      theme: 'rosegold',
      particles: ['hearts', 'sparkles', 'birthday'],
      burst: 'fireworks',
      feature: DAY_PHOTOS.birthdayEm.feature,
      images: DAY_PHOTOS.birthdayEm.ring,
      music: { src: './sounds/happy-birthday.mp3', volume: 0.6 },   // 44 giây
      duration: 41000,
      content: {
        gate: 'Hôm nay là ngày của em…',
        label: 'Sinh nhật em',
        prelude: [
          'Có một ngôi sao chỉ sáng rực vào hôm nay…',
          'Ngôi sao ấy mang tên em.'
        ],
        title: 'Chúc mừng sinh nhật em',
        message: 'Cảm ơn vũ trụ vì ngày này đã mang em đến với thế giới — và đến với anh.\nTuổi mới, anh chúc iu thật nhiều sức khỏe và sự xinh đẹp, thật nhiều niềm vui và thật nhiều lý do để cười.\nCòn anh, chỉ mong được ở cạnh em trong thật nhiều sinh nhật nữa.'
      }
    },
    {
      id: 'birthday-anh',
      priority: PRIORITY.BIRTHDAY,
      date: BIRTHDAY_ANH,
      theme: 'aurora',
      particles: ['hearts', 'sparkles', 'birthday'],
      burst: 'fireworks',
      feature: DAY_PHOTOS.birthdayAnh.feature,
      images: DAY_PHOTOS.birthdayAnh.ring,
      // Cùng file "happy-birthday.mp3" với sinh nhật em — đổi đường dẫn nếu muốn bài khác.
      music: { src: './sounds/happy-birthday.mp3', volume: 0.6 },
      duration: 41000,
      content: {
        label: 'Sinh nhật anh',
        prelude: [
          'Hôm nay là sinh nhật anh…',
          'Và món quà anh mong nhất đang đọc những dòng này.'
        ],
        title: 'Món quà lớn nhất của anh',
        message: 'Không cần bánh kem thật to hay thật nhiều nến.\nChỉ cần hôm nay em ghé qua đây và mỉm cười một chút, sinh nhật của anh đã trọn vẹn rồi.\nCảm ơn em vì đã ở đây.'
      }
    },
    {
      id: 'anniversary',
      priority: PRIORITY.ANNIVERSARY,
      date: ANNIVERSARY,
      theme: 'rose',
      particles: ['hearts', 'sparkles'],
      burst: 'hearts',
      feature: DAY_PHOTOS.anniversary.feature,
      images: DAY_PHOTOS.anniversary.ring,
      music: { src: './sounds/vay-cuoi.mp3', volume: 0.55 },   // file dài 1 phút 29, chỉ phát ~55 giây rồi nhỏ dần
      duration: 55000,
      content: {
        gate: 'Hôm nay là ngày của chúng mình…',
        label: 'Kỷ niệm ngày yêu · năm thứ {years}',
        prelude: [
          'Trái đất vừa đi thêm một vòng quanh mặt trời…',
          'Kể từ ngày anh được nắm tay em.'
        ],
        title: '{years2} năm thương em',
        message: 'Cảm ơn em vì đã cùng anh đi qua những ngày vui, những lúc giận hờn và cả những lần học cách hiểu nhau hơn.\nMỗi năm trôi qua, anh lại thương em nhiều hơn một chút.\nMình cùng viết tiếp những chương hạnh phúc nhé.'
      }
    },
    {
      id: 'valentine',
      priority: PRIORITY.HOLIDAY,
      date: VALENTINE,
      theme: 'rose',
      particles: ['hearts'],
      burst: 'hearts',
      feature: DAY_PHOTOS.valentine.feature,
      images: DAY_PHOTOS.valentine.ring,
      music: { src: './sounds/perfect.mp3', volume: 0.55 },   // Perfect – Ed Sheeran 
      duration: 55000,
      content: {
        label: 'Valentine',
        prelude: [
          'Hôm nay, cả dải ngân hà như ấm hơn một chút…',
          'Vì đây là ngày của những người đang thương nhau.'
        ],
        title: 'Valentine của anh là em',
        message: 'Giữa bao nhiêu ngày trong năm, anh thích nhất những ngày được gọi em là em yêu.\nCảm ơn em đã cho anh một nơi để thương, để nhớ và để trở về.\nHappy Valentine, Chípiu của anh.'
      }
    },
    {
      id: 'womens-day',
      priority: PRIORITY.HOLIDAY,
      date: WOMENS_DAY,
      theme: 'blossom',
      particles: ['hearts', 'petals'],
      feature: DAY_PHOTOS.womensDay.feature,
      images: DAY_PHOTOS.womensDay.ring,
      music: { src: './sounds/just_the_way_you_are.mp3', volume: 0.55 },   // Just the Way You Are – Bruno Mars (dùng chung cho 8/3 và 20/10)
      duration: 55000,
      content: {
        label: 'Quốc tế Phụ nữ',
        prelude: [
          'Có những bông hoa không cần đợi mùa xuân…',
          'Vì chúng nở ra từ nụ cười của em.'
        ],
        title: 'Gửi người con gái anh thương',
        message: 'Chúc em luôn được yêu thương, được nâng niu và được là chính mình.\nNhững điều em cố gắng mỗi ngày, anh đều thấy và trân trọng.\nHôm nay và mọi ngày, em xứng đáng với những điều dịu dàng nhất.'
      }
    },
    {
      id: 'vietnamese-womens-day',
      priority: PRIORITY.HOLIDAY,
      date: VIETNAMESE_WOMENS_DAY,
      theme: 'lilac',
      particles: ['hearts', 'petals'],
      feature: DAY_PHOTOS.womensDay.feature,   // dùng chung bộ ảnh 8/3
      images: DAY_PHOTOS.womensDay.ring,
      music: { src: './sounds/just_the_way_you_are.mp3', volume: 0.55 },   // Just the Way You Are – Bruno Mars (dùng chung file với 8/3)
      duration: 55000,
      content: {
        label: 'Ngày Phụ nữ Việt Nam',
        prelude: [
          'Hôm nay là một ngày thật dịu dàng…',
          'Vì cả thế giới đang nói lời cảm ơn những người con gái như em.'
        ],
        title: 'Cảm ơn em vì đã là em',
        message: 'Cảm ơn em vì những lần kiên nhẫn, những cái ôm và cả những lúc "tụt mood" rất dễ thương.\nAnh mong em luôn bình yên, luôn xinh đẹp và luôn tự tin như cách anh vẫn nhìn thấy em.\nChúc mừng 20/10, cô gái của anh.'
      }
    },
    {
      // Mốc ngày yêu (xem LOVE_DAYS): {days} = số ngày, tự định dạng 1.000 / 2.000 ...
      id: 'love-days',
      priority: PRIORITY.MILESTONE,
      date: LOVE_DAYS,
      theme: 'rosegold',
      particles: ['hearts', 'sparkles'],
      burst: 'hearts',
      feature: DAY_PHOTOS.loveDays.feature,
      images: DAY_PHOTOS.loveDays.ring,
      music: { src: './sounds/a_thousand_years.mp3', volume: 0.55 },
      duration: 55000,
      content: {
        gate: 'Hôm nay là một con số thật đẹp…',
        label: 'Tròn {days} ngày bên nhau',
        prelude: [
          'Có những con số chỉ là con số…',
          'Cho tới khi người ta đếm bằng nhớ thương.'
        ],
        title: '{days} ngày thương em',
        message: 'Anh không đếm ngày để biết đã bao lâu rồi.\nAnh đếm để nhớ rằng trong từng ngày ấy đều có em.\nCảm ơn em vì {days} ngày đã ở bên anh — và anh vẫn muốn đếm thêm thật nhiều ngày nữa.'
      }
    },
    {
      id: 'new-year',
      priority: PRIORITY.HOLIDAY,
      date: NEW_YEAR,
      theme: 'aurora',
      particles: ['sparkles', 'hearts'],
      burst: 'fireworks',
      feature: DAY_PHOTOS.newYear.feature,
      images: DAY_PHOTOS.newYear.ring,
      music: { src: './sounds/happy_new_year.mp3', volume: 0.55 },
      duration: 55000,
      content: {
        gate: 'Năm mới đến rồi…',
        label: 'Tết Dương lịch',
        prelude: [
          'Một năm nữa vừa khép lại…',
          'Và anh vẫn muốn bắt đầu năm mới này cùng em.'
        ],
        title: 'Năm mới, vẫn là em',
        message: 'Chúc em năm mới thật nhiều sức khỏe, bình an và những điều dịu dàng nhất.\nNếu năm cũ có điều gì chưa trọn, mình cùng nhau làm lại thật đẹp trong năm nay.\nHappy New Year, Chípiu của anh.'
      }
    },
    {
      id: 'lunar-new-year',
      priority: PRIORITY.HOLIDAY,
      date: LUNAR_NEW_YEAR,
      theme: 'blossom',
      particles: ['petals', 'sparkles', 'hearts'],
      burst: 'fireworks',
      feature: DAY_PHOTOS.newYear.feature,   // dùng chung bộ ảnh Tết Dương lịch
      images: DAY_PHOTOS.newYear.ring,
      music: { src: './sounds/happy_new_year.mp3', volume: 0.55 },
      duration: 55000,
      content: {
        gate: 'Xuân đã về rồi…',
        label: 'Tết Nguyên Đán',
        prelude: [
          'Một năm mới vừa bước qua ngưỡng cửa…',
          'Mang theo hoa đào, và cả những điều anh muốn nói với em.'
        ],
        title: 'Chúc mừng năm mới em yêu',
        message: 'Chúc em năm mới vạn sự bình an, được làm điều mình thích và luôn có người thương ở bên.\nCảm ơn em vì năm qua đã cùng anh đi qua đủ mọi ngày — Tết này, hay bất cứ ngày nào, anh cũng muốn được về với em.\nXuân này và những mùa xuân sau nữa, mình vẫn ở cạnh nhau nhé.'
      }
    },
    {
      id: 'mid-autumn',
      priority: PRIORITY.HOLIDAY,
      date: MID_AUTUMN,
      theme: 'cosmos',
      particles: ['sparkles', 'hearts'],
      burst: 'hearts',
      feature: DAY_PHOTOS.midAutumn.feature,   // null: không có ảnh nổi bật
      images: DAY_PHOTOS.midAutumn.ring,
      music: { src: './sounds/chiec_den_ong_sao.mp3', volume: 0.55 },
      duration: 55000,
      content: {
        gate: 'Trăng rằm tháng Tám…',
        label: 'Rằm Trung thu',
        prelude: [
          'Đêm nay trăng tròn nhất năm…',
          'Nhưng với anh, em vẫn là điều đẹp hơn cả ánh trăng.'
        ],
        title: 'Trăng rằm, và em',
        message: 'Mong em có một đêm Trung thu thật ấm, có bánh, có đèn, có trăng và có cả nụ cười của em.\nNếu mình ở xa, mình vẫn đang nhìn chung một mảnh trăng.\nTrăng tròn bao nhiêu, anh thương em đầy bấy nhiêu.'
      }
    },
    {
      id: 'childrens-day',
      priority: PRIORITY.HOLIDAY,
      date: CHILDRENS_DAY,
      theme: 'aurora',
      particles: ['hearts', 'balloons', 'gifts'],
      burst: 'hearts',
      feature: DAY_PHOTOS.childrensDay.feature,
      images: DAY_PHOTOS.childrensDay.ring,
      music: { src: './sounds/cho_toi_xin_mot_ve_di_tuoi_tho.mp3', volume: 0.55 },   // Cho Tôi Xin Một Vé Đi Tuổi Thơ – Lynk Lee 
      duration: 55000,
      content: {
        gate: 'Hôm nay là ngày của những em bé…',
        label: 'Quốc tế Thiếu nhi',
        prelude: [
          'Ai rồi cũng lớn lên, nhưng có người vẫn giữ nụ cười của một đứa trẻ…',
          'Và người đó, với anh, chính là em.'
        ],
        title: 'Gửi em bé của anh',
        message: 'Chúc em hôm nay được làm trẻ con một chút: ăn món em thích, cười thật to và không phải lo nghĩ gì cả.\nAnh thích nhất những lúc em vui như một đứa trẻ, vì khi đó cả thế giới của anh cũng sáng lên.\nHôm nay, và mọi ngày, em cứ là em bé của anh nhé.'
      }
    }
  ];

  return { defaults, events };
})();
