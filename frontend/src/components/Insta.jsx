import React from "react";
import "./Insta.scss";

const INSTAGRAM_URL = "https://www.instagram.com/domaine_lucas_berthuit/";

export default function Insta() {
  return (
    <div className="insta-ctn" aria-hidden={false}>
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Visiter notre page Instagram (ouvre dans un nouvel onglet)"
        className="insta-link"
      >
        {/* simple svg instagram icon */}
        <svg className="insta-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 12a5 5 0 1 0 10 0 5 5 0 0 0-10 0z" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" />
        </svg>
      </a>
      <div className="insta-label">Instagram</div>
    </div>
  );
}
