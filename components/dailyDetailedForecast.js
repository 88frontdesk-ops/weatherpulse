(() => {
  const renderNwsDetails = () => {
    const wCast = window.wCast;
    const days = wCast?.forecastDaily?.days;
    const table = document.getElementById("daily_table");
    if (!Array.isArray(days) || !table) return false;

    days.forEach((day, index) => {
      const details = day?.nwsDetailedForecast || {};
      if (!details.day && !details.night) return;
      const panel = table.querySelector(`#forecast_${index}_daily_day`)?.closest(".panel_daily");
      if (!panel || panel.querySelector(".nws_detailed_forecast_row")) return;
      const row = document.createElement("div");
      row.className = "daily_sub_row nws_detailed_forecast_row";
      row.style.marginTop = "12px";
      const title = document.createElement("span");
      title.className = "daily_element_title";
      title.textContent = "NWS Forecast";
      const content = document.createElement("div");
      content.style.width = "100%";
      if (details.day) {
        const dayText = document.createElement("div");
        dayText.className = "forecast_daily_description_Class";
        dayText.textContent = `Day: ${details.day}`;
        content.appendChild(dayText);
      }
      if (details.night) {
        const nightText = document.createElement("div");
        nightText.className = "forecast_daily_description_Class";
        nightText.style.marginTop = "8px";
        nightText.textContent = `Night: ${details.night}`;
        content.appendChild(nightText);
      }
      row.append(title, content);
      panel.querySelector(".panel_sub_daily")?.appendChild(row);
    });
    return true;
  };

  const waitForWeather = () => {
    if (renderNwsDetails()) return;
    setTimeout(waitForWeather, 250);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", waitForWeather, { once: true });
  else waitForWeather();
})();
