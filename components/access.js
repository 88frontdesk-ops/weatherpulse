/* WeatherPulse local access layer.
 * The former account and subscription service has been removed.
 * All WeatherPulse features are available locally; no account or payment
 * service is consulted to decide feature access.
 */
(() => {
  const enableFullAccess = () => chrome.storage.local.set({
    weatherpulseFullAccess: true,
    selectedLocationMax: 8
  });

  globalThis.basicUser = undefined;
  globalThis.proUser = undefined;
  globalThis.vipPage = () => {};
  enableFullAccess();
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".hide_pro").forEach((el) => { el.style.display = "none"; });
  });
})();
