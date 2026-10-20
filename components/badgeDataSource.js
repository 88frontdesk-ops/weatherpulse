const refreshBadgeInterval = (interval) => {
  chrome.storage.local.set({ IntervalUpdate: interval }, () => {
    chrome.runtime.sendMessage({ msg: "intervalUpdateMessage" });
    chrome.storage.local.remove(["wCast", "wCastCachedAt"], () => {
      if (typeof globalThis.popup === "function") globalThis.popup();
      const intervalButton = document.getElementById(
        `setting_defualt_button_${interval}`,
      );
      if (intervalButton) intervalButton.checked = true;
    });
  });
};

const applyWeatherApiSource = (source) => {
  const sourceElement = document.getElementById("weather_api_source");
  if (!sourceElement) return;
  const allowedSources = ["Open-Meteo", "Open-Meteo + National Weather Service"];
  sourceElement.textContent = allowedSources.includes(source)
    ? `API: ${source}`
    : "API: Open-Meteo";
};

document.addEventListener(
  "click",
  (event) => {
    const intervalOption = event.target.closest(
      "#setting_defualt_button_5_all, #setting_defualt_button_15_all, #setting_defualt_button_30_all",
    );
    if (!intervalOption) return;
    event.preventDefault();
    event.stopImmediatePropagation();

    const interval = intervalOption.id.includes("_5_")
      ? "5"
      : intervalOption.id.includes("_15_")
        ? "15"
        : "30";
    refreshBadgeInterval(interval);
  },
  true,
);

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get("weatherApiSource", (data) =>
    applyWeatherApiSource(data.weatherApiSource),
  );

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && changes.weatherApiSource)
      applyWeatherApiSource(changes.weatherApiSource.newValue);
  });

  chrome.storage.local.get("IntervalUpdate", (data) => {
    const interval = data.IntervalUpdate === undefined ? "5" : String(data.IntervalUpdate);
    const intervalButton = document.getElementById(
      `setting_defualt_button_${interval}`,
    );
    if (intervalButton) intervalButton.checked = true;
    if (data.IntervalUpdate === undefined) {
      chrome.storage.local.set({ IntervalUpdate: "5" });
      chrome.runtime.sendMessage({ msg: "intervalUpdateMessage" });
    }
  });
});

globalThis.popup = globalThis.popup || (() => window.location.reload());
