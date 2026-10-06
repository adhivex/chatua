import { publicObjectUrl, SAFE_PATH, storageConfigured } from "@/lib/storage";

// Streams public product photos from Supabase Storage so the Supabase API stays private.
export async function GET(_req: Request, ctx: RouteContext<"/media/[...path]">) {
  const path = (await ctx.params).path.join("/");
  if (!storageConfigured() || !SAFE_PATH.test(path)) return new Response("Not found", { status: 404 });

  const upstream = await fetch(publicObjectUrl(path), { signal: AbortSignal.timeout(15_000), cache: "no-store" }).catch(() => null);
  if (!upstream?.ok || !upstream.body) return new Response("Not found", { status: 404 });

  const type = upstream.headers.get("content-type") ?? "";
  if (!type.startsWith("image/")) return new Response("Not found", { status: 404 });

  return new Response(upstream.body, {
    headers: {
      "Content-Type": type,
      // Uploads get a fresh random file name, so a path never changes content.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
