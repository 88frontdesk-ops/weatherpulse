document.addEventListener("DOMContentLoaded", () => {
  function fadeOutElement(elem, startOpacity, decrement, interval) {
    elem.style.opacity = startOpacity;
    const timer = setInterval(() => {
      parseFloat(elem.style.opacity) > 0
        ? (elem.style.opacity -= decrement)
        : ((elem.style.display = "none"), clearInterval(timer));
    }, interval);
  }
  const renderApiAccuracy = (wCast) => {
    if (!wCast || !wCast.forecastHourly || !wCast.forecastDaily) return;
    chrome.storage.local.get(
      ["setSettingFC", "precipitationUnit"],
      (settings) => {
        const tempUnit = settings.setSettingFC || "c",
          precipUnit = settings.precipitationUnit || "inph";
        const fmtTemp = (v) =>
          !Number.isFinite(v)
            ? "—"
            : `${Math.round(tempUnit === "c" ? v : (v * 9) / 5 + 32)}°`;
        const fmtUv = (v) =>
          Number.isFinite(v) ? String(Number(v.toFixed(1))) : "—";
        const fmtPop = (v) =>
          Number.isFinite(v) ? `${Math.round(v * 100)}%` : "—";
        const fmtPrecip = (v) =>
          !Number.isFinite(v)
            ? "—"
            : precipUnit === "mmh"
              ? `${v.toFixed(1)} mm`
              : `${(v / 25.4).toFixed(1)} in`;
        const description = (x) => (x && x.description ? x.description : "—");
        const set = (id, value) => {
          const el = document.getElementById(id);
          if (el) el.textContent = value;
        };
        const fitDailyDescriptions = () => {
          document
            .querySelectorAll(
              '[id$="_daily_day_description"],[id$="_daily_night_description"]',
            )
            .forEach((el) => {
              el.style.display = "block";
              el.style.width = "100%";
              el.style.maxWidth = "100%";
              el.style.minWidth = "0";
              el.style.whiteSpace = "normal";
              el.style.overflow = "hidden";
              el.style.overflowWrap = "break-word";
              el.style.wordBreak = "normal";
              el.style.lineHeight = "1.25";
              el.style.boxSizing = "border-box";
            });
          document
            .querySelectorAll(
              '[id$="_day_description_group"],[id$="_night_description_group"]',
            )
            .forEach((el) => {
              el.style.flex = "1 1 0";
              el.style.minWidth = "0";
              el.style.width = "auto";
              el.style.maxWidth = "50%";
              el.style.boxSizing = "border-box";
              el.style.whiteSpace = "normal";
              el.style.overflow = "hidden";
            });
          document
            .querySelectorAll('[id$="_day_description_group"]')
            .forEach((el) => (el.style.paddingRight = "8px"));
          document
            .querySelectorAll('[id$="_night_description_group"]')
            .forEach((el) => (el.style.paddingLeft = "8px"));
        };
        const conditionFromDescription = (description, fallback) => {
          const text = String(description || "").toLowerCase();
          if (text.includes("thunder")) return "thunderstorms";
          if (
            text.includes("freezing rain") ||
            text.includes("freezing drizzle") ||
            text.includes("sleet") ||
            text.includes("wintry mix") ||
            text.includes("ice")
          )
            return "sleet";
          if (text.includes("snow") || text.includes("flurr")) return "snow";
          if (
            text.includes("rain") ||
            text.includes("drizzle") ||
            text.includes("shower")
          )
            return "rain";
          if (
            text.includes("fog") ||
            text.includes("haze") ||
            text.includes("smoke") ||
            text.includes("dust")
          )
            return "foggy";
          if (
            text.includes("partly") ||
            text.includes("mostly sunny") ||
            text.includes("mostly clear")
          )
            return "partlycloudy";
          if (text.includes("cloud") || text.includes("overcast"))
            return "cloudy";
          return fallback || "clear";
        };
        (wCast.forecastHourly.hours || []).forEach((hour, index) => {
          const apiCondition = Number.isFinite(Number(hour.weatherCode)) && globalThis.weatherpulseOpenMeteoDescription
            ? globalThis.weatherpulseOpenMeteoDescription(Number(hour.weatherCode))
            : description(hour);
          set(`forecast_${index}_hourly_condition`, apiCondition);
          set(`forecast_${index}_hours_rain`, fmtPop(Number(hour.precipitationChance)));
          set(`forecast_${index}_hourly_uv`, fmtUv(hour.uvIndex));
          set(`forecast_${index}_hourly_temp`, fmtTemp(hour.temperature));
          const code = Number.isFinite(Number(hour.weatherCode))
              ? globalThis.weatherpulseConditionFromOpenMeteo(Number(hour.weatherCode))
              : conditionFromDescription(hour.description, hour.conditionCode),
            icon = getWeIcon(code, hour.daylight, hour.cloudCover),
            node = document.querySelector(
              `.forecast_${index}_hours_icon_Class`,
            );
          if (node)
            node.style.backgroundImage = `url("images/weather_icon/${getColorWeatherIcon(icon)}")`;
        });
        (wCast.forecastDaily.days || []).forEach((day, index) => {
          const d = day.daytimeForecast || {},
            n = day.overnightForecast || {};
          set(`forecast_${index}_daily_day_description`, description(d));
          set(`forecast_${index}_daily_night_description`, description(n));
          set(`forecast_${index}_pop`, fmtPop(d.precipitationChance));
          set(
            `forecast_${index}_daily_probability`,
            fmtPop(d.precipitationChance),
          );
          set(
            `forecast_${index}_daily_night_probability`,
            fmtPop(n.precipitationChance),
          );
          set(
            `forecast_${index}_daily_precipitation`,
            fmtPrecip(d.precipitationAmount),
          );
          set(
            `forecast_${index}_daily_night_precipitation`,
            fmtPrecip(n.precipitationAmount),
          );
          set(`forecast_${index}_daily_uv`, fmtUv(day.maxUvIndex));
          set(`forecast_${index}_daily_temp`, fmtTemp(day.temperatureMax));
          set(`forecast_${index}_daily_temp_min`, fmtTemp(day.temperatureMin));
          set(
            `forecast_${index}_daily_temperatures_max`,
            fmtTemp(day.temperatureMax),
          );
          set(
            `forecast_${index}_daily_temperatures_min`,
            fmtTemp(day.temperatureMin),
          );
        });
        fitDailyDescriptions();
        if (wCast.currentWeather && wCast.currentWeather.description) {
          set("current_condition", wCast.currentWeather.description);
          set("current_condition_table", wCast.currentWeather.description);
        }
        if (
          wCast.currentWeather &&
          Number.isFinite(wCast.currentWeather.uvIndex)
        )
          document
            .querySelectorAll(".current_uv")
            .forEach(
              (el) => (el.textContent = fmtUv(wCast.currentWeather.uvIndex)),
            );
      },
    );
  };
  const popup = () => {
    chrome.storage.local.get(
      ["latlong", "citys", "country", "timezone", "wCast"],
      (data) => {
        latlong = data.latlong;
        country = data.country;
        citys = data.citys;
        timezone = data.timezone;
        timeZoneBadge = getTimezoneOffset(timezone);
        Promise.all([
          (function (latlong, country, timezone) {
            return new Promise((resolve, reject) => {
              wCast = [];
              // Let weCast decide whether the configured cache duration is still valid.
              // Do not delete the cache on every popup open.
              weCast(latlong, country, timezone, resolve, reject, false);
            });
          })(latlong, country, timezone),
        ]).then((_ref) => {
          let [wCast] = _ref;
          refreshPopup(wCast);
          fadeOutElement(preloader, 1, 0.3, 50);
          fadeOutElement(preloaderLocation, 0.9, 0.1, 50);
          if (favouriteCheck) favourite();
        });
      },
    );
  };
  const refreshPopup = (wCast) => {
    chrome.storage.local.get(
      [
        "verUpdate",
        "backgroundType",
        "setSettingFC",
        "latlong",
        "theme",
        "autoDark",
      ],
      (data) => {
        updateTime = toTimestamp(wCast.currentWeather.asOf);
        if ("image" == data.backgroundType) {
          let icon = getWeIcon(condition, daylight, cloudCover);
          if (1 == data.verUpdate) {
            imageBackground.classList.remove("hidden");
            chrome.storage.local.set({ verUpdate: 2 });
            bgLocal(icon, daylight);
          } else bgFlickr(icon);
        }
        if ("c" === data.setSettingFC) ctemp(wCast);
        else ftemp(wCast);
        timeFormat(wCast);
        sunMoonPath(data.latlong);
        alert(wCast);
        hazard(wCast);
        // Refresh every forecast view from the same fresh weather payload.
        // These renderers can safely update hidden tabs, so a manual refresh
        // does not depend on which tab happens to be open.
        daily(wCast);
        hourly(wCast);
        minutely(wCast);
        home();
        outlook(wCast);
        renderApiAccuracy(wCast);
        if (data.theme || data.autoDark) {
          document.documentElement.setAttribute("data-theme", data.theme);
          if ("1" === data.autoDark && daylight) {
            lightDisplay();
            return;
          }
          if ("1" === data.autoDark || "dark" === data.theme) {
            if ("dark" === data.theme)
              document.querySelector(
                '.theme-switch input[type="checkbox"]',
              ).checked = !0;
            darkDisplay();
            return;
          }
          lightDisplay();
        } else document.getElementById("setting_defualt_theme_l").checked = !0;
      },
    );
  };
  tokanID = "b82c08a7b8bd216c445c2fc968c6cb71";
  projectID = "2595739";
  getElements();
  noData();
  document.getElementById("preload_body").style.display = "block";
  loadLocations();
  // Register the Settings controls independently of the large legacy clickEvents
  // initializer. This keeps the gear usable even if another optional control
  // throws during startup. The capture handler also prevents a stale/overlay
  // handler from swallowing the click.
  const openSettingsDirect = (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (typeof closeAllPopup === "function") closeAllPopup();
    if (modalSetting) {
      modalSetting.style.display = "block";
      modalSetting.style.visibility = "visible";
      modalSetting.style.zIndex = "1000";
    }
    const unitTab = document.getElementById("tab_setting_unit");
    if (unitTab) unitTab.checked = true;
    if (typeof mp_event === "function") mp_event("Setting Page");
  };
  document.querySelectorAll(".setting_page").forEach((item) => {
    item.addEventListener("click", openSettingsDirect, true);
  });

  // Register navigation handlers before optional settings initialization.
  // If a settings value or widget fails during startup, navigation remains usable.
  clickEvents();
  setting();
  favouriteCheck = !0;
  const manualRefreshButton = document.getElementById("manual_refresh_button");
  const manualRefreshStatus = document.getElementById("manual_refresh_status");
  if (manualRefreshButton) manualRefreshButton.addEventListener("click", () => {
    manualRefreshButton.disabled = true;
    if (manualRefreshStatus) manualRefreshStatus.textContent = " Refreshing…";
    chrome.storage.local.get(["latlong", "country", "timezone"], (data) => {
      new Promise((resolve, reject) => {
        weCast(data.latlong, data.country, data.timezone, resolve, reject, true);
      }).then((freshWeather) => {
        refreshPopup(freshWeather);
        if (manualRefreshStatus) manualRefreshStatus.textContent = " Updated";
      }).catch(() => {
        if (manualRefreshStatus) manualRefreshStatus.textContent = " Refresh failed";
      }).finally(() => {
        manualRefreshButton.disabled = false;
      });
    });
  });
  popup();
  toggleActions();
  mp_visits();
  setTimeout(() => {
    mp_event("Popup Open");
  }, 2e3);
  globalThis.refreshPopup = refreshPopup;
});
