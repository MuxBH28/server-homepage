# Homepage Project


| Section       | Link                                  |
| --------------- | --------------------------------------- |
| About         | [Go to About](#about)                 |
| Preview       | [Go to Preview](#preview)             |
| Installation  | [Go to Installation](#installation)   |
| Usage         | [Go to Usage](#usage)                 |
| Customization | [Go to Customization](#customization) |
| Author        | [Go to Author](#author)               |

---

## About

This is a minimalist personal homepage project built with **Node.js (Express)** backend and a **static frontend** with HTML, CSS (Tailwind), and vanilla JS.

It serves system monitoring data (CPU, RAM, Disk, uptime), manages custom links via API, and shows weather information fetched from external services.

The project is intended to be deployed on a Linux server and accessed locally or via LAN.

---

## Preview

![Preview](preview.png)

---

## Installation

1. Clone or upload all project files to your server.
2. Make sure you have [Node.js](https://nodejs.org/) installed (version 16+ recommended).
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
background.jpg
```

To change the background, simply replace this file with your desired image, keeping the same filename and extension or in `index.html` change style of body tag.

Current background is from [https://pixabay.com/photos/mostar-bridge-travel-bosnia-1155674/](https://pixabay.com/photos/mostar-bridge-travel-bosnia-1155674/)

### Links

Custom links are stored in `links.json` on the server. You can edit this file manually or use the web UI to add/remove links.

### Server Port

By default, the server listens on port `6969`. You can change this by modifying the `PORT` variable in `server.js`.

### To Do
- [ ] Better loading screen
- [ ] Vakti times prayer
- [ ] Navidrome music player
- [ ] Process viewer

---

## Author

- Created by: **MuxBH28**
- Website: [https://msehic.com](https://msehic.com)
- Email: [sehicmuhammed7@proton.me](mailto:sehicmuhammed7@proton.me)
- GitHub: [https://github.com/MuxBH28](https://github.com/MuxBH28)

---

Feel free to customize and extend the project as you like! Pull requests are very **welcome**.
If you have any questions or issues, contact me via email or GitHub.
