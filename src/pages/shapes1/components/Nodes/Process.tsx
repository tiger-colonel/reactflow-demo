import { useState, useRef, useLayoutEffect } from "react";
import { Handle, Position } from "reactflow";
import { useSize } from "ahooks";
import { RoundRectangle } from "@/components/Shapes";
import { initNodeSize } from "../../constant";
import { getNum } from "../../util";
import { NodeCard, TextItem } from "./styles";

const initState = {
  width: 120,
  height: 80,
};

export const ProcessNode = (props: any) => {
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
        <RoundRectangle {...resize} selected={selected} />
        <NodeCard ref={labelRef} className="flex-wrap">
          <div className="font-semibold mb-8px">{data?.label}</div>
          {data?.func ? (
            <TextItem className="text-left">
              <div className="text-18px my-8px text-#2DEBAE font-semibold">
                {data?.func}
              </div>
              <div className="text-xs mt-4px">
                {data?.args?.map((argStr: string) => {
                  return <div key={argStr}>{argStr}</div>;
                })}
              </div>
            </TextItem>
          ) : null}
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

export default ProcessNode;
