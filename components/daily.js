const daily = (wCast) => {
  ((daily_day_icon = []),
    (daily_night_icon = []),
    (daily_icon_url = []),
    (daily_night_icon_url = []),
    (document.getElementById("subtitle_daily_text").textContent = chrome.i18n.getMessage("next10Days")));
  const createDailyForecast = (index) => {
    const dailyForecastItem = document.createElement("div");
    const dayRecord = wCast.forecastDaily.days[index] || {};
    const iconNames = {
      "clear-day": "c_sun",
      "clear-night": "c_moon",
      rain: "c_cloud_rain",
      snow: "c_cloud_snow",
      sleet: "c_cloud_snow_alt",
      wind: "c_wind",
      fog: "c_cloud_fog_alt",
      cloudy: "c_cloud",
      "partly-cloudy-day": "c_cloud_sun",
      "partly-cloudy-night": "c_cloud_moon"
    };
    const getDailyIconMarkup = (forecast, daylight) => {
      let iconName = daylight ? "clear-day" : "clear-night";
      try {
        iconName = getWeIcon(
          forecast?.conditionCode || "clear",
          daylight,
          Number(forecast?.cloudCover) || 0
        );
      } catch (_) {}
      const fileName = iconNames[iconName] || (daylight ? "c_sun" : "c_moon");
      const src = chrome.runtime.getURL(`images/weather_icon/${fileName}.svg`);
      return `<img src="${src}" alt="${daylight ? "Day" : "Night"} weather" class="forecast_daily_daynight_icon" width="22" height="22" decoding="sync" style="display:block!important;visibility:visible!important;opacity:1!important;">`;
    };
    return ((dailyForecastItem.innerHTML = `
      <button class="accordion">
        <span id="forecast_${index}_daily_day" class="forecast_day_modal_Class">-</span>
        <span id="forecast_${index}_pop" class="forecast_rain_modal_Class"></span>
        <span class="popDaily_group_Class">
          <span class="forecast_${index}_daily_day_icon_Class forecast_icon_modal_Class">${getDailyIconMarkup(dayRecord.daytimeForecast, true)}</span>
          <span class="forecast_${index}_daily_night_icon_Class forecast_icon_modal_Class" style="margin-left: 12px;">${getDailyIconMarkup(dayRecord.overnightForecast, false)}</span>
        </span>
        <span class="icon_min_max_daily_Class">
          <span id="forecast_${index}_daily_temp" class="forecast_temp_max_modal_Class">-°</span>
          <span id="forecast_${index}_daily_temp_min" class="forecast_temp_min_modal_Class">-°</span>
        </span>
        <img src="images/arrow.svg" class="more_down_icon_Class" />
      </button>
      <div class="panel_daily">
        <div class="panel_sub_daily">
        <div id="forecast_${index}_daily_full_date" class="forecast_daily_full_date_Class"></div>
        <div class="daily_description_groups">
            <div id="daily_${index}_day_description_group" class="daily_description_group">
              <div id="forecast_${index}_daily_day_date" class="forecast_daily_date_Class">-</div>
              <div id="forecast_${index}_daily_day_description" class="forecast_daily_description_Class">-</div>
            </div>
            <div id="daily_${index}_night_description_group" class="daily_description_group">
              <div id="forecast_${index}_daily_night_date" class="forecast_daily_date_Class">-</div>
              <div id="forecast_${index}_daily_night_description" class="forecast_daily_description_Class">-</div>
            </div>
        </div>

        <hr id="hr_forecast_daily_sub" class="hr_forecast_daily_main">

          <div class="daily_sub_row">
            <span class="daily_element_title">${chrome.i18n.getMessage("cloudCover")}</span>
            <span><span class="day_icon_group forecast_${index}_daily_day_value"><span id="forecast_${index}_daily_cloudCover">-</span></span><span class="night_icon_group"><span id="forecast_${index}_daily_night_cloudCover">-</span></span></span>
          </div>
          <hr id="hr_forecast_daily_sub_cloud" class="hr_forecast_daily_sub">
          <div class="daily_sub_row">
            <span class="daily_element_title">${chrome.i18n.getMessage("chanceOfPrecip")}</span>
            <span><span class="day_icon_group forecast_${index}_daily_day_value"><span id="forecast_${index}_daily_probability">-</span></span><span class="night_icon_group"><span id="forecast_${index}_daily_night_probability">-</span></span></span>
          </div>
          <hr id="hr_forecast_daily_pop" class="hr_forecast_daily_sub">
          <div class="daily_sub_row">
            <span class="daily_element_title">${chrome.i18n.getMessage("humidity")}</span>
            <span><span class="day_icon_group forecast_${index}_daily_day_value"><span id="forecast_${index}_daily_humidity">-</span></span><span class="night_icon_group"><span id="forecast_${index}_daily_night_humidity">-</span></span></span>
          </div>
          <hr id="hr_forecast_daily_sub_humidity" class="hr_forecast_daily_sub">
          <div class="daily_sub_row">
            <span class="daily_element_title">${chrome.i18n.getMessage("temperature")}</span>
            <span class="temp_daily_group"><span class="temp_daily_icon">↑</span><span id="forecast_${index}_daily_temperatures_max">-</span></span>
            <span class="temp_daily_group" style="padding-left: 5px;"><span class="temp_daily_icon">↓</span><span id="forecast_${index}_daily_temperatures_min">-</span></span>
          </div>
          <hr id="hr_forecast_daily_sub_temp" class="hr_forecast_daily_sub">
          <div id="daily_${index}_sub_row_uv" class="daily_sub_row">
            <span class="daily_element_title">${chrome.i18n.getMessage("uvIndexMax")}</span><span><span id="forecast_${index}_daily_uv">-</span></span>
          </div>
          <hr id="hr_forecast_daily_${index}_sub_uv" class="hr_forecast_daily_sub">
          <div class="daily_sub_row">
            <span class="daily_element_title">${chrome.i18n.getMessage("precipitation")}</span>
            <span><span class="day_icon_group forecast_${index}_daily_day_value"><span id="forecast_${index}_daily_precipitation">-</span></span><span class="night_icon_group"><span id="forecast_${index}_daily_night_precipitation">-</span></span></span>
          </div>
          <hr id="hr_forecast_daily_sub_precipitation" class="hr_forecast_daily_sub">
          <div class="daily_sub_row">
            <span class="daily_element_title">${chrome.i18n.getMessage("wind")}</span>
            <span><span class="day_icon_group forecast_${index}_daily_day_value"><span id="forecast_${index}_daily_wind">-</span></span><span class="night_icon_group"><span id="forecast_${index}_daily_night_wind">-</span></span></span>
          </div>
          <hr id="hr_forecast_daily_sub_wind" class="hr_forecast_daily_sub">
          <div class="daily_sub_row">
            <span class="daily_element_title">${chrome.i18n.getMessage("windDirection")}</span>
            <span><span class="day_icon_group forecast_${index}_daily_day_value"><span id="forecast_${index}_daily_windDir">-</span></span><span class="night_icon_group"><span id="forecast_${index}_daily_night_windDir">-</span></span></span>
          </div>
          <hr id="hr_forecast_daily_sub_wind_dir" class="hr_forecast_daily_sub">
          <div class="daily_sub_row">
            <span class="daily_element_title">${chrome.i18n.getMessage("windGusts")}</span>
            <span><span class="day_icon_group forecast_${index}_daily_day_value"><span id="forecast_${index}_daily_wind_gust">-</span></span><span class="night_icon_group"><span id="forecast_${index}_daily_night_wind_gust">-</span></span></span>
          </div>

          <div id="daily_${index}_hourly_chart" class="daily_hourly_chart_wrap" style="display:none;">
            <div class="daily_hourly_chart_title">${chrome.i18n.getMessage("hourlyBreakdown")} <span id="daily_${index}_chart_date" style="opacity:0.5; font-weight:400;"></span></div>
            <div class="daily_sparkline_container"><canvas id="dailySparkline_${index}"></canvas></div>
            <div id="daily_${index}_timeline" class="daily_timeline_bar"></div>
          </div>

          <div class="daily_sub_row nws_detailed_forecast_row" style="display:none; margin-top:12px;">
            <span class="daily_element_title">NWS Forecast</span>
            <div style="width:100%;">
              <div id="forecast_${index}_nws_day_detailed" class="forecast_daily_description_Class"></div>
              <div id="forecast_${index}_nws_night_detailed" class="forecast_daily_description_Class" style="margin-top:8px;"></div>
            </div>
          </div>
        </div>
      </div>
    `), dailyForecastItem);
  };
  // Keep the five Daily cards on the main screen in sync with the Daily tab.
  // These cards use forecast_0..4_homePage_icon_Class and are otherwise only
  // populated by the Hourly/Outlook renderers, which caused blank icons on a
  // fresh popup until another tab was visited.
  for (let i = 0; i < Math.min(5, wCast.forecastDaily.days.length); i++) {
    const dayRecord = wCast.forecastDaily.days[i] || {};
    const forecast = dayRecord.daytimeForecast || {};
    const iconName = getWeIcon(
      forecast.conditionCode || "clear",
      true,
      Number(forecast.cloudCover) || 0,
    );
    const iconFile = {
      "clear-day": "b_sun.svg",
      "clear-night": "b_moon.svg",
      rain: "b_cloud_rain.svg",
      snow: "b_cloud_snow.svg",
      sleet: "b_cloud_snow_alt.svg",
      wind: "b_wind.svg",
      fog: "b_cloud_fog_alt.svg",
      cloudy: "b_cloud.svg",
      "partly-cloudy-day": "b_cloud_sun.svg",
      "partly-cloudy-night": "b_cloud_moon.svg",
    }[iconName] || "b_sun.svg";
    const homeIcon = document.querySelector(`.forecast_${i}_homePage_icon_Class`);
    if (homeIcon) {
      homeIcon.style.backgroundImage = `url("images/weather_icon/${iconFile}")`;
      homeIcon.style.backgroundRepeat = "no-repeat";
      homeIcon.style.backgroundPosition = "center";
      homeIcon.style.backgroundSize = "contain";
    }
  }
  (() => {
    const dailyForecastTable = document.getElementById("daily_table");
    dailyForecastTable.innerHTML = "";
    for (let i = 0; i < wCast.forecastDaily.days.length; i++) {
      const dailyForecastItem = createDailyForecast(i);
      if ((dailyForecastTable.appendChild(dailyForecastItem), i < wCast.forecastDaily.days.length - 1)) {
        const hr = document.createElement("hr");
        ((hr.className = "hr_forecast_daily"), dailyForecastTable.appendChild(hr));
      }
    }
    // Restore Daily accordion expand/collapse behavior.
    dailyForecastTable.querySelectorAll(".accordion").forEach((button) => {
      button.onclick = () => {
        const panel = button.nextElementSibling;
        if (!panel || !panel.classList.contains("panel_daily")) return;
        const isOpen = button.classList.toggle("active");
        panel.style.maxHeight = isOpen ? `${panel.scrollHeight}px` : null;
        const arrow = button.querySelector(".more_down_icon_Class");
        if (arrow) arrow.style.transform = isOpen ? "rotate(180deg)" : "rotate(0deg)";
      };
    });
    // Force a post-paint repair. The Daily modal can be made visible immediately
    // before this function runs; rendering the SVGs once more on the next frame
    // guarantees they are attached to the visible popup on a fresh open.
    const repairDailyIcons = () => {
      dailyForecastTable.querySelectorAll(".forecast_icon_modal_Class").forEach((el) => {
        const img = el.querySelector("img.forecast_daily_daynight_icon");
        if (!img) return;
        img.style.setProperty("display", "block", "important");
        img.style.setProperty("visibility", "visible", "important");
        img.style.setProperty("opacity", "1", "important");
        img.style.setProperty("width", "22px", "important");
        img.style.setProperty("height", "22px", "important");
        if (!img.src) {
          const isNight = el.classList.contains("daily_night_icon_Class");
          img.src = chrome.runtime.getURL(`images/weather_icon/${isNight ? "c_moon" : "c_sun"}.svg`);
        }
      });
    };
    repairDailyIcons();
    requestAnimationFrame(() => {
      repairDailyIcons();
      requestAnimationFrame(repairDailyIcons);
    });
  })();
  const dailySparkline = async (dayIndex, dayHours, icons, tempUnit, timeFormat) => {
    await loadCharts();
    const canvas = document.getElementById(`dailySparkline_${dayIndex}`);
    if (!canvas || 0 === dayHours.length) return;
    const chartDateEl = document.getElementById(`daily_${dayIndex}_chart_date`);
    chartDateEl && dayHours.length > 0 && (chartDateEl.textContent = "— " + moment.unix(toTimestamp(dayHours[0].forecastStart) + offsetUnix).format("ddd, MMM D"));
    const existing = Chart.getChart(canvas); existing && existing.destroy();
    const convertTemp = "c" === tempUnit ? k2c : k2f, unitLabel = "c" === tempUnit ? "°C" : "°F", values = dayHours.map((h) => Math.round(convertTemp(h.temperature + 273.15))), timeLabels = dayHours.map((h) => moment.unix(toTimestamp(h.forecastStart) + offsetUnix).format("24h" === timeFormat ? "HH:00" : "hA")), conditions = dayHours.map((h) => getWeDescription(h.conditionCode)), maxVal = Math.max(...values), minVal = Math.min(...values), fontColor = getComputedStyle(document.documentElement).getPropertyValue("--font-color").trim() || "#333";
    (new Chart(canvas, { type: "line", data: { labels: timeLabels, datasets: [{ data: values, borderColor: fontColor, borderWidth: 2, pointRadius: 0, pointHoverRadius: 5, pointHoverBackgroundColor: fontColor, pointHoverBorderColor: "#fff", pointHoverBorderWidth: 2, tension: 0.35, fill: { target: "origin", above: "#333" === fontColor ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.08)" } }] }, options: { responsive: !0, maintainAspectRatio: !1, animation: !1, interaction: { mode: "index", intersect: !1 }, plugins: { legend: { display: !1 }, datalabels: { display: !1 }, tooltip: { enabled: !0, backgroundColor: "rgba(0,0,0,0.8)", titleFont: { size: 12, weight: "600" }, bodyFont: { size: 11 }, padding: 8, cornerRadius: 6, displayColors: !1, callbacks: { title: (items) => timeLabels[items[0].dataIndex], label: (item) => { const idx = item.dataIndex; return [values[idx] + unitLabel, conditions[idx]]; } } } }, layout: { padding: { top: 20, bottom: 4, left: 15, right: 15 } }, scales: { x: { display: !0, grid: { display: !1 }, ticks: { color: fontColor + "99", font: { size: 10 }, maxRotation: 0, autoSkip: !0, maxTicksLimit: 8 }, border: { display: !1 }, afterFit(axis) { ((axis.paddingLeft = 0), (axis.paddingRight = 0)); } }, y: { display: !1, min: minVal - 3, max: maxVal + 3, clip: !1 } } }, plugins: [{ id: "minMaxLabels", afterDraw(chart) { const { ctx: ctx, chartArea: chartArea } = chart, meta = chart.getDatasetMeta(0); if (!meta.data.length) return; let maxPt = meta.data[0], minPt = meta.data[0]; (meta.data.forEach((pt, idx) => { (values[idx] >= maxVal && (maxPt = pt), values[idx] <= minVal && (minPt = pt)); }), ctx.save(), ctx.font = "bold 11px sans-serif", ctx.fillStyle = fontColor); const clampX = (x) => { const w = ctx.measureText(maxVal + "°").width / 2 + 2; return Math.max(chartArea.left + w, Math.min(x, chartArea.right - w)); }; ((ctx.textAlign = "center"), ctx.fillText(maxVal + "°", clampX(maxPt.x), maxPt.y - 6), maxVal !== minVal && ctx.fillText(minVal + "°", clampX(minPt.x), minPt.y + 14), ctx.restore()); } }] }), (document.getElementById(`daily_${dayIndex}_hourly_chart`).style.display = "block"));
    const timelineContainer = document.getElementById(`daily_${dayIndex}_timeline`); timelineContainer && icons.length > 0 && (timelineContainer._timelineData = icons.map((icon) => ({ color: getTimelineColor(icon), text: getTimelineText(icon) })));
  };
  for (let i = 0; i < 5; i++) document.querySelector(`.forecast_${i}_date`).textContent = moment.unix(toTimestamp(wCast.forecastDaily.days[i].forecastStart) + offsetUnix).format("ddd D");
  chrome.storage.local.get(["setSettingFC", "windDirUnit", "windUnit", "weeklySelected", "precipitationUnit", "humidityUnit", "weatherpulseFullAccess", "TimeFormat"], (data) => {
    const updateElementWithDayNight = (elementId, value, unitConverter) => { const element = document.getElementById(elementId); element && (element.textContent = unitConverter(value)); }, endOfHourly = data.weatherpulseFullAccess ? wCast.forecastHourly.hours.length : Math.min(48, wCast.forecastHourly.hours.length), hoursByDay = {};
    for (let h = 0; h < endOfHourly; h++) { const dayKey = moment.unix(toTimestamp(wCast.forecastHourly.hours[h].forecastStart) + offsetUnix).format("YYYY-MM-DD"); (hoursByDay[dayKey] || (hoursByDay[dayKey] = []), hoursByDay[dayKey].push(wCast.forecastHourly.hours[h])); }
    for (let i = 0; i < wCast.forecastDaily.days.length; i++) {
      const dayHours = hoursByDay[moment.unix(toTimestamp(wCast.forecastDaily.days[i].forecastStart) + offsetUnix).format("YYYY-MM-DD")];
      if (dayHours && dayHours.length >= 2) { const icons = dayHours.map((h) => getWeIcon(h.conditionCode, h.daylight, h.cloudCover)); dailySparkline(i, dayHours, icons, data.setSettingFC || "c", data.TimeFormat || "12h"); }
      const detailed = wCast.forecastDaily.days[i].nwsDetailedForecast || {};
      const detailedRow = document.querySelector(`.nws_detailed_forecast_row:nth-of-type(1)`);
      const dayDetailedEl = document.getElementById(`forecast_${i}_nws_day_detailed`);
      const nightDetailedEl = document.getElementById(`forecast_${i}_nws_night_detailed`);
      if (dayDetailedEl && nightDetailedEl && (detailed.day || detailed.night)) {
        dayDetailedEl.textContent = detailed.day ? `Day: ${detailed.day}` : "";
        nightDetailedEl.textContent = detailed.night ? `Night: ${detailed.night}` : "";
        const row = dayDetailedEl.closest(".nws_detailed_forecast_row");
        if (row) row.style.display = "block";
      }
      const elementIdWind = `forecast_${i}_daily_wind`, elementIdWindNight = `forecast_${i}_daily_night_wind`, elementIdWindGust = `forecast_${i}_daily_wind_gust`, elementIdWindGustNight = `forecast_${i}_daily_night_wind_gust`, elementIdWindDir = `forecast_${i}_daily_windDir`, elementIdWindDirNight = `forecast_${i}_daily_night_windDir`, windDailyDay = wCast.forecastDaily.days[i].daytimeForecast.windSpeed * (1e3 / 3600), windDailyNight = wCast.forecastDaily.days[i].overnightForecast.windSpeed * (1e3 / 3600), windGustDailyDay = wCast.forecastDaily.days[i].daytimeForecast.windGustSpeedMax * (1e3 / 3600), windGustDailyNight = wCast.forecastDaily.days[i].overnightForecast.windGustSpeedMax * (1e3 / 3600), windDirDailyDay = wCast.forecastDaily.days[i].daytimeForecast.windDirection, windDirDailyNight = wCast.forecastDaily.days[i].overnightForecast.windDirection;
      switch (data.windUnit) {
        case "kmh": updateElementWithDayNight(elementIdWind, windDailyDay, toKMH); updateElementWithDayNight(elementIdWindGust, windGustDailyDay, toKMH); updateElementWithDayNight(elementIdWindNight, windDailyNight, toKMH); updateElementWithDayNight(elementIdWindGustNight, windGustDailyNight, toKMH); break;
        case "ms": updateElementWithDayNight(elementIdWind, windDailyDay, toMS); updateElementWithDayNight(elementIdWindGust, windGustDailyDay, toMS); updateElementWithDayNight(elementIdWindNight, windDailyNight, toMS); updateElementWithDayNight(elementIdWindGustNight, windGustDailyNight, toMS); break;
        case "bft": updateElementWithDayNight(elementIdWind, windDailyDay, toBeaufort); updateElementWithDayNight(elementIdWindGust, windGustDailyDay, toBeaufort); updateElementWithDayNight(elementIdWindNight, windGustDailyNight, toBeaufort); updateElementWithDayNight(elementIdWindGustNight, windGustDailyNight, toBeaufort); break;
        case "kn": updateElementWithDayNight(elementIdWind, windDailyDay, toKnots); updateElementWithDayNight(elementIdWindGust, windGustDailyDay, toKnots); updateElementWithDayNight(elementIdWindNight, windDailyNight, toKnots); updateElementWithDayNight(elementIdWindGustNight, windGustDailyNight, toKnots); break;
        case "fts": updateElementWithDayNight(elementIdWind, windDailyDay, toFtS); updateElementWithDayNight(elementIdWindGust, windGustDailyDay, toFtS); updateElementWithDayNight(elementIdWindNight, windDailyNight, toFtS); updateElementWithDayNight(elementIdWindGustNight, windGustDailyNight, toFtS); break;
        default: updateElementWithDayNight(elementIdWind, windDailyDay, toMPH); updateElementWithDayNight(elementIdWindGust, windGustDailyDay, toMPH); updateElementWithDayNight(elementIdWindNight, windDailyNight, toMPH); updateElementWithDayNight(elementIdWindGustNight, windGustDailyNight, toMPH);
      }
      if ("degrees" === data.windDirUnit) { updateElementWithDayNight(elementIdWindDir, windDirDailyDay, toDeg); updateElementWithDayNight(elementIdWindDirNight, windDirDailyDay, toDeg); } else { updateElementWithDayNight(elementIdWindDir, windDirDailyDay, toCom); updateElementWithDayNight(elementIdWindDirNight, windDirDailyNight, toCom); }
      function updateTemperatureElements(i, setting, wCast) { const tempMax = wCast.forecastDaily.days[i].temperatureMax + 273.15, tempMin = wCast.forecastDaily.days[i].temperatureMin + 273.15, conversionFunction = "c" === setting ? k2c : k2f; const updateElement = (idSuffix, content) => { document.getElementById(`forecast_${i}_${idSuffix}`).textContent = content; }; updateElement("daily_temperatures_max", `${conversionFunction(tempMax)}°`); updateElement("daily_temperatures_min", `${conversionFunction(tempMin)}°`); updateElement("daily_temp", `${conversionFunction(tempMax)}°`); updateElement("daily_temp_min", `${conversionFunction(tempMin)}°`); }
      function setDescriptionAndDate(i, wCast, daylight) {
        const dayRecord = wCast.forecastDaily.days[i];
        const dayDate = moment.unix(toTimestamp(dayRecord.forecastStart) + offsetUnix);
        const dayLabel = document.getElementById(`forecast_${i}_daily_day`);
        if (dayLabel) dayLabel.textContent = i === 0 ? (chrome.i18n.getMessage("today") || "Today") : dayDate.format("ddd D");
        const iconNames = {
          "clear-day":"c_sun", "clear-night":"c_moon", rain:"c_cloud_rain",
          snow:"c_cloud_snow", sleet:"c_cloud_snow_alt", wind:"c_wind",
          fog:"c_cloud_fog_alt", cloudy:"c_cloud",
          "partly-cloudy-day":"c_cloud_sun", "partly-cloudy-night":"c_cloud_moon"
        };
        const setDailyIcon = (selector, forecast, daylight) => {
          const el = document.querySelector(selector);
          if (!el || !forecast) return;
          let name = "clear-day";
          try {
            name = getWeIcon(forecast.conditionCode || "clear", daylight, Number(forecast.cloudCover) || 0);
          } catch (_) {}
          const icon = iconNames[name] || (daylight ? "c_sun" : "c_moon");
          const src = chrome.runtime.getURL(`images/weather_icon/${icon}.svg`);
          el.style.backgroundImage = "none";
          el.textContent = "";
          el.innerHTML = `<img src="${src}" alt="${daylight ? "Day" : "Night"} weather" class="forecast_daily_daynight_icon" width="22" height="22" decoding="sync">`;
          const img = el.querySelector("img");
          if (img) {
            img.style.display = "block";
            img.style.width = "22px";
            img.style.height = "22px";
            img.style.visibility = "visible";
            img.onload = () => {
              img.style.display = "block";
              img.style.visibility = "visible";
            };
          }
        };
        setDailyIcon(`.forecast_${i}_daily_day_icon_Class`, dayRecord.daytimeForecast, true);
        setDailyIcon(`.forecast_${i}_daily_night_icon_Class`, dayRecord.overnightForecast, false);
        function setDescription(prefix, forecast) { const windSpeedConversionFactor = 1e3 / 3600; const forecastDescription = typeof forecast.description === "string" && forecast.description.trim() ? forecast.description.trim() : getWeDescription(forecast.conditionCode); const descriptionText = capitalize(forecastDescription) + ". " + capitalize(getBeaufortDesc(forecast.windSpeed * windSpeedConversionFactor)); document.getElementById(`forecast_${i}_${prefix}_description`).textContent = descriptionText; }
        setDescription("daily_night", wCast.forecastDaily.days[i].overnightForecast); setDescription("daily_day", wCast.forecastDaily.days[i].daytimeForecast);
        const dayDateText = moment.unix(toTimestamp(wCast.forecastDaily.days[i].forecastStart) + offsetUnix).format("dddd, MMMM DD, YYYY");
        document.getElementById(`forecast_${i}_daily_full_date`).textContent = `${dayDateText} | ${truncateCityName(citys)}`;
        document.getElementById(`forecast_${i}_daily_day_date`).textContent = chrome.i18n.getMessage("day"); document.getElementById(`forecast_${i}_daily_night_date`).textContent = chrome.i18n.getMessage("night");
      }
      let humidityValueDay, humidityValueNight;
      switch ((updateTemperatureElements(i, data.setSettingFC, wCast), document.getElementById(`forecast_${i}_daily_uv`).textContent = Math.floor(wCast.forecastDaily.days[i].maxUvIndex) + " " + getUvNoteDaily(Math.floor(wCast.forecastDaily.days[i].maxUvIndex)), data.humidityUnit)) {
        case "gm3": humidityValueDay = `${GetAbsoluteHumiGm3(100 * wCast.forecastDaily.days[i].daytimeForecast.humidity, wCast.forecastDaily.days[i].temperatureMax + 273.15).toFixed(1)} gm³`; humidityValueNight = `${GetAbsoluteHumiGm3(100 * wCast.forecastDaily.days[i].overnightForecast.humidity, wCast.forecastDaily.days[i].temperatureMin + 273.15).toFixed(1)} gm³`; break;
        case "grft": humidityValueDay = `${GetAbsoluteHumiGrft(100 * wCast.forecastDaily.days[i].daytimeForecast.humidity, wCast.forecastDaily.days[i].temperatureMax + 273.15).toFixed(1)} gr/ft³`; humidityValueNight = `${GetAbsoluteHumiGrft(100 * wCast.forecastDaily.days[i].overnightForecast.humidity, wCast.forecastDaily.days[i].temperatureMin + 273.15).toFixed(1)} gr/ft³`; break;
        default: humidityValueDay = `${Math.round(100 * wCast.forecastDaily.days[i].daytimeForecast.humidity)}%`; humidityValueNight = `${Math.round(100 * wCast.forecastDaily.days[i].overnightForecast.humidity)}%`;
      }
      function formatPrecipitation(amount, unit) { return "mmh" === unit ? `${Math.round(amount)} mm` : `${(0.0393701 * amount).toFixed(1)} in`; }
      document.getElementById(`forecast_${i}_daily_humidity`).textContent = humidityValueDay; document.getElementById(`forecast_${i}_daily_night_humidity`).textContent = humidityValueNight;
      document.getElementById(`forecast_${i}_daily_cloudCover`).textContent = Math.round(100 * wCast.forecastDaily.days[i].daytimeForecast.cloudCover) + "%"; document.getElementById(`forecast_${i}_daily_night_cloudCover`).textContent = Math.round(100 * wCast.forecastDaily.days[i].overnightForecast.cloudCover) + "%";
      const dayPop = Number(wCast.forecastDaily.days[i].daytimeForecast.precipitationChance);
      const nightPop = Number(wCast.forecastDaily.days[i].overnightForecast.precipitationChance);
      const dayPopText = Number.isFinite(dayPop) ? `${5 * Math.ceil(100 * dayPop / 5)}%` : "—";
      const nightPopText = Number.isFinite(nightPop) ? `${5 * Math.ceil(100 * nightPop / 5)}%` : "—";
      document.getElementById(`forecast_${i}_daily_probability`).textContent = dayPopText;
      document.getElementById(`forecast_${i}_daily_night_probability`).textContent = nightPopText;
      // The accordion header has its own precipitation element. It previously was
      // created but never populated, which is why the value appeared only after
      // navigating away/back and repainting other Daily content.
      const headerPop = document.getElementById(`forecast_${i}_pop`);
      if (headerPop) headerPop.textContent = dayPopText;
      document.getElementById(`forecast_${i}_daily_precipitation`).textContent = formatPrecipitation(wCast.forecastDaily.days[i].daytimeForecast.precipitationAmount, data.precipitationUnit); document.getElementById(`forecast_${i}_daily_night_precipitation`).textContent = formatPrecipitation(wCast.forecastDaily.days[i].overnightForecast.precipitationAmount, data.precipitationUnit);
      setDescriptionAndDate(i, wCast, !0);
    }
    weeklySelected = data.weeklySelected;
  });
};
