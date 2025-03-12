import { type ShapeProps } from ".";

function RoundRect({ width, height, ...svgAttributes }: ShapeProps) {
  const rounding = Math.min(12, 0.2 * Math.min(width, height));

  // 选中状态直接是svg多边形的边框
  const selected = true;

  return (
    <rect
      x={0}
      y={0}
      rx={rounding}
      width={width}
      height={height}
      {...svgAttributes}
      fill="#784be8"
      strokeWidth={selected ? 8 : 0}
      stroke={selected ? "#ff0071" : "#784be8"}
    />
  );
}

export default RoundRect;
