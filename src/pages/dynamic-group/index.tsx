import { useCallback, DragEvent, MouseEvent } from "react";
import {
  Connection,
  Edge,
  Node,
  addEdge,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useStoreApi,
  Background,
  MarkerType,
  BackgroundVariant,
} from "@xyflow/react";

import {
  nodes as initialNodes,
  edges as initialEdges,
} from "./initial-elements";
import GroupNode from "./nodes/group-node";
import SimpleNode from "./nodes/simple-node";
import Sidebar from "./side-bar";
import SelectedNodesToolbar from "./selected-nodes-toolbar";
import { getId, getNodePositionInsideParent, sortNodes } from "./utils";

import "@xyflow/react/dist/style.css";
import styles from "./style.module.css";

const nodeTypes = {
  group: GroupNode,
  node: SimpleNode,
};

const defaultEdgeOptions = {
  style: {
    strokeWidth: 2,
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
  },
};

const onDragOver = (event: DragEvent) => {
  event.preventDefault();
  event.dataTransfer!.dropEffect = "move";
};

const DynamicGroup: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback(
    (edge: Edge | Connection) => setEdges((eds) => addEdge(edge, eds)),
    [setEdges]
  );

  const { screenToFlowPosition, getIntersectingNodes } = useReactFlow();
  const store = useStoreApi();

  // 从 panel 新建 node 节点
  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();

    const type = event.dataTransfer.getData("application/reactflow");
    const position = screenToFlowPosition({
      x: event.clientX - 20,
      y: event.clientY - 20,
    });
    // 新增节点
    const nodeStyle =
      type === "group" ? { width: 400, height: 200 } : undefined;

    const intersections = getIntersectingNodes({
      x: position.x,
      y: position.y,
      width: 40,
      height: 40,
    }).filter((n) => n.type === "group");

    const groupNode = intersections[0];

    const newNode: Node = {
      id: getId(),
      type,
      position,
      data: { label: `${type}` },
      style: nodeStyle,
    };

    if (groupNode) {
      newNode.position = getNodePositionInsideParent(
        {
          position,
          width: 40,
          height: 40,
        },
        groupNode
      ) ?? { x: 0, y: 0 };
      newNode.parentId = groupNode.id;
      newNode.expandParent = true;
    }

    // 需要确保父节点在子节点之前排序，以确保子节点在父节点之上渲染
    const sortedNodes = store.getState().nodes.concat(newNode).sort(sortNodes);
    setNodes(sortedNodes);
  };

  const onNodeDragStop = useCallback(
    (_: MouseEvent, node: Node) => {
      if (node.type !== "node" && !node.parentId) {
        return;
      }

      const intersections = getIntersectingNodes(node).filter(
        (n) => n.type === "group"
      );
      const groupNode = intersections[0];

      // 如果节点与 group 有交集，且不是当前 group 的子节点，则将节点移动到 group 内
      if (intersections?.length && node.parentId !== groupNode?.id) {
        const nextNodes = store.getState().nodes.map((n) => {
          if (n.id === groupNode.id) {
            return {
              ...n,
              className: "",
            };
          } else if (n.id === node.id) {
            const position = getNodePositionInsideParent(n, groupNode) ?? {
              x: 0,
              y: 0,
            };

            return {
              ...n,
              position,
              parentId: groupNode.id,
              extent: "parent",
            } as Node;
          }

          return n;
        });

        setNodes(nextNodes);
      }
    },
    [setNodes, getIntersectingNodes, store]
  );

  const onNodeDrag = useCallback(
    (_: MouseEvent, node: Node) => {
      if (node.type !== "node" && !node.parentId) {
        return;
      }

      const intersections = getIntersectingNodes(node).filter(
        (n) => n.type === "group"
      );

      const groupClassName =
        intersections.length && node.parentId !== intersections[0]?.id
          ? "active"
          : "";

      setNodes((nds) => {
        return nds.map((n) => {
          if (n.type === "group") {
            return {
              ...n,
              className: groupClassName,
            };
          } else if (n.id === node.id) {
            return {
              ...n,
              position: node.position,
            };
          }

          return { ...n };
        });
      });
    },
    [getIntersectingNodes, setNodes]
  );

  return (
    <div className={styles.wrapper}>
      <Sidebar />
      <div className={styles.rfWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onEdgesChange={onEdgesChange}
          onNodesChange={onNodesChange}
          onConnect={onConnect}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
          selectNodesOnDrag={false}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
        >
          <Background color="#bbb" gap={50} variant={BackgroundVariant.Dots} />
          <SelectedNodesToolbar />
        </ReactFlow>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ReactFlowProvider>
      <DynamicGroup />
    </ReactFlowProvider>
  );
}
