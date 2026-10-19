/* Trang gói hội viên: bảng giá 1/3/6/12 tháng, bảng quyền xem, nội dung độc quyền */
(function () {
  const { icon, fmt, url, auth, access, Charts, newsItem, newsSorted, escapeHtml } = UI;
  const D = APP_DATA;
  const S = D.site;
  const M = S.membership;

  document.querySelectorAll("[data-price-month]").forEach((el) => (el.textContent = fmt.vnd(M.pricePerMonth)));

  const bannerArt = document.querySelector("[data-banner-art]");
  bannerArt.innerHTML = Charts.candles(Charts.ohlc(50, "premium", 100, 0.05, 0.03), { w: 1200, h: 220, up: "#f6c64a", down: "#b7791f", ma: false });
  bannerArt.style.opacity = ".3";
  bannerArt.style.maskImage = "linear-gradient(90deg, transparent 35%, #000 85%)";
  bannerArt.style.webkitMaskImage = bannerArt.style.maskImage;

  function status() {
    const u = auth.user();
    const el = document.querySelector("[data-member-status]");
    if (!u) {
      el.innerHTML = "";
      return;
    }
    const role = access.role(u);
    let text;
    if (role === "vip") text = "Bạn đang dùng <b>tài khoản Đầu tư cùng Vũ</b>: xem toàn bộ nội dung, không giới hạn thời gian.";
    else if (role === "member") text = "Bạn là <b>hội viên</b> tới ngày <b>" + fmt.date(u.memberUntil) + "</b>. Gia hạn trước ngày này để không bị gián đoạn.";
    else if (access.memberExpired(u)) text = "Gói hội viên của bạn đã hết hạn ngày <b>" + fmt.date(u.memberUntil) + "</b>. Chọn gói bên dưới để gia hạn.";
    else text = "Bạn đang là <b>thành viên thường</b>. Chọn một gói bên dưới để xem nhận định và bài viết độc quyền.";
    el.innerHTML = '<div class="container"><p class="member-status member-status--' + role + '">' + icon(role === "vip" ? "shield" : role === "member" ? "crown" : "info") + "<span>" + text + "</span></p></div>";
  }

  function plans() {
    const u = auth.user();
    const best = 12;
    document.querySelector("[data-plans]").innerHTML =
      M.months
        .map((m) => {
          const total = M.pricePerMonth * m;
          return (
            '<article class="panel plan' + (m === best ? " plan--best" : "") + '">' +
            (m === best ? '<span class="plan-flag">Dài hạn</span>' : "") +
            "<h3>" + m + " tháng</h3>" +
            '<p class="plan-price">' + fmt.vnd(total) + "</p>" +
            "<small>" + fmt.vnd(M.pricePerMonth) + " / tháng</small>" +
            '<a class="btn ' + (m === best ? "btn--gold" : "btn--navy") + ' btn--block" href="' + url("thanh-toan/") + "?goi=" + m + '">' + (access.memberActive(u) ? "Gia hạn" : "Chọn gói") + "</a></article>"
          );
        })
        .join("") +
      '<article class="panel plan plan--vip"><h3>Tài khoản 50 triệu</h3><p class="plan-price">Miễn phí</p><small>Không giới hạn thời gian</small>' +
      "<p>" + escapeHtml(S.offerTitle) + " với vốn từ " + S.minCapital + ".</p>" +
      '<a class="btn btn--outline btn--block" href="' + url("mo-tai-khoan/") + '">Xem cách làm</a></article>';
  }

  function matrix() {
    const yes = '<span class="mx-yes">' + icon("check") + '<span class="sr-only">Có</span></span>';
    const no = '<span class="mx-no">–<span class="sr-only">Không</span></span>';
    const cols = ["Khách", "Đã đăng nhập", "Hội viên", "Đã mua khóa", "Tài khoản 50tr"];
    const rows = [
      ["Tin tức thường", [1, 1, 1, 1, 1]],
      ["Tin cần đăng nhập", [0, 1, 1, 1, 1]],
      ["Nhận định thị trường", [0, 0, 1, 0, 1]],
      ["Bài viết, video độc quyền hội viên", [0, 0, 1, 0, 1]],
      ["Khóa học miễn phí", [1, 1, 1, 1, 1]],
      ["Khóa học có phí", [0, 0, 0, "Khóa đã mua", 1]],
      ["Nội dung riêng tài khoản 50tr", [0, 0, 0, 0, 1]],
      ["Thời hạn", ["–", "–", "Theo gói", "Không giới hạn", "Không giới hạn"]],
    ];
    const cell = (v) => (v === 1 ? yes : v === 0 ? no : '<span class="mx-text">' + v + "</span>");
    const mine = { guest: 0, user: 1, member: 2, vip: 4 }[access.role()];
    document.querySelector("[data-access-table]").innerHTML =
      '<table class="matrix"><thead><tr><th scope="col">Nội dung</th>' +
      cols.map((c, i) => '<th scope="col"' + (i === mine ? ' class="is-mine"' : "") + ">" + c + (i === mine ? "<small>Bạn</small>" : "") + "</th>").join("") +
      "</tr></thead><tbody>" +
      rows.map(([label, vals]) => '<tr><th scope="row">' + label + "</th>" + vals.map((v, i) => '<td data-col="' + cols[i] + (i === mine ? " (bạn)" : "") + '"' + (i === mine ? ' class="is-mine"' : "") + ">" + cell(v) + "</td>").join("") + "</tr>").join("") +
      "</tbody></table>";
  }

  function exclusive() {
    const list = newsSorted(D.news.filter((n) => n.access === "member" || n.access === "vip")).slice(0, 4);
    document.querySelector("[data-exclusive]").innerHTML = list.map(newsItem).join("");
  }

  function render() {
    status();
    plans();
    matrix();
    exclusive();
  }
  document.addEventListener("auth:change", render);
  render();
})();
