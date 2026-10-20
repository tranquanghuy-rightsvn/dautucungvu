#!/usr/bin/env bash
# Kiểm lỗi JS trước khi deploy CMS / site / Worker (GAS.md IX):
#   1. ESLint: gán lại const, biến/hàm không tồn tại, khai báo trùng...
#   2. tdz.js: code chạy LÚC NẠP script (lần theo chuỗi gọi hàm) dùng const/let khai báo phía sau
#      ("Cannot access 'X' before initialization" — ESLint không bắt được loại này).
# Cần node_modules có eslint + acorn + globals ở thư mục cha của repo (../node_modules).
# Chạy từ gốc repo: bash scripts/lint/check.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
W=scripts/lint/.js-check
rm -rf "$W"; mkdir -p "$W/src"
python3 - "$W/src" <<'PY'
import re, sys, pathlib, shutil
out = pathlib.Path(sys.argv[1])
def extract(src, dst):  # lấy <script> nội tuyến, giữ đúng số dòng của file gốc
    t = open(src).read(); res = []; pos = 0
    for m in re.finditer(r'(<script(?![^>]*\bsrc=)[^>]*>)([\s\S]*?)</script>', t):
        res.append("\n" * t[pos:m.end(1)].count("\n")); res.append(m.group(2)); pos = m.end(2)
    res.append("\n" * t[pos:].count("\n")); (out / dst).write_text("".join(res))
if pathlib.Path("gas/js.html").exists():
    extract("gas/js.html", "gas-js.js"); shutil.copy("gas/Code.js", out / "gas-Code.js")
extract("html/admin/index.html", "admin-index.js")
PY
cp -R html/assets/js "$W/site"; rm -f "$W/site/data.js"; cp -R worker/src "$W/worker"
cp scripts/lint/eslint.config.mjs "$W/"
(cd "$W" && ../../../../node_modules/.bin/eslint --no-config-lookup -c eslint.config.mjs "src/*.js" "site/**/*.js" "worker/**/*.js" | grep -v "'AbortSignal' is not defined" || true)
node scripts/lint/tdz.cjs "$W"/src/*.js "$W"/site/*.js "$W"/site/pages/*.js "$W"/worker/*.js
rm -rf "$W"
