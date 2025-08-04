import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import "./ResetPassword.scss";

export default function ResetPassword() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState({ message: "", error: false });

  useEffect(() => {
    if (status.message) {
      const timer = setTimeout(() => {
        setStatus({ message: '', error: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: "", error: false });

    if (password !== confirm) {
      return setStatus({
        message: t('newPassword.errors.noMatch'),
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
        err.response?.data?.error || t('newPassword.errors.generic');
      setStatus({ message: errorMsg, error: true });
    }
  };

  return (
    <main className="reset-password-container">
      <Helmet>
        <title>{t('newPassword.meta.title')}</title>
        <meta
          name="description"
          content={t('newPassword.meta.description')}
        />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://www.domaine-berthuit.fr/reset-password" />
      </Helmet>

      <section className="reset-password-card" aria-labelledby="reset-title">
        <h1 id="reset-title">{t('newPassword.title')}</h1>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="password" className="visually-hidden">
            {t('newPassword.password')}
          </label>
          <input
            id="password"
            type="password"
            placeholder={t('newPassword.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-label={t('newPassword.password')}
          />

          <label htmlFor="confirm" className="visually-hidden">
            {t('newPassword.confirm')}
          </label>
          <input
            id="confirm"
            type="password"
            placeholder={t('newPassword.confirm')}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            aria-label={t('newPassword.confirm')}
          />

          <button type="submit">{t('newPassword.submit')}</button>
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
            {t('newPassword.back')}
          </Link>
        </nav>
      </section>
    </main>
  );
}
