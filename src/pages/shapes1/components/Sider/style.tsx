import { Divider } from "antd";
import { styled } from "styled-components";

export const NoMarginDivider = styled(Divider)`
  margin: 0 !important;
  margin-bottom: 12px !important;
  font-size: 20px !important;
  .ant-divider-inner-text {
    padding-left: 0px !important;
  }
`;
