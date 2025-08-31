import baseGaugeOptions from "./baseGauge";

function initGauges(cpuCanvas, ramCanvas, tempCanvas) {
    if (!cpuCanvas || !ramCanvas || !tempCanvas) {
        console.error("Canvas elements must be provided to initGauges!");
        return;
    }

    const cpuGauge = new RadialGauge({
        ...baseGaugeOptions,
        renderTo: cpuCanvas,
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
        width: 150,
        height: 150,
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

export default initGauges;
