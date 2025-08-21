const express = require('express');
const os = require('os');
const fs = require('fs');
const path = require('path');
const si = require('systeminformation');
const { exec } = require('child_process');
const axios = require('axios');
const bcrypt = require('bcrypt');
const Parser = require('rss-parser');
const parser = new Parser();
const QRCode = require('qrcode');

const app = express();
const PORT = 6969;

let networkCache = null;
let networkCacheTime = 0;
const NETWORK_CACHE_TTL = 5 * 60 * 1000;

app.use(express.static(path.join(__dirname)));
app.use(express.json());

const linksFile = path.join(__dirname, 'json/links.json');
const settingsFile = path.join(__dirname, 'json/settings.json');
let settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
const serverLog = path.join(__dirname, 'server.log');
const notesFile = path.join(__dirname, 'json/notes.json');

function initFiles() {
    if (!fs.existsSync(linksFile)) {
        const defaultLinks = [
            {
                name: "msehic",
                url: "https://msehic.com",
                icon: "bi-link-45deg",
                category: "External",
                opened: 0
            }
        ];
        fs.writeFileSync(linksFile, JSON.stringify(defaultLinks, null, 2), 'utf8');
    }

    if (!fs.existsSync(settingsFile)) {
        const defaultSettings = {
            server: 'Server name',
            name: 'Nickname',
            refreshInterval: 30,
            welcome: false,
            bgPath: './assets/background.jpg',
            rss: 'https://hnrss.org/frontpage',
            login: '',
            diskPaths: [
                '/'
            ]
        };
        fs.writeFileSync(settingsFile, JSON.stringify(defaultSettings, null, 2), 'utf8');
        settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
    }

    if (!fs.existsSync(serverLog)) {
        fs.writeFileSync(serverLog, `[${new Date().toISOString()}] Server log initialized\n`, 'utf8');
    }

    if (!fs.existsSync(notesFile)) {
        fs.writeFileSync(
            notesFile,
            JSON.stringify({
                notes: "Welcome to Server Homepage Notes!\nThis is your personal space for quick notes and reminders.\nLooking for a more advanced notes app for your server?\nCheck out: https://github.com/MuxBH28/brahke-pisar",
                lastEdited: new Date().toISOString()
            }, null, 2),
            'utf8'
        );
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
        const timestamp = now.toTimeString().split(' ')[0];

        const logLine = `[${timestamp}] CPU: ${cpuLoadNum.toFixed(2)}% | RAM: ${memPercent}% | TEMP: ${cpuTemp || 'N/A'}°C`;

        let lines = [];
        if (fs.existsSync(serverLog)) {
            const data = fs.readFileSync(serverLog, 'utf8');
            lines = data.trim().split('\n');
        }

        lines.push(logLine);

        const MAX_LINES = 60 * 12;
        if (lines.length > MAX_LINES) {
            lines = lines.slice(lines.length - MAX_LINES);
        }

        fs.writeFileSync(serverLog, lines.join('\n') + '\n', 'utf8');
    } catch (err) {
        console.error("Error logging system stats:", err.message);
    }
}

app.get('/api/links', async (req, res) => {
    fs.readFile(linksFile, 'utf8', async (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read links' });
        res.json(JSON.parse(data));
    });
});

app.get('/api/system', async (req, res) => {
    try {
        const cpuLoad = await getCpuUsage();
        const mem = process.memoryUsage();
        const uptime = process.uptime();
        const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));

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
        const network = await getNetworkInfo();
        const appVersions = await getVersions();

        res.json({
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
            disk: diskInfo,
            network,
            appVersions
        });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


app.post('/api/links', express.json(), (req, res) => {
    const { name, url, icon = 'bi-link-45deg', category = 'Custom' } = req.body;
    if (!name || !url) return res.status(400).json({ error: "Name and URL are required" });

    fs.readFile(linksFile, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read links' });

        let links = [];
        try {
            links = JSON.parse(data);
        } catch (e) {
            return res.status(500).json({ error: 'Corrupt links data' });
        }

        links.push({ name, url, icon, category });

        fs.writeFile(linksFile, JSON.stringify(links, null, 2), (err) => {
            if (err) return res.status(500).json({ error: 'Failed to save link' });
            res.json({ success: true });
        });
    });
});

app.delete('/api/links/:index', (req, res) => {
    const index = parseInt(req.params.index);

    fs.readFile(linksFile, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read links' });

        let links = JSON.parse(data);
        if (index < 0 || index >= links.length) {
            return res.status(400).json({ error: 'Invalid index' });
        }

        links.splice(index, 1);

        fs.writeFile(linksFile, JSON.stringify(links, null, 2), (err) => {
            if (err) return res.status(500).json({ error: 'Failed to delete link' });
            res.json({ success: true });
        });
    });
});

