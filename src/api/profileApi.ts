import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from './baseQuery';
import type { ProfileUser } from './types';

export interface ProfileUpdateArgs {
  name?: string;
  bio?: string;
  profilePic?: File;
  coverPic?: File;
}

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery,
  tagTypes: ['Profile'],
  endpoints: (build) => ({
    getMe: build.query<{ user: ProfileUser }, void>({
      query: () => '/user/me',
      providesTags: ['Profile'],
    }),
    getById: build.query<{ user: ProfileUser }, string>({
      query: (id) => `/user/${id}`,
    }),
    update: build.mutation<{ user: ProfileUser }, ProfileUpdateArgs>({
      query: (args) => {
        const form = new FormData();
        if (args.name !== undefined) form.append('name', args.name);
        if (args.bio !== undefined) form.append('bio', args.bio);
        if (args.profilePic) form.append('profilePic', args.profilePic);
        if (args.coverPic) form.append('coverPic', args.coverPic);
        return { url: '/user/update', method: 'PUT', body: form };
      },
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const { useGetMeQuery, useGetByIdQuery, useUpdateMutation } = profileApi;
