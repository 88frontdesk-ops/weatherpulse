const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const backgrounds = path.join(root, "images", "background");

const palettes = {
  clear: {
    day: ["#197db2", "#f2c184", "#365c69", "#204954", "#b7cbb8", "#f4dfb8"],
    night: ["#10284c", "#52617e", "#253a57", "#172c48", "#61788b", "#d9e3e3"],
  },
  "partly-cloudy": {
    day: ["#3885a0", "#e8bf9b", "#58757a", "#345a5e", "#a6b9aa", "#f5eee0"],
    night: ["#192d52", "#666984", "#273a59", "#1a3049", "#758196", "#dfe1e4"],
  },
  cloudy: {
    day: ["#687f8d", "#c3b9ac", "#4e626c", "#354b55", "#89958e", "#edf0ec"],
    night: ["#14283a", "#4e5966", "#202f42", "#15263a", "#616c76", "#cbd3d8"],
  },
  rain: {
    day: ["#456b7a", "#9ba9a8", "#415962", "#2e474e", "#657c7a", "#d9e6e5"],
    night: ["#13283b", "#3d5262", "#1c3143", "#122638", "#50616c", "#bfd0d5"],
  },
  snow: {
    day: ["#6ea8c0", "#e4d8cb", "#7599a6", "#446875", "#e2e9e5", "#fbf6ea"],
    night: ["#1c3857", "#667b8e", "#263f5b", "#192f4a", "#a4b8c0", "#eaf0ef"],
  },
  sleet: {
    day: ["#577684", "#b2aaa1", "#59666b", "#384c53", "#87928e", "#e0e4df"],
    night: ["#162d40", "#535a67", "#203346", "#152a3c", "#69737b", "#d4dbdc"],
  },
  wind: {
    day: ["#438da0", "#d8bd89", "#587267", "#354e49", "#8b9a79", "#f1e1bc"],
    night: ["#1b3851", "#68717a", "#293d4c", "#1a3040", "#64777b", "#d7d9d1"],
  },
  fog: {
    day: ["#77999f", "#c7c5b5", "#687d7a", "#455e5c", "#a2aca1", "#e8ebe4"],
    night: ["#203749", "#737b7d", "#2c414e", "#1c303e", "#879394", "#d3d8d4"],
  },
};

const cloud = (x, y, scale, fill, opacity = 1) => `
  <g transform="translate(${x} ${y}) scale(${scale})" fill="${fill}" opacity="${opacity}">
    <path d="M10 55c-16 0-24-10-24-23 0-12 10-22 23-22 5-18 20-29 39-29 20 0 34 12 39 30 19-5 38 8 38 28 0 10-6 18-17 21z"/>
    <path d="M4 54h95" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="3"/>
  </g>`;

const celestial = (night, condition) => {
  if (["rain", "sleet", "fog"].includes(condition)) return "";
  if (["cloudy", "snow"].includes(condition)) {
    return `<circle cx="642" cy="122" r="110" fill="url(#glow)" opacity=".72"/>`;
  }
  return night
    ? `<g><circle cx="638" cy="117" r="62" fill="url(#glow)"/><path d="M661 65a53 53 0 1 0 50 79 47 47 0 0 1-50-79z" fill="#e2e9d8"/><g fill="#f3ead0" opacity=".86"><circle cx="112" cy="86" r="2"/><circle cx="194" cy="139" r="1.8"/><circle cx="326" cy="73" r="2"/><circle cx="447" cy="122" r="1.6"/><circle cx="536" cy="62" r="1.5"/><circle cx="742" cy="211" r="1.8"/><circle cx="75" cy="220" r="1.4"/></g></g>`
    : `<g><circle cx="642" cy="122" r="78" fill="url(#glow)"/><circle cx="642" cy="122" r="37" fill="#f7d98e"/><path d="M606 127c18-13 48-13 72 0" fill="none" stroke="#fff0c5" stroke-width="3" opacity=".75"/></g>`;
};

