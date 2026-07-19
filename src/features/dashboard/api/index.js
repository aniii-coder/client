// import { baseApi } from "@/services/api/baseApi";

import { baseApi } from "@/services/api/baseApi";

export const blogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    
    getAllBlogs: builder.query({
      query: (params = {}) => {
        const cleanParams = {};
        
        if (params.search?.trim()) cleanParams.search = params.search;
        if (params.limit) cleanParams.limit = params.limit;
        if (params.offset !== undefined) cleanParams.offset = params.offset;
        if (params.sort) cleanParams.sort = params.sort;
        if (params.category && params.category !== "All") cleanParams.category = params.category;

        return {
          url: "/blogs/getAll",
          method: "GET",
          params: cleanParams,
        };
      },
      keepUnusedDataFor: 300,
      // Provides tags for automatic re-fetching validation
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Blogs", id: _id })),
              { type: "Blogs", id: "LIST" },
            ]
          : [{ type: "Blogs", id: "LIST" }],
    }),

    // Added mutation endpoint for liking a blog post
    likeBlog: builder.mutation({
      query: (blogId) => ({
        url: `/blogs/${blogId}/like`, // Adjust URL path matching your backend route design if needed
        method: "PATCH",              // or "POST" based on backend configurations
      }),
      // Invalidates the cached blog lists to automatically update likes count in real-time
      invalidatesTags: ["Blogs"],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetAllBlogsQuery,
  useLikeBlogMutation, // Exporting the new like mutation hook
} = blogApi;