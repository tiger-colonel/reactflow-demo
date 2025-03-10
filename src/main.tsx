import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ConfigProvider } from "antd";

import getRouterConfig from "./router";

import "antd/dist/reset.css";
import "./index.css";
import "./styles/index.css";

const router = createBrowserRouter(getRouterConfig());

const root = createRoot(document.getElementById("root") as Element);

root.render(
  <ConfigProvider>
    <RouterProvider router={router} />
  </ConfigProvider>
);
