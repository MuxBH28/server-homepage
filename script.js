$(document).ready(function () {
    const $preload = $('#preloader');
    const $main = $('#mainContent');
    const $settingsBtn = $('#settingsBtn');
    const $settingsModal = $('#settingsModal');
    const $closeSettings = $('#closeSettings');
    const $refreshIntervalInput = $('#refreshInterval');
    const $linksList = $('#linksList');
    const $addLinkForm = $('#addLinkForm');
    const $linkNameInput = $('#linkName');
    const $linkIconInput = $('#linkIcon');
    const $linkCategoryInput = $('#linkCategory');
    const $linkUrlInput = $('#linkUrl');
    const $searchInput = $("#linkSearch");
    let cpuGauge, ramGauge, cpuTempGauge;
    const $diskPathsInput = $("#diskPathsInput");
    const $currentDiskPaths = $("#currentDiskPaths");

    /*Misc */
    function initWelcomeModal() {

        if (settings.server) {
            $("#serverNameInput").val(settings.server);
            $("#serverName").text(settings.server);
            $("title").text(settings.server);
        }
        if (settings.name) {
            $("#yourNameInput").val(settings.name);
            $("#name").text(settings.name);
        }

        $('body').css('background-image', 'url(' + settings.bgPath + ')');
        $('#bgPath').val(settings.bgPath);

        if (!settings.welcome) {
            $("#welcomeModal").removeClass("hidden");
        }
    }

    $("#closeWelcome").on("click", function () {
        settings.server = $("#serverNameInput").val().trim() || 'Server name';
        settings.name = $("#yourNameInput").val().trim() || 'Usern';
        settings.welcome = true;

        saveSettings().then(function () {
            $("#welcomeModal").addClass("hidden");

            $("#serverName").text(settings.server);
            $("#name").text(settings.name);

            if ($("#dontShowWelcome").is(":checked")) {
                localStorage.setItem("hideWelcomeScreen", "true");
            }
        }).catch(function (error) {
            console.error("Failed to save settings:", error);
        });
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
            colorPlate: '#00000005',
            colorUnits: '#f5f5f5',
            colorNumbers: '#f5f5f5',
            colorMajorTicks: '#f5f5f5',
            colorMinorTicks: '#aaa',
            colorNeedle: 'rgba(255, 0, 0, 1)',
            colorNeedleEnd: 'rgba(255, 100, 100, 0.9)',
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
        server: 'Server name',
        name: 'User',
        refreshInterval: 30,
        welcome: false,
        diskPaths: [
            "/"
        ]
    };

    let links = {};

    function saveSettings() {
        return $.ajax({
            url: '/api/settings',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(settings),
            success: function () {
                console.log("Settings saved to backend.");
            },
            error: function (err) {
                console.error("Failed to save settings:", err);
            }
        });
    }


    function loadSettings() {
        return $.ajax({
            url: '/api/settings',
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                if (data) {
                    settings = data;
                    $refreshIntervalInput.val(settings.refreshInterval);
                }
            },
            error: function (err) {
                console.error("Failed to load settings from backend:", err);
            }
        });
    }


    function updateDate() {
        const dt = new Date();
        const options = { weekday: "long", day: "2-digit", month: "long", year: "numeric" };
        $("#datetime").text(dt.toLocaleDateString("en-GB", options));

        const hours = String(dt.getHours()).padStart(2, '0');
        const minutes = String(dt.getMinutes()).padStart(2, '0');
        $("#time").text(`${hours}:${minutes}`);
    }

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
                $("#localIP").text(data.network.local_ip);
                $("#publicIP").text(data.network.public_ip);
                $("#city").text(data.network.city);
                $("#country").text(data.network.country);
                $("#loc").text(data.network.loc);
                $("#uploadSpeed").text(data.network.upload_speed);
                $("#downloadSpeed").text(data.network.download_speed);
                $("#ifaceName").text(data.network.ifaceName);
                $("#state").text(data.network.state);

                $("#appVersion").text(data.appVersions.local);
                if (data.appVersions.local !== data.appVersions.github) {
                    $("#appVersionUpdate").html(`
    <a href="https://github.com/MuxBH28/server-homepage/" target="_blank" 
       class="text-red-500 font-semibold hover:underline flashing">
        | New version is available: ${data.appVersions.github}
    </a>
`);
                }

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
                $("#systemInfo").text("Error getting data. Try refreshing page.");
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
                $dot
                    .removeClass('bg-red-600 bg-gray-400')
                    .addClass('bg-green-500')
                    .css('box-shadow', '0 0 4px 1.5px rgba(34,197,94,0.6), 0 0 8px 2.5px rgba(34,197,94,0.4)');
            })
            .catch(() => {
                $dot
                    .removeClass('bg-green-500 bg-gray-400')
                    .addClass('bg-red-600')
                    .css('box-shadow', '0 0 4px 1.5px rgba(239,68,68,0.6), 0 0 8px 2.5px rgba(239,68,68,0.4)');
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

        if (links.length === 0) {
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

        links.forEach((link, idx) => link.globalIndex = idx);

        const grouped = {};
        $.each(links, function (_, link) {
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
           class="flex items-center gap-2 text-white rounded-lg px-4 py-3 w-full sm:w-auto
                  bg-white/10 backdrop-blur-md border border-white/20 shadow-lg
                  transition-transform transform hover:scale-105 hover:bg-white/20">
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
                links = data;
                renderLinksList();
                renderLinksOnPage();
            },
            error: function () {
                links = [];
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
        $refreshIntervalInput.val(settings.refreshInterval);
        fetchLinks().then(function () {
            renderLinksList();
            renderDiskPaths();
            $settingsModal.removeClass('hidden');
        });
    });

    $closeSettings.on('click', function () {
        $settingsModal.addClass('hidden');
        settings.bgPath = $('#bgPath').val().trim();

        saveSettings();
        fetchLinks();

        clearInterval(systemInterval);
        systemInterval = setInterval(() => {
            updateDate();
            fetchSystemData();
            fetchSystemProcess();
        }, settings.refreshInterval * 1000);
    });



    $settingsModal.on('click', function (e) {
        if (e.target === this) {
            $(this).addClass('hidden');
            saveSettings();
            fetchLinks();
            clearInterval(systemInterval);
            systemInterval = setInterval(fetchSystemData, settings.refreshInterval * 1000);
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

        if (links.length === 0) {
            $linksList.append(`
            <tr>
                <td colspan="5" class="text-gray-400 text-center py-2">
                    No links added yet.
                </td>
            </tr>
        `);
            return;
        }

        $.each(links, function (i, link) {
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

    function renderDiskPaths() {
        $currentDiskPaths.empty();
        settings.diskPaths.forEach((path, index) => {
            const $li = $(`
            <li class="flex justify-between items-center bg-gray-800 rounded px-3 py-1 mb-1">
                <span>${path}</span>
                <button class="text-red-500 hover:text-red-400" data-index="${index}" title="Remove">
                    <i class="bi bi-x-lg"></i>
                </button>
            </li>
        `);
            $currentDiskPaths.append($li);
        });
    }

    $diskPathsInput.on("keypress", function (e) {
        if (e.key === "Enter") {
            const newPath = $diskPathsInput.val().trim();
            if (newPath && !settings.diskPaths.includes(newPath)) {
                settings.diskPaths.push(newPath);
                renderDiskPaths();
                saveSettings();
            }
            $diskPathsInput.val('');
        }
    });

    $currentDiskPaths.on("click", "button", function () {
        const index = $(this).data("index");
        if (index !== undefined) {
            settings.diskPaths.splice(index, 1);
            renderDiskPaths();
            saveSettings();
        }
    });

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
    updateDate();

    let systemInterval;

    loadSettings().then(() => {
        updateDate();
        initWelcomeModal();

        fetchLinks().then(() => {
            fetchSystemData();
            fetchSystemProcess();

            clearInterval(systemInterval);

            systemInterval = setInterval(() => {
                updateDate();
                fetchSystemData();
                fetchSystemProcess();
            }, settings.refreshInterval * 1000);
        });
    });

});