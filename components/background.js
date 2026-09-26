let backgroundManifest = null;

const getBackgroundManifest = async () => {
  if (backgroundManifest) return backgroundManifest;
  try {
    const response = await fetch("data/backgrounds.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Local background manifest unavailable");
    backgroundManifest = await response.json();
  } catch (error) {
    console.warn("Local background manifest could not be loaded; using built-in fallback.", error);
    backgroundManifest = { entries: {} };
  }
  return backgroundManifest;
};

const bgBackground = async (iconName, daylight) => {
  if (typeof daylight !== "boolean") {
    daylight = typeof globalThis.daylight === "boolean" ? globalThis.daylight : /-day$/.test(String(iconName || ""));
  }
  const baseIcon = typeof iconName === "string" ? iconName : "clear-day";
  let condition = baseIcon.replace(/-(day|night)$/, "");
  if (!["clear", "partly-cloudy", "cloudy", "rain", "snow", "sleet", "wind", "fog"].includes(condition)) {
    condition = "clear";
  }

  const period = daylight ? "day" : "night";
  const key = `${condition}-${period}`;
  const manifest = await getBackgroundManifest();
  const urls = Array.isArray(manifest.entries?.[key]) ? manifest.entries[key] : [];
  const fallback = [
    "images/background/clear-day-01.jpg",
    "images/background/clear-day-02.jpg",
  ];
  const pool = urls.length ? urls : fallback;
  const previous = imageBackground.dataset.backgroundUrl || "";
  const choices = pool.length > 1 && previous ? pool.filter((url) => url !== previous) : pool;
  const url = choices[Math.floor(Math.random() * choices.length)];

  imageBackground.dataset.backgroundUrl = url;
  imageBackground.style.backgroundImage = `url("${url}")`;
};
