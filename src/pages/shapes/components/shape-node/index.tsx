import {
  NodeResizer,
  useStore,
  Handle,
  Position,
  useKeyPress,
  NodeProps,
} from "@xyflow/react";

import Shape from "../shape";
import { type ShapeType } from "../shape/types";
import NodeLabel from "./label";

export type ShapeNodeData = {
  type: ShapeType;
  color: string;
};

// 这将返回节点的当前尺寸（由 React Flow 内部测量得出）
function useNodeDimensions(id: string) {
  const node = useStore((state) => state.nodeLookup.get(id));
  return {
    width: node?.measured.width || 0,
    height: node?.measured.height || 0,
  };
}

function ShapeNode({ id, selected, data }: NodeProps) {
  const { color, type } = data as ShapeNodeData;

  const { width, height } = useNodeDimensions(id);
  const shiftKeyPressed = useKeyPress("Shift");
  const handleStyle = { backgroundColor: color };

  return (
    <>
      <NodeResizer
        color={color}
        keepAspectRatio={shiftKeyPressed}
        isVisible={selected}
      />
      <Shape
        type={type}
        width={width}
        height={height}
        fill={color}
        strokeWidth={2}
        stroke={color}
        fillOpacity={0.8}
      />
      <Handle
        style={handleStyle}
        id="top"
        type="source"
        position={Position.Top}
      />
      <Handle
        style={handleStyle}
        id="right"
        type="source"
        position={Position.Right}
      />
      <Handle
        style={handleStyle}
        id="bottom"
        type="source"
        position={Position.Bottom}
      />
      <Handle
        style={handleStyle}
        id="left"
        type="source"
        position={Position.Left}
      />
      <NodeLabel placeholder={data.type as string} />
    </>
  );
}

export default ShapeNode;
