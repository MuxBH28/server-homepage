let apiBase = null;
let lastStatus = "UNKNOWN";
let badgeMode = "temp";

let refreshTime = 10;
let contextMenuEnabled = true;

let intervalId = null;

chrome.storage.local.get(
    [
        "apiBase",
        "badgeMode",
        "refreshTime",
        "contextMenuEnabled"
    ],
    (data) => {
        apiBase = data.apiBase || null;
        badgeMode = data.badgeMode || "temp";

        refreshTime = data.refreshTime || 10;

        contextMenuEnabled =
            data.contextMenuEnabled !== false;

        updateContextMenu();

        startPolling();
    }
);

chrome.runtime.onInstalled.addListener(() => {
    updateContextMenu();
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;

    if (changes.apiBase) {
        apiBase = changes.apiBase.newValue;
    }

    if (changes.badgeMode) {
        badgeMode = changes.badgeMode.newValue;
    }

    if (changes.refreshTime) {
        refreshTime = changes.refreshTime.newValue;
        startPolling();
    }

    if (changes.contextMenuEnabled) {
        contextMenuEnabled =
            changes.contextMenuEnabled.newValue;

        updateContextMenu();
    }
});

function updateContextMenu() {
    chrome.contextMenus.removeAll(() => {
        if (!contextMenuEnabled) return;

        chrome.contextMenus.create({
            id: "add-to-server",
            title: "Add to Server Homepage",
            contexts: ["page", "link"]
        });
    });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (!apiBase) return;

    const url = info.linkUrl || info.pageUrl;
    const title = tab?.title || url;

    fetch(`${apiBase}/api/links`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: title,
            url,
            sidebar: true
        })
    }).catch(() => { });
});

async function fetchSystem() {
    if (!apiBase) return;

    try {
        const res = await fetch(`${apiBase}/api/system`);
        if (!res.ok) throw new Error();

        const data = await res.json();

        const cpu = Number(data.cpu_percent || 0);
        const ram = Number(
            (
                (data.memory.totalMem -
                    data.memory.freeMem) /
                data.memory.totalMem
            ) * 100
        );
        const temp = Number(data.cpu_temp || 0);

        let status = "OK";

        if (cpu > 80 || ram > 80 || temp > 80) { status = "WARN"; }

        updateBadge(temp, cpu, ram, status);

        lastStatus = status;
    } catch (e) {
        updateBadge("X", "DOWN");
        lastStatus = "DOWN";
    }
}

function updateBadge(temp, cpu, ram, status) {
    if (status === "DOWN") {
        chrome.browserAction.setBadgeText({
            text: "X"
        });

        chrome.browserAction.setBadgeBackgroundColor({
            color: "red"
        });

        return;
    }

    let text = "";

    if (badgeMode === "temp") { text = temp ? `${Math.round(temp)}°` : ""; }
    if (badgeMode === "cpu") { text = cpu ? `${Math.round(cpu)}%` : ""; }
    if (badgeMode === "ram") { text = ram ? `${Math.round(ram)}%` : ""; }
    if (badgeMode === "off") { text = ""; }
    chrome.browserAction.setBadgeText({ text });

    chrome.browserAction.setBadgeBackgroundColor({
        color:
            status === "WARN"
                ? "orange"
                : "green"
    });
}

function startPolling() {
    if (intervalId) {
        clearInterval(intervalId);
    }

    fetchSystem();

    intervalId = setInterval(
        fetchSystem,
        refreshTime * 1000
    );
}