// Legacy external update/news feed removed. WeatherPulse does not contact an external update service.
const adCard = () => {
  if (typeof cardUpdate !== "undefined" && cardUpdate) cardUpdate.style.display = "none";
};
