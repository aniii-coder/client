import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  open: false,
  type: "success",
  message: "",
};

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    successToast: (state, action) => {
      state.open = true;
      state.type = "success";
      state.message = action.payload.message;
    },

    errorToast: (state, action) => {
      state.open = true;
      state.type = "error";
      state.message = action.payload.message;
    },

    infoToast: (state, action) => {
      state.open = true;
      state.type = "info";
      state.message = action.payload.message;
    },

    closeToast: (state) => {
      state.open = false;
      state.message = "";
    },
  },
});

export const {
  successToast,
  errorToast,
  infoToast,
  closeToast,
} = toastSlice.actions;

export default toastSlice.reducer;