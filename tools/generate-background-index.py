#!/usr/bin/env python3
"""Generate data/backgrounds.json from images/background/<condition>/<day|night>."""

from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
BACKGROUND_ROOT = ROOT / "images" / "background"
OUTPUT = ROOT / "data" / "backgrounds.json"
CONDITIONS = [
    "clear",
    "partly-cloudy",
    "cloudy",
    "rain",
    "snow",
    "sleet",
    "wind",
    "fog",
]
PERIODS = ["day", "night"]
EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def main():
    entries = {}
    total = 0

    for condition in CONDITIONS:
        entries[condition] = {}
        for period in PERIODS:
            folder = BACKGROUND_ROOT / condition / period
            files = []
            if folder.is_dir():
                for path in sorted(folder.iterdir(), key=lambda p: p.name.lower()):
                    if path.is_file() and path.suffix.lower() in EXTENSIONS:
                        files.append(path.relative_to(ROOT).as_posix())
            entries[condition][period] = files
            total += len(files)

    payload = {"version": 3, "entries": entries}
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")

    print(f"Generated {OUTPUT.relative_to(ROOT)}")
    print(f"Indexed {total} background image(s).")
    for condition in CONDITIONS:
        day = len(entries[condition]["day"])
        night = len(entries[condition]["night"])
        print(f"  {condition}: day={day}, night={night}")


if __name__ == "__main__":
    main()
