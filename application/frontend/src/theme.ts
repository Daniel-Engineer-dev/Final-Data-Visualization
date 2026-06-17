// Editorial Climate Almanac — shared design tokens for ECharts.
// Light, warm, paper-toned palette. No neon, no dark glass.

export const SERIF_FONT = "'Fraunces', Georgia, 'Times New Roman', serif";
export const SANS_FONT = "'Instrument Sans', system-ui, -apple-system, sans-serif";

export const PALETTE = {
  ink: "#1C2B23",
  inkSoft: "#4A5B50",
  inkFaint: "#8A958A",
  line: "#E4DCC9",
  lineSoft: "#EDE6D4",
  paper: "#F7F3E9",
  surface: "#FEFCF6",
  forest: "#2E6F4E",
  forestDeep: "#1F4F38",
  sky: "#3E7CA0",
  clay: "#C2683D",
  amber: "#C98A1E",
  rose: "#B05B6E",
};

// Muted editorial hues for the three regions (colour is never the only cue).
export const REGION_COLORS: Record<string, string> = {
  North: "#3E7CA0", // teal-blue — cool northern climate
  Central: "#C98A1E", // amber — central heat
  South: "#2E6F4E", // forest — humid green south
};

// Cool → warm temperature ramp, kept earthy rather than neon.
export const TEMP_GRADIENT = [
  "#4C7A93",
  "#7FA9BE",
  "#CFE0CF",
  "#EBD9A6",
  "#E0AE4E",
  "#C2683D",
  "#9E4427",
];

// Diverging correlation ramp: teal (negative) → cream (zero) → clay (positive).
export const CORR_GRADIENT = ["#3E7CA0", "#9DBCCB", "#F2ECDD", "#DBA679", "#C2683D"];

export const tooltipStyle = {
  backgroundColor: PALETTE.surface,
  borderColor: PALETTE.line,
  borderWidth: 1,
  padding: [10, 14] as [number, number],
  textStyle: { color: PALETTE.ink, fontFamily: SANS_FONT, fontSize: 12 },
  extraCssText:
    "box-shadow:0 14px 34px -14px rgba(40,50,30,0.32);border-radius:12px;",
};

export const axisLabel = { color: PALETTE.inkSoft, fontFamily: SANS_FONT, fontSize: 12 };
export const axisLineSoft = { lineStyle: { color: PALETTE.line } };
export const splitLineSoft = { lineStyle: { color: PALETTE.lineSoft, type: "dashed" as const } };
export const nameTextStyle = { color: PALETTE.inkFaint, fontFamily: SANS_FONT, fontSize: 11 };

export const legendStyle = {
  textStyle: { color: PALETTE.inkSoft, fontFamily: SANS_FONT, fontSize: 12 },
  icon: "roundRect",
  itemWidth: 14,
  itemHeight: 8,
  itemGap: 18,
};

// Serif title block reused across charts.
export function chartTitle(text: string) {
  return {
    text,
    left: "center",
    top: 4,
    textStyle: {
      color: PALETTE.ink,
      fontFamily: SERIF_FONT,
      fontWeight: 600 as const,
      fontSize: 15,
    },
  };
}
