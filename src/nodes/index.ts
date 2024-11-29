import type { NodeTypes } from "@xyflow/react";

// import { PositionLoggerNode } from "./PositionLoggerNode";
// import { AppNode } from "./types";
import type { Node } from "@xyflow/react";

export const initialNodes: Node[] = [
  {
    id: "a",
    type: "default",
    position: { x: 0, y: 0 },
    data: { label: "wire" },
  },
  // {
  //   id: "b",
  //   type: "position-logger",
  //   position: { x: -100, y: 100 },
  //   data: { label: "drag me!" },
  // },
  // { id: 'c', position: { x: 100, y: 100 }, data: { label: 'your ideas' } },
  // {
  //   id: 'd',
  //   type: 'output',
  //   position: { x: 0, y: 200 },
  //   data: { label: 'with React Flow' },
  // },
];

export const nodeTypes = {
  // "position-logger": PositionLoggerNode,
  // Add any of your custom nodes here!
} satisfies NodeTypes;
