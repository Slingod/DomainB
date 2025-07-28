import React from "react";
import { Helmet } from "react-helmet";
import "./contact.scss";

export default function Contact() {
  return (
    <>
      {/* SEO */}
      <Helmet>
        <title>Contactez-nous — Domaine Berthuit</title>
        <meta
          name="description"
          content="Contactez le Domaine Berthuit (31 du Minervois, 11700 Pépieux). Tél : 06 68 96 18 34 – Email : lucas@domaineberthuit.com. Dirigeant : Lucas Berthuit."
        />
      </Helmet>

      <main className="contact-page">
        <h1>Contactez-nous</h1>
        <p>
          Vous avez une question, une commande spéciale ou souhaitez en savoir plus sur nos vins bio ? N’hésitez pas à nous contacter !
        </p>

        <div className="contact-cards">
          <div className="card address-card">
            <h2>Adresse</h2>
            <address>
              Domaine Berthuit<br />
              31 du Minervois<br />
              11700 Pépieux
            </address>
          </div>

          <div className="card contact-card">
            <h2>Contact</h2>
            <p>
              <strong>Téléphone :</strong>{" "}
              <a href="tel:+33668961834">06 68 96 18 34</a>
            </p>
            <p>
              <strong>Email :</strong>{" "}
              <a href="mailto:lucas@domaineberthuit.com">
                lucas@domaineberthuit.com
              </a>
            </p>
          </div>

          <div className="card rep-card">
            <h2>Représentant</h2>
            <p>
              <strong>Nom :</strong> Lucas Berthuit
            </p>
            <p>
              <strong>Qualité :</strong> Dirigeant
            </p>
            <p>
              <strong>Tél. direct :</strong>{" "}
              <a href="tel:+33668961834">06 68 96 18 34</a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}