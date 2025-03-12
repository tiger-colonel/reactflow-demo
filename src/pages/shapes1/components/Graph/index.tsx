/* eslint-disable react-func/max-lines-per-function */
import React, { useCallback, useEffect, useRef } from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Panel,
  Node,
  Edge,
  useOnSelectionChange,
  useReactFlow,
} from "reactflow";
import { stratify, tree } from "d3-hierarchy";
import { isEmpty } from "lodash-es";

import type { ReactFlowInstance } from "reactflow";
import "reactflow/dist/style.css";

import { Button } from "antd";
import {
  FlowInfoType,
  ISelectedNode,
  SelectedTypeEnum,
  rcBgProps,
} from "../../constant";
import ShapePanel from "./ShapePanel";
import { useConnectHook, useDragHook, useNodeDragHook } from "./hooks";
import { nodeTypes, edgeTypes, fitViewOptions } from "./config";

const g = tree<Node>();

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  if (nodes.length === 0) return { nodes, edges };

  const { width = 0, height = 0 } =
    document
      .querySelector(`[data-id="${nodes[0].id}"]`)
      ?.getBoundingClientRect() || {};

  const hierarchy = stratify<Node>()
    .id((node) => node.id)
    .parentId((node) => edges.find((edge) => edge.target === node.id)?.source);
  const root = hierarchy(nodes);
  const layout = g.nodeSize([width * 2, height * 2])(root);

  return {
    nodes: layout
      .descendants()
      .map((node) => ({ ...node.data, position: { x: node.x, y: node.y } })),
    edges,
  };
};

type IProps = {
  flowInfo: FlowInfoType;
  instance: ReactFlowInstance | null;
  setInstance: (obj: ReactFlowInstance) => void;
  setLock?: (lock: boolean) => void;
  setSelected: (data: ISelectedNode) => void;
};

export const Graph: React.FC<IProps> = (props) => {
  const { flowInfo, instance, setInstance, setSelected, setLock } = props;
  const { fitView } = useReactFlow();

  // 画布的 DOM 容器，用于计算节点坐标
  const graphRef = useRef<HTMLDivElement | null>(null);

  // node节点、edge连线
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges
    );

    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);

    window.requestAnimationFrame(() => {
      fitView();
    });
  }, [nodes, edges]);

  // 数据回填
  useEffect(() => {
    const { nodes = [], edges = [] } = flowInfo;

    setNodes(nodes);
    setEdges(edges);
  }, [flowInfo, setNodes, setEdges]);

  // 画布加载完毕，保存当前 ReactFlow画布实例
  const onInit = (reactFlowInstance: ReactFlowInstance) => {
    setInstance(reactFlowInstance);
  };

  /**
   * 切换 Node Edge
   */
  useOnSelectionChange({
    onChange: ({ nodes, edges }) => {
      if (isEmpty(nodes) && isEmpty(edges)) {
        setSelected(null as any);
        return;
      }

      setSelected({
        type: isEmpty(edges) ? SelectedTypeEnum.Node : SelectedTypeEnum.Edge,
        value: (isEmpty(edges) ? nodes : edges)?.[0],
      });
    },
  });

  const { onDragOver, onDrop } = useDragHook({
    graphRef,
    instance,
    setNodes,
    setLock,
  });
  const { onConnectStart, onConnect } = useConnectHook({ setEdges, setLock });
  // const { onNodeDrag, onNodeDragStop } = useNodeDragHook({ setEdges });

  const onPaneClick = () => {
    setSelected(null as any);
  };

  return (
    <div className="flex-1 h-full relative" ref={graphRef}>
      <Panel position="top-left">
        <ShapePanel />
        {/* <Button type="primary" onClick={() => onLayout()}>
          调整布局
        </Button> */}
      </Panel>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        // 自定义节点和边
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        // connectionLineComponent={FloatingConnectionLine}
        onNodesChange={(nds) => {
          onNodesChange(nds);
        }}
        onEdgesChange={onEdgesChange}
        // onNodeDrag={onNodeDrag}
        // onNodeDragStop={onNodeDragStop}
        onInit={onInit}
        // 拖拽
        onDragOver={onDragOver}
        onDrop={onDrop}
        // onNodeClick={onNodeClick}
        // 画布上连线的时，触发 onConnect，并提供连线信息 source, target
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        // onConnectEnd={onConnectEnd}
        // 连线模式，Loose: 任意位置连线，Straight: 直线连线
        // connectionMode={ConnectionMode.Loose}
        // onConnectEnd={onConnectEnd}
        // 节点自适应画布，会自定缩放 zoom: 2
        // fitView={true}
        fitViewOptions={fitViewOptions}
        attributionPosition="top-right"
        onPaneClick={onPaneClick}
        // edge配置
        connectionLineStyle={{ strokeWidth: 3 }}
        // defaultEdgeOptions={{ style: { strokeWidth: 3 } }}
        // isValidConnection={isValidConnection}
      >
        <Controls />
        <Background {...(rcBgProps as object)} />
      </ReactFlow>
    </div>
  );
};

export default Graph;
