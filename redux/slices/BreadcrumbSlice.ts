// redux/features/breadcrumbSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Crumb {
  name: string;
  href?: string;
}

interface BreadcrumbState {
  base: Crumb[]; // layout-defined base crumbs
  items: Crumb[]; // page-defined crumbs
  endpoint: Crumb | null; // page-defined crumbs
}

const initialState: BreadcrumbState = {
  base: [],
  items: [],
  endpoint: null,
};

const breadcrumbSlice = createSlice({
  name: "breadcrumb",
  initialState,
  reducers: {
    setBaseBreadcrumbs: (state, action: PayloadAction<Crumb[]>) => {
      state.base = action.payload;
    },
    setBreadcrumbs: (state, action: PayloadAction<Crumb[]>) => {
      state.items = action.payload;
    },
    setBreadcrumbsEndpoint: (state, action: PayloadAction<Crumb>) => {
      state.endpoint = action.payload;
    },
    clearBreadcrumbs: (state) => {
      state.items = [];
      state.base = [];
      state.endpoint = null;
    },
  },
});

export const {
  setBaseBreadcrumbs,
  setBreadcrumbs,
  clearBreadcrumbs,
  setBreadcrumbsEndpoint,
} = breadcrumbSlice.actions;
export default breadcrumbSlice.reducer;
