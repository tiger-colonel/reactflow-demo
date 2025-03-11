import { ReactFlowProvider } from "@xyflow/react";

const DynamicGroup: React.FC = () => {
  return <div>DynamicGroup</div>;
};

export default function App() {
  return (
    <ReactFlowProvider>
      <DynamicGroup />
    </ReactFlowProvider>
  );
}
