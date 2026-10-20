// Dò lỗi TDZ: code chạy NGAY lúc nạp script (câu lệnh cấp cao nhất, IIFE, và các hàm nó gọi —
// lần theo chuỗi gọi) mà đụng tới const/let/class khai báo ở câu lệnh PHÍA SAU.
// Callback của addEventListener / setTimeout / then... coi là chạy sau (script đã nạp xong).
const acorn = require(require("path").resolve(__dirname, "../../../node_modules/acorn"));
const fs = require("fs");
const DEFERRED_CALLEES = new Set(["addEventListener", "setTimeout", "setInterval", "requestAnimationFrame", "then", "catch", "finally", "withSuccessHandler", "withFailureHandler", "observe", "queueMicrotask", "on", "once"]);
const isFn = (n) => n && (n.type === "FunctionExpression" || n.type === "ArrowFunctionExpression");

function analyzeSequence(stmts, file, scopeName, report) {
  const tdz = new Map(); // tên -> {idx, pos}
  const fns = new Map(); // tên hàm khai báo -> node
  stmts.forEach((s, idx) => {
    const st = s.type === "ExportNamedDeclaration" && s.declaration ? s.declaration : s;
    if (st.type === "VariableDeclaration" && st.kind !== "var") st.declarations.forEach((d) => collectNames(d.id).forEach((n) => tdz.set(n, { idx, pos: d.start, kind: st.kind })));
    if (st.type === "ClassDeclaration") tdz.set(st.id.name, { idx, pos: st.start, kind: "class" });
    if (st.type === "FunctionDeclaration") fns.set(st.id.name, st);
  });
  const memo = new Map();
  // refs chạy NGAY khi thực thi node (không vào callback hoãn), trả Set tên + đường gọi
  function eagerRefs(node, out, stack) {
    walk(node, out, stack);
  }
  function walk(n, out, stack) {
    if (!n || typeof n.type !== "string") return;
    if (n.type === "Identifier") { out.push({ name: n.name, pos: n.start, via: stack }); return; }
    if (isFn(n) || n.type === "FunctionDeclaration") return; // thân hàm: chỉ chạy khi được gọi
    if (n.type === "CallExpression" || n.type === "NewExpression") {
      const cal = n.callee;
      const calleeName = cal.type === "Identifier" ? cal.name : cal.type === "MemberExpression" && !cal.computed ? cal.property.name : null;
      // IIFE: (function(){...})() -> chạy ngay
      if (isFn(cal)) walkBody(cal, out, stack.concat("IIFE"));
      else walk(cal, out, stack);
      // gọi hàm khai báo cùng phạm vi -> lần vào thân
      if (cal.type === "Identifier" && fns.has(cal.name)) callInto(cal.name, out, stack);
      n.arguments.forEach((a) => {
        if (isFn(a)) { if (!DEFERRED_CALLEES.has(calleeName)) walkBody(a, out, stack.concat("callback của " + (calleeName || "?"))); }
        else if (a.type === "Identifier" && fns.has(a.name) && !DEFERRED_CALLEES.has(calleeName)) { walk(a, out, stack); callInto(a.name, out, stack); }
        else walk(a, out, stack);
      });
      return;
    }
    if (n.type === "MemberExpression") { walk(n.object, out, stack); if (n.computed) walk(n.property, out, stack); return; }
    if (n.type === "Property" && !n.computed) { walk(n.value, out, stack); return; }
    if (n.type === "AssignmentExpression" && n.left.type === "MemberExpression" && !n.left.computed && /^on/.test(n.left.property.name) && (isFn(n.right) || n.right.type === "Identifier")) { walk(n.left, out, stack); return; }
    for (const k of Object.keys(n)) {
      if (k === "type" || k === "start" || k === "end" || k === "loc") continue;
      const v = n[k];
      if (Array.isArray(v)) v.forEach((x) => walk(x, out, stack));
      else if (v && typeof v.type === "string") walk(v, out, stack);
    }
  }
  function walkBody(fn, out, stack) {
    if (fn.body.type === "BlockStatement") fn.body.body.forEach((s) => walk(s, out, stack));
    else walk(fn.body, out, stack);
  }
  function callInto(name, out, stack) {
    if (stack.includes(name + "()")) return; // đệ quy
    if (stack.length > 40) return;
    walkBody(fns.get(name), out, stack.concat(name + "()"));
  }
  stmts.forEach((s, idx) => {
    if (s.type === "FunctionDeclaration" || s.type === "ImportDeclaration") return;
    const out = [];
    eagerRefs(s, out, []);
    const seen = new Set();
    out.forEach((r) => {
      const d = tdz.get(r.name);
      if (!d) return;
      const later = d.idx > idx || (d.idx === idx && r.pos < d.pos && r.via.length > 0);
      if (!later) return;
      const key = r.name + "|" + idx;
      if (seen.has(key)) return; seen.add(key);
      const line = (p) => src.slice(0, p).split("\n").length;
      report.push(`${file}:${line(s.start)} [${scopeName}] câu lệnh chạy lúc nạp dùng ${d.kind} ${r.name} (khai báo dòng ${line(d.pos)}) qua: ${r.via.join(" → ") || "(trực tiếp)"}`);
    });
    // IIFE cấp cao (kiểu file site): phân tích thân như 1 phạm vi riêng
    const e = s.type === "ExpressionStatement" ? s.expression : null;
    const call = e && (e.type === "CallExpression" ? e : e.type === "UnaryExpression" && e.argument.type === "CallExpression" ? e.argument : null);
    if (call && isFn(call.callee) && call.callee.body.type === "BlockStatement") analyzeSequence(call.callee.body.body, file, "IIFE dòng " + src.slice(0, call.start).split("\n").length, report);
  });
}
function collectNames(p) {
  if (!p) return [];
  if (p.type === "Identifier") return [p.name];
  if (p.type === "ObjectPattern") return p.properties.flatMap((q) => collectNames(q.value || q.argument));
  if (p.type === "ArrayPattern") return p.elements.flatMap(collectNames);
  if (p.type === "AssignmentPattern") return collectNames(p.left);
  if (p.type === "RestElement") return collectNames(p.argument);
  return [];
}
let src;
const report = [];
for (const f of process.argv.slice(2)) {
  src = fs.readFileSync(f, "utf8");
  const ast = acorn.parse(src, { ecmaVersion: 2022, sourceType: /(^|\/)worker\//.test(f) ? "module" : "script", allowHashBang: true });
  analyzeSequence(ast.body, f.replace(/^.*\/js-check\//, ""), "top", report);
}
console.log(report.length ? report.join("\n") : "Không thấy chỗ nào dùng const/let trước khi khởi tạo.");
