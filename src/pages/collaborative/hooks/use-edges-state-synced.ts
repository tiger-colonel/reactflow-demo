import { useCallback, useEffect, useState } from "react";
import { type Edge, type OnEdgesChange, applyEdgeChanges } from "@xyflow/react";
import * as Y from "yjs";

import useYjs from "../useYjs";

function useEdgesStateSynced(
  roomName: string
): [Edge[], React.Dispatch<React.SetStateAction<Edge[]>>, OnEdgesChange] {
  const { ydoc } = useYjs(roomName);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [edgesMap, setEdgesMap] = useState<Y.Map<Edge> | null>(null);

  // 当 ydoc 初始化完成后，创建 edgesMap
  useEffect(() => {
    if (!ydoc) return;

    // 创建 edges 的 Map
    const edges = ydoc.getMap<Edge>("edges");
    setEdgesMap(edges);

    // 初始加载边
    setEdges(Array.from(edges.values()));

    return () => {
      setEdgesMap(null);
    };
  }, [ydoc]);

  const setEdgesSynced = useCallback(
    (edgesOrUpdater: React.SetStateAction<Edge[]>) => {
      if (!edgesMap) return;

      const next =
        typeof edgesOrUpdater === "function"
          ? edgesOrUpdater([...edgesMap.values()])
          : edgesOrUpdater;

      // 使用事务包装所有更改
      edgesMap.doc?.transact(() => {
        const seen = new Set<string>();
        for (const edge of next) {
          seen.add(edge.id);
          edgesMap.set(edge.id, edge);
        }
        for (const edge of edgesMap.values()) {
          if (!seen.has(edge.id)) {
            edgesMap.delete(edge.id);
          }
        }
      });
    },
    [edgesMap]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      if (!edgesMap) return;

      const currentEdges = Array.from(edgesMap.values());
      const nextEdges = applyEdgeChanges(changes, currentEdges);

      // 使用事务包装所有更改
      edgesMap.doc?.transact(() => {
        for (const change of changes) {
          if (change.type === "add") {
            edgesMap.set(change.item.id, change.item);
          } else if (change.type === "remove" && edgesMap.has(change.id)) {
            edgesMap.delete(change.id);
          } else {
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

  // 观察 edgesMap 的变化
  useEffect(() => {
    if (!edgesMap) return;

    const observer = () => {
      setEdges(Array.from(edgesMap.values()));
    };

    edgesMap.observe(observer);
    setEdges(Array.from(edgesMap.values()));

    return () => {
      if (edgesMap) {
        edgesMap.unobserve(observer);
      }
    };
  }, [edgesMap]);

  return [edges, setEdgesSynced, onEdgesChange];
}

export default useEdgesStateSynced;
