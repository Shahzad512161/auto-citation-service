let activeBiz = null;

function render() {
  if (!activeBiz) {
    document.getElementById("bName").textContent = "No business loaded";
    document.getElementById("bMeta").textContent = "Launch a blast from your dashboard first";
    return;
  }
  document.getElementById("bName").textContent = activeBiz.name || "Untitled";
  document.getElementById("bMeta").textContent = `${activeBiz.city || ""}, ${activeBiz.state || ""} · ${activeBiz.phone || ""}`;
  document.getElementById("cpPhone").textContent = activeBiz.phone || "-";
  document.getElementById("cpAddr").textContent = activeBiz.address ? `${activeBiz.address}, ${activeBiz.city}` : "-";
}

// Load synced business from chrome.storage or active tab localStorage
chrome.storage?.local?.get(["active_business"], (res) => {
  if (res?.active_business) {
    activeBiz = res.active_business;
    render();
  } else {
    // Attempt reading from active tab localStorage if on dashboard
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) return;
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: () => {
            try {
              return JSON.parse(localStorage.getItem("blaster_business_data") || "null");
            } catch {
              return null;
            }
          },
        },
        (results) => {
          if (results?.[0]?.result) {
            activeBiz = results[0].result;
            chrome.storage?.local?.set({ active_business: activeBiz });
            render();
          }
        }
      );
    });
  }
});

// Auto-fill button click
document.getElementById("btnFill").addEventListener("click", () => {
  const status = document.getElementById("status");
  if (!activeBiz) {
    status.style.color = "#DC2626";
    status.textContent = "Please select a business in dashboard first!";
    return;
  }

  status.style.color = "#0F6FFF";
  status.textContent = "Detecting & filling form…";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]?.id) return;
    chrome.tabs.sendMessage(tabs[0].id, { action: "AUTOFILL", data: activeBiz }, (response) => {
      if (chrome.runtime.lastError) {
        // If content script wasn't injected yet, inject it manually
        chrome.scripting.executeScript(
          { target: { tabId: tabs[0].id }, files: ["content.js"] },
          () => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "AUTOFILL", data: activeBiz }, (resp2) => {
              status.style.color = "#059669";
              status.textContent = `✓ Filled ${resp2?.count || 0} fields!`;
            });
          }
        );
      } else {
        status.style.color = "#059669";
        status.textContent = `✓ Filled ${response?.count || 0} fields!`;
      }
    });
  });
});

// Quick copy buttons
document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.getAttribute("data-key");
    const val = activeBiz?.[key] || "";
    if (val) {
      navigator.clipboard.writeText(val);
      btn.textContent = "Copied!";
      setTimeout(() => { btn.textContent = "Copy"; }, 1500);
    }
  });
});
