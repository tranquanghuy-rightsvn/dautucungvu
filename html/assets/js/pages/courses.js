/* Trang khóa học: danh sách bên trái, video bài giảng bên phải */
(function () {
  const { icon, fmt, norm, store, auth, access, escapeHtml, toast, url, courseThumb, priceTag, video, gate } = UI;
  const D = APP_DATA;
  const params = new URLSearchParams(location.search);
  const listEl = document.querySelector("[data-course-list]");
  const detailEl = document.querySelector("[data-course-detail]");
  const searchEl = document.getElementById("course-search");

  let filter = ["free", "paid", "mine"].includes(params.get("loc")) ? params.get("loc") : "all";
  let course = D.courses.find((c) => c.id === params.get("khoa")) || D.courses[0];
  let lessonIdx = Math.max(0, Math.min(course.lessons.length - 1, (+params.get("bai") || 1) - 1));

  /* ----- Tiến độ: { courseId: [chỉ số bài đã học] } ----- */
  function progress() {
    const p = store.get("dtcv-progress", {});
    return Array.isArray(p) || !p ? {} : p; // định dạng cũ là mảng: bỏ qua
  }
  const doneOf = (c) => progress()[c.id] || [];
  function toggleDone(c, i) {
    const p = progress();
    const set = new Set(p[c.id] || []);
    set.has(i) ? set.delete(i) : set.add(i);
    p[c.id] = Array.from(set).sort((a, b) => a - b);
    store.set("dtcv-progress", p);
    return set.has(i);
  }

  const totalMin = (c) => c.lessons.reduce((a, l) => a + (l.m || 0), 0);
  const hours = fmt.duration;

  function syncUrl() {
    const u = new URL(location.href);
    u.searchParams.set("khoa", course.id);
    lessonIdx ? u.searchParams.set("bai", lessonIdx + 1) : u.searchParams.delete("bai");
    filter === "all" ? u.searchParams.delete("loc") : u.searchParams.set("loc", filter);
    history.replaceState(null, "", u);
  }

  /* ----- Danh sách khóa học ----- */
  function visibleCourses() {
    const q = norm(searchEl.value);
    const u = auth.user();
    return D.courses.filter((c) => {
      if (filter === "free" && c.price) return false;
      if (filter === "paid" && !c.price) return false;
      if (filter === "mine" && !(u && (u.vip || (u.courses || []).includes(c.id) || doneOf(c).length))) return false;
      return !q || norm(c.title + " " + c.desc).includes(q);
    });
  }

  function renderList() {
    const items = visibleCourses();
    const u = auth.user();
    if (!items.length) {
      let msg;
      if (filter === "mine" && !u) msg = '<p>Đăng nhập để xem khóa học bạn đã mua và tiến độ học.</p><button class="btn btn--navy btn--sm" type="button" data-login>Đăng nhập</button>';
      else if (filter === "mine") msg = '<p>Bạn chưa có khóa học nào. Bắt đầu với một khóa miễn phí nhé.</p><button class="btn btn--outline btn--sm" type="button" data-pick-filter="free">Xem khóa miễn phí</button>';
      else msg = "<p>Không tìm thấy khóa học phù hợp. Thử từ khóa ngắn hơn.</p>";
      listEl.innerHTML = '<li class="course-picker-empty">' + msg + "</li>";
      return;
    }
    listEl.innerHTML = items
      .map((c) => {
        const owned = c.price && access.ownsCourse(c);
        const done = doneOf(c).length;
        return (
          '<li><button type="button" class="course-pick" data-course="' + c.id + '"' + (c.id === course.id ? ' aria-current="true"' : "") + ">" +
          '<span class="course-pick-thumb">' + courseThumb(c) + "</span>" +
          '<span class="course-pick-body"><b>' + escapeHtml(c.title) + "</b>" +
          "<small>" + c.lessons.length + " video · " + hours(totalMin(c)) + (done ? " · đã học " + done + "/" + c.lessons.length : "") + "</small>" +
          (owned ? '<span class="price price--owned">' + icon("check") + "Đã sở hữu</span>" : priceTag(c)) +
          "</span></button></li>"
        );
      })
      .join("");
  }

  /* ----- Chi tiết khóa học + video ----- */
  function renderDetail() {
    const c = course;
    const owned = access.ownsCourse(c);
    const done = doneOf(c);
    const lesson = c.lessons[lessonIdx];
    const canWatch = access.canLesson(c, lesson);
    const S = D.site;

    let buy = "";
    if (c.price && !owned) {
      buy =
        '<div class="buy-box"><div><span class="buy-price">' + fmt.vnd(c.price) + "</span><small>Trọn bộ " + c.lessons.length + " video, học không giới hạn</small></div>" +
        '<a class="btn btn--gold" href="' + url("thanh-toan/") + "?khoa=" + c.id + '">Mua ngay</a></div>' +
        '<p class="buy-alt">' + icon("gift") + "<span>Hoặc học miễn phí khi mở tài khoản / chuyển ID về Đầu tư cùng Vũ với vốn từ " + S.minCapital + '. <a href="' + url("mo-tai-khoan/") + '">Xem cách làm</a></span></p>';
    } else if (c.price) {
      buy = '<p class="owned-note">' + icon("checkCircle") + "Bạn đã sở hữu khóa học này</p>";
    } else if (!owned) {
      buy = '<p class="owned-note owned-note--free">' + icon("info") + "Khóa miễn phí, cần đăng nhập để xem</p>";
    }

    let player;
    if (canWatch) {
      player = video(lesson.video, lesson.t);
    } else if (!c.price) {
      player = '<div class="player-lock">' + gate("user") + "</div>";
    } else {
      player = '<div class="player-lock">' + gate("course", { course: c }) + "</div>";
    }

    const pct = Math.round((done.length / c.lessons.length) * 100);
    detailEl.innerHTML =
      '<div class="panel panel-pad course-head">' +
      '<div class="course-head-main"><h2>' + escapeHtml(c.title) + "</h2>" +
      "<p>" + escapeHtml(c.desc) + "</p>" +
      '<p class="course-facts"><span>' + icon("play") + c.lessons.length + " video bài giảng</span><span>" + icon("clock") + hours(totalMin(c)) + "</span>" +
      (c.price ? "" : '<span class="price price--free">Miễn phí</span>') + "</p></div>" +
      buy + "</div>" +
      '<div class="panel player-card">' + player +
      '<div class="player-bar"><div><small>Bài ' + (lessonIdx + 1) + "/" + c.lessons.length + "</small><h3>" + escapeHtml(lesson.t) + "</h3></div>" +
      '<div class="player-actions">' +
      (canWatch && auth.user() ? '<button class="btn btn--outline btn--sm" type="button" data-mark-done aria-pressed="' + done.includes(lessonIdx) + '">' + icon("check") + (done.includes(lessonIdx) ? "Đã học" : "Đánh dấu đã học") + "</button>" : "") +
      '<button class="icon-btn" type="button" data-step="-1" aria-label="Bài trước"' + (lessonIdx === 0 ? " disabled" : "") + ">" + icon("chevronRight", 'style="transform:rotate(180deg)"') + "</button>" +
      '<button class="icon-btn" type="button" data-step="1" aria-label="Bài tiếp theo"' + (lessonIdx === c.lessons.length - 1 ? " disabled" : "") + ">" + icon("chevronRight") + "</button>" +
      "</div></div></div>" +
      '<div class="panel panel-pad">' +
      '<div class="card-title"><h3>Nội dung khóa học</h3>' + (done.length ? '<span class="progress-label">' + done.length + "/" + c.lessons.length + " bài · " + pct + "%</span>" : "") + "</div>" +
      (done.length ? '<div class="progress-track" style="margin-top:10px"><i style="width:' + pct + '%"></i></div>' : "") +
      '<ol class="lesson-list">' +
      c.lessons
        .map((l, i) => {
          const can = access.canLesson(c, l);
          const isDone = done.includes(i);
          const cls = i === lessonIdx ? "is-current" : isDone ? "is-done" : !can ? "is-locked" : "";
          return (
            '<li class="lesson ' + cls + '"><span class="lesson-no">' + (isDone ? icon("check") : i + 1) + "</span>" +
            '<button type="button" class="lesson-title" data-lesson="' + i + '"' + (i === lessonIdx ? ' aria-current="true"' : "") + ">" + escapeHtml(l.t) +
            (l.preview && c.price && !access.ownsCourse(c) ? ' <span class="badge badge--green">Học thử</span>' : "") + "</button>" +
            '<span class="lesson-time">' + (l.m ? l.m + " phút" : "") + "</span>" +
            '<span class="lesson-state">' + icon(can ? "play" : "lock") + '<span class="sr-only">' + (can ? "Xem được" : "Đang khóa") + "</span></span></li>"
          );
        })
        .join("") +
      "</ol></div>";
  }

  function render() {
    renderList();
    renderDetail();
    syncUrl();
  }

  /* ----- Sự kiện ----- */
  const filterTabs = UI.tabs(document.querySelector("[data-course-filter]"), (v) => {
    filter = v;
    renderList();
    syncUrl();
  });

  searchEl.addEventListener("input", renderList);

  document.addEventListener("click", (e) => {
    const pick = e.target.closest("[data-course]");
    if (pick) {
      course = D.courses.find((c) => c.id === pick.dataset.course);
      lessonIdx = 0;
      render();
      // Trên mobile danh sách nằm trên: đưa người dùng tới phần video
      if (window.matchMedia("(max-width: 960px)").matches) detailEl.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const les = e.target.closest("[data-lesson]");
    if (les) {
      lessonIdx = +les.dataset.lesson;
      render();
      detailEl.querySelector(".player-card").scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }
    const step = e.target.closest("[data-step]");
    if (step && !step.disabled) {
      lessonIdx = Math.max(0, Math.min(course.lessons.length - 1, lessonIdx + +step.dataset.step));
      render();
      return;
    }
    if (e.target.closest("[data-mark-done]")) {
      const on = toggleDone(course, lessonIdx);
      toast(on ? "Đã đánh dấu hoàn thành: " + course.lessons[lessonIdx].t : "Đã bỏ đánh dấu bài học.");
      render();
      return;
    }
    const pf = e.target.closest("[data-pick-filter]");
    if (pf) filterTabs.select(pf.dataset.pickFilter);
  });

  document.addEventListener("auth:change", render);

  if (filter !== "all") {
    const list = document.querySelector("[data-course-filter]");
    list.classList.add("is-instant");
    filterTabs.select(filter);
    requestAnimationFrame(() => requestAnimationFrame(() => list.classList.remove("is-instant")));
  }
  render();
})();
