import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { hotelsApi } from '../../api';

export const PAGE_SIZE = 9;

// ---------------------------------------------------------------------------
// thunks
// ---------------------------------------------------------------------------

export const fetchHotels = createAsyncThunk('hotels/fetchAll', async (filters = {}) => {
  const { data, total } = await hotelsApi.list(filters);
  return { data, total };
});

export const fetchHotel = createAsyncThunk('hotels/fetchOne', (id) => hotelsApi.get(id));

// The form pages pass a FormData (fields + optional image file).
// Server validation errors travel back via rejectWithValue so the form can
// show them under the right input.
export const createHotel = createAsyncThunk('hotels/create', async (formData, { rejectWithValue }) => {
  try {
    return await hotelsApi.create(formData);
  } catch (err) {
    return rejectWithValue(err.data || { message: err.message });
  }
});

export const updateHotel = createAsyncThunk('hotels/update', async ({ id, formData }, { rejectWithValue }) => {
  try {
    return await hotelsApi.update(id, formData);
  } catch (err) {
    return rejectWithValue(err.data || { message: err.message });
  }
});

export const deleteHotel = createAsyncThunk('hotels/delete', async (id, { rejectWithValue }) => {
  try {
    await hotelsApi.remove(id);
    return id; // the list reducer uses the id to drop the row locally
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

// ---------------------------------------------------------------------------
// state
// ---------------------------------------------------------------------------

// Filters live in the store rather than local state, so navigating away to a
// details page and back restores exactly where the user was.
const initialState = {
  items: [],
  total: 0,
  listStatus: 'idle', // idle | loading | succeeded | failed
  listError: null,

  current: null, // hotel loaded for details / edit
  currentStatus: 'idle',

  saving: false,

  filters: { search: '', minPrice: '', maxPrice: '', page: 1 },
};

const hotelsSlice = createSlice({
  name: 'hotels',
  initialState,
  reducers: {
    setFilter(state, action) {
      const { name, value } = action.payload;
      state.filters[name] = value;
      if (name !== 'page') state.filters.page = 1; // a new filter means page 1
    },
    clearCurrent(state) {
      state.current = null;
      state.currentStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // list
      .addCase(fetchHotels.pending, (state) => {
        state.listStatus = 'loading';
        state.listError = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.listStatus = 'succeeded';
        state.items = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.listError = action.error.message;
      })
      // single hotel
      .addCase(fetchHotel.pending, (state) => {
        state.currentStatus = 'loading';
        state.current = null;
      })
      .addCase(fetchHotel.fulfilled, (state, action) => {
        state.currentStatus = 'succeeded';
        state.current = action.payload;
      })
      .addCase(fetchHotel.rejected, (state, action) => {
        state.currentStatus = 'failed';
        state.listError = action.error.message;
      })
      // create / update
      .addCase(createHotel.pending, (state) => {
        state.saving = true;
      })
      .addCase(createHotel.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createHotel.rejected, (state, action) => {
        state.saving = false;
        state.listError = action.payload?.message || null;
      })
      .addCase(updateHotel.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateHotel.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(updateHotel.rejected, (state, action) => {
        state.saving = false;
        state.listError = action.payload?.message || null;
      })
      // delete — update the visible list in place, no refetch needed
      .addCase(deleteHotel.fulfilled, (state, action) => {
        state.items = state.items.filter((hotel) => hotel.id !== action.payload);
        state.total = Math.max(0, state.total - 1);
      });
  },
});

export const { setFilter, clearCurrent } = hotelsSlice.actions;
export default hotelsSlice.reducer;
