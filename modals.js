const welcomeModal = `
<div class="flex justify-center mb-4">
  <img src="./assets/logo.png" alt="Server Logo" class="w-24 h-24">
</div>
<h2 class="text-2xl font-bold mb-4">Welcome to Server Homepage</h2>
<div class="space-y-3 text-sm">
  <p>This is your server monitoring homepage. Here you can view:</p>
  <ul class="list-disc list-inside ml-4">
    <li>CPU, RAM, and disk usage</li>
    <li>System processes</li>
    <li>Network information</li>
    <li>Quick links to your favorite tools or apps</li>
  </ul>
  <p>You can manage links and settings via the settings modal.</p>

  <div class="flex gap-4 mt-4">
    <div class="flex-1">
      <label for="serverNameInput" class="block text-sm font-medium mb-1">Server name</label>
      <input type="text" id="serverNameInput" name="serverNameInput"
        class="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-red-500">
    </div>
    <div class="flex-1">
      <label for="yourNameInput" class="block text-sm font-medium mb-1">Your name</label>
      <input type="text" id="yourNameInput" name="yourNameInput"
        class="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-red-500">
    </div>
  </div>

  <hr class="border-gray-600 my-3">

  <p>Useful links:</p>
  <ul class="list-disc list-inside ml-4">
    <li><a href="https://github.com/MuxBH28/server-homepage/" target="_blank"
      class="text-red-500 hover:underline">GitHub Repository</a></li>
    <li><a href="https://msehic.com/" target="_blank" class="text-red-500 hover:underline">Author's website</a></li>
  </ul>
  <p>Please report ideas, suggestions, bugs or any issues directly in GitHub.</p>

  <hr class="border-gray-600 my-3">

  <div class="flex items-center gap-2">
    <input type="checkbox" id="dontShowWelcome" class="accent-red-600">
    <label for="dontShowWelcome" class="text-sm">Don't show this welcome screen again</label>
  </div>
</div>

<div class="mt-6 text-right">
  <button id="closeWelcome" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold">
    Close Welcome Screen
  </button>
</div>
`;

const logsModal = `<div id="logsChart" style="height:400px;"></div>`;
const infoModal = `<div id="infoContainer" class="space-y-2"></div>`;

function openModal(type) {
    let title = '';
    let contentHtml = '';

    switch (type) {
        case 'welcome':
            title = 'Welcome';
            contentHtml = welcomeModal;
            break;
        case 'logs':
            title = 'Logs';
            contentHtml = logsModal;
            break;
        case 'info':
            title = 'Hardware Info';
            contentHtml = infoModal;
            break;
        default:
            title = 'Modal';
            contentHtml = '';
    }

    $('#modalTitle').text(title);
    $('#modalContent').html(contentHtml);
    $('#modal').removeClass('hidden');

    if (type === 'welcome') {
        $("#closeWelcome").on("click", function () {
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
    }
}

$('#closeModal').on('click', function () {
    $('#modal').addClass('hidden');
});

$('#modal').on('click', function (e) {
    if ($(e.target).is('#modal')) {
        $('#modal').addClass('hidden');
    }
});