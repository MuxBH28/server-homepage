import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import os from 'os';
import fs from 'fs';
import path from 'path';
import si from 'systeminformation';
import { exec } from 'child_process';
import axios from 'axios';
import bcrypt from 'bcrypt';
import Parser from 'rss-parser';
import QRCode from 'qrcode';
import osu from 'os-utils';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const parser = new Parser();
const fastify = Fastify({ logger: { level: 'error' } });
const PORT = 6969;

let networkCache = null;
let networkCacheTime = 0;
const NETWORK_CACHE_TTL = 5 * 60 * 1000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

fastify.register(fastifyStatic, {
    root: path.join(__dirname, 'dist'),
    prefix: '/',
});

fastify.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
    try {
        const json = JSON.parse(body);
        done(null, json);
    } catch (err) {
        done(err, undefined);
    }
});

const linksFile = path.join(__dirname, "json/links.json");
const settingsFile = path.join(__dirname, "json/settings.json");
const serverLog = path.join(__dirname, "server.log");
const networkLog = path.join(__dirname, "network.log");
const notesFile = path.join(__dirname, "json/notes.json");

let settings = {};
let links = [];
let notes = {};

function initFiles() {
    const jsonDir = path.join(__dirname, "json");
    if (!fs.existsSync(jsonDir)) {
        fs.mkdirSync(jsonDir, { recursive: true });
    }

    if (!fs.existsSync(linksFile)) {
        const defaultLinks = [
            {
                name: "msehic",
                url: "https://msehic.com",
                icon: "bi-link-45deg",
                category: "External",
                opened: 0,
            },
        ];
        fs.writeFileSync(linksFile, JSON.stringify(defaultLinks, null, 2), "utf8");
        links = defaultLinks;
    } else {
        links = JSON.parse(fs.readFileSync(linksFile, "utf8"));
    }

    if (!fs.existsSync(settingsFile)) {
        const defaultSettings = {
            server: "Server name",
            name: "Nickname",
            refreshInterval: 30,
            welcome: false,
            bgPath: "./assets/background.jpg",
            rss: "https://hnrss.org/frontpage",
            login: "",
            diskPaths: ["/"],
            tools: {
                Process: true,
                Crypto: true,
                Notes: true,
                RSS: true,
                Power: true,
                Hardware: true,
                QR: true,
            },
        };
        fs.writeFileSync(settingsFile, JSON.stringify(defaultSettings, null, 2), "utf8");
        settings = defaultSettings;
    } else {
        settings = JSON.parse(fs.readFileSync(settingsFile, "utf8"));
    }

    if (!fs.existsSync(serverLog)) {
        fs.writeFileSync(serverLog, `[${new Date().toISOString()}] Server log initialized\n`, "utf8");
    }

    if (!fs.existsSync(networkLog)) {
        fs.writeFileSync(networkLog, `[${new Date().toISOString()}] Network log initialized\n`, "utf8");
    }

    if (!fs.existsSync(notesFile)) {
        const defaultNotes = {
            notes: "Welcome to Server Homepage Notes!\nThis is your personal space for quick notes and reminders.\nLooking for a more advanced notes app for your server?\nCheck out: https://github.com/MuxBH28/brahke-pisar",
            lastEdited: new Date().toISOString(),
        };
        fs.writeFileSync(notesFile, JSON.stringify(defaultNotes, null, 2), "utf8");
        notes = defaultNotes;
    } else {
        notes = JSON.parse(fs.readFileSync(notesFile, "utf8"));
    }
}

async function logSystemStats() {
    try {
        const cpuLoad = await getCpuUsage();
        const cpuTemp = await getCpuTemp();

        const totalMem = os.totalmem();
        const usedMem = totalMem - os.freemem();
        const memPercent = ((usedMem / totalMem) * 100).toFixed(2);
        const cpuLoadNum = Number(cpuLoad) || 0;

        const now = new Date();
        const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const logLine = `[${timestamp}] CPU: ${cpuLoadNum.toFixed(2)}% | RAM: ${memPercent}% | TEMP: ${cpuTemp || 'N/A'}°C`;

        let systemLines = [];
        if (fs.existsSync(serverLog)) {
            const data = fs.readFileSync(serverLog, "utf8");
            systemLines = data.trim().split("\n");
        }

        systemLines.push(logLine);

        const MAX_LINES = 60 * 8;

        if (systemLines.length > MAX_LINES) {
            systemLines = systemLines.slice(systemLines.length - MAX_LINES);
        }

        fs.writeFileSync(serverLog, systemLines.join("\n") + "\n", "utf8");

        const netStats = await si.networkStats();
        const downloadSpeed = (netStats[0].rx_sec / 1024 / 1024).toFixed(2) + " MB/s";
        const uploadSpeed = (netStats[0].tx_sec / 1024 / 1024).toFixed(2) + " MB/s";

        const netLogLine = `[${timestamp}] UP: ${uploadSpeed} | DOWN: ${downloadSpeed}`;

        let netLines = [];
        if (fs.existsSync(networkLog)) {
            const netData = fs.readFileSync(networkLog, "utf8");
            netLines = netData.trim().split("\n");
        }

        netLines.push(netLogLine);

        if (netLines.length > MAX_LINES) {
            netLines = netLines.slice(netLines.length - MAX_LINES);
        }

        fs.writeFileSync(networkLog, netLines.join("\n") + "\n", "utf8");
    } catch (err) {
        console.error("Error logging system or network stats:", err.message);
    }
}

