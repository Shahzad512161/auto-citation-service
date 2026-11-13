// Global Citation Auto-Blaster Content Script
(() => {
  function matchField(el, patterns) {
    const text = [
      el.name,
      el.id,
      el.getAttribute("placeholder"),
      el.getAttribute("aria-label"),
      el.className,
      el.closest("label")?.textContent,
      el.parentElement?.textContent,
    ].filter(Boolean).join(" ").toLowerCase();

    return patterns.some((p) => {
      if (typeof p === "string") return text.includes(p);
      return p.test(text);
    });
  }

  function setVal(el, value) {
    if (!el || value === undefined || value === null || value === "") return false;
    if (el.tagName === "SELECT") {
      const lower = String(value).toLowerCase().trim();
      let matched = false;
      for (const opt of el.options) {
        if (opt.value.toLowerCase() === lower || opt.text.toLowerCase().includes(lower)) {
          el.value = opt.value;
          matched = true;
          break;
        }
      }
      if (!matched && el.options.length > 1) {
        // Fallback match first non-empty option if similar
        for (const opt of el.options) {
          if (opt.text.toLowerCase().split(/\s+/).some((w) => lower.includes(w) && w.length > 3)) {
            el.value = opt.value;
            matched = true;
            break;
          }
        }
      }
    } else {
      el.value = value;
    }

    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));

    // Green visual feedback
    el.style.outline = "2px solid #10B981";
    el.style.backgroundColor = "#F0FDF4";
    return true;
  }

  function fillDirectoryForm(biz) {
    if (!biz) return 0;
    let count = 0;
    const inputs = Array.from(document.querySelectorAll("input, textarea, select"));

    inputs.forEach((el) => {
      if (el.type === "hidden" || el.type === "submit" || el.type === "button") return;

      // Business / Company Name
      if (matchField(el, [/\b(business|company|org|trade|listing|store)\s*name\b/i, /^name$/i, "company", "bizname"])) {
        if (setVal(el, biz.name)) count++;
        return;
      }

      // Phone
      if (matchField(el, [/\bphone\b/i, /\btel\b/i, /\bmobile\b/i, /\bcontact\s*no\b/i, "telephone"])) {
        if (setVal(el, biz.phone)) count++;
        return;
      }

      // Email
      if (el.type === "email" || matchField(el, [/\bemail\b/i, "e-mail"])) {
        if (setVal(el, biz.email)) count++;
        return;
      }

      // Website
      if (el.type === "url" || matchField(el, [/\bwebsite\b/i, /\bweb\s*url\b/i, /\bhomepage\b/i, "site_url"])) {
        if (setVal(el, biz.website_url)) count++;
        return;
      }

      // Street Address
      if (matchField(el, [/\b(street|address|addr|location)\b/i, "address1", "address_line_1"])) {
        if (setVal(el, biz.address)) count++;
        return;
      }

      // City
      if (matchField(el, [/\bcity\b/i, /\btown\b/i, /\bmunicipality\b/i])) {
        if (setVal(el, biz.city)) count++;
        return;
      }

      // State / Province
      if (matchField(el, [/\bstate\b/i, /\bprovince\b/i, /\bregion\b/i])) {
        if (setVal(el, biz.state)) count++;
        return;
      }

      // Postal / Zip
      if (matchField(el, [/\bzip\b/i, /\bpostal\b/i, /\bpostcode\b/i])) {
        if (setVal(el, biz.zip)) count++;
        return;
      }

      // Category / Industry
      if (matchField(el, [/\bcategory\b/i, /\bindustry\b/i, /\bclassification\b/i, /\bsector\b/i])) {
        if (setVal(el, biz.category)) count++;
        return;
      }

      // Description / About
      if (el.tagName === "TEXTAREA" || matchField(el, [/\bdesc\b/i, /\babout\b/i, /\bbio\b/i, /\bsummary\b/i, /\bdetails\b/i])) {
        if (setVal(el, biz.description)) count++;
        return;
      }

      // Keywords / Services / Tags
      if (matchField(el, [/\bkeywords\b/i, /\bservices\b/i, /\btags\b/i])) {
        const val = Array.isArray(biz.services) ? biz.services.join(", ") : (biz.services || "");
        if (setVal(el, val)) count++;
        return;
      }

      // Hours
      if (matchField(el, [/\bhours\b/i, /\bopening\b/i])) {
        if (setVal(el, biz.hours || "Mon-Fri 9:00 AM - 6:00 PM")) count++;
        return;
      }
    });

    return count;
  }

  // Listen for messages from popup or page
  chrome.runtime?.onMessage?.addListener((req, sender, sendResponse) => {
    if (req.action === "AUTOFILL") {
      const count = fillDirectoryForm(req.data);
      sendResponse({ success: true, count });
    }
  });

  // Also listen for window events from the web app
  window.addEventListener("message", (e) => {
    if (e.data?.type === "BLASTER_SYNC_DATA") {
      chrome.storage?.local?.set({ active_business: e.data.payload });
    }
  });
})();
