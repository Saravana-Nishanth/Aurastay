import { createSlice, nanoid } from '@reduxjs/toolkit';

// Right now the only UI-global state is the toast notification, but having
// this slice means the next one (modal state, theme, ...) has a home.
const uiSlice = createSlice({
  name: 'ui',
  initialState: { toast: null },
  reducers: {
    showToast: {
      reducer(state, action) {
        state.toast = action.payload;
      },
      // prepare() attaches an id so the Toast component can key its timer on it
      prepare(message, type = 'success') {
        return { payload: { id: nanoid(), message, type } };
      },
    },
    hideToast(state) {
      state.toast = null;
    },
  },
});

export const { showToast, hideToast } = uiSlice.actions;
export default uiSlice.reducer;
