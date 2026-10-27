import { useEffect, useRef, useState } from "react";
import initGauges, { fitGauges } from "./gauges/Gauges.js";
import ApexCharts from "apexcharts";

export default function Dashboard() {
    const cpuRef = useRef(null);
    const ramRef = useRef(null);
    const tempRef = useRef(null);
    const cpuCellRef = useRef(null);
    const ramCellRef = useRef(null);
    const tempCellRef = useRef(null);
    const diskChartsRef = useRef(null);
    const logsChartRef = useRef(null);
    const gaugesRef = useRef({ cpuGauge: null, ramGauge: null, cpuTempGauge: null });
    const [leftBlinker, setLeftBlinker] = useState(false);
    const [rightBlinker, setRightBlinker] = useState(false);
    const [leftBlinkerFill, setLeftBlinkerFill] = useState(false);
    const [rightBlinkerFill, setRightBlinkerFill] = useState(false);
    useEffect(() => {
        if (cpuRef.current && ramRef.current && tempRef.current) {
            gaugesRef.current = initGauges(cpuRef.current, ramRef.current, tempRef.current, {
                cpu: cpuCellRef.current,
                ram: ramCellRef.current,
                temp: tempCellRef.current,
            });
        }

        let resizeObserver;
        let resizeFrame;
        if (typeof ResizeObserver !== "undefined") {
            resizeObserver = new ResizeObserver(() => {
                cancelAnimationFrame(resizeFrame);
                resizeFrame = requestAnimationFrame(() =>
                    fitGauges(gaugesRef.current, {
                        cpu: cpuCellRef.current,
                        ram: ramCellRef.current,
                        temp: tempCellRef.current,
                    })
                );
            });
            [cpuCellRef, ramCellRef, tempCellRef].forEach((ref) => {
                if (ref.current) resizeObserver.observe(ref.current);
            });
        }

        let intervalId;

        const fetchAndSetupInterval = async () => {
            try {
                const res = await fetch("/api/system");
                const data = await res.json();

                const ramUsedGB = (data.memory.totalMem - data.memory.freeMem) / 1024 / 1024 / 1024;
                const totalMemGB = data.memory.totalMem / 1024 / 1024 / 1024;
                const ramUsedPercent = (ramUsedGB / totalMemGB) * 100;

                updateGaugesAndDisks(data, diskChartsRef, gaugesRef, ramUsedPercent);
                setIndicator(data.cpu_temp, data.cpu_percent, data.disk, ramUsedPercent, true);

                const intervalTime = data.interval && !isNaN(data.interval) ? data.interval : 5000;
                intervalId = setTimeout(fetchAndSetupInterval, intervalTime);
            } catch (err) {
                console.error("Error getting data:", err);
                setIndicator(0, 0, {}, 0, false);
                if (logsChartRef.current) {
                    logsChartRef.current.innerHTML = '<p class="text-red-600 text-center">Failed to load logs.</p>';
                }
            }
        };

        fetchSystemLogs(logsChartRef);
        fetchAndSetupInterval();

        const handleKeyDown = (e) => {
            if (e.key === "r" && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                fetchSystemLogs(logsChartRef);
                fetchAndSetupInterval();
            }

            if (e.shiftKey && e.key === "ArrowLeft") {
                e.preventDefault();
                setLeftBlinker((prev) => !prev);
                setRightBlinker(false);
            }
            if (e.shiftKey && e.key === "ArrowRight") {
                e.preventDefault();
                setRightBlinker((prev) => !prev);
                setLeftBlinker(false);
            }

            if (e.shiftKey && e.key === "ArrowUp") {
                e.preventDefault();
                setLeftBlinker(true);
                setRightBlinker(true);
                setLeftBlinkerFill(true);
                setRightBlinkerFill(true);
            }

            if (e.shiftKey && e.key === "ArrowDown") {
                e.preventDefault();
                setLeftBlinker(false);
                setRightBlinker(false);
                setLeftBlinkerFill(false);
                setRightBlinkerFill(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            clearTimeout(intervalId);
            cancelAnimationFrame(resizeFrame);
            resizeObserver?.disconnect();
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    useEffect(() => {
        if (leftBlinker || rightBlinker) {
            const blinkInterval = setInterval(() => {
                if (leftBlinker && rightBlinker) {
                    setLeftBlinkerFill(prev => !prev);
                    setRightBlinkerFill(prev => !prev);
                } else {
                    if (leftBlinker) setLeftBlinkerFill(prev => !prev);
                    if (rightBlinker) setRightBlinkerFill(prev => !prev);
                }
            }, 600);

            return () => clearInterval(blinkInterval);
        }
    }, [leftBlinker, rightBlinker]);

    return (
        <>
            <section className="shadow-lg rounded-2xl p-4 sm:p-6 md:p-8 bg-black/40 backdrop-blur-md border border-white/20 flex flex-col w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    <div
                        ref={tempCellRef}
                        className="relative flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-4 sm:gap-8 lg:gap-6 w-full min-w-0 order-1 sm:order-3 sm:col-span-2 lg:col-span-1 lg:order-2"
                    >
                        {leftBlinker && (
                            <div className="absolute -top-2 left-0 text-green-600 text-4xl">
                                <i
                                    className={`bi ${leftBlinkerFill ? "bi-caret-left-fill" : "bi-caret-left"
                                        }`}
                                ></i>
                            </div>
                        )}

                        {rightBlinker && (
                            <div className="absolute -top-2 right-0 text-green-600 text-4xl">
                                <i
                                    className={`bi ${rightBlinkerFill ? "bi-caret-right-fill" : "bi-caret-right"
                                        }`}
                                ></i>
                            </div>
                        )}
                        <canvas id="cpuTempGauge" ref={tempRef} title="CPU Temperature"></canvas>
                        <div className="flex flex-col items-center gap-4 w-full max-w-sm sm:w-auto lg:w-full">
                            <div className="grid grid-cols-3 gap-4 p-4 border border-red-700 rounded-lg shadow w-full justify-items-center">
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
                    </div>

                    <div ref={cpuCellRef} className="flex flex-col items-center w-full min-w-0 order-2 sm:order-1">
                        <canvas id="cpuGauge" ref={cpuRef} title="CPU Usage"></canvas>
                    </div>

                    <div ref={ramCellRef} className="flex flex-col items-center w-full min-w-0 order-3 sm:order-2 lg:order-3">
                        <canvas id="ramGauge" ref={ramRef} title="RAM Usage"></canvas>
                    </div>
                </div>

                <div ref={diskChartsRef} className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] items-start mt-6 gap-6 w-full"></div>
            </section>

            <section className="shadow-lg rounded-2xl p-2 sm:p-6 md:p-8 bg-black/40 backdrop-blur-md border border-white/20 flex flex-col w-full">
                <div ref={logsChartRef} className="w-full min-w-0 h-[300px] sm:h-[400px]"></div>
            </section>
        </>
    );
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
}

function Indicator({ id, src }) {
    return (
        <div id={id} className="w-8 h-8 opacity-40">
            <img src={src} alt={id} />
        </div>
    );
}

function setIndicator(cpuTemp, cpuPercent, disks, ramUsedPercent, apiOk = false) {
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
    updateIndicator("indicatorRam", ramUsedPercent >= 80, "red");
    updateIndicator("indicatorWarning", cpuPercent >= 80 || cpuTemp >= 80, "red");
    updateIndicator("indicatorBattery", true, apiOk ? "limegreen" : "red");

    const storageWarning = Object.values(disks).some(disk => disk && disk.used / disk.total > 0.9);
    updateIndicator("indicatorStorage", storageWarning, "red");
}

function updateGaugesAndDisks(data, diskChartsRef, gaugesRef, ramUsedPercent) {
    const { cpuGauge, ramGauge, cpuTempGauge } = gaugesRef.current;

    if (!cpuGauge || !ramGauge || !cpuTempGauge) return;

    cpuTempGauge.value = parseFloat(data.cpu_temp) || 0;
    cpuTempGauge.update();

    cpuGauge.value = parseFloat(data.cpu_percent) || 0;
    cpuGauge.update();

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
        section.className = "min-w-0";
        section.innerHTML = `
      <h4 class="text-red-600 font-semibold mb-1 truncate" title="${escapeHtml(path)}">${escapeHtml(path)}</h4>
        <div class="w-full bg-gray-700 rounded-full h-5 overflow-hidden shadow-inner relative">
        <div class="h-5 bg-red-600 transition-all duration-500" style="width: ${usedPercent}%"></div>
        <div class="h-5 bg-gray-400 transition-all duration-500 absolute right-0 top-0" style="width: ${freePercent}%"></div>
      </div>
      <div class="flex flex-wrap justify-between gap-x-3 text-xs text-gray-400 mt-1 px-1">
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

            const isNarrow = window.innerWidth < 640;

            const options = {
                chart: { type: 'line', height: isNarrow ? 300 : 400, zoom: { enabled: true }, toolbar: { show: !isNarrow, tools: { download: true } }, foreColor: '#fff' },
                theme: { mode: 'dark' },
                series: [
                    { name: 'CPU %', data: cpuData, color: '#007bff' },
                    { name: 'RAM %', data: ramData, color: '#28a745' },
                    { name: 'Temperature °C', data: tempData, color: '#dc3545' }
                ],
                xaxis: {
                    categories: labels,
                    tickAmount: isNarrow ? 4 : 8,
                    labels: { style: { colors: '#fff' }, rotate: -45, hideOverlappingLabels: true, trim: false }
                },
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
