import baseGaugeOptions from "./baseGauge";

const MAX_SIZE = { cpu: 250, ram: 250, temp: 150 };
const MIN_SIZE = 130;

function sizeFor(cell, max) {
    const available = cell?.clientWidth || max;
    return Math.max(MIN_SIZE, Math.min(max, Math.floor(available)));
}

function initGauges(cpuCanvas, ramCanvas, tempCanvas, cells = {}) {
    if (!cpuCanvas || !ramCanvas || !tempCanvas) {
        console.error("Canvas elements must be provided to initGauges!");
        return;
    }

    const cpuSize = sizeFor(cells.cpu, MAX_SIZE.cpu);
    const ramSize = sizeFor(cells.ram, MAX_SIZE.ram);
    const tempSize = sizeFor(cells.temp, MAX_SIZE.temp);

    const cpuGauge = new RadialGauge({
        ...baseGaugeOptions,
        renderTo: cpuCanvas,
        width: cpuSize,
        height: cpuSize,
        units: '%',
        minValue: 0,
        maxValue: 100,
        majorTicks: ['0', '20', '40', '60', '80', '100'],
        minorTicks: 4,
        highlights: [
            { from: 0, to: 20, color: 'rgba(0, 200, 0, 0.7)' },
            { from: 20, to: 60, color: 'rgba(0,0,0,0)' },
            { from: 60, to: 80, color: 'rgba(255, 255, 0, 0.7)' },
            { from: 80, to: 100, color: 'rgba(255, 0, 0, 0.7)' }
        ],
        title: "CPU Usage"
    }).draw();

    const ramGauge = new RadialGauge({
        ...baseGaugeOptions,
        renderTo: ramCanvas,
        width: ramSize,
        height: ramSize,
        units: '%',
        minValue: 0,
        maxValue: 100,
        majorTicks: ['0', '20', '40', '60', '80', '100'],
        minorTicks: 4,
        highlights: [
            { from: 0, to: 20, color: 'rgba(0, 180, 0, 0.7)' },
            { from: 20, to: 50, color: 'rgba(0,0,0,0)' },
            { from: 50, to: 80, color: 'rgba(255, 255, 0, 0.7)' },
            { from: 80, to: 100, color: 'rgba(255, 0, 0, 0.7)' }
        ],
        title: "RAM Usage"
    }).draw();

    const cpuTempGauge = new RadialGauge({
        ...baseGaugeOptions,
        renderTo: tempCanvas,
        width: tempSize,
        height: tempSize,
        units: '°C',
        minValue: 0,
        maxValue: 100,
        majorTicks: ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100'],
        minorTicks: 2,
        highlights: [
            { from: 0, to: 10, color: 'rgba(0, 0, 255, 0.5)' },
            { from: 10, to: 40, color: 'rgba(0,0,0,0)' },
            { from: 40, to: 60, color: 'rgba(0, 200, 0, 0.5)' },
            { from: 60, to: 70, color: 'rgba(0,0,0,0)' },
            { from: 70, to: 80, color: 'rgba(255, 255, 0, 0.5)' },
            { from: 80, to: 100, color: 'rgba(200, 50, 50, 0.5)' }
        ],
        title: "CPU Temp"
    }).draw();

    return { cpuGauge, ramGauge, cpuTempGauge };
}

export function fitGauges(gauges, cells) {
    if (!gauges) return;
    const { cpuGauge, ramGauge, cpuTempGauge } = gauges;

    [
        [cpuGauge, cells.cpu, MAX_SIZE.cpu],
        [ramGauge, cells.ram, MAX_SIZE.ram],
        [cpuTempGauge, cells.temp, MAX_SIZE.temp],
    ].forEach(([gauge, cell, max]) => {
        if (!gauge || !cell) return;
        const size = sizeFor(cell, max);
        if (gauge.options.width !== size) {
            gauge.update({ width: size, height: size });
        }
    });
}

export default initGauges;