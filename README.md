# Weather Pulse

Weather Pulse displays current conditions, hourly and daily forecasts, UV information, air quality, astronomical times, historical weather information, and weather alerts.

## Data providers and API verification

Weather Pulse uses the following external APIs for weather/location data:

- **Open-Meteo Geocoding API** — location and ZIP/postal-code search.
- **Open-Meteo Forecast API** — current weather, hourly forecast, daily forecast, UV, precipitation, wind, visibility, and related weather data.
- **Open-Meteo Air Quality API** — US AQI and pollutant data.
- **Open-Meteo Archive API** — historical/previous-day weather data.
- **National Weather Service (NWS)** — U.S. forecast details and active weather alerts.
- **Browser Geolocation** — used only when Weather Pulse needs an initial current location and the user grants location permission. No IP-geolocation service is used.

The links below are provided so the API responses can be opened directly in a browser and compared with the values displayed in the Weather Pulse UI.

## Example location: ZIP code 10013

For API verification, Weather Pulse's Network request for the 10013 example uses these coordinates:

- Latitude: `40.713`
- Longitude: `-74.0072`
- Time zone: `America/New_York`

**Important:** These are the coordinates actually used by the extension's API request. They should not be replaced with a different geocoded coordinate pair when comparing the API response with the Weather Pulse UI.

### 1. Open-Meteo Geocoding — ZIP/location search

Weather Pulse uses the Open-Meteo Geocoding API when searching for a location.

Example search for ZIP code 10013:

https://geocoding-api.open-meteo.com/v1/search?name=10013&count=8&language=en&format=json

This response contains the location information used to select a location, including latitude, longitude, name, country, and time zone when available.

### 2. Open-Meteo Forecast — Current, Hourly, and Daily

This is the **exact Open-Meteo forecast request used by Weather Pulse for the 10013 example**:

https://api.open-meteo.com/v1/forecast?latitude=40.713&longitude=-74.0072&timezone=America%2FNew_York&wind_speed_unit=kmh&forecast_days=10&forecast_hours=240&current=temperature_2m%2Cdew_point_2m%2Crelative_humidity_2m%2Capparent_temperature%2Cprecipitation%2Crain%2Cshowers%2Csnowfall%2Cweather_code%2Ccloud_cover%2Cpressure_msl%2Cwind_speed_10m%2Cwind_gusts_10m%2Cwind_direction_10m%2Cvisibility%2Cuv_index%2Cis_day&hourly=temperature_2m%2Crelative_humidity_2m%2Cprecipitation%2Cprecipitation_probability%2Crain%2Cshowers%2Csnowfall%2Cweather_code%2Ccloud_cover%2Cwind_speed_10m%2Cwind_gusts_10m%2Cwind_direction_10m%2Cuv_index%2Cis_day&daily=weather_code%2Ctemperature_2m_max%2Ctemperature_2m_min%2Cprecipitation_sum%2Cprecipitation_probability_max%2Cuv_index_max%2Csunrise%2Csunset%2Cwind_speed_10m_max%2Cwind_gusts_10m_max%2Cwind_direction_10m_dominant%2Cmoonrise%2Cmoonset

The response is divided into three main sections:

- `current` — values used for current conditions and related UI fields.
- `hourly` — values used by the Hourly forecast and hourly weather calculations.
- `daily` — values used by the Daily forecast, UV, sunrise/sunset, wind, and moon information.

### Current fields requested

- `temperature_2m`
- `dew_point_2m`
- `relative_humidity_2m`
- `apparent_temperature`
- `precipitation`
- `rain`
- `showers`
- `snowfall`
- `weather_code`
- `cloud_cover`
- `pressure_msl`
- `wind_speed_10m`
- `wind_gusts_10m`
- `wind_direction_10m`
- `visibility`
- `uv_index`
- `is_day`

### Hourly fields requested

- `temperature_2m`
- `relative_humidity_2m`
- `precipitation`
- `precipitation_probability`
- `rain`
- `showers`
- `snowfall`
- `weather_code`
- `cloud_cover`
- `wind_speed_10m`
- `wind_gusts_10m`
- `wind_direction_10m`
- `uv_index`
- `is_day`

### Daily fields requested

- `weather_code`
- `temperature_2m_max`
- `temperature_2m_min`
- `precipitation_sum`
- `precipitation_probability_max`
- `uv_index_max`
- `sunrise`
- `sunset`
- `wind_speed_10m_max`
- `wind_gusts_10m_max`
- `wind_direction_10m_dominant`
- `moonrise`
- `moonset`

## 3. Open-Meteo Air Quality — AQI and pollutants

Weather Pulse uses the Open-Meteo Air Quality API for the AQI section.

Example for the same 10013 coordinates:

https://air-quality-api.open-meteo.com/v1/air-quality?latitude=40.713&longitude=-74.0072&timezone=auto&current=us_aqi%2Cpm2_5%2Cpm10%2Cozone%2Cnitrogen_dioxide%2Csulphur_dioxide%2Ccarbon_monoxide&hourly=us_aqi%2Cpm2_5%2Cpm10%2Cozone%2Cnitrogen_dioxide%2Csulphur_dioxide%2Ccarbon_monoxide&forecast_days=2

