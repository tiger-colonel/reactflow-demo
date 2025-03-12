/* eslint-disable react-func/max-lines-per-function */
import { useRef, type DragEvent, useCallback } from "react";
import { isNil } from "lodash";
import { nanoid } from "nanoid";
import {
  ReactFlowInstance,
  Node,
  NodeChange,
  Connection,
  MarkerType,
  OnConnectStartParams,
  addEdge,
  useStoreApi,
  Edge,
} from "reactflow";

export const useDragHook = ({
  graphRef,
  instance,
  setLock,
  setNodes,
}: {
  graphRef: React.RefObject<HTMLDivElement>;
  instance: ReactFlowInstance | null;
  setLock?: (lock: boolean) => void;
  setNodes: (nodes: any) => void;
}) => {
  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();

    // 节点类型，
    const itemString = e.dataTransfer.getData("application/reactflow");
    const item = JSON.parse(itemString);

    if (isNil(graphRef.current) || isNil(instance) || !item.type) {
      return;
    }

    /**
     * 获取松开时的坐标
     * 用 project 将像素坐标转换为内部 ReactFlow 坐标系
     */
    const rect = graphRef.current.getBoundingClientRect();
    const position = instance.project({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    const nodeId = nanoid(6);
    const node = {
      ...item,
      id: nodeId,
      position,
      draggable: true,
      data: {
        ...item.data,
        label: `${item.type?.replace("Node", "")}_${nodeId}`,
        width: 200,
        height: 100,
      },
    };

    // 保存节点配置信息
    setNodes((nds: any) => nds.concat(node));
    setLock?.(true);
  }
  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  return {
    onDrop,
    onDragOver,
  };
};

export const useConnectHook = ({
  setEdges,
  setLock,
}: {
  setEdges: (edges: any) => void;
  setLock?: (lock: boolean) => void;
}) => {
  const connectingNodeId = useRef<string | null>(null);
  const onConnect = (params: Connection) => {
    const edge = {
      ...params,
      type: "custom",
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    };

    setEdges((edges: any) => addEdge(edge, edges));
    setLock?.(true);
  };

  const onConnectStart = (e: any, { nodeId }: OnConnectStartParams) => {
    connectingNodeId.current = nodeId;
  };

  return {
    onConnect,
    onConnectStart,
  };
};

const MIN_DISTANCE = 200;

export const useNodeDragHook = ({
  setEdges,
}: {
  setEdges: (edges: any) => void;
}) => {
  const store = useStoreApi();

  const getClosestEdge = useCallback((node: Node) => {
    const { nodeInternals } = store.getState();
    const storeNodes = Array.from(nodeInternals.values());

    const closestNode = storeNodes.reduce(
      (res, n) => {
        if (n.id !== node.id) {
          const dx = n.positionAbsolute!.x - node.positionAbsolute!.x;
          const dy = n.positionAbsolute!.y - node.positionAbsolute!.y;
          const d = Math.sqrt(dx * dx + dy * dy);

          if (d < res.distance && d < MIN_DISTANCE) {
            res.distance = d;
            res.node = n;
          }
        }

        return res;
      },
      {
        distance: Number.MAX_VALUE,
        node: null,
      } as { distance: number; node: Node | null }
    );

    if (!closestNode.node) {
      return null;
    }

    const closeNodeIsSource =
      closestNode.node.positionAbsolute!.x < node.positionAbsolute!.x;

    return {
      id: closeNodeIsSource
        ? `${closestNode.node.id}-${node.id}`
        : `${node.id}-${closestNode.node.id}`,
      source: closeNodeIsSource ? closestNode.node.id : node.id,
      target: closeNodeIsSource ? node.id : closestNode.node.id,
    };
  }, []);

  const onNodeDrag = useCallback(
    (_: any, node: Node) => {
      const closeEdge = getClosestEdge(node);

      setEdges((es: Edge[]) => {
        const nextEdges = es.filter((e) => e.className !== "temp");

        if (
          closeEdge &&
          !nextEdges.find(
            (ne) =>
              ne.source === closeEdge.source && ne.target === closeEdge.target
          )
        ) {
          (closeEdge as any).className = "temp";
          nextEdges.push({
            ...closeEdge,
            type: "custom",
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          });
        }

        return nextEdges;
      });
    },
    [getClosestEdge, setEdges]
  );

  const onNodeDragStop = useCallback(
    (_: any, node: Node) => {
      const closeEdge = getClosestEdge(node);

      setEdges((es: Edge[]) => {
        const nextEdges = es.filter((e) => e.className !== "temp");

        if (
          closeEdge &&
          !nextEdges.find(
            (ne) =>
              ne.source === closeEdge.source && ne.target === closeEdge.target
          )
        ) {
          nextEdges.push({
            ...closeEdge,
            type: "custom",
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          });
        }

        return nextEdges;
      });
    },
    [getClosestEdge]
  );

  return {
    onNodeDrag,
    onNodeDragStop,
  };
};
