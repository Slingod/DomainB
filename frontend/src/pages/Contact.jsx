import React from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import EnvelopeAnimation from "../components/EnvelopeAnimation";
import "./Contact.scss";

export default function Contact() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t("contact.title")} – Domaine Berthuit</title>
        <meta name="description" content={t("contact.description")} />
      </Helmet>

      <main className="contact-page">
        <h1>{t("contact.title")}</h1>
        <p>{t("contact.description")}</p>

        <EnvelopeAnimation />

        <div className="contact-cards">
          <div className="card">
            <h2>📍 {t("contact.addressLabel")}</h2>
            <address>
              <strong>{t("contact.addressName")}</strong><br />
              {t("contact.address").split("\n").map((line, i) => (
                <React.Fragment key={i}>
                  {line}<br />
                </React.Fragment>
              ))}
            </address>
          </div>

          <div className="card">
            <h2>📞 {t("contact.contactLabel")}</h2>
            <p><span className="label">{t("contact.phoneLabel")}:</span> <a href={`tel:${t("contact.phoneRaw")}`}>{t("contact.phone")}</a></p>
            <p><span className="label">{t("contact.emailLabel")}:</span> <a href={`mailto:${t("contact.email")}`}>{t("contact.email")}</a></p>
          </div>

          <div className="card">
            <h2>👤 {t("contact.representative.title")}</h2>
            <p><span className="label">{t("contact.representative.nameLabel")}:</span> {t("contact.representative.name")}</p>
            <p><span className="label">{t("contact.representative.positionLabel")}:</span> {t("contact.representative.position")}</p>
            <p><span className="label">{t("contact.representative.directPhoneLabel")}:</span> <a href={`tel:${t("contact.representative.directPhoneRaw")}`}>{t("contact.representative.directPhone")}</a></p>
          </div>
        </div>
      </main>
    </>
  );
}
