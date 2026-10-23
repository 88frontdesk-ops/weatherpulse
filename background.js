if (!self.document) {
  try {
    importScripts(
      "./libraries/tz.js",
      "./libraries/moment.js",
      "./libraries/moment-timezone-with-data-10-year-range.min.js",
      "./components/util.js",
      "./libraries/suncalc.js",
      "./components/nwsAdapter.js",
      "./components/weatherCast.js",
    );

    const setLocationDefaults = (location) => {
      chrome.storage.local.set(
        {
          timezone: location.timezone,
          citys: location.citys,
          latlong: location.latlong,
          country: location.country,
          ipCountry: location.country,
          verUpdate: 1,
          badgeSize: "0",
          whiteIcon: "1",
          setSettingFC: "c",
          theme: "dark",
          animatedIcon: "1",
          IntervalUpdate: "5",
          WeatherCacheMinutes: "5",
          badgeAlert: true,
        },
        () => badgeTempUV(location.latlong, location.country, location.timezone),
      );
    };

    const defaultCity = () =>
      setLocationDefaults({
        citys: "New York",
        latlong: "40.713,-74.0072",
        timezone: "America/New_York",
        country: "US",
      });

    let locationInitializationStarted = false;
    let creatingOffscreenDocument;

    const ensureOffscreenDocument = async () => {
      const offscreenUrl = chrome.runtime.getURL("offscreen.html");
      const openClients = await clients.matchAll();
      if (openClients.some((client) => client.url === offscreenUrl)) return;
      if (creatingOffscreenDocument) return creatingOffscreenDocument;

      creatingOffscreenDocument = chrome.offscreen.createDocument({
        url: "offscreen.html",
        reasons: [
          chrome.offscreen.Reason.GEOLOCATION ||
            chrome.offscreen.Reason.DOM_SCRAPING,
        ],
        justification:
          "Get the current location to show local weather on first install.",
      });
      try {
        await creatingOffscreenDocument;
      } finally {
        creatingOffscreenDocument = undefined;
      }
    };

    const getCurrentLocation = async () => {
      await ensureOffscreenDocument();
      try {
        return await new Promise((resolve) => {
          chrome.runtime.sendMessage(
            { target: "offscreen", type: "get-geolocation" },
            (response) => {
              if (chrome.runtime.lastError || !response?.ok) {
                resolve(null);
                return;
              }
              resolve(response);
            },
          );
        });
      } finally {
        const offscreenUrl = chrome.runtime.getURL("offscreen.html");
        const openClients = await clients.matchAll();
        if (openClients.some((client) => client.url === offscreenUrl))
          await chrome.offscreen.closeDocument().catch(() => {});
      }
    };

    const initializeLocation = () => {
      if (locationInitializationStarted) return;
      locationInitializationStarted = true;
      chrome.storage.local.get(["verUpdate", "latlong", "citys"], (data) => {
        const hasExistingLocation =
          [1, 2].includes(data.verUpdate) && data.latlong;
        const savedCity =
          typeof data.citys === "string" ? data.citys.trim().toLowerCase() : "";
        const needsCityName =
          !savedCity ||
          ["current location", "current condition"].includes(savedCity);
        if (hasExistingLocation && !needsCityName) return;
        getCurrentLocation()
          .then((location) => {
            if (!location) {
              if (!hasExistingLocation) defaultCity();
              return;
            }
            const latitude = location.latitude;
            const longitude = location.longitude;
            const timezone = tzlookup(latitude, longitude);
            const resolvedLocation = {
              citys: location.city || location.locality || "Current location",
              latlong: `${latitude},${longitude}`,
              timezone,
              country: location.country || "",
            };
            if (hasExistingLocation) {
              chrome.storage.local.set(resolvedLocation, () =>
                badgeTempUV(
                  resolvedLocation.latlong,
                  resolvedLocation.country,
                  resolvedLocation.timezone,
                ),
              );
            } else {
              setLocationDefaults(resolvedLocation);
            }
          })
          .catch(() => {
            if (!hasExistingLocation) defaultCity();
          });
      });
    };

    const badgeTempUV = (latlong, country, timezone) => {
      if (!latlong || !timezone) return;
      timeZoneBadge = getTimezoneOffset(timezone);
      weCast(latlong, country, timezone);
    };

    const intervalUpdate = () => {
      chrome.storage.local.get("IntervalUpdate", (data) => {
        const interval = parseInt(data.IntervalUpdate, 10) || 5;
        if (!data.IntervalUpdate)
          chrome.storage.local.set({ IntervalUpdate: "5" });
        chrome.alarms.create("intervalUpdateTimes", {
          delayInMinutes: 0.05,
          periodInMinutes: Math.max(5, interval),
        });
      });
    };

    chrome.storage.local.get(["verUpdate", "latlong", "citys"], (data) => {
      if (
        ![1, 2].includes(data.verUpdate) ||
        !data.latlong ||
        !data.citys ||
        ["current location", "current condition"].includes(
          typeof data.citys === "string" ? data.citys.trim().toLowerCase() : "",
        )
      )
        initializeLocation();
      else {
        chrome.storage.local.get(
          ["latlong", "country", "timezone"],
          (location) => {
            badgeTempUV(location.latlong, location.country, location.timezone);
          },
        );
      }
      intervalUpdate();
    });

    chrome.runtime.onStartup.addListener(() => {
      chrome.storage.local.get(["latlong", "country", "timezone"], (data) => {
        badgeTempUV(data.latlong, data.country, data.timezone);
      });
    });

    chrome.runtime.onInstalled.addListener((details) => {
      chrome.storage.local.remove("badgeDataSource");
      if (details.reason === "install") {
        chrome.storage.local.set({
          setSettingFC: "c",
          TimeFormat: "12h",
          IntervalUpdate: "5",
          WeatherCacheMinutes: "5",
        });
        initializeLocation();
      } else if (details.reason === "update") {
        chrome.storage.local.get(["latlong", "country"], (data) => {
          if (!data.latlong) return initializeLocation();
          const [lat, lng] = data.latlong.split(",");
          const timezone = tzlookup(lat, lng);
          chrome.storage.local.set({ timezone });
          badgeTempUV(data.latlong, data.country, timezone);
        });
      }
    });

    chrome.runtime.onMessage.addListener((request, sender) => {
      if (sender.id !== chrome.runtime.id) return;
      if (request.msg === "intervalUpdateMessage") intervalUpdate();
    });

    chrome.idle.setDetectionInterval(900);
    chrome.idle.onStateChanged.addListener((state) => {
      if (state !== "active") return;
      chrome.storage.local.get(["latlong", "country", "timezone"], (data) => {
        badgeTempUV(data.latlong, data.country, data.timezone);
      });
    });

    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name !== "intervalUpdateTimes") return;
      chrome.storage.local.get(["latlong", "country", "timezone"], (data) => {
        badgeTempUV(data.latlong, data.country, data.timezone);
      });
    });
  } catch (e) {
    console.error("Weather Pulse background initialization failed", e);
  }
}
