/* TỰ SINH bởi scripts/build.py từ data/*.json — KHÔNG sửa tay, sửa trong CMS.
   Chỉ chứa dữ liệu công khai (repo + site đều public). */
window.APP_DATA = {
  "site": {
    "name": "Đầu tư cùng Vũ",
    "slogan": "Đầu tư thông minh – Tài chính vững vàng – Tự do tài chính",
    "offerTitle": "Mở tài khoản hoặc chuyển ID về ĐẦU TƯ CÙNG VŨ",
    "offerText": "với số vốn từ 50 triệu đồng – Miễn phí toàn bộ khóa học & tin tức độc quyền!",
    "minCapital": "50 triệu đồng",
    "contact": {
      "phone": "0982277493",
      "zalo": "https://zalo.me/0982277493",
      "facebook": "#",
      "youtube": "#",
      "telegram": "#"
    },
    "payment": {
      "bankId": "TCB",
      "bankName": "Techcombank",
      "accountNo": "4819939999",
      "accountName": "NGO TRUONG VU",
      "qrImage": ""
    },
    "membership": {
      "pricePerMonth": 68000,
      "months": [
        1,
        3,
        6,
        12
      ]
    },
    "videos": {
      "openAccount": "",
      "transferId": ""
    },
    "images": {
      "hero": "assets/img/vu.jpg",
      "brand": "assets/img/vu-128.jpg",
      "favicon": "assets/img/vu-128.jpg",
      "og": "assets/img/vu.jpg"
    }
  },
  "indices": [
    {
      "code": "VN-Index"
    },
    {
      "code": "VN30"
    },
    {
      "code": "HNX"
    },
    {
      "code": "UPCoM"
    }
  ],
  "tickers": [
    {
      "code": "MBB",
      "name": "Ngân hàng TMCP Quân Đội",
      "sector": "Ngân hàng",
      "color": "#1e3a8a"
    },
    {
      "code": "SSI",
      "name": "CTCP Chứng khoán SSI",
      "sector": "Chứng khoán",
      "color": "#d71920"
    },
    {
      "code": "VCB",
      "name": "Ngân hàng TMCP Ngoại thương Việt Nam",
      "sector": "Ngân hàng",
      "color": "#0f7a3d"
    },
    {
      "code": "VNM",
      "name": "CTCP Sữa Việt Nam",
      "sector": "Thực phẩm",
      "color": "#1d4ed8"
    },
    {
      "code": "FPT",
      "name": "CTCP FPT",
      "sector": "Công nghệ",
      "color": "#f37021"
    },
    {
      "code": "HPG",
      "name": "CTCP Tập đoàn Hòa Phát",
      "sector": "Thép",
      "color": "#b91c1c"
    },
    {
      "code": "TCB",
      "name": "Ngân hàng TMCP Kỹ thương Việt Nam",
      "sector": "Ngân hàng",
      "color": "#dc2626"
    },
    {
      "code": "VIC",
      "name": "Tập đoàn Vingroup",
      "sector": "Bất động sản",
      "color": "#9f1239"
    },
    {
      "code": "VHM",
      "name": "CTCP Vinhomes",
      "sector": "Bất động sản",
      "color": "#be123c"
    },
    {
      "code": "STB",
      "name": "Ngân hàng TMCP Sài Gòn Thương Tín",
      "sector": "Ngân hàng",
      "color": "#1e40af"
    },
    {
      "code": "REE",
      "name": "CTCP Cơ điện lạnh",
      "sector": "Điện",
      "color": "#0369a1"
    }
  ],
  "courses": [
    {
      "id": "nhap-mon-chung-khoan",
      "title": "Nhập môn chứng khoán",
      "desc": "Những điều cần biết trước khi đặt lệnh đầu tiên: thị trường vận hành ra sao, đọc bảng giá, các loại lệnh và phí.",
      "price": 0,
      "access": "public",
      "art": "candles",
      "lessons": [
        {
          "slug": "chung-khoan-la-gi-vi-sao-nen-dau-tu",
          "t": "Chứng khoán là gì, vì sao nên đầu tư",
          "m": 12,
          "video": ""
        },
        {
          "slug": "ba-san-hose-hnx-upcom",
          "t": "Ba sàn HOSE, HNX, UPCoM",
          "m": 10,
          "video": ""
        },
        {
          "slug": "doc-bang-gia-dien-tu",
          "t": "Đọc bảng giá điện tử",
          "m": 15,
          "video": ""
        },
        {
          "slug": "cac-loai-lenh-lo-ato-atc-mp",
          "t": "Các loại lệnh LO, ATO, ATC, MP",
          "m": 14,
          "video": ""
        },
        {
          "slug": "phi-thue-va-chu-ky-thanh-toan-t-2",
          "t": "Phí, thuế và chu kỳ thanh toán T+2",
          "m": 11,
          "video": ""
        }
      ],
      "order": 1
    },
    {
      "id": "doc-bao-cao-tai-chinh",
      "title": "Đọc hiểu báo cáo tài chính",
      "desc": "Đọc 3 báo cáo cốt lõi, nhận ra doanh nghiệp làm ăn thật hay chỉ đẹp trên giấy, kèm ví dụ từ doanh nghiệp niêm yết.",
      "price": 499000,
      "art": "bars",
      "lessons": [
        {
          "slug": "tong-quan-3-bao-cao-tai-chinh",
          "t": "Tổng quan 3 báo cáo tài chính",
          "m": 16,
          "video": "",
          "preview": true
        },
        {
          "slug": "bang-can-doi-ke-toan",
          "t": "Bảng cân đối kế toán",
          "m": 20,
          "video": ""
        },
        {
          "slug": "bao-cao-ket-qua-kinh-doanh",
          "t": "Báo cáo kết quả kinh doanh",
          "m": 18,
          "video": ""
        },
        {
          "slug": "luu-chuyen-tien-te-tien-that-nam-o-dau",
          "t": "Lưu chuyển tiền tệ: tiền thật nằm ở đâu",
          "m": 19,
          "video": ""
        },
        {
          "slug": "cac-chi-so-roe-roa-bien-loi-nhuan",
          "t": "Các chỉ số ROE, ROA, biên lợi nhuận",
          "m": 17,
          "video": ""
        },
        {
          "slug": "dau-hieu-canh-bao-trong-bctc",
          "t": "Dấu hiệu cảnh báo trong BCTC",
          "m": 15,
          "video": ""
        }
      ],
      "order": 2
    },
    {
      "id": "phan-tich-ky-thuat",
      "title": "Phân tích kỹ thuật thực chiến",
      "desc": "Xu hướng, hỗ trợ kháng cự, khối lượng và cách đặt điểm mua, điểm cắt lỗ có kỷ luật.",
      "price": 699000,
      "art": "chart",
      "lessons": [
        {
          "slug": "bieu-do-nen-va-xu-huong",
          "t": "Biểu đồ nến và xu hướng",
          "m": 18,
          "video": "",
          "preview": true
        },
        {
          "slug": "ho-tro-khang-cu-va-vung-gia",
          "t": "Hỗ trợ, kháng cự và vùng giá",
          "m": 20,
          "video": ""
        },
        {
          "slug": "khoi-luong-giao-dich-noi-gi",
          "t": "Khối lượng giao dịch nói gì",
          "m": 16,
          "video": ""
        },
        {
          "slug": "duong-trung-binh-dong-ma",
          "t": "Đường trung bình động MA",
          "m": 17,
          "video": ""
        },
        {
          "slug": "rsi-macd-dung-dung-cach",
          "t": "RSI, MACD dùng đúng cách",
          "m": 21,
          "video": ""
        },
        {
          "slug": "diem-mua-cat-lo-va-quan-ly-lenh",
          "t": "Điểm mua, cắt lỗ và quản lý lệnh",
          "m": 22,
          "video": ""
        },
        {
          "slug": "thuc-hanh-tren-bieu-do-that",
          "t": "Thực hành trên biểu đồ thật",
          "m": 30,
          "video": ""
        }
      ],
      "order": 3
    },
    {
      "id": "dau-tu-co-tuc",
      "title": "Đầu tư cổ phiếu cổ tức",
      "desc": "Chọn doanh nghiệp trả cổ tức đều, hiểu ngày chốt quyền và xây dòng tiền thụ động dài hạn.",
      "price": 0,
      "access": "user",
      "art": "pie",
      "lessons": [
        {
          "slug": "co-tuc-tien-mat-va-co-tuc-co-phieu",
          "t": "Cổ tức tiền mặt và cổ tức cổ phiếu",
          "m": 12,
          "video": ""
        },
        {
          "slug": "ngay-giao-dich-khong-huong-quyen",
          "t": "Ngày giao dịch không hưởng quyền",
          "m": 10,
          "video": ""
        },
        {
          "slug": "loc-co-phieu-co-tuc-ben-vung",
          "t": "Lọc cổ phiếu cổ tức bền vững",
          "m": 16,
          "video": ""
        }
      ],
      "order": 4
    },
    {
      "id": "quan-tri-von",
      "title": "Quản trị vốn và tâm lý giao dịch",
      "desc": "Phân bổ tỷ trọng, dùng margin an toàn và giữ kỷ luật khi thị trường biến động mạnh.",
      "price": 399000,
      "art": "towers",
      "lessons": [
        {
          "slug": "xac-dinh-khau-vi-rui-ro",
          "t": "Xác định khẩu vị rủi ro",
          "m": 14,
          "video": "",
          "preview": true
        },
        {
          "slug": "phan-bo-ty-trong-danh-muc",
          "t": "Phân bổ tỷ trọng danh mục",
          "m": 16,
          "video": ""
        },
        {
          "slug": "margin-dung-the-nao-cho-an-toan",
          "t": "Margin: dùng thế nào cho an toàn",
          "m": 15,
          "video": ""
        },
        {
          "slug": "tam-ly-fomo-va-cat-lo",
          "t": "Tâm lý FOMO và cắt lỗ",
          "m": 18,
          "video": ""
        },
        {
          "slug": "nhat-ky-giao-dich",
          "t": "Nhật ký giao dịch",
          "m": 10,
          "video": ""
        }
      ],
      "order": 5
    }
  ],
  "newsTags": [
    {
      "id": "thi-truong",
      "label": "Thị trường",
      "keys": [
        "thi truong",
        "vn index",
        "vnindex",
        "phien"
      ]
    },
    {
      "id": "nhan-dinh",
      "label": "Nhận định thị trường",
      "keys": [
        "nhan dinh",
        "chien luoc",
        "kich ban",
        "du bao"
      ]
    },
    {
      "id": "doanh-nghiep",
      "label": "Doanh nghiệp",
      "keys": [
        "doanh nghiep",
        "cong ty"
      ]
    },
    {
      "id": "vi-mo",
      "label": "Vĩ mô",
      "keys": [
        "vi mo",
        "lai suat",
        "lam phat",
        "ty gia",
        "gdp",
        "cpi"
      ]
    },
    {
      "id": "quoc-te",
      "label": "Quốc tế",
      "keys": [
        "quoc te",
        "the gioi",
        "fed",
        "my",
        "trung quoc"
      ]
    },
    {
      "id": "co-tuc",
      "label": "Cổ tức",
      "keys": [
        "co tuc",
        "chot quyen",
        "chia co tuc"
      ]
    },
    {
      "id": "bctc",
      "label": "Kết quả kinh doanh - BCTC",
      "keys": [
        "bctc",
        "bao cao tai chinh",
        "kqkd",
        "ket qua kinh doanh",
        "loi nhuan",
        "doanh thu"
      ]
    },
    {
      "id": "khoi-ngoai",
      "label": "Khối ngoại",
      "keys": [
        "khoi ngoai",
        "nuoc ngoai",
        "ngoai mua",
        "ngoai ban"
      ]
    }
  ],
  "news": [
    {
      "id": 30,
      "slug": "nhan-dinh-thi-truong-16-10-vn-index-thu-thach-vung-1-290-diem",
      "date": "2026-10-16 07:30",
      "tags": [
        "nhan-dinh",
        "thi-truong"
      ],
      "access": "member",
      "art": "chart",
      "title": "Nhận định thị trường 16/10: VN-Index thử thách vùng 1.290 điểm",
      "excerpt": "Dòng tiền tiếp tục xoay vòng vào nhóm ngân hàng, chứng khoán. Kịch bản phiên hôm nay và các vùng giá cần chú ý."
    },
    {
      "id": 31,
      "slug": "vn-index-tang-hon-12-diem-thanh-khoan-vuot-20-000-ty-dong",
      "date": "2026-10-15 15:10",
      "tags": [
        "thi-truong",
        "khoi-ngoai"
      ],
      "access": "public",
      "art": "chart",
      "title": "VN-Index tăng hơn 12 điểm, thanh khoản vượt 20.000 tỷ đồng",
      "excerpt": "Thị trường hồi phục với sự dẫn dắt của nhóm ngân hàng và chứng khoán, khối ngoại mua ròng phiên thứ ba liên tiếp."
    },
    {
      "id": 32,
      "slug": "mbb-cong-bo-kqkd-quy-iii-2026-loi-nhuan-truoc-thue-tang-18",
      "date": "2026-10-15 14:32",
      "tags": [
        "MBB",
        "doanh-nghiep",
        "bctc"
      ],
      "access": "public",
      "art": "building",
      "title": "MBB công bố KQKD quý III/2026: lợi nhuận trước thuế tăng 18%",
      "excerpt": "Ngân hàng TMCP Quân Đội báo lãi trước thuế quý III tăng 18% so với cùng kỳ nhờ tăng trưởng tín dụng và thu nhập dịch vụ."
    },
    {
      "id": 33,
      "slug": "vnm-chot-quyen-tra-co-tuc-dot-1-bang-tien-ty-suat-khoang-2",
      "date": "2026-10-15 09:00",
      "tags": [
        "VNM",
        "doanh-nghiep",
        "co-tuc"
      ],
      "access": "public",
      "art": "building",
      "title": "VNM chốt quyền trả cổ tức đợt 1 bằng tiền, tỷ suất khoảng 2%",
      "excerpt": "Cổ đông sẽ nhận cổ tức tiền mặt vào cuối tháng. Ngày giao dịch không hưởng quyền là 24/10."
    },
    {
      "id": 34,
      "slug": "ngan-hang-nha-nuoc-giu-nguyen-lai-suat-dieu-hanh",
      "date": "2026-10-14 17:00",
      "tags": [
        "vi-mo"
      ],
      "access": "public",
      "art": "building-2",
      "title": "Ngân hàng Nhà nước giữ nguyên lãi suất điều hành",
      "excerpt": "Mặt bằng lãi suất ổn định tiếp tục hỗ trợ tăng trưởng tín dụng trong quý cuối năm."
    },
    {
      "id": 35,
      "slug": "mbb-duoc-khoi-ngoai-mua-rong-hon-200-ty-dong",
      "date": "2026-10-14 16:42",
      "tags": [
        "MBB",
        "khoi-ngoai",
        "thi-truong"
      ],
      "access": "public",
      "art": "building-2",
      "title": "MBB được khối ngoại mua ròng hơn 200 tỷ đồng",
      "excerpt": "Khối ngoại quay lại mua ròng cổ phiếu ngân hàng, trong đó MBB dẫn đầu với giá trị hơn 200 tỷ đồng."
    },
    {
      "id": 36,
      "slug": "nhan-dinh-thi-truong-14-10-ky-vong-hoi-phuc-sau-nhip-chinh",
      "date": "2026-10-14 07:30",
      "tags": [
        "nhan-dinh",
        "thi-truong"
      ],
      "access": "member",
      "art": "chart",
      "title": "Nhận định thị trường 14/10: Kỳ vọng hồi phục sau nhịp chỉnh",
      "excerpt": "Áp lực bán đã giảm dần, nhiều cổ phiếu đầu ngành về vùng hỗ trợ mạnh. Chiến lược giải ngân từng phần."
    },
    {
      "id": 37,
      "slug": "ssi-du-kien-phat-hanh-them-co-phieu-de-tang-von",
      "date": "2026-10-13 11:20",
      "tags": [
        "SSI",
        "doanh-nghiep"
      ],
      "access": "public",
      "art": "building",
      "title": "SSI dự kiến phát hành thêm cổ phiếu để tăng vốn",
      "excerpt": "Hội đồng quản trị thông qua phương án phát hành, nâng vốn điều lệ để mở rộng dư nợ cho vay ký quỹ."
    },
    {
      "id": 38,
      "slug": "fed-giu-nguyen-lai-suat-chung-khoan-my-tang-diem",
      "date": "2026-10-13 07:30",
      "tags": [
        "quoc-te"
      ],
      "access": "public",
      "art": "chart",
      "title": "Fed giữ nguyên lãi suất, chứng khoán Mỹ tăng điểm",
      "excerpt": "Thông điệp thận trọng nhưng không quá diều hâu từ Fed giúp tâm lý nhà đầu tư toàn cầu cải thiện."
    },
    {
      "id": 39,
      "slug": "phan-tich-chuyen-sau-mbb-dinh-gia-sau-quy-iii-p-b-duoi-trung-binh-5-nam",
      "date": "2026-10-12 20:00",
      "tags": [
        "MBB",
        "doanh-nghiep",
        "bctc"
      ],
      "access": "member",
      "art": "chart",
      "title": "Phân tích chuyên sâu MBB: định giá sau quý III, P/B dưới trung bình 5 năm",
      "excerpt": "So với nhóm ngân hàng cùng quy mô, MBB đang giao dịch ở mức P/B thấp hơn trong khi ROE thuộc nhóm cao nhất."
    },
    {
      "id": 40,
      "slug": "hpg-dung-quat-2-van-hanh-san-luong-thep-quy-iv-du-kien-tang-manh",
      "date": "2026-10-12 10:00",
      "tags": [
        "HPG",
        "doanh-nghiep",
        "bctc"
      ],
      "access": "public",
      "art": "building-2",
      "title": "HPG: Dung Quất 2 vận hành, sản lượng thép quý IV dự kiến tăng mạnh",
      "excerpt": "Khu liên hợp mới giúp nâng công suất thép thô, mở ra dư địa tăng trưởng cho năm tới."
    },
    {
      "id": 41,
      "slug": "khoi-ngoai-mua-rong-hon-500-ty-dong-tren-hose",
      "date": "2026-10-11 15:20",
      "tags": [
        "khoi-ngoai",
        "thi-truong"
      ],
      "access": "public",
      "art": "building",
      "title": "Khối ngoại mua ròng hơn 500 tỷ đồng trên HOSE",
      "excerpt": "Dòng vốn ngoại tập trung vào nhóm ngân hàng và bán lẻ, chấm dứt chuỗi bán ròng kéo dài hai tuần."
    },
    {
      "id": 42,
      "slug": "fpt-ky-hop-dong-chuyen-doi-so-tri-gia-lon-tai-nhat-ban",
      "date": "2026-10-11 09:45",
      "tags": [
        "FPT",
        "doanh-nghiep"
      ],
      "access": "public",
      "art": "building",
      "title": "FPT ký hợp đồng chuyển đổi số trị giá lớn tại Nhật Bản",
      "excerpt": "Mảng dịch vụ công nghệ thông tin nước ngoài tiếp tục là động lực tăng trưởng chính của tập đoàn."
    },
    {
      "id": 43,
      "slug": "danh-muc-10-co-phieu-co-tuc-tien-mat-cao-dong-tien-on-dinh",
      "date": "2026-10-10 20:00",
      "tags": [
        "co-tuc",
        "doanh-nghiep"
      ],
      "access": "vip",
      "art": "pie",
      "title": "Danh mục 10 cổ phiếu cổ tức tiền mặt cao, dòng tiền ổn định",
      "excerpt": "Bộ lọc cổ phiếu trả cổ tức đều 5 năm liền, nợ vay thấp và dòng tiền kinh doanh dương. Dành riêng tài khoản Đầu tư cùng Vũ."
    },
    {
      "id": 44,
      "slug": "vcb-giu-vi-tri-ngan-hang-co-loi-nhuan-cao-nhat-he-thong",
      "date": "2026-10-10 13:00",
      "tags": [
        "VCB",
        "doanh-nghiep",
        "bctc"
      ],
      "access": "public",
      "art": "building-2",
      "title": "VCB giữ vị trí ngân hàng có lợi nhuận cao nhất hệ thống",
      "excerpt": "Lợi nhuận 9 tháng ước đạt mức cao nhất toàn ngành, tỷ lệ bao phủ nợ xấu duy trì trên 200%."
    },
    {
      "id": 45,
      "slug": "gia-dau-the-gioi-giam-xuong-duoi-80-usd-thung",
      "date": "2026-10-09 08:15",
      "tags": [
        "quoc-te",
        "vi-mo"
      ],
      "access": "public",
      "art": "chart",
      "title": "Giá dầu thế giới giảm xuống dưới 80 USD/thùng",
      "excerpt": "Lo ngại về nhu cầu khiến giá dầu Brent quay đầu giảm, tác động tới nhóm cổ phiếu dầu khí trong nước."
    },
    {
      "id": 46,
      "slug": "cpi-thang-9-tang-0-3-lam-phat-van-trong-tam-kiem-soat",
      "date": "2026-10-08 09:00",
      "tags": [
        "vi-mo"
      ],
      "access": "user",
      "art": "chart",
      "title": "CPI tháng 9 tăng 0,3%, lạm phát vẫn trong tầm kiểm soát",
      "excerpt": "Lạm phát bình quân 9 tháng thấp hơn mục tiêu, tạo dư địa cho chính sách tiền tệ nới lỏng."
    },
    {
      "id": 47,
      "slug": "cap-nhat-bieu-do-ky-thuat-mbb-xu-huong-tang-van-duoc-duy-tri",
      "date": "2026-10-07 09:05",
      "tags": [
        "MBB",
        "thi-truong"
      ],
      "access": "user",
      "art": "chart",
      "title": "Cập nhật biểu đồ kỹ thuật MBB: xu hướng tăng vẫn được duy trì",
      "excerpt": "Giá giữ vững trên đường MA50, thanh khoản cải thiện. Vùng hỗ trợ gần nhất quanh 23.500 đồng."
    }
  ],
  "brokers": [
    {
      "id": "vps",
      "name": "VPS",
      "note": "Phí giao dịch thấp",
      "color": "#e21b23",
      "bg": "#fff4f0",
      "openUrl": "https://www.vps.com.vn",
      "refCode": "",
      "transferUrl": "",
      "transferCode": "",
      "openVideo": "",
      "transferVideo": ""
    },
    {
      "id": "ssi",
      "name": "SSI",
      "note": "Đội ngũ uy tín",
      "color": "#d71920",
      "bg": "#fff1f1",
      "openUrl": "https://www.ssi.com.vn",
      "refCode": "",
      "transferUrl": "",
      "transferCode": "",
      "openVideo": "",
      "transferVideo": ""
    },
    {
      "id": "mbs",
      "name": "MBS",
      "note": "Nền tảng mạnh",
      "color": "#1e3a8a",
      "bg": "#eef3ff",
      "openUrl": "https://mbs.com.vn",
      "refCode": "",
      "transferUrl": "",
      "transferCode": "",
      "openVideo": "",
      "transferVideo": ""
    },
    {
      "id": "tcbs",
      "name": "TCBS",
      "note": "Nhiều ưu đãi",
      "color": "#e3262e",
      "bg": "#fff1f1",
      "openUrl": "https://www.tcbs.com.vn",
      "refCode": "",
      "transferUrl": "",
      "transferCode": "",
      "openVideo": "",
      "transferVideo": ""
    },
    {
      "id": "hsc",
      "name": "HSC",
      "note": "Hỗ trợ tốt",
      "color": "#0b3c8c",
      "bg": "#eef3ff",
      "openUrl": "https://www.hsc.com.vn",
      "refCode": "",
      "transferUrl": "",
      "transferCode": "",
      "openVideo": "",
      "transferVideo": ""
    },
    {
      "id": "kis",
      "name": "KIS",
      "note": "Dịch vụ chuyên nghiệp",
      "color": "#0f4c81",
      "bg": "#eef6ff",
      "openUrl": "https://www.kisvn.vn",
      "refCode": "",
      "transferUrl": "",
      "transferCode": "",
      "openVideo": "",
      "transferVideo": ""
    }
  ]
};
