// import { api } from "./api"; // Adjust the import path to your main API slice file

import { baseApi } from "@/services/api/baseApi";

export const getBlog = baseApi.injectEndpoints({
  endpoints: (builder) => ({

   getBlogById: builder.query({
      query: (blogId) => `/blogs/${blogId}`,
      providesTags: (result, error, blogId) => [{ type: "Blogs", id: blogId }],
    }),
  }),
  overrideExisting: false, 
});

export const { useGetBlogByIdQuery } = getBlog;