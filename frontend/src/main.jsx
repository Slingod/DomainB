import React from 'react';
import ReactDOM from 'react-dom/client';

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
import './index.scss'; // reset, base
import './App.scss';   // layout

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