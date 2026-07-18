import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
const bu = process.env.BACKEND_URL;
console.log('bu :>> ', bu);
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${process.env.BACKEND_URL}`,
    credentials: "include"
  }),
  endpoints: () => ({}), 
});