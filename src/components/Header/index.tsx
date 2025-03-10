import { Flex } from "antd";

export const Header = () => {
  return (
    <div className="h-[var(--header-height)] bg-white ">
      <Flex
        justify="space-between"
        align="center"
        className="mx-auto h-full px-lg"
      >
        <div className="flex items-center justify-between font-bold text-24px text-#3d57ff">
          ReactFlow
        </div>
        <div>1</div>
      </Flex>
    </div>
  );
};
