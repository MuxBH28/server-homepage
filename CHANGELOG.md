# Changelog

All notable changes to this project will be documented in this file and in the [GitHub Releases](https://github.com/MuxBH28/server-homepage/releases/).

If you have any questions or issues, contact me via email or GitHub.

---

# [v1.3.8](https://github.com/MuxBH28/server-homepage/releases/tag/v1.3.8) – [9/3/25]

### Bug Fixes
- **RAM Indicator Bug** – Fixed an issue where the RAM usage indicator was not updating correctly.
- **Mobile Menu Fix** – Adjusted navigation and interactions for mobile devices for a smoother experience.
- **Settings Path Fix** – Corrected logic for adding new disk paths in settings.

### UI & UX Enhancements
- **Tools Design Tweaks** – Small design improvements across all tool widgets.
- **Save Settings Button** – Moved the save settings button to the top-right corner for easier access.
- **Custom Tools Selection** – Users can now choose which tools to display in the dashboard.
- **Info Panel Author Message** – Added an author message in the InfoCard for more context.

### Functionality Updates
- **Catch-All Route** – Added `*` route to properly serve frontend assets for unmatched paths.
- **RSS Feed Settings** – Restored RSS feed settings; added `rss.md` in the extra folder for reference.
- **Notes Download** – Users can now download their notes as a `.txt` file directly from the widget.

### Backend & Performance
- **Fastify Migration** – Rewritten backend to use Fastify instead of Express.
- **Logging Interval Adjustment** – Reduced system and network logging from 12h to 8h.

---

**Full Changelog**: https://github.com/MuxBH28/server-homepage/commits/v1.3.8

---

# [v1.3.7](https://github.com/MuxBH28/server-homepage/releases/tag/v1.3.7) – [8/31/25]

### Major Changes
- **Frontend Migration to React + Vite** – Replaced the old static HTML/CSS/JS setup with a modern React architecture powered by Vite for faster builds and improved developer experience.
- **Complete Dashboard Redesign** – Introduced a fresh, responsive layout with better UX, cleaner visuals, and modular components.
- **Tailwind Refactor** – Styling fully restructured using Tailwind utility classes for consistency and maintainability.

### Performance & UX
- **Improved Responsiveness** – Layout now adapts seamlessly across devices, including tablets and ultra-wide screens.
- **Better State Handling** – System data and link management now use React hooks for smoother updates and fewer glitches.

### Codebase Enhancements
- **Modular Component Structure** – Easier to maintain and extend with reusable React components.
- **Cleaner API Integration** – Refactored frontend API calls for better error handling and scalability.

### Known Issues & Notes
- **Possible Bugs** – As this is the first version using React + Vite, some components may behave unexpectedly or break under edge cases.
- **Performance Variability** – Initial load times may be slower on some devices due to unoptimized assets and lack of caching.
- **Experimental Layouts** – The new dashboard design is still being tested across screen sizes and may require further tuning.
- **Ongoing Refactoring** – Some legacy code paths are still being cleaned up, which could affect stability in certain views.

---

![Version 1.3.7](https://github.com/MuxBH28/server-homepage/blob/main/extra/preview1.3.7.png)

---

**Full Changelog**: https://github.com/MuxBH28/server-homepage/commits/v1.3.7

---

# [v1.3.6](https://github.com/MuxBH28/server-homepage/releases/tag/v1.3.6) – [8/23/25]

### Improvements
- **Mobile Design Overhaul** – Redesign of mobile layout for improved usability and aesthetics.
- **Settings Panel Fixes (Mobile)** – Reworked the previously broken and unresponsive settings UI on mobile devices.
- **Mobile Loading Responsivness** – Page loading was not the best on mobile devices.

### Repository Enhancements
- **Issue Templates Added**  
  Introduced structured templates for better community contributions:
  - `bug_report.yml`
  - `feature_request.yml`
  - `question.yml`
- **Pull Request Template** – Added `pull_request_template.md` to guide contributors through PR submissions.
- **Changelog Introduced** – Created `CHANGELOG.md` for tracking version history and updates.
- **Code of Conduct** – Added a formal code of conduct to foster a respectful and inclusive environment.
- **Contributing Guidelines** – Added `CONTRIBUTING.md` to help new contributors get started.

---

**Full Changelog**: https://github.com/MuxBH28/server-homepage/commits/v1.3.6

---

# [v1.3.5](https://github.com/MuxBH28/server-homepage/releases/tag/v1.3.5) – [8/22/25]

### New Features
- **URL to QR Generator** – Instantly generate QR codes from any text or URL directly on the dashboard.  
- **Hardware Info Widget** – Hardware/system info has been restructured into its own widget for better organization.  
- **Info Modal** – New info modal displaying project details, author links, repo, sponsors, and credits.  
- **Import & Export Links**  
  Added the ability to **download or upload `links.json`** directly from the settings panel.  
  - Users can now back up their saved links locally.  
  - Supports re-importing the file to restore or share link collections across devices.  

### Improvements
- **Settings Redesign** – Cleaner, more intuitive layout of the settings modal.  
- **Predefined Links** – Added ready-to-use `links.json` files in [extra/premade-links](https://github.com/MuxBH28/server-homepage/tree/main/extra/premade-links) for quick setup.  
- **README Refresh** – Updated visuals, improved structure, and added credits/attributions.  
- Minor UI/UX tweaks for better responsiveness.

### Bug Fixes
- **Widget Selector** – Fixed an issue where the selected widget wasn’t always loaded correctly on page refresh.  
- **Docker ARM Support** – Raspberry Pi and other ARM-based devices are now officially supported via Docker
(`docker pull ghcr.io/muxbh28/server-homepage:latest`).
---

![Version 1.3.5](https://github.com/MuxBH28/server-homepage/blob/main/extra/preview1.3.5.png)

**Full Changelog**: https://github.com/MuxBH28/server-homepage/commits/v1.3.5

---

# [v1.3.4](https://github.com/MuxBH28/server-homepage/releases/tag/v1.3.4) – [8/19/25]

### New Features
- **Widget System:** Added a fully functional widget system on the homepage.
  - **Process Viewer:** Displays server processes with PID, CPU usage, and memory.
  - **Notes:** Personal notes widget with automatic saving to JSON.
  - **Crypto Prices:** Shows current cryptocurrency prices for multiple coins.
  - **RSS Reader:** Displays latest items from a configurable RSS feed.
  - **Power Options:** Buttons to perform server actions like Shutdown, Restart, and Sleep.

- **Settings Enhancements:**
  - Added RSS feed URL input in settings modal.
  - All settings are saved to JSON and applied dynamically.

- **Basic Login Authentication:**
  - Optional PIN authentication on homepage load.
  - PINs are hashed with bcrypt and stored securely in settings.
  - Correct PIN saves to localStorage for 365 days to avoid repeated prompts.

**Full Changelog**: https://github.com/MuxBH28/server-homepage/commits/v1.3.4

---

# [v1.3.3](https://github.com/MuxBH28/server-homepage/releases/tag/v1.3.3) – [8/19/25]

### Info Tab  
- Added a brand-new **Info Tab** that displays detailed hardware information about the server (CPU, RAM, Storage, and more).

### Logs  
- Introduced a **Logs Section** showing the last **12 hours** of system activity.  
- Data is updated per minute and includes:  
  - CPU Temperature  
  - CPU Usage  
  - RAM Usage  

### Modal Redesign  
- Improved modal design for a cleaner and more modern look.  
- Added **click-outside-to-close** functionality for better user experience.  

### Other Improvements  
- Optimized folder structure for better maintainability.  
- Minor bug fixes and performance improvements.

![Logs](https://github.com/MuxBH28/server-homepage/blob/main/extra/logs.png)

**Full Changelog**: https://github.com/MuxBH28/server-homepage/commits/v1.3.3

--- 

# [v1.3.2](https://github.com/MuxBH28/server-homepage/releases/tag/v1.3.2) – [8/18/25]

## New Features & Improvements
- **Logo:** Official server logo added, now visible on welcome modals and preloader.  
- **Redesigned Preloader:** New interactive preloader with animated gauge and smooth loading animation.  
- **Scriptable Script for iOS:** Added support for iOS devices via Scriptable script (`Server Homepage.scriptable`).  
- **Repository Cleanup:** Organized folders and improved GitHub repository structure for better readability.

## Bug Fixes
- Fixed preloader gauge animation that was previously jittery.  
- Minor CSS and layout fixes on welcome modals and preloader.

---

![Logo](https://github.com/MuxBH28/server-homepage/blob/main/assets/logo.png)

**Full Changelog**: https://github.com/MuxBH28/server-homepage/commits/v1.3.2

---

# [v1.3.1](https://github.com/MuxBH28/server-homepage/releases/tag/v1.3.1) – [8/14/25]

![Version 1.3.1](https://github.com/MuxBH28/server-homepage/blob/main/extra/preview1.3.1.png)

**Full Changelog**: https://github.com/MuxBH28/server-homepage/commits/v1.3.1

---

# [v1.3](https://github.com/MuxBH28/server-homepage/releases/tag/v1.3) – [8/14/25]

## New Features
- **Network Tab:** Removed the weather section and added a network info tab displaying local IP, public IP, city, country, and coordinates.
- **Disk Management:** Added ability to add new disk paths via the web UI and visualize disk usage.
- **Welcome Screen:** Improved welcome screen for a better user experience.
- **Update Notifications:** Added system to notify users when a new version is available.
- **Docker Support:** Project can now be run as a Docker container for easier deployment.

## Improvements
- **Design Fixes:** Small UI improvements across the dashboard and settings.
- **Web UI Settings:** Settings are now editable through the web interface, safer than manually editing `settings.json`.

## Bug Fixes
- Fixed various minor bugs and inconsistencies in the interface.
- Fixed issues with responsive layout on mobile devices.
- Ensured proper saving and loading of settings and links from the back-end.

### Thank you to the Reddit /r/homelab community for their suggestions:
- GoldNovaNine – IP suggestions and Docker
- Crib0802 – Docker suggestion
- Pleasant-Light2784 – For ImmichFrame (TBA)

**Full Changelog**: https://github.com/MuxBH28/server-homepage/commits/v1.3

---

# [v1.2](https://github.com/MuxBH28/server-homepage/releases/tag/v1.2) – [8/14/25]

This version introduces several improvements and new features:

## What's New in v1.2

- **Link Statistics:** Tracks how many times each link has been opened.
- **Mobile Responsiveness Fixes:** Improved layout and interactions for mobile devices.
- **Welcome Screen:** Added a modal that shows basic information, links to GitHub, and a feedback section. Users can choose not to show it again.
- **Improved Empty State Handling:** e.g. Now displays a message if no links are available.
- **jQuery Migration:** The frontend codebase has been migrated from vanilla JavaScript to jQuery for easier DOM manipulation.

**Full Changelog**: https://github.com/MuxBH28/server-homepage/commits/v1.2


---

# [v1.1](https://github.com/MuxBH28/server-homepage/releases/tag/v1.1) – [8/13/25]

### New Features & Improvements

- **Dashboard Redesign**
  - Fully responsive layout with 4 main sections: Welcome, Weather, Media/Links, and Process Viewer.
  - CPU and RAM usage gauges now on the sides with centered CPU Temp gauge and indicators.
  - Indicators arranged in a 3-column grid below the CPU Temp gauge.
  - Redesigned footer.
  - Better loading screen.
  
- **Gauges**
  - Added RadialGauge for CPU and RAM usage.
  - Updated highlights and colors for better visualization.
  - Red needle for all main gauges.
  
- **Indicators**
  - Added multiple system indicators:
    - Battery
    - CPU Temperature
    - RAM Usage
    - System Warning
    - No Links
    - Storage
  - Descriptions added in README.
  
- **General Improvements**
  - Optimized flex layouts and spacing for better centering and responsiveness.
  - Updated color schemes and shadows for better UI contrast.
  - Minor bug fixes and code cleanup.

### Notes
- SVG icons used for indicators are from [SVG Repo: Car Parts 2 Collection](https://www.svgrepo.com/collection/car-parts-2/).

![Version 1.1](https://github.com/MuxBH28/server-homepage/blob/main/extra/preview2.png)

**Full Changelog**: https://github.com/MuxBH28/server-homepage/commits/v1.1

---

# [v1.0](https://github.com/MuxBH28/server-homepage/releases/tag/v1.0) – [7/24/25]

![Version 1.0](https://github.com/MuxBH28/server-homepage/blob/main/extra/preview.png)

**Full Changelog**: https://github.com/MuxBH28/server-homepage/commits/v1.0

---