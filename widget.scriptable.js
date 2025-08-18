let url = "http://192.168.1.50:6969/api/system"
let req = new Request(url)
let data = await req.loadJSON()

let cpu = parseFloat(data.cpu_percent).toFixed(1) + "%"
let temp = data.cpu_temp + "°C"
let memPercent = ((data.memory.heapUsed / data.memory.totalMem) * 100).toFixed(1) + "%"
let down = data.network.download_speed
let up = data.network.upload_speed

let w = new ListWidget()
w.setPadding(16, 16, 16, 16)

let gradient = new LinearGradient()
gradient.colors = [new Color("#ffffff", 0.15), new Color("#000000", 0.25)]
gradient.locations = [0, 1]
w.backgroundGradient = gradient
w.cornerRadius = 12

function addLine(icon, title, value, color) {
  let row = w.addStack()
  row.layoutHorizontally()
  row.centerAlignContent()

  let i = row.addText(icon + " ")
  i.font = Font.mediumSystemFont(12)
  i.textColor = Color.white()

  let t = row.addText(title)
  t.font = Font.mediumSystemFont(12)
  t.textColor = new Color("#dddddd")

  row.addSpacer()

  let v = row.addText(value)
  v.font = Font.boldSystemFont(12)
  v.textColor = new Color(color)

  w.addSpacer(6)
}

let header = w.addText("🖥 Server Homepage")
header.font = Font.boldSystemFont(14)
header.textColor = Color.white()
header.centerAlignText()

w.addSpacer(10)

addLine("⚙️", "CPU", cpu, "#4ade80")
addLine("🌡", "Temp", temp, "#f87171")
addLine("💾", "RAM", memPercent, "#60a5fa")
addLine("⬇️", "Download", down, "#34d399")
addLine("⬆️", "Upload", up, "#fbbf24")

w.addSpacer()

let footer = w.addText("IP: " + data.network.local_ip)
footer.font = Font.mediumSystemFont(9)
footer.textColor = new Color("#bbbbbb")
footer.centerAlignText()

Script.setWidget(w)
w.presentMedium()
Script.complete()