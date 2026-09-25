const home = () => {
  (document.querySelectorAll(".location_name").forEach((item) => {
    item.textContent = citys.length > 20 ? citys.slice(0, 17) + "..." : citys;
  }),
    (document.getElementById("icon_uv").style.display =
      uvIndex < 1 ? "none" : "block"),
    (icon = getWeIcon(condition, daylight, cloudCover)),
    chrome.storage.local.get("animatedIcon", (data) => {
      const animatedIcon = "1" === data.animatedIcon;
      currentIcon.style.backgroundImage = animatedIcon
        ? iconCurrent_animated(icon, daylight)
        : iconCurrent(icon);
    }),
    chrome.storage.local.get("humidityUnit", (data) => {
      let humidityValue;
      switch (data.humidityUnit) {
        case "gm3":
          humidityValue = `${GetAbsoluteHumiGm3(humidity, temperature).toFixed(1)} gm³`;
          break;
        case "grft":
          humidityValue = `${GetAbsoluteHumiGrft(humidity, temperature).toFixed(1)} gr/ft³`;
          break;
        default:
          humidityValue = `${humidity}%`;
      }
      document.querySelectorAll(".current_humidity_home").forEach((item) => {
        item.textContent = humidityValue;
      });
    }),
    (document.getElementById("current_condition").textContent =
      getWeDescription(condition, daylight, cloudCover)),
    document.querySelectorAll(".current_uv").forEach((item) => {
      item.textContent = uvIndex;
    }),
    (document.getElementById("current_uv_note").textContent =
      " (" + getUvNote(uvIndex, daylight) + ")"));
  const uvGroup = document.getElementById("current_uv_group");
  if (
    uvGroup &&
    typeof maxUvIndex === "number" &&
    Number.isFinite(maxUvIndex)
  ) {
    let maxGroup = document.getElementById("current_uv_max_group");
    maxGroup ||
      ((maxGroup = document.createElement("div")),
      (maxGroup.id = "current_uv_max_group"),
      (maxGroup.className = "current_uv_max_group_Class"),
      (maxGroup.innerHTML =
        '<span class="current_uv_max_title_Class">Today’s max</span> <span id="current_uv_max" class="current_uv_max_Class"></span>'),
      uvGroup.parentNode.insertBefore(maxGroup, uvGroup));
    const maxValue = document.getElementById("current_uv_max");
    maxValue && (maxValue.textContent = Number(maxUvIndex).toFixed(1));
  }
  applyUvIconState(uvIndex);
};
