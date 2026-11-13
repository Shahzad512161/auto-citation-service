// Website auto-fetch via the allorigins proxy, exactly as specified.
// Runs in the browser, so the proxy (not our server) fetches the target site.
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
  const bodyText = doc.body?.innerText || "";
  const phones = [...new Set((bodyText.match(PHONE_RE) || []).map((p) => p.trim()))].slice(0, 5);
  const emails = [...new Set((bodyText.match(EMAIL_RE) || []).map((e) => e.toLowerCase()))]
    .filter((e) => !e.endsWith(".png") && !e.endsWith(".jpg")).slice(0, 5);
  const services = [...new Set(
    [...doc.querySelectorAll("h2, h3")].map((h) => h.textContent.trim()).filter((t) => t && t.length > 2 && t.length < 80)
  )].slice(0, 20);
  // Logo: og:image first, then an <img> whose src/alt mentions "logo".
  let logo = ogImage ? absUrl(ogImage, base) : "";
  if (!logo) {
    const img = [...doc.querySelectorAll("img")].find((i) => /logo/i.test(i.getAttribute("src") || "") || /logo/i.test(i.getAttribute("alt") || ""));
    if (img) logo = absUrl(img.getAttribute("src"), base);
  }
  // Address heuristic: schema.org PostalAddress, then a text line with a postcode pattern.
  let address = "";
  const postal = doc.querySelector('[itemtype*="PostalAddress"]');
  if (postal) address = postal.textContent.replace(/\s+/g, " ").trim();
  if (!address) {
    const m = bodyText.match(/[0-9]{1,5}\s+[A-Za-z0-9 .'-]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Way|Court|Ct)[^,\n]{0,60}/);
    if (m) address = m[0].trim();
  }
  const contactLink = [...doc.querySelectorAll("a")].find((a) => /contact/i.test(a.textContent || "") || /contact/i.test(a.getAttribute("href") || ""));
  return { title, description, ogImage, logo, phones, emails, services, address, contactUrl: contactLink ? absUrl(contactLink.getAttribute("href"), base) : "" };
}

export async function fetchBusinessData(rawUrl, onStatus) {
  const url = normalizeUrl(rawUrl);
  if (!url) throw new Error("Enter a website URL first.");
  onStatus?.("Aapki website se data nikal rahe hain...");
  const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error(`Proxy request failed (${res.status}). Try again or paste the details manually.`);
  const json = await res.json();
  const doc = new DOMParser().parseFromString(json.contents || "", "text/html");
  let data = parseDoc(doc, url);
  // Second pass: the contact page usually holds the real phone/address.
  if (data.contactUrl && data.contactUrl !== url) {
    try {
      onStatus?.("Contact page se phone aur address dhoond rahe hain...");
      const r2 = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(data.contactUrl)}`);
      if (r2.ok) {
        const j2 = await r2.json();
        const d2 = new DOMParser().parseFromString(j2.contents || "", "text/html");
        const extra = parseDoc(d2, data.contactUrl);
        data = {
          ...data,
          phones: [...new Set([...data.phones, ...extra.phones])],
          emails: [...new Set([...data.emails, ...extra.emails])],
          address: data.address || extra.address,
        };
      }
    } catch { /* contact page is a bonus, not a failure */ }
  }
  return { url, ...data };
}
