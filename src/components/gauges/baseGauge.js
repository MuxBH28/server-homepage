const isMobile = window.innerWidth < 768;

const baseGaugeOptions = {
    width: isMobile ? 180 : 250,
    height: isMobile ? 180 : 250,
    strokeTicks: true,
    needleType: 'arrow',
    needleWidth: 2,
    needleCircleSize: 7,
    needleCircleOuter: true,
    needleCircleInner: false,
    animationDuration: 1000,
    animationRule: 'linear',
    valueBox: true,
    valueTextShadow: false,
    borders: true,
    value: 0,
    borderShadowWidth: 0,
    valueInt: 1,
    colorPlate: '#00000005',
    colorUnits: '#f5f5f5',
    colorNumbers: '#f5f5f5',
    colorMajorTicks: '#f5f5f5',
    colorMinorTicks: '#aaa',
    colorNeedle: 'rgba(255, 0, 0, 1)',
    colorNeedleEnd: 'rgba(255, 100, 100, 0.9)',
    titleFont: isMobile ? "14px sans-serif" : "18px sans-serif",
    titleFontWeight: "bold",
    titleShadow: false
};

export default baseGaugeOptions;
