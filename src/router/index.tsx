import { Navigate, RouteObject } from "react-router-dom";

import BaseLayout from "@/layout/BaseLayout";
import CopyPage from "@/pages/copy";
import RedoundePage from "@/pages/redoundo";
import DeleteMiddlePage from "@/pages/delete-middle-node";

export type RouterMenuConfig = {
  name: string;
  path: string;
  icon: string;
};

export type ExtraRoute = RouteObject & {
  name?: string;
  hidden?: boolean;
  permissionCodes?: string[];
  children?: ExtraRoute[];
};

export const getRouterConfig = (): ExtraRoute[] => {
  return [
    {
      path: "/",
      element: <BaseLayout />,
      children: [
        {
          path: "/copy",
          element: <CopyPage />,
        },
        {
          path: "/redoundo",
          element: <RedoundePage />,
        },
        {
          path: "/deletemiddle",
          element: <DeleteMiddlePage />,
        },
      ],
    },

    {
      path: "*",
      element: <Navigate to="/copy" replace />,
    },
  ];
};

export default getRouterConfig;
