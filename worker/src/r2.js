/* Phát file từ R2 có hỗ trợ Range (tua video). Người có quyền vẫn tải về được — chấp nhận
   (GAS.md mục 0). Việc kiểm tra quyền làm ở nơi gọi hàm này. */
export async function streamObject(bucket, key, request) {
  const hasRange = request.headers.has("range");
  const obj = await bucket.get(key, hasRange ? { range: request.headers } : undefined);
  if (!obj) return new Response("Không tìm thấy video", { status: 404 });

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  if (!headers.has("content-type")) headers.set("content-type", "video/mp4");
  headers.set("etag", obj.httpEtag);
  headers.set("accept-ranges", "bytes");
  headers.set("cache-control", "private, no-store");

  if (hasRange && obj.range) {
    const size = obj.size;
    let offset, length;
    // obj.range luôn có đủ khóa offset/length/suffix (giá trị undefined nếu không dùng) — không dùng `in`
    if (obj.range.suffix !== undefined) {
      length = Math.min(obj.range.suffix, size);
      offset = size - length;
    } else {
      offset = obj.range.offset ?? 0;
      length = obj.range.length ?? size - offset;
    }
    headers.set("content-range", `bytes ${offset}-${offset + length - 1}/${size}`);
    headers.set("content-length", String(length));
    return new Response(obj.body, { status: 206, headers });
  }
  headers.set("content-length", String(obj.size));
  return new Response(obj.body, { status: 200, headers });
}
