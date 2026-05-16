let apiBase = null;
let lastStatus = "UNKNOWN";
let badgeMode = "temp";

chrome.storage.local.get(["apiBase", "badgeMode"], (data) => {
    apiBase = data.apiBase || null;
    badgeMode = data.badgeMode || "temp";
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "add-to-server",
        title: "Add to Server Homepage",
        contexts: ["page", "link"]
    });
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local") {
        if (changes.apiBase) {
            apiBase = changes.apiBase.newValue;
        }
        if (changes.badgeMode) {
            badgeMode = changes.badgeMode.newValue;
        }
    }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (!apiBase) return;

    const url = info.linkUrl || info.pageUrl;
    const title = tab?.title || url;

    fetch(`${apiBase}/api/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
            ((data.memory.totalMem - data.memory.freeMem) /
                data.memory.totalMem) * 100
        );
        const temp = Number(data.cpu_temp || 0);

        let status = "OK";
        if (cpu > 80 || ram > 80 || temp > 80) status = "WARN";

        updateBadge(temp, cpu, ram, status);

        lastStatus = status;
    } catch (e) {
        updateBadge("X", "DOWN");
        lastStatus = "DOWN";
    }
}

function updateBadge(temp, cpu, ram, status) {
    if (status === "DOWN") {
        chrome.browserAction.setBadgeText({ text: "X" });
        chrome.browserAction.setBadgeBackgroundColor({ color: "red" });
        return;
    }

    let text = "";

    if (badgeMode === "temp") text = temp ? `${temp}°` : "";
    if (badgeMode === "cpu") text = cpu ? `${cpu}%` : "";
    if (badgeMode === "ram") text = ram ? `${ram}%` : "";
    if (badgeMode === "off") text = "";

    chrome.browserAction.setBadgeText({ text });

    chrome.browserAction.setBadgeBackgroundColor({
        color: status === "WARN" ? "orange" : "green"
    });
}

setInterval(fetchSystem, 10000);
fetchSystem();