app.get('/api/process', async (req, res) => {
    try {
        const data = await si.processes();

        const sorted = data.list.sort((a, b) => b.cpu - a.cpu);

        const topProcesses = sorted.slice(0, 15).map(proc => ({
            pid: proc.pid,
            name: proc.name,
            cpu: proc.cpu.toFixed(1),
            memory: proc.memRss
        }));

        res.json(topProcesses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/links/:index/increment', (req, res) => {
    const index = parseInt(req.params.index);
    fs.readFile(linksFile, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read links' });
        let links = [];
        try { links = JSON.parse(data); } catch { return res.status(500).json({ error: 'Corrupt links data' }); }
        if (index < 0 || index >= links.length) return res.status(400).json({ error: 'Invalid index' });

        links[index].opened = (links[index].opened || 0) + 1;

        fs.writeFile(linksFile, JSON.stringify(links, null, 2), (err) => {
            if (err) return res.status(500).json({ error: 'Failed to save link' });
            res.json({ success: true, opened: links[index].opened });
        });
    });
});

app.get('/api/settings', (req, res) => {
    fs.readFile(settingsFile, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading settings.json:", err);
            return res.status(500).json({ error: 'Error reading settings.' });
        }
        try {
            res.json(JSON.parse(data));
        } catch (parseErr) {
            console.error("Error parsing settings.json:", parseErr);
            res.status(500).json({ error: 'Invalid settings format.' });
        }
    });
});

app.post('/api/settings', (req, res) => {
    fs.writeFile(settingsFile, JSON.stringify(req.body, null, 2), (err) => {
        if (err) {
            console.error("Error writing settings.json:", err);
            return res.status(500).json({ error: 'Error saving settings.' });
        }
        res.json({ success: true });
    });
});

app.get('/api/logs', (req, res) => {
    try {
        if (!fs.existsSync(serverLog)) return res.json([]);

        const data = fs.readFileSync(serverLog, 'utf8');
        const lines = data
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(line => {
                const match = line.match(/\[(.*?)\] CPU: ([\d.]+)% \| RAM: ([\d.]+)% \| TEMP: (.*)°C/);
                if (match) {
                    return {
                        timestamp: match[1],
                        cpu: parseFloat(match[2]),
                        ram: parseFloat(match[3]),
                        temp: match[4] === 'N/A' ? null : parseFloat(match[4])
                    };
                } else {
                    return { raw: line };
                }
            });

        res.json(lines);
    } catch (err) {
        console.error("Error reading server log:", err.message);
        res.status(500).json({ error: "Failed to read server log." });
    }
});

app.get('/api/info', async (req, res) => {
    try {
        const cpu = await si.cpu();
        const mem = os.totalmem();
        const osInfo = await si.osInfo();
        const disk = await si.diskLayout();
        const graphics = await si.graphics();
        const network = await si.networkInterfaces();

        const bytesToGB = (bytes) => +(bytes / 1024 / 1024 / 1024).toFixed(2);

        res.json({
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
        console.error('Error fetching system info:', err);
        res.status(500).json({ error: 'Failed to fetch system info' });
    }
});

app.get('/api/crypto', async (req, res) => {
    try {
        const resp = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
            params: {
                ids: 'bitcoin,ethereum,dogecoin,litecoin,cardano,solana,polkadot',
                vs_currencies: 'usd'
            }
        });
        res.json(resp.data);
    } catch (err) {
        console.error("Error fetching crypto:", err.message);
        res.status(500).json({ error: "Failed to fetch crypto data." });
    }
});

app.get('/api/notes', (req, res) => {
    try {
        if (!fs.existsSync(notesFile)) return res.json({ notes: "", lastEdited: null });
        const data = JSON.parse(fs.readFileSync(notesFile, 'utf8'));
        res.json(data);
    } catch (err) {
        console.error("Error reading notes:", err.message);
        res.status(500).json({ error: "Failed to read notes." });
    }
});

app.post('/api/notes', (req, res) => {
    try {
        const notes = req.body.notes || "";
        const data = { notes, lastEdited: new Date().toISOString() };
        fs.writeFileSync(notesFile, JSON.stringify(data, null, 2), 'utf8');
        res.json({ success: true, data });
    } catch (err) {
        console.error("Error saving notes:", err.message);
        res.status(500).json({ error: "Failed to save notes." });
    }
});

