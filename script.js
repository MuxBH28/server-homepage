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
    }

    function renderLinksList() {
        linksList.innerHTML = '';
        settings.links.forEach((link, i) => {
            const li = document.createElement('li');
            li.className = "flex justify-between items-center p-1 border-b border-gray-600 last:border-0";
            li.innerHTML = `
        <span><i class="bi ${link.icon}"></i> ${link.name}</span>
        <button data-index="${i}" class="text-red-500 hover:text-red-400 text-xl" aria-label="Delete link">&times;</button>
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

        const weatherAPIKey = "REDACTED";
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
                weatherBox.innerHTML += `<p class="text-red-400 mt-2 text-sm">Unable to load weather data.</p>`;
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
            .then((res) => res.json())
            .then((data) => {
                const cpuTemp = data.cpu_temp ?? null;
                const cpuTempLabel = document.getElementById("cpuTempLabel");
                const cpuTempPointer = document.getElementById("cpuTempPointer");
                if (cpuTemp === null) {
                    cpuTempLabel.textContent = "CPU Temp: N/A";
                    cpuTempPointer.style.left = "0%";
                } else {
                    const temp = Math.min(cpuTemp, 100);
                    const leftPercent = temp;
                    cpuTempPointer.style.left = `calc(${leftPercent}% - 6px)`;
                    cpuTempLabel.textContent = `CPU Temp: ${cpuTemp} °C`;
                }
                document.getElementById("uptime").textContent = "Uptime: " + data.uptime;

                const ramUsedGB = (data.memory.totalMem - data.memory.freeMem) / 1024 / 1024 / 1024;
                const totalMemGB = data.memory.totalMem / 1024 / 1024 / 1024;
                const freeMemGB = data.memory.freeMem / 1024 / 1024 / 1024;

                const cpuPercent = parseFloat(data.cpu_percent);
                const cpuUsedBar = document.getElementById("cpuUsedBar");
                const cpuIdleBar = document.getElementById("cpuIdleBar");
                const cpuUsedLabel = document.getElementById("cpuUsedLabel");
                const cpuIdleLabel = document.getElementById("cpuIdleLabel");

                cpuUsedBar.style.width = cpuPercent + "%";
                cpuIdleBar.style.width = 100 - cpuPercent + "%";
                cpuUsedLabel.textContent = `Used: ${cpuPercent.toFixed(1)}%`;
                cpuIdleLabel.textContent = `Idle: ${(100 - cpuPercent).toFixed(1)}%`;

                const ramUsedPercent = (ramUsedGB / totalMemGB) * 100;
                const ramFreePercent = (freeMemGB / totalMemGB) * 100;
                const ramUsedBar = document.getElementById("ramUsedBar");
                const ramFreeBar = document.getElementById("ramFreeBar");
                const ramUsedLabel = document.getElementById("ramUsedLabel");
                const ramFreeLabel = document.getElementById("ramFreeLabel");

                ramUsedBar.style.width = ramUsedPercent + "%";
                ramFreeBar.style.width = ramFreePercent + "%";
                ramUsedLabel.textContent = `Used: ${ramUsedGB.toFixed(2)} GB`;
                ramFreeLabel.textContent = `Free: ${freeMemGB.toFixed(2)} GB`;

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
            <h4 class="text-yellow-400 font-semibold mb-1">${path}</h4>
            <div class="w-full bg-gray-700 rounded-full h-5 overflow-hidden shadow-inner relative">
              <div class="h-5 bg-purple-600 transition-all duration-500" style="width: ${usedPercent}%"></div>
              <div class="h-5 bg-gray-400 transition-all duration-500 absolute right-0 top-0" style="width: ${freePercent}%"></div>
            </div>
            <div class="flex justify-between text-xs text-gray-400 mt-1 px-1">
              <span>Used: ${usedPercent.toFixed(1)}%</span>
              <span>${usedGB} GB / ${totalGB} GB</span>
            </div>
          `;
                    diskDiv.appendChild(diskSection);
                });

                preload.style.display = "none";
                main.classList.remove("hidden");
            })
            .catch((e) => {
                console.error("Greška pri dohvaćanju sistemskih podataka:", e);
                document.getElementById("systemInfo").textContent = "Ne mogu dohvatiti sistemske podatke.";
                preload.style.display = "none";
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
        <h3 class="text-lg font-semibold text-yellow-300 border-b border-gray-600 pb-2">${category}</h3>
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
                card.innerHTML = `<i class="bi ${link.icon} text-lg"></i> <span>${link.name}</span>`;
                grid.appendChild(card);
            });
            container.appendChild(section);
        });
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

    loadSettings();
    updateDate();

    let systemInterval;
    let weatherInterval;

    fetchLinks().then(() => {
        fetchSystemData();
        fetchWeather();
        systemInterval = setInterval(() => fetchSystemData(), settings.refreshInterval * 1000);
        weatherInterval = setInterval(() => fetchWeather(), settings.weatherRefreshInterval * 1000);
    });
});
