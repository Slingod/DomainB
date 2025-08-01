import React from 'react';
import './EnvelopeAnimation.scss';

export default function EnvelopeAnimation() {
  return (
    <a href="mailto:contact@domaine-berthuit.fr" className="letter-image-link" aria-label="Envoyer un e-mail">
      <div className="letter-image">
        <div className="animated-mail">
          <div className="back-fold"></div>
          <div className="letter">
            <div className="letter-border"></div>
            <div className="letter-title"></div>
            <div className="letter-context"></div>
            <div className="letter-stamp"></div>
          </div>
          <div className="top-fold"></div>
          <div className="body"></div>
          <div className="left-fold"></div>
        </div>
        <div className="shadow"></div>
      </div>
    </a>
  );
}