import { styled } from "styled-components";

export const MenuItem = styled.div<{ selected: boolean }>`
  height: 36px;
  line-height: 36px;
  padding: 0 8px;
  border-radius: 4px;
  background-color: ${(props) => (props.selected ? "#e6f4ff" : "transparent")};
  &:hover {
    cursor: pointer;
    background-color: ${(props) =>
      props.selected ? "#e6f4ff" : "rgba(0, 0, 0, 0.06)"};
  }
`;
