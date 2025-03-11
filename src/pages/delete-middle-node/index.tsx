import React, { useCallback } from "react";
import {
  Node,
  Edge,
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
  Connection,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import "./index.css";

const initialNodes: Node[] = [
  {
    id: "1",
    type: "input",
    data: { label: "Start here..." },
    position: { x: -150, y: 0 },
  },
  {
    id: "2",
    type: "input",
    data: { label: "...or here!" },
    position: { x: 150, y: 0 },
  },
  { id: "3", data: { label: "Delete me." }, position: { x: 0, y: 100 } },
  { id: "4", data: { label: "Then me!" }, position: { x: 0, y: 200 } },
  {
    id: "5",
    type: "output",
    data: { label: "End here!" },
    position: { x: 0, y: 300 },
  },
];

const initialEdges: Edge[] = [
  { id: "1->3", source: "1", target: "3" },
  { id: "2->3", source: "2", target: "3" },
  { id: "3->4", source: "3", target: "4" },
  { id: "4->5", source: "4", target: "5" },
];

export default function Flow() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges(addEdge(params, edges)),
    [edges]
  );

  // 1. 获取相关节点信息，输入，输出，连接的边
  // 2. 筛选保留的边
  // 3. 创建新的边
  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      setEdges(
        deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, nodes, edges);
          const outgoers = getOutgoers(node, nodes, edges);
          const connectedEdges = getConnectedEdges([node], edges);

          const remainingEdges = acc.filter(
            (edge) => !connectedEdges.includes(edge)
          );

          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({
              id: `${source}->${target}`,
              source,
              target,
            }))
          );

          return [...remainingEdges, ...createdEdges];
        }, edges)
      );
    },
    [nodes, edges]
  );

  return (
    <div className="w-screen h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onNodesDelete={onNodesDelete}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        attributionPosition="top-right"
        style={{ backgroundColor: "#F7F9FB" }}
      >
        <Background />
      </ReactFlow>
    </div>
  );
}
