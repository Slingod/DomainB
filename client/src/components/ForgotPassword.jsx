import React, { useState } from "react";
import api from "../api/api";
import "./ForgotPassword.scss";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ message: "", error: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: "", error: false });

    try {
      const res = await api.post("/auth/request-password-reset", { email });
      setStatus({ message: res.data.message, error: false });
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || "Une erreur est survenue.";
      setStatus({ message: errorMsg, error: true });
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Mot de passe oublié ?</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Votre adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Envoyer un lien de réinitialisation</button>
        </form>
        {status.message && (
          <div className={status.error ? "error" : "message"}>
            {status.message}
          </div>
        )}
        <Link to="/" className="back-link">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}