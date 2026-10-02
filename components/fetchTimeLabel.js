const updateFetchTimeLabel = () => {
  const labels = document.querySelectorAll(".updateOn_date");
  const fetchLabel = document.getElementById("fetch_time_label");
  const weather = window.wCast;
  if (!labels.length || !fetchLabel || !weather?.currentWeather?.asOf || typeof moment === "undefined") return false;

  chrome.storage.local.get(["TimeFormat", "wCastCachedAt"], (data) => {
    const format = data.TimeFormat === "24h" ? "MMM D, HH:mm" : "MMM Do, h:mm A";
    const offset = typeof offsetUnix === "number" ? offsetUnix : 0;
    const sourceTime = moment.unix(toTimestamp(weather.currentWeather.asOf) + offset);
    const cachedAt = Number(data.wCastCachedAt);
    const fetchedAt = Number.isFinite(cachedAt) && cachedAt > 0
      ? moment.unix(Math.floor(cachedAt / 1000) + offset)
      : null;
    const text = `${chrome.i18n.getMessage("weatherDataFor")} ${sourceTime.format(format)}`;
    labels.forEach((label) => {
      label.textContent = text;
    });
    fetchLabel.textContent = fetchedAt
      ? `${chrome.i18n.getMessage("weatherFetchedAt")} ${fetchedAt.format(format)}`
      : "";
  });
  return Boolean(weather);
};
globalThis.updateFetchTimeLabel = updateFetchTimeLabel;

document.addEventListener("DOMContentLoaded", () => {
  let attempts = 0;
  const timer = setInterval(() => {
    attempts += 1;
    if (updateFetchTimeLabel() || attempts >= 100) clearInterval(timer);
  }, 50);
});
