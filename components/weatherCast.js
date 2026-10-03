const weCast = (
  latlong,
  country,
  timezone,
  resolve,
  reject,
  forceRefresh = false,
) => {
  const [lat, lng] = String(latlong || "")
    .split(",")
    .map(Number);
  const getCacheSettings = async () =>
    new Promise((resolve) => {
      chrome.storage.local.get("WeatherCacheMinutes", (data) => {
        const minutes = [5, 15, 30, 60].includes(
          Number(data.WeatherCacheMinutes),
        )
          ? Number(data.WeatherCacheMinutes)
          : 5;
        if (data.WeatherCacheMinutes === undefined)
          chrome.storage.local.set({ WeatherCacheMinutes: "5" });
        resolve(minutes);
      });
    });
  const useCache = async () =>
    chrome.storage.local.get([
      "wCast",
      "wCastCachedAt",
      "weatherpulseFullAccess",
    ]);

  const applyWeather = (wCast) => {
    if (
      !wCast?.currentWeather ||
      !wCast?.forecastHourly?.hours?.length ||
      !wCast?.forecastDaily?.days?.length
    )
      throw new Error("Incomplete weather response");

    const now = Date.now();
    let index = wCast.forecastHourly.hours.findIndex((hour) => {
      const start = Date.parse(hour.forecastStart);
      return Number.isFinite(start) && start >= now;
    });
    if (index < 0) index = 0;

    if (index > 0)
      wCast = {
        ...wCast,
        forecastHourly: {
          ...wCast.forecastHourly,
          hours: wCast.forecastHourly.hours.slice(index),
        },
      };

    if (self.document) window.wCast = wCast;
    chrome.storage.local.set({ wCast });

    const current = wCast.currentWeather;
    const hour = wCast.forecastHourly.hours[0];
    const day = wCast.forecastDaily.days[0];
    const numberOr = (value, fallback = 0) =>
      Number.isFinite(Number(value)) ? Number(value) : fallback;

    updateTime = toTimestamp(current.asOf);
    temperature = (Number(current.temperature) || 0) + 273.15;
    pressure = Number(current.pressure) || 1013.25;
    pressureTrend = current.pressureTrend || "";
    windDirection = Number(current.windDirection) || 0;
    visibility = Number(current.visibility) || 16093;
    dewPoint =
      (Number(current.temperatureDewPoint) ||
        Number(current.temperature) ||
        0) + 273.15;
    humidity =
      typeof current.humidity === "number"
        ? Math.round(current.humidity * 100)
        : 0;
    windSpeed =
      numberOr(current.windSpeed, numberOr(hour.windSpeed)) * (1e3 / 3600);
    windGust =
      numberOr(current.windGust, numberOr(hour.windGust)) * (1e3 / 3600);
    cloudCover = Math.floor(
      100 * numberOr(current.cloudCover, numberOr(hour.cloudCover)),
    );
    uvIndex = numberOr(current.uvIndex, numberOr(hour.uvIndex));
    maxUvIndex = Number(day.maxUvIndex) || 0;
    daylight =
      current.daylight !== undefined
        ? current.daylight !== false
        : hour.daylight !== false;
    condition = current.conditionCode || hour.conditionCode || "clear";
    icon = getWeIcon(condition, daylight, cloudCover);
    iconBadge = getIconBadge(condition, daylight, cloudCover);
    conditionId = getWeDescriptionId(condition);

    dawn = toTimestamp(day.sunriseCivil);
    dusk = toTimestamp(day.sunsetCivil);
    sunriseTime = toTimestamp(day.sunrise);
    sunsetTime = toTimestamp(day.sunset);
    noonTime = toTimestamp(day.solarNoon);
    nightStart = toTimestamp(day.sunsetAstronomical);
    midnightTime = toTimestamp(day.solarMidnight || day.sunsetAstronomical);
    moonriseTime = toTimestamp(day.moonrise);
    moonsetTime = toTimestamp(day.moonset);
    sunriseAstronomical = toTimestamp(day.sunriseAstronomical);
    sunsetNautical = toTimestamp(day.sunsetNautical);
    sunriseNautical = toTimestamp(day.sunriseNautical);

    const accufeels = getAccuFeel(
      windSpeed,
      pressure,
      temperature,
      uvIndex,
      dewPoint,
      conditionId,
      visibility,
    );
    accufeel = accufeels[0];
    accufeelShade = accufeels[1];
    isWeatherAlert =
      Array.isArray(wCast.weatherAlerts?.alerts) &&
      wCast.weatherAlerts.alerts.length > 0;
    timeZoneBadge = getTimezoneOffset(timezone);
    getOffsetTime(timeZoneBadge, latlong);
    globalThis.country = typeof country === "string" ? country : "";
    const badgeCity = typeof citys === "string" ? citys : "";
    setBadge(
      daylight,
      iconBadge,
      temperature,
      updateTime,
      badgeCity,
      uvIndex,
      isWeatherAlert,
    );
    handleWeatherAlerts(wCast);
    return wCast;
  };

  const normalizeAlertLevel = (value) => {
    if (Array.isArray(value)) return normalizeAlertLevel(value[0]);
    if (value && typeof value === "object")
      return normalizeAlertLevel(
        value.value ?? value.name ?? value.code ?? value.label ?? value.text,
      );
    return typeof value === "string" ? value.trim().toLowerCase() : "";
  };

  const handleWeatherAlerts = (wCast) => {
    const alerts = wCast.weatherAlerts?.alerts || [];
    if (!alerts.length) return;
    const alert = alerts[0];
    const severity = normalizeAlertLevel(alert.severity);
    const urgency = normalizeAlertLevel(alert.urgency);
    const start = toTimestamp(alert.effectiveTime) + offsetUnix;
    const message =
      `${getSeverityDes(severity)} ${getUrgencyDes(urgency)}`.trim();
    chrome.permissions.contains(
      { permissions: ["notifications"] },
      (result) => {
        if (!result) return;
        chrome.storage.local.get("lastSeverAlertStartTime", (data) => {
          if (start > 0 && start !== data.lastSeverAlertStartTime) {
            chrome.storage.local.set({ lastSeverAlertStartTime: start });
            chrome.notifications.create({
              type: "basic",
              iconUrl: "images/UV_index128.png",
              title: capitalize(alert.description || "Weather alert"),
              message: capitalize(message),
              priority: 2,
            });
          }
        });
      },
    );
  };

  Promise.all([useCache(), getCacheSettings()])
    .then(([cached, cacheMinutes]) => {
      const cachedWeather = cached?.wCast;
      const cachedAt = Number(cached?.wCastCachedAt) || 0;
      const cacheIsFresh =
        cachedWeather &&
        cachedAt > 0 &&
        Date.now() - cachedAt < cacheMinutes * 60 * 1000;
      if (!forceRefresh && cacheIsFresh) {
        try {
          const result = applyWeather(cachedWeather);
          resolve && resolve(result);
          return;
        } catch (error) {
          console.warn(
            "Cached weather data invalid; fetching fresh data.",
            error,
          );
        }
      }
      return loadWeatherData({
        latitude: lat,
        longitude: lng,
        country,
        timezone,
      })
        .then((weather) => {
          const result = applyWeather(weather);
          chrome.storage.local.set({ wCastCachedAt: Date.now() });
          resolve && resolve(result);
        })
        .catch((error) => {
          if (cachedWeather) {
            try {
              console.warn(
                "Weather refresh failed; using cached weather data.",
                error,
              );
              const result = applyWeather(cachedWeather);
              resolve && resolve(result);
              return;
            } catch (cacheError) {
              console.warn("Cached weather data is unavailable.", cacheError);
            }
          }
          throw error;
        });
    })
    .catch((error) => {
      console.error("Weather provider request failed.", error);
      reject && reject(error);
    });
};
