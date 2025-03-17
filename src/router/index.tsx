import { Navigate, RouteObject } from "react-router-dom";

import BaseLayout from "@/layout/BaseLayout";
import CopyPage from "@/pages/copy";
import RedoundePage from "@/pages/redoundo";
import DeleteMiddlePage from "@/pages/delete-middle-node";
import DynamicGroup from "@/pages/dynamic-group";
import Shapes from "@/pages/shapes";
import ExpandCollapsePage from "@/pages/expand-collapse";
import WorkflowPage from "@/pages/dynamic-layout";
import CollaborativePage from "@/pages/collaborative";

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
          path: "/redo-undo",
          element: <RedoundePage />,
        },
        {
          path: "/delete-middle-node",
          element: <DeleteMiddlePage />,
        },
        {
          path: "/dynamic-group",
          element: <DynamicGroup />,
        },
        {
          path: "/shapes",
          element: <Shapes />,
        },
        {
          path: "/expand-collapse",
          element: <ExpandCollapsePage />,
        },
        {
          path: "/workflow",
          element: <WorkflowPage />,
        },
        {
          path: "/collaborative",
          element: <CollaborativePage />,
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
