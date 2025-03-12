/* eslint-disable max-depth */
import { IContextItem, SelectedTypeEnum, ISideStore } from "./constant";

export const isNode = (type?: SelectedTypeEnum) =>
  SelectedTypeEnum.Node === type;

export const getContextList = (
  contextList: IContextItem[],
  data: IContextItem
) => {
  const index = contextList.findIndex((item) => item.id === data.id);
  if (index > -1) {
    contextList.splice(index, 1, data);
  } else {
    contextList.push(data);
  }
  return contextList;
};

interface IContextUIItem {
  refs: string[];
  varStr: string;
}

export const transformContextList = (elements: IContextItem[] = []) => {
  const aggregatedElements: IContextUIItem[] = [];

  elements.forEach((element) => {
    const existingAggregatedElement = aggregatedElements.find(
      (aggregatedElement) => aggregatedElement.varStr === element.varStr
    );

    if (existingAggregatedElement) {
      existingAggregatedElement.refs.push(element.label!);
    } else {
      aggregatedElements.push({
        varStr: element.varStr!,
        refs: [element.label!],
      });
    }
  });

  return aggregatedElements;
};

interface NestedObject {
  [key: string]: any;
}

// 简单处理嵌套对象，复杂情况待补充
export function flattenObject(obj: NestedObject): NestedObject {
  const result: NestedObject = {};

  function flatten(obj: NestedObject) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];

        if (typeof value === "object" && !Array.isArray(value)) {
          flatten(value);
        } else {
          result[key] = value;
        }
      }
    }
  }

  flatten(obj);

  return result;
}

// 为了edge的label正常显示，特殊处理
export const booleanMap: { [key: string]: boolean } = {
  True: true,
  False: false,
};

export function getJsonValue(value: any, type?: string) {
  if (!value) return null;

  switch (type) {
    case "number":
      return Number(value);
    case "boolean":
      return booleanMap[value];
    default:
      return value;
  }
}

export const generateArgs = (sideBarStore: ISideStore) => {
  const { argList = [], contextList = [] } = sideBarStore;
  return [...argList]
    .filter((i) => i)
    .map((item) => ({
      label: item,
      value: item,
    }))
    .concat([
      ...transformContextList(contextList).map((item) => ({
        label: item.varStr,
        value: item.varStr,
      })),
    ] as any);
};

export const getNum = (num?: number) => {
  if (!num) return 0;
  if (isNaN(num)) return 0;
  return Math.floor(num);
};
