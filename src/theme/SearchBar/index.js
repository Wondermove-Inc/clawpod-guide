import React, { useId, useMemo, useState } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import koreanGuide from '../../../guide-index.json';
import englishGuide from '../../../i18n/en/docusaurus-plugin-content-docs/current/guide-index.json';

export default function SearchBar() {
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const english = currentLocale === 'en';
  const guide = english ? englishGuide : koreanGuide;
  const searchLabel = english ? 'Search the guide' : '가이드 검색';
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const resultsId = useId();
  const results = useMemo(() => {
    const terms = query.trim().toLocaleLowerCase(currentLocale).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return guide.pages.map((page) => {
      const title = page.title.toLocaleLowerCase(currentLocale);
      const body = `${page.description} ${page.text}`.toLocaleLowerCase(currentLocale);
      const score = terms.every((term) => title.includes(term) || body.includes(term))
        ? terms.reduce((sum, term) => sum + (title.includes(term) ? 10 : 1), 0) : 0;
      return { ...page, score };
    }).filter((page) => page.score).sort((a, b) => b.score - a.score).slice(0, 8);
  }, [query, guide, currentLocale]);
  const visible = open && query.trim().length > 0;
  return <div className="guide-search" onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }} onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false); }}>
    <input type="search" aria-label={searchLabel} aria-controls={visible ? resultsId : undefined}
      placeholder={searchLabel} value={query} onFocus={() => setOpen(true)}
      onChange={(event) => { setQuery(event.target.value); setOpen(true); }} />
    {visible && <div id={resultsId} className="guide-search-results">
      <div role="status">{english ? (results.length ? `${results.length} results` : 'No results found.') : (results.length ? `검색 결과 ${results.length}개` : '검색 결과가 없습니다.')}</div>
      <ul>{results.map((page) => <li key={page.path}>
        <Link to={page.path === 'index' ? '/' : `/${page.path}/`} onClick={() => setOpen(false)}>
          {page.title}<small>{page.description}</small>
        </Link>
      </li>)}</ul>
    </div>}
  </div>;
}