fastify.get('/api/links', async (request, reply) => {
    try {
        const data = await fs.promises.readFile(linksFile, 'utf8');
        reply.send(JSON.parse(data));
    } catch (err) {
        reply.status(500).send({ error: 'Failed to read links' });
    }
});

fastify.get('/api/system', async (request, reply) => {
    try {
        const cpuLoad = await getCpuUsage();
        const mem = process.memoryUsage();
        const uptime = process.uptime();

        const fsData = await si.fsSize();
        const diskInfo = {};
        for (const p of settings.diskPaths) {
            const match = fsData.find(d => d.mount === p || d.fs === p);
            if (match) {
                diskInfo[p] = {
                    total: match.size,
                    free: match.size - match.used,
                    used: match.used,
                    usedPercent: ((match.used / match.size) * 100).toFixed(2)
                };
            } else {
                diskInfo[p] = null;
            }
        }

        const cpuTemp = await getCpuTemp();

        reply.send({
            cpu_percent: cpuLoad,
            memory: {
                rss: mem.rss,
                heapTotal: mem.heapTotal,
                heapUsed: mem.heapUsed,
                external: mem.external,
                freeMem: os.freemem(),
                totalMem: os.totalmem()
            },
            uptime: formatUptime(uptime),
            cpu_temp: cpuTemp,
            disk: diskInfo
        });
    } catch (e) {
        reply.status(500).send({ error: e.message });
    }
});

fastify.post('/api/links', async (request, reply) => {
    const { name, url, icon = 'bi-link-45deg', category = 'Other' } = request.body;
    if (!name || !url) return reply.status(400).send({ error: "Name and URL are required" });

    try {
        const data = await fs.promises.readFile(linksFile, 'utf8');
        let links = [];
        try {
            links = JSON.parse(data);
        } catch (e) {
            return reply.status(500).send({ error: 'Corrupt links data' });
        }

        links.push({ name, url, icon, category });
        await fs.promises.writeFile(linksFile, JSON.stringify(links, null, 2), 'utf8');
        reply.send({ success: true });
    } catch (err) {
        reply.status(500).send({ error: 'Failed to save link' });
    }
});

fastify.delete('/api/links/:index', async (request, reply) => {
    const index = parseInt(request.params.index);
    try {
        const data = await fs.promises.readFile(linksFile, 'utf8');
        let links = JSON.parse(data);
        if (index < 0 || index >= links.length) {
            return reply.status(400).send({ error: 'Invalid index' });
        }

        links.splice(index, 1);
        await fs.promises.writeFile(linksFile, JSON.stringify(links, null, 2), 'utf8');
        reply.send({ success: true });
    } catch (err) {
        reply.status(500).send({ error: 'Failed to delete link' });
    }
});

fastify.put('/api/links/:index', async (request, reply) => {
    const index = parseInt(request.params.index);
    const { name, url, icon = 'bi-link-45deg', category = 'Other' } = request.body;

    if (!name || !url) {
        return reply.status(400).send({ error: "Name and URL are required" });
    }

    try {
        const data = await fs.promises.readFile(linksFile, 'utf8');
        let links = JSON.parse(data);

        if (index < 0 || index >= links.length) {
            return reply.status(400).send({ error: 'Invalid index' });
        }

        links[index] = { name, url, icon, category };

        await fs.promises.writeFile(linksFile, JSON.stringify(links, null, 2), 'utf8');
        reply.send({ success: true });
    } catch (err) {
        reply.status(500).send({ error: 'Failed to update link' });
    }
});