const weatherDetails = (condition, night) => {
  const cloudFill = night ? "#8495a2" : "#f4eee2";
  if (condition === "clear") return "";
  if (condition === "partly-cloudy") return cloud(105, 160, 0.78, cloudFill, 0.86) + cloud(375, 212, 0.5, cloudFill, 0.72);
  if (condition === "cloudy") return cloud(86, 145, 1.04, cloudFill, 0.78) + cloud(382, 165, 0.92, night ? "#667988" : "#d8d9d2", 0.84) + cloud(579, 246, 0.48, cloudFill, 0.68);
  if (condition === "rain") return `${cloud(102, 111, 1.22, night ? "#607483" : "#87999d", 0.94)}
    <g stroke="${night ? "#8fc8d3" : "#b5d8d9"}" stroke-width="4" stroke-linecap="round" opacity=".75">
      <path d="M183 202l-17 43M228 207l-17 50M276 202l-17 43M326 208l-17 50M376 202l-17 44M426 207l-17 49M476 203l-17 44M526 208l-17 48M576 202l-17 44"/>
    </g>
    <path d="M58 452q155-32 309 2t375-8v154H58z" fill="#315a66" opacity=".48"/>`;
  if (condition === "snow") return `${cloud(116, 120, 1.13, night ? "#9aabb2" : "#f5f4eb", 0.92)}
    <g fill="#f5f4eb" opacity=".9"><circle cx="154" cy="249" r="4"/><circle cx="222" cy="292" r="3"/><circle cx="301" cy="255" r="4"/><circle cx="373" cy="310" r="3"/><circle cx="452" cy="256" r="4"/><circle cx="526" cy="296" r="3"/><circle cx="608" cy="247" r="4"/><circle cx="684" cy="318" r="3"/></g>`;
  if (condition === "sleet") return `${cloud(111, 118, 1.12, night ? "#778793" : "#9da9a8", 0.92)}
    <g stroke="#b9d7dc" stroke-width="3" stroke-linecap="round" opacity=".8"><path d="M180 219l-13 32M249 222l-13 31M317 218l-13 34M385 222l-13 31M453 218l-13 34M521 222l-13 31M589 218l-13 34"/></g>
    <g fill="#eef4f0"><circle cx="212" cy="270" r="4"/><circle cx="278" cy="299" r="3"/><circle cx="351" cy="269" r="4"/><circle cx="422" cy="305" r="3"/><circle cx="497" cy="272" r="4"/><circle cx="565" cy="300" r="3"/></g>`;
  if (condition === "wind") return `<g fill="none" stroke="${night ? "#9ac0c1" : "#f2e3bb"}" stroke-width="7" stroke-linecap="round" opacity=".58"><path d="M56 174c142-58 212 52 352 2s204-49 336-5"/><path d="M22 225c116-41 186 45 306 8s230-52 410-6"/><path d="M102 276c104-30 183 40 290 9s179-32 287-1"/></g>
    <g fill="${night ? "#b0c5bd" : "#ead19d"}" opacity=".78"><path d="M585 283q17-19 34-5-20 1-34 5z"/><path d="M650 224q16-19 33-5-20 1-33 5z"/><path d="M173 299q15-17 29-4-17 1-29 4z"/></g>`;
  return `<g fill="${night ? "#d4dddd" : "#ecede5"}" opacity=".62"><path d="M-20 282q126-26 260-2t292-1 290 0v39q-131-24-270 1t-283 0-289 4z"/><path d="M-20 336q153-21 298 1t272-2 272 3v43q-128-22-273 0t-291-2-278 2z"/><path d="M-20 400q128-18 260 1t289-1 293 1v38q-148-15-284 1t-286-1-272 1z"/></g>`;
};

