import { ShapeComponents, type ShapeComponentProps } from "./types";

function Shape({ type, width, height, ...svgAttributes }: ShapeComponentProps) {
  const ShapeComponent = ShapeComponents[type];

  if (!ShapeComponent || !width || !height) {
    return null;
  }

  const strokeWidth = svgAttributes.strokeWidth
    ? +svgAttributes.strokeWidth
    : 0;

  // 减去 strokeWidth 以确保形状不会被截断。
  // 这样做是因为 SVG 不支持内嵌描边（参考：https://stackoverflow.com/questions/7241393/can-you-control-how-an-svgs-stroke-width-is-drawn）
  const innerWidth = width - 2 * strokeWidth;
  const innerHeight = height - 2 * strokeWidth;

  return (
    <svg width={width} height={height} className="shape-svg">
      {/* 通过 strokeWidth 对形状进行偏移，以确保为描边留出足够的空间 */}
      <g
        transform={`translate(${svgAttributes.strokeWidth ?? 0}, ${
          svgAttributes.strokeWidth ?? 0
        })`}
      >
        <ShapeComponent
          width={innerWidth}
          height={innerHeight}
          {...svgAttributes}
        />
      </g>
    </svg>
  );
}

export default Shape;
