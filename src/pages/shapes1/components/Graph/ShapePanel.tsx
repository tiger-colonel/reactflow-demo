import React from "react";
import { Node } from "reactflow";
import * as shapes from "../../../../components/Shapes";
import { INodeData } from "../../constant";

const allowedNodes: Node<INodeData>[] = [
  {
    id: "RoundRectangle",
    position: { x: 0, y: 0 },
    type: "ProcessNode",
    className: "rect",
    data: { label: "ProcessName", name: "ProcessNode" },
  },
  {
    id: "Hexagon",
    position: { x: 0, y: 0 },
    type: "SwitchNode",
    data: { label: "SwitchName", name: "SwitchNode" },
  },
  {
    id: "Diamond",
    position: { x: 0, y: 0 },
    type: "DecisionNode",
    data: { label: "DecisionName", name: "DecisionNode" },
  },
  {
    id: "ArrowRectangle",
    position: { x: 0, y: 0 },
    type: "AssignmentNode",
    data: { label: "Assignment", name: "AssignmentNode" },
  },
];

const ShapePanel = () => {
  /**
   * 拖拽添加节点
   * Sider 中触发节点的 onDragStart 事件，并传递参数
   * 然后在 Graph 中通过 ReactFlow onDrop 来接收拖拽的节点
   * @param e {React.DragEvent<HTMLDivElement>}
   * @param item {object}
   */
  const onDragStart = (e: React.DragEvent<HTMLDivElement>, item: Node) => {
    // 被拖拽的节点类型, 值必须是是个字符串
    e.dataTransfer.setData("application/reactflow", JSON.stringify(item));
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="w-120px">
      {allowedNodes.map((item, index) => {
        const Component = shapes[item.id as keyof typeof shapes];

        return (
          <div
            key={item.data.name ?? index}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              height: 88,
              background: "#eee",
              flex: "0 0 48%",
              marginBottom: 4,
              padding: "8px 0px",
              cursor: "pointer",
            }}
            onDragStart={(e) => onDragStart(e, item)}
            draggable
          >
            <div>
              <Component />
            </div>
            <div className="w-full text-center text-xs">
              {item.data.name?.replace("Node", "")}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ShapePanel;
