# Server Homepage

<p align="center">
  <img src="assets/logo.png" alt="Logo"/>
</p>

<p align="center">
  <em>A lightweight dashboard for your home server.</em>
</p>

<p align="center">
  <a href="https://github.com/MuxBH28/server-homepage/">
    <img src="https://img.shields.io/github/stars/MuxBH28/server-homepage?color=232323&label=server-homepage&logo=github&labelColor=232323" alt="View server-homepage on GitHub" />
  </a>
  <a href="https://github.com/sponsors/MuxBH28">
    <img src="https://img.shields.io/badge/Sponsor-b820f9?labelColor=b820f9&logo=githubsponsors&logoColor=fff" alt="Sponsor MuxBH28" />
  </a>
  <img src="https://github.com/MuxBH28/server-homepage/actions/workflows/docker-image.yml/badge.svg" alt="Build Status" />
  <img src="https://img.shields.io/badge/Docker%20Pulls-latest-blue?style=flat-square&logo=docker&link=https%3A%2F%2Fghcr.io%2Fmuxbh28%2Fserver-homepage" alt="Docker Pulls" />
  <img src="https://img.shields.io/github/license/muxbh28/server-homepage" alt="License" />
  <img src="https://img.shields.io/github/v/release/muxbh28/server-homepage" alt="Release" />
</p>

<p align="center">
   <a href="https://server-homepage.msehic.com/" target="_blank">Demo available here!</a>
</p>

---


