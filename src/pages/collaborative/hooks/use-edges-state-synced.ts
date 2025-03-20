import { useCallback, useEffect, useState } from "react";
import { type Edge, type OnEdgesChange, applyEdgeChanges } from "@xyflow/react";
import * as Y from "yjs";
import useProvider from "./use-provider";

/**
 * 用于实时协作环境中同步边状态的自定义Hook
 * 使用Yjs共享数据结构在多用户间保持边的状态同步
 *
 * @param roomName - 协作房间名称标识符
 * @returns [边数组, 设置边函数, 边变化处理函数]
 */
function useEdgesStateSynced(
  roomName: string = "example-document"
): [Edge[], React.Dispatch<React.SetStateAction<Edge[]>>, OnEdgesChange] {
  const { document } = useProvider(roomName);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [edgesMap, setEdgesMap] = useState<Y.Map<Edge> | null>(null);

  /**
   * 初始化共享数据结构
   * 当Yjs文档准备就绪时，设置共享边映射并加载初始边
   */
  useEffect(() => {
    if (!document) return;

    // 获取或创建共享边映射
    const sharedEdges = document.getMap<Edge>("edges");
    setEdgesMap(sharedEdges);

    // 从共享状态初始化本地状态
    setEdges(Array.from(sharedEdges.values()));

    return () => {
      setEdgesMap(null);
    };
  }, [document]);

  /**
   * 同步设置边的函数
   * 支持直接设置和函数式更新，并将更改同步到共享文档
   */
  const setEdgesSynced = useCallback(
    (edgesOrUpdater: React.SetStateAction<Edge[]>) => {
      if (!edgesMap) return;

      // 确定最终边状态
      const nextEdges =
        typeof edgesOrUpdater === "function"
          ? edgesOrUpdater([...edgesMap.values()])
          : edgesOrUpdater;

      // 使用事务包装所有更改，确保原子性
      edgesMap.doc?.transact(() => {
        // 用于跟踪已处理边，便于删除不再存在的边
        const existingEdgeIds = new Set<string>();

        // 添加或更新边
        for (const edge of nextEdges) {
          existingEdgeIds.add(edge.id);
          edgesMap.set(edge.id, edge);
        }

        // 删除不再存在的边
        for (const edge of edgesMap.values()) {
          if (!existingEdgeIds.has(edge.id)) {
            edgesMap.delete(edge.id);
          }
        }
      });
    },
    [edgesMap]
  );

  /**
   * 处理边变化的回调函数
   * 处理添加、删除和更新操作，并同步到共享文档
   */
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      if (!edgesMap) return;

      const currentEdges = Array.from(edgesMap.values());
      const nextEdges = applyEdgeChanges(changes, currentEdges);

      // 使用事务确保所有更改一起应用
      edgesMap.doc?.transact(() => {
        for (const change of changes) {
          // 处理边添加
          if (change.type === "add") {
            edgesMap.set(change.item.id, change.item);
          }
          // 处理边删除
          else if (change.type === "remove" && edgesMap.has(change.id)) {
            edgesMap.delete(change.id);
          }
          // 处理边更新
          else {
            const updatedEdge = nextEdges.find((e) => e.id === change.id);
            if (updatedEdge) {
              edgesMap.set(change.id, updatedEdge);
            }
          }
        }
      });
    },
    [edgesMap]
  );

  /**
   * 监听共享边映射的变化
   * 当任何用户更改共享状态时更新本地状态
   */
  useEffect(() => {
    if (!edgesMap) return;

    // 当共享状态变化时更新本地状态
    const observer = () => {
      setEdges(Array.from(edgesMap.values()));
    };

    // 注册观察者并设置初始状态
    edgesMap.observe(observer);
    setEdges(Array.from(edgesMap.values()));

    // 清理函数
    return () => {
      if (edgesMap) {
        edgesMap.unobserve(observer);
      }
    };
  }, [edgesMap]);

  return [edges, setEdgesSynced, onEdgesChange];
}

export default useEdgesStateSynced;
