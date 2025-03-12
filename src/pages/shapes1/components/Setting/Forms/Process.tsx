import { Form, Input, Select, Space } from "antd";
import { FormInstance } from "antd/lib";
import { get } from "lodash";
import { BooleanList, ISideStore, JsonTypeList } from "../../../constant";
import { generateArgs } from "../../../util";

export const ProcessItems = ({
  form,
  sideBarStore,
  moduleList,
}: {
  form: FormInstance;
  moduleList?: { args: string[]; name: string }[];
  sideBarStore: ISideStore;
}) => {
  const func = Form.useWatch("func", form);
  const process = moduleList?.find((item) => item.name === func);

  const argsObj = Form.useWatch("args", form) || {};

  const handleTypeChange = (value: string, arg: string) => {
    form.setFieldValue("args", {
      ...argsObj,
      [`${arg}Type`]: value,
      [`${arg}Value`]: value === "variable" ? [] : "",
    });
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
        <Input placeholder="请输入node name" allowClear />
      </Form.Item>
      <Form.Item label="执行方法" name="func">
        <Select
          placeholder="请选择执行方法"
          options={moduleList?.map((item) => ({
            label: item.name,
            value: item.name,
          }))}
        />
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
                    onChange={(value) => handleTypeChange(value, arg)}
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
