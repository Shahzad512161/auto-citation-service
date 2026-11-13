// Global Citation Auto-Blaster - Background Service Worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "OPEN_ALL_TABS" && Array.isArray(request.urls)) {
    const urls = request.urls;
    urls.forEach((url) => {
      try {
        chrome.tabs.create({ url, active: false });
      } catch (err) {
        console.error("Failed to open tab:", url, err);
      }
    });
    sendResponse({ success: true, count: urls.length });
    return true;
  }
});