fastify.get('/api/process', async (request, reply) => {
    try {
        const data = await si.processes();
        const sorted = data.list.sort((a, b) => b.cpu - a.cpu);
        const topProcesses = sorted.slice(0, 15).map(proc => ({
            pid: proc.pid,
            name: proc.name,
            cpu: proc.cpu.toFixed(1),
            memory: proc.memRss
        }));
        reply.send(topProcesses);
    } catch (err) {
        reply.status(500).send({ error: err.message });
    }
});

fastify.post('/api/links/:encodedUrl/increment', async (request, reply) => {
    const url = decodeURIComponent(request.params.encodedUrl);

    try {
        const data = await fs.promises.readFile(linksFile, 'utf8');
        let links = [];
        try {
            links = JSON.parse(data);
        } catch {
            return reply.status(500).send({ error: 'Corrupt links data' });
        }

        const link = links.find(l => l.url === url);
        if (!link) return reply.status(400).send({ error: 'Invalid link URL' });

        link.opened = (link.opened || 0) + 1;
        await fs.promises.writeFile(linksFile, JSON.stringify(links, null, 2), 'utf8');
        reply.send({ success: true, opened: link.opened });
    } catch (err) {
        reply.status(500).send({ error: 'Failed to save link' });
    }
});

fastify.get("/api/settings", async (request, reply) => {
    try {
        const data = await fs.promises.readFile(settingsFile, "utf8");
        const settings = JSON.parse(data);
        const appVersions = await getVersion();
        settings.appVersions = appVersions;
        reply.send(settings);
    } catch (err) {
        console.error("Error reading settings or versions:", err);
        reply.status(500).send({ error: "Failed to load settings or versions." });
    }
});

fastify.post("/api/settings", async (request, reply) => {
    try {
        await fs.promises.writeFile(settingsFile, JSON.stringify(request.body, null, 2), "utf8");
        reply.send({ success: true });
    } catch (err) {
        console.error("Error writing settings.json:", err);
        reply.status(500).send({ error: "Error saving settings." });
    }
});

fastify.get("/api/logs", async (request, reply) => {
    try {
        if (!fs.existsSync(serverLog)) return reply.send([]);

        const data = await fs.promises.readFile(serverLog, "utf8");
        const lines = data
            .split("\n")
            .filter(line => line.trim() !== "")
            .map(line => {
                const match = line.match(/\[(.*?)\] CPU: ([\d.]+)% \| RAM: ([\d.]+)% \| TEMP: (.*)°C/);
                if (match) {
                    return {
                        timestamp: match[1],
                        cpu: parseFloat(match[2]),
                        ram: parseFloat(match[3]),
                        temp: match[4] === "N/A" ? null : parseFloat(match[4])
                    };
                } else {
                    return { raw: line };
                }
            });

        reply.send(lines);
    } catch (err) {
        console.error("Error reading server log:", err.message);
        reply.status(500).send({ error: "Failed to read server log." });
    }
});

fastify.get("/api/network-logs", async (request, reply) => {
    try {
        if (!fs.existsSync(networkLog)) return reply.send([]);

        const data = await fs.promises.readFile(networkLog, "utf8");
        const lines = data
            .split("\n")
            .filter(line => line.trim() !== "")
            .map(line => {
                const match = line.match(/\[(.*?)\] UP: ([\d.]+) MB\/s \| DOWN: ([\d.]+) MB\/s/);
                if (match) {
                    return {
                        timestamp: match[1],
                        upload: parseFloat(match[2]),
                        download: parseFloat(match[3])
                    };
                } else {
                    return { raw: line };
                }
            });

        reply.send(lines);
    } catch (err) {
        console.error("Error reading network log:", err.message);
        reply.status(500).send({ error: "Failed to read network log." });
    }
});

