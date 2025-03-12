import { useState, useRef, useLayoutEffect } from "react";
import { Handle, Position } from "reactflow";
import { useSize } from "ahooks";
import { ArrowRectangle } from "@/components/Shapes";
import { initNodeSize } from "../../constant";
import { getNum } from "../../util";
import { TextItem, NodeCard } from "./styles";

export const AssignmentNode = (props: any) => {
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
        <ArrowRectangle {...resize} selected={selected} />
        <NodeCard ref={labelRef} className="flex-wrap">
          <div className="w-full mb-8px">{data?.label}</div>
          <div className="flex flex-nowrap justify-center items-center">
            <TextItem className="basis-30% mr-8px">
              {data?.varStr || "variable"}
            </TextItem>
            <div className="text-xxl">=</div>
            {data?.outputValue ? (
              <TextItem className="basis-60% ml-8px text-#2DEBAE font-semibold text-18px">
                {data?.outputType !== "process" ? (
                  <div className="text-#FFA500">{data?.outputValue}</div>
                ) : (
                  <div className="text-left">
                    <div className="">{data?.outputValue}</div>
                    {data?.args?.map((arg: string, i: number) => {
                      return (
                        <div className="text-xs text-#fff" key={arg}>
                          {arg}
                        </div>
                      );
                    })}
                  </div>
                )}
              </TextItem>
            ) : (
              <TextItem className="h-36px w-60px ml-8px"></TextItem>
            )}
          </div>
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

export default AssignmentNode;
