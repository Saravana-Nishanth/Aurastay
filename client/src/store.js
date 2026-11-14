import { configureStore } from '@reduxjs/toolkit';
import hotelsReducer from './features/hotels/hotelsSlice';
import uiReducer from './features/ui/uiSlice';

export default configureStore({
  reducer: {
    hotels: hotelsReducer,
    ui: uiReducer,
  },
});
