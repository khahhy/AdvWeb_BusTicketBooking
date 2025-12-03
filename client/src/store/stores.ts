import { configureStore } from "@reduxjs/toolkit";
import { routesApi } from "./api/routesApi";
import { busApi } from "./api/busApi";
import { locationsApi } from "./api/locationApi";
import { tripsApi } from "./api/tripsApi";
import { usersApi } from "./api/usersApi";
import { activityLogsApi } from "./api/activityLogsApi";

import authReducer from "./slice/authSlice";

export const store = configureStore({
  reducer: {
    [routesApi.reducerPath]: routesApi.reducer,
    [busApi.reducerPath]: busApi.reducer,
    [locationsApi.reducerPath]: locationsApi.reducer,
    [tripsApi.reducerPath]: tripsApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [activityLogsApi.reducerPath]: activityLogsApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(routesApi.middleware)
      .concat(busApi.middleware)
      .concat(locationsApi.middleware)
      .concat(tripsApi.middleware)
      .concat(usersApi.middleware)
      .concat(activityLogsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
