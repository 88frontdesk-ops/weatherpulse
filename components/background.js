const normalizeBackgroundCondition = (iconName) => {
  const icon = String(iconName || "").toLowerCase();
  if (icon.startsWith("clear")) return "clear";
  if (icon.startsWith("partly-cloudy")) return "partly-cloudy";
  if (
    icon.includes("thunder") ||
    icon.includes("storm") ||
    icon.includes("shower") ||
    icon.includes("drizzle")
  )
    return "rain";
  if (icon.includes("rain")) return "rain";
  if (icon.includes("snow")) return "snow";
  if (icon.includes("sleet")) return "sleet";
  if (icon.includes("wind")) return "wind";
  if (icon.includes("fog")) return "fog";
  if (icon.includes("cloud")) return "cloudy";
  return "clear";
};

// WeatherPulse animated foreground layer. The existing background image remains untouched.
let weatherBackgroundAnimationFrame = 0;
let weatherBackgroundAnimationCanvas = null;
let weatherBackgroundAnimationContext = null;
let weatherBackgroundAnimationLastTime = 0;
let weatherBackgroundParticles = [];
let weatherBackgroundAnimationCondition = "none";
let weatherBackgroundAnimationDaylight = true;

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

  // Layered particles are intentionally subtle and never alter the source photograph.
  const count =
    condition === "snow"
      ? 105
      : condition === "rain" || condition === "sleet"
        ? 330
        : condition === "wind"
          ? 34
          : condition === "fog"
            ? 7
            : condition === "clear"
              ? 42
              : 0;
  weatherBackgroundParticles = Array.from({ length: count }, () => ({
    x: Math.random() * 800,
    y: Math.random() * 600,
    size:
      condition === "snow"
        ? 0.7 + Math.random() * 2.8
        : condition === "rain" || condition === "sleet"
          ? 1.15 + Math.random() * 2.0
          : condition === "wind"
            ? 0.5 + Math.random() * 0.8
            : condition === "fog"
              ? 0.15 + Math.random() * 0.3
              : 0.6 + Math.random() * 1.5,
    speed:
      condition === "rain" || condition === "sleet"
        ? 1.6 + Math.random() * 2.1
        : condition === "snow"
          ? 0.55 + Math.random() * 1.8
          : condition === "wind"
            ? 1.2 + Math.random() * 1.7
            : condition === "fog"
              ? 0.18 + Math.random() * 0.3
              : 0.2 + Math.random() * 0.5,
    drift:
      (Math.random() - 0.5) *
      (condition === "wind" ? 1.2 : condition === "snow" ? 1.6 : 0.8),
    length: 7 + Math.random() * 12,
    alpha: 0.15 + Math.random() * 0.35,
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

    if (condition === "rain" || condition === "sleet") {
      // Two depths of rain: fine distant streaks and brighter foreground streaks.
      for (const p of weatherBackgroundParticles) {
        const foreground = p.size > 1.25;
        const alpha = p.alpha * (foreground ? 0.9 : 0.55);
        ctx.lineCap = "round";
        ctx.lineWidth = foreground ? 1.35 : 0.75;

        // Calculate the end coordinates for the gradient and line
        const endX = p.x - (2.2 + p.drift);
        const endY = p.y + p.length * (foreground ? 1 : 0.75);

        // Create a gradient along the drop's path for a natural fade
        const rainGradient = ctx.createLinearGradient(p.x, p.y, endX, endY);
        const rgb = foreground ? "225,241,255" : "188,218,242";
        rainGradient.addColorStop(0, `rgba(${rgb}, 0)`); // Faded tail
        rainGradient.addColorStop(1, `rgba(${rgb}, ${alpha})`); // Sharp leading edge

        ctx.strokeStyle = rainGradient;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        if (foreground && p.sparkle > 0.78) {
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
        p.x -= (1.1 + Math.abs(p.drift)) * dt;
        p.y += p.speed * dt;
        if (p.y > 620) {
          p.y = -p.length;
          p.x = Math.random() * 850;
        }
        if (p.x < -25) p.x = 820;
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
      // Smooth, rolling atmospheric mist using soft organic blending instead of boxy stripes.
      const breath = 0.72 + (Math.sin(time / 3400) + 1) * 0.09;
      ctx.fillStyle = `rgba(205,220,229,${0.065 * breath})`;
      ctx.fillRect(0, 0, 800, 600);

      for (let i = 0; i < weatherBackgroundParticles.length; i++) {
        const p = weatherBackgroundParticles[i];

        // Smooth horizontal drift with secondary vertical weaving to eliminate linear "stripes"
        const cx = ((p.x + time * (0.005 + p.speed * 0.01)) % 1100) - 150;
        const cy =
          p.y * 0.85 +
          40 +
          Math.sin(time / (2100 + i * 130) + p.phase) * 45 +
          Math.cos(time / 1500 + i) * 15;

        const rx = 190 + p.radius * 0.72;
        const ry = 130 + p.radius * 0.34;
        const maxR = Math.max(rx, ry);

        const pulse =
          0.72 + (Math.sin(time / (2600 + i * 170) + p.phase) + 1) * 0.14;

        // Replaced boxy fillRect with true circular radial gradients for a cloud-like puff
        const fog = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
        fog.addColorStop(0, `rgba(232,240,245,${0.1 * pulse})`);
        fog.addColorStop(0.4, `rgba(220,232,239,${0.07 * pulse})`);
        fog.addColorStop(0.75, `rgba(213,226,234,${0.025 * pulse})`);
        fog.addColorStop(1, "rgba(213,226,234,0)");

        ctx.fillStyle = fog;
        ctx.beginPath();
        ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
        ctx.fill();

        // Original particle movement and loop reset
        p.x += p.speed * 0.45 * dt;
        if (p.x > 980) {
          p.x = -180;
          p.y = Math.random() * 600;
        }
      }
    } else if (condition === "clear") {
      // Sun filtering through a tree canopy: sharp, tiny golden-white glints catching light gaps.
      if (weatherBackgroundAnimationDaylight) {
        for (const p of weatherBackgroundParticles) {
          const x = p.x,
            y = 18 + (p.y % 190);

          // Quick, sharp flash frequency like light piercing through moving leaves
          const glint = Math.max(
            0,
            Math.sin(time / (240 + p.phase * 45) + p.phase),
          );
          const alpha = glint > 0.58 ? (glint - 0.58) * 2.1 : 0; // Only visible during peak glint
          const r = 0.8 + p.size * 0.6;

          if (alpha > 0.02) {
            // Soft warm halo around the glint
            const glintGrad = ctx.createRadialGradient(x, y, 0, x, y, r * 3.5);
            glintGrad.addColorStop(0, `rgba(255, 238, 160, ${alpha * 0.55})`);
            glintGrad.addColorStop(1, "rgba(255, 238, 160, 0)");
            ctx.fillStyle = glintGrad;
            ctx.beginPath();
            ctx.arc(x, y, r * 3.5, 0, Math.PI * 2);
            ctx.fill();

            // Tiny, sharp bright core (the intense sun speck)
            ctx.fillStyle = `rgba(255, 255, 240, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
          }

          // Gentle sway like air currents filtering through branches
          p.x += Math.sin(time / 900 + p.phase) * 0.14 * dt;
          if (p.x < 0) p.x = 800;
          if (p.x > 800) p.x = 0;
        }

        // Warm, filtering top-corner sun wash
        const pulse = 0.68 + Math.sin(time / 1400) * 0.08;
        const glow = ctx.createRadialGradient(690, 55, 5, 690, 65, 260);
        glow.addColorStop(0, `rgba(255, 228, 140, ${0.22 * pulse})`);
        glow.addColorStop(0.5, `rgba(255, 210, 100, ${0.08 * pulse})`);
        glow.addColorStop(1, "rgba(255, 190, 70, 0)");

        ctx.fillStyle = glow;
        ctx.fillRect(400, -150, 450, 450);
      }
    }
    weatherBackgroundAnimationFrame = requestAnimationFrame(draw);
  };
  weatherBackgroundAnimationFrame = requestAnimationFrame(draw);
};

const bgLocal = async (iconName, isDaylight) => {
  const condition = normalizeBackgroundCondition(iconName);
  const period = isDaylight ? "day" : "night";
  try {
    const response = await fetch("data/backgrounds.json", {
      cache: "no-store",
    });
    if (!response.ok)
      throw new Error(`Background index HTTP ${response.status}`);
    const index = await response.json();
    const files = index?.entries?.[condition]?.[period] || [];
    if (!files.length)
      throw new Error(`No background for ${condition}/${period}`);
    const choices = files;
    const rotationKey = `backgroundRotation_${condition}_${period}`;
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
    startWeatherBackgroundAnimation(iconName, isDaylight);
  } catch (error) {
    console.warn("Local background unavailable:", error);
    stopWeatherBackgroundAnimation();
    imageBackground.style.backgroundImage = "none";
  }
};
