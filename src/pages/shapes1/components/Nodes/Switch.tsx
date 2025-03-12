import { useState, useRef, useLayoutEffect } from "react";
import { Handle, Position } from "reactflow";
import { useSize } from "ahooks";
import { Hexagon } from "@/components/Shapes";
import { initNodeSize } from "../../constant";
import { getNum } from "../../util";
import { NodeCard, TextItem } from "./styles";

export const SwitchNode = (props: any) => {
  const { id, isConnectable, data, selected } = props;

  const [resize, setResize] = useState({ ...initNodeSize });
  const labelRef = useRef<HTMLDivElement | null>(null);
  const size = useSize(labelRef);

  useLayoutEffect(() => {
    if (!labelRef.current) return;
    let { width, height } = size || {};
    if (getNum(width) < initNodeSize.width) {
      width = initNodeSize.width;
    }
    if (getNum(height) < initNodeSize.height) {
      height = initNodeSize.height;
    }
    setResize((prevState) => ({
      ...prevState,
      width: getNum(width),
      height: getNum(height),
    }));
  }, [size]);

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        onConnect={(params) => console.log("----handle onConnect-----", params)}
        isConnectable={isConnectable}
      />

      <div className="relative">
        <Hexagon {...resize} selected={selected} />
        <NodeCard ref={labelRef} className="flex-wrap">
          <TextItem>
            <div className="font-semibold w-full whitespace-nowrap">
              {data?.label}
            </div>
            <div className="text-xs w-full whitespace-nowrap mt-4px">
              {data?.eval_str}
            </div>
          </TextItem>
        </NodeCard>
      </div>

      <Handle
        id={id}
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </>
  );
};

export default SwitchNode;
