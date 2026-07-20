declare module "echarts/extension/dataTool/prepareBoxplotData" {
  export default function prepareBoxplotData(
    rawData: number[][],
    opt?: { boundIQR?: number | "none"; layout?: "horizontal" | "vertical" },
  ): {
    boxData: number[][];
    outliers: number[][];
    axisData: string[];
  };
}
