import { DragEvent, DragEventHandler, useEffect } from "react";
import {
  ReactFlow,
  Background,
  DefaultEdgeOptions,
  MarkerType,
  ConnectionLineType,
  ConnectionMode,
  Panel,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import "./index.css";

import { defaultNodes, defaultEdges } from "./initial-elements";
import ShapeNode from "./components/shape-node";
import Sidebar from "./components/sidebar";
import MiniMapNode from "./components/minimap-node";

import { socket } from "./socket";

const nodeTypes = {
  shape: ShapeNode,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  type: "smoothstep",
  markerEnd: { type: MarkerType.ArrowClosed },
  style: { strokeWidth: 2 },
};

function ShapesProExampleApp() {
  const { screenToFlowPosition, setNodes } = useReactFlow();

  const onDragOver = (evt: DragEvent<HTMLDivElement>) => {
    evt.preventDefault();
    evt.dataTransfer.dropEffect = "move";
  };

  // 当从侧边栏拖拽一个节点放置到 React Flow 面板上时，此函数将被调用
  const onDrop: DragEventHandler = (evt: DragEvent<HTMLDivElement>) => {
    evt.preventDefault();
    const type = evt.dataTransfer.getData("application/reactflow");

    // 将鼠标坐标转换为 React Flow 中的坐标
    const position = screenToFlowPosition({ x: evt.clientX, y: evt.clientY });

    const newNode = {
      id: Date.now().toString(),
      type: "shape",
      position,
      style: { width: 100, height: 100 },
      data: {
        type,
        color: "#3F8AE2",
      },
      selected: true,
    };

    setNodes((nodes) =>
      nodes.map((n) => ({ ...n, selected: false })).concat([newNode])
    );
  };

  const handleConnect = () => {
    socket.connect();
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
      socket.emit("findAllCollaborative", (response) =>
        console.log("findAllCollaborative", response)
      );
      socket.emit("findOneCollaborative", 1, (response) =>
        console.log("findOneCollaborative", response)
      );
      socket.emit("createCollaborative", { name: "guang" }, (response) =>
        console.log("createCollaborative", response)
      );
      socket.emit("updateCollaborative", { id: 2, name: "dong" }, (response) =>
        console.log("updateCollaborative", response)
      );
    });
    return () => {
      socket.off("connect");
    };
  }, []);

  return (
    <div className="w-screen h-[calc(100vh-56px)]">
      <ReactFlow
        nodeTypes={nodeTypes}
        defaultNodes={defaultNodes}
        defaultEdges={defaultEdges}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        connectionMode={ConnectionMode.Loose}
        panOnScroll={true}
        onDrop={onDrop}
        snapToGrid={true}
        snapGrid={[10, 10]}
        onDragOver={onDragOver}
        zoomOnDoubleClick={false}
      >
        <Background />
        <Panel position="top-left">
          <Sidebar />
          <div
            onClick={handleConnect}
            className="px-[12px] py-[8px] bg-[blue] text-[white] rounded-2xl"
          >
            连接
          </div>
        </Panel>
        <Controls />
        {/* 保证缩略图中的展示也是正确的多边形 */}
        <MiniMap zoomable draggable nodeComponent={MiniMapNode} />
      </ReactFlow>
    </div>
  );
}

function ProExampleWrapper() {
  return (
    <ReactFlowProvider>
      <ShapesProExampleApp />
    </ReactFlowProvider>
  );
}

export default ProExampleWrapper;
