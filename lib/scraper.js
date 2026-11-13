export function normalizeUrl(raw) {
  let u = (raw || "").trim();
  if (!u) return "";
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  return u;
}

const PHONE_RE = /(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g;
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

function absUrl(href, base) {
  try { return new URL(href, base).href; } catch { return href; }
}

function parseDoc(doc, base) {
  const meta = (sel) => doc.querySelector(sel)?.getAttribute("content") || "";
  const title = doc.querySelector("title")?.textContent?.trim() || "";
  const description = meta('meta[name="description"]') || meta('meta[property="og:description"]') || "";
  const ogImage = meta('meta[property="og:image"]') || "";
  const bodyText = doc.body?.innerText || doc.body?.textContent || "";
  const phones = [...new Set((bodyText.match(PHONE_RE) || []).map((p) => p.trim()))].slice(0, 5);
  const emails = [...new Set((bodyText.match(EMAIL_RE) || []).map((e) => e.toLowerCase()))]
    .filter((e) => !e.endsWith(".png") && !e.endsWith(".jpg")).slice(0, 5);
  const services = [...new Set(
    [...doc.querySelectorAll("h2, h3")].map((h) => h.textContent.trim()).filter((t) => t && t.length > 2 && t.length < 80)
  )].slice(0, 20);

  // Logo: og:image first, then an <img> whose src/alt mentions "logo"
  let logo = ogImage ? absUrl(ogImage, base) : "";
  if (!logo) {
    const img = [...doc.querySelectorAll("img")].find((i) => /logo/i.test(i.getAttribute("src") || "") || /logo/i.test(i.getAttribute("alt") || ""));
    if (img) logo = absUrl(img.getAttribute("src"), base);
  }

  // Address heuristic
  let address = "";
  const postal = doc.querySelector('[itemtype*="PostalAddress"]');
  if (postal) address = postal.textContent.replace(/\s+/g, " ").trim();
  if (!address) {
    const m = bodyText.match(/[0-9]{1,5}\s+[A-Za-z0-9 .'-]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Way|Court|Ct)[^,\n]{0,60}/i);
    if (m) address = m[0].trim();
  }

  const contactLink = [...doc.querySelectorAll("a")].find((a) => /contact/i.test(a.textContent || "") || /contact/i.test(a.getAttribute("href") || ""));
  return { title, description, ogImage, logo, phones, emails, services, address, contactUrl: contactLink ? absUrl(contactLink.getAttribute("href"), base) : "" };
}

async function fetchHtmlWithFallbacks(targetUrl) {
  // Strategy 1: Internal Next.js server route (No CORS, high speed)
  try {
    const internalRes = await fetch(`/api/scrape?url=${encodeURIComponent(targetUrl)}`);
    if (internalRes.ok) {
      const data = await internalRes.json();
      if (data.contents) return data.contents;
    }
  } catch (e) {
    console.warn("Internal scrape route failed, attempting proxy fallback:", e);
  }

  // Strategy 2: corsproxy.io
  try {
    const proxyRes = await fetch(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`);
    if (proxyRes.ok) {
      return await proxyRes.text();
    }
  } catch (e) {
    console.warn("corsproxy.io failed, attempting allorigins fallback:", e);
  }

  // Strategy 3: allorigins raw proxy
  const aoRes = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`);
  if (!aoRes.ok) throw new Error("Could not reach website. Please check the URL or fill manually.");
  return await aoRes.text();
}

export async function fetchBusinessData(rawUrl, onStatus) {
  const url = normalizeUrl(rawUrl);
  if (!url) throw new Error("Please enter a valid website URL.");

  onStatus?.("Connecting to website & extracting details…");
  const html = await fetchHtmlWithFallbacks(url);
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  let data = parseDoc(doc, url);

  // Second pass: extract from contact page if discovered
  if (data.contactUrl && data.contactUrl !== url) {
    try {
      onStatus?.("Scanning contact page for phone & address…");
      const contactHtml = await fetchHtmlWithFallbacks(data.contactUrl);
      const d2 = new DOMParser().parseFromString(contactHtml || "", "text/html");
      const extra = parseDoc(d2, data.contactUrl);
      data = {
        ...data,
        phones: [...new Set([...data.phones, ...extra.phones])],
        emails: [...new Set([...data.emails, ...extra.emails])],
        address: data.address || extra.address,
      };
    } catch {
      // Contact page is optional
    }
  }

  return { url, ...data };
}
