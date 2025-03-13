import { useCallback } from "react";
import { NodeProps, useReactFlow, getOutgoers } from "@xyflow/react";

import { uuid, randomLabel } from "../utils";

// 这个hook实现了点击工作流节点的逻辑
// 点击工作流节点时：创建被点击节点的新子节点
export function useNodeClick(id: NodeProps["id"]) {
  const { setEdges, setNodes, getNodes, getEdges, getNode } = useReactFlow();

  const onClick = useCallback(() => {
    // 我们需要父节点对象来定位新的子节点
    const parentNode = getNode(id);

    if (!parentNode) {
      return;
    }

    // 为子节点创建一个唯一的ID
    const childNodeId = uuid();

    // 为占位符创建一个唯一的ID（占位符会被添加到新的子节点中）
    const childPlaceholderId = uuid();

    // 创建子节点
    const childNode = {
      id: childNodeId,
      // 我们尝试将子节点放置在布局算法计算出的位置附近
      // 在父节点下方150像素，这个间距可以在useLayout hook中调整
      position: { x: parentNode.position.x, y: parentNode.position.y + 150 },
      type: "workflow",
      data: { label: randomLabel() },
    };

    // 为新的子节点创建一个占位符
    // 我们希望为所有还没有子节点的工作流节点显示一个占位符
    // 由于新创建的节点没有子节点，它会得到这个占位符
    const childPlaceholderNode = {
      id: childPlaceholderId,
      // 我们将占位符放置在子节点下方150像素处，间距可以在useLayout hook中调整
      position: { x: childNode.position.x, y: childNode.position.y + 150 },
      type: "placeholder",
      data: { label: "+" },
    };

    // 我们需要创建从父节点到子节点的连接
    const childEdge = {
      id: `${parentNode.id}=>${childNodeId}`,
      source: parentNode.id,
      target: childNodeId,
      type: "workflow",
    };

    // 我们需要创建从子节点到占位符的连接
    const childPlaceholderEdge = {
      id: `${childNodeId}=>${childPlaceholderId}`,
      source: childNodeId,
      target: childPlaceholderId,
      type: "placeholder",
    };

    // 如果被点击的节点有任何作为子节点的占位符，我们移除它们，因为它现在将得到一个子节点
    const existingPlaceholders = getOutgoers(parentNode, getNodes(), getEdges())
      .filter((node) => node.type === "placeholder")
      .map((node) => node.id);

    // 添加新节点（子节点和占位符），过滤掉被点击节点的现有占位符节点
    setNodes((nodes) =>
      nodes
        .filter((node) => !existingPlaceholders.includes(node.id))
        .concat([childNode, childPlaceholderNode])
    );

    // 添加新边（节点 -> 子节点，子节点 -> 占位符），过滤掉任何占位符边缘
    setEdges((edges) =>
      edges
        .filter((edge) => !existingPlaceholders.includes(edge.target))
        .concat([childEdge, childPlaceholderEdge])
    );
  }, [getEdges, getNode, getNodes, id, setEdges, setNodes]);

  return onClick;
}

export default useNodeClick;
