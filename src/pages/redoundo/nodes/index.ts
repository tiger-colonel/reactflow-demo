import type { NodeTypes } from "@xyflow/react";
import type { Node } from "@xyflow/react";

export const initialNodes: Node[] = [
  {
    id: "a",
    type: "default",
    position: { x: 0, y: 0 },
    data: { label: "Node 0" },
  },
];

export const nodeTypes = {
  // "position-logger": PositionLoggerNode,
  // Add any of your custom nodes here!
} satisfies NodeTypes;
