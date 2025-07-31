import { Helmet } from 'react-helmet';

export default function Contact() {
  return (
    <main className="page">
      <Helmet>
        <title>Contact – Domaine Berthuit</title>
        <meta name="description" content="Contactez-nous pour toute question ou demande d'information." />
      </Helmet>

      <h1>Contact</h1>
      <p>Pour toute demande, contactez-nous à l’adresse suivante :</p>
      <p><a href="mailto:contact@domaine-berthuit.fr">contact@domaine-berthuit.fr</a></p>
    </main>
  );
}
