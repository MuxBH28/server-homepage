document.addEventListener("DOMContentLoaded", () => {
    const preload = document.getElementById("preloader");
    const main = document.getElementById("mainContent");
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettings = document.getElementById('closeSettings');
    const cityInput = document.getElementById('cityInput');
    const refreshIntervalInput = document.getElementById('refreshInterval');
    const linksList = document.getElementById('linksList');
    const addLinkForm = document.getElementById('addLinkForm');
    const linkNameInput = document.getElementById('linkName');
    const linkIconInput = document.getElementById('linkIcon');
    const linkCategoryInput = document.getElementById('linkCategory');
    const linkUrlInput = document.getElementById('linkUrl');
    const searchInput = document.getElementById("linkSearch");
    let cpuGauge, ramGauge, cpuTempGauge;
    function initGauges() {
        cpuGauge = new RadialGauge({
            renderTo: 'cpuGauge',
            width: 250,
            height: 250,
            units: '%',
            minValue: 0,
            maxValue: 100,
            majorTicks: ['0', '20', '40', '60', '80', '100'],
            minorTicks: 4,
            strokeTicks: true,
            highlights: [
                { from: 0, to: 60, color: 'rgba(0, 200, 0, 0.7)' },
                { from: 60, to: 80, color: 'rgba(255, 255, 0, 0.7)' },
                { from: 80, to: 100, color: 'rgba(255, 0, 0, 0.7)' }
            ],
            colorPlate: '#2d2d3d',
            colorUnits: '#f5f5f5',
            colorNumbers: '#f5f5f5',
            colorMajorTicks: '#f5f5f5',
            colorMinorTicks: '#aaa',
            colorNeedle: 'rgba(255, 238, 88, 1)',
            colorNeedleEnd: 'rgba(255, 200, 100, 0.9)',
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
            borderShadowWidth: 0,
            valueInt: 1,
            title: "CPU Usage",
            titleFont: "18px sans-serif",
            titleFontWeight: "bold",
            titleShadow: false
        }).draw();

        ramGauge = new RadialGauge({
            renderTo: 'ramGauge',
            width: 250,
            height: 250,
            units: '%',
            minValue: 0,
            maxValue: 100,
            majorTicks: ['0', '20', '40', '60', '80', '100'],
            minorTicks: 4,
            strokeTicks: true,
            highlights: [
                { from: 0, to: 50, color: 'rgba(0, 180, 0, 0.7)' },
                { from: 50, to: 80, color: 'rgba(255, 255, 0, 0.7)' },
                { from: 80, to: 100, color: 'rgba(255, 0, 0, 0.7)' }
            ],
            colorPlate: '#2d2d3d',
            colorUnits: '#f5f5f5',
            colorNumbers: '#f5f5f5',
            colorMajorTicks: '#f5f5f5',
            colorMinorTicks: '#aaa',
            colorNeedle: 'rgba(255, 238, 88, 1)',
            colorNeedleEnd: 'rgba(255, 200, 100, 0.9)',
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
            borderShadowWidth: 0,
            valueInt: 1,
            title: "RAM Usage",
            titleFont: "18px sans-serif",
            titleFontWeight: "bold",
            titleShadow: false
        }).draw();

        cpuTempGauge = new RadialGauge({
            renderTo: 'cpuTempGauge',
            width: 150,
            height: 150,
            units: '°C',
            minValue: 0,
            maxValue: 100,
            majorTicks: ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100'],
            minorTicks: 2,
            strokeTicks: true,
            highlights: [
                { from: 0, to: 10, color: 'rgba(0, 0, 255, 0.5)' },
                { from: 10, to: 40, color: 'rgba(0,0,0,0)' },
                { from: 40, to: 60, color: 'rgba(0, 200, 0, 0.5)' },
                { from: 60, to: 70, color: 'rgba(0,0,0,0)' },
                { from: 70, to: 80, color: 'rgba(255, 255, 0, 0.5)' },
                { from: 80, to: 100, color: 'rgba(200, 50, 50, 0.5)' }
            ],
            colorPlate: '#2d2d3d',
            colorUnits: '#f5f5f5',
            colorNumbers: '#f5f5f5',
            colorMajorTicks: '#f5f5f5',
            colorMinorTicks: '#aaa',
            colorNeedle: 'rgba(255, 238, 88, 1)',
            colorNeedleEnd: 'rgba(255, 200, 100, 0.9)',
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
            borderShadowWidth: 0,
            valueInt: 1,
            title: "CPU Temp",
            titleFont: "18px sans-serif",
            titleFontWeight: "bold",
            titleShadow: false
        }).draw();
    }
    let settings = {
        city: 'Sarajevo',
        refreshInterval: 30,
        weatherRefreshInterval: 300,
        links: []
    };

    function saveSettings() {
        localStorage.setItem('monitorSettings', JSON.stringify(settings));
    }

    function loadSettings() {
        const s = localStorage.getItem('monitorSettings');
        if (s) {
            settings = JSON.parse(s);
        }
    }

    function updateDate() {
        const dt = new Date();

        const options = { weekday: "long", day: "2-digit", month: "long", year: "numeric" };
        document.getElementById("datetime").textContent = dt.toLocaleDateString("en-GB", options);

        const hours = String(dt.getHours()).padStart(2, '0');
        const minutes = String(dt.getMinutes()).padStart(2, '0');
        document.getElementById("time").textContent = `${hours}:${minutes}`;
    }

    function checkLinkStatus(url, dot) {
        fetch(url, { method: 'HEAD', mode: 'no-cors' })
            .then(() => {
                dot.classList.remove('bg-red-600', 'bg-gray-400');
                dot.classList.add('bg-green-500');
            })
            .catch(() => {
                dot.classList.remove('bg-green-500', 'bg-gray-400');
                dot.classList.add('bg-red-600');
            });
    }


    function renderLinksList() {
        linksList.innerHTML = '';
        settings.links.forEach((link, i) => {
            const li = document.createElement('li');
            li.className = "flex justify-between items-center p-1 border-b border-gray-600 last:border-0";
            li.innerHTML = `
        <span><i class="bi ${link.icon}"></i> ${link.name}</span>
        <button data-index="${i}" class="text-red-600 hover:text-red-600 text-xl" aria-label="Delete link">&times;</button>
      `;
            linksList.appendChild(li);
        });
    }

    function fetchWeather(force = false) {
        const weatherKey = "weatherData";
        const weatherTimeKey = "weatherDataTime";
        const now = Date.now();

        if (!force) {
            const cachedTime = localStorage.getItem(weatherTimeKey);
            const cachedData = localStorage.getItem(weatherKey);
            if (cachedData && cachedTime && (now - cachedTime) / 1000 < settings.weatherRefreshInterval) {
                updateWeatherUI(JSON.parse(cachedData));
                return Promise.resolve();
            }
        }

        const weatherAPIKey = "1d6f2f389d424a848c6185910251002";
        const weatherAPI = `https://api.weatherapi.com/v1/current.json?key=${weatherAPIKey}&q=${encodeURIComponent(settings.city)}&aqi=yes`;

        return fetch(weatherAPI)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch weather");
                return res.json();
            })
            .then((data) => {
                localStorage.setItem(weatherKey, JSON.stringify(data));
                localStorage.setItem(weatherTimeKey, now.toString());
                updateWeatherUI(data);
            })
            .catch(() => {
                const weatherBox = document.getElementById("weatherBox");
                weatherBox.innerHTML += `<p class="text-red-600 mt-2 text-sm">Unable to load weather data.</p>`;
            });
    }

    function updateWeatherUI(data) {
        if (!data) return;
        const aqi = data.current.air_quality["gb-defra-index"];
        let aqiText = "";
        if (aqi <= 3) aqiText = "Good 😊";
        else if (aqi <= 6) aqiText = "Moderate 😐";
        else if (aqi <= 9) aqiText = "Poor 😷";
        else aqiText = "Very Poor ☠️";

        document.getElementById("location-name").innerHTML = `<i class="bi bi-geo-alt"></i> ${data.location.name}`;
        document.getElementById("temperature").innerHTML = `<i class="bi bi-thermometer-half"></i> ${data.current.temp_c}°C`;
        document.getElementById("wind").innerHTML = `<i class="bi bi-wind"></i> ${data.current.wind_kph} km/h`;
        document.getElementById("humidity").innerHTML = `<i class="bi bi-moisture"></i> ${data.current.humidity}%`;
        document.getElementById("clouds").innerHTML = `<i class="bi bi-cloud-fog2"></i> ${data.current.cloud}%`;
        document.getElementById("air-quality").innerHTML = `<i class="bi bi-lungs"></i> ${aqiText}`;
    }
    function fetchSystemData() {
        fetch("/api/system")
            .then(res => res.json())
            .then(data => {
                const cpuTemp = data.cpu_temp !== undefined && data.cpu_temp !== null ?
                    Math.max(0, Math.min(100, parseFloat(data.cpu_temp))) : 0;

                cpuTempGauge.value = cpuTemp;
                cpuTempGauge.update();

                const cpuPercent = parseFloat(data.cpu_percent) || 0;
                cpuGauge.value = Math.min(100, cpuPercent);
                cpuGauge.update();

                const ramUsedGB = (data.memory.totalMem - data.memory.freeMem) / 1024 / 1024 / 1024;
                const totalMemGB = data.memory.totalMem / 1024 / 1024 / 1024;
                const freeMemGB = data.memory.freeMem / 1024 / 1024 / 1024;
                const ramUsedPercent = (ramUsedGB / totalMemGB) * 100;

                ramGauge.value = Math.min(100, ramUsedPercent);
                ramGauge.update();

                document.getElementById("uptime").textContent = "Uptime: " + data.uptime;

                const diskDiv = document.getElementById("diskCharts");
                diskDiv.innerHTML = "";
                Object.entries(data.disk).forEach(([path, disk]) => {
                    if (!disk) {
                        const p = document.createElement("p");
                        p.className = "text-center text-gray-400";
                        p.textContent = `${path}: N/A`;
                        diskDiv.appendChild(p);
                        return;
                    }
                    const usedPercent = (disk.used / disk.total) * 100;
                    const freePercent = 100 - usedPercent;
                    const usedGB = (disk.used / 1024 / 1024 / 1024).toFixed(2);
                    const totalGB = (disk.total / 1024 / 1024 / 1024).toFixed(2);
                    const diskSection = document.createElement("section");
                    diskSection.className = "mb-6";
                    diskSection.innerHTML = `
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
                    diskDiv.appendChild(diskSection);
                });

                preload.classList.add("fade-out");
                setTimeout(() => preload.remove(), 500);
                main.classList.remove("hidden");

                if (cpuTemp >= 80) setIndicatorActive('indicatorTemp', 'red');
                else if (cpuTemp >= 70) setIndicatorActive('indicatorTemp', 'red');
                else setIndicatorInactive('indicatorTemp');

                if (cpuPercent >= 80) setIndicatorActive('indicatorRam', 'red');
                else setIndicatorInactive('indicatorRam');

                if (cpuPercent >= 80 || cpuTemp >= 80) setIndicatorActive('indicatorWarning', 'red');
                else setIndicatorInactive('indicatorWarning');

                setIndicatorActive('indicatorBattery', 'limegreen');

                let storageWarning = false;
                Object.values(data.disk).forEach(disk => {
                    if (disk && disk.used / disk.total > 0.9) storageWarning = true;
                });
                if (storageWarning) setIndicatorActive('indicatorStorage', 'red');
                else setIndicatorInactive('indicatorStorage');

            })
            .catch(e => {
                console.error("Greška pri dohvaćanju sistemskih podataka:", e);
                document.getElementById("systemInfo").textContent = "Ne mogu dohvatiti sistemske podatke.";
                preload.classList.add("fade-out");
                setTimeout(() => preload.remove(), 500);
                main.classList.remove("hidden");
            });
    }


    function fetchLinks() {
        return fetch("/api/links")
            .then((res) => res.json())
            .then((data) => {
                settings.links = data;
                renderLinksList();
                renderLinksOnPage();
            })
            .catch(() => {
                settings.links = [];
                renderLinksList();
            });
    }

    function renderLinksOnPage() {
        const container = document.getElementById("linksContainer");
        container.innerHTML = "";
        const grouped = settings.links.reduce((acc, link) => {
            if (!acc[link.category]) acc[link.category] = [];
            acc[link.category].push(link);
            return acc;
        }, {});
        Object.entries(grouped).forEach(([category, links]) => {
            const section = document.createElement("section");
            section.className = "space-y-4";
            section.innerHTML = `
        <h3 class="text-lg font-semibold text-red-600 border-b border-gray-600 pb-2">${category}</h3>
        <div class="flex flex-wrap gap-4 justify-center"></div>
      `;
            const grid = section.querySelector("div");
            links.forEach((link) => {
                const card = document.createElement("a");
                card.href = link.url;
                card.target = "_blank";
                card.className = `
          flex items-center gap-2 bg-[#3a3a4d] text-white hover:bg-[#505070]
          rounded-lg px-4 py-3 shadow-md transition-transform transform hover:scale-105
          w-full sm:w-auto
        `;
                card.innerHTML = `
  <span class="inline-block w-2 h-2 rounded-full bg-gray-400" data-url="${link.url}"></span>
  <i class="bi ${link.icon} text-lg"></i>
  <span>${link.name}</span>
`;
                grid.appendChild(card);
                const dot = card.querySelector('span');
                checkLinkStatus(link.url, dot);

            });
            container.appendChild(section);
        });
        if (settings.links.length === 0) setIndicatorActive('indicatorNoLinks', 'red');
        else setIndicatorInactive('indicatorNoLinks');

    }

    function filterLinks() {
        const searchTerm = searchInput.value.toLowerCase();
        const sections = document.querySelectorAll("#linksContainer section");
        sections.forEach((section) => {
            const cards = section.querySelectorAll("a");
            let anyVisible = false;
            cards.forEach((card) => {
                const text = card.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    card.style.display = "flex";
                    anyVisible = true;
                } else {
                    card.style.display = "none";
                }
            });
            section.style.display = anyVisible ? "block" : "none";
        });
    }

    searchInput.addEventListener("input", filterLinks);

    settingsBtn.addEventListener('click', async () => {
        loadSettings();
        cityInput.value = settings.city;
        refreshIntervalInput.value = settings.refreshInterval;
        await fetchLinks();
        renderLinksList();
        settingsModal.classList.remove('hidden');
    });


    closeSettings.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
        saveSettings();
        fetchLinks();
        fetchWeather(true);
        clearInterval(systemInterval);
        systemInterval = setInterval(() => fetchSystemData(), settings.refreshInterval * 1000);
        clearInterval(weatherInterval);
        weatherInterval = setInterval(() => fetchWeather(), settings.weatherRefreshInterval * 1000);
    });

    settingsModal.addEventListener('click', e => {
        if (e.target === settingsModal) {
            settingsModal.classList.add('hidden');
            saveSettings();
            fetchLinks();
            fetchWeather(true);
            clearInterval(systemInterval);
            systemInterval = setInterval(() => fetchSystemData(), settings.refreshInterval * 1000);
            clearInterval(weatherInterval);
            weatherInterval = setInterval(() => fetchWeather(), settings.weatherRefreshInterval * 1000);
        }
    });

    linksList.addEventListener('click', async e => {
        if (e.target.matches('button')) {
            const idx = e.target.dataset.index;
            if (idx !== undefined) {
                try {
                    const res = await fetch(`/api/links/${idx}`, {
                        method: 'DELETE'
                    });

                    if (!res.ok) throw new Error("Delete failed");

                    await fetchLinks();
                } catch (err) {
                    alert("Brisanje nije uspjelo");
                    console.error(err);
                }
            }
        }
    });


    addLinkForm.addEventListener('submit', async e => {
        e.preventDefault();
        const name = linkNameInput.value.trim();
        const url = linkUrlInput.value.trim();
        const icon = linkIconInput.value.trim() || 'bi-link-45deg';
        const category = linkCategoryInput.value;

        if (name && url) {
            try {
                const res = await fetch('/api/links', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, url, icon, category })
                });

                if (!res.ok) throw new Error("Failed to save");

                await fetchLinks();
                linkNameInput.value = '';
                linkUrlInput.value = '';
                linkIconInput.value = '';
                linkCategoryInput.value = 'Other';
            } catch (err) {
                alert('Greška pri dodavanju linka.');
                console.error(err);
            }
        }
    });

    cityInput.addEventListener('change', e => {
        settings.city = e.target.value.trim() || 'Sarajevo';
    });

    refreshIntervalInput.addEventListener('change', e => {
        let val = parseInt(e.target.value);
        if (isNaN(val) || val < 5) val = 5;
        else if (val > 3600) val = 3600;
        settings.refreshInterval = val;
        refreshIntervalInput.value = val;
    });
    function fetchSystemProcess() {
        fetch('/api/process')
            .then(res => res.json())
            .then(processes => {
                const container = document.getElementById('processContainer');
                if (!processes || processes.length === 0) {
                    container.innerHTML = '<p class="text-gray-400">No processes found.</p>';
                    return;
                }

                let html = `
                <table class="w-full text-left text-sm text-gray-300 border border-gray-700 rounded-lg">
                    <thead class="bg-gray-800 sticky top-0">
                        <tr>
                            <th class="px-3 py-2 border-b border-gray-700">PID</th>
                            <th class="px-3 py-2 border-b border-gray-700">Name</th>
                            <th class="px-3 py-2 border-b border-gray-700">CPU %</th>
                            <th class="px-3 py-2 border-b border-gray-700">Memory</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
                processes.forEach(p => {
                    html += `
                    <tr class="hover:bg-gray-700">
                        <td class="px-3 py-1 border-b border-gray-700">${p.pid}</td>
                        <td class="px-3 py-1 border-b border-gray-700">${p.name}</td>
                        <td class="px-3 py-1 border-b border-gray-700">${p.cpu}</td>
                        <td class="px-3 py-1 border-b border-gray-700">${formatBytes(p.memory)}</td>
                    </tr>
                `;
                });
                html += `</tbody></table>`;
                container.innerHTML = html;
            })
            .catch(err => {
                console.error(err);
                document.getElementById('processContainer').innerHTML =
                    '<p class="text-red-600">Failed to load processes.</p>';
            });
    }

    function formatBytes(kb) {
        if (!kb || kb === '0') return '0 MB';
        const num = parseFloat(kb);
        const mb = num / 1024;
        return mb.toFixed(1) + ' MB';
    }

    function setIndicatorActive(id, color) {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('opacity-40');

        const img = el.querySelector('img');
        switch (color) {
            case 'red':
                img.style.filter = 'invert(35%) sepia(80%) saturate(700%) hue-rotate(0deg) brightness(1.1)';
                break;
            case 'red':
                img.style.filter = 'invert(90%) sepia(100%) saturate(1000%) hue-rotate(10deg) brightness(1.1)';
                break;
            case 'limegreen':
                img.style.filter = 'invert(60%) sepia(70%) saturate(500%) hue-rotate(80deg) brightness(1.2)';
                break;
            default:
                img.style.filter = '';
        }
    }

    function setIndicatorInactive(id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.add('opacity-40');
        el.querySelector('img').style.filter = '';
    }



    initGauges();
    loadSettings();
    updateDate();

    let systemInterval;
    let weatherInterval;
    let processInterval;

    fetchLinks().then(() => {
        fetchSystemData();
        fetchWeather();
        fetchSystemProcess();

        systemInterval = setInterval(
            () => updateDate(),
            settings.refreshInterval * 1000
        );

        systemInterval = setInterval(
            () => fetchSystemData(),
            settings.refreshInterval * 1000
        );

        weatherInterval = setInterval(
            () => fetchWeather(),
            settings.weatherRefreshInterval * 1000
        );

        processInterval = setInterval(
            () => fetchSystemProcess(),
            settings.processRefreshInterval
                ? settings.processRefreshInterval * 1000
                : 5000
        );
    });

});
