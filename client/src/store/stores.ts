import { configureStore } from "@reduxjs/toolkit";
import { routesApi } from "./api/routesApi";
import { busApi } from "./api/busApi";

export const store = configureStore({
  reducer: {
    [routesApi.reducerPath]: routesApi.reducer,
    [busApi.reducerPath]: busApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(routesApi.middleware)
      .concat(busApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
