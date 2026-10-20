/* Link PUT có chữ ký (S3 API của R2) để trình duyệt admin upload THẲNG video lên R2,
   không đi qua GAS / Worker (GAS.md II.C). Cần secret R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY. */
import { AwsClient } from "aws4fetch";
import { HttpError } from "./http.js";

export async function presignPut(env, key, expiresIn) {
  if (!env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !/^[0-9a-f]{32}$/.test(env.R2_ACCOUNT_ID || "")) {
    throw new HttpError(500, "Chưa cấu hình khóa lưu trữ video");
  }
  const client = new AwsClient({
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    service: "s3",
    region: "auto",
  });
  const url = new URL(`https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET}/${key}`);
  url.searchParams.set("X-Amz-Expires", String(expiresIn));
  const signed = await client.sign(new Request(url, { method: "PUT" }), { aws: { signQuery: true } });
  return signed.url;
}
