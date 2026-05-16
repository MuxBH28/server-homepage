async function getAPI() {
    return new Promise((res) => {
        chrome.storage.local.get(["apiBase"], (d) => res(d.apiBase));
    });
}

function openOptions() {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL("options/options.html"));
    }
}

document.getElementById("options-btn").addEventListener("click", openOptions);

async function load() {
    const api = await getAPI();

    if (!api) {
        const statusElem = document.getElementById("status");
        statusElem.textContent = "SETUP REQ";
        statusElem.className = "status-badge warn";
        setTimeout(() => { openOptions(); }, 1000);
        return;
    }

    try {
        const res = await fetch(`${api}/api/system`);
        if (!res.ok) throw new Error("API error");

        const data = await res.json();

        const cpu = Number(data.cpu_percent || 0);
        const ram = ((data.memory.totalMem - data.memory.freeMem) / data.memory.totalMem) * 100;
        const temp = Number(data.cpu_temp || 0);

        let status = "ONLINE";
        let statusClass = "status-badge ok";

        if (cpu > 80 || ram > 80 || temp > 80) {
            status = "WARNING";
            statusClass = "status-badge warn";
        }

        const statusElem = document.getElementById("status");
        statusElem.textContent = status;
        statusElem.className = statusClass;

        document.getElementById("cpu").textContent = `${cpu.toFixed(1)}%`;
        document.getElementById("ram").textContent = `${ram.toFixed(1)}%`;
        document.getElementById("temp").textContent = `${temp.toFixed(1)}°C`;

    } catch (e) {
        const statusElem = document.getElementById("status");
        statusElem.textContent = "OFFLINE";
        statusElem.className = "status-badge down";

        document.getElementById("cpu").textContent = "-";
        document.getElementById("ram").textContent = "-";
        document.getElementById("temp").textContent = "-";
    }
}

load();
setInterval(load, 10000);