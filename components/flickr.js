const bgLocal = (iconName, daylight) => {
    switch (iconName) {
      case "clear-day":
        imageBackground.style.backgroundImage = daylight
          ? 'url("images/background/clear-day.jpg")'
          : 'url("images/background/clear-night.jpg")';
        break;
      case "clear-night":
        imageBackground.style.backgroundImage =
          'url("images/background/clear-night.jpg")';
        break;
      case "rain":
        imageBackground.style.backgroundImage = daylight
          ? 'url("images/background/rain-day.jpg")'
          : 'url("images/background/rain-night.jpg")';
        break;
      case "snow":
        imageBackground.style.backgroundImage = daylight
          ? 'url("images/background/snow-day.jpg")'
          : 'url("images/background/snow-night.jpg")';
        break;
      case "sleet":
        imageBackground.style.backgroundImage = daylight
          ? 'url("images/background/sleet-day.jpg")'
          : 'url("images/background/sleet-night.jpg")';
        break;
      case "wind":
        imageBackground.style.backgroundImage = daylight
          ? 'url("images/background/wind-day.jpg")'
          : 'url("images/background/wind-night.jpg")';
        break;
      case "fog":
        imageBackground.style.backgroundImage = daylight
          ? 'url("images/background/fog-day.jpg")'
          : 'url("images/background/fog-night.jpg")';
        break;
      case "cloudy":
        imageBackground.style.backgroundImage = daylight
          ? 'url("images/background/cloudy-day.jpg")'
          : 'url("images/background/cloudy-night.jpg")';
        break;
      case "partly-cloudy-day":
        imageBackground.style.backgroundImage = daylight
          ? 'url("images/background/partly-cloudy-day.jpg")'
          : 'url("images/background/partly-cloudy-night.jpg")';
        break;
      case "partly-cloudy-night":
        imageBackground.style.backgroundImage =
          'url("images/background/partly-cloudy-night.jpg")';
        break;
      default:
        imageBackground.style.backgroundImage =
          'url("images/background/default.png")';
    }
    photo_credit_flickr.style.visibility = "hidden";
  },
  bgFlickr = async (iconName) => {
    try {
      const response = await fetch("data/flickr-backgrounds.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Local Flickr manifest unavailable");
      const manifest = await response.json();
      // The weather icon resolver uses base names such as "rain", while the
      // local manifest stores separate day/night pools ("rain-day", "rain-night").
      // Normalize the key here so callers do not need to know the manifest format.
      const baseIcon = typeof iconName === "string" ? iconName : "clear-day";
      const normalizedIcon = baseIcon.endsWith("-day") || baseIcon.endsWith("-night")
        ? baseIcon
        : `${baseIcon}-${daylight ? "day" : "night"}`;
      const urls = Array.isArray(manifest.entries?.[normalizedIcon])
        ? [...manifest.entries[normalizedIcon]]
        : [];
      if (!urls.length) throw new Error(`No Flickr background URLs for condition: ${normalizedIcon}`);
      const previous = imageBackground.dataset.flickrUrl || "";
      if (urls.length > 1 && previous) {
        const filtered = urls.filter((url) => url !== previous);
        if (filtered.length) urls.splice(0, urls.length, ...filtered);
      }
      const url = urls[Math.floor(Math.random() * urls.length)];
      imageBackground.dataset.flickrUrl = url;
      imageBackground.style.backgroundImage = `url("${url}")`;
      const credit = document.getElementById("photo_credit");
      const photoInfo = manifest.photoInfo?.[url];
      if (credit) {
        credit.href = photoInfo?.photoUrl || "https://www.flickr.com/creativecommons/";
        if (photoInfo?.photographer) {
          credit.textContent = `Photo: ${photoInfo.photographer}`;
        }
        credit.title = photoInfo
          ? `${photoInfo.photographer} — ${photoInfo.license}`
          : "Flickr Creative Commons";
      }
      photo_credit_flickr.style.visibility = homeSub.classList.contains("sub_menu_current_Class") ? "visible" : "hidden";
    } catch (error) {
      console.warn("Local Flickr background selection failed; using bundled background.", error);
      bgLocal(iconName, daylight);
    }
  };
