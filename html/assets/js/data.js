/* =========================================================
   CẤU HÌNH & DỮ LIỆU WEBSITE
   Mọi nội dung bạn cần tự sửa đều nằm trong file này:
   thông tin liên hệ, tài khoản nhận tiền, giá hội viên, khóa học,
   link mở tài khoản từng công ty, video hướng dẫn, bài viết.

   QUYỀN XEM (trường "access" của bài viết / khóa học miễn phí):
     "public"  – ai cũng xem được
     "user"    – cần đăng nhập
     "member"  – hội viên 68k/tháng còn hạn, hoặc tài khoản 50 triệu
     "vip"     – chỉ tài khoản mở / chuyển ID 50 triệu về Đầu tư cùng Vũ
   Khóa học có phí: người đã mua khóa đó hoặc tài khoản 50 triệu.
   Bài học có preview: true thì ai cũng xem thử được.

   VIDEO: dán link YouTube (https://youtu.be/xxxx hoặc
   https://www.youtube.com/watch?v=xxxx) hoặc chỉ mã video. Để trống
   thì trang hiện khung "video sẽ được cập nhật".

   Giá cổ phiếu tính theo nghìn đồng (24.8 = 24.800 đ). Dữ liệu thị
   trường hiện là dữ liệu minh họa, cần thay bằng API khi chạy thật.
   ========================================================= */
