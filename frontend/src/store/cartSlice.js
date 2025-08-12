import { createSlice } from '@reduxjs/toolkit';

// Clé de stockage du panier par utilisateur (ou "guest")
const getCartKey = () => {
  const username = localStorage.getItem('username') || 'guest';
  return `cart_${username}`;
};

const loadCart = () => {
  try {
    const raw = localStorage.getItem(getCartKey());
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  try {
    localStorage.setItem(getCartKey(), JSON.stringify(items));
  } catch {
    // silencieux : quota plein, navigation privée, etc.
  }
};

const initialState = {
  items: loadCart(), // [{ id, title, price, image_url, quantity }]
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, { payload }) => {
      const { id, title, price, image_url, quantity = 1 } = payload;
      const q = Number.isFinite(+quantity) ? Math.max(1, +quantity) : 1;

      const found = state.items.find((it) => it.id === id);
      if (found) {
        found.quantity += q;
      } else {
        state.items.push({ id, title, price, image_url, quantity: q });
      }
      saveCart(state.items);
    },

    removeFromCart: (state, { payload: id }) => {
      state.items = state.items.filter((it) => it.id !== id);
      saveCart(state.items);
    },

    setQuantity: (state, { payload }) => {
      const { id, quantity } = payload;
      const q = Number.isFinite(+quantity) ? Math.max(1, +quantity) : 1;
      const it = state.items.find((i) => i.id === id);
      if (it) {
        it.quantity = q;
        saveCart(state.items);
      }
    },

    clearCart: (state) => {
      state.items = [];
      saveCart(state.items);
    },

    // Optionnel : à appeler si tu veux recharger le panier quand l'utilisateur change
    reloadCartForCurrentUser: (state) => {
      state.items = loadCart();
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  setQuantity,
  clearCart,
  reloadCartForCurrentUser,
} = cartSlice.actions;

export default cartSlice.reducer;