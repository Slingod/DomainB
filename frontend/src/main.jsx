// /home/slingo/Ends/my-shop/frontend/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';

// ⬇️ i18n (internationalisation)
import './i18n/i18n'; // ← cette ligne est cruciale pour init i18next

// Redux
import { Provider } from 'react-redux';
import { store } from './store/store';

// React Router
import { BrowserRouter as Router } from 'react-router-dom';

// Helmet pour SEO
import { HelmetProvider } from 'react-helmet-async';

// Composant racine
import App from './App';

// Styles globaux
import './index.scss';
import './App.scss';

const rootElement = document.getElementById('root');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </Router>
    </Provider>
  </React.StrictMode>
);