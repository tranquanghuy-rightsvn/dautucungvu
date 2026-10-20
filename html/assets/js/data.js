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
      "art": "candles",
      "cover": "images/courses/nhap-mon-chung-khoan/cover.jpg",
      "order": 1,
      "lessons": [
        {
          "slug": "chung-khoan-la-gi-vi-sao-nen-dau-tu",
          "t": "Chứng khoán là gì, vì sao nên đầu tư",
          "m": 12,
          "video": "mp4"
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
      "access": "public"
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
  "news": [],
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
