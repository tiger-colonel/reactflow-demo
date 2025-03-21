import {
  XYPosition,
  type Node,
  type NodeOrigin,
  type Rect,
  type Box,
} from "@xyflow/react";

export const rectToBox = ({ x, y, width, height }: Rect): Box => ({
  x,
  y,
  x2: x + width,
  y2: y + height,
});

export const boxToRect = ({ x, y, x2, y2 }: Box): Rect => ({
  x,
  y,
  width: x2 - x,
  height: y2 - y,
});

export const getBoundsOfBoxes = (box1: Box, box2: Box): Box => ({
  x: Math.min(box1.x, box2.x),
  y: Math.min(box1.y, box2.y),
  x2: Math.max(box1.x2, box2.x2),
  y2: Math.max(box1.y2, box2.y2),
});

export function getNodeDimensions(node: {
  measured?: { width?: number; height?: number };
  width?: number;
  height?: number;
  initialWidth?: number;
  initialHeight?: number;
}): { width: number; height: number } {
  return {
    width: node.measured?.width ?? node.width ?? node.initialWidth ?? 0,
    height: node.measured?.height ?? node.height ?? node.initialHeight ?? 0,
  };
}

export const getNodePositionWithOrigin = (
  node: Node,
  nodeOrigin: NodeOrigin = [0, 0]
): XYPosition => {
  const { width, height } = getNodeDimensions(node);
  const origin = node.origin ?? nodeOrigin;
  const offsetX = width * origin[0];
  const offsetY = height * origin[1];

  return {
    x: node.position.x - offsetX,
    y: node.position.y - offsetY,
  };
};

// 确保父节点在子节点之前渲染。
export const sortNodes = (a: Node, b: Node): number => {
  if (a.type === b.type) {
    return 0;
  }
  return a.type === "group" && b.type !== "group" ? -1 : 1;
};

export const getId = (prefix = "node") => `${prefix}_${Math.random() * 10000}`;

export const getNodePositionInsideParent = (
  node: Partial<Node>,
  groupNode: Node
) => {
  const position = node.position ?? { x: 0, y: 0 };
  const nodeWidth = node.measured?.width ?? 0;
  const nodeHeight = node.measured?.height ?? 0;
  const groupWidth = groupNode.measured?.width ?? 0;
  const groupHeight = groupNode.measured?.height ?? 0;

  if (position.x < groupNode.position.x) {
    position.x = 0;
  } else if (position.x + nodeWidth > groupNode.position.x + groupWidth) {
    position.x = groupWidth - nodeWidth;
  } else {
    position.x = position.x - groupNode.position.x;
  }

  if (position.y < groupNode.position.y) {
    position.y = 0;
  } else if (position.y + nodeHeight > groupNode.position.y + groupHeight) {
    position.y = groupHeight - nodeHeight;
  } else {
    position.y = position.y - groupNode.position.y;
  }

  return position;
};

export const getRelativeNodesBounds = (
  nodes: Node[],
  nodeOrigin: NodeOrigin = [0, 0]
): Rect => {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const box = nodes.reduce(
    (currBox, node) => {
      const { x, y } = getNodePositionWithOrigin(node, nodeOrigin);
      return getBoundsOfBoxes(
        currBox,
        rectToBox({
          x,
          y,
          width: node.width || 0,
          height: node.height || 0,
        })
      );
    },
    { x: Infinity, y: Infinity, x2: -Infinity, y2: -Infinity }
  );

  return boxToRect(box);
};
