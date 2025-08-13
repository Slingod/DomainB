⚙️ **Présentation du Frontend – Domaine Berthuit**
Le Frontend de ton projet repose sur les technologies modernes suivantes :

🧱 **Stack utilisée**
Technologie Rôle :

- React Bibliothèque JavaScript pour construire l’interface utilisateur (UI)

- Vite Bundler ultra-rapide pour développement React avec Hot Module Replacement (HMR)

- Sass (SCSS) Préprocesseur CSS pour écrire des styles modulaires, maintenables et variables

- React Router Gestion des routes côté client

- Redux Toolkit Gestion d’état global (authentification, données utilisateurs, etc.)

- Helmet Insertion de balises SEO dans le <head> de chaque page dynamiquement

- Axios Requêtes HTTP vers l’API Backend

- ESLint Linter JavaScript/JSX pour garantir la qualité du code

🚀 **Lancer le projet en local**
Une fois les dépendances installées (npm install), tu peux lancer le serveur de développement avec la commande :

```bash
cd frontend
npm run dev

ou

cd frontend
npm run build
npm run preview -- --port 5173 --strictPort

```

✅ Ce que ça fait :
Compile ton code avec Vite

Lance un serveur local ultra-rapide (par défaut sur http://localhost:5173)

Active le Hot Module Replacement (HMR), donc les modifications sont visibles en temps réel dans le navigateur

📁 **Structure typique du Frontend**

frontend/
│
├── src/
│ ├── api/ # Config Axios
│ ├── assets/ # Logos, icônes, images statiques
│ ├── components/ # Composants réutilisables (Header, Footer…)
│ ├── pages/ # Pages de l'application (Signup, Login, Profile…)
│ ├── styles/ # SCSS : variables, mixins, globales
│ └── store/ # Redux Toolkit: slices & store global
│
├── public/ # Fichiers statiques (favicon, index.html)
├── App.jsx # Point d’entrée principal React
├── main.jsx # Bootstrapping de l’app React
└── vite.config.js # Configuration Vite

🌍 **SEO & Accessibilité**

Ton frontend inclut déjà :

Des balises <Helmet> personnalisées pour chaque page

Des rôles ARIA (role="main", aria-label, etc.)

Une structure sémantique claire : <main>, <section>, <label>, etc.
