import { Outlet } from "react-router-dom";
import { Header } from "@/components";

const BasicLayout = () => {
  return (
    <div className="h-full">
      <Header />
      <Outlet />
    </div>
  );
};
export default BasicLayout;
