/* Link PUT có chữ ký (S3 API của R2, AWS SigV4 dạng query) để trình duyệt admin upload THẲNG
   video lên R2, không đi qua GAS / Worker (GAS.md II.C). Cần secret R2_ACCESS_KEY_ID,
   R2_SECRET_ACCESS_KEY.
   Tự viết bằng WebCrypto, không dùng thư viện ngoài: Workers Builds deploy bằng
   `npx wrangler deploy`, không có bước cài dependency nào khác ngoài wrangler. */
import { HttpError } from "./http.js";

const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const sha256 = async (s) => hex(await crypto.subtle.digest("SHA-256", enc.encode(s)));
async function hmac(key, s) {
  const k = await crypto.subtle.importKey("raw", typeof key === "string" ? enc.encode(key) : key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return crypto.subtle.sign("HMAC", k, enc.encode(s));
}
// RFC 3986 (encodeURIComponent còn chừa !'()*)
const rfc3986 = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());

export async function presignPut(env, key, expiresIn, now = new Date()) {
  if (!env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !/^[0-9a-f]{32}$/.test(env.R2_ACCOUNT_ID || "")) {
    throw new HttpError(500, "Chưa cấu hình khóa lưu trữ video");
  }
  const host = `${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const path = "/" + [env.R2_BUCKET, ...key.split("/")].map(rfc3986).join("/");
  const amzDate = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); // yyyymmddThhmmssZ
  const day = amzDate.slice(0, 8);
  const scope = `${day}/auto/s3/aws4_request`;

  const params = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${env.R2_ACCESS_KEY_ID}/${scope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expiresIn),
    "X-Amz-SignedHeaders": "host",
  };
  const query = Object.keys(params).sort().map((k) => `${rfc3986(k)}=${rfc3986(params[k])}`).join("&");
  const canonical = ["PUT", path, query, `host:${host}\n`, "host", "UNSIGNED-PAYLOAD"].join("\n");
  const toSign = ["AWS4-HMAC-SHA256", amzDate, scope, await sha256(canonical)].join("\n");

  let k = await hmac("AWS4" + env.R2_SECRET_ACCESS_KEY, day);
  for (const part of ["auto", "s3", "aws4_request"]) k = await hmac(k, part);
  const signature = hex(await hmac(k, toSign));
  return `https://${host}${path}?${query}&X-Amz-Signature=${signature}`;
}
