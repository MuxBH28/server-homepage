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
const infoModal = `
<div id="infoContainer" class="relative p-4 sm:p-6 max-w-3xl mx-auto">
  <div class="flex justify-center mb-4">
    <img src="./assets/logo.png" alt="Server Logo" class="w-32 sm:w-48 h-32 sm:h-48 rounded-full border-2 border-red-600">
  </div>

  <p class="text-gray-300 text-sm sm:text-base mb-5 text-center sm:text-left">
    This is a minimalist personal homepage project built with <strong>Node.js (Express)</strong> backend and a static frontend with HTML, CSS (Tailwind), and vanilla JS.<br>
    It serves system monitoring data (CPU, RAM, Disk, uptime), manages custom links via API, and shows network information.<br>
    The project is intended to be deployed on a Linux server and accessed locally or via LAN.
  </p>

  <div class="space-y-2 text-gray-300 text-sm sm:text-base mb-6">
    <p><strong>Author:</strong> <a href="https://msehic.com/" target="_blank" class="underline text-red-500">msehic.com</a></p>
    <p><strong>GitHub Repo:</strong> <a href="https://github.com/MuxBH28/server-homepage/" target="_blank" class="underline text-red-500">github.com/MuxBH28/server-homepage</a></p>
    <p><strong>Scriptable iOS Widget:</strong> <a href="https://github.com/MuxBH28/server-homepage/?tab=readme-ov-file#scriptable" target="_blank" class="underline text-red-500">View Scriptable Widget</a></p>
    <p><strong>Default Background:</strong> by <a href="https://pixabay.com/users/sinnesreich-2779296/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=1759179" target="_blank" class="underline text-red-500">Manuela</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=1759179" target="_blank" class="underline text-red-500">Pixabay</a></p>
    <p><strong>SVG Icons:</strong> Sourced from <a href="https://www.svgrepo.com/" target="_blank" class="underline text-red-500">SVG Repo - Car Parts 2</a></p>
    <p><strong>Bootstrap Icons:</strong> <a href="https://icons.getbootstrap.com/" target="_blank" class="underline text-red-500">Bootstrap Icons</a></p>
    <p><strong>Special Thanks:</strong> the <a href="https://www.reddit.com/r/homelab/" target="_blank" class="underline text-red-500">r/homelab community</a></p>
  </div>

  <div class="flex flex-col sm:flex-col md:absolute md:bottom-4 md:right-4 gap-2 flex-wrap">
    <a href="https://github.com/sponsors/MuxBH28/" target="_blank" 
       class="bg-pink-600 hover:bg-pink-500 px-4 py-2 rounded-lg text-white flex items-center justify-center gap-2 w-full sm:w-auto">
        <i class="bi bi-heart-fill"></i> Sponsor the Project
    </a>
    <a href="https://github.com/MuxBH28/server-homepage/issues/new" target="_blank" 
       class="bg-yellow-600 hover:bg-yellow-500 px-4 py-2 rounded-lg text-white flex items-center justify-center gap-2 w-full sm:w-auto">
        <i class="bi bi-bug-fill"></i> Report a Bug
    </a>
    <button id="shareRepo" class="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-white flex items-center justify-center gap-2 w-full sm:w-auto">
      <i class="bi bi-share-fill"></i> Share Repo
    </button>
  </div>
</div>
`;

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
      title = 'Server Homepage Info';
      contentHtml = infoModal;
      break;
    default:
      title = 'Modal';
      contentHtml = '<divstyle="height:400px;">This modal should not open empty like this. What did you do?</div>';
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
  $('#shareRepo').on('click', function () {
    const repoLink = 'https://github.com/MuxBH28/server-homepage/';
    const btn = $(this);
    const original = btn.html();

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(repoLink).then(() => {
        btn.text('Link copied!');
        setTimeout(() => btn.html(original), 1500);
      });
    } else {
      // fallback cuz of https context
      const tempInput = $('<input>');
      $('body').append(tempInput);
      tempInput.val(repoLink).select();
      document.execCommand('copy');
      tempInput.remove();
      btn.text('Link copied!');
      setTimeout(() => btn.html(original), 1500);
    }
  });

}

$('#closeModal').on('click', function () {
  $('#modal').addClass('hidden');
});

$('#modal').on('click', function (e) {
  if ($(e.target).is('#modal')) {
    $('#modal').addClass('hidden');
  }
});