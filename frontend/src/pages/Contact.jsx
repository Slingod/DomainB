import React from "react";
import { Helmet } from "react-helmet";
import EnvelopeAnimation from "../components/EnvelopeAnimation";
import "./Contact.scss"; // avec majuscule cohérente au fichier

export default function Contact() {
  return (
    <>
      <Helmet>
        <title>Contact – Domaine Berthuit</title>
        <meta
          name="description"
          content="Contactez le Domaine Berthuit (31 du Minervois, 11700 Pépieux). Tél : 06 68 96 18 34 – Email : lucas@domaineberthuit.com. Dirigeant : Lucas Berthuit."
        />
      </Helmet>

      <main className="contact-page">
        <h1>Contactez-nous</h1>
        <p>
          Vous avez une question, une commande spéciale ou souhaitez en savoir plus sur nos vins bio ?
          N’hésitez pas à nous contacter !
        </p>

        <EnvelopeAnimation />

        <div className="contact-cards">
          <div className="card">
            <h2>📍 Adresse</h2>
            <address>
              <strong>Domaine Berthuit</strong><br />
              31 du Minervois<br />
              11700 Pépieux
            </address>
          </div>

          <div className="card">
            <h2>📞 Contact</h2>
            <p><span className="label">Téléphone :</span> <a href="tel:+33668961834">06 68 96 18 34</a></p>
            <p><span className="label">Email :</span> <a href="mailto:lucas@domaineberthuit.com">lucas@domaineberthuit.com</a></p>
          </div>

          <div className="card">
            <h2>👤 Représentant</h2>
            <p><span className="label">Nom :</span> Lucas Berthuit</p>
            <p><span className="label">Poste :</span> PDG</p>
            <p><span className="label">Tél. direct :</span> <a href="tel:+33668961834">06 68 96 18 34</a></p>
          </div>
        </div>
      </main>
    </>
  );
}
