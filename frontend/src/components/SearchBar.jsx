import React, { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [term, setTerm] = useState('');

  const handleClick = () => {
    onSearch(term);
  };

  return (
    <div className="flex gap-2 mb-4">
      <input
        type="text"
        className="border p-2 flex-1 rounded"
        placeholder="Chercher un produit..."
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
      <button
        onClick={handleClick}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Rechercher
      </button>
    </div>
  );
}