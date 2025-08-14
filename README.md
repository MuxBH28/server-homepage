# Homepage Project


| Section       | Link                                  |
| --------------- | --------------------------------------- |
| About         | [Go to About](#about)                 |
| Preview       | [Go to Preview](#preview)             |
| Installation  | [Go to Installation](#installation)   |
| Arduino       | [Go to Arduino](#arduino)             |
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
![Version 1.0](preview.png)
[Release v1.0](https://github.com/MuxBH28/server-homepage/releases/tag/v1.0)

Version 1.1+:
![Version 1.1](preview2.png)

## Installation

Before continuing, first clone or upload all project files to your server:
```
git clone https://github.com/MuxBH28/server-homepage
```
After that, you have two options: either run the project using Node.js/PM2 or Docker.
I personally use PM2 because I find it easier, and I also manage many other projects with PM2.

If you get stuck or encounter any issues, feel free to reach out by creating an [issue](https://github.com/MuxBH28/server-homepage/issues) on GitHub.

### Option 1: Using Node.js / PM2

1. Make sure you have [Node.js](https://nodejs.org/) installed (version 16+ recommended).
2. In the project folder, install dependencies:

```bash
npm install
```

3. Start the server:

```bash
node server.js
```

or better, use [PM2](https://pm2.keymetrics.io/) to manage the process:

```bash
pm2 start server.js
```

4. Access the homepage via `http://your-server-ip:6969/` in your browser.

### Option 2: Using Docker

1. Make sure you have [Docker](https://www.docker.com/get-started/) installed.
2. Build the Docker image:

```bash
docker build -t dashboard-server .
```

3. Run the container:

```bash
docker run -d -p 6969:6969 --name dashboard-server dashboard-server
```

4. Access the homepage via http://your-server-ip:6969/ in your browser.
5. To stop the container:

```bash
docker stop dashboard-server
```

6. To remove the container:

```bash
docker rm dashboard-server
```

---

## Arduino

- The Arduino sketch (`arduino.ino`) runs on an ESP32 and monitors the status of a home server by periodically fetching system metrics (CPU load, temperature, RAM usage) from a REST API hosted on the server.
- It visually indicates the server health status using LEDs: green for normal, yellow for warning, and red for critical conditions. A white LED briefly blinks each time fresh data is received successfully.
- The sketch connects to WiFi and handles network errors gracefully.

I added this Arduino sketch as a test to explore how the ESP32 connects and interacts with my server, so I can plan a mini wireless server hub with a display for temperature, buttons for controlling the display, and a server restart feature.

---

## Usage

- The system info is updated automatically based on the refresh interval set in the UI.
- You can add, edit, or delete custom links through the web interface, which are saved in `links.json`.
- Weather information is fetched from a configured API and cached in localStorage for performance.

---

## Customization

### Background Image

The background image is:

```
./assets/background.jpg
```

To change the background, simply replace this file with your desired image, keeping the same filename and extension or in `index.html` change style of body tag.

Current background is from [https://pixabay.com/photos/mostar-bridge-travel-bosnia-1155674/](https://pixabay.com/photos/mostar-bridge-travel-bosnia-1155674/)

### Links

Custom links are stored in `json/links.json` on the server. You can edit this file manually or use the web UI to add/remove links.

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

### To Do

- [X] Status indicator
- [X] Better loading screen
- [X] Process viewer
- [X] Welcome screen
- [X] Move settings from localStorage to json
- [X] Make a Dockerfile
- [ ] Online available Demo
- [ ] Telegram notifications for warnings
- [ ] System logs with Chart.js
- [ ] Background images from Immich ([ImmichFrame](https://github.com/immichFrame/ImmichFrame))

## Notes

Ideas and suggestions are welcome! Feel free to share them by creating an [issue](https://github.com/MuxBH28/server-homepage/issues) on GitHub.
Public network information is retrieved from [ipinfo.io](https://ipinfo.io/json).

---

## Author

- Created by: **MuxBH28**
- Website: [https://msehic.com](https://msehic.com)
- Email: [sehicmuhammed7@proton.me](mailto:sehicmuhammed7@proton.me)
- GitHub: [https://github.com/MuxBH28](https://github.com/MuxBH28)

---

Feel free to customize and extend the project as you like! Pull requests are very **welcome**.
If you have any questions or issues, contact me via email or GitHub.
