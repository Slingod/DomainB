import React from 'react';
import ReactDOM from 'react-dom/client';

// Redux
import { Provider } from 'react-redux';
import { store } from './store/store';

// React Router
import { BrowserRouter as Router } from 'react-router-dom';

// Helmet Async pour le head management (SEO dynamique)
import { HelmetProvider } from 'react-helmet-async';

// Le composant racine de votre appli
import App from './App';

// Styles globaux
import './index.scss';  // reset, variables CSS, règles de base…
import './App.scss';    // layout principal (containers, grilles, utilitaires…)

const rootElement = document.getElementById('root');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/* Fournit le store Redux à toute l’appli */}
    <Provider store={store}>
      {/* Permet les routes client-side */}
      <Router>
        {/* Permet aux components d’utiliser Helmet pour le head */}
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </Router>
    </Provider>
  </React.StrictMode>
);