import { type MiniMapNodeProps, useStore } from "@xyflow/react";
import { ShapeComponents, ShapeType } from "../shape/types";

// 自定义小地图节点也被用于在小地图中渲染节点的形状
function MiniMapNode({ id, width, height, x, y, selected }: MiniMapNodeProps) {
  // 获取节点数据，以便根据数据渲染相应的形状
  const { color, type }: { color: string; type: ShapeType } = useStore(
    (state) => state.nodeLookup.get(id)?.data || {}
  );

  if (!color || !type) {
    return null;
  }

  const ShapeComponent = ShapeComponents[type];

  return (
    <g transform={`translate(${x}, ${y})`}>
      <ShapeComponent
        width={width}
        height={height}
        fill={color}
        strokeWidth={selected ? 6 : 0}
        className={
          selected
            ? "react-flow__minimap-node selected"
            : "react-flow__minimap-node"
        }
      />
    </g>
  );
}

export default MiniMapNode;
