import { useEffect } from "react";
import { Button, Form, Input, Select } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { generateArgs, transformContextList } from "../../util";
import { ISideStore } from "../../constant";

import { NoMarginDivider } from "./style";

type IProps = {
  setSideBarStore: (data: ISideStore) => void;
  sideBarStore: ISideStore;
};

export const PageSider = (props: IProps) => {
  const { sideBarStore, setSideBarStore } = props;
  const { argList, contextList, returnList } = sideBarStore;

  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({ argList });
  }, [form, argList]);

  const handleChange = (value: string[]) => {
    setSideBarStore({
      ...sideBarStore,
      returnList: value,
    });
  };

  return (
    <aside className="flex flex-col justify-between w-306px mr-24px bg-#fff p-16px">
      <div className="basis-40% overflow-auto">
        <NoMarginDivider orientation="left">
          流程图参数(全局上下文)
        </NoMarginDivider>
        <Form
          form={form}
          onValuesChange={(changed, all) =>
            setSideBarStore({
              ...sideBarStore,
              argList: all.argList,
            })
          }
        >
          <Form.List name="argList">
            {(fields, { add, remove }, { errors }) => {
              return (
                <>
                  {fields.map((field) => (
                    <Form.Item
                      label={""}
                      required={false}
                      key={field.key}
                      style={{ marginBottom: 8 }}
                    >
                      <Form.Item {...field} noStyle>
                        <Input
                          placeholder="arg name"
                          style={{ width: "90%", marginRight: 8 }}
                        />
                      </Form.Item>
                      <MinusCircleOutlined
                        className="dynamic-delete-button"
                        onClick={() => remove(field.name)}
                      />
                    </Form.Item>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      style={{ width: "100%" }}
                      icon={<PlusOutlined />}
                    >
                      添加参数
                    </Button>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                </>
              );
            }}
          </Form.List>
        </Form>
      </div>
      <div className="basis-35% overflow-auto">
        <NoMarginDivider orientation="left">中间上下文</NoMarginDivider>
        <div className="mb-8px">
          {(transformContextList(contextList) || []).map((item, i) => (
            <div
              key={`${i}${item.varStr}`}
              className="bg-#f5f5f5 mb-8px p-8px rounded-4px overflow-auto"
            >
              <div className="font-semibold text-#000">{item.varStr}</div>
              {item?.refs?.map((label) => (
                <div key={label} className="text-xs text-#B0C4DE">
                  {label}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="basis-15% overflow-auto">
        <NoMarginDivider orientation="left">返回值</NoMarginDivider>
        <Select
          value={returnList}
          mode="tags"
          allowClear
          style={{ width: "100%" }}
          placeholder="选择返回值"
          onChange={handleChange}
          options={generateArgs(sideBarStore)}
          showSearch={false}
        />
      </div>
    </aside>
  );
};

export default PageSider;
