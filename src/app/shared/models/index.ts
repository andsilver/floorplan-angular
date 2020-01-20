export interface Furnish {
  title: string;
  width: number;
  height: number;
  lrSpacing: number;
  tbSpacing: number;
}

export interface Part {
  type: 'Canvas' | 'Group' | 'Rect' | 'Line' | 'Circle' | 'Ellipse' | 'Path' | 'Polygon' | 'Polyline' | 'Triangle';
  definition?: {
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    originX?: string;
    originY?: string;
    radius?: number;
    strokeWidth?: number;
    stroke?: string;
    fill?: string;
  };
  path?: string;
  line?: number[];
}

