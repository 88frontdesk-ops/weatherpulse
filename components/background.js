const normalizeBackgroundCondition = (iconName) => {
  const icon = String(iconName || "").toLowerCase();
  if (icon.startsWith("clear")) return "clear";
  if (icon.startsWith("partly-cloudy")) return "partly-cloudy";
  if (icon.includes("rain")) return "rain";
  if (icon.includes("snow")) return "snow";
  if (icon.includes("sleet")) return "sleet";
  if (icon.includes("wind")) return "wind";
  if (icon.includes("fog")) return "fog";
  if (icon.includes("cloud")) return "cloudy";
  return "clear";
};

const bgLocal = async (iconName, isDaylight) => {
  const condition = normalizeBackgroundCondition(iconName);
  const period = isDaylight ? "day" : "night";
  try {
    const response = await fetch("data/backgrounds.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Background index HTTP ${response.status}`);
    const index = await response.json();
    const files = index?.entries?.[condition]?.[period] || [];
    if (!files.length) throw new Error(`No background for ${condition}/${period}`);
    const file = files[Math.floor(Math.random() * files.length)];
    imageBackground.style.backgroundImage = `url("${file}")`;
    imageBackground.classList.remove("hidden");
  } catch (error) {
    console.warn("Local background unavailable:", error);
    imageBackground.style.backgroundImage = "none";
  }
};
