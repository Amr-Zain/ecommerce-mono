export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface LineConfig {
  dataKey: string;
  stroke: string;
  strokeWidth?: number;
}

export interface BaseChartProps {
  title: string;
  description: string;
  height?: number;
  className?: string;
}

export interface LineChartProps extends BaseChartProps {
  data: ChartDataPoint[];
  lines: LineConfig[];
  xAxisKey: string;
}


export interface AreaChartProps extends BaseChartProps {
  data: ChartDataPoint[];
  areaKey: string;
  xAxisKey: string;
  stroke: string;
  fill: string;
}


export interface PieConfig {
  name: string;
  value: number;
  color: string;
}

export interface PieChartProps extends BaseChartProps {
  data: PieConfig[];
}

export interface BarConfig {
  dataKey: string;
  fill?: string;
  radius?: [number, number, number, number];
}

export interface BarChartProps extends BaseChartProps {
  data: ChartDataPoint[];
  barConfig: BarConfig;
  xAxisKey: string;
}