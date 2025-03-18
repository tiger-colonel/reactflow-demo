import { useCallback, useEffect, useState } from "react";
import {
  type Node,
  type Edge,
  type OnNodesChange,
  applyNodeChanges,
  getConnectedEdges,
} from "@xyflow/react";
import * as Y from "yjs";

import useYjs from "../useYjs";

function useNodesStateSynced(
  roomName: string
): [Node[], React.Dispatch<React.SetStateAction<Node[]>>, OnNodesChange] {
  const { ydoc } = useYjs(roomName);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [nodesMap, setNodesMap] = useState<Y.Map<Node> | null>(null);
  const [edgesMap, setEdgesMap] = useState<Y.Map<Edge> | null>(null);

  // 当 ydoc 初始化完成后，创建 nodesMap 和 edgesMap
  useEffect(() => {
    if (!ydoc) return;

    // 创建 nodes 和 edges 的 Map
    const nodes = ydoc.getMap<Node>("nodes");
    const edges = ydoc.getMap<Edge>("edges");

    setNodesMap(nodes);
    setEdgesMap(edges);

    // 初始加载节点
    setNodes(Array.from(nodes.values()));

    return () => {
      setNodesMap(null);
      setEdgesMap(null);
    };
  }, [ydoc]);

  const setNodesSynced = useCallback(
    (nodesOrUpdater: React.SetStateAction<Node[]>) => {
      if (!nodesMap) return;

      const seen = new Set<string>();
      const next =
        typeof nodesOrUpdater === "function"
          ? nodesOrUpdater([...nodesMap.values()])
          : nodesOrUpdater;

      // 使用事务包装所有更改，确保原子性
      nodesMap.doc?.transact(() => {
        for (const node of next) {
          seen.add(node.id);
          nodesMap.set(node.id, node);
        }
        for (const node of nodesMap.values()) {
          if (!seen.has(node.id)) {
            nodesMap.delete(node.id);
          }
        }
      });
    },
    [nodesMap]
  );

  const onNodesChanges: OnNodesChange = useCallback(
    (changes) => {
      if (!nodesMap || !edgesMap) return;

      const currentNodes = Array.from(nodesMap.values());
      const nextNodes = applyNodeChanges(changes, currentNodes);

      // 使用事务包装所有更改
      nodesMap.doc?.transact(() => {
        for (const change of changes) {
          if (change.type === "add") {
            nodesMap.set(change.item.id, change.item);
          } else if (change.type === "remove" && nodesMap.has(change.id)) {
            const deletedNode = nodesMap.get(change.id)!;
            const connectedEdges = getConnectedEdges(
              [deletedNode],
              [...edgesMap.values()]
            );
            nodesMap.delete(change.id);
            for (const edge of connectedEdges) {
              edgesMap.delete(edge.id);
            }
          } else {
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

  // 观察 nodesMap 的变化
  useEffect(() => {
    if (!nodesMap) return;

    const observer = () => {
      setNodes(Array.from(nodesMap.values()));
    };

    nodesMap.observe(observer);
    setNodes(Array.from(nodesMap.values()));

    return () => {
      if (nodesMap) {
        nodesMap.unobserve(observer);
      }
    };
  }, [nodesMap]);

  return [nodes, setNodesSynced, onNodesChanges];
}

export default useNodesStateSynced;
