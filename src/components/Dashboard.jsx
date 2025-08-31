import { useEffect, useRef } from "react";
import initGauges from "./gauges/Gauges.js";
import ApexCharts from "apexcharts";

export default function Dashboard() {
    const cpuRef = useRef(null);
    const ramRef = useRef(null);
    const tempRef = useRef(null);
    const diskChartsRef = useRef(null);
    const logsChartRef = useRef(null);
    const gaugesRef = useRef({ cpuGauge: null, ramGauge: null, cpuTempGauge: null });

    useEffect(() => {
        if (cpuRef.current && ramRef.current && tempRef.current) {
            gaugesRef.current = initGauges(cpuRef.current, ramRef.current, tempRef.current);
        }

        let intervalId;

        const fetchAndSetupInterval = async () => {
            try {
                const res = await fetch("/api/system");
                const data = await res.json();

                updateGaugesAndDisks(data, diskChartsRef, gaugesRef);
                setIndicator(data.cpu_temp, data.cpu_percent, data.disk, false, true);

                const intervalTime = data.interval && !isNaN(data.interval) ? data.interval : 5000;
                intervalId = setTimeout(fetchAndSetupInterval, intervalTime);
            } catch (err) {
                console.error("Error getting data:", err);
                setIndicator(0, 0, {}, false, false);
                if (logsChartRef.current) {
                    logsChartRef.current.innerHTML = '<p class="text-red-600 text-center">Failed to load logs.</p>';
                }
            }
        };

        fetchSystemLogs(logsChartRef);
        fetchAndSetupInterval();

        return () => clearTimeout(intervalId);
    }, []);


    return (
        <>
            <section className="shadow-lg rounded-2xl p-6 mt-3 md:p-8 bg-black/40 backdrop-blur-md border border-white/20 flex flex-col w-full">
                <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-8 w-full">

                    <div className="flex flex-col items-center gap-6 w-full md:w-auto order-1 md:order-2">
                        <canvas id="cpuTempGauge" ref={tempRef} className="w-28 sm:w-32 md:w-[150px] md:h-[150px]" title="CPU Temperature"></canvas>
                        <div className="grid grid-cols-3 gap-4 p-4 border border-red-700 rounded-lg shadow w-full max-w-sm md:w-auto justify-items-center">
                            <Indicator id="indicatorBattery" src="/assets/battery.svg" />
                            <Indicator id="indicatorTemp" src="/assets/temperature.svg" />
                            <Indicator id="indicatorRam" src="/assets/ram-high.svg" />
                            <Indicator id="indicatorWarning" src="/assets/check-engine.svg" />
                            <Indicator id="indicatorNoLinks" src="/assets/no-links.svg" />
                            <Indicator id="indicatorStorage" src="/assets/storage.svg" />
                        </div>
                        <p id="uptime" className="text-sm text-red-600">
                            Uptime: N/A
                        </p>
                    </div>

                    <div className="flex flex-col items-center w-full md:w-auto order-2 md:order-1">
                        <canvas id="cpuGauge" ref={cpuRef} className="w-48 sm:w-56 md:w-[250px] md:h-[250px]" title="CPU Usage"></canvas>
                    </div>

                    <div className="flex flex-col items-center w-full md:w-auto order-3">
                        <canvas id="ramGauge" ref={ramRef} className="w-48 sm:w-56 md:w-[250px] md:h-[250px]" title="RAM Usage"></canvas>
                    </div>
                </div>

                <div ref={diskChartsRef} className="flex flex-col md:flex-row items-stretch justify-between mt-6 gap-6 w-full"></div>
            </section>

            <section className="shadow-lg rounded-2xl p-6 mt-3 md:p-8 bg-black/40 backdrop-blur-md border border-white/20 flex flex-col w-full">
                <div ref={logsChartRef} style={{ height: "400px" }}></div>
            </section>
        </>
    );
}

function Indicator({ id, src }) {
    return (
        <div id={id} className="w-8 h-8 opacity-40">
            <img src={src} alt={id} />
        </div>
    );
}

function setIndicator(cpuTemp, cpuPercent, disks, initial = false, apiOk = false) {
    const updateIndicator = (id, active, color) => {
        const el = document.getElementById(id);
        if (!el) return;

        el.classList.toggle("opacity-40", !active);

        const img = el.querySelector("img");
        if (!img) return;

        if (!active) {
            img.style.filter = "";
        } else {
            switch (color) {
                case 'red':
                    img.style.filter = 'invert(35%) sepia(80%) saturate(700%) hue-rotate(0deg) brightness(1.1)';
                    break;
                case 'orange':
                    img.style.filter = 'invert(90%) sepia(100%) saturate(1000%) hue-rotate(10deg) brightness(1.1)';
                    break;
                case 'limegreen':
                    img.style.filter = 'invert(60%) sepia(70%) saturate(500%) hue-rotate(80deg) brightness(1.2)';
                    break;
                default:
                    img.style.filter = '';
            }
        }
    };

    updateIndicator("indicatorTemp", cpuTemp >= 70, "red");
    updateIndicator("indicatorRam", cpuPercent >= 80, "orange");
    updateIndicator("indicatorWarning", cpuPercent >= 80 || cpuTemp >= 80, "red");
    updateIndicator("indicatorBattery", true, apiOk ? "limegreen" : "red");

    const storageWarning = Object.values(disks).some(disk => disk && disk.used / disk.total > 0.9);
    updateIndicator("indicatorStorage", storageWarning, "red");
}

