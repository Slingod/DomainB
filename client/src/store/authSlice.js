import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token:    localStorage.getItem('token'),
  role:     localStorage.getItem('role'),
  username: localStorage.getItem('username'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, { payload: { token, role, username } }) => {
      state.token    = token;
      state.role     = role;
      state.username = username;

      localStorage.setItem('token',    token);
      localStorage.setItem('role',     role);
      localStorage.setItem('username', username);
    },
    logout: state => {
      state.token    = null;
      state.role     = null;
      state.username = null;

      // ✅ Ne pas utiliser `clear` : on cible ce qu’on enlève
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('username');
    }
  }
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;