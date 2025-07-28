import { createSlice } from '@reduxjs/toolkit';
import { getUserId } from '../utils/auth';

const getCartKey = () => {
  const userId = getUserId() || 'guest';
  return `cart-${userId}`;
};

const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem(getCartKey())) || [];
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  localStorage.setItem(getCartKey(), JSON.stringify(items));
};

const clearCartStorage = () => {
  localStorage.removeItem(getCartKey());
};

const initialState = {
  items: loadCart()
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const incoming = action.payload;
      const existing = state.items.find(i => i.id === incoming.id);
      if (existing) {
        existing.quantity += incoming.quantity ?? 1;
      } else {
        state.items.push({ ...incoming, quantity: incoming.quantity ?? 1 });
      }
      saveCart(state.items);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(i => i.id === id);
      if (item) item.quantity = quantity;
      saveCart(state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(i => i.id !== action.payload);
      saveCart(state.items);
    },
    clearCart: state => {
      state.items = [];
      clearCartStorage();
    },
    resetCart: state => {
      state.items = [];
      clearCartStorage();
    }
  }
});

export const { addToCart, updateQuantity, removeFromCart, clearCart, resetCart } = cartSlice.actions;
export default cartSlice.reducer;
