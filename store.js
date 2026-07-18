import { configureStore } from "@reduxjs/toolkit";
import toastReducer from "./src/services/slices/toastSlice";
import { baseApi } from "@/services/api/baseApi";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    toast: toastReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});