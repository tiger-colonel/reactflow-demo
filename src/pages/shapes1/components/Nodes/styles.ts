import { styled } from "styled-components";
import { flexCenter } from "@/styles/utils";

export const NodeCard = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  ${flexCenter()};
  /* flex-wrap: wrap; */
  padding: 24px 16px;
  color: var(--white);
  text-align: center;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
`;

export const TextItem = styled.div`
  border: 1px solid #ccc;
  padding: 4px 8px;
  border-radius: 8px;
`;