const landscape = (condition, p, night) => {
  const [skyTop, skyBottom, ridgeFar, ridgeNear, ground, snow] = p;
  const ridges = `<path d="M0 404 105 298l68 65 126-158 104 128 112-96 93 82 108-124 84 114v291H0z" fill="${ridgeFar}" opacity=".76"/>
    <path d="m242 241 57-36 44 53-39-16-27 20zM525 319l93-124 84 114-70-54-30 38z" fill="${snow}" opacity=".58"/>
    <path d="M0 427q139-70 280-14t250-8 270-6v201H0z" fill="${ridgeNear}"/>
    <path d="M0 490q183-73 358-2t442-35v147H0z" fill="${ground}"/>`;
  let foreground = "";
  if (condition === "snow") {
    foreground = `<path d="M0 494q182-60 359 0t441-31v137H0z" fill="${snow}"/>
      <g fill="${night ? "#274b60" : "#416e78"}" opacity=".92"><path d="m90 482 26-67 26 67h-16l25 39H80l25-39z"/><path d="m164 505 20-53 21 53h-13l20 33h-54l19-33z"/><path d="m693 475 28-74 28 74h-18l26 43h-72l25-43z"/><path d="m622 506 20-54 21 54h-13l20 34h-55l20-34z"/></g>`;
  } else if (condition === "fog") {
    foreground = `<g fill="${night ? "#667c80" : "#879b91"}" opacity=".8"><path d="m68 491 24-95 25 95h-16l22 41H61l22-41z"/><path d="m126 513 18-70 20 70h-13l18 31h-46l17-31z"/><path d="m711 497 26-103 27 103h-17l22 39h-63l23-39z"/><path d="m654 519 18-70 20 70h-12l17 29h-44l16-29z"/></g>`;
  } else if (condition === "wind") {
    foreground = `<path d="M0 532q140-97 292-17t257-6 251-32v123H0z" fill="${ground}" opacity=".72"/><g fill="none" stroke="${night ? "#b5bd9a" : "#e4d098"}" stroke-width="4" opacity=".8"><path d="M119 561q-14-51 9-90M131 562q5-44 36-69M680 566q-8-57 17-95M694 565q6-39 35-61M274 575q-5-35 16-57"/></g>`;
  } else if (condition === "sleet" || condition === "rain") {
    foreground = `<path d="M0 525q145-55 289 5t274-12 237-5v87H0z" fill="${night ? "#183b4b" : "#315b64"}"/><path d="M0 554q171-36 329 7t471-21" fill="none" stroke="${night ? "#81b5bd" : "#9ec1b8"}" stroke-width="4" opacity=".58"/>`;
  } else {
    foreground = `<g fill="${night ? "#1d3945" : "#31554d"}" opacity=".82"><path d="m61 493 17-59 18 59H85l18 28H54l17-28z"/><path d="m718 483 20-68 21 68h-14l22 34h-56l21-34z"/></g>`;
  }
  return `${ridges}${foreground}`;
};

const makeSvg = (condition, period, colors) => {
  const night = period === "night";
  const [skyTop, skyBottom, ridgeFar, ridgeNear, ground, snow] = colors;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" role="img" aria-label="Illustrated ${condition} ${period} weather landscape">
  <defs>
    <linearGradient id="sky" x2="0" y2="1"><stop stop-color="${skyTop}"/><stop offset="1" stop-color="${skyBottom}"/></linearGradient>
    <radialGradient id="glow"><stop stop-color="${night ? "#b9d0d3" : "#ffeab1"}" stop-opacity=".42"/><stop offset="1" stop-color="${night ? "#b9d0d3" : "#ffeab1"}" stop-opacity="0"/></radialGradient>
    <linearGradient id="shade" x2="0" y2="1"><stop stop-color="#07101b" stop-opacity="0"/><stop offset="1" stop-color="#07101b" stop-opacity=".24"/></linearGradient>
    <pattern id="grain" width="36" height="36" patternUnits="userSpaceOnUse"><circle cx="4" cy="8" r=".8" fill="#fff" opacity=".12"/><circle cx="25" cy="26" r=".7" fill="#07101b" opacity=".08"/></pattern>
  </defs>
  <rect width="800" height="600" fill="url(#sky)"/>
  ${celestial(night, condition)}
  ${weatherDetails(condition, night)}
  ${landscape(condition, colors, night)}
  <path d="M0 430q181-76 354-13t446-35" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="2"/>
  <rect width="800" height="600" fill="url(#shade)"/>
  <rect width="800" height="600" fill="url(#grain)"/>
</svg>`;
};

for (const [condition, periods] of Object.entries(palettes)) {
  for (const period of ["day", "night"]) {
    const directory = path.join(backgrounds, condition, period);
    fs.mkdirSync(directory, { recursive: true });
    const filename = `illustrated-${condition}-${period}.svg`;
    fs.writeFileSync(path.join(directory, filename), makeSvg(condition, period, periods[period]));
  }
}

console.log("Generated 16 illustrated weather backgrounds.");
