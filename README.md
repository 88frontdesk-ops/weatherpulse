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


Local weather backgrounds: `data/backgrounds.json`. Backgrounds are fully local and require no remote image service. Each weather condition has separate day/night pools with two images to start; add more files to `images/background/` and list them in the corresponding pool in `data/backgrounds.json`.



## Local background images

- Location: `images/background/`
- Configuration: `data/backgrounds.json`
- Current set: 32 images (2 per condition/day-night pool).
- Filenames do not have to follow a special naming rule. The filename only needs to match the path listed in `data/backgrounds.json`.
- Recommended naming: `<condition>-<day|night>-<number>.jpg`, for example `rain-night-03.jpg`.
- To add another image, copy it into `images/background/` and add its relative path to the appropriate array in `data/backgrounds.json`.
- The selector avoids immediately repeating the previously displayed image when a pool has more than one image.


## Local weather backgrounds
Each weather/day-night pool contains four local images. The selector uses the current weather condition plus the current `daylight` state; missing `daylight` now falls back to the current global daylight state instead of being treated as night. Rain-day backgrounds were replaced with brighter daytime rain scenes.
