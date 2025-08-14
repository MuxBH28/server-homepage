$(document).ready(function () {
    const $preload = $('#preloader');
    const $main = $('#mainContent');
    const $settingsBtn = $('#settingsBtn');
    const $settingsModal = $('#settingsModal');
    const $closeSettings = $('#closeSettings');
    const $cityInput = $('#cityInput');
    const $refreshIntervalInput = $('#refreshInterval');
    const $linksList = $('#linksList');
    const $addLinkForm = $('#addLinkForm');
    const $linkNameInput = $('#linkName');
    const $linkIconInput = $('#linkIcon');
    const $linkCategoryInput = $('#linkCategory');
    const $linkUrlInput = $('#linkUrl');
    const $searchInput = $("#linkSearch");
    let cpuGauge, ramGauge, cpuTempGauge;
    const $welcomeModal = $("#welcomeModal");
    const $closeWelcomeBtn = $("#closeWelcome");
    const $dontShowCheckbox = $("#dontShowWelcome");

    /*Misc */
    const hideWelcome = localStorage.getItem("hideWelcomeScreen");

    if (hideWelcome !== "true") {
        $welcomeModal.removeClass("hidden");
    }

    $closeWelcomeBtn.on("click", function () {
        if ($dontShowCheckbox.is(":checked")) {
            localStorage.setItem("hideWelcomeScreen", "true");
        }
        $welcomeModal.addClass("hidden");
    });

    function initGauges() {
        const baseGaugeOptions = {
            width: 250,
            height: 250,
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
            borderShadowWidth: 0,
            valueInt: 1,
            colorPlate: '#2d2d3d',
            colorUnits: '#f5f5f5',
            colorNumbers: '#f5f5f5',
            colorMajorTicks: '#f5f5f5',
            colorMinorTicks: '#aaa',
            colorNeedle: 'rgba(255, 238, 88, 1)',
            colorNeedleEnd: 'rgba(255, 200, 100, 0.9)',
            titleFont: "18px sans-serif",
            titleFontWeight: "bold",
            titleShadow: false
        };

        cpuGauge = new RadialGauge({
            ...baseGaugeOptions,
            renderTo: 'cpuGauge',
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

        ramGauge = new RadialGauge({
            ...baseGaugeOptions,
            renderTo: 'ramGauge',
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

        cpuTempGauge = new RadialGauge({
            ...baseGaugeOptions,
            renderTo: 'cpuTempGauge',
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
        $("#datetime").text(dt.toLocaleDateString("en-GB", options));

        const hours = String(dt.getHours()).padStart(2, '0');
        const minutes = String(dt.getMinutes()).padStart(2, '0');
        $("#time").text(`${hours}:${minutes}`);
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
                return $.Deferred().resolve().promise();
            }
        }

        const weatherAPIKey = "1d6f2f389d424a848c6185910251002";
        const weatherAPI = `https://api.weatherapi.com/v1/current.json?key=${weatherAPIKey}&q=${encodeURIComponent(settings.city)}&aqi=yes`;

        return $.ajax({
            url: weatherAPI,
            method: 'GET',
            success: function (data) {
                localStorage.setItem(weatherKey, JSON.stringify(data));
                localStorage.setItem(weatherTimeKey, now.toString());
                updateWeatherUI(data);
            },
            error: function () {
                $("#weatherBox").append('<p class="text-red-600 mt-2 text-sm">Unable to load weather data.</p>');
            }
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

        $("#location-name").html(`<i class="bi bi-geo-alt"></i> ${data.location.name}`);
        $("#temperature").html(`<i class="bi bi-thermometer-half"></i> ${data.current.temp_c}°C`);
        $("#wind").html(`<i class="bi bi-wind"></i> ${data.current.wind_kph} km/h`);
        $("#humidity").html(`<i class="bi bi-moisture"></i> ${data.current.humidity}%`);
        $("#clouds").html(`<i class="bi bi-cloud-fog2"></i> ${data.current.cloud}%`);
        $("#air-quality").html(`<i class="bi bi-lungs"></i> ${aqiText}`);
    }

    $cityInput.on('change', function () {
        settings.city = $(this).val().trim() || 'Sarajevo';
    });

    $refreshIntervalInput.on('change', function () {
        let val = parseInt($(this).val(), 10);

        if (isNaN(val)) val = 5;
        if (val < 5) val = 5;
        if (val > 3600) val = 3600;

        settings.refreshInterval = val;
        $(this).val(val);
    });

    function formatBytes(kb) {
        if (!kb || kb === '0') return '0 MB';
        const num = parseFloat(kb);
        const mb = num / 1024;
        return mb.toFixed(1) + ' MB';
    }

    function setIndicatorActive(id, color) {
        const $el = $(`#${id}`);
        if (!$el.length) return;
        $el.removeClass('opacity-40');

        const $img = $el.find('img');
        switch (color) {
            case 'red':
                $img.css('filter', 'invert(35%) sepia(80%) saturate(700%) hue-rotate(0deg) brightness(1.1)');
                break;
            case 'red':
                $img.css('filter', 'invert(90%) sepia(100%) saturate(1000%) hue-rotate(10deg) brightness(1.1)');
                break;
            case 'limegreen':
                $img.css('filter', 'invert(60%) sepia(70%) saturate(500%) hue-rotate(80deg) brightness(1.2)');
                break;
            default:
                $img.css('filter', '');
        }
    }

    function setIndicatorInactive(id) {
        const $el = $(`#${id}`);
        if (!$el.length) return;
        $el.addClass('opacity-40');
        $el.find('img').css('filter', '');
    }

    /*System Data */
    function fetchSystemData() {
        $.ajax({
            url: "/api/system",
            method: 'GET',
            success: function (data) {
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

                $("#uptime").text("Uptime: " + data.uptime);

                const $diskDiv = $("#diskCharts");
                $diskDiv.empty();
                $.each(data.disk, function (path, disk) {
                    if (!disk) {
                        $diskDiv.append(`<p class="text-center text-gray-400">${path}: N/A</p>`);
                        return;
                    }
                    const usedPercent = (disk.used / disk.total) * 100;
                    const freePercent = 100 - usedPercent;
                    const usedGB = (disk.used / 1024 / 1024 / 1024).toFixed(2);
                    const totalGB = (disk.total / 1024 / 1024 / 1024).toFixed(2);
                    $diskDiv.append(`
                        <section class="mb-6">
                            <h4 class="text-red-600 font-semibold mb-1">${path}</h4>
                            <div class="w-full bg-gray-700 rounded-full h-5 overflow-hidden shadow-inner relative">
                                <div class="h-5 bg-red-600 transition-all duration-500" style="width: ${usedPercent}%"></div>
                                <div class="h-5 bg-gray-400 transition-all duration-500 absolute right-0 top-0" style="width: ${freePercent}%"></div>
                            </div>
                            <div class="flex justify-between text-xs text-gray-400 mt-1 px-1">
                                <span>Used: ${usedPercent.toFixed(1)}%</span>
                                <span>${usedGB} GB / ${totalGB} GB</span>
                            </div>
                        </section>
                    `);
                });

                $preload.addClass("fade-out");
                setTimeout(() => $preload.remove(), 500);
                $main.removeClass("hidden");

                if (cpuTemp >= 80) setIndicatorActive('indicatorTemp', 'red');
                else if (cpuTemp >= 70) setIndicatorActive('indicatorTemp', 'red');
                else setIndicatorInactive('indicatorTemp');

                if (cpuPercent >= 80) setIndicatorActive('indicatorRam', 'red');
                else setIndicatorInactive('indicatorRam');

                if (cpuPercent >= 80 || cpuTemp >= 80) setIndicatorActive('indicatorWarning', 'red');
                else setIndicatorInactive('indicatorWarning');

                setIndicatorActive('indicatorBattery', 'limegreen');

                let storageWarning = false;
                $.each(data.disk, function (_, disk) {
                    if (disk && disk.used / disk.total > 0.9) storageWarning = true;
                });
                if (storageWarning) setIndicatorActive('indicatorStorage', 'red');
                else setIndicatorInactive('indicatorStorage');
            },
            error: function (e) {
                console.error("Greška pri dohvaćanju sistemskih podataka:", e);
                $("#systemInfo").text("Ne mogu dohvatiti sistemske podatke.");
                $preload.addClass("fade-out");
                setTimeout(() => $preload.remove(), 500);
                $main.removeClass("hidden");
            }
        });
    }

    /*Links */
    function checkLinkStatus(url, $dot) {
        fetch(url, { method: 'HEAD', mode: 'no-cors' })
            .then(() => {
                $dot.removeClass('bg-red-600 bg-gray-400').addClass('bg-green-500');
            })
            .catch(() => {
                $dot.removeClass('bg-green-500 bg-gray-400').addClass('bg-red-600');
            });
    }
    function incrementLinkOpened(index) {
        console.log(index);
        $.ajax({
            url: `/api/links/${index}/increment`,
            method: 'POST',
            success: function () {
                fetchLinks();
            },
            error: function (err) {
                console.error('Failed to increment opened count:', err);
            }
        });
    }


    function renderLinksOnPage() {
        const $container = $("#linksContainer");
        $container.empty();

        if (settings.links.length === 0) {
            $container.append(`
            <p class="text-center text-gray-400 italic mt-4">
                No links available. Please visit settings to add one.
            </p>
        `);
            setIndicatorActive('indicatorNoLinks', 'red');
            return;
        } else {
            setIndicatorInactive('indicatorNoLinks');
        }

        settings.links.forEach((link, idx) => link.globalIndex = idx);

        const grouped = {};
        $.each(settings.links, function (_, link) {
            if (!grouped[link.category]) grouped[link.category] = [];
            grouped[link.category].push(link);
        });

        $.each(grouped, function (category, links) {
            const $section = $(`
            <section class="space-y-4">
                <h3 class="text-lg font-semibold text-red-600 border-b border-gray-600 pb-2">${category}</h3>
                <div class="flex flex-wrap gap-4 justify-center"></div>
            </section>
        `);
            const $grid = $section.find('div');

            $.each(links, function (_, link) {
                const $card = $(`
                <a href="${link.url}" target="_blank"
                   class="flex items-center gap-2 bg-[#3a3a4d] text-white hover:bg-[#505070]
                   rounded-lg px-4 py-3 shadow-md transition-transform transform hover:scale-105 w-full sm:w-auto">
                   <span class="status-dot inline-block w-2 h-2 rounded-full bg-gray-400" data-url="${link.url}"></span>
                   <i class="bi ${link.icon} text-lg"></i>
                   <span>${link.name}</span>
                </a>
            `);

                $card.on('click', function () {
                    incrementLinkOpened(link.globalIndex);
                });

                $grid.append($card);

                const $dot = $card.find('.status-dot');
                checkLinkStatus(link.url, $dot);
            });

            $container.append($section);
        });
    }

    function fetchLinks() {
        return $.ajax({
            url: "/api/links",
            method: 'GET',
            success: function (data) {
                settings.links = data;
                renderLinksList();
                renderLinksOnPage();
            },
            error: function () {
                settings.links = [];
                renderLinksList();
            }
        });
    }

    function filterLinks() {
        const searchTerm = $searchInput.val().toLowerCase();
        let anyLinkVisible = false;

        $("#linksContainer section").each(function () {
            const $section = $(this);
            const $cards = $section.find("a");
            let anyVisible = false;

            $cards.each(function () {
                const $card = $(this);
                const text = $card.text().toLowerCase();
                if (text.includes(searchTerm)) {
                    $card.css("display", "flex");
                    anyVisible = true;
                    anyLinkVisible = true;
                } else {
                    $card.css("display", "none");
                }
            });

            $section.css("display", anyVisible ? "block" : "none");
        });

        if (!anyLinkVisible) {
            $("#linksContainer p.text-center").remove();

            $("#linksContainer").append(`
            <p class="text-center text-gray-400 italic mt-4">
                Could not find any links.
            </p>
        `);
        } else {
            $("#linksContainer p.text-center").remove();
        }
    }


    $searchInput.on("input", filterLinks);

    $settingsBtn.on('click', function () {
        loadSettings();
        $cityInput.val(settings.city);
        $refreshIntervalInput.val(settings.refreshInterval);
        fetchLinks().then(function () {
            renderLinksList();
            $settingsModal.removeClass('hidden');
        });
    });

    $closeSettings.on('click', function () {
        $settingsModal.addClass('hidden');
        saveSettings();
        fetchLinks();
        fetchWeather(true);
        clearInterval(systemInterval);
        systemInterval = setInterval(fetchSystemData, settings.refreshInterval * 1000);
        clearInterval(weatherInterval);
        weatherInterval = setInterval(fetchWeather, settings.weatherRefreshInterval * 1000);
    });

    $settingsModal.on('click', function (e) {
        if (e.target === this) {
            $(this).addClass('hidden');
            saveSettings();
            fetchLinks();
            fetchWeather(true);
            clearInterval(systemInterval);
            systemInterval = setInterval(fetchSystemData, settings.refreshInterval * 1000);
            clearInterval(weatherInterval);
            weatherInterval = setInterval(fetchWeather, settings.weatherRefreshInterval * 1000);
        }
    });

    $linksList.on('click', 'button', function () {
        const idx = $(this).data('index');
        if (idx !== undefined) {
            $.ajax({
                url: `/api/links/${idx}`,
                method: 'DELETE',
                success: function () {
                    fetchLinks();
                },
                error: function (err) {
                    alert("Brisanje nije uspjelo");
                    console.error(err);
                }
            });
        }
    });

    $addLinkForm.on('submit', function (e) {
        e.preventDefault();
        const name = $linkNameInput.val().trim();
        const url = $linkUrlInput.val().trim();
        const icon = $linkIconInput.val().trim() || 'bi-link-45deg';
        const category = $linkCategoryInput.val();

        if (name && url) {
            $.ajax({
                url: '/api/links',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ name, url, icon, category }),
                success: function () {
                    fetchLinks();
                    $linkNameInput.val('');
                    $linkUrlInput.val('');
                    $linkIconInput.val('');
                    $linkCategoryInput.val('Other');
                },
                error: function (err) {
                    alert('Greška pri dodavanju linka.');
                    console.error(err);
                }
            });
        }
    });

    function renderLinksList() {
        const $linksList = $("#linksList");
        $linksList.empty();

        if (settings.links.length === 0) {
            $linksList.append(`
            <tr>
                <td colspan="5" class="text-gray-400 text-center py-2">
                    No links added yet.
                </td>
            </tr>
        `);
            return;
        }

        $.each(settings.links, function (i, link) {
            $linksList.append(`
            <tr class="hover:bg-gray-700 transition">
                <td class="px-2 py-1 flex items-center gap-2">
                    <i class="bi ${link.icon} text-red-600"></i>
                    ${link.name}
                </td>
                <td class="px-2 py-1">${link.category}</td>
                <td class="px-2 py-1 text-center">${link.opened}</td>
                <td class="px-2 py-1 break-all">${link.url}</td>
                <td class="px-2 py-1 text-center">
                    <button data-index="${i}" class="text-red-500 hover:text-red-600 font-bold text-lg" aria-label="Delete link">&times;</button>
                </td>
            </tr>
        `);
        });
    }

    /*System Process */
    function fetchSystemProcess() {
        $.ajax({
            url: '/api/process',
            method: 'GET',
            success: function (processes) {
                const $container = $('#processContainer');
                if (!processes || processes.length === 0) {
                    $container.html('<p class="text-gray-400">No processes found.</p>');
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

                $.each(processes, function (_, p) {
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
                $container.html(html);
            },
            error: function (err) {
                console.error(err);
                $('#processContainer').html('<p class="text-red-600">Failed to load processes.</p>');
            }
        });
    }

    initGauges();
    loadSettings();
    updateDate();

    let systemInterval;
    let weatherInterval;
    let processInterval;

    fetchLinks().then(function () {
        fetchSystemData();
        fetchWeather();
        fetchSystemProcess();

        systemInterval = setInterval(updateDate, settings.refreshInterval * 1000);
        systemInterval = setInterval(fetchSystemData, settings.refreshInterval * 1000);
        weatherInterval = setInterval(fetchWeather, settings.weatherRefreshInterval * 1000);
        processInterval = setInterval(
            fetchSystemProcess,
            settings.processRefreshInterval ? settings.processRefreshInterval * 1000 : 5000
        );
    });
});