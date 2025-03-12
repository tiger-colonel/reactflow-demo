import React from "react";
import { Form, Input, Select } from "antd";
import { Edge, useNodes } from "reactflow";
import { FormInstance } from "antd/lib";
import { BooleanList, JsonTypeList, NodeTypeEnum } from "../../../constant";

export const EdgeItems = ({
  currEdge,
  form,
}: {
  currEdge: Edge;
  form: FormInstance;
}) => {
  const nodes = useNodes();
  const sourceNode = nodes.find((node) => node.id === currEdge.source);
  const { type } = sourceNode || {};

  const edgeLabelType = Form.useWatch("edgeLabelType", form);

  const render = () => {
    switch (type) {
      case NodeTypeEnum.Decision:
        return (
          <Form.Item label="True/False" name="label">
            <Select options={BooleanList} allowClear />
          </Form.Item>
        );
      case NodeTypeEnum.Switch:
        return (
          <React.Fragment>
            <Form.Item label="类型" name="edgeLabelType">
              <Select options={JsonTypeList} />
            </Form.Item>
            <Form.Item label="label" name="label">
              {edgeLabelType === "boolean" ? (
                <Select options={BooleanList} allowClear />
              ) : (
                <Input placeholder="请输入表达式" />
              )}
            </Form.Item>
          </React.Fragment>
        );

      default:
        return (
          <Form.Item label="label" name="label">
            <Input placeholder="请输入label" />
          </Form.Item>
        );
    }
  };

  return render();
};
