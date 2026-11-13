const searchMap = async () => {
  const container = document.getElementById("geocoder");
  if (!container) return;
  container.innerHTML = `
    <input id="weatherpulse_location_search" class="location_search_input" type="search" autocomplete="off" spellcheck="false" placeholder="Search city or ZIP code">
    <div id="weatherpulse_location_results" class="location_search_results" role="listbox"></div>
    <div id="weatherpulse_location_status" class="location_search_status" aria-live="polite"></div>
  `;
  const input = document.getElementById("weatherpulse_location_search");
  const results = document.getElementById("weatherpulse_location_results");
  const status = document.getElementById("weatherpulse_location_status");
  let timer = null,
    requestId = 0;
  const clearResults = () => {
    results.innerHTML = "";
  };
  const setStatus = (text) => {
    if (status) status.textContent = text || "";
  };
  const getLocationName = (item, query) => {
    const zipCode = query.match(/^\d{5}(?:-\d{4})?$/)?.[0].slice(0, 5);
    if (
      item.country_code === "US" &&
      zipCode &&
      item.admin2 &&
      item.postcodes?.includes(zipCode)
    )
      return `${item.admin2} County`;
    return item.name || item.admin2 || item.admin1 || "Selected location";
  };
  const selectLocation = (item, query) => {
    const latitude = Number(item.latitude),
      longitude = Number(item.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    const selectedCountry =
      String(item.country_code || "").toUpperCase() || "US";
    const selectedCity = getLocationName(item, query);
    const selectedTimezone = item.timezone || tzlookup(latitude, longitude);
    latlong = `${latitude},${longitude}`;
    citys = selectedCity;
    country = selectedCountry;
    timezone = selectedTimezone;
    chrome.storage.local.set(
      { latlong, citys, country, timezone, selectedLocationUpdated: 1 },
      () => {
        selectedLocations(selectedLocation);
        clearResults();
        input.value = `${selectedCity}${selectedCountry ? `, ${selectedCountry}` : ""}`;
        setStatus("Location added");
      },
    );
  };
  const renderResults = (items, query) => {
    clearResults();
    items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "location_search_result";
      row.setAttribute("role", "option");
      const locationName = getLocationName(item, query);
      row.textContent = [locationName, item.admin1, item.country]
        .filter(Boolean)
        .join(", ");
      row.addEventListener("mousedown", (event) => {
        event.preventDefault();
        selectLocation(item, query);
      });
      results.appendChild(row);
    });
  };
  const search = async () => {
    const query = input.value.trim();
    clearResults();
    if (query.length < 2) {
      setStatus("");
      return;
    }
    const currentRequest = ++requestId;
    setStatus("Searching…");
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`Geocoding failed: ${response.status}`);
      const data = await response.json();
      if (currentRequest !== requestId) return;
      const items = Array.isArray(data.results) ? data.results : [];
      renderResults(items, query);
      setStatus(items.length ? "" : "No locations found");
    } catch (error) {
      if (currentRequest !== requestId) return;
      setStatus("Location search is unavailable. Please try again.");
      console.error("Open-Meteo location search failed", error);
    }
  };
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(search, 250);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      clearTimeout(timer);
      search();
    }
    if (event.key === "Escape") {
      clearResults();
      setStatus("");
      input.blur();
    }
  });
  input.focus();
};
