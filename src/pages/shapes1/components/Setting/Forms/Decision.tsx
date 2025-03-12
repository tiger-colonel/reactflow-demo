import { Form, Input } from "antd";

export const DecisionItems = () => {
  return (
    <>
      <Form.Item label="name" name="label">
        <Input placeholder="请输入name" allowClear />
      </Form.Item>
      <Form.Item label="表达式" name="eval_str">
        <Input placeholder="请输入表达式" />
      </Form.Item>
    </>
  );
};