fastify.get("/api/info", async (request, reply) => {
    try {
        const cpu = await si.cpu();
        const mem = os.totalmem();
        const osInfo = await si.osInfo();
        const disk = await si.diskLayout();
        const graphics = await si.graphics();
        const network = await si.networkInterfaces();

        const bytesToGB = (bytes) => +(bytes / 1024 / 1024 / 1024).toFixed(2);

        reply.send({
            cpu: {
                manufacturer: cpu.manufacturer,
                brand: cpu.brand,
                speed: cpu.speed,
                cores: cpu.cores,
                physicalCores: cpu.physicalCores,
            },
            memory: {
                totalGB: bytesToGB(mem),
            },
            os: {
                platform: osInfo.platform,
                distro: osInfo.distro,
                release: osInfo.release,
                kernel: osInfo.kernel,
                arch: osInfo.arch,
                hostname: osInfo.hostname,
            },
            disk: disk.map(d => ({
                device: d.device,
                type: d.type,
                sizeGB: bytesToGB(d.size),
                name: d.name,
                vendor: d.vendor
            })),
            graphics: graphics.controllers.map(g => ({
                model: g.model,
                vendor: g.vendor,
                vramGB: bytesToGB(g.vram * 1024 * 1024)
            })),
            network: network.map(n => ({
                iface: n.iface,
                ip4: n.ip4,
                ip6: n.ip6,
                mac: n.mac,
                internal: n.internal
            }))
        });
    } catch (err) {
        console.error("Error fetching system info:", err);
        reply.status(500).send({ error: "Failed to fetch system info" });
    }
});

fastify.get("/api/crypto", async (request, reply) => {
    try {
        const resp = await axios.get("https://api.coingecko.com/api/v3/simple/price", {
            params: {
                ids: "bitcoin,ethereum,dogecoin,litecoin,cardano,solana,polkadot",
                vs_currencies: "usd"
            }
        });
        reply.send(resp.data);
    } catch (err) {
        console.error("Error fetching crypto:", err.message);
        reply.status(500).send({ error: "Failed to fetch crypto data." });
    }
});

fastify.get("/api/notes", async (request, reply) => {
    try {
        if (!fs.existsSync(notesFile)) return reply.send({ notes: "", lastEdited: null });
        const data = JSON.parse(fs.readFileSync(notesFile, "utf8"));
        reply.send(data);
    } catch (err) {
        console.error("Error reading notes:", err.message);
        reply.status(500).send({ error: "Failed to read notes." });
    }
});

fastify.post("/api/notes", async (request, reply) => {
    try {
        const notes = request.body.notes || "";
        const data = { notes, lastEdited: new Date().toISOString() };
        fs.writeFileSync(notesFile, JSON.stringify(data, null, 2), "utf8");
        reply.send({ success: true, data });
    } catch (err) {
        console.error("Error saving notes:", err.message);
        reply.status(500).send({ error: "Failed to save notes." });
    }
});

