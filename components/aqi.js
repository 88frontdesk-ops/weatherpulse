/*
 * Air-quality data powered by Open-Meteo Air Quality.
 */
(() => {
  const AQI_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";

  const getCoordinates = (value) => {
    if (Array.isArray(value)) return { latitude: Number(value[0]), longitude: Number(value[1]) };
    const parts = String(value ?? "").split(/[;,\s]+/).filter(Boolean);
    return { latitude: Number(parts[0]), longitude: Number(parts[1]) };
  };

  const text = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value == null ? "" : String(value);
  };

  const message = (key, fallback) => {
    try { return chrome.i18n.getMessage(key) || fallback; } catch (_) { return fallback; }
  };

  const pollutantName = (key) => ({
    pm2_5: "PM2.5",
    pm10: "PM10",
    ozone: "O₃",
    nitrogen_dioxide: "NO₂",
    sulphur_dioxide: "SO₂",
    carbon_monoxide: "CO"
  }[key] || key || message("unknown", "Unknown"));

  const aqiDescription = (value) => {
    if (!Number.isFinite(value)) return message("noData", "Air-quality data is unavailable.");
    if (value <= 50) return message("aqiGood", "Air quality is good. Air pollution poses little or no risk.");
    if (value <= 100) return message("aqiModerate", "Air quality is acceptable. Sensitive individuals may experience effects.");
    if (value <= 150) return message("aqiUnhealthySensitive", "Air quality is unhealthy for sensitive groups. Consider reducing prolonged outdoor exertion.");
    if (value <= 200) return message("aqiUnhealthy", "Air quality is unhealthy. Sensitive groups may experience more serious effects.");
    if (value <= 300) return message("aqiVeryUnhealthy", "Air quality is very unhealthy. Reduce outdoor activity.");
    return message("aqiHazardous", "Air quality is hazardous. Avoid outdoor exposure.");
  };

  const aqiColor = (value) => value <= 50 ? "#90be6d" : value <= 100 ? "#f9c74f" : value <= 150 ? "#f8961e" : value <= 200 ? "#f3722c" : value <= 300 ? "#6d597a" : "#723d46";

  const setIndicator = (value) => {
    const numeric = Number(value);
    const clamped = Number.isFinite(numeric) ? Math.max(0, Math.min(500, numeric)) : 0;
    const marker = document.getElementById("aqi_current_svg");
    if (marker) marker.style.top = `${100 - (clamped / 500) * 100}%`;
    const current = document.getElementById("current_aqi_subTitle");
    if (current) {
      current.textContent = Number.isFinite(numeric) ? `US AQI: ${Math.round(numeric)}` : "";
      current.style.color = aqiColor(clamped);
    }
  };

  const render = (data) => {
    const current = data.current || {};
    const aqi = Number(current.us_aqi);
    const pollutants = ["pm2_5", "pm10", "ozone", "nitrogen_dioxide", "sulphur_dioxide", "carbon_monoxide"];
    let dominant = "";
    let dominantValue = -Infinity;
    pollutants.forEach((key) => {
      const value = Number(current[key]);
      if (Number.isFinite(value) && value > dominantValue) { dominantValue = value; dominant = key; }
    });

    // Keep the legacy DOM contract used by the AQI page, while using Open-Meteo data.
    text("aqiDominantPollutant", dominant ? pollutantName(dominant) : message("noData", "Unavailable"));
    text("aqiHealthDes", aqiDescription(aqi));
    setIndicator(aqi);
    window.globalIndex = Number.isFinite(aqi) ? aqi : undefined;

    const labels = [
      ["aqi_text_good", 0, 50], ["aqi_text_moderate", 51, 100],
      ["aqi_text_unhealthy_sen", 101, 150], ["aqi_text_unhealthy", 151, 200],
      ["aqi_text_veryUnhealthy", 201, 300], ["aqi_text_hazardous", 301, 500]
    ];
    labels.forEach(([id, low, high]) => {
      const element = document.getElementById(id);
      if (element) element.style.fontWeight = Number.isFinite(aqi) && aqi >= low && aqi <= high ? "800" : "";
    });
  };

  const aqi_api = async (location) => {
    const { latitude, longitude } = getCoordinates(location);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      text("current_aqi_subTitle", message("noData", "Air-quality data is unavailable."));
      text("aqiDominantPollutant", "");
      text("aqiHealthDes", "");
      return null;
    }

    try {
      const url = new URL(AQI_URL);
      url.search = new URLSearchParams({
        latitude: String(latitude), longitude: String(longitude),
        timezone: "auto",
        current: "us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide",
        hourly: "us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide",
        forecast_days: "2"
      });
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error(`Air-quality request failed: ${response.status}`);
      const data = await response.json();
      render(data);
      return data;
    } catch (error) {
      console.warn("Open-Meteo air-quality data unavailable.", error);
      text("current_aqi_subTitle", message("noData", "Air-quality data is unavailable."));
      text("aqiDominantPollutant", "");
      text("aqiHealthDes", message("noData", "Air-quality data is unavailable."));
      return null;
    }
  };

  window.aqi_api = aqi_api;
})();
