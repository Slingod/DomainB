import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import './CGU.scss'; // À créer ou personnaliser selon ton design

export default function CGU() {
  return (
    <main className="page cgu-page">
      <Helmet>
        <title>Conditions Générales d’Utilisation – Domaine Berthuit</title>
        <meta name="description" content="Consultez les Conditions Générales d'Utilisation du site Domaine Berthuit. Découvrez vos droits et obligations en tant qu'utilisateur." />
        <meta name="keywords" content="CGU, Domaine Berthuit, conditions d'utilisation, mentions légales, réservation, politique de confidentialité" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.domaineberthuit.com/cgu" />
      </Helmet>

      <h1>Conditions Générales d’Utilisation</h1>

      <nav className="toc">
        <h2>Table des matières</h2>
        <ul>
          <li><a href="#objet">1. Objet</a></li>
          <li><a href="#services">2. Services proposés</a></li>
          <li><a href="#acces">3. Accès et utilisation</a></li>
          <li><a href="#compte">4. Comptes utilisateurs</a></li>
          <li><a href="#reservations">5. Réservations et commandes</a></li>
          <li><a href="#donnees">6. Données personnelles</a></li>
          <li><a href="#propriete">7. Propriété intellectuelle</a></li>
          <li><a href="#responsabilite">8. Responsabilité</a></li>
          <li><a href="#modification">9. Modification des CGU</a></li>
          <li><a href="#loi">10. Loi applicable – Litiges</a></li>
          <li><a href="#mentions">11. Mentions légales</a></li>
        </ul>
      </nav>

      <section id="objet">
        <h2>1. Objet</h2>
        <p>
          Les présentes CGU régissent l’accès et l’utilisation du site internet <strong>https://www.domaineberthuit.com</strong> (ci-après « le Site »), édité par la société Domaine Berthuit (ci-après « l’Éditeur »). En accédant et naviguant sur le Site, l’utilisateur (ci-après « l’Utilisateur ») accepte sans réserve les présentes conditions.
        </p>
      </section>

      <section id="services">
        <h2>2. Services proposés</h2>
        <p>
          Le Site permet à l’Utilisateur de découvrir le domaine viticole, de réserver des visites, dégustations ou autres activités œnotouristiques, d’acheter des produits, de poser des questions via formulaire et de s’informer sur les actualités du domaine.
        </p>
      </section>

      <section id="acces">
        <h2>3. Accès et utilisation</h2>
        <p>
          L’Utilisateur déclare être âgé d’au moins 18 ans. Toute utilisation du Site par un mineur est interdite sauf sous la surveillance d’un représentant légal. L’accès au Site est gratuit, hors coût d’accès Internet.
        </p>
        <p>
          L’Éditeur met en œuvre tous les moyens raisonnables pour garantir un accès permanent, mais ne peut être tenu responsable d’indisponibilités temporaires.
        </p>
      </section>

      <section id="compte">
        <h2>4. Comptes utilisateurs</h2>
        <p>
          Certaines fonctionnalités peuvent nécessiter la création d’un compte. L’Utilisateur s’engage à fournir des informations exactes et à jour. Il reste responsable de la confidentialité de son mot de passe.
        </p>
        <p>
          Toute utilisation frauduleuse devra être signalée à l’Éditeur.
        </p>
      </section>

      <section id="reservations">
        <h2>5. Réservations et commandes</h2>
        <p>
          Les réservations peuvent être gratuites ou payantes. Le paiement sécurisé est assuré via STRIPE. Toute commande ou réservation implique acceptation des présentes CGU ainsi que des conditions particulières propres à chaque offre.
        </p>
      </section>

      <section id="donnees">
        <h2>6. Données personnelles</h2>
        <p>
          Le Site collecte des données personnelles nécessaires à son fonctionnement. Pour plus d’informations, l’Utilisateur est invité à consulter notre <Link to="/privacy-policy">Politique de Confidentialité</Link>.
        </p>
      </section>

      <section id="propriete">
        <h2>7. Propriété intellectuelle</h2>
        <p>
          L’ensemble du contenu du Site (textes, images, vidéos, logos, etc.) est protégé par le droit de la propriété intellectuelle. Toute reproduction sans autorisation écrite préalable est interdite.
        </p>
      </section>

      <section id="responsabilite">
        <h2>8. Responsabilité</h2>
        <ul>
          <li>en cas d’interruption du service ou de bug,</li>
          <li>en cas de contenus publiés par des tiers,</li>
          <li>en cas de défaillance d’un Professionnel partenaire.</li>
        </ul>
      </section>

      <section id="modification">
        <h2>9. Modification des CGU</h2>
        <p>
          Les CGU peuvent être modifiées à tout moment. Toute modification est applicable dès sa mise en ligne.
        </p>
      </section>

      <section id="loi">
        <h2>10. Loi applicable – Litiges</h2>
        <p>
          Les présentes CGU sont régies par le droit français. Tout litige relèvera de la compétence exclusive des tribunaux français.
        </p>
      </section>

      <section id="mentions">
        <h2>11. Mentions légales</h2>
        <p>
          <strong>Éditeur :</strong> Domaine Berthuit, XXXXXXXXXXXXXXX<br />
          <strong>Adresse :</strong> XXXXXXXXXXXXXXX<br />
          <strong>Email :</strong> XXXXXXXXXXXXXXX<br />
          <strong>SIRET :</strong> XXXXXXXXXXXXXXX
        </p>
        <p>Dernière mise à jour : Juillet 2025</p>
      </section>
    </main>
  );
}