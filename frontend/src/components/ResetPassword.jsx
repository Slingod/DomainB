import React, { useState } from "react";
import api from "../api/api";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
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
        newPassword: password, // ✅ le backend attend "newPassword"
      });
      setStatus({ message: res.data.message, error: false });

      // Redirige vers login après un petit délai
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || "Erreur lors de la réinitialisation.";
      setStatus({ message: errorMsg, error: true });
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>Réinitialisez votre mot de passe</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Nouveau mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <button type="submit">Réinitialiser</button>
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