const reverseGeocode = async (latitude, longitude) => {
  const url = new URL("https://api.bigdatacloud.net/data/reverse-geocode-client");
  url.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    localityLanguage: "en",
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return {};
    const place = await response.json();
    return {
      city: place.locality || place.city || "",
      country: place.countryCode || "",
    };
  } catch {
    return {};
  } finally {
    clearTimeout(timeout);
  }
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.target !== "offscreen" || message.type !== "get-geolocation")
    return;

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      const place = await reverseGeocode(latitude, longitude);
      sendResponse({ ok: true, latitude, longitude, ...place });
    },
    () => sendResponse({ ok: false }),
    { enableHighAccuracy: false, maximumAge: 300000, timeout: 10000 },
  );
  return true;
});
