"use client";

import type { CSSProperties } from "react";
import { useEffect } from "react";

const stars = [
  [4, 7, 0, 23],
  [11, 18, -7, 31],
  [19, 4, -13, 27],
  [27, 31, -4, 34],
  [36, 12, -19, 29],
  [44, 39, -11, 36],
  [53, 6, -17, 25],
  [61, 24, -2, 33],
  [69, 11, -23, 38],
  [78, 35, -9, 28],
  [87, 16, -15, 32],
  [95, 44, -5, 37],
  [7, 55, -21, 35],
  [16, 73, -8, 26],
  [25, 49, -14, 39],
  [34, 67, -3, 30],
  [42, 88, -18, 36],
  [50, 58, -10, 24],
  [58, 79, -24, 34],
  [66, 51, -6, 29],
  [74, 91, -16, 38],
  [82, 64, -12, 27],
  [91, 82, -20, 33],
  [97, 57, -1, 31],
] as const;

type AtmosphereStyle = CSSProperties & {
  "--x": string;
  "--y": string;
  "--delay": string;
  "--duration": string;
};

export function GlobalAtmosphere() {
  useEffect(() => {
    const updateVisibility = () => {
      document.documentElement.dataset.documentHidden = document.hidden
        ? "true"
        : "false";
    };
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      document.removeEventListener("visibilitychange", updateVisibility);
      delete document.documentElement.dataset.documentHidden;
    };
  }, []);

  return (
    <div
      className="global-atmosphere"
      aria-hidden="true"
      data-testid="global-atmosphere"
    >
      <div className="atmosphere-glow" />
      <div className="technical-lines" />
      <div className="star-field">
        {stars.map(([x, y, delay, duration], index) => (
          <i
            className={`star star-${(index % 3) + 1}`}
            key={`${x}-${y}`}
            style={
              {
                "--x": `${x}%`,
                "--y": `${y}%`,
                "--delay": `${delay}s`,
                "--duration": `${duration}s`,
              } as AtmosphereStyle
            }
          />
        ))}
      </div>
      <div className="global-signals">
        {Array.from({ length: 5 }, (_, index) => (
          <i className={`global-signal signal-${index + 1}`} key={index} />
        ))}
      </div>
    </div>
  );
}
