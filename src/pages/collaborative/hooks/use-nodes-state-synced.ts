import { useCallback, useEffect, useState } from "react";
import {
  type Node,
  type Edge,
  type OnNodesChange,
  applyNodeChanges,
  getConnectedEdges,
} from "@xyflow/react";
import * as Y from "yjs";
import useProvider from "./use-provider";

function useNodesStateSynced(
  roomName: string
): [Node[], React.Dispatch<React.SetStateAction<Node[]>>, OnNodesChange] {
  const { document } = useProvider(roomName);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [nodesMap, setNodesMap] = useState<Y.Map<Node> | null>(null);
  const [edgesMap, setEdgesMap] = useState<Y.Map<Edge> | null>(null);

  // 初始化共享数据结构
  useEffect(() => {
    if (!document) return;

    // 获取或创建共享数据映射
    const nodesSharedMap = document.getMap<Node>("nodes");
    const edgesSharedMap = document.getMap<Edge>("edges");

    setNodesMap(nodesSharedMap);
    setEdgesMap(edgesSharedMap);

    // 初始化本地状态
    setNodes(Array.from(nodesSharedMap.values()));

    return () => {
      setNodesMap(null);
      setEdgesMap(null);
    };
  }, [document]);

  // 同步设置节点状态的函数
  const setNodesSynced = useCallback(
    (nodesOrUpdater: React.SetStateAction<Node[]>) => {
      if (!nodesMap) return;

      // 计算新的节点集合
      const nextNodes =
        typeof nodesOrUpdater === "function"
          ? nodesOrUpdater([...nodesMap.values()])
          : nodesOrUpdater;

      // 在单个事务中批量更新所有节点
      updateNodesInTransaction(nodesMap, nextNodes);
    },
    [nodesMap]
  );

  // 处理节点变更的回调函数
  const onNodesChanges: OnNodesChange = useCallback(
    (changes) => {
      if (!nodesMap || !edgesMap) return;

      const currentNodes = Array.from(nodesMap.values());

      // 提取要删除的节点ID
      const nodesToDelete = changes
        .filter((change) => change.type === "remove")
        .map((change) => change.id);

      // 应用所有节点变更
      const nextNodes = applyNodeChanges(changes, currentNodes);

      // 使用事务包装所有更改
      nodesMap.doc?.transact(() => {
        // 处理节点更新
        updateNodesInTransaction(nodesMap, nextNodes);

        // 如果有节点被删除，同时处理关联的边
        if (nodesToDelete.length > 0) {
          deleteRelatedEdges(nodesToDelete, currentNodes, edgesMap);
        }
      });
    },
    [nodesMap, edgesMap]
  );

  // 监听共享数据的变化
  useEffect(() => {
    if (!nodesMap) return;

    const observer = () => {
      setNodes(Array.from(nodesMap.values()));
    };

    nodesMap.observe(observer);
    setNodes(Array.from(nodesMap.values())); // 初始化

    return () => {
      nodesMap.unobserve(observer);
    };
  }, [nodesMap]);

  return [nodes, setNodesSynced, onNodesChanges];
}

// 辅助函数：在事务中更新节点集合
function updateNodesInTransaction(nodesMap: Y.Map<Node>, nextNodes: Node[]) {
  // 记录新节点集合中的所有ID
  const newNodeIds = new Set<string>();

  // 更新或添加节点
  for (const node of nextNodes) {
    newNodeIds.add(node.id);
    nodesMap.set(node.id, node);
  }

  // 删除不再存在的节点
  for (const nodeId of nodesMap.keys()) {
    if (!newNodeIds.has(nodeId)) {
      nodesMap.delete(nodeId);
    }
  }
}

// 辅助函数：删除与指定节点关联的边
function deleteRelatedEdges(
  nodeIdsToDelete: string[],
  currentNodes: Node[],
  edgesMap: Y.Map<Edge>
) {
  // 找出要删除的节点对象
  const deletedNodes = currentNodes.filter((node) =>
    nodeIdsToDelete.includes(node.id)
  );

  // 找出与删除节点相连的所有边
  const connectedEdges = getConnectedEdges(deletedNodes, [
    ...edgesMap.values(),
  ]);

  // 删除关联的边
  for (const edge of connectedEdges) {
    edgesMap.delete(edge.id);
  }
}

export default useNodesStateSynced;
