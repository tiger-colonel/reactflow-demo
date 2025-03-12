import { Form, Input, Select, Space } from "antd";
import { FormInstance } from "antd/lib";
import { get } from "lodash";
import { BooleanList, ISideStore, JsonTypeList } from "../../../constant";
import { generateArgs } from "../../../util";

export const AssignmentItems = ({
  form,
  sideBarStore,
  moduleList,
}: {
  form: FormInstance;
  moduleList?: { args: string[]; name: string }[];
  sideBarStore: ISideStore;
}) => {
  const outputType = Form.useWatch("outputType", form);
  const outputValue = Form.useWatch("outputValue", form);

  const process = moduleList?.find((item) => item.name === outputValue);
  const argsObj = Form.useWatch("args", form) || {};

  const renderOutput = () => {
    switch (outputType) {
      case "process":
        return (
          <Select
            placeholder="请选择输出"
            options={moduleList?.map((item) => ({
              label: item.name,
              value: item.name,
            }))}
            style={{ width: "60%" }}
            popupMatchSelectWidth={false}
          />
        );
      case "boolean":
        return <Select placeholder="True or False" options={BooleanList} />;
      default:
        return <Input style={{ width: "60%" }} placeholder="输出" allowClear />;
    }
  };

  const renderArgs = (type: string) => {
    switch (type) {
      case "variable":
        return (
          <Select
            mode="tags"
            placeholder="请选择输出"
            options={generateArgs(sideBarStore)}
            style={{ width: "60%" }}
            allowClear
            showSearch={false}
            popupMatchSelectWidth={false}
          />
        );
      case "boolean":
        return <Select placeholder="True or False" options={BooleanList} />;
      default:
        return <Input style={{ width: "60%" }} placeholder="输出" allowClear />;
    }
  };

  return (
    <>
      <Form.Item label="name" name="label">
        <Input placeholder="node name" allowClear />
      </Form.Item>

      <h2>左侧</h2>
      <Form.Item label="variable name" name="varStr">
        <Input placeholder="variable name" />
      </Form.Item>

      <h2>右侧</h2>
      <Form.Item label="output">
        <Space.Compact className="w-full">
          <Form.Item name="outputType" noStyle>
            <Select
              placeholder="类型"
              options={JsonTypeList.concat([
                { label: "process", value: "process" },
              ])}
              style={{ width: "40%" }}
            />
          </Form.Item>
          <Form.Item name="outputValue" noStyle>
            {renderOutput()}
          </Form.Item>
        </Space.Compact>
      </Form.Item>
      {process ? <h3>参数</h3> : null}
      <Form.List name="args">
        {() =>
          process?.args?.map((arg) => (
            <Form.Item label={arg} key={arg}>
              <Space.Compact className="w-full">
                <Form.Item name={`${arg}Type`} noStyle>
                  <Select
                    placeholder="类型"
                    options={JsonTypeList.concat([
                      { label: "variable", value: "variable" },
                    ])}
                    style={{ width: "40%" }}
                    // onChange={() => handleTypeChange(arg)}
                  />
                </Form.Item>
                <Form.Item name={`${arg}Value`} noStyle>
                  {renderArgs(get(argsObj, `${arg}Type`))}
                </Form.Item>
              </Space.Compact>
            </Form.Item>
          ))
        }
      </Form.List>
    </>
  );
};
