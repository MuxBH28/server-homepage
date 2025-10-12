const systemURL = "http://192.168.1.50:6969/api/system"
const networkURL = "http://192.168.1.50:6969/api/network"

let sysReq = new Request(systemURL)
let netReq = new Request(networkURL)

let system = await sysReq.loadJSON()
let network = await netReq.loadJSON()

let cpu = parseFloat(system.cpu_percent).toFixed(1) + "%"
let temp = parseFloat(system.cpu_temp).toFixed(1) + "°C"
let memPercent = ((system.memory.heapUsed / system.memory.totalMem) * 100).toFixed(1) + "%"

let down = network.download_speed
let up = network.upload_speed
let localIP = network.local_ip

let w = new ListWidget()
w.setPadding(16, 16, 16, 16)

let gradient = new LinearGradient()
gradient.colors = [new Color("#1e293b"), new Color("#0f172a")]
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
  t.textColor = new Color("#cbd5e1")
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

w.addSpacer(4)

let footer = w.addText("IP: " + localIP)
footer.font = Font.mediumSystemFont(9)
footer.textColor = new Color("#94a3b8")
footer.centerAlignText()

Script.setWidget(w)
w.presentMedium()
Script.complete()
