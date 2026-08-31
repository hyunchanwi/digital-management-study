'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, BookOpen, GraduationCap, Hourglass, Info, Menu, Search, ShieldCheck, Sparkles, TriangleAlert, X } from 'lucide-react';
import { guideSections, weeks, type GuideSectionId } from '../src/week-data';

const locationKey = 'digital-management-study-location';
const validWeeks = new Set(weeks.map((week) => week.number));
type DrawerMode = 'closed' | 'menu' | 'search';
type SearchResult = { section: GuideSectionId; sectionLabel: string; snippet: string };
const normalizeSearch = (value: string) => value.normalize('NFKC').toLowerCase();
const compactSearch = (value: string) => normalizeSearch(value).replace(/[^\p{L}\p{N}]+/gu, '');
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const parseSectionHash = (hash: string): GuideSectionId | undefined => {
  const section = hash.replace(/^#/, '') as GuideSectionId;
  return guideSections.some((item) => item.id === section) ? section : undefined;
};

const readInitialLocation = (): { week: number; section?: GuideSectionId } => {
  if (typeof window === 'undefined') return { week: 1 };
  const url = new URL(window.location.href);
  const urlWeek = Number(url.searchParams.get('week'));
  if (validWeeks.has(urlWeek)) return { week: urlWeek, section: parseSectionHash(url.hash) };
  try {
    const stored = window.localStorage.getItem(locationKey);
    if (stored) {
      const parsed = JSON.parse(stored) as { week?: unknown; section?: unknown };
      if (typeof parsed.week === 'number' && validWeeks.has(parsed.week)) {
        return { week: parsed.week, section: typeof parsed.section === 'string' ? parseSectionHash(parsed.section) : undefined };
      }
    }
  } catch { /* 저장 권한이 없어도 학습실은 열립니다. */ }
  return { week: 1 };
};

const makeSnippet = (text: string, query: string) => {
  if (text.length <= 96) return text;
  const index = normalizeSearch(text).indexOf(normalizeSearch(query));
  const start = Math.max(0, index > -1 ? index - 24 : 0);
  const end = Math.min(text.length, start + 96);
  return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`;
};

function SectionNavigation({ week, compact = false, onNavigate }: { week: number; compact?: boolean; onNavigate: (section: GuideSectionId) => void }) {
  return (
    <nav className={compact ? 'compact-section-nav' : 'section-links'} aria-label="이 주차의 구성">
      {compact && <strong>바로가기</strong>}
      {guideSections.map((section) => (
        <a key={section.id} href={`?week=${week}#${section.id}`} onClick={(event) => { event.preventDefault(); onNavigate(section.id); }}>{section.label}</a>
      ))}
    </nav>
  );
}

