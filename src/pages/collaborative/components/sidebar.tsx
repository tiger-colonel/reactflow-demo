import { DragEvent } from "react";

const onDragStart = (event: DragEvent, nodeType: string) => {
  event.dataTransfer.setData("application/reactflow", nodeType);
  event.dataTransfer.effectAllowed = "move";
};

const Sidebar = () => {
  return (
    <aside>
      <div className="description">拖拽节点到右侧画布</div>
      <div
        className="react-flow__node-input"
        onDragStart={(event: DragEvent) => onDragStart(event, "input")}
        draggable
      >
        Node1
      </div>
      <div
        className="react-flow__node-default"
        onDragStart={(event: DragEvent) => onDragStart(event, "default")}
        draggable
      >
        Node2
      </div>
      <div
        className="react-flow__node-output"
        onDragStart={(event: DragEvent) => onDragStart(event, "output")}
        draggable
      >
        Node3
      </div>
    </aside>
  );
};

export default Sidebar;
