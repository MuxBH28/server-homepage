const express = require('express');
const os = require('os');
const fs = require('fs');
const path = require('path');
const si = require('systeminformation');
const { exec } = require('child_process');
const axios = require('axios');

const app = express();
const PORT = 6969;

let networkCache = null;
let networkCacheTime = 0;
const NETWORK_CACHE_TTL = 5 * 60 * 1000;

app.use(express.static(path.join(__dirname)));
app.use(express.json());

const linksFile = path.join(__dirname, 'json/links.json');
const settingsFile = path.join(__dirname, 'json/settings.json');

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
        diskPaths: [
            '/'
        ]
    };
    fs.writeFileSync(settingsFile, JSON.stringify(defaultSettings, null, 2), 'utf8');
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
        console.log(`Server running at http://0.0.0.0:${PORT}`);
    }
});

