const normalizeBackgroundCondition = (conditionName) => {
  const condition = String(conditionName || "").toLowerCase().trim();

  // Preserve unknown conditions instead of incorrectly animating them as clear.
  if (!condition || condition === "unknown" || condition.includes("unknown code"))
    return "unknown";

  if (condition === "clear" || condition === "mostlyclear" || condition.startsWith("clear-"))
    return "clear";
  if (
    condition === "partlycloudy" ||
    condition === "partly-cloudy" ||
    condition.startsWith("partly-cloudy-") ||
    condition.includes("partly cloudy")
  )
    return "partly-cloudy";

  // Thunderstorms must remain distinct from ordinary rain so they can add lightning.
  if (condition.includes("thunder") || condition.includes("storm"))
    return "thunderstorms";
  if (
    condition.includes("shower") ||
    condition.includes("drizzle") ||
    condition.includes("rain")
  )
    return "rain";
  if (condition.includes("sleet") || condition.includes("wintrymix"))
    return "sleet";
  if (condition.includes("snow") || condition.includes("flurr") || condition.includes("blizzard"))
    return "snow";
  if (condition.includes("wind") || condition.includes("breezy"))
    return "wind";
  if (
    condition.includes("fog") ||
    condition.includes("haze") ||
    condition.includes("smoky") ||
    condition.includes("blowingdust")
  )
    return "fog";
  if (condition.includes("cloud") || condition === "mostlycloudy")
    return "cloudy";

  return "unknown";
};
globalThis.weatherpulseNormalizeBackgroundCondition = normalizeBackgroundCondition;

// WeatherPulse animated foreground layer. The existing background image remains untouched.
let weatherBackgroundAnimationFrame = 0;
let weatherBackgroundAnimationCanvas = null;
let weatherBackgroundAnimationContext = null;
let weatherBackgroundAnimationLastTime = 0;
let weatherBackgroundParticles = [];
let weatherBackgroundSplashes = [];
let weatherBackgroundAnimationCondition = "none";
let weatherBackgroundAnimationDaylight = true;
let weatherBackgroundThunderstormOffset = Math.random() * 9000;

const stopWeatherBackgroundAnimation = () => {
  if (weatherBackgroundAnimationFrame)
    cancelAnimationFrame(weatherBackgroundAnimationFrame);
  weatherBackgroundAnimationFrame = 0;
  if (weatherBackgroundAnimationContext && weatherBackgroundAnimationCanvas) {
    weatherBackgroundAnimationContext.clearRect(
      0,
      0,
      weatherBackgroundAnimationCanvas.width,
      weatherBackgroundAnimationCanvas.height,
    );
  }
};

