const express = require('express');
const os = require('os');
const fs = require('fs');
const path = require('path');
const disk = require('diskusage');
const { exec } = require('child_process');

const app = express();
const PORT = 6969;

app.use(express.static(path.join(__dirname)));
app.use(express.json());

app.get('/api/links', (req, res) => {
    fs.readFile(path.join(__dirname, 'links.json'), 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read links' });
        res.json(JSON.parse(data));
    });
});

app.get('/api/system', async (req, res) => {
    try {
        const cpuLoad = await getCpuUsage();
        const mem = process.memoryUsage();
        const uptime = process.uptime();

        const diskPaths = ['/', '/400GB', '/500GB_WD', '/250GB'];
        const diskInfo = {};
        for (const p of diskPaths) {
            try {
                const info = disk.checkSync(p);
                diskInfo[p] = {
                    total: info.total,
                    free: info.free,
                    used: info.total - info.free,
                    usedPercent: ((info.total - info.free) / info.total * 100).toFixed(2)
                };
            } catch {
                diskInfo[p] = null;
            }
        }

        const cpuTemp = await getCpuTemp();

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
            disk: diskInfo
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/links', express.json(), (req, res) => {
    const { name, url, icon = 'bi-link-45deg', category = 'Custom' } = req.body;
    if (!name || !url) return res.status(400).json({ error: "Name and URL are required" });

    const filePath = path.join(__dirname, 'links.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read links' });

        let links = [];
        try {
            links = JSON.parse(data);
        } catch (e) {
            return res.status(500).json({ error: 'Corrupt links data' });
        }

        links.push({ name, url, icon, category });

        fs.writeFile(filePath, JSON.stringify(links, null, 2), (err) => {
            if (err) return res.status(500).json({ error: 'Failed to save link' });
            res.json({ success: true });
        });
    });
});

app.delete('/api/links/:index', (req, res) => {
    const index = parseInt(req.params.index);
    const filePath = path.join(__dirname, 'links.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read links' });

        let links = JSON.parse(data);
        if (index < 0 || index >= links.length) {
            return res.status(400).json({ error: 'Invalid index' });
        }

        links.splice(index, 1);

        fs.writeFile(filePath, JSON.stringify(links, null, 2), (err) => {
            if (err) return res.status(500).json({ error: 'Failed to delete link' });
            res.json({ success: true });
        });
    });
});

app.get('/api/process', (req, res) => {
    exec('ps -eo pid,comm,%cpu,rss --sort=-%cpu --no-headers', (err, stdout) => {
        if (err) return res.status(500).json({ error: err.message });

        const lines = stdout.trim().split('\n').slice(0, 15);
        const processes = lines.map(line => {
            const match = line.trim().match(/^(\d+)\s+(.+?)\s+([\d.]+)\s+([\d.]+)$/);
            if (!match) return null;
            return {
                pid: match[1],
                name: match[2],
                cpu: match[3],
                memory: match[4]
            };
        }).filter(p => p !== null);

        res.json(processes);
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