function updateGaugesAndDisks(data, diskChartsRef, gaugesRef) {
    const { cpuGauge, ramGauge, cpuTempGauge } = gaugesRef.current;

    if (!cpuGauge || !ramGauge || !cpuTempGauge) return;

    cpuTempGauge.value = parseFloat(data.cpu_temp) || 0;
    cpuTempGauge.update();

    cpuGauge.value = parseFloat(data.cpu_percent) || 0;
    cpuGauge.update();

    const ramUsedGB = (data.memory.totalMem - data.memory.freeMem) / 1024 / 1024 / 1024;
    const totalMemGB = data.memory.totalMem / 1024 / 1024 / 1024;
    const ramUsedPercent = (ramUsedGB / totalMemGB) * 100;
    ramGauge.value = ramUsedPercent;
    ramGauge.update();

    if (!diskChartsRef.current) return;
    const diskDiv = diskChartsRef.current;
    diskDiv.innerHTML = "";

    Object.entries(data.disk).forEach(([path, disk]) => {
        if (!disk) {
            const p = document.createElement("p");
            p.textContent = `${path}: N/A`;
            p.className = "text-center text-gray-400";
            diskDiv.appendChild(p);
            return;
        }

        const usedPercent = (disk.used / disk.total) * 100;
        const freePercent = 100 - usedPercent;
        const usedGB = (disk.used / 1024 / 1024 / 1024).toFixed(2);
        const totalGB = (disk.total / 1024 / 1024 / 1024).toFixed(2);

        const section = document.createElement("section");
        section.className = "flex-1 mb-6";
        section.innerHTML = `
      <h4 class="text-red-600 font-semibold mb-1">${path}</h4>
      <div class="w-full bg-gray-700 rounded-full h-5 overflow-hidden shadow-inner relative">
        <div class="h-5 bg-red-600 transition-all duration-500" style="width: ${usedPercent}%"></div>
        <div class="h-5 bg-gray-400 transition-all duration-500 absolute right-0 top-0" style="width: ${freePercent}%"></div>
      </div>
      <div class="flex justify-between text-xs text-gray-400 mt-1 px-1">
        <span>Used: ${usedPercent.toFixed(1)}%</span>
        <span>${usedGB} GB / ${totalGB} GB</span>
      </div>
    `;
        diskDiv.appendChild(section);
    });

    const uptimeEl = document.getElementById("uptime");
    if (uptimeEl) {
        uptimeEl.textContent = `Uptime: ${data.uptime || "N/A"}`;
    }
}

function fetchSystemLogs(logsChartRef) {
    fetch("/api/logs")
        .then(res => res.json())
        .then(logs => {
            if (!logsChartRef.current) return;
            const container = logsChartRef.current;

            if (!logs || logs.length === 0) {
                container.innerHTML = '<p class="text-gray-400">No logs found.</p>';
                return;
            }

            const validLogs = logs.filter(log => log.cpu !== undefined && log.ram !== undefined && log.temp !== undefined);
            if (validLogs.length === 0) {
                container.innerHTML = '<p class="text-gray-400">No valid logs to display.</p>';
                return;
            }

            const labels = validLogs.map(log => log.timestamp);
            const cpuData = validLogs.map(log => log.cpu);
            const ramData = validLogs.map(log => log.ram);
            const tempData = validLogs.map(log => log.temp);

            const options = {
                chart: { type: 'line', height: 400, zoom: { enabled: true }, toolbar: { show: true, tools: { download: true } }, foreColor: '#fff' },
                theme: { mode: 'dark' },
                series: [
                    { name: 'CPU %', data: cpuData, color: '#007bff' },
                    { name: 'RAM %', data: ramData, color: '#28a745' },
                    { name: 'Temperature °C', data: tempData, color: '#dc3545' }
                ],
                xaxis: { categories: labels, labels: { style: { colors: '#fff' } } },
                yaxis: { min: 0, labels: { style: { colors: '#fff' } } },
                stroke: { curve: 'smooth' },
                tooltip: { shared: true },
                legend: { position: 'top', labels: { colors: '#fff' } }
            };

            container.innerHTML = '';
            new ApexCharts(container, options).render();
        })
        .catch(err => {
            console.error(err);
            if (logsChartRef.current) {
                logsChartRef.current.innerHTML = '<p class="text-red-600">Failed to load logs.</p>';
            }
        });
}