const startWeatherBackgroundAnimation = (iconName, isDaylight) => {
  const host = document.getElementById("image_background");
  if (!host) return;
  const condition = normalizeBackgroundCondition(iconName);
  weatherBackgroundAnimationCondition = condition;
  weatherBackgroundAnimationDaylight = !!isDaylight;
  if (
    host.classList.contains("hidden") ||
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  ) {
    stopWeatherBackgroundAnimation();
    return;
  }

  if (
    !weatherBackgroundAnimationCanvas ||
    !weatherBackgroundAnimationCanvas.isConnected
  ) {
    weatherBackgroundAnimationCanvas = document.createElement("canvas");
    weatherBackgroundAnimationCanvas.className = "weather-background-animation";
    weatherBackgroundAnimationCanvas.setAttribute("aria-hidden", "true");
    weatherBackgroundAnimationCanvas.width = 800;
    weatherBackgroundAnimationCanvas.height = 600;
    host.insertBefore(weatherBackgroundAnimationCanvas, host.firstChild);
    weatherBackgroundAnimationContext =
      weatherBackgroundAnimationCanvas.getContext("2d");
  }
  stopWeatherBackgroundAnimation();
  if (!weatherBackgroundAnimationContext) return;
  // Unknown is an intentional static-background state; do not run an empty RAF loop.
  if (condition === "unknown") return;

  // Layered particles are intentionally subtle and never alter the source photograph.
  const count =
    condition === "snow"
      ? 105
      : condition === "rain" || condition === "sleet" || condition === "thunderstorms"
        ? 330
        : condition === "wind"
          ? 34
          : condition === "fog"
            ? 15
            : condition === "clear"
              ? 96
              : condition === "partly-cloudy"
                ? 9
                : condition === "cloudy"
                  ? 14
                  : 0;
  weatherBackgroundSplashes = [];
  weatherBackgroundParticles = Array.from({ length: count }, () => ({
    x: Math.random() * 800,
    y: Math.random() * 600,
    size:
      condition === "snow"
        ? 0.7 + Math.random() * 2.8
        : condition === "rain" || condition === "sleet" || condition === "thunderstorms"
          ? 1.15 + Math.random() * 2.0
          : condition === "wind"
            ? 0.5 + Math.random() * 0.8
            : condition === "fog"
              ? 0.15 + Math.random() * 0.3
              : 0.6 + Math.random() * 1.5,
    speed:
      condition === "thunderstorms"
        ? 3.0 + Math.random() * 3.0
        : condition === "rain"
          ? 2.0 + Math.random() * 2.4
          : condition === "sleet"
            ? 2.4 + Math.random() * 2.8
            : condition === "snow"
          ? 0.55 + Math.random() * 1.8
          : condition === "wind"
            ? 1.2 + Math.random() * 1.7
            : condition === "fog"
              ? 0.18 + Math.random() * 0.3
              : 0.2 + Math.random() * 0.5,
    drift:
      (Math.random() - 0.5) *
      (condition === "thunderstorms" ? 4.8 : condition === "sleet" ? 2.7 : condition === "wind" ? 1.2 : condition === "snow" ? 1.6 : 0.8),
    length:
      condition === "thunderstorms" ? 18 + Math.random() * 24 :
      condition === "sleet" ? 5 + Math.random() * 7 :
      condition === "rain" ? 10 + Math.random() * 16 : 7 + Math.random() * 12,
    alpha: condition === "thunderstorms" ? 0.35 + Math.random() * 0.4 : 0.15 + Math.random() * 0.35,
    phase: Math.random() * Math.PI * 2,
    radius: 120 + Math.random() * 230,
    layer: Math.random(),
    sparkle: Math.random(),
  }));
  weatherBackgroundAnimationLastTime = 0;

  const draw = (time) => {
    weatherBackgroundAnimationFrame = 0;
    if (
      !weatherBackgroundAnimationCanvas?.isConnected ||
      host.classList.contains("hidden")
    )
      return;
    // Keep animations paused when the popup is in the background.
    if (document.visibilityState === "hidden") {
      weatherBackgroundAnimationFrame = requestAnimationFrame(draw);
      return;
    }
    const ctx = weatherBackgroundAnimationContext;
    const dt = weatherBackgroundAnimationLastTime
      ? Math.min(2, (time - weatherBackgroundAnimationLastTime) / 16.67)
      : 1;
    weatherBackgroundAnimationLastTime = time;
    ctx.clearRect(0, 0, 800, 600);

    if (condition === "rain" || condition === "sleet" || condition === "thunderstorms") {
      // Rain uses longer drops; sleet uses short, bright, angled ice pellets;
      // thunderstorms use dense, fast rain pushed sideways by gusts.
      const isSleet = condition === "sleet";
      const isStorm = condition === "thunderstorms";
      for (const p of weatherBackgroundParticles) {
        const foreground = p.size > 1.25;
        const alpha = p.alpha * (isStorm ? 1.0 : foreground ? 0.9 : 0.62);
        ctx.lineCap = "round";
        ctx.lineWidth = isSleet ? (foreground ? 2.1 : 1.4) : isStorm ? (foreground ? 1.8 : 1.0) : (foreground ? 1.35 : 0.75);

        const endX = p.x - (isStorm ? 5 + p.drift : isSleet ? 6 + p.drift : 2.2 + p.drift);
        const endY = p.y + p.length * (isSleet ? 0.45 : foreground ? 1 : 0.75);

        // Create a gradient along the drop's path for a natural fade
        const rainGradient = ctx.createLinearGradient(p.x, p.y, endX, endY);
        const rgb = isSleet ? (foreground ? "245,253,255" : "194,224,244") : (foreground ? "225,241,255" : "188,218,242");
        rainGradient.addColorStop(0, `rgba(${rgb}, 0)`); // Faded tail
        rainGradient.addColorStop(1, `rgba(${rgb}, ${alpha})`); // Sharp leading edge

        ctx.strokeStyle = rainGradient;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        if (isSleet && p.sparkle > 0.48) {
          // Ice pellets: compact bright ovals rather than rain-like long streaks.
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(-0.55);
          ctx.fillStyle = `rgba(244,251,255,${Math.min(0.95, alpha + 0.2)})`;
          ctx.beginPath();
          ctx.ellipse(0, 0, 2.1 + p.size * 0.5, 1.05 + p.size * 0.18, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (!isSleet && foreground && p.sparkle > 0.78) {
          ctx.fillStyle = `rgba(240,248,255,${alpha * 0.65})`;
          ctx.beginPath();
          ctx.ellipse(
            p.x - 1,
            p.y + p.length * 0.72,
            1,
            2.1,
            -0.18,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        p.x -= (isStorm ? 2.8 + Math.abs(p.drift) : isSleet ? 1.9 + Math.abs(p.drift) : 1.1 + Math.abs(p.drift)) * dt;
        p.y += p.speed * dt;
        if (p.y > 585) {
          if (condition === "rain" && p.sparkle > 0.3) {
            // Create a short-lived splash that expands and fades across frames.
            weatherBackgroundSplashes.push({
              x: p.x,
              y: 574 + Math.random() * 18,
              age: 0,
              life: 18 + Math.random() * 14,
              radius: 2 + Math.random() * 3,
              lift: 3 + Math.random() * 6,
            });
          }
          p.y = -p.length;
          p.x = Math.random() * 850;
        }
        if (p.x < -25) p.x = 820;
      }

      if (condition === "rain" && weatherBackgroundSplashes.length) {
        weatherBackgroundSplashes = weatherBackgroundSplashes.filter((splash) => {
          splash.age += dt;
          const progress = Math.min(1, splash.age / splash.life);
          const alpha = (1 - progress) * 0.78;
          ctx.save();
          ctx.strokeStyle = `rgba(226,244,255,${alpha})`;
          ctx.lineWidth = 1.15 * (1 - progress * 0.35);
          ctx.beginPath();
          ctx.ellipse(
            splash.x,
            splash.y - splash.lift * progress,
            splash.radius + progress * 8,
            0.7 + progress * 2.2,
            0,
            Math.PI,
            Math.PI * 2,
          );
          ctx.stroke();
          if (progress < 0.55) {
            ctx.fillStyle = `rgba(235,248,255,${alpha * 0.85})`;
            ctx.beginPath();
            ctx.arc(splash.x - splash.radius * 0.45, splash.y - splash.lift * progress - progress * 3, 1.1, 0, Math.PI * 2);
            ctx.arc(splash.x + splash.radius * 0.55, splash.y - splash.lift * progress - progress * 4, 0.9, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
          return splash.age < splash.life;
        });
      }

      if (condition === "thunderstorms") {
        // Brief, occasional lightning flashes. These are deliberately short and dim
        // so they read as distant lightning rather than a harsh full-screen strobe.
        const flashPhase = (time + weatherBackgroundThunderstormOffset) % 6800;
        let flashStrength = 0;
        if (flashPhase < 135) {
          flashStrength = 1 - flashPhase / 135;
        } else if (flashPhase >= 205 && flashPhase < 295) {
          flashStrength = 0.78 * (1 - (flashPhase - 205) / 90);
        }

        if (flashStrength > 0) {
          ctx.fillStyle = `rgba(224,237,255,${0.22 * flashStrength})`;
          ctx.fillRect(0, 0, 800, 600);

          // Change bolt location each flash, spanning different parts of the sky.
          const boltX = 75 + ((Math.floor((time + weatherBackgroundThunderstormOffset) / 6800) * 197 + 83) % 650);
          const boltY = 45;
          const boltPoints = [
            [boltX, boltY],
            [boltX - 22, boltY + 52],
            [boltX + 4, boltY + 65],
            [boltX - 30, boltY + 125],
            [boltX + 20, boltY + 91],
            [boltX + 2, boltY + 78],
            [boltX + 28, boltY + 42],
          ];

          ctx.save();
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.strokeStyle = `rgba(175,205,255,${0.62 * flashStrength})`;
          ctx.lineWidth = 15;
          ctx.beginPath();
          ctx.moveTo(boltPoints[0][0], boltPoints[0][1]);
          for (const point of boltPoints.slice(1)) ctx.lineTo(point[0], point[1]);
          ctx.stroke();

          ctx.strokeStyle = `rgba(255,255,255,${Math.min(1, 1.2 * flashStrength)})`;
          ctx.lineWidth = 4.2;
          ctx.beginPath();
          ctx.moveTo(boltPoints[0][0], boltPoints[0][1]);
          for (const point of boltPoints.slice(1)) ctx.lineTo(point[0], point[1]);
          ctx.stroke();
          ctx.restore();
        }
      }
    } else if (condition === "partly-cloudy" || condition === "cloudy") {
      // More readable sky-only clouds: deeper outlines and shaded bases remain visible
      // on bright white photos, while darker slate-blue clouds contrast with night skies.
      const isPartlyCloudy = condition === "partly-cloudy";
      const isNight = !weatherBackgroundAnimationDaylight;
      const topRgb = isNight
        ? (isPartlyCloudy ? "104,122,147" : "82,99,121")
        : (isPartlyCloudy ? "147,171,190" : "108,130,148");
      const bodyRgb = isNight
        ? (isPartlyCloudy ? "65,81,104" : "43,57,76")
        : (isPartlyCloudy ? "111,137,157" : "79,101,119");
      const baseRgb = isNight
        ? (isPartlyCloudy ? "28,40,58" : "19,29,44")
        : (isPartlyCloudy ? "70,94,114" : "47,65,81");
      const shapeAlpha = isNight
        ? (isPartlyCloudy ? 0.46 : 0.50)
        : (isPartlyCloudy ? 0.40 : 0.45);

      for (let i = 0; i < weatherBackgroundParticles.length; i++) {
        const p = weatherBackgroundParticles[i];
        const driftSpeed = isPartlyCloudy ? 0.0055 : 0.0038;
        // Restore the earlier broad, layered cloud style; independent starting points
        // and slightly different drift speeds keep the cloud banks from marching in a row.
        const cx = ((p.x + time * driftSpeed * (0.72 + p.layer * 0.48)) % 1280) - 240;
        // Keep the larger formations in the upper sky, leaving the weather data readable.
        const skyBand = isPartlyCloudy ? 80 : 98;
        const cy = 11 + (p.y % skyBand) + Math.sin(time / (6400 + i * 310) + p.phase) * 3.2;
        // About 10% larger than the earlier style, preserving its natural silhouette.
        const r = (isPartlyCloudy ? 33 : 37) + p.radius * (isPartlyCloudy ? 0.057 : 0.066);
        const horizontalScale = (isPartlyCloudy ? 1.42 : 1.59) * (0.82 + p.layer * 0.42);
        const verticalScale = (isPartlyCloudy ? 0.73 : 0.80) * (0.86 + p.sparkle * 0.20);
        const breathe = 0.97 + Math.sin(time / (7100 + i * 370) + p.phase) * 0.025;
        const bob = Math.sin(time / (6200 + i * 300) + p.phase) * 1.8;

        ctx.save();
        ctx.translate(cx, cy + bob);
        ctx.scale(horizontalScale, verticalScale);

        // Subtle cool halo provides separation from very bright/white background photos.
        ctx.shadowColor = isNight ? "rgba(176,198,224,0.20)" : "rgba(54,75,95,0.22)";
        ctx.shadowBlur = isPartlyCloudy ? 5 : 7;
        const cloudGradient = ctx.createLinearGradient(0, -r * 0.82, 0, r * 0.42);
        cloudGradient.addColorStop(0, `rgba(${topRgb},${shapeAlpha * 0.94 * breathe})`);
        cloudGradient.addColorStop(0.44, `rgba(${bodyRgb},${shapeAlpha * breathe})`);
        cloudGradient.addColorStop(1, `rgba(${baseRgb},${shapeAlpha * 0.88 * breathe})`);
        ctx.fillStyle = cloudGradient;

        // Irregular cumulus silhouette: varied humps, a shallow trough, and a broad base.
        ctx.beginPath();
        ctx.moveTo(-1.30 * r, 0.13 * r);
        ctx.bezierCurveTo(-1.43 * r, -0.01 * r, -1.28 * r, -0.27 * r, -1.02 * r, -0.25 * r);
        ctx.bezierCurveTo(-1.04 * r, -0.50 * r, -0.82 * r, -0.68 * r, -0.61 * r, -0.48 * r);
        ctx.bezierCurveTo(-0.50 * r, -0.81 * r, -0.18 * r, -0.90 * r, 0.02 * r, -0.59 * r);
        ctx.bezierCurveTo(0.22 * r, -0.74 * r, 0.49 * r, -0.67 * r, 0.64 * r, -0.43 * r);
        ctx.bezierCurveTo(0.92 * r, -0.50 * r, 1.22 * r, -0.30 * r, 1.18 * r, -0.04 * r);
        ctx.bezierCurveTo(1.36 * r, 0.03 * r, 1.33 * r, 0.22 * r, 1.10 * r, 0.25 * r);
        ctx.bezierCurveTo(0.80 * r, 0.33 * r, 0.42 * r, 0.26 * r, 0.12 * r, 0.30 * r);
        ctx.lineTo(-0.92 * r, 0.30 * r);
        ctx.bezierCurveTo(-1.17 * r, 0.30 * r, -1.34 * r, 0.25 * r, -1.30 * r, 0.13 * r);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Keep the edge legible on white backgrounds without making clouds look outlined.
        ctx.strokeStyle = isNight
          ? `rgba(184,202,223,${isPartlyCloudy ? 0.22 : 0.17})`
          : `rgba(46,68,87,${isPartlyCloudy ? 0.25 : 0.30})`;
        ctx.lineWidth = isPartlyCloudy ? 1.35 : 1.55;
        ctx.stroke();

        // Broad, softly shaded underside gives the cloud depth and better shape recognition.
        const underside = ctx.createLinearGradient(0, 0.10 * r, 0, 0.36 * r);
        underside.addColorStop(0, `rgba(${baseRgb},${(isNight ? 0.28 : 0.32) * breathe})`);
        underside.addColorStop(1, `rgba(${baseRgb},${(isNight ? 0.43 : 0.40) * breathe})`);
        ctx.fillStyle = underside;
        ctx.beginPath();
        ctx.moveTo(-1.03 * r, 0.19 * r);
        ctx.bezierCurveTo(-0.62 * r, 0.12 * r, 0.40 * r, 0.13 * r, 1.07 * r, 0.17 * r);
        ctx.bezierCurveTo(0.98 * r, 0.32 * r, 0.60 * r, 0.31 * r, 0.37 * r, 0.31 * r);
        ctx.lineTo(-0.78 * r, 0.31 * r);
        ctx.bezierCurveTo(-0.94 * r, 0.31 * r, -1.05 * r, 0.27 * r, -1.03 * r, 0.19 * r);
        ctx.closePath();
        ctx.fill();

        // A little soft reflected light makes the crown readable at night, but stays subtle.
        ctx.strokeStyle = isNight
          ? `rgba(196,211,231,${isPartlyCloudy ? 0.13 : 0.10})`
          : `rgba(246,250,253,${isPartlyCloudy ? 0.26 : 0.20})`;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(-0.78 * r, -0.20 * r);
        ctx.bezierCurveTo(-0.70 * r, -0.45 * r, -0.39 * r, -0.56 * r, -0.20 * r, -0.43 * r);
        ctx.bezierCurveTo(0.02 * r, -0.70 * r, 0.35 * r, -0.56 * r, 0.48 * r, -0.34 * r);
        ctx.stroke();
        ctx.restore();
      }
    } else if (condition === "snow") {
      // Varied flake sizes, soft halos on larger flakes, and gentle natural drift.
      for (const p of weatherBackgroundParticles) {
        const twinkle = 0.72 + (Math.sin(time / 550 + p.phase) + 1) * 0.14;
        if (p.size > 2.1) {
          ctx.fillStyle = `rgba(230,245,255,${p.alpha * 0.16})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = `rgba(255,255,255,${Math.min(0.82, (p.alpha + 0.24) * twinkle)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        if (p.size > 2.6 && p.sparkle > 0.55) {
          ctx.strokeStyle = `rgba(245,251,255,${p.alpha * 0.55})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(p.x - p.size * 1.7, p.y);
          ctx.lineTo(p.x + p.size * 1.7, p.y);
          ctx.moveTo(p.x, p.y - p.size * 1.7);
          ctx.lineTo(p.x, p.y + p.size * 1.7);
          ctx.stroke();
        }
        p.x += (Math.sin(time / 900 + p.phase) * 0.8 + p.drift) * dt;
        p.y += p.speed * dt;
        if (p.y > 615) {
          p.y = -6;
          p.x = Math.random() * 800;
        }
        if (p.x < -8) p.x = 808;
        if (p.x > 808) p.x = -8;
      }
    } else if (condition === "wind") {
      // A more expressive gust animation: broad translucent air ribbons and sweeping eddies.
      // Each gust is a tapered filled shape with a bright leading edge, so it reads as flowing air.
      for (const p of weatherBackgroundParticles) {
        const x = p.x,
          y = p.y;
        const span = 125 + p.layer * 155;
        const wave = Math.sin(time / 650 + p.phase) * (15 + p.layer * 10);
        const thickness = 5 + p.layer * 12;
        const breathe = 0.72 + (Math.sin(time / 850 + p.phase) + 1) * 0.14;
        const alpha = (0.035 + p.layer * 0.065) * breathe;
        const grad = ctx.createLinearGradient(x, y, x + span, y + wave);
        grad.addColorStop(0, "rgba(201,232,255,0)");
        grad.addColorStop(0.2, `rgba(197,229,252,${alpha * 0.55})`);
        grad.addColorStop(0.58, `rgba(231,246,255,${alpha})`);
        grad.addColorStop(0.82, `rgba(178,219,249,${alpha * 0.72})`);
        grad.addColorStop(1, "rgba(201,232,255,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.bezierCurveTo(
          x + span * 0.24,
          y - thickness - wave,
          x + span * 0.62,
          y + wave - thickness * 0.5,
          x + span,
          y + wave * 0.22,
        );
        ctx.bezierCurveTo(
          x + span * 0.67,
          y + wave + thickness,
          x + span * 0.28,
          y + thickness + wave * 0.7,
          x,
          y,
        );
        ctx.closePath();
        ctx.fill();
        // A fine luminous crest gives each broad gust a polished, airy edge.
        ctx.strokeStyle = `rgba(235,248,255,${alpha * 0.85})`;
        ctx.lineWidth = 0.8 + p.layer * 0.8;
        ctx.beginPath();
        ctx.moveTo(x + span * 0.12, y - thickness * 0.25);
        ctx.bezierCurveTo(
          x + span * 0.36,
          y - thickness - wave * 0.35,
          x + span * 0.7,
          y + wave - thickness * 0.2,
          x + span * 0.9,
          y + wave * 0.2,
        );
        ctx.stroke();
        p.x += p.speed * (2.4 + p.layer * 1.8) * dt;
        p.y += Math.sin(time / 750 + p.phase) * 0.3 * dt;
        if (p.x > 920) {
          p.x = -span;
          p.y = Math.random() * 600;
        }
      }
      // Large soft spirals occasionally form inside the gusts, suggesting swirling air rather than lines.
      for (let i = 0; i < 4; i++) {
        const cx = ((time * (0.022 + i * 0.004) + i * 247) % 1020) - 100;
        const cy = 95 + i * 126 + Math.sin(time / 850 + i * 1.7) * 24;
        const r = 20 + i * 3;
        ctx.strokeStyle = `rgba(219,241,255,${0.08 + i * 0.009})`;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, time / 900 + i, time / 900 + i + Math.PI * 1.28);
        ctx.stroke();
      }
    } else if (condition === "fog") {
      // Soft, irregular mountain fog banks, enlarged slightly and gently more visible.
      // They drift through the middle/lower landscape without veiling the whole popup.
      const isNight = !weatherBackgroundAnimationDaylight;
      const fogRgb = isNight ? "139,158,177" : "195,211,218";
      for (let i = 0; i < weatherBackgroundParticles.length; i++) {
        const p = weatherBackgroundParticles[i];
        const travel = time * (0.0028 + p.layer * 0.0026);
        const cx = ((p.x + travel) % 1200) - 200;
        const tier = i % 3;
        const bandTop = tier === 0 ? 48 : tier === 1 ? 205 : 360;
        const bandHeight = tier === 0 ? 96 : 88;
        const cy = bandTop + (p.y % bandHeight) + Math.sin(time / (7400 + i * 570) + p.phase) * 8;
        const tierScale = tier === 0 ? 0.78 : tier === 1 ? 0.92 : 1.08;
        const rx = (148 + p.radius * 0.40) * tierScale;
        const ry = (34 + p.radius * 0.10) * tierScale;
        const roll = Math.sin(time / (6200 + i * 480) + p.phase) * 0.05;
        const strength = (isNight ? 0.087 : 0.078) * (tier === 0 ? 0.68 : tier === 1 ? 0.84 : 1);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(roll);
        ctx.scale(rx, ry);
        const fogGradient = ctx.createRadialGradient(0, 0, 0.08, 0, 0, 1.05);
        fogGradient.addColorStop(0, `rgba(${fogRgb},${strength})`);
        fogGradient.addColorStop(0.48, `rgba(${fogRgb},${strength * 0.72})`);
        fogGradient.addColorStop(0.78, `rgba(${fogRgb},${strength * 0.30})`);
        fogGradient.addColorStop(1, `rgba(${fogRgb},0)`);
        ctx.fillStyle = fogGradient;
        ctx.beginPath();
        // Uneven, rolling upper and lower edges mimic fog caught between ridges.
        ctx.moveTo(-1.02, 0.20);
        ctx.bezierCurveTo(-0.92, -0.02, -0.80, -0.04, -0.69, 0.02);
        ctx.bezierCurveTo(-0.56, -0.22, -0.40, -0.14, -0.30, -0.03);
        ctx.bezierCurveTo(-0.13, -0.19, 0.02, -0.15, 0.12, 0.00);
        ctx.bezierCurveTo(0.27, -0.10, 0.42, -0.02, 0.50, 0.07);
        ctx.bezierCurveTo(0.68, -0.04, 0.83, 0.02, 1.02, 0.15);
        ctx.bezierCurveTo(0.93, 0.31, 0.75, 0.33, 0.61, 0.28);
        ctx.bezierCurveTo(0.43, 0.37, 0.25, 0.27, 0.11, 0.34);
        ctx.bezierCurveTo(-0.10, 0.39, -0.27, 0.27, -0.43, 0.31);
        ctx.bezierCurveTo(-0.66, 0.35, -0.84, 0.28, -1.02, 0.20);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    } else if (condition === "clear") {
      // Sun filtering through a tree canopy: sharp, tiny golden-white glints catching light gaps.
      if (weatherBackgroundAnimationDaylight) {
        // Sunbeams fan down from the upper-right sky. Wide gradients keep the rays
        // atmospheric and visible without laying opaque stripes over the weather data.
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        const beamPulse = 0.72 + (Math.sin(time / 1450) + 1) * 0.24;
        // The sun gently shifts and breathes; the rays fan and shimmer independently.
        const sunX = 675 + Math.sin(time / 4100) * 10;
        const sunY = 44 + Math.sin(time / 2600) * 5;
        for (let i = 0; i < 15; i++) {
          const angle = 0.30 + i * 0.17 + Math.sin(time / 3600 + i * 0.7) * 0.035;
          const distance = 720;
          const spread = 0.024 + (i % 3) * 0.012;
          const x1 = sunX + Math.cos(angle - spread) * distance;
          const y1 = sunY + Math.sin(angle - spread) * distance;
          const x2 = sunX + Math.cos(angle + spread) * distance;
          const y2 = sunY + Math.sin(angle + spread) * distance;
          const rayGradient = ctx.createLinearGradient(sunX, sunY, (x1 + x2) / 2, (y1 + y2) / 2);
          rayGradient.addColorStop(0, `rgba(255,247,213,${0.24 * beamPulse})`);
          rayGradient.addColorStop(0.28, `rgba(255,232,163,${0.12 * beamPulse})`);
          rayGradient.addColorStop(1, "rgba(255,235,172,0)");
          ctx.fillStyle = rayGradient;
          ctx.beginPath();
          ctx.moveTo(sunX, sunY);
          ctx.lineTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.closePath();
          ctx.fill();
        }

        // Animated solar corona and a visible sun disk: warm and lively, without sharp
        // star-shaped points that could be mistaken for night stars.
        const sunPulse = 0.82 + (Math.sin(time / 620) + 1) * 0.11;
        const sunRadius = 23 + Math.sin(time / 510) * 2.3;
        const corona = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.65, sunX, sunY, 125);
        corona.addColorStop(0, `rgba(255,244,190,${0.42 * sunPulse})`);
        corona.addColorStop(0.28, `rgba(255,222,130,${0.25 * sunPulse})`);
        corona.addColorStop(0.66, `rgba(255,200,98,${0.10 * sunPulse})`);
        corona.addColorStop(1, "rgba(255,190,70,0)");
        ctx.fillStyle = corona;
        ctx.fillRect(sunX - 130, sunY - 130, 260, 260);
        const disk = ctx.createRadialGradient(sunX - sunRadius * 0.28, sunY - sunRadius * 0.32, 2, sunX, sunY, sunRadius);
        disk.addColorStop(0, `rgba(255,255,238,${0.96 * sunPulse})`);
        disk.addColorStop(0.56, `rgba(255,244,197,${0.94 * sunPulse})`);
        disk.addColorStop(1, `rgba(255,208,105,${0.88 * sunPulse})`);
        ctx.fillStyle = disk;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Soft sunlight glints (not stars): fewer, blurred and low-contrast with no
        // hard bright cores or cross-shaped sparkles.
        for (let i = 0; i < weatherBackgroundParticles.length; i++) {
          if (i % 3 !== 0) continue;
          const p = weatherBackgroundParticles[i];
          const x = p.x;
          const y = 18 + (p.y % 165);
          const shimmer = (Math.sin(time / (700 + p.phase * 55) + p.phase) + 1) / 2;
          const alpha = 0.025 + shimmer * 0.045;
          const r = 4.5 + p.size * 1.5;
          const glintGrad = ctx.createRadialGradient(x, y, 0, x, y, r * 3.2);
          glintGrad.addColorStop(0, `rgba(255,239,180,${alpha * 0.72})`);
          glintGrad.addColorStop(0.38, `rgba(255,226,155,${alpha * 0.45})`);
          glintGrad.addColorStop(1, "rgba(255,220,140,0)");
          ctx.fillStyle = glintGrad;
          ctx.beginPath();
          ctx.arc(x, y, r * 3.2, 0, Math.PI * 2);
          ctx.fill();
          p.x += Math.sin(time / 2100 + p.phase) * 0.06 * dt;
          if (p.x < 0) p.x = 800;
          if (p.x > 800) p.x = 0;
        }

        // Broad, warm top-corner wash follows the same gentle sun motion.
        const pulse = 0.82 + (Math.sin(time / 980) + 1) * 0.18;
        const glow = ctx.createRadialGradient(sunX, sunY + 8, 4, sunX, sunY + 8, 340);
        glow.addColorStop(0, `rgba(255,224,112,${0.40 * pulse})`);
        glow.addColorStop(0.38, `rgba(255,210,90,${0.22 * pulse})`);
        glow.addColorStop(0.68, `rgba(255,190,70,${0.10 * pulse})`);
        glow.addColorStop(1, "rgba(255,190,70,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(sunX - 360, sunY - 340, 720, 680);
      } else {
        // Clear night: slow star twinkles and a very subtle cool moonlit glow.
        for (const p of weatherBackgroundParticles) {
          const x = p.x;
          const y = 16 + (p.y % 425);
          const blinkWave = (Math.sin(time / (330 + p.phase * 17) + p.phase * 1.55) + 1) / 2;
          const twinkle = 0.10 + Math.pow(blinkWave, 2.6) * 0.88;
          const radius = 0.85 + p.size * 0.76;

          ctx.fillStyle = `rgba(255,241,190,${Math.min(0.98, twinkle)})`;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();

          if (p.sparkle > 0.66) {
            const glintAlpha = Math.max(0, twinkle - 0.22) * 0.72;
            ctx.strokeStyle = `rgba(255,230,155,${Math.min(0.94, glintAlpha + 0.10)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(x - radius * 2.0, y);
            ctx.lineTo(x + radius * 2.0, y);
            ctx.moveTo(x, y - radius * 2.0);
            ctx.lineTo(x, y + radius * 2.0);
            ctx.stroke();
          }
          // Stars breathe subtly without travelling like falling particles.
        }

        // The moon now gently travels across the upper sky, changes brightness,
        // and has a visible crescent, so its motion is perceptible without being abrupt.
        const moonX = 650 + Math.sin(time / 3900) * 13;
        const moonY = 67 + Math.cos(time / 5200) * 5;
        const nightPulse = 0.70 + (Math.sin(time / 1250) + 1) * 0.27;
        const moonRadius = 17 + Math.sin(time / 2100) * 1.2;
        const moonGlow = ctx.createRadialGradient(moonX, moonY, 3, moonX, moonY, 335);
        moonGlow.addColorStop(0, `rgba(255,230,168,${0.43 * nightPulse})`);
        moonGlow.addColorStop(0.22, `rgba(255,211,134,${0.24 * nightPulse})`);
        moonGlow.addColorStop(0.52, `rgba(213,192,255,${0.11 * nightPulse})`);
        moonGlow.addColorStop(1, "rgba(157,190,241,0)");
        ctx.fillStyle = moonGlow;
        ctx.fillRect(moonX - 340, moonY - 340, 680, 680);

        const moonDisk = ctx.createRadialGradient(moonX - 5, moonY - 6, 1, moonX, moonY, moonRadius);
        moonDisk.addColorStop(0, `rgba(255,252,232,${0.98 * nightPulse})`);
        moonDisk.addColorStop(0.72, `rgba(255,237,194,${0.96 * nightPulse})`);
        moonDisk.addColorStop(1, `rgba(235,207,154,${0.90 * nightPulse})`);
        ctx.fillStyle = moonDisk;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
        ctx.fill();
        // Small surface marks make the disk read as a moon rather than a plain dot.
        ctx.fillStyle = `rgba(190,190,177,${0.19 * nightPulse})`;
        ctx.beginPath();
        ctx.arc(moonX - 5, moonY - 2, 3.0, 0, Math.PI * 2);
        ctx.arc(moonX + 3, moonY + 5, 2.1, 0, Math.PI * 2);
        ctx.arc(moonX + 4, moonY - 5, 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Full moon: keep the complete illuminated disk visible (no crescent shadow).
        // A faint moving orbital glint adds a little more motion to the moonlight.
        ctx.save();
        ctx.translate(moonX, moonY);
        ctx.rotate(time / 3700);
        ctx.strokeStyle = `rgba(255,230,178,${0.14 * nightPulse})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, moonRadius * 1.7, moonRadius * 1.35, 0, -0.28, 0.82);
        ctx.stroke();
        ctx.restore();
        // Soft moving amber glow arcs make the nighttime clear effect visible,
        // while remaining diffuse rather than resembling hard stars only.
        for (let i = 0; i < 3; i++) {
          const gx = 170 + i * 230 + Math.sin(time / 2200 + i) * 38;
          const gy = 95 + i * 82;
          const r = 120 + i * 18;
          const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, r);
          g.addColorStop(0, `rgba(255,210,120,${0.07 * nightPulse})`);
          g.addColorStop(1, "rgba(255,210,120,0)");
          ctx.fillStyle = g;
          ctx.fillRect(gx - r, gy - r, r * 2, r * 2);
        }
      }
    }
    weatherBackgroundAnimationFrame = requestAnimationFrame(draw);
  };
  weatherBackgroundAnimationFrame = requestAnimationFrame(draw);
};

const bgLocal = async (conditionName, isDaylight) => {
  const condition = normalizeBackgroundCondition(conditionName);
  // Unknown reports use dedicated neutral day/night photographs; no weather-specific
  // animation is applied. Thunderstorms share the rain photo but retain storm animation.
  const backgroundCondition =
    condition === "thunderstorms" ? "rain" : condition;
  const period = isDaylight ? "day" : "night";
  try {
    const response = await fetch("data/backgrounds.json", {
      cache: "no-store",
    });
    if (!response.ok)
      throw new Error(`Background index HTTP ${response.status}`);
    const index = await response.json();
    const files = index?.entries?.[backgroundCondition]?.[period] || [];
    if (!files.length)
      throw new Error(`No background for ${backgroundCondition}/${period}`);
    const choices = files;
    const rotationKey = `backgroundRotation_${backgroundCondition}_${period}`;
    const stored = await new Promise((resolve) =>
      chrome.storage.local.get(rotationKey, resolve),
    );
    const savedIndex = Number(stored?.[rotationKey]);
    const selectedIndex =
      Number.isInteger(savedIndex) &&
      savedIndex >= 0 &&
      savedIndex < choices.length
        ? savedIndex
        : 0;
    const file = choices[selectedIndex];
    chrome.storage.local.set({
      [rotationKey]: (selectedIndex + 1) % choices.length,
    });
    imageBackground.style.backgroundImage = `url("${file}")`;
    imageBackground.classList.remove("hidden");
    startWeatherBackgroundAnimation(conditionName, isDaylight);
  } catch (error) {
    // Expected failures (for example during offline testing) are handled silently.
    stopWeatherBackgroundAnimation();
    imageBackground.style.backgroundImage = "none";
  }
};