| Section       | Link                                  |
| --------------- | --------------------------------------- |
| About         | [Go to About](#about)                 |
| Preview       | [Go to Preview](#preview)             |
| Installation  | [Go to Installation](#installation)   |
| Arduino       | [Go to Arduino](#arduino)             |
| Scriptable    | [Go to Scriptable](#scriptable)       |
| Usage         | [Go to Usage](#usage)                 |
| Customization | [Go to Customization](#customization) |
| Author        | [Go to Author](#author)               |

---

## About

This is a minimalist personal homepage project built with **Node.js (Express)** backend and a **static frontend** with HTML, CSS (Tailwind), and vanilla JS.

It serves system monitoring data (CPU, RAM, Disk, uptime), manages custom links via API, and shows network information.

The project is intended to be deployed on a Linux server and accessed locally or via LAN.

---

## Preview

Version 1.0:
![Version 1.0](extra/preview.png)
[Release v1.0](https://github.com/MuxBH28/server-homepage/releases/tag/v1.0)

Version 1.1+:
![Version 1.1](extra/preview2.png)

Version 1.3.1:
![Version 1.3.1](extra/preview1.3.1.png)

Version 1.3.5:
![Version 1.3.5](extra/preview1.3.5.png)

## Installation

You have three options to run **Server Homepage**: using Node.js/PM2, building from Dockerfile, or using the prebuilt Docker image. Cloning the repository is only necessary if you want to modify the source code.

If you get stuck or encounter any issues, feel free to reach out by creating an [issue](https://github.com/MuxBH28/server-homepage/issues) on GitHub.

### Option 1: Using Node.js / PM2

1. Make sure you have [Node.js](https://nodejs.org/) installed (version 16+ recommended).
2. Clone the repository:

```bash
git clone https://github.com/MuxBH28/server-homepage
cd server-homepage
```

3. In the project folder, install dependencies:

```bash
npm install
```

4. Start the server:

```bash
node server.js
```

or better, use [PM2](https://pm2.keymetrics.io/) to manage the process:

```bash
pm2 start server.js
```

5. Access the homepage via `http://your-server-ip:6969/` in your browser.

### Option 2: Using Dockerfile

1. Make sure you have [Docker](https://www.docker.com/get-started/) installed.
2. Clone the repository:

```bash
git clone https://github.com/MuxBH28/server-homepage
cd server-homepage
```

3. Build the Docker image:

```bash
docker build -t server-homepage .
```

4. Run the container:

```bash
docker run -d -p 6969:6969 --name server-homepage server-homepage
```

5. Access the homepage via http://your-server-ip:6969/ in your browser.

### Option 3: Using Prebuilt Docker Image

1. Make sure you have [Docker](https://www.docker.com/get-started/) installed.
2. Pull the latest image from GitHub Container Registry:

```bash
docker pull ghcr.io/muxbh28/server-homepage:latest
```

3. Run the container:

```bash
docker run -d -p 6969:6969 --name server-homepage ghcr.io/muxbh28/server-homepage:latest
```

4. Access the homepage via http://your-server-ip:6969/ in your browser.

#### Docker stop

1. To stop the container:

```bash
docker stop server-homepage
```

2. To remove the container:

```bash
docker rm server-homepage
```

---

## Arduino

- The Arduino sketch (`extra/arduino.ino`) runs on an ESP32 and monitors the status of a home server by periodically fetching system metrics (CPU load, temperature, RAM usage) from a REST API hosted on the server.
- It visually indicates the server health status using LEDs: green for normal, yellow for warning, and red for critical conditions. A white LED briefly blinks each time fresh data is received successfully.
- The sketch connects to WiFi and handles network errors gracefully.

I added this Arduino sketch as a test to explore how the ESP32 connects and interacts with my server, so I can plan a mini wireless server hub with a display for temperature, buttons for controlling the display, and a server restart feature.

---

## Scriptable

Server Homepage now includes **Scriptable widget integration**, allowing you to monitor your server’s status directly from your iOS home screen.
The widget displays key real-time metrics, including **CPU usage, RAM usage, CPU temperature, and network speeds (download & upload)**.

Detailed installation and setup instructions are available in [scriptable/instructions.md](scriptable/instructions.md).

![Scriptable Widget Preview](scriptable/preview.jpg)

---

## Usage

- The system info is updated automatically based on the refresh interval set in the UI.
- You can add, edit, or delete custom links through the web interface, which are saved in `links.json`.
- Weather information is fetched from a configured API and cached in localStorage for performance.

---

## Customization

### Background Image

The easiest way to change the background is to go to the settings and replace the path with your desired image. You can use a local file or an online image URL.

The default background image is:

```
./assets/background.jpg
```

One more option to change the background is to simply replace this file with your desired image, keeping the same filename and extension or in `index.html` change style of body tag.

Current default background is by [Manuela](https://pixabay.com/users/sinnesreich-2779296/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=1759179) from [Pixabay](https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=1759179)

### Links

Custom links are stored in `json/links.json` on the server. You can edit this file manually or use the web UI to add/remove links.

The `extra/premade-links` folder contains predefined JSON files that can be used or copied.

### Settings

Settings are stored in `json/settings.json`. You can edit them manually, but using the web UI is **recommended** to avoid errors.

### Server Port

By default, the server listens on port `6969`. You can change this by modifying the `PORT` variable in `server.js`. But before that, check [Installation](#installation) if you changed something or used Docker.

### Indicators

The dashboard includes several indicators to help monitor the server's status:

- **Battery** (./svg/battery.svg) – Shows whether the dashboard is connected to server.
- **CPU Temperature** (./svg/temperature.svg) – Lights up if the CPU temperature is high.
- **RAM Usage** (./svg/ram-high.svg) – Indicates high memory usage.
- **System Warning** (./svg/check-engine.svg) – Alerts about general system issues.
- **No Links** (./svg/no-links.svg) – Displays when there are no available links.
- **Storage** (./svg/storage.svg) – Indicates that disk storages are almost full.

The SVG icons used in this project are proudly sourced from [SVG Repo](https://www.svgrepo.com/collection/car-parts-2/) collection *Car Parts 2*.

### Widgets

The Server Homepage comes with an integrated widget system that allows you to view and interact with different information directly on the main page.
Currently available widgets:

- **Process Viewer** – Displays all active processes on the server, including PID, CPU usage, and memory.
- **Power Options** – Provides basic server commands: Shutdown, Restart, and Sleep.
- **Notes** – Allows you to keep personal notes directly on the server. All changes are saved automatically.
- **URL to QR** – Generates a QR code from any text or URL. You can customize size, colors, and download the generated QR.
- **RSS Reader** – Displays the latest articles from a selected RSS feed.
- **Crypto Prices** – Shows the current prices of popular cryptocurrencies (Bitcoin, Ethereum, and others as configured).
- **Hardware Info** – Displays detailed hardware information about the server (CPU, RAM, Storage, and more).

Widgets can be switched using the **select dropdown** at the top of the widget section. The selected widget is loaded and automatically refreshed according to configured intervals:

- Process Viewer and Crypto Prices refresh every minute or according to the configured interval.
- Notes are loaded only once, and changes are saved immediately when edited.
- RSS Reader refreshes every 10 minutes.
- Hardware info is only fetched on load.
- Power Options and URL to QR do not require automatic refreshing.

### To Do

- [X] Status indicator
- [X] Better loading screen
- [X] Process viewer
- [X] Welcome screen
- [X] Move settings from localStorage to json
- [X] Make a Dockerfile
- [X] Online available Demo
- [X] System logs with ~~Chart.js~~ Apexcharts
- [ ] Ctrl+V to paste link
- [ ] Telegram notifications for warnings
- [ ] Background images from Immich ([ImmichFrame](https://github.com/immichFrame/ImmichFrame))

## Notes

 - Ideas and suggestions are welcome! Feel free to share them by creating an [issue](https://github.com/MuxBH28/server-homepage/issues) on GitHub.
 - Public network information is retrieved from [ipinfo.io](https://ipinfo.io/json).
 - The available demo is provided for reference purposes and may not reflect the most recent version of the project.
---

## Author

- Created by: **MuxBH28**
- Website: [https://msehic.com](https://msehic.com)
- Email: [sehicmuhammed7@proton.me](mailto:sehicmuhammed7@proton.me)
- GitHub: [https://github.com/MuxBH28](https://github.com/MuxBH28)

---

Feel free to customize and extend the project as you like! Pull requests are very **welcome**.
If you have any questions or issues, contact me via email or GitHub.