Current AQI and pollutant values are read from the `current` object. Hourly values are supplied by the `hourly` object.

The requested pollutants are:

- `pm2_5` — PM2.5
- `pm10` — PM10
- `ozone` — O₃
- `nitrogen_dioxide` — NO₂
- `sulphur_dioxide` — SO₂
- `carbon_monoxide` — CO
- `us_aqi` — U.S. AQI

## 4. Open-Meteo Archive — Historical / Previous Day

Weather Pulse uses the Open-Meteo Archive API for historical weather data, including the Previous 24 Hours / previous-day views.

The date is supplied dynamically by the extension. For example, to inspect October 6, 2026 for the 10013 coordinates, open:

https://archive-api.open-meteo.com/v1/archive?latitude=40.713&longitude=-74.0072&start_date=2026-10-06&end_date=2026-10-06&timezone=America%2FNew_York&wind_speed_unit=kmh&hourly=temperature_2m%2Cdew_point_2m%2Crelative_humidity_2m%2Capparent_temperature%2Cprecipitation%2Cweather_code%2Ccloud_cover%2Cpressure_msl%2Cwind_speed_10m%2Cwind_gusts_10m%2Cwind_direction_10m%2Cvisibility%2Cuv_index&daily=temperature_2m_max%2Ctemperature_2m_min%2Cwind_speed_10m_max%2Cwind_gusts_10m_max%2Cuv_index_max%2Cweather_code

Change `start_date` and `end_date` to the date being inspected.

## 5. National Weather Service — Location / Forecast Grid

For U.S. locations, Weather Pulse queries NWS using the selected latitude and longitude.

10013 example:

https://api.weather.gov/points/40.713,-74.0072

The response contains the NWS forecast-grid information. Weather Pulse then follows the `properties.forecast` URL returned by this request to obtain the detailed NWS forecast periods.

NWS forecast periods can provide information such as:

- `name`
- `startTime`
- `endTime`
- `isDaytime`
- `temperature`
- `temperatureUnit`
- `windSpeed`
- `windDirection`
- `shortForecast`
- `detailedForecast`
- `probabilityOfPrecipitation`

Weather Pulse uses NWS detailed forecast text to supplement the Daily forecast information.

## 6. National Weather Service — Active Alerts

Weather Pulse checks the NWS active-alert endpoint for the selected coordinates.

10013 example:

https://api.weather.gov/alerts/active?point=40.713,-74.0072

If there are no active alerts, the response contains an empty `features` array.

When alerts are present, Weather Pulse can use information including:

- Alert event
- Sender
- Effective time
- Expiration time
- Severity
- Urgency
- Affected area
- Alert details URL

## API summary

| Weather Pulse feature | API | Main data |
|---|---|---|
| Location / ZIP search | Open-Meteo Geocoding | Location, latitude, longitude, time zone |
| Current weather | Open-Meteo Forecast | Temperature, feels-like, humidity, pressure, precipitation, condition, wind, visibility, UV |
| Hourly forecast | Open-Meteo Forecast | Hourly temperature, precipitation, probability, conditions, wind, UV |
| Daily forecast | Open-Meteo Forecast | High/low, precipitation, probability, UV, sunrise/sunset, wind, moonrise/moonset |
| Air quality | Open-Meteo Air Quality | U.S. AQI and pollutants |
| Historical / Previous 24 Hours | Open-Meteo Archive | Historical hourly/daily weather |
| U.S. forecast details | National Weather Service | Detailed day/night forecast text and forecast periods |
| U.S. alerts | National Weather Service | Active weather alerts |

## Weather condition codes

Weather Pulse uses Open-Meteo WMO weather codes for weather-condition interpretation.

- `0` — Clear sky
- `1` — Mainly clear
- `2` — Partly cloudy
- `3` — Cloudy
- `45` — Fog
- `48` — Depositing rime fog
- `51` — Light drizzle
- `53` — Moderate drizzle
- `55` — Dense drizzle
- `61` — Slight rain
- `63` — Moderate rain
- `65` — Heavy rain
- `71` — Slight snow fall
- `73` — Moderate snow fall
- `75` — Heavy snow fall
- `80` — Slight rain showers
- `81` — Moderate rain showers
- `82` — Violent rain showers
- `85` — Slight snow showers
- `86` — Heavy snow showers
- `95` — Thunderstorm
- `96` — Thunderstorm with slight hail
- `97` — Heavy thunderstorm
- `99` — Thunderstorm with heavy hail

### Weather Pulse Windy condition

Open-Meteo does not provide a standalone WMO `windy` condition. Weather Pulse derives `windy` when the wind speed is at least **36 km/h (approximately 22 mph)** and the WMO condition is clear/cloudy (`0`, `1`, `2`, or `3`). Precipitation, fog, and snow conditions take precedence.

## Data-source policy

Weather Pulse weather data is provided by Open-Meteo and, for U.S. forecast/alert information, the National Weather Service. Legacy UVW/UVWeather weather APIs are not required by the extension.