window.APP_DATA = (function () {
  /* ---------- Thông tin chung ---------- */
  const site = {
    name: "Đầu tư cùng Vũ",
    slogan: "Đầu tư thông minh – Tài chính vững vàng – Tự do tài chính",
    offerTitle: "Mở tài khoản hoặc chuyển ID về ĐẦU TƯ CÙNG VŨ",
    offerText: "với số vốn từ 50 triệu đồng – Miễn phí toàn bộ khóa học & tin tức độc quyền!",
    minCapital: "50 triệu đồng",
    contact: {
      phone: "0900 000 000", // SỬA: số điện thoại / Zalo của bạn
      zalo: "https://zalo.me/0900000000", // SỬA: link Zalo
      facebook: "#",
      youtube: "#",
      telegram: "#",
    },
    // Tài khoản nhận tiền cho hội viên & khóa học.
    // Điền bankId + accountNo + accountName thì mã QR tự sinh kèm số tiền
    // và nội dung chuyển khoản (dịch vụ VietQR). Hoặc đặt sẵn ảnh QR của bạn
    // vào assets/img/ rồi ghi đường dẫn vào qrImage.
    payment: {
      bankId: "", // ví dụ "MB", "VCB", "TCB", "ACB"
      bankName: "", // ví dụ "MB Bank"
      accountNo: "",
      accountName: "",
      qrImage: "", // ví dụ "assets/img/qr.png"
    },
    membership: {
      pricePerMonth: 68000,
      months: [1, 3, 6, 12],
    },
    videos: {
      openAccount: "", // video hướng dẫn mở tài khoản (dùng chung khi công ty không có video riêng)
      transferId: "", // video hướng dẫn chuyển ID
    },
  };

  /* ---------- Thị trường (minh họa) ---------- */
  const indices = [
    { code: "VN-Index", value: 1281.45, change: 12.36 },
    { code: "VN30", value: 1342.21, change: 15.82 },
    { code: "HNX", value: 246.8, change: 2.14 },
    { code: "UPCoM", value: 95.12, change: -0.18 },
  ];

  const tickers = [
    { code: "MBB", name: "Ngân hàng TMCP Quân Đội", sector: "Ngân hàng", price: 24.8, change: 1.3, color: "#1e3a8a" },
    { code: "SSI", name: "CTCP Chứng khoán SSI", sector: "Chứng khoán", price: 32.1, change: 1.2, color: "#d71920" },
    { code: "VCB", name: "Ngân hàng TMCP Ngoại thương Việt Nam", sector: "Ngân hàng", price: 92.4, change: 0.4, color: "#0f7a3d" },
    { code: "VNM", name: "CTCP Sữa Việt Nam", sector: "Thực phẩm", price: 72.5, change: 0.5, color: "#1d4ed8" },
    { code: "FPT", name: "CTCP FPT", sector: "Công nghệ", price: 142.0, change: 0.7, color: "#f37021" },
    { code: "HPG", name: "CTCP Tập đoàn Hòa Phát", sector: "Thép", price: 27.3, change: -0.4, color: "#b91c1c" },
    { code: "TCB", name: "Ngân hàng TMCP Kỹ thương Việt Nam", sector: "Ngân hàng", price: 23.9, change: 0.8, color: "#dc2626" },
    { code: "VIC", name: "Tập đoàn Vingroup", sector: "Bất động sản", price: 44.2, change: -1.1, color: "#9f1239" },
    { code: "VHM", name: "CTCP Vinhomes", sector: "Bất động sản", price: 41.5, change: 0.0, color: "#be123c" },
    { code: "STB", name: "Ngân hàng TMCP Sài Gòn Thương Tín", sector: "Ngân hàng", price: 31.2, change: 1.6, color: "#1e40af" },
    { code: "REE", name: "CTCP Cơ điện lạnh", sector: "Điện", price: 68.0, change: -0.8, color: "#0369a1" },
  ];

  /* ---------- Khóa học ----------
     price: 0 = miễn phí. Tên, mô tả, bài học do bạn tự đặt.
     lessons: { t: tên bài, m: số phút, video: link YouTube, preview: cho xem thử } */
  const courses = [
    {
      id: "nhap-mon-chung-khoan",
      title: "Nhập môn chứng khoán",
      desc: "Những điều cần biết trước khi đặt lệnh đầu tiên: thị trường vận hành ra sao, đọc bảng giá, các loại lệnh và phí.",
      price: 0,
      access: "public",
      art: "candles",
      lessons: [
        { t: "Chứng khoán là gì, vì sao nên đầu tư", m: 12, video: "" },
        { t: "Ba sàn HOSE, HNX, UPCoM", m: 10, video: "" },
        { t: "Đọc bảng giá điện tử", m: 15, video: "" },
        { t: "Các loại lệnh LO, ATO, ATC, MP", m: 14, video: "" },
        { t: "Phí, thuế và chu kỳ thanh toán T+2", m: 11, video: "" },
      ],
    },
    {
      id: "doc-bao-cao-tai-chinh",
      title: "Đọc hiểu báo cáo tài chính",
      desc: "Đọc 3 báo cáo cốt lõi, nhận ra doanh nghiệp làm ăn thật hay chỉ đẹp trên giấy, kèm ví dụ từ doanh nghiệp niêm yết.",
      price: 499000,
      art: "bars",
      lessons: [
        { t: "Tổng quan 3 báo cáo tài chính", m: 16, video: "", preview: true },
        { t: "Bảng cân đối kế toán", m: 20, video: "" },
        { t: "Báo cáo kết quả kinh doanh", m: 18, video: "" },
        { t: "Lưu chuyển tiền tệ: tiền thật nằm ở đâu", m: 19, video: "" },
        { t: "Các chỉ số ROE, ROA, biên lợi nhuận", m: 17, video: "" },
        { t: "Dấu hiệu cảnh báo trong BCTC", m: 15, video: "" },
      ],
    },
    {
      id: "phan-tich-ky-thuat",
      title: "Phân tích kỹ thuật thực chiến",
      desc: "Xu hướng, hỗ trợ kháng cự, khối lượng và cách đặt điểm mua, điểm cắt lỗ có kỷ luật.",
      price: 699000,
      art: "chart",
      lessons: [
        { t: "Biểu đồ nến và xu hướng", m: 18, video: "", preview: true },
        { t: "Hỗ trợ, kháng cự và vùng giá", m: 20, video: "" },
        { t: "Khối lượng giao dịch nói gì", m: 16, video: "" },
        { t: "Đường trung bình động MA", m: 17, video: "" },
        { t: "RSI, MACD dùng đúng cách", m: 21, video: "" },
        { t: "Điểm mua, cắt lỗ và quản lý lệnh", m: 22, video: "" },
        { t: "Thực hành trên biểu đồ thật", m: 30, video: "" },
      ],
    },
    {
      id: "dau-tu-co-tuc",
      title: "Đầu tư cổ phiếu cổ tức",
      desc: "Chọn doanh nghiệp trả cổ tức đều, hiểu ngày chốt quyền và xây dòng tiền thụ động dài hạn.",
      price: 0,
      access: "user",
      art: "pie",
      lessons: [
        { t: "Cổ tức tiền mặt và cổ tức cổ phiếu", m: 12, video: "" },
        { t: "Ngày giao dịch không hưởng quyền", m: 10, video: "" },
        { t: "Lọc cổ phiếu cổ tức bền vững", m: 16, video: "" },
      ],
    },
    {
      id: "quan-tri-von",
      title: "Quản trị vốn và tâm lý giao dịch",
      desc: "Phân bổ tỷ trọng, dùng margin an toàn và giữ kỷ luật khi thị trường biến động mạnh.",
      price: 399000,
      art: "towers",
      lessons: [
        { t: "Xác định khẩu vị rủi ro", m: 14, video: "", preview: true },
        { t: "Phân bổ tỷ trọng danh mục", m: 16, video: "" },
        { t: "Margin: dùng thế nào cho an toàn", m: 15, video: "" },
        { t: "Tâm lý FOMO và cắt lỗ", m: 18, video: "" },
        { t: "Nhật ký giao dịch", m: 10, video: "" },
      ],
    },
  ];

  /* ---------- Chủ đề tin tức ----------
     keys: từ khóa người đọc hay gõ, dùng cho ô tìm kiếm. */
  const newsTags = [
    { id: "thi-truong", label: "Thị trường", keys: ["thi truong", "vn-index", "vnindex", "phien"] },
    { id: "nhan-dinh", label: "Nhận định thị trường", keys: ["nhan dinh", "chien luoc", "kich ban", "du bao"] },
    { id: "doanh-nghiep", label: "Doanh nghiệp", keys: ["doanh nghiep", "cong ty"] },
    { id: "vi-mo", label: "Vĩ mô", keys: ["vi mo", "lai suat", "lam phat", "ty gia", "gdp", "cpi"] },
    { id: "quoc-te", label: "Quốc tế", keys: ["quoc te", "the gioi", "fed", "my", "trung quoc"] },
    { id: "co-tuc", label: "Cổ tức", keys: ["co tuc", "chot quyen", "chia co tuc"] },
    { id: "bctc", label: "Kết quả kinh doanh - BCTC", keys: ["bctc", "bao cao tai chinh", "kqkd", "ket qua kinh doanh", "loi nhuan", "doanh thu"] },
    { id: "khoi-ngoai", label: "Khối ngoại", keys: ["khoi ngoai", "nuoc ngoai", "ngoai mua", "ngoai ban"] },
  ];

  /* ---------- Bài viết ----------
     date: "YYYY-MM-DD HH:mm" (dùng để sắp xếp mới nhất lên đầu)
     tags: mã cổ phiếu (viết hoa) và chủ đề (id ở newsTags), gắn bao nhiêu cũng được
     access: quyền xem (xem đầu file). body: các đoạn nội dung bài. */
  const news = [
    { id: 30, date: "2026-10-16 07:30", tags: ["nhan-dinh", "thi-truong"], access: "member", art: "chart", title: "Nhận định thị trường 16/10: VN-Index thử thách vùng 1.290 điểm", excerpt: "Dòng tiền tiếp tục xoay vòng vào nhóm ngân hàng, chứng khoán. Kịch bản phiên hôm nay và các vùng giá cần chú ý." },
    { id: 31, date: "2026-10-15 15:10", tags: ["thi-truong", "khoi-ngoai"], access: "public", art: "chart", title: "VN-Index tăng hơn 12 điểm, thanh khoản vượt 20.000 tỷ đồng", excerpt: "Thị trường hồi phục với sự dẫn dắt của nhóm ngân hàng và chứng khoán, khối ngoại mua ròng phiên thứ ba liên tiếp." },
    { id: 32, date: "2026-10-15 14:32", tags: ["MBB", "doanh-nghiep", "bctc"], access: "public", art: "building", title: "MBB công bố KQKD quý III/2026: lợi nhuận trước thuế tăng 18%", excerpt: "Ngân hàng TMCP Quân Đội báo lãi trước thuế quý III tăng 18% so với cùng kỳ nhờ tăng trưởng tín dụng và thu nhập dịch vụ." },
    { id: 33, date: "2026-10-15 09:00", tags: ["VNM", "doanh-nghiep", "co-tuc"], access: "public", art: "building", title: "VNM chốt quyền trả cổ tức đợt 1 bằng tiền, tỷ suất khoảng 2%", excerpt: "Cổ đông sẽ nhận cổ tức tiền mặt vào cuối tháng. Ngày giao dịch không hưởng quyền là 24/10." },
    { id: 34, date: "2026-10-14 17:00", tags: ["vi-mo"], access: "public", art: "building-2", title: "Ngân hàng Nhà nước giữ nguyên lãi suất điều hành", excerpt: "Mặt bằng lãi suất ổn định tiếp tục hỗ trợ tăng trưởng tín dụng trong quý cuối năm." },
    { id: 35, date: "2026-10-14 16:42", tags: ["MBB", "khoi-ngoai", "thi-truong"], access: "public", art: "building-2", title: "MBB được khối ngoại mua ròng hơn 200 tỷ đồng", excerpt: "Khối ngoại quay lại mua ròng cổ phiếu ngân hàng, trong đó MBB dẫn đầu với giá trị hơn 200 tỷ đồng." },
    { id: 36, date: "2026-10-14 07:30", tags: ["nhan-dinh", "thi-truong"], access: "member", art: "chart", title: "Nhận định thị trường 14/10: Kỳ vọng hồi phục sau nhịp chỉnh", excerpt: "Áp lực bán đã giảm dần, nhiều cổ phiếu đầu ngành về vùng hỗ trợ mạnh. Chiến lược giải ngân từng phần." },
    { id: 37, date: "2026-10-13 11:20", tags: ["SSI", "doanh-nghiep"], access: "public", art: "building", title: "SSI dự kiến phát hành thêm cổ phiếu để tăng vốn", excerpt: "Hội đồng quản trị thông qua phương án phát hành, nâng vốn điều lệ để mở rộng dư nợ cho vay ký quỹ." },
    { id: 38, date: "2026-10-13 07:30", tags: ["quoc-te"], access: "public", art: "chart", title: "Fed giữ nguyên lãi suất, chứng khoán Mỹ tăng điểm", excerpt: "Thông điệp thận trọng nhưng không quá diều hâu từ Fed giúp tâm lý nhà đầu tư toàn cầu cải thiện." },
    { id: 39, date: "2026-10-12 20:00", tags: ["MBB", "doanh-nghiep", "bctc"], access: "member", art: "chart", title: "Phân tích chuyên sâu MBB: định giá sau quý III, P/B dưới trung bình 5 năm", excerpt: "So với nhóm ngân hàng cùng quy mô, MBB đang giao dịch ở mức P/B thấp hơn trong khi ROE thuộc nhóm cao nhất." },
    { id: 40, date: "2026-10-12 10:00", tags: ["HPG", "doanh-nghiep", "bctc"], access: "public", art: "building-2", title: "HPG: Dung Quất 2 vận hành, sản lượng thép quý IV dự kiến tăng mạnh", excerpt: "Khu liên hợp mới giúp nâng công suất thép thô, mở ra dư địa tăng trưởng cho năm tới." },
    { id: 41, date: "2026-10-11 15:20", tags: ["khoi-ngoai", "thi-truong"], access: "public", art: "building", title: "Khối ngoại mua ròng hơn 500 tỷ đồng trên HOSE", excerpt: "Dòng vốn ngoại tập trung vào nhóm ngân hàng và bán lẻ, chấm dứt chuỗi bán ròng kéo dài hai tuần." },
    { id: 42, date: "2026-10-11 09:45", tags: ["FPT", "doanh-nghiep"], access: "public", art: "building", title: "FPT ký hợp đồng chuyển đổi số trị giá lớn tại Nhật Bản", excerpt: "Mảng dịch vụ công nghệ thông tin nước ngoài tiếp tục là động lực tăng trưởng chính của tập đoàn." },
    { id: 43, date: "2026-10-10 20:00", tags: ["co-tuc", "doanh-nghiep"], access: "vip", art: "pie", title: "Danh mục 10 cổ phiếu cổ tức tiền mặt cao, dòng tiền ổn định", excerpt: "Bộ lọc cổ phiếu trả cổ tức đều 5 năm liền, nợ vay thấp và dòng tiền kinh doanh dương. Dành riêng tài khoản Đầu tư cùng Vũ." },
    { id: 44, date: "2026-10-10 13:00", tags: ["VCB", "doanh-nghiep", "bctc"], access: "public", art: "building-2", title: "VCB giữ vị trí ngân hàng có lợi nhuận cao nhất hệ thống", excerpt: "Lợi nhuận 9 tháng ước đạt mức cao nhất toàn ngành, tỷ lệ bao phủ nợ xấu duy trì trên 200%." },
    { id: 45, date: "2026-10-09 08:15", tags: ["quoc-te", "vi-mo"], access: "public", art: "chart", title: "Giá dầu thế giới giảm xuống dưới 80 USD/thùng", excerpt: "Lo ngại về nhu cầu khiến giá dầu Brent quay đầu giảm, tác động tới nhóm cổ phiếu dầu khí trong nước." },
    { id: 46, date: "2026-10-08 09:00", tags: ["vi-mo"], access: "user", art: "chart", title: "CPI tháng 9 tăng 0,3%, lạm phát vẫn trong tầm kiểm soát", excerpt: "Lạm phát bình quân 9 tháng thấp hơn mục tiêu, tạo dư địa cho chính sách tiền tệ nới lỏng." },
    { id: 47, date: "2026-10-07 09:05", tags: ["MBB", "thi-truong"], access: "user", art: "chart", title: "Cập nhật biểu đồ kỹ thuật MBB: xu hướng tăng vẫn được duy trì", excerpt: "Giá giữ vững trên đường MA50, thanh khoản cải thiện. Vùng hỗ trợ gần nhất quanh 23.500 đồng." },
  ];

  /* ---------- Công ty chứng khoán ----------
     openUrl: link mở tài khoản của bạn (link giới thiệu / mã môi giới).
     refCode: mã giới thiệu khách cần nhập khi mở tài khoản (nếu có).
     transferUrl: trang đổi môi giới / chuyển ID của công ty (nếu có).
     transferCode: mã môi giới / ID của bạn để khách nhập khi chuyển.
     openVideo / transferVideo: video riêng cho công ty này (để trống thì dùng video chung). */
  const brokers = [
    { id: "vps", name: "VPS", note: "Phí giao dịch thấp", color: "#e21b23", bg: "#fff4f0", openUrl: "https://www.vps.com.vn", refCode: "", transferUrl: "", transferCode: "", openVideo: "", transferVideo: "" },
    { id: "ssi", name: "SSI", note: "Đội ngũ uy tín", color: "#d71920", bg: "#fff1f1", openUrl: "https://www.ssi.com.vn", refCode: "", transferUrl: "", transferCode: "", openVideo: "", transferVideo: "" },
    { id: "mbs", name: "MBS", note: "Nền tảng mạnh", color: "#1e3a8a", bg: "#eef3ff", openUrl: "https://mbs.com.vn", refCode: "", transferUrl: "", transferCode: "", openVideo: "", transferVideo: "" },
    { id: "tcbs", name: "TCBS", note: "Nhiều ưu đãi", color: "#e3262e", bg: "#fff1f1", openUrl: "https://www.tcbs.com.vn", refCode: "", transferUrl: "", transferCode: "", openVideo: "", transferVideo: "" },
    { id: "hsc", name: "HSC", note: "Hỗ trợ tốt", color: "#0b3c8c", bg: "#eef3ff", openUrl: "https://www.hsc.com.vn", refCode: "", transferUrl: "", transferCode: "", openVideo: "", transferVideo: "" },
    { id: "kis", name: "KIS", note: "Dịch vụ chuyên nghiệp", color: "#0f4c81", bg: "#eef6ff", openUrl: "https://www.kisvn.vn", refCode: "", transferUrl: "", transferCode: "", openVideo: "", transferVideo: "" },
  ];

  return { site, indices, tickers, courses, newsTags, news, brokers };
})();
