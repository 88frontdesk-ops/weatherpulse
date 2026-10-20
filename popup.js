document.addEventListener("DOMContentLoaded", () => {
  function fadeOutElement(elem, startOpacity, decrement, interval) {
    elem.style.opacity = startOpacity;
    const timer = setInterval(() => {
      parseFloat(elem.style.opacity) > 0
        ? (elem.style.opacity -= decrement)
        : ((elem.style.display = "none"), clearInterval(timer));
    }, interval);
  }
  const ensureStatusNoticeStack = () => {
    let stack = document.getElementById("weatherpulse_notice_stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.id = "weatherpulse_notice_stack";
      stack.setAttribute("aria-label", "WeatherPulse status messages");
      Object.assign(stack.style, {
        position: "fixed",
        top: "48px",
        right: "8px",
        zIndex: "10001",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "4px",
        width: "max-content",
        maxWidth: "250px",
        pointerEvents: "none",
        boxSizing: "border-box"
      });
      document.body.appendChild(stack);
    }
    return stack;
  };
  const showStatusNotice = (message, kind = "info") => {
    const noticeId = kind === "warning"
      ? "weatherpulse_api_notice"
      : "weatherpulse_background_notice";
    const stack = ensureStatusNoticeStack();
    stack.style.display = "flex";
    let notice = document.getElementById(noticeId);
    if (!notice) {
      notice = document.createElement("div");
      notice.id = noticeId;
      notice.setAttribute("role", "status");
      notice.setAttribute("aria-live", "polite");
      Object.assign(notice.style, {
        boxSizing: "border-box",
        maxWidth: "250px",
        padding: "5px 8px",
        borderRadius: "6px",
        fontSize: "10px",
        lineHeight: "1.25",
        fontFamily: "Arial, sans-serif",
        whiteSpace: "normal",
        overflowWrap: "break-word",
        textAlign: "left",
        boxShadow: "0 1px 5px rgba(0,0,0,.18)",
        border: "1px solid rgba(255,255,255,.18)",
        pointerEvents: "none"
      });
      stack.appendChild(notice);
    } else if (notice.parentElement !== stack) {
      stack.appendChild(notice);
    }
    notice.textContent = message;
    notice.style.background = kind === "warning"
      ? "rgba(92,57,12,.94)"
      : "rgba(20,42,62,.88)";
    notice.style.color = "#fff";
    notice.style.display = "block";
  };
  const hideStatusNotice = (kind = "all") => {
    const ids = kind === "warning"
      ? ["weatherpulse_api_notice"]
      : kind === "info"
        ? ["weatherpulse_background_notice"]
        : ["weatherpulse_api_notice", "weatherpulse_background_notice"];
    ids.forEach((id) => {
      const notice = document.getElementById(id);
      if (notice) notice.style.display = "none";
    });
    const stack = document.getElementById("weatherpulse_notice_stack");
    if (stack && !Array.from(stack.children).some((child) => child.style.display !== "none")) {
      stack.style.display = "none";
    } else if (stack) {
      stack.style.display = "flex";
    }
  };
  const showWeatherLoadFailure = () => {
    hideStatusNotice("all");
    document.querySelectorAll("#noInternet_popup, #overloaded_popup, #preload_body")
      .forEach((el) => { el.style.display = "none"; el.style.visibility = "hidden"; });
    let panel = document.getElementById("weatherpulse_load_failure");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "weatherpulse_load_failure";
      Object.assign(panel.style, {
        position: "fixed", inset: "0", zIndex: "20000", display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: "12px", padding: "24px", boxSizing: "border-box",
        background: "#f5f7fa", color: "#202a35", textAlign: "center",
        font: "13px Arial, sans-serif"
      });
      const message = document.createElement("div");
      message.textContent = "Weather data is unavailable and no usable cache was found.";
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Reload extension";
      Object.assign(button.style, {
        border: "0", borderRadius: "7px", padding: "9px 14px",
        background: "#1769aa", color: "white", fontWeight: "600", cursor: "pointer"
      });
      button.addEventListener("click", () => chrome.runtime.reload());
      panel.append(message, button);
      document.body.appendChild(panel);
    }
    panel.style.display = "flex";
  };
  // Console helper for validating background states without changing stored weather data.
  // Example: wpTestBackgroundEffect("unknown", "day") or wpTestBackgroundEffect("unknown", "night").
  globalThis.wpTestBackgroundEffect = async (conditionName = "unknown", period = "day") => {
    const isDay = typeof period === "boolean"
      ? period
      : !["night", "false", "0", "n"].includes(String(period).toLowerCase());
    const normalized = globalThis.weatherpulseNormalizeBackgroundCondition?.(conditionName) || "unknown";
    if (typeof bgLocal === "function") await bgLocal(conditionName, isDay);
    if (normalized === "unknown") {
      showStatusNotice("Unknown weather condition — background animation unavailable.", "info");
    } else {
      hideStatusNotice("info");
    }
    return {
      input: String(conditionName),
      normalizedCondition: normalized,
      period: isDay ? "day" : "night",
      unknownNoticeVisible: normalized === "unknown",
      backgroundImage: normalized === "unknown"
        ? (isDay ? "images/background/unknown/day/unknown-day.jpg" : "images/background/unknown/night/unknown-night.jpg")
        : "condition-specific background",
    };
  };
  // Compatibility alias for testing instructions used in earlier builds.
  globalThis.wpTestPopup = (conditionName = "unknown", isDay = true) => {
    const day = typeof isDay === "string"
      ? !["night", "false", "0", "n"].includes(isDay.toLowerCase())
      : Boolean(isDay);
    return globalThis.wpTestBackgroundEffect(conditionName, day ? "day" : "night");
  };

  // Preview cumulative UV-protection icons from the popup DevTools console.
  globalThis.wpTestUvRecommendations = (uvIndex) => {
    const uv = Number(uvIndex);
    const activeItems = applyUvIconState(uv);
    const uvIcon = document.getElementById("icon_uv");
    if (uvIcon) uvIcon.style.display = Number.isFinite(uv) && uv >= 1 ? "block" : "none";
    document.querySelectorAll(".current_uv").forEach((item) => {
      item.textContent = Number.isFinite(uv) ? String(uv) : "—";
    });
    const uvNote = document.getElementById("current_uv_note");
    if (uvNote && Number.isFinite(uv) && typeof getUvNote === "function") {
      uvNote.textContent = ` ${getUvNote(uv, typeof daylight !== "undefined" && daylight)}`;
    }
    return {
      uvIndex: Number.isFinite(uv) ? uv : null,
      activeItems,
    };
  };

  // UI-only helpers to preview the two API-failure states. They do not block network requests.
  globalThis.wpTestApiFailureUI = (mode = "cached") => {
    const normalizedMode = String(mode).toLowerCase();
    if (["no-cache", "nocache", "empty", "failed"].includes(normalizedMode)) {
      showWeatherLoadFailure();
      return "Previewed the no-cache failure UI. Reload the popup to restore normal display.";
    }
    const failurePanel = document.getElementById("weatherpulse_load_failure");
    if (failurePanel) failurePanel.style.display = "none";
    showStatusNotice("Failed to fetch API. Showing cached data; try again.", "warning");
    return "Previewed the cached-data API warning. This helper does not make a real API request.";
  };

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
          const code =
            hour.conditionCode ||
            (Number.isFinite(Number(hour.weatherCode))
              ? globalThis.weatherpulseConditionFromOpenMeteo(
                  Number(hour.weatherCode),
                  Number(hour.windSpeed) || 0,
                )
              : conditionFromDescription(hour.description, hour.conditionCode));
          set(
            `forecast_${index}_hourly_condition`,
            getWeDescription(code, hour.daylight, hour.cloudCover),
          );
          set(
            `forecast_${index}_hours_rain`,
            fmtPop(Number(hour.precipitationChance)),
          );
          set(`forecast_${index}_hourly_uv`, fmtUv(hour.uvIndex));
          set(`forecast_${index}_hourly_temp`, fmtTemp(hour.temperature));
          const icon = getWeIcon(code, hour.daylight, hour.cloudCover);
          const node = document.querySelector(
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
        const currentDescription = getWeDescription(
          condition,
          daylight,
          cloudCover,
        );
        set("current_condition", currentDescription);
        set("current_condition_table", currentDescription);
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
        ])
          .then((_ref) => {
            let [wCast] = _ref;
            refreshPopup(wCast);
            if (globalThis.weatherpulseFetchStatus === "stale-cache") {
              showStatusNotice("Failed to fetch API. Showing cached data; try again.", "warning");
            } else {
              // Clear only the API warning; retain the unknown-background tip when needed.
              hideStatusNotice("warning");
            }
            fadeOutElement(preloader, 1, 0.3, 50);
            fadeOutElement(preloaderLocation, 0.9, 0.1, 50);
            if (favouriteCheck) favourite();
          })
          .catch(() => {
            // No usable cache exists. Keep the popup quiet and offer recovery.
            showWeatherLoadFailure();
            document
              .querySelectorAll(".preloader, .preloaderLocation")
              .forEach((item) => { item.style.display = "none"; });
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
          // Pass the canonical condition so background effects can distinguish
          // thunderstorms and unknown conditions from generic rain/clear icons.
          bgLocal(condition, daylight);
          const normalizedBackgroundCondition =
            globalThis.weatherpulseNormalizeBackgroundCondition?.(condition) || "unknown";
          if (normalizedBackgroundCondition === "unknown") {
            showStatusNotice("Tip: Background animation is unavailable for this unknown condition.", "info");
          } else {
            hideStatusNotice("info");
          }
        }
        if ("c" === data.setSettingFC) ctemp(wCast);
        else ftemp(wCast);
        timeFormat(wCast);
        if (typeof globalThis.updateFetchTimeLabel === "function") {
          globalThis.updateFetchTimeLabel();
        }
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
  if (manualRefreshButton)
    manualRefreshButton.addEventListener("click", () => {
      manualRefreshButton.disabled = true;
      if (manualRefreshStatus) manualRefreshStatus.textContent = " Refreshing…";
      chrome.storage.local.get(["latlong", "country", "timezone"], (data) => {
        new Promise((resolve, reject) => {
          weCast(
            data.latlong,
            data.country,
            data.timezone,
            resolve,
            reject,
            true,
          );
        })
          .then((freshWeather) => {
            refreshPopup(freshWeather);
            if (globalThis.weatherpulseFetchStatus === "stale-cache") {
              showStatusNotice("Failed to fetch API. Showing cached data; try again.", "warning");
              if (manualRefreshStatus) manualRefreshStatus.textContent = " Showing cached data";
            } else {
              hideStatusNotice("warning");
              if (manualRefreshStatus) manualRefreshStatus.textContent = " Updated";
            }
          })
          .catch(() => {
            showWeatherLoadFailure();
            if (manualRefreshStatus)
              manualRefreshStatus.textContent = " No weather data";
          })
          .finally(() => {
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
