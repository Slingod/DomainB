import React, { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [term, setTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(term);
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-2 mb-4"
      aria-label="Barre de recherche produits"
    >
      <label htmlFor="search-input" className="sr-only">
        Rechercher un produit
      </label>
      <input
        id="search-input"
        type="search"
        className="border p-2 flex-1 rounded"
        placeholder="Chercher un produit..."
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        aria-label="Zone de recherche produit"
        required
      />
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
      >
        Rechercher
      </button>
    </form>
  );
}