export default function Home() {
  const initialLocation = readInitialLocation();
  const [activeWeek, setActiveWeek] = useState(initialLocation.week);
  const [query, setQuery] = useState('');
  const [searchJump, setSearchJump] = useState<GuideSectionId | null>(null);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('closed');
  const [isMobile, setIsMobile] = useState(false);
  const [storageError, setStorageError] = useState('');
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const drawerOpenerRef = useRef<HTMLElement | null>(null);
  const queryRef = useRef(query);
  const week = weeks.find((item) => item.number === activeWeek) ?? weeks[0];
  const weekIndex = weeks.findIndex((item) => item.number === week.number);
  const drawerOpen = isMobile && drawerMode !== 'closed';
  const menuModalOpen = isMobile && drawerMode === 'menu';
  const searchResultsOpen = isMobile && drawerMode === 'search';

  const searchResults = useMemo<SearchResult[]>(() => {
    const compactQuery = compactSearch(query);
    if (!compactQuery) return [];
    return guideSections.flatMap((section) => {
      const text = `${section.label} ${section.title} ${section.lead} ${section.points.flatMap((point) => [point.title, point.body]).join(' ')}`;
      const compactText = compactSearch(text);
      const tokens = normalizeSearch(query).split(/[^\p{L}\p{N}]+/u).filter(Boolean).map(compactSearch);
      const matched = compactText.includes(compactQuery) || (tokens.length > 1 && tokens.every((token) => compactText.includes(token)));
      return matched ? [{ section: section.id, sectionLabel: section.label, snippet: makeSnippet(text, query) }] : [];
    });
  }, [query]);

  useEffect(() => { queryRef.current = query; }, [query]);

  const closeDrawer = useCallback((restoreFocus = true) => {
    setDrawerMode('closed');
    if (!restoreFocus) return;
    const opener = drawerOpenerRef.current;
    window.requestAnimationFrame(() => { if (opener?.isConnected && opener.getClientRects().length > 0) opener.focus(); });
  }, []);

  const focusDestination = useCallback((section?: GuideSectionId, smooth = true) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      const target = section ? document.getElementById(section) : headingRef.current;
      if (!target) return;
      target.scrollIntoView({ behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'auto', block: 'start' });
      if (target instanceof HTMLElement) target.focus({ preventScroll: true });
    }));
  }, []);

  const writeLocation = useCallback((number: number, section?: GuideSectionId, replace = false) => {
    const url = new URL(window.location.href);
    url.searchParams.set('week', String(number));
    url.hash = section ? `#${section}` : '';
    window.history[replace ? 'replaceState' : 'pushState']({}, '', `${url.pathname}${url.search}${url.hash}`);
    try {
      window.localStorage.setItem(locationKey, JSON.stringify({ version: 1, week: number, section }));
      setStorageError('');
    } catch { setStorageError('이 브라우저에서는 마지막 학습 위치를 저장할 수 없습니다.'); }
  }, []);

  const openMenu = () => {
    setQuery('');
    drawerOpenerRef.current = menuButtonRef.current;
    setDrawerMode('menu');
  };

  const clearSearch = useCallback((restoreFocus = true) => {
    setQuery('');
    setSearchJump(null);
    if (isMobile) closeDrawer(restoreFocus);
  }, [closeDrawer, isMobile]);

  const handleSearchChange = (value: string) => {
    setQuery(value);
    setSearchJump(null);
    if (isMobile && value.trim()) {
      drawerOpenerRef.current = searchInputRef.current;
      setDrawerMode('search');
    } else if (drawerMode === 'search') setDrawerMode('closed');
  };

  const selectWeek = useCallback((number: number, replace = false) => {
    setActiveWeek(number);
    setSearchJump(null);
    setQuery('');
    if (isMobile) closeDrawer(false);
    writeLocation(number, undefined, replace);
    focusDestination(undefined);
  }, [closeDrawer, focusDestination, isMobile, writeLocation]);

  const navigateSection = useCallback((section: GuideSectionId, replace = false) => {
    writeLocation(activeWeek, section, replace);
    focusDestination(section);
  }, [activeWeek, focusDestination, writeLocation]);

  const selectSearchResult = (result: SearchResult) => {
    setSearchJump(result.section);
    setQuery('');
    if (isMobile) closeDrawer(false);
    writeLocation(activeWeek, result.section);
    focusDestination(result.section);
  };

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)');
    const update = () => { setIsMobile(media.matches); if (!media.matches) setDrawerMode('closed'); };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const url = new URL(window.location.href);
      const nextWeek = Number(url.searchParams.get('week'));
      const safeWeek = validWeeks.has(nextWeek) ? nextWeek : 1;
      const section = parseSectionHash(url.hash);
      setActiveWeek(safeWeek);
      setSearchJump(null);
      setQuery('');
      if (isMobile) closeDrawer(false);
      try { window.localStorage.setItem(locationKey, JSON.stringify({ version: 1, week: safeWeek, section })); }
      catch { setStorageError('이 브라우저에서는 마지막 학습 위치를 저장할 수 없습니다.'); }
      focusDestination(section, false);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [closeDrawer, focusDestination, isMobile]);

  useEffect(() => { if (initialLocation.section) focusDestination(initialLocation.section, false); }, [focusDestination, initialLocation.section]);

  useEffect(() => {
    if (!menuModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => { document.body.style.overflow = previousOverflow; };
  }, [menuModalOpen]);

  useEffect(() => {
    if (!menuModalOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeDrawer(); return; }
      if (event.key !== 'Tab' || !sidebarRef.current) return;
      const focusable = [...sidebarRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeDrawer, menuModalOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !searchResultsOpen) return;
      event.preventDefault(); clearSearch();
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (!queryRef.current.trim() || searchResultsOpen) return;
      const target = event.target as Node;
      if (searchBoxRef.current?.contains(target) || sidebarRef.current?.contains(target)) return;
      clearSearch(false);
    };
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => { document.removeEventListener('keydown', handleEscape); document.removeEventListener('pointerdown', handlePointerDown); };
  }, [clearSearch, searchResultsOpen]);

  return (
    <main>
      <header className="topbar">
        <button ref={menuButtonRef} className="mobile-menu" type="button" onClick={openMenu} aria-label="주차 목차 열기" aria-expanded={menuModalOpen} aria-controls="week-sidebar"><Menu /></button>
        <a className="brand" href={`?week=${week.number}#status`} onClick={(event) => { event.preventDefault(); navigateSection('status'); }}><GraduationCap /><div><strong>디지털경영</strong><span>15주차 학습노트</span></div></a>
        <div className="search-box" ref={searchBoxRef}>
          <Search size={18} aria-hidden="true" />
          <input ref={searchInputRef} value={query} onChange={(event) => handleSearchChange(event.target.value)} onFocus={() => { if (isMobile && query.trim()) { drawerOpenerRef.current = searchInputRef.current; setDrawerMode('search'); } }} placeholder="안내 내용 검색" aria-label="학습실 안내 검색" aria-controls="week-navigation" aria-describedby="search-results-status" />
          {query && <button type="button" className="search-clear" aria-label="검색어 지우기" onClick={() => clearSearch()}><X size={17} /></button>}
        </div>
        <output className="sr-only" id="search-results-status" aria-live="polite" aria-atomic="true">{query.trim() ? (searchResults.length === 0 ? `검색어 ${query}, 결과가 없습니다.` : `검색어 ${query}, 안내 결과 ${searchResults.length}개`) : ''}</output>
        {/* Custom visual progress meter retains native progressbar semantics. */}
        {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role */}
        <div className="progress-summary" role="progressbar" aria-label="학습 완료 진도" aria-valuemin={0} aria-valuemax={15} aria-valuenow={0}><span>0/15 완료</span><div><i style={{ width: '0%' }} /></div></div>
        <span className="mobile-progress" aria-live="polite">0/15 완료</span>
      </header>

      {storageError && <output className="storage-warning"><TriangleAlert size={16} /> {storageError}</output>}
      <div className="app-shell" id="top">
        {menuModalOpen && <button type="button" className="sidebar-backdrop" aria-label="주차 목차 닫기" onClick={() => closeDrawer()} />}
        <aside ref={sidebarRef} className={`sidebar ${drawerOpen ? 'open' : ''} ${menuModalOpen ? 'menu-modal' : ''} ${searchResultsOpen ? 'search-results' : ''}`} id="week-sidebar" role={menuModalOpen ? 'dialog' : undefined} aria-modal={menuModalOpen ? true : undefined} aria-hidden={isMobile && drawerMode === 'closed' ? true : undefined} aria-label={query.trim() ? '학습실 안내 검색 결과' : '전체 주차 목차'} inert={isMobile && drawerMode === 'closed' ? true : undefined}>
          <a className="hub-back" href="https://hyunchanwi.github.io/study-hub/"><ArrowLeft size={15} /> 전체 과목</a>
          <div className="sidebar-title"><BookOpen size={18} /><strong>{query.trim() ? `안내 검색 결과 ${searchResults.length}개` : '전체 주차'}</strong><button ref={closeButtonRef} type="button" onClick={() => query.trim() ? clearSearch(false) : closeDrawer()} aria-label={query.trim() ? '검색 결과 닫기' : '목차 닫기'}><X /></button></div>
          <nav id="week-navigation" aria-label={query.trim() ? '검색된 학습실 안내' : '강의 주차 목록'}>
            {query.trim() ? searchResults.map((result) => (
              <button key={result.section} type="button" className={searchJump === result.section ? 'active' : ''} onClick={() => selectSearchResult(result)}><span className="chapter-number"><Search size={13} /></span><span><strong>{result.sectionLabel}</strong><small className="search-match-meta"><b>학습실 안내</b>{result.snippet}</small></span><ArrowRight size={15} /></button>
            )) : weeks.map((item) => (
              <button key={item.number} type="button" className={week.number === item.number ? 'active' : ''} onClick={() => selectWeek(item.number)} aria-current={week.number === item.number ? 'page' : undefined}><span className="chapter-number">{String(item.number).padStart(2, '0')}</span><span><strong>{item.title}</strong><small>{item.description}</small></span><Hourglass size={14} aria-label="자료 대기" /></button>
            ))}
            {query.trim() && searchResults.length === 0 && <p className="empty-search"><strong>일치하는 안내가 없습니다.</strong><span>현재 검색 대상은 강의 내용이 아닌 학습실 안내입니다.</span></p>}
          </nav>
        </aside>

        <div className="content-wrap">
          <section className="lesson-hero">
            <div><span className="eyebrow">WEEK {String(week.number).padStart(2, '0')} · 강의자료 대기</span><h1 ref={headingRef} tabIndex={-1}>{week.title}</h1><p>이 주차는 아직 등록된 강의자료가 없습니다. 확인되지 않은 강의 내용을 임의로 만들지 않고 자료가 도착할 때까지 대기합니다.</p><div className="topic-row">{week.topics.map((topic) => <span key={topic}>{topic}</span>)}</div></div>
            <button type="button" className="complete-button pending" disabled aria-disabled="true"><Hourglass size={19} /> 자료 대기</button>
          </section>
          <SectionNavigation week={week.number} compact onNavigate={navigateSection} />

          <div className="lesson-layout">
            <article className="lesson-content">
              <section className={`intro-card pending-card ${searchJump === 'status' ? 'search-highlight' : ''}`} id="status" tabIndex={-1}>
                {searchJump === 'status' && <div className="search-location-note"><Search size={16} /><span><strong>안내 검색 위치</strong>현재 상태</span></div>}
                <div className="section-kicker"><Info size={17} /> 강의 내용 아님 · 학습실 안내</div><h2>{guideSections[0].title}</h2><p>{guideSections[0].lead}</p>
                <div className="pending-status"><Hourglass size={20} /><div><strong>{week.title} 자료 대기</strong><span>완료 처리 불가 · 전체 진도 0/15</span></div></div>
                <div className="role-grid">{guideSections[0].points.map((point, index) => <article className="role-card" key={point.title}><div className="role-icon">0{index + 1}</div><h3>{point.title}</h3><p>{point.body}</p></article>)}</div>
              </section>

              <section className={`lesson-section ${searchJump === 'process' ? 'search-highlight' : ''}`} id="process" tabIndex={-1}>
                {searchJump === 'process' && <div className="search-location-note"><Search size={16} /><span><strong>안내 검색 위치</strong>자료 반영 절차</span></div>}
                <div className="section-heading"><div><span className="section-number">01</span><h2>{guideSections[1].title}</h2></div><p>{guideSections[1].lead}</p></div>
                <div className="process-flow">{guideSections[1].points.map((point, index) => <article key={point.title}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{point.title}</strong><p>{point.body}</p></div></article>)}</div>
              </section>

              <section className={`lesson-section ${searchJump === 'ready' ? 'search-highlight' : ''}`} id="ready" tabIndex={-1}>
                {searchJump === 'ready' && <div className="search-location-note"><Search size={16} /><span><strong>안내 검색 위치</strong>준비 방법</span></div>}
                <div className="section-heading"><div><span className="section-number">02</span><h2>{guideSections[2].title}</h2></div><p>{guideSections[2].lead}</p></div>
                <div className="role-grid">{guideSections[2].points.map((point, index) => <article className="role-card" key={point.title}><div className="role-icon">0{index + 1}</div><h3>{point.title}</h3><p>{point.body}</p></article>)}</div>
              </section>

              <section className="trap-card"><ShieldCheck size={22} /><div><strong>콘텐츠 원칙</strong><p>자료가 없는 상태를 숨기거나 예상 강의 내용을 채우지 않습니다. 실제 강의 내용은 출처를 확인한 뒤에만 추가합니다.</p></div></section>
              <section className="lesson-finish" aria-label={`${week.title} 안내 마무리`}>
                <div><span>WEEK {String(week.number).padStart(2, '0')} 상태</span><strong>강의자료를 기다리고 있어요.</strong></div>
                <button type="button" className="finish-complete pending" disabled><Hourglass size={18} /> 완료 처리 불가</button>
                <nav aria-label="주차 이동">{weekIndex > 0 ? <button type="button" onClick={() => selectWeek(weeks[weekIndex - 1].number)}><ArrowLeft size={18} /> 이전 주차</button> : <span />}<button type="button" onClick={() => navigateSection('status')}><ArrowUp size={18} /> 맨 위</button>{weekIndex < weeks.length - 1 ? <button type="button" className="next-chapter" onClick={() => selectWeek(weeks[weekIndex + 1].number)}>다음 주차 <ArrowRight size={18} /></button> : <span />}</nav>
              </section>
            </article>

            <aside className="on-this-page"><strong>이 주차의 구성</strong><SectionNavigation week={week.number} onNavigate={navigateSection} /><div className="memory-tip"><Sparkles size={17} /><span><strong>기억할 원칙</strong>강의 근거가 없는 내용은 만들지 않습니다.</span></div></aside>
          </div>
        </div>
      </div>
    </main>
  );
}
