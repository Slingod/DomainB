import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function SearchBar({ onSearch }) {
  const [term, setTerm] = useState('');
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(term);
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-2 mb-4"
      aria-label={t('search.ariaLabel')}
    >
      <label htmlFor="search-input" className="sr-only">
        {t('search.label')}
      </label>
      <input
        id="search-input"
        type="search"
        className="border p-2 flex-1 rounded"
        placeholder={t('search.placeholder')}
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        aria-label={t('search.ariaLabel')}
        required
      />
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
      >
        {t('search.button')}
      </button>
    </form>
  );
}