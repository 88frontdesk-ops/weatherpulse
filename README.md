# Weather Pulse

Weather Pulse displays current conditions, hourly and daily forecasts, UV information, astronomical times, and weather alerts.

## Data providers

- **Open-Meteo** — current weather, hourly forecast, daily forecast, UV, precipitation, wind, visibility, and related weather data.
- **National Weather Service (NWS)** — active weather alerts for U.S. locations.
- **Browser Geolocation** — used only when Weather Pulse needs an initial current location and the user grants location permission. No IP-geolocation service is used.



## Colorful icons / UV / Windy update
- Hourly and Outlook weather icons use the colorful `c_*.svg` family.
- UV protection icons are tinted by UV category; UV 1-2 are active Low-UV icons rather than greyed-out icons.
- Open-Meteo clear/cloudy conditions are derived as `windy` when sustained wind is at least 10 m/s (about 22 mph / 36 km/h), with precipitation/fog/snow conditions taking precedence.
- The existing Badge and Current icon systems remain intact.
