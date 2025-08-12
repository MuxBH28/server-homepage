#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "name_of_the_network";
const char* password = "jer_ti_si_mi_u_mislima";

const char* serverUrl = "http://192.168.1.50:6969/api/system";

const int greenLedPin = 16;
const int yellowLedPin = 5;
const int redLedPin = 4;
const int whiteLedPin = 14;

void setup() {
  Serial.begin(115200);

  pinMode(greenLedPin, OUTPUT);
  pinMode(yellowLedPin, OUTPUT);
  pinMode(redLedPin, OUTPUT);
  pinMode(whiteLedPin, OUTPUT);
  digitalWrite(whiteLedPin, LOW);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);

    int httpCode = http.GET();
    if (httpCode == HTTP_CODE_OK) {
      String payload = http.getString();

      StaticJsonDocument<2048> doc;
      DeserializationError error = deserializeJson(doc, payload);

      if (!error) {
        float cpuTemp = doc["cpu_temp"] | -1.0;
        float cpuPercent = doc["cpu_percent"].as<float>();
        float freeMem = doc["memory"]["freeMem"] | 0;
        float totalMem = doc["memory"]["totalMem"] | 1;
        float usedMemPercent = ((totalMem - freeMem) / totalMem) * 100.0;

        Serial.printf("CPU Temp: %.1f°C, CPU Load: %.2f%%, RAM used: %.2f%%\n", cpuTemp, cpuPercent, usedMemPercent);

        digitalWrite(whiteLedPin, HIGH);
        delay(100);
        digitalWrite(whiteLedPin, LOW);

        if (cpuTemp < 70 && cpuPercent < 80 && usedMemPercent < 80) {
          digitalWrite(greenLedPin, HIGH);
          digitalWrite(yellowLedPin, LOW);
          digitalWrite(redLedPin, LOW);
        } else if ((cpuTemp >= 70 && cpuTemp <= 80) || cpuPercent >= 80 || usedMemPercent >= 80) {
          digitalWrite(greenLedPin, LOW);
          digitalWrite(yellowLedPin, HIGH);
          digitalWrite(redLedPin, LOW);
        } else if (cpuTemp > 80 || cpuPercent >= 99 || usedMemPercent >= 99) {
          digitalWrite(greenLedPin, LOW);
          digitalWrite(yellowLedPin, LOW);
          digitalWrite(redLedPin, HIGH);
        } else {
          digitalWrite(greenLedPin, LOW);
          digitalWrite(yellowLedPin, LOW);
          digitalWrite(redLedPin, LOW);
        }
      } else {
        Serial.println("JSON parsing error.");
        digitalWrite(greenLedPin, LOW);
        digitalWrite(yellowLedPin, LOW);
        digitalWrite(redLedPin, HIGH);
      }
    } else {
      Serial.printf("HTTP error: %d\n", httpCode);
      digitalWrite(greenLedPin, LOW);
      digitalWrite(yellowLedPin, LOW);
      digitalWrite(redLedPin, HIGH);
    }
    http.end();
  } else {
    Serial.println("WiFi not connected.");
    digitalWrite(greenLedPin, LOW);
    digitalWrite(yellowLedPin, LOW);
    digitalWrite(redLedPin, HIGH);
  }

  delay(15000);
}
