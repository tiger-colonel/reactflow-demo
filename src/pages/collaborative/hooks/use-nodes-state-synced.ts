import { useCallback, useEffect, useRef, useState } from "react";
import {
  type Node,
  type OnNodesChange,
  applyNodeChanges,
  getConnectedEdges,
} from "@xyflow/react";

// import * as Y from "yjs";
// import { WebsocketProvider } from "../socket";
// import ydoc, { wsProvider } from "../ydoc";
// import { edgesMap } from "./use-edges-state-synced";

// 使用 nodesMap 作为节点的唯一真实来源（single source of truth）。
// 所有的节点变更都是直接在 map 对象上进行的
// 每当 map 发生变化时，都会更新节点的状态。
// export const nodesMap = ydoc.getMap<Node>("nodes");

function useNodesStateSynced(): [
  Node[],
  React.Dispatch<React.SetStateAction<Node[]>>,
  OnNodesChange
] {
  const [nodes, setNodes] = useState<Node[]>([]);

  // const ydoc = useRef<Y.Doc | null>(null);
  // const provider = useRef<WebsocketProvider | null>(null);

  useEffect(() => {
    // // 初始化 Yjs 文档
    // ydoc.current = new Y.Doc();
    // // 创建 WebSocket 连接
    // provider.current = new WebsocketProvider("test-room", (update) => {
    //   Y.applyUpdate(ydoc.current!, update);
    // });
    // // 监听 Yjs 文档内容变化，更新 React 状态
    // const ytext = ydoc.current.getText("content");
    // ytext.observe(() => {
    //   // setNodes(ytext.toString());
    // });
    // // 接收远程更新
    // ydoc.current.on("update", (update: Uint8Array) => {
    //   provider.current!.sendUpdate(update);
    // });
    // // 清理函数
    // return () => {
    //   ydoc.current?.destroy();
    //   provider.current?.destroy();
    // };
  }, []);

  const setNodesSynced = useCallback(
    (nodesOrUpdater: React.SetStateAction<Node[]>) => {
      // const seen = new Set<string>();
      // const next =
      //   typeof nodesOrUpdater === "function"
      //     ? nodesOrUpdater([...nodesMap.values()])
      //     : nodesOrUpdater;
      // for (const node of next) {
      //   seen.add(node.id);
      //   nodesMap.set(node.id, node);
      // }
      // for (const node of nodesMap.values()) {
      //   if (!seen.has(node.id)) {
      //     nodesMap.delete(node.id);
      //   }
      // }
    },
    []
  );

  // onNodesChange 回调函数负责更新 nodesMap
  // 当这些变更应用到 map 对象时，观察者（observer）会被触发，从而更新节点的状态。
  const onNodesChanges: OnNodesChange = useCallback((changes) => {
    // const nodes = Array.from(nodesMap.values());
    // const nextNodes = applyNodeChanges(changes, nodes);
    // for (const change of changes) {
    //   if (change.type === "add") {
    //     nodesMap.set(change.item.id, change.item);
    //   } else if (change.type === "remove" && nodesMap.has(change.id)) {
    //     const deletedNode = nodesMap.get(change.id)!;
    //     const connectedEdges = getConnectedEdges(
    //       [deletedNode],
    //       [...edgesMap.values()]
    //     );
    //     nodesMap.delete(change.id);
    //     for (const edge of connectedEdges) {
    //       edgesMap.delete(edge.id);
    //     }
    //   } else {
    //     nodesMap.set(change.id, nextNodes.find((n) => n.id === change.id)!);
    //   }
    // }
  }, []);

  // 观察 nodesMap，并在 map 发生变化时更新 nodes 状态
  // useEffect(() => {
  //   const observer = () => {
  //     setNodes(Array.from(nodesMap.values()));
  //   };

  //   setNodes(Array.from(nodesMap.values()));
  //   nodesMap.observe(observer);

  //   return () => nodesMap.unobserve(observer);
  // }, [setNodes]);

  return [nodes, setNodesSynced, onNodesChanges];
}

export default useNodesStateSynced;