fastify.post("/api/power", async (request, reply) => {
    const action = request.body.action;

    if (!["shutdown", "restart", "sleep"].includes(action)) {
        return reply.status(400).send({ error: "Invalid action" });
    }

    let cmd = "";
    switch (action) {
        case "shutdown":
            cmd = "shutdown -h now";
            break;
        case "restart":
            cmd = "shutdown -r now";
            break;
        case "sleep":
            cmd = "systemctl suspend";
            break;
    }

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing ${action}:`, error);
            return reply.status(500).send({ error: `Failed to ${action}` });
        }
        reply.send({ success: true, action });
    });
});

fastify.get("/api/rss", async (request, reply) => {
    try {
        const feedUrl = settings.rss || "https://hnrss.org/frontpage";
        const feed = await parser.parseURL(feedUrl);

        const items = feed.items.slice(0, 12).map((item) => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate
        }));

        reply.send(items);
    } catch (err) {
        console.error("Error fetching RSS:", err.message);
        reply.status(500).send({ error: "Failed to fetch RSS feed." });
    }
});

fastify.post("/api/set-login", async (request, reply) => {
    try {
        const pin = request.body.pin || "";
        if (!pin || pin.length < 4) {
            return reply
                .status(400)
                .send({ error: "PIN must be at least 4 characters long." });
        }

        const hashedPin = await bcrypt.hash(pin, 10);

        if (!fs.existsSync(settingsFile)) {
            return reply.status(500).send({ error: "Settings file not found." });
        }

        const settingsData = JSON.parse(fs.readFileSync(settingsFile, "utf8"));
        settingsData.login = hashedPin;
        fs.writeFileSync(settingsFile, JSON.stringify(settingsData, null, 2), "utf8");

        settings.login = hashedPin;

        reply.send({ success: true, message: "PIN saved successfully." });
    } catch (err) {
        console.error("Error setting login PIN:", err.message);
        reply.status(500).send({ error: "Failed to set login PIN." });
    }
});

fastify.post("/api/check-login", async (request, reply) => {
    try {
        const inputPin = request.body.pin;

        if (!settings.login || !inputPin) {
            return reply.send({ success: false });
        }

        bcrypt.compare(inputPin, settings.login, (err, result) => {
            if (err) {
                console.error("Error comparing PIN:", err.message);
                return reply.status(500).send({ success: false, error: "Server error" });
            }

            reply.send({ success: result });
        });
    } catch (err) {
        console.error("Error in check-login:", err.message);
        reply.status(500).send({ success: false, error: "Server error" });
    }
});

fastify.post("/api/linksFile", async (request, reply) => {
    const newLinks = request.body;

    if (!newLinks) {
        return reply.status(400).send({ error: "No data provided" });
    }

    try {
        fs.writeFileSync(linksFile, JSON.stringify(newLinks, null, 2), "utf8");
        reply.send({ message: "Links updated successfully" });
    } catch (err) {
        reply.status(500).send({ error: "Failed to write links" });
    }
});

fastify.post("/api/urltoqrl", async (request, reply) => {
    const { text, type, width, color, bgColor } = request.body;
    const qrPath = path.join(__dirname, "assets", `qrcode.${type}`);

    try {
        await QRCode.toFile(qrPath, text, {
            type,
            width,
            margin: 2,
            color: {
                dark: color,
                light: bgColor,
            },
        });

        reply.send({ success: true });
    } catch (err) {
        console.error("QR code generation error:", err.message);
        reply.status(500).send({ error: "Failed to generate QR code" });
    }
});

fastify.get("/api/network", async (request, reply) => {
    const now = Date.now();

    if (!networkCache || now - networkCacheTime >= NETWORK_CACHE_TTL) {
        const nets = os.networkInterfaces();
        let localIP = null;
        let ifaceName = null;
        let state = null;

        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                if (net.family === "IPv4" && !net.internal) {
                    localIP = net.address;
                    ifaceName = name;
                    state = net.mac ? "up" : "down";
                    break;
                }
            }
            if (localIP) break;
        }

        let publicIP = "N/A";
        let city = "N/A";
        let country = "N/A";
        let loc = "N/A";

        try {
            const response = await axios.get("https://ipinfo.io/json");
            const data = response.data;
            publicIP = data.ip || publicIP;
            city = data.city || city;
            country = data.country || country;
            loc = data.loc || loc;
        } catch (err) {
            fastify.log.error("Failed to fetch public IP info:", err.message);
        }

        networkCache = {
            ifaceName,
            state,
            local_ip: localIP,
            public_ip: publicIP,
            city,
            country,
            loc,
        };
        networkCacheTime = now;
    }

    const netStats = await si.networkStats();
    const downloadSpeed =
        (netStats[0].rx_sec / 1024 / 1024).toFixed(2) + " MB/s";
    const uploadSpeed =
        (netStats[0].tx_sec / 1024 / 1024).toFixed(2) + " MB/s";

    reply.send({
        ...networkCache,
        download_speed: downloadSpeed,
        upload_speed: uploadSpeed,
    });
});

fastify.get("/api/temperature", async (request, reply) => {
    try {
        const temp = await getCpuTemp();
        const hours = new Date().getHours();

        reply.send({
            temperature: temp,
            hour: hours,
        });
    } catch (err) {
        reply.status(500).send({ error: "Failed to get CPU temperature" });
    }
});

async function getVersion() {
    const appVersions = {
        local: "N/A",
        github: "N/A",
    };

    try {
        const packagePath = path.join(__dirname, "package.json");
        const packageData = JSON.parse(fs.readFileSync(packagePath, "utf8"));
        appVersions.local = packageData.version || "N/A";

        const githubUrl = "https://raw.githubusercontent.com/MuxBH28/server-homepage/main/package.json";
        const response = await axios.get(githubUrl);
        const githubData = response.data;
        appVersions.github = githubData.version || "N/A";
    } catch (err) {
        console.error("Failed to get versions:", err.message);
    }

    return appVersions;
}

function getCpuUsage() {
    return new Promise((resolve) => {
        osu.cpuUsage((v) => {
            resolve((v * 100).toFixed(2));
        });
    });
}

async function getCpuTemp() {
    try {
        const temp = await si.cpuTemperature();
        return temp.main ? temp.main.toFixed(1) : null;
    } catch (err) {
        console.error(err);
        return null;
    }
}

function formatUptime(seconds) {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
}

fastify.setNotFoundHandler((request, reply) => {
    reply.sendFile("index.html");
});

const start = async () => {
    try {
        initFiles();
        logSystemStats();
        setInterval(logSystemStats, 60 * 1000);

        await fastify.listen({ port: PORT, host: "0.0.0.0" });
        console.log(`Server running at http://0.0.0.0:${PORT}`);
    } catch (err) {
        console.error("Error starting server:", err);
        process.exit(1);
    }
};

start();