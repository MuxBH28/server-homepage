$(document).ready(function () {
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
    let cpuGauge, ramGauge, cpuTempGauge, preloadGauge;
    const $diskPathsInput = $("#diskPathsInput");
    const $currentDiskPaths = $("#currentDiskPaths");
    const $widgetSelect = $('#widgetSelect');
    let lastWidget = localStorage.getItem('widget') || 'process';
    let appVersion = 'v1.3.5';
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
        $('#rssUrl').val(settings.rss);
        $widgetSelect.val(lastWidget);

        if (settings.login) {
            const ok = checkAuth();
            if (!ok) {
                $('body').html('<p class="text-red-500 text-center mt-10">Access denied.</p>');
            }
        }

        if (!settings.welcome) {
            openModal('welcome');
        }
    }

    $(document).on("click", "#closeWelcome", function () {
        settings.server = $("#serverNameInput").val().trim() || "Server name";
        settings.name = $("#yourNameInput").val().trim() || "User";
        settings.welcome = $("#dontShowWelcome").is(":checked");

        saveSettings().then(function () {
            $("#modal").addClass("hidden");
            $("#serverName").text(settings.server);
            $("#name").text(settings.name);
            $("title").text(settings.server);
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

        preloadGauge = new RadialGauge({
            ...baseGaugeOptions,
            renderTo: 'preloadGaugeCanvas',
            width: 512,
            height: 512,
            units: 'HOMEPAGE',
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
            title: "SERVER",
            valueBox: true,
            valueText: appVersion
        }).draw();
    }

    let settings = {
        server: 'Server name',
        name: 'User',
        refreshInterval: 30,
        welcome: false,
        rss: 'https://hnrss.org/frontpage',
        login: null,
        diskPaths: [
            "/"
        ]
    };

    function preloading() {
        preloadGauge.value = 100;
        const $preload = $('#preloader');
        setTimeout(() => {
            $preload.addClass("fade-out");
            setTimeout(() => $preload.remove(), 1000);
        }, 1200);
    }

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
                console.error("Error getting data:", e);
                $("#systemInfo").text("Error getting data. Try refreshing page.");
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

    function saveSettingsModal() {
        settings.bgPath = $('#bgPath').val().trim();
        settings.rss = $('#rssUrl').val().trim();

        saveSettings();
        fetchLinks();

        clearInterval(systemInterval);
        systemInterval = setInterval(() => {
            updateDate();
            fetchSystemData();
            fetchSystemProcess();
        }, settings.refreshInterval * 1000);

        $settingsModal.addClass('hidden');
    }

    $closeSettings.on('click', saveSettingsModal);

    $settingsModal.on('click', function (e) {
        if (e.target === this) {
            saveSettingsModal();
        }
    });

    $('#authSubmit').on('click', async function () {
        const pin = $('#authPin').val().trim();
        const $msg = $('#authMessage');

        if (!pin) {
            $msg.text('No PIN entered. Authentication is disabled.').removeClass('hidden');
            return;
        }

        try {
            const response = await $.ajax({
                url: '/api/set-login',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ pin })
            });

            if (response.success) {
                $msg.text('PIN saved successfully!').removeClass('hidden').removeClass('text-red-500').addClass('text-green-500');
                $('#authPin').val('');
            } else {
                $msg.text(response.error || 'Failed to save PIN.').removeClass('hidden').removeClass('text-green-500').addClass('text-red-500');
            }
        } catch (err) {
            console.error(err);
            $msg.text('Error communicating with server.').removeClass('hidden').removeClass('text-green-500').addClass('text-red-500');
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

    /*Widget */
    function loadWidget(type) {
        if (widgetInterval) {
            clearInterval(widgetInterval);
            widgetInterval = null;
        }

        const $container = $('#widgetContainer');

        switch (type) {
            case 'process':
                fetchSystemProcess();
                widgetInterval = setInterval(fetchSystemProcess, settings.refreshInterval * 1000);
                break;

            case 'crypto':
                fetchCryptoPrices();
                widgetInterval = setInterval(fetchCryptoPrices, 60 * 1000);
                break;

            case 'notes':
                fetchNotes();
                $container.off('input', 'textarea#notesArea').on('input', 'textarea#notesArea', function () {
                    saveNotes($(this).val());
                });
                break;

            case 'rss':
                fetchRSS();
                widgetInterval = setInterval(fetchRSS, 10 * 60 * 1000);
                break;

            case 'qr':
                URLtoQR();
                break;

            case 'hardware':
                fetchSystemInfo();
                break;

            case 'power':
                $container.html(`
        <div class="flex flex-col justify-center items-center h-full gap-4 text-center">
            <p class="text-yellow-400 mb-2">
                <i class="bi bi-exclamation-triangle-fill"></i>
                Warning: Make sure you save your work before performing any action!
            </p>
            <div class="flex flex-col gap-3">
                <button data-action="shutdown" class="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg flex items-center gap-2">
                    <i class="bi bi-power"></i> Shutdown
                </button>
                <button data-action="restart" class="bg-yellow-600 hover:bg-yellow-500 px-4 py-2 rounded-lg flex items-center gap-2">
                    <i class="bi bi-arrow-clockwise"></i> Restart
                </button>
                <button data-action="sleep" class="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg flex items-center gap-2">
                    <i class="bi bi-moon-fill"></i> Sleep
                </button>
            </div>
        </div>
    `);

                $container.off('click', 'button[data-action]').on('click', 'button[data-action]', function () {
                    const action = $(this).data('action');
                    if (!confirm(`Are you sure you want to ${action} the server?`)) return;

                    $.post('/api/power', { action })
                        .done(() => alert(`${action} command sent successfully.`))
                        .fail(() => alert(`Failed to ${action}.`));
                });
                break;

            default:
                $container.html('<p class="text-gray-400">Select a widget.</p>');
        }
    }

    function fetchSystemProcess() {
        $.ajax({
            url: '/api/process',
            method: 'GET',
            success: function (processes) {
                const $container = $('#widgetContainer');
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
                $('#widgetContainer').html('<p class="text-red-600">Failed to load processes.</p>');
            }
        });
    }

    function fetchNotes() {
        $.ajax({
            url: '/api/notes',
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                const text = data.notes || '';
                $('#widgetContainer').html(`
                <textarea id="notesArea" class="w-full h-96 p-2 bg-gray-800 border border-gray-700 text-white rounded-lg resize-none">${text}</textarea>
                <p class="text-gray-400 text-xs mt-2">Last edited: ${data.lastEdited ? new Date(data.lastEdited).toLocaleString() : 'N/A'}</p>
            `);

                let timeout = null;
                $('#notesArea').on('input', function () {
                    clearTimeout(timeout);
                    const newText = $(this).val();
                    timeout = setTimeout(() => saveNotes(newText), 1000);
                });
            },
            error: function () {
                $('#widgetContainer').html('<p class="text-red-600">Failed to load notes.</p>');
            }
        });
    }

    function saveNotes(notes) {
        $.ajax({
            url: '/api/notes',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ notes }),
            success: function (res) {
                console.log("Notes saved successfully", res);
            },
            error: function () {
                console.error("Failed to save notes.");
            }
        });
    }

    function fetchCryptoPrices() {
        const $container = $('#widgetContainer');
        $container.html('<p class="text-gray-400">Loading crypto prices...</p>');

        $.ajax({
            url: '/api/crypto',
            method: 'GET',
            success: function (data) {
                if (!data || Object.keys(data).length === 0) {
                    $container.html('<p class="text-gray-400">No crypto data available.</p>');
                    return;
                }

                let html = `
                <table class="w-full text-left text-sm text-gray-300 border border-gray-700 rounded-lg">
                    <thead class="bg-gray-800 sticky top-0">
                        <tr>
                            <th class="px-3 py-2 border-b border-gray-700">Coin</th>
                            <th class="px-3 py-2 border-b border-gray-700">Price (USD)</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

                for (const [coin, info] of Object.entries(data)) {
                    html += `
                    <tr class="hover:bg-gray-700">
                        <td class="px-3 py-1 border-b border-gray-700">${coin.charAt(0).toUpperCase() + coin.slice(1)}</td>
                        <td class="px-3 py-1 border-b border-gray-700">$${info.usd.toLocaleString()}</td>
                    </tr>
                `;
                }

                html += `</tbody></table>`;
                $container.html(html);
            },
            error: function (err) {
                console.error(err);
                $container.html('<p class="text-red-600">Failed to load crypto prices.</p>');
            }
        });
    }

    function fetchRSS() {
        const $container = $('#widgetContainer');
        $container.html('<p class="text-gray-400">Loading RSS feed...</p>');

        $.get('/api/rss', function (items) {
            if (!items || items.length === 0) {
                $container.html('<p class="text-gray-400">No RSS items found.</p>');
                return;
            }

            let html = '<ul class="space-y-2 overflow-auto">';
            items.forEach(item => {
                html += `
                <li class="border border-red-700 rounded-lg shadow p-3 hover:bg-gray-700 transition">
                    <a href="${item.link}" target="_blank" class="flex items-center gap-2 text-white">
                        <i class="bi bi-link-45deg"></i>
                        <span class="font-medium">${item.title}</span>
                    </a>
                    <p class="text-gray-400 text-xs mt-1">${new Date(item.pubDate).toLocaleString()}</p>
                </li>
            `;
            });
            html += '</ul>';

            $container.html(html);
        }).fail(() => {
            $container.html('<p class="text-red-600">Failed to load RSS feed.</p>');
            console.error("Failed to fetch RSS feed.");
        });
    }

    function URLtoQR() {
        const $container = $('#widgetContainer');

        $container.html(`
        <div class="flex flex-col justify-center items-center space-y-4 w-full h-full min-h-[350px] text-center">
            <h2 class="text-red-600 text-2xl font-semibold"><i class="bi bi-qr-code"></i> QR Code Generator</h2>
            <p class="text-gray-300 text-sm max-w-md">
                Enter any text or URL below to generate a QR code. Customize type, size, colors and light/dark mode.
            </p>
            <input type="text" id="qrInput" placeholder="Enter text or URL" 
                class="mb-4 w-full rounded-lg px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 shadow-lg transition-all w-72" />

            <div class="flex gap-2 w-72 justify-center">
                <select id="qrType" class="flex-1 mb-4 w-full rounded-lg px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 shadow-lg transition-all cursor-pointer">
                    <option value="png" selected>PNG</option>
                    <option value="svg">SVG</option>
                </select>
                <select id="qrWidth" class="w-24 mb-4 w-full rounded-lg px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 shadow-lg transition-all cursor-pointer">
                    <option value="128">128 px</option>
                    <option value="256" selected>256 px</option>
                    <option value="512">512 px</option>
                    <option value="1024">1024 px</option>
                </select>
            </div>

            <div class="flex gap-2 items-center justify-center">
                <label class="flex flex-col items-center gap-1">
                    <span class="text-gray-300 text-sm">QR Color</span>
                    <input type="color" id="qrColor" value="#000000" class="w-20 h-10 p-1 rounded-lg border border-gray-700" />
                </label>
                <label class="flex flex-col items-center gap-1">
                    <span class="text-gray-300 text-sm">Background Color</span>
                    <input type="color" id="qrBgColor" value="#ffffff" class="w-20 h-10 p-1 rounded-lg border border-gray-700" />
                </label>
            </div>

            <button id="generateQR" 
                class="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg w-72">
                <i class="bi bi-arrow-right-square-fill"></i> Generate QR
            </button>

            <p class="text-gray-400 text-xs">
                QR Code is always stored in "./assets/" folder.
            </p>
        </div>
    `);

        $('#generateQR').on('click', function () {
            let text = $('#qrInput').val().trim();
            const type = $('#qrType').val();
            const width = parseInt($('#qrWidth').val()) || 300;
            const bgColor = $('#qrBgColor').val();
            const color = $('#qrColor').val();

            // Funny fallback jokes for empty QR codes.
            // If you think some of these should be removed or replaced, feel free to open a Pull Request or Issue.
            const randomJokes = [
                "Why are you reading this empty QR Code?\nNext time please add some text or URL!\nSincerely,\nServer Homepage",
                "https://youtu.be/XfELJU1mRMg",
                "I am Buzz Aldrin. Second man to step on the moon.\nNeil before me.",
                "How many Trump supporters does it take to change a lightbulb?\nNone. Trump says it's done and they all cheer in the dark.",
                "What genre are national anthems?\nCountry.",
                "“DO NOT TOUCH” must be one of the most terrifying things to read in braille.",
                "Superglue can also be used for cleaning your computer keyboarddddddddddddddddddddddddddddddddddddddddddd",
                "Chameleons are supposed to blend well, but I think it's ruined this smoothie.",
                "Man addicted to drinking brake fluid claims he can stop anytime he wants.",
                "I asked Tom Hanks for his autograph, but all he wrote was thanks.",
                "Together, I can beat schizophrenia.",
                "Tequila won't fix your life but it's worth a shot.",
                "Say what you want about waitresses but they bring a lot to the table",
                "The thief who stole my iPhone could face time.",
                "Today I went for a walk with a girl, she noticed me, so we went for a run.",
                "The urge to sing The Lion Sleeps Tonight is only ever a whim away."
            ];

            if (!text) {
                text = randomJokes[Math.floor(Math.random() * randomJokes.length)];
            }

            $container.html('<p class="text-gray-400 text-center">Generating QR code...</p>');

            $.ajax({
                url: '/api/urltoqrl',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    text,
                    type,
                    width,
                    color,
                    bgColor
                }),
                success: function () {
                    $container.html(`
                    <div class="flex flex-col justify-center items-center space-y-2 w-full h-full min-h-[300px]">
                        <h2 class="text-red-600 text-2xl font-semibold"><i class="bi bi-qr-code"></i> QR Code is ready:</h2>
                        <img src="/assets/qrcode.png?ts=${Date.now()}" alt="QR Code" class="border rounded-md" />
                        <div class="flex gap-2">
                            <a href="/assets/qrcode.png" download class="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg">
                                <i class="bi bi-file-earmark-arrow-down"></i> Download QR
                            </a>
                            <button id="newQR" class="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg">
                                <i class="bi bi-arrow-repeat"></i> Make One More
                            </button>
                        </div>
                    </div>
                `);

                    $('#newQR').on('click', function () {
                        URLtoQR();
                    });
                },
                error: function () {
                    $container.html('<p class="text-red-600 text-center">Failed to generate QR code.</p>');
                    console.error("Failed to generate QR code.");
                }
            });
        });
    }

    function fetchSystemInfo() {
        const $container = $('#widgetContainer');
        $container.html('<p class="text-gray-400">Loading Hardware information...</p>');

        $.ajax({
            url: '/api/info',
            method: 'GET',
            success: function (info) {
                $container.empty();

                if (!info) {
                    $container.html('<p class="text-gray-400">No info found.</p>');
                    return;
                }

                $container.append(`<p><strong>CPU:</strong> ${info.cpu.manufacturer} ${info.cpu.brand} (${info.cpu.cores} cores, ${info.cpu.physicalCores} physical, ${info.cpu.speed} GHz)</p>`);
                $container.append(`<p><strong>Memory:</strong> Total: ${info.memory.totalGB} GB</p>`);
                $container.append(`<p><strong>OS:</strong> ${info.os.distro} ${info.os.release} (${info.os.arch}), Hostname: ${info.os.hostname}</p>`);

                if (info.disk && info.disk.length > 0) {
                    $container.append('<p><strong>Disks:</strong></p>');
                    info.disk.forEach(d => {
                        $container.append(`<p>&nbsp;&nbsp;${d.device} - ${d.name} (${d.sizeGB} GB, ${d.type})</p>`);
                    });
                }

                if (info.graphics && info.graphics.length > 0) {
                    $container.append('<p><strong>Graphics:</strong></p>');
                    info.graphics.forEach(g => {
                        $container.append(`<p>&nbsp;&nbsp;${g.model} (${g.vendor}), VRAM: ${g.vramGB} GB</p>`);
                    });
                }

                if (info.network && info.network.length > 0) {
                    $container.append('<p><strong>Network Interfaces:</strong></p>');
                    info.network.forEach(n => {
                        $container.append(`<p>&nbsp;&nbsp;${n.iface} - IPv4: ${n.ip4}, MAC: ${n.mac}</p>`);
                    });
                }
            },
            error: function (err) {
                console.error(err);
                $('#infoContainer').html('<p class="text-red-600">Failed to load info.</p>');
            }
        });
    }

    $widgetSelect.on('change', function () {
        const selected = $(this).val();
        localStorage.setItem('widget', selected);
        loadWidget(selected);
    });

    /*Log*/
    $('#logsBtn').on('click', function () {
        openModal('logs');
        fetchSystemLogs();
    });

    function fetchSystemLogs() {
        $.ajax({
            url: '/api/logs',
            method: 'GET',
            success: function (logs) {
                if (!logs || logs.length === 0) {
                    $('#logsChart').html('<p class="text-gray-400">No logs found.</p>');
                    return;
                }

                const validLogs = logs.filter(log => log.cpu !== undefined && log.ram !== undefined && log.temp !== undefined);

                if (validLogs.length === 0) {
                    $('#logsChart').html('<p class="text-gray-400">No valid logs to display.</p>');
                    return;
                }

                const labels = validLogs.map(log => log.timestamp);
                const cpuData = validLogs.map(log => log.cpu);
                const ramData = validLogs.map(log => log.ram);
                const tempData = validLogs.map(log => log.temp);

                const options = {
                    chart: {
                        type: 'line',
                        height: 400,
                        zoom: { enabled: true },
                        toolbar: {
                            show: true,
                            tools: {
                                download: true,
                                selection: false,
                                zoom: true,
                                zoomin: true,
                                zoomout: true,
                                pan: true,
                                reset: true
                            }
                        },
                        foreColor: '#000'
                    },
                    theme: { mode: 'dark' },
                    series: [
                        { name: 'CPU %', data: cpuData, color: '#007bff' },
                        { name: 'RAM %', data: ramData, color: '#28a745' },
                        { name: 'Temperature °C', data: tempData, color: '#dc3545' }
                    ],
                    xaxis: {
                        categories: labels,
                        labels: { style: { colors: '#000' } }
                    },
                    yaxis: {
                        min: 0,
                        labels: { style: { colors: '#000' } }
                    },
                    stroke: { curve: 'smooth' },
                    tooltip: { shared: true },
                    legend: {
                        position: 'top',
                        labels: { colors: '#000' }
                    }
                };

                $('#logsChart').empty();
                new ApexCharts(document.querySelector("#logsChart"), options).render();
            },
            error: function (err) {
                console.error(err);
                $('#logsChart').html('<p class="text-red-600">Failed to load logs.</p>');
            }
        });
    }

    /* Info */
    $('#infoBtn').on('click', function () {
        openModal('info');
    });

    /*basic auth */
    function checkAuth() {
        const savedPin = localStorage.getItem('authPin');
        if (!settings.login) return true;

        let authorized = false;

        if (savedPin) {
            $.ajax({
                url: '/api/check-login',
                method: 'POST',
                async: false,
                contentType: 'application/json',
                data: JSON.stringify({ pin: savedPin }),
                success: function (res) {
                    if (res.success) {
                        authorized = true;
                    } else {
                        localStorage.removeItem('authPin');
                    }
                },
                error: function () {
                    alert('Error verifying saved PIN. Please try again.');
                }
            });
        }

        while (!authorized) {
            const input = prompt('Enter PIN to access the server homepage:');
            if (input === null) break;

            $.ajax({
                url: '/api/check-login',
                method: 'POST',
                async: false,
                contentType: 'application/json',
                data: JSON.stringify({ pin: input }),
                success: function (res) {
                    if (res.success) {
                        authorized = true;
                        localStorage.setItem('authPin', input);
                    } else {
                        alert('Incorrect PIN. Please try again.');
                    }
                },
                error: function () {
                    alert('Error verifying PIN. Please try again.');
                }
            });
        }

        return authorized;
    }

    /*Download/upload links.json */
    $('#downloadLinks').on('click', function () {
        $.get('/api/links', function (data) {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'links.json';
            a.click();
            URL.revokeObjectURL(url);
        });
    });

    $('#uploadLinks').on('change', function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const jsonData = JSON.parse(e.target.result);

                $.ajax({
                    url: '/api/linksFile',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(jsonData),
                    success: function () {
                        alert('Links uploaded successfully!');
                    },
                    error: function () {
                        alert('Failed to upload links!');
                    }
                });

            } catch (err) {
                alert('Invalid JSON file!');
            }
        };
        reader.readAsText(file);
    });

    let systemInterval = null;
    let widgetInterval = null;

    loadSettings().then(() => {
        initGauges();
        preloading();
        updateDate();
        initWelcomeModal();

        fetchLinks().then(() => {
            fetchSystemData();
            loadWidget(lastWidget);

            clearInterval(systemInterval);
            systemInterval = setInterval(() => {
                updateDate();
                fetchSystemData();
            }, settings.refreshInterval * 1000);
        });
    });

});