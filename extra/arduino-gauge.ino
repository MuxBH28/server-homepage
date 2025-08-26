#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>

const char* ssid = "crniGaleb";
const char* password = "devojkaSaCardasNogama";

const char* serverURL = "http://192.168.1.50:6969/api/temperature";

Servo needle;
const int servoPin = 13;  
int minAngle = 0;          
int maxAngle = 180;        

const int LED_PIN = 2;     

struct CpuData {
  float temperature;
  int hour;
};

void setup() {
  Serial.begin(115200);
  Serial.println("Booting ESP32...");

  needle.attach(servoPin);
  pinMode(LED_PIN, OUTPUT);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");

  Serial.println("Starting needle sweep...");
  for(int pos = minAngle; pos <= maxAngle; pos+=2) {
    needle.write(pos);
    delay(15);
  }
  for(int pos = maxAngle; pos >= minAngle; pos-=2) {
    needle.write(pos);
    delay(15);
  }
  Serial.println("Needle sweep done.");

  CpuData data = getCpuData();
  setNeedle(data.temperature);
  setLed(data.hour);
}

void loop() {
  CpuData data = getCpuData();
  setNeedle(data.temperature);
  setLed(data.hour);
  delay(60000);
}

CpuData getCpuData() {
  CpuData data = {0, 12};
  if(WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    int httpCode = http.GET();
    if(httpCode == 200) {
      String payload = http.getString();
      Serial.print("Received payload: ");
      Serial.println(payload);

      StaticJsonDocument<200> doc;
      if(!deserializeJson(doc, payload)) {
        data.temperature = doc["temperature"];
        data.hour = doc["hour"];
        Serial.print("Temperature: "); Serial.println(data.temperature);
        Serial.print("Hour: "); Serial.println(data.hour);
      } else {
        Serial.println("JSON parsing failed!");
      }
    } else {
      Serial.print("HTTP GET failed, code: "); Serial.println(httpCode);
    }
    http.end();
  } else {
    Serial.println("WiFi not connected!");
  }
  return data;
}

void setNeedle(float temp) {
  int angle = map(temp, 20, 100, minAngle, maxAngle);
  angle = constrain(angle, minAngle, maxAngle);
  needle.write(angle);
  Serial.print("Needle angle: "); Serial.println(angle);
}

void setLed(int hour) {
  if(hour >= 19 || hour < 6) {
    digitalWrite(LED_PIN, HIGH);
    Serial.println("LED ON (night)");
  } else {
    digitalWrite(LED_PIN, LOW);
    Serial.println("LED OFF (day)");
  }
}
