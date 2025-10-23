"use client";

import { configureStore } from "@reduxjs/toolkit";
import breadcrumbReducer from "@/redux/slices/BreadcrumbSlice";
import sidebarReducer from "@/redux/slices/SidebarSlice";

export const store = configureStore({
  reducer: {
    breadcrumb: breadcrumbReducer,
    sidebar: sidebarReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
