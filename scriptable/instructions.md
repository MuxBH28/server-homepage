# Installation Guide for Server Homepage Scriptable Widget

First, download the **Scriptable** app from the App Store:
👉 [Scriptable on App Store](https://apps.apple.com/ba/app/scriptable/id1405459188)

---

## Install from File

1. Download the file **Server Homepage.scriptable** from this repository.
2. Open the **Scriptable** app on your iPhone.
3. Tap the **+** button to create a new script.
4. Select **Import Script**, then choose the file you downloaded.
5. Save the script and add the widget to your home screen.

---

## Manual Install

1. Open the file **Server Homepage.js** from this repository.
2. Copy the entire content of the file.
3. Open the **Scriptable** app on your iPhone.
4. Tap the **+** button to create a new script.
5. Paste the copied content into the editor.
6. Save the script and add the widget to your home screen.

---

## Usage

1. **Add the widget to your home screen:**

   - Long press on your home screen until the apps start jiggling.
   - Tap the **“+” button** in the top left corner.
   - Search for **Scriptable** and select it.
   - Choose the **medium widget size** (recommended) and add it.
2. **Set up the widget:**

   - While in jiggle mode, tap **Edit Widget**.
   - Choose the script **"Server Homepage"** from the list.
   - Ensure background refresh is enabled so the widget updates automatically.

---

## Customization

You can modify the script inside **Scriptable** to match your preferences:

- **API URL:**
  Change the `url` variable in the script if your server IP or port is different.
  ```js
  let url = "http://192.168.1.50:6969/api/system"
  ```
- **Colors:**
  Adjust the `addLine` function color codes for CPU, RAM, Temperature, Download, and Upload.
- **Fonts & Sizes:**
  Edit `Font.mediumSystemFont(size)` or `Font.boldSystemFont(size)` to increase readability.
- **Layout:**
  Change `w.presentMedium()` to `w.presentSmall()` or `w.presentLarge()` to preview in different widget sizes.

---

## ⚠️ Notes

- Ensure that your **iPhone is connected to the same network as your server**, or make sure your API is **accessible remotely** if you want to view it outside your LAN.
- Widgets on iOS **refresh in the background every 15-30 minutes**, so real-time updates are not guaranteed.
- If the widget **doesn’t update**, manually open **Scriptable** and run the script to force a refresh.
