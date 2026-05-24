const input = document.getElementById("api");
const btn = document.getElementById("save");
const statusMsg = document.getElementById("status-msg");
const badgeSelect = document.getElementById("badgeMode");
const refreshInput = document.getElementById("refreshTime");
const contextMenuSelect = document.getElementById("contextMenuEnabled");

function showStatus(text, isError = false) {
    statusMsg.textContent = text;
    statusMsg.className = isError ? "error" : "success";
    setTimeout(() => {
        statusMsg.textContent = "";
        statusMsg.className = "";
    }, 2500);
}

chrome.storage.local.get(
    [
        "apiBase",
        "badgeMode",
        "refreshTime",
        "contextMenuEnabled"
    ],
    (data) => {
        if (data.apiBase) input.value = data.apiBase;

        badgeSelect.value = data.badgeMode || "temp";

        refreshInput.value = data.refreshTime || 10;

        contextMenuSelect.value =
            data.contextMenuEnabled === false
                ? "false"
                : "true";
    }
);

btn.addEventListener("click", () => {
    let url = input.value.trim();

    if (!url.startsWith("http")) {
        showStatus(
            "Invalid format. Must begin with http:// or https://",
            true
        );
        return;
    }

    if (url.endsWith("/")) {
        url = url.slice(0, -1);
    }

    let refreshTime = Number(refreshInput.value);

    if (isNaN(refreshTime)) refreshTime = 10;
    if (refreshTime < 5) refreshTime = 5;
    if (refreshTime > 3600) refreshTime = 3600;

    chrome.storage.local.set(
        {
            apiBase: url,
            badgeMode: badgeSelect.value,
            refreshTime,
            contextMenuEnabled:
                contextMenuSelect.value === "true"
        },
        () => {
            showStatus("All configurations saved successfully!");
        }
    );
});