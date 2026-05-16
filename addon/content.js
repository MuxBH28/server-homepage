chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    sendResponse({ ok: true });
});