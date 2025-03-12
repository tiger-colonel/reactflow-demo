import { type ShapeProps } from ".";

function Circle({ width, height, ...svgAttributes }: ShapeProps) {
  const selected = true;
  return (
    <ellipse
      cx={width / 2}
      cy={height / 2}
      rx={width / 2}
      ry={height / 2}
      fill="#784be8"
      strokeWidth={selected ? 2 : 0}
      stroke={selected ? "#ff0071" : "#784be8"}
      {...svgAttributes}
    />
  );
}

export default Circle;
