export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: "Missing url parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Target returned HTTP ${res.status}`);
    }

    const html = await res.text();
    return new Response(JSON.stringify({ contents: html, status: 200 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    // Fallback: try proxy if direct failed
    try {
      const proxyRes = await fetch(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`);
      if (proxyRes.ok) {
        const proxyHtml = await proxyRes.text();
        return new Response(JSON.stringify({ contents: proxyHtml, status: 200 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch {}

    return new Response(JSON.stringify({ error: err.message || "Failed to fetch website" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
