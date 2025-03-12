/* eslint-disable react-func/max-lines-per-function */
import { Button, Modal, Tooltip, message } from "antd";
import { useTextOverflow } from "@fuxi/eevee-hooks";
import { useMutation } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import flow from "@/service/flow";
import { FlowInfoType, GlobalInfoType, ISelectedNode } from "../../constant";
import { MenuItem } from "./style";

const Label = ({ label }: { label: string }) => {
  const { isTextOverflow, textRef: singleTextRef } = useTextOverflow();
  return (
    <Tooltip title={isTextOverflow ? label : null}>
      <p
        ref={singleTextRef}
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </p>
    </Tooltip>
  );
};

interface IPageList {
  flowInfo: FlowInfoType;
  flowList?: FlowInfoType[];
  getFlowList: () => void;
  globalInfo?: GlobalInfoType;
  lock?: boolean;
  setFlowInfo: (flowInfo: FlowInfoType) => void;
  setLock?: (lock: boolean) => void;
  setSelected: (data: ISelectedNode) => void;
}
export const PageList = ({
  flowInfo,
  setFlowInfo,
  flowList,
  getFlowList,
  globalInfo,
  setSelected,
  lock,
  setLock,
}: IPageList) => {
  const processName = `Process_${nanoid(6)}`;

  const mutation = useMutation<any, any, any>({
    mutationFn: (data) => flow.addFlow(data),
    onSuccess: (res) => {
      message.success("新增成功");
      setFlowInfo({
        ...flowInfo,
        id: res.id,
        processName,
      });
      getFlowList();
    },
  });

  const handleAdd = () => {
    mutation.mutate({
      flow: "",
      flow_layout: JSON.stringify({
        processName,
        argList: globalInfo?.default_args,
      }),
    });
  };

  const handleSwitch = (e: any, item: FlowInfoType) => {
    if (lock) {
      Modal.confirm({
        title: "提示",
        content: "当前流程图变动未更新，是否离开？",
        okText: "确认",
        cancelText: "取消",
        onOk: () => {
          setFlowInfo({
            ...flowInfo,
            id: item.id,
          });
          setSelected(null as any);
        },
        onCancel: () => {
          setLock?.(true);
        },
      });
    } else {
      setFlowInfo({
        ...flowInfo,
        id: item.id,
      });
      setSelected(null as any);
    }
    setLock?.(false);
  };

  return (
    <div className="w-200px bg-#fff py-24px px-12px mr-12px h-[calc(100vh)-96px]">
      <Button
        type="primary"
        className="w-full mb-12px"
        onClick={() => handleAdd()}
      >
        新 建
      </Button>
      {flowList?.map((item) => (
        <MenuItem
          key={item.id}
          onClick={(e) => handleSwitch(e, item)}
          selected={flowInfo.id === item.id}
        >
          <Label label={item.processName} />
        </MenuItem>
      ))}
    </div>
  );
};

export default PageList;
