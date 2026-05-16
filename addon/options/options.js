const input = document.getElementById("api");
const btn = document.getElementById("save");
const statusMsg = document.getElementById("status-msg");
const badgeSelect = document.getElementById("badgeMode");

function showStatus(text, isError = false) {
    statusMsg.textContent = text;
    statusMsg.className = isError ? "error" : "success";
    setTimeout(() => {
        statusMsg.textContent = "";
        statusMsg.className = "";
    }, 2500);
}

chrome.storage.local.get(["apiBase", "badgeMode"], (data) => {
    if (data.apiBase) input.value = data.apiBase;
    if (data.badgeMode) badgeSelect.value = data.badgeMode;
});

btn.addEventListener("click", () => {
    let url = input.value.trim();

    if (!url.startsWith("http")) {
        showStatus("Invalid format. Must begin with http:// or https://", true);
        return;
    }

    if (url.endsWith("/")) url = url.slice(0, -1);

    chrome.storage.local.set({
        apiBase: url,
        badgeMode: badgeSelect.value
    }, () => {
        showStatus("All configurations saved successfully!");
    });
});