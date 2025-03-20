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

/**
 * 用于实时协作环境中同步节点状态的自定义Hook
 * 使用Yjs共享数据结构在多用户间保持状态同步
 *
 * @param roomName - 协作房间名称标识符
 * @returns [节点数组, 设置节点函数, 节点变化处理函数]
 */
function useNodesStateSynced(
  roomName: string = "example-document"
): [Node[], React.Dispatch<React.SetStateAction<Node[]>>, OnNodesChange] {
  const { document } = useProvider(roomName);

  // 本地状态
  const [nodes, setNodes] = useState<Node[]>([]);
  const [nodesMap, setNodesMap] = useState<Y.Map<Node> | null>(null);
  const [edgesMap, setEdgesMap] = useState<Y.Map<Edge> | null>(null);

  /**
   * 初始化共享数据结构
   * 当Yjs文档准备就绪时，设置共享地图并加载初始节点
   */
  useEffect(() => {
    if (!document) return;

    // 获取或创建共享数据结构
    const sharedNodes = document.getMap<Node>("nodes");
    const sharedEdges = document.getMap<Edge>("edges");

    setNodesMap(sharedNodes);
    setEdgesMap(sharedEdges);

    // 从共享状态初始化本地状态
    setNodes(Array.from(sharedNodes.values()));

    return () => {
      setNodesMap(null);
      setEdgesMap(null);
    };
  }, [document]);

  /**
   * 同步设置节点的函数
   * 支持直接设置和函数式更新，并将更改同步到共享文档
   */
  const setNodesSynced = useCallback(
    (nodesOrUpdater: React.SetStateAction<Node[]>) => {
      if (!nodesMap) return;

      // 用于跟踪已处理节点，便于删除不再存在的节点
      const existingNodeIds = new Set<string>();

      // 确定最终节点状态
      const nextNodes =
        typeof nodesOrUpdater === "function"
          ? nodesOrUpdater([...nodesMap.values()])
          : nodesOrUpdater;

      // 使用事务包装所有更改，确保原子性
      nodesMap.doc?.transact(() => {
        // 添加或更新节点
        for (const node of nextNodes) {
          existingNodeIds.add(node.id);
          nodesMap.set(node.id, node);
        }

        // 删除不再存在的节点
        for (const node of nodesMap.values()) {
          if (!existingNodeIds.has(node.id)) {
            nodesMap.delete(node.id);
          }
        }
      });
    },
    [nodesMap]
  );

  /**
   * 处理节点变化的回调函数
   * 处理添加、删除和更新操作，并同步到共享文档
   */
  const onNodesChanges: OnNodesChange = useCallback(
    (changes) => {
      if (!nodesMap || !edgesMap) return;

      const currentNodes = Array.from(nodesMap.values());
      const nextNodes = applyNodeChanges(changes, currentNodes);

      // 使用事务确保所有更改一起应用
      nodesMap.doc?.transact(() => {
        for (const change of changes) {
          // 处理节点添加
          if (change.type === "add") {
            nodesMap.set(change.item.id, change.item);
          }
          // 处理节点删除（同时删除相关边）
          else if (change.type === "remove" && nodesMap.has(change.id)) {
            const deletedNode = nodesMap.get(change.id)!;

            // 查找并删除与此节点相连的所有边
            const connectedEdges = getConnectedEdges(
              [deletedNode],
              [...edgesMap.values()]
            );

            // 删除节点和相关边
            nodesMap.delete(change.id);
            for (const edge of connectedEdges) {
              edgesMap.delete(edge.id);
            }
          }
          // 处理节点更新
          else {
            const updatedNode = nextNodes.find((n) => n.id === change.id);
            if (updatedNode) {
              nodesMap.set(change.id, updatedNode);
            }
          }
        }
      });
    },
    [nodesMap, edgesMap]
  );

  /**
   * 监听共享节点映射的变化
   * 当任何用户更改共享状态时更新本地状态
   */
  useEffect(() => {
    if (!nodesMap) return;

    const currentNodes = Array.from(nodesMap.values());
    if (!currentNodes?.length) return;

    // 当共享状态变化时更新本地状态
    const observer = () => {
      setNodes(Array.from(nodesMap.values()));
    };

    // 注册观察者并设置初始状态
    nodesMap.observe(observer);
    setNodes(currentNodes);

    // 清理函数
    return () => {
      if (nodesMap) {
        nodesMap.unobserve(observer);
      }
    };
  }, [nodesMap]);

  return [nodes, setNodesSynced, onNodesChanges];
}

export default useNodesStateSynced;
