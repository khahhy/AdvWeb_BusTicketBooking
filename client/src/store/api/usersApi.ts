import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import {
  UserQueryParams,
  UsersResponse,
  SingleUserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateRoleRequest,
  UpdateStatusRequest,
  UserStatsResponse,
} from "@/store/type/usersType";

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: baseQuery,
  tagTypes: ["Users", "UserDetail", "UserStats"],

  endpoints: (builder) => ({
    getUsers: builder.query<UsersResponse, UserQueryParams | void>({
      query: (params) => ({
        url: "/users",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Users"],
    }),

    getUserStats: builder.query<UserStatsResponse, void>({
      query: () => ({
        url: "/users/stats",
        method: "GET",
      }),
      providesTags: ["UserStats"],
    }),

    getUserById: builder.query<SingleUserResponse, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "GET",
      }),
      providesTags: (_, __, id) => [{ type: "UserDetail", id }],
    }),

    createAdmin: builder.mutation<SingleUserResponse, CreateUserRequest>({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Users", "UserStats"],
    }),

    updateUser: builder.mutation<SingleUserResponse, UpdateUserRequest>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => ["Users", { type: "UserDetail", id }],
    }),

    updateUserRole: builder.mutation<SingleUserResponse, UpdateRoleRequest>({
      query: ({ id, role }) => ({
        url: `/users/${id}/role`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: (_, __, { id }) => ["Users", { type: "UserDetail", id }],
    }),

    updateUserStatus: builder.mutation<SingleUserResponse, UpdateStatusRequest>(
      {
        query: ({ id, status }) => ({
          url: `/users/${id}/status`,
          method: "PATCH",
          body: { status },
        }),
        invalidatesTags: (_, __, { id }) => [
          "Users",
          "UserStats",
          { type: "UserDetail", id },
        ],
      },
    ),

    deleteUser: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users", "UserStats"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserStatsQuery,
  useGetUserByIdQuery,
  useCreateAdminMutation,
  useUpdateUserMutation,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
} = usersApi;
