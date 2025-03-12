import { Form, Input, Select } from "antd";
import { generateArgs } from "../../../util";
import { ISideStore } from "../../../constant";

export const SwitchItems = ({ sideBarStore }: { sideBarStore: ISideStore }) => {
  return (
    <>
      <Form.Item label="name" name="label">
        <Input placeholder="Switch name" allowClear />
      </Form.Item>
      <Form.Item label="表达式" name="eval_str">
        <Select
          mode="tags"
          options={generateArgs(sideBarStore)}
          allowClear
          showSearch={false}
          popupMatchSelectWidth={false}
        />
      </Form.Item>
    </>
  );
};
