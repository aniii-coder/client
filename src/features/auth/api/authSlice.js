
import { baseApi } from "@/services/api/baseApi";

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // login: builder.mutation({
        //     query: (credentials) => ({
        //         url: "/auth/login",
        //         method: "POST",
        //         body: credentials,
        //     }),
        // }),

        // register: builder.mutation({
        //     query: (userData) => ({
        //         url: "/auth/register",
        //         method: "POST",
        //         body: userData,
        //     }),
        // }),

       loginViaGoogle: builder.mutation({
            query: (credentials) => ({
                url: "/auth/g_auth",
                method: "POST",
                body: credentials,
            }),
        }),
    }),
    overrideExisting: false,
});

export const {
        useLoginViaGoogleMutation,
    // useLoginMutation,
    // useRegisterMutation,
    
} = authApi;