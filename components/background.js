let backgroundManifest = null;

const getBackgroundManifest = async () => {
  if (backgroundManifest) return backgroundManifest;
  try {
    const response = await fetch("data/backgrounds.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Local background index unavailable");
    backgroundManifest = await response.json();
  } catch (error) {
    console.warn("Local background index could not be loaded; using built-in fallback.", error);
    backgroundManifest = { version: 3, entries: {} };
  }
  return backgroundManifest;
};

const bgBackground = async (iconName, daylight) => {
  if (typeof daylight !== "boolean") {
    daylight = typeof globalThis.daylight === "boolean"
      ? globalThis.daylight
      : /-day$/.test(String(iconName || ""));
  }

  const baseIcon = typeof iconName === "string" ? iconName : "clear-day";
  let condition = baseIcon.replace(/-(day|night)$/, "");
  if (!["clear", "partly-cloudy", "cloudy", "rain", "snow", "sleet", "wind", "fog"].includes(condition)) {
    condition = "clear";
  }

  const period = daylight ? "day" : "night";
  const entries = await getBackgroundManifest();
  const pool = Array.isArray(entries.entries?.[condition]?.[period])
    ? entries.entries[condition][period]
    : [];

  const fallback = daylight
    ? "images/background/clear/day/clear-day-01.jpg"
    : "images/background/clear/night/clear-night-01.jpg";

  const usablePool = pool.length ? pool : [fallback];
  const previous = imageBackground.dataset.backgroundUrl || "";
  const choices = usablePool.length > 1 && previous
    ? usablePool.filter((url) => url !== previous)
    : usablePool;
  const url = choices[Math.floor(Math.random() * choices.length)];

  imageBackground.dataset.backgroundUrl = url;
  imageBackground.style.backgroundImage = `url("${url}")`;
};