app.post('/api/power', (req, res) => {
    const action = req.body.action;

    if (!['shutdown', 'restart', 'sleep'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action' });
    }

    let cmd = '';
    switch (action) {
        case 'shutdown':
            cmd = 'shutdown -h now';
            break;
        case 'restart':
            cmd = 'shutdown -r now';
            break;
        case 'sleep':
            cmd = 'systemctl suspend';
            break;
    }

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing ${action}:`, error);
            return res.status(500).json({ error: `Failed to ${action}` });
        }
        res.json({ success: true, action });
    });
});

app.get('/api/rss', async (req, res) => {
    try {
        const feedUrl = settings.rss || 'https://hnrss.org/frontpage';
        const feed = await parser.parseURL(feedUrl);

        const items = feed.items.slice(0, 5).map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate
        }));

        res.json(items);
    } catch (err) {
        console.error("Error fetching RSS:", err.message);
        res.status(500).json({ error: "Failed to fetch RSS feed." });
    }
});

app.post('/api/set-login', async (req, res) => {
    try {
        const pin = req.body.pin || '';
        if (!pin || pin.length < 4) {
            return res.status(400).json({ error: 'PIN must be at least 4 characters long.' });
        }

        const hashedPin = await bcrypt.hash(pin, 10);

        if (!fs.existsSync(settingsFile)) {
            return res.status(500).json({ error: 'Settings file not found.' });
        }

        const settingsData = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
        settingsData.login = hashedPin;
        fs.writeFileSync(settingsFile, JSON.stringify(settingsData, null, 2), 'utf8');

        settings.login = hashedPin;

        res.json({ success: true, message: 'PIN saved successfully.' });
    } catch (err) {
        console.error('Error setting login PIN:', err.message);
        res.status(500).json({ error: 'Failed to set login PIN.' });
    }
});

app.post('/api/check-login', (req, res) => {
    try {
        const inputPin = req.body.pin;

        if (!settings.login || !inputPin) {
            return res.json({ success: false });
        }

        bcrypt.compare(inputPin, settings.login, (err, result) => {
            if (err) {
                console.error('Error comparing PIN:', err.message);
                return res.status(500).json({ success: false, error: 'Server error' });
            }

            res.json({ success: result });
        });

    } catch (err) {
        console.error('Error in check-login:', err.message);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

app.post('/api/linksFile', (req, res) => {
    const newLinks = req.body;

    if (!newLinks) return res.status(400).json({ error: 'No data provided' });

    fs.writeFile(linksFile, JSON.stringify(newLinks, null, 2), 'utf8', (err) => {
        if (err) return res.status(500).json({ error: 'Failed to write links' });
        res.json({ message: 'Links updated successfully' });
    });
});

app.post('/api/urltoqrl', async (req, res) => {
    const { text, type, width, color, bgColor } = req.body;
    const qrPath = path.join(__dirname, 'assets', `qrcode.${type}`);

    try {
        await QRCode.toFile(qrPath, text, {
            type,
            width,
            margin: 2,
            color: {
                dark: color,
                light: bgColor
            }
        });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
});

function getCpuUsage() {
    return new Promise((resolve) => {
        const osu = require('os-utils');
        osu.cpuUsage((v) => {
            resolve((v * 100).toFixed(2));
        });
    });
}

function getCpuTemp() {
    return new Promise((resolve) => {
        exec('sensors', (err, stdout) => {
            if (err) return resolve(null);

            const match = stdout.match(/Core 0:\s+\+([\d.]+)°C/);
            if (match && match[1]) {
                resolve(parseFloat(match[1]).toFixed(1));
            } else {
                resolve(null);
            }
        });
    });
}

async function getVersions() {
    const appVersions = {
        local: 'N/A',
        github: 'N/A'
    };

    try {
        const packagePath = path.join(__dirname, 'package.json');
        const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        appVersions.local = packageData.version || 'N/A';

        const githubUrl = 'https://raw.githubusercontent.com/MuxBH28/server-homepage/main/package.json';
        const response = await axios.get(githubUrl);
        const githubData = response.data;
        appVersions.github = githubData.version || 'N/A';

    } catch (err) {
        console.error('Failed to get versions:', err.message);
    }

    return appVersions;
}

async function getNetworkInfo() {
    const now = Date.now();

    if (!networkCache || (now - networkCacheTime >= NETWORK_CACHE_TTL)) {
        const nets = os.networkInterfaces();
        let localIP = null;
        let ifaceName = null;
        let state = null;

        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                if (net.family === 'IPv4' && !net.internal) {
                    localIP = net.address;
                    ifaceName = name;
                    state = net.mac ? 'up' : 'down';
                    break;
                }
            }
            if (localIP) break;
        }

        let publicIP = 'N/A';
        let city = 'N/A';
        let country = 'N/A';
        let loc = 'N/A';
        try {
            const response = await axios.get('https://ipinfo.io/json');
            const data = response.data;
            publicIP = data.ip || publicIP;
            city = data.city || city;
            country = data.country || country;
            loc = data.loc || loc;
        } catch (err) {
            console.error("Failed to fetch public IP info:", err.message);
        }

        networkCache = {
            ifaceName,
            state,
            local_ip: localIP,
            public_ip: publicIP,
            city,
            country,
            loc
        };
        networkCacheTime = now;
    }

    const netStats = await si.networkStats();
    const downloadSpeed = (netStats[0].rx_sec / 1024 / 1024).toFixed(2) + " MB/s";
    const uploadSpeed = (netStats[0].tx_sec / 1024 / 1024).toFixed(2) + " MB/s";

    return {
        ...networkCache,
        download_speed: downloadSpeed,
        upload_speed: uploadSpeed
    };
}

function formatUptime(seconds) {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
}

app.listen(PORT, '0.0.0.0', (err) => {
    if (err) {
        console.error('Error starting server:', err);
    } else {
        initFiles();
        logSystemStats();
        setInterval(logSystemStats, 60 * 1000);
        console.log(`Server running at http://0.0.0.0:${PORT}`);
    }
});