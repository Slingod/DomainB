import { createSlice } from '@reduxjs/toolkit';

/**
 * On n'utilise plus de JWT dans le front (cookies httpOnly côté backend).
 * On garde juste un indicateur "token: 'cookie'" après login pour ne pas
 * casser les composants qui testent la présence d'un token.
 */
const initialState = {
  token: null,      // sera 'cookie' après login
  role: null,
  username: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // payload attendu: { token: 'cookie', role, username }
    setCredentials: (state, action) => {
      const { token, role, username } = action.payload || {};
      state.token = token ?? 'cookie'; // truthy
      state.role = role ?? null;
      state.username = username ?? null;
      
    },
    logout: (state) => {
      state.token = null;
      state.role = null;
      state.username = null;
      
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;