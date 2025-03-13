import { NodeProps, useReactFlow } from "@xyflow/react";

import { uuid, randomLabel } from "../utils";

// 该钩子实现了点击占位节点的逻辑
// 点击占位节点时: 将占位节点及其连接边转变为工作流节点
export function usePlaceholderClick(id: NodeProps["id"]) {
  const { getNode, setNodes, setEdges } = useReactFlow();

  const onClick = () => {
    // 我们需要父节点对象来获取其位置
    const parentNode = getNode(id);

    if (!parentNode) {
      return;
    }

    // 为将作为被点击节点子节点的占位节点创建一个唯一ID
    const childPlaceholderId = uuid();

    // 创建一个将作为被点击节点子节点的占位节点
    const childPlaceholderNode = {
      id: childPlaceholderId,
      // 占位节点放置在被点击节点的位置上
      // 布局函数将使其动画过渡到新位置
      position: { x: parentNode.position.x, y: parentNode.position.y },
      type: "placeholder",
      data: { label: "+" },
    };

    // 我们需要从被点击节点到新占位节点的连接
    const childPlaceholderEdge = {
      id: `${parentNode.id}=>${childPlaceholderId}`,
      source: parentNode.id,
      target: childPlaceholderId,
      type: "placeholder",
    };

    setNodes((nodes) =>
      nodes
        .map((node) => {
          // 这里我们将被点击节点的类型从占位节点改为工作流节点
          if (node.id === id) {
            return {
              ...node,
              type: "workflow",
              data: { label: randomLabel() },
            };
          }
          return node;
        })
        // 添加新的占位节点
        .concat([childPlaceholderNode])
    );

    setEdges((edges) =>
      edges
        .map((edge) => {
          // 这里我们将连接边的类型从占位类型改为工作流类型
          if (edge.target === id) {
            return {
              ...edge,
              type: "workflow",
            };
          }
          return edge;
        })
        // 添加新的占位边
        .concat([childPlaceholderEdge])
    );
  };

  return onClick;
}

export default usePlaceholderClick;
