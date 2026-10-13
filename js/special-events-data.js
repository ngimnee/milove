/* --------------------------------------------------------------------------
   SPECIAL DAYS - DATA (nơi duy nhất cần chỉnh)
   Mỗi object trong `events` là một "chương" chỉ mở đúng ngày của nó, ngay sau màn loading và trước lời dẫn "Có những lời...".
   Thêm ngày mới = thêm một object, không cần sửa code ở file khác.

   date:
     { lunar: { month: 8, day: 15 } }     → ngày âm lịch (Việt Nam), lặp lại mỗi năm
     { daysSince: date, milestones: [365, 1000] } → đúng ngày thứ N kể từ `date` (dùng {days} trong chữ)
     { month: 2, day: 14 }                → lặp lại mỗi năm
     { year: 2027, month: 1, day: 1 }     → chỉ đúng ngày đó
     { since: new Date(2026, 2, 17) }     → mỗi năm kể từ năm sau; dùng {years} trong chữ
     null                                 → chưa cấu hình, event tự tắt
   images: ảnh thò ra thụt vào dọc mép đĩa, xoay cùng trái tim (tối đa 8).
           featuring(A, B) = A, B trước rồi tới mọi ảnh còn lại trong PHOTOS.
           Dùng PHOTOS bên dưới, hoặc { src: './assets/special-events/<id>/photo.webp', caption: '...' }.
           src là key trong js/image-data.js (ảnh đã mã hóa) hoặc đường dẫn tương đối.
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

  // Ảnh dùng chung cho mọi dịp (key trong js/image-data.js + chú thích viết tay dưới ảnh)
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
  const featuring = (...first) => [...first, ...Object.values(PHOTOS).filter(photo => !first.includes(photo))];

  const events = [
    {
      id: 'birthday-em',
      priority: PRIORITY.BIRTHDAY,
      date: BIRTHDAY_EM,
      theme: 'rosegold',
      particles: ['hearts', 'sparkles', 'birthday'],
      burst: 'fireworks',
      feature: PHOTOS.anhVaEm,
      images: featuring(PHOTOS.duLich, PHOTOS.cafeDatSet, PHOTOS.hoTay, PHOTOS.boHoaDau, PHOTOS.noiXa),
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
      feature: PHOTOS.anhVaEm,
      images: featuring(PHOTOS.thaiBinh, PHOTOS.duLich, PHOTOS.lanDauGap, PHOTOS.toTinh),
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
      feature: PHOTOS.toTinh,
      images: featuring(PHOTOS.lanDauGap, PHOTOS.hoTay, PHOTOS.boHoaDau, PHOTOS.thaiBinh, PHOTOS.cafeDatSet, PHOTOS.duLich),
      music: { src: './sounds/vay-cuoi.mp3', volume: 0.55 },   // file dài 1 phút 29, chỉ phát ~55 giây rồi nhỏ dần
      duration: 55000,
      content: {
        gate: 'Hôm nay là ngày của chúng mình…',
        label: 'Kỷ niệm ngày yêu · năm thứ {years}',
        prelude: [
          'Trái đất vừa đi thêm một vòng quanh mặt trời…',
          'Kể từ ngày anh được nắm tay em.'
        ],
        title: '{years} năm thương em',
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
      feature: PHOTOS.anhVaEm,
      images: featuring(PHOTOS.toTinh, PHOTOS.boHoaDau, PHOTOS.hoTay, PHOTOS.cafeDatSet, PHOTOS.duLich),
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
      feature: PHOTOS.boHoaDau,
      images: featuring(PHOTOS.toTinh, PHOTOS.cafeDatSet, PHOTOS.anhVaEm, PHOTOS.noiXa),
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
      feature: PHOTOS.boHoaDau,
      images: featuring(PHOTOS.cafeDatSet, PHOTOS.duLich, PHOTOS.hoTay, PHOTOS.anhVaEm),
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
      feature: PHOTOS.anhVaEm,
      images: featuring(PHOTOS.toTinh, PHOTOS.lanDauGap, PHOTOS.hoTay, PHOTOS.boHoaDau, PHOTOS.thaiBinh, PHOTOS.cafeDatSet, PHOTOS.duLich),
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
      feature: PHOTOS.anhVaEm,
      images: featuring(PHOTOS.toTinh, PHOTOS.hoTay, PHOTOS.cafeDatSet, PHOTOS.duLich, PHOTOS.thaiBinh),
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
      feature: PHOTOS.anhVaEm,
      images: featuring(PHOTOS.boHoaDau, PHOTOS.toTinh, PHOTOS.hoTay, PHOTOS.cafeDatSet, PHOTOS.thaiBinh),
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
      feature: PHOTOS.anhVaEm,
      images: featuring(PHOTOS.lanDauGap, PHOTOS.hoTay, PHOTOS.toTinh, PHOTOS.noiXa, PHOTOS.duLich),
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
    }
  ];

  return { defaults, events };
})();
