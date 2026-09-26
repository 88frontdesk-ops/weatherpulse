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
  bgFlickr = (iconName) => {
    switch (iconName) {
      case "clear-day":
        daylight
          ? (galleryID = "72157711948824252")
          : (galleryID = "72157711948534226");
        break;
      case "clear-night":
        galleryID = "72157711948534226";
        break;
      case "rain":
        daylight
          ? (galleryID = "72157711948916072")
          : (galleryID = "72157711948918142");
        break;
      case "snow":
        daylight
          ? (galleryID = "72157711948582321")
          : (galleryID = "72157711948925407");
        break;
      case "sleet":
        daylight
          ? (galleryID = "72157711948578771")
          : (galleryID = "72157711948921797");
        break;
      case "wind":
        daylight
          ? (galleryID = "72157711950448603")
          : (galleryID = "72157711948587066");
        break;
      case "fog":
        daylight
          ? (galleryID = "72157711948567181")
          : (galleryID = "72157711950432483");
        break;
      case "cloudy":
        daylight
          ? (galleryID = "72157711950426443")
          : (galleryID = "72157711948906242");
        break;
      case "partly-cloudy-day":
        daylight
          ? (galleryID = "72157711950434293")
          : (galleryID = "72157711948913902");
        break;
      case "partly-cloudy-night":
        galleryID = "72157711948913902";
        break;
      default:
        galleryID = "72157711948824252";
    }
    // Use Flickr's public photo feed directly. The old relative proxy URL
    // returned popup.html (HTML), which caused JSON parse errors.
    const tagMap = {
      "clear-day": "sunny,clear-sky,weather",
      "clear-night": "night-sky,stars,weather",
      "rain": "rain,storm,weather",
      "snow": "snow,winter,weather",
      "sleet": "sleet,freezing-rain,weather",
      "wind": "wind,windy,weather",
      "fog": "fog,mist,weather",
      "cloudy": "cloudy,overcast,weather",
      "partly-cloudy-day": "partly-cloudy,clouds,weather",
      "partly-cloudy-night": "night-clouds,weather"
    };
    const tags = encodeURIComponent(tagMap[iconName] || "weather,sky");
    const f_url = `https://www.flickr.com/services/feeds/photos_public.gne?tags=${tags}&tagmode=all&format=json&nojsoncallback=1`;
    new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Request timed out")), 5000);
      fetch(f_url, { method: "GET", headers: { Accept: "application/json" } })
        .then((response) => {
          if (!response.ok) throw new Error(`Flickr request failed: ${response.status}`);
          return response.json();
        })
        .then((feed) => {
          clearTimeout(timeout);
          const items = Array.isArray(feed.items) ? feed.items : [];
          if (!items.length) throw new Error("No Flickr photos found");
          const photoData = items[Math.floor(Math.random() * items.length)];
          const url_c = photoData?.media?.m;
          const flickrID = photoData?.link?.match(/\/photos\/[^/]+\/(\d+)/)?.[1];
          const owner = photoData?.author_id;
          if (!url_c || !flickrID || !owner) throw new Error("Required Flickr photo information missing");
          resolve({ flickrID, owner, url_c, link: photoData.link });
        })
        .catch((error) => { clearTimeout(timeout); reject(error); });
    })
      .then((data) => {
        imageBackground.style.backgroundImage = `url("${data.url_c}")`;
        document.getElementById("photo_credit").href = data.link || `https://www.flickr.com/photos/${data.owner}/${data.flickrID}/`;
        photo_credit_flickr.style.visibility = homeSub.classList.contains("sub_menu_current_Class") ? "visible" : "hidden";
      })
      .catch(() => bgLocal(iconName, daylight));
  };
