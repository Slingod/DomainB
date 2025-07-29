import React, { useState } from "react";
import api from "../api/api";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import "./ResetPassword.scss";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState({ message: "", error: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: "", error: false });

    if (password !== confirm) {
      return setStatus({
        message: "Les mots de passe ne correspondent pas.",
        error: true,
      });
    }

    try {
      const res = await api.post("/auth/reset-password", {
        token,
        newPassword: password,
      });
      setStatus({ message: res.data.message, error: false });

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || "Erreur lors de la réinitialisation.";
      setStatus({ message: errorMsg, error: true });
    }
  };

  return (
    <main className="reset-password-container">
      <Helmet>
        <title>Réinitialisation de mot de passe - Domaine Berthuit</title>
        <meta
          name="description"
          content="Choisissez un nouveau mot de passe pour accéder à votre compte Domaine Berthuit."
        />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="http://localhost:5173/reset-password" />
      </Helmet>

      <section className="reset-password-card" aria-labelledby="reset-title">
        <h1 id="reset-title">Réinitialisez votre mot de passe</h1>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="password" className="visually-hidden">
            Nouveau mot de passe
          </label>
          <input
            id="password"
            type="password"
            placeholder="Nouveau mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-label="Nouveau mot de passe"
          />

          <label htmlFor="confirm" className="visually-hidden">
            Confirmer le mot de passe
          </label>
          <input
            id="confirm"
            type="password"
            placeholder="Confirmer le mot de passe"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            aria-label="Confirmer le mot de passe"
          />

          <button type="submit">Réinitialiser</button>
        </form>

        {status.message && (
          <div
            role="alert"
            className={status.error ? "error" : "message"}
            aria-live="polite"
          >
            {status.message}
          </div>
        )}

        <nav>
          <Link to="/" className="back-link">
            Retour à l'accueil
          </Link>
        </nav>
      </section>
    </main>
  );
}