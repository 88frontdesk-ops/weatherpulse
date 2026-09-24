const prev24Hrs = async () => {
  try {
    const data = await new Promise((resolve) => chrome.storage.local.get([
      "latlong", "timezone", "pressureUnit", "windUnit", "windDirUnit",
      "setSettingFC", "visibilityUnit", "humidityUnit"
    ], resolve));
    if (!data.latlong || typeof weatherpulseFetchHistoricalDay !== "function") return;

    const [lat, lng] = data.latlong.split(",");
    const timezoneName = data.timezone || timezone || "auto";
    const yesterdayDate = moment().tz(timezoneName).subtract(1, "day").format("YYYY-MM-DD");
    const archive = await weatherpulseFetchHistoricalDay(lat, lng, timezoneName, yesterdayDate);
    const hourly = archive?.hourly;
    if (!hourly?.time?.length) throw new Error("No Open-Meteo historical hourly data returned");

    const targetHour = moment().tz(timezoneName).subtract(1, "day").format("YYYY-MM-DDTHH:00");
    let index = hourly.time.indexOf(targetHour);
    if (index < 0) {
      index = hourly.time.reduce((best, value, i) => {
        const bestDiff = Math.abs(Date.parse(`${hourly.time[best]}:00Z`) - Date.parse(`${targetHour}:00Z`));
        const diff = Math.abs(Date.parse(`${value}:00Z`) - Date.parse(`${targetHour}:00Z`));
        return diff < bestDiff ? i : best;
      }, 0);
    }

    const value = (key, fallback = 0) => hourly[key]?.[index] ?? fallback;
    const temperature = value("temperature_2m");
    const apparent = value("apparent_temperature", temperature);
    const pressure = value("pressure_msl", 1013.25);
    const humidity = value("relative_humidity_2m") / 100;
    const windSpeed = value("wind_speed_10m") / 3.6;
    const windGust = value("wind_gusts_10m") / 3.6;
    const visibility = value("visibility", 16093);
    const cloudCover = value("cloud_cover") / 100;
    const uv = Math.floor(value("uv_index"));
    const windCompass = value("wind_direction_10m");
    const conditionCode = weatherpulseConditionFromOpenMeteo(value("weather_code"));
    const currentConditionId = getWeDescriptionId(conditionCode);
    const summary = getWeDescription(conditionCode) || weatherpulseOpenMeteoDescription(value("weather_code"));
    const dewPoint = temperature;

    const humidityPercent = Math.round(100 * humidity);
    let humidityValue;
    switch (data.humidityUnit) {
      case "gm3":
        humidityValue = `${GetAbsoluteHumiGm3(humidityPercent, temperature + 273.15).toFixed(1)} gm³`;
        break;
      case "grft":
        humidityValue = `${GetAbsoluteHumiGrft(humidityPercent, temperature + 273.15).toFixed(1)} gr/ft³`;
        break;
      default:
        humidityValue = `${humidityPercent}%`;
    }

    const tempK = temperature + 273.15;
    const apparentK = apparent + 273.15;
    const dewPointK = dewPoint + 273.15;
    const accufeels = getAccuFeel(windSpeed, pressure, tempK, uv, dewPointK, currentConditionId, visibility);
    const accufeel = accufeels[0];
    const accufeelShade = accufeels[1];
    const tempText = "c" === data.setSettingFC ? `${k2c(tempK)}°C` : `${k2f(tempK)}°F`;
    const accufeelText = "c" === data.setSettingFC ? `${k2c(accufeel)}°C` : `${k2f(accufeel)}°F`;
    const accufeelShadeText = "c" === data.setSettingFC ? `${k2c(accufeelShade)}°C` : `${k2f(accufeelShade)}°F`;

    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };
    document.querySelectorAll(".sameTimeYesterday_humidity").forEach((item) => {
      item.textContent = `${humidityValue} (${"c" === data.setSettingFC ? `${k2c(dewPointK)}°C` : `${k2f(dewPointK)}°F`})`;
    });
    document.querySelectorAll(".sameTimeYesterday_uv").forEach((item) => { item.textContent = uv; });
    document.querySelectorAll(".sameTimeYesterday_air_temp").forEach((item) => { item.textContent = tempText; });
    document.querySelectorAll(".sameTimeYesterday_accufeel").forEach((item) => { item.textContent = accufeelText; });
    setText("sameTimeYesterday_condition", summary.length > 21 ? `${summary.slice(0, 19)}.` : summary);
    setText("sameTimeYesterday_uv_note", ` ${getUvNote(uv, false)}`);
    setText("sameTimeYesterday_cloud", `${Math.round(cloudCover * 100)}%`);
    setText("sameTimeYesterday_accufeel_shade", uv > 0 ? `(${accufeelShadeText})` : "");
    setText("sameTimeYesterday_visibility", data.visibilityUnit === "mi" ? toMi(visibility) : toKm(visibility));

    const pressureEl = document.getElementById("sameTimeYesterday_pressure");
    if (pressureEl) {
      switch (data.pressureUnit) {
        case "mb": pressureEl.textContent = toMb(pressure); break;
        case "psi": pressureEl.textContent = toPSI(pressure); break;
        case "inhg": pressureEl.textContent = toInHg(pressure); break;
        case "mmhg": pressureEl.textContent = toMmHg(pressure); break;
        case "kpa": pressureEl.textContent = toKPa(pressure); break;
        default: pressureEl.textContent = toHPa(pressure);
      }
    }

    let windText, gustText;
    switch (data.windUnit) {
      case "kmh": windText = toKMH(windSpeed); gustText = toKMH(windGust); break;
      case "ms": windText = toMS(windSpeed); gustText = toMS(windGust); break;
      case "bft": windText = toBeaufort(windSpeed); gustText = toBeaufort(windGust); break;
      case "kn": windText = toKnots(windSpeed); gustText = toKnots(windGust); break;
      case "fts": windText = toFtS(windSpeed); gustText = toFtS(windGust); break;
      default: windText = toMPH(windSpeed); gustText = toMPH(windGust);
    }
    setText("sameTimeYesterday_wind", windText);
    setText("sameTimeYesterday_windGust", gustText);
    setText("sameTimeYesterday_windBearing_windCompass", data.windDirUnit === "degrees" ? toDeg(windCompass) : toCom(windCompass));
  } catch (error) {
    console.warn("Yesterday weather rendering/request failed.", error);
    ["sameTimeYesterday_condition", "sameTimeYesterday_cloud", "sameTimeYesterday_pressure", "sameTimeYesterday_visibility", "sameTimeYesterday_wind", "sameTimeYesterday_windGust", "sameTimeYesterday_windBearing_windCompass"].forEach((id) => {
      const el = document.getElementById(id); if (el) el.textContent = "—";
    });
  }
};
