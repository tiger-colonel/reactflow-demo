import { useCallback, useEffect, useState } from "react";
import { type Edge, type OnEdgesChange, applyEdgeChanges } from "@xyflow/react";
import * as Y from "yjs";
import useProvider from "./use-provider";

function useEdgesStateSynced(
  roomName: string = "example-document"
): [Edge[], React.Dispatch<React.SetStateAction<Edge[]>>, OnEdgesChange] {
  const { document } = useProvider(roomName);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [edgesMap, setEdgesMap] = useState<Y.Map<Edge> | null>(null);

  // 初始化共享数据结构
  useEffect(() => {
    if (!document) return;

    // 获取或创建共享边映射
    const edgesSharedMap = document.getMap<Edge>("edges");
    setEdgesMap(edgesSharedMap);

    // 初始化本地状态
    setEdges(Array.from(edgesSharedMap.values()));

    return () => {
      setEdgesMap(null);
    };
  }, [document]);

  // 同步设置边状态的函数
  const setEdgesSynced = useCallback(
    (edgesOrUpdater: React.SetStateAction<Edge[]>) => {
      if (!edgesMap) return;

      // 计算新的边集合
      const nextEdges =
        typeof edgesOrUpdater === "function"
          ? edgesOrUpdater([...edgesMap.values()])
          : edgesOrUpdater;

      // 在单个事务中批量更新所有边
      edgesMap.doc?.transact(() => {
        updateEdgesInTransaction(edgesMap, nextEdges);
      });
    },
    [edgesMap]
  );

  // 处理边变更的回调函数
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      if (!edgesMap) return;

      const currentEdges = Array.from(edgesMap.values());
      const nextEdges = applyEdgeChanges(changes, currentEdges);

      // 使用事务包装所有更改
      edgesMap.doc?.transact(() => {
        updateEdgesInTransaction(edgesMap, nextEdges);
      });
    },
    [edgesMap]
  );

  // 监听共享数据的变化
  useEffect(() => {
    if (!edgesMap) return;

    const observer = () => {
      setEdges(Array.from(edgesMap.values()));
    };

    edgesMap.observe(observer);
    setEdges(Array.from(edgesMap.values())); // 初始化

    return () => {
      edgesMap.unobserve(observer);
    };
  }, [edgesMap]);

  return [edges, setEdgesSynced, onEdgesChange];
}

// 辅助函数：在事务中更新边集合
function updateEdgesInTransaction(edgesMap: Y.Map<Edge>, nextEdges: Edge[]) {
  // 记录新边集合中的所有ID
  const newEdgeIds = new Set<string>();

  // 更新或添加边
  for (const edge of nextEdges) {
    newEdgeIds.add(edge.id);
    edgesMap.set(edge.id, edge);
  }

  // 删除不再存在的边
  for (const edgeId of edgesMap.keys()) {
    if (!newEdgeIds.has(edgeId)) {
      edgesMap.delete(edgeId);
    }
  }
}

export default useEdgesStateSynced;
