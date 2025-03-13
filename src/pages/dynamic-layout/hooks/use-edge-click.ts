import { EdgeProps, useReactFlow } from "@xyflow/react";

import { uuid, randomLabel } from "../utils";

// 这个钩子实现了工作流边缘上按钮点击的逻辑
// 点击边缘时：在连接的两个节点之间创建一个新节点
function useEdgeClick(id: EdgeProps["id"]) {
  const { setEdges, setNodes, getNode, getEdge } = useReactFlow();

  const handleEdgeClick = () => {
    // 首先获取边缘对象以获取源节点和目标节点的 id
    const edge = getEdge(id);

    if (!edge) {
      return;
    }

    // 获取目标节点以获取其位置
    const targetNode = getNode(edge.target);

    if (!targetNode) {
      return;
    }

    // 为新添加的元素创建一个唯一的 id
    const insertNodeId = uuid();

    // 这是将在源节点和目标节点之间添加的节点对象
    const insertNode = {
      id: insertNodeId,
      // 我们将节点放置在目标节点的当前位置（防止跳动）
      position: { x: targetNode.position.x, y: targetNode.position.y },
      data: { label: randomLabel() },
      type: "workflow",
    };

    // 从源节点到新节点的新连接
    const sourceEdge = {
      id: `${edge.source}->${insertNodeId}`,
      source: edge.source,
      target: insertNodeId,
      type: "workflow",
    };

    // 从新节点到目标节点的新连接
    const targetEdge = {
      id: `${insertNodeId}->${edge.target}`,
      source: insertNodeId,
      target: edge.target,
      type: "workflow",
    };

    // 删除被点击的边缘，因为我们有了一个中间有节点的新连接
    setEdges((edges) =>
      edges.filter((e) => e.id !== id).concat([sourceEdge, targetEdge])
    );

    // 在 React Flow 状态中将节点插入源节点和目标节点之间
    setNodes((nodes) => {
      const targetNodeIndex = nodes.findIndex(
        (node) => node.id === edge.target
      );

      return [
        ...nodes.slice(0, targetNodeIndex),
        insertNode,
        ...nodes.slice(targetNodeIndex, nodes.length),
      ];
    });
  };

  return handleEdgeClick;
}

export default useEdgeClick;
