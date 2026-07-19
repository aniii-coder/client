// import { api } from "./api"; // Adjust the import path to your main API slice file

import { baseApi } from "@/services/api/baseApi";

export const commentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    addComment: builder.mutation({
      query: ({ blogId, ...newComment }) => ({
        url: `/blogs/${blogId}/comment`,
        method: 'POST',
        body: newComment,
      }),
     invalidatesTags: (result, error, { blogId }) => [
        { type: "Blogs", id: blogId }, 
        { type: "Blogs", id: "LIST" }
      ],
    }),
  }),
  overrideExisting: false, 
});

export const { useGetCommentsByBlogIdQuery, useAddCommentMutation } = commentsApi;