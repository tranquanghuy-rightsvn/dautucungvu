/* Trang mở tài khoản / chuyển ID */
(function () {
  const { icon, escapeHtml, video, contactButtons } = UI;
  const D = APP_DATA;
  const S = D.site;
  const chosen = { open: D.brokers[0].id, transfer: D.brokers[0].id };

  document.querySelectorAll("[data-min-capital]").forEach((el) => (el.textContent = S.minCapital));
  document.querySelector("[data-contact]").innerHTML = contactButtons();

  function brokerGrid(flow) {
    return D.brokers
      .map(
        (b) =>
          '<div class="broker"><input type="radio" name="broker-' + flow + '" id="b-' + flow + "-" + b.id + '" value="' + b.id + '"' + (b.id === chosen[flow] ? " checked" : "") + ">" +
          '<label for="b-' + flow + "-" + b.id + '"><span class="wm" style="color:' + b.color + ";background:" + b.bg + '">' + b.name + "</span><small>" + escapeHtml(b.note) + '</small><span class="tick">' + icon("check") + "</span></label></div>"
      )
      .join("");
  }

  function copyRow(label, value) {
    return '<div class="copy-row"><span>' + label + "</span><b>" + escapeHtml(value) + '</b><button type="button" class="btn btn--outline btn--sm" data-copy="' + escapeHtml(value) + '">Sao chép</button></div>';
  }

  function openAction(b) {
    return (
      "<h3>2. Mở tài khoản tại " + b.name + "</h3>" +
      "<p>Bấm nút bên dưới, trang của " + b.name + " sẽ mở trong tab mới để bạn điền thông tin và xác thực eKYC (chụp CCCD, quay khuôn mặt).</p>" +
      (b.refCode ? copyRow("Mã giới thiệu cần nhập", b.refCode) : "") +
      '<a class="btn btn--green btn--lg btn--block" href="' + escapeHtml(b.openUrl) + '" target="_blank" rel="noopener">Mở tài khoản ' + b.name + icon("arrowRight") + "</a>" +
      '<p class="broker-hint">' + icon("info") + "<span>Chuẩn bị sẵn CCCD gắn chip và số điện thoại chính chủ. Xong thì nhắn Vũ ở cuối trang để kích hoạt quyền xem.</span></p>"
    );
  }

  function transferAction(b) {
    return (
      "<h3>2. Chuyển ID tại " + b.name + "</h3>" +
      "<p>Vào ứng dụng hoặc trang web của " + b.name + ", tìm mục <b>đổi môi giới / người chăm sóc</b> và nhập mã của Vũ. Nếu không tìm thấy, gọi tổng đài " + b.name + " và đề nghị chuyển sang mã bên dưới.</p>" +
      (b.transferCode ? copyRow("Mã môi giới / ID của Vũ", b.transferCode) : '<p class="broker-hint">' + icon("info") + "<span>Nhắn Zalo cho Vũ để nhận mã môi giới tại " + b.name + ".</span></p>") +
      (b.transferUrl ? '<a class="btn btn--navy btn--lg btn--block" href="' + escapeHtml(b.transferUrl) + '" target="_blank" rel="noopener">Mở trang đổi môi giới ' + b.name + icon("arrowRight") + "</a>" : "")
    );
  }

  function render(flow) {
    const b = D.brokers.find((x) => x.id === chosen[flow]);
    document.querySelector('[data-broker-action="' + flow + '"]').innerHTML = flow === "open" ? openAction(b) : transferAction(b);
    const vid = flow === "open" ? b.openVideo || S.videos.openAccount : b.transferVideo || S.videos.transferId;
    const title = (flow === "open" ? "Video hướng dẫn mở tài khoản " : "Video hướng dẫn chuyển ID tại ") + b.name;
    document.querySelector('[data-video-title="' + flow + '"]').textContent = title;
    document.querySelector('[data-broker-video="' + flow + '"]').innerHTML = video(vid, title);
  }

  ["open", "transfer"].forEach((flow) => {
    const grid = document.querySelector('[data-brokers="' + flow + '"]');
    grid.innerHTML = brokerGrid(flow);
    grid.addEventListener("change", (e) => {
      chosen[flow] = e.target.value;
      render(flow);
    });
    render(flow);
  });

})();
