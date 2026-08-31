'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, CircleDashed, Compass, Database, Lightbulb, Menu, Search, Sparkles, Target, X } from 'lucide-react';

const sections = [
  { id: 'status', title: '현재 자료 상태', keywords: '자료 없음 대기 업데이트' },
  { id: 'map', title: '학습 지도', keywords: '디지털 전환 전략 데이터 플랫폼 고객 조직' },
  { id: 'workflow', title: '노트가 쌓이는 방식', keywords: '강의자료 녹음 질문 검증 노트' },
  { id: 'ready', title: '학습 준비 체크', keywords: '체크 퀴즈 복습 준비' },
];

const planned = [
  { icon: Compass, label: '전략', title: '디지털 전환의 방향', text: '강의자료가 추가되면 정의·사례·교수님 강조점을 연결합니다.' },
  { icon: Database, label: '데이터', title: '의사결정과 데이터', text: '수업에서 다룬 지표와 분석 틀만 근거와 함께 정리합니다.' },
  { icon: Target, label: '실행', title: '조직과 비즈니스 모델', text: '기업 사례를 개념, 원인, 결과, 시험 포인트로 분해합니다.' },
];

export default function Home() {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [ready, setReady] = useState(() => {
    if (typeof window === 'undefined') return false;
    try { return localStorage.getItem('digital-management-completed') === 'true'; } catch { return false; }
  });
  const [answerOpen, setAnswerOpen] = useState(false);
  const matches = useMemo(() => {
    const key = query.trim().toLowerCase();
    return key ? sections.filter((item) => `${item.title} ${item.keywords}`.toLowerCase().includes(key)) : sections;
  }, [query]);

  function go(id: string) {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  function toggleReady() {
    const next = !ready;
    setReady(next);
    try { localStorage.setItem('digital-management-completed', String(next)); } catch { /* device-local storage may be unavailable */ }
  }

  return <div className="site-shell">
    <header className="topbar">
      <a className="brand" href="#top"><span className="brand-mark"><Sparkles size={19} /></span><span><b>Shift Note</b><small>디지털경영 학습실</small></span></a>
      <label className="search-box"><Search size={17} /><input aria-label="개념 검색" placeholder="개념이나 학습 단계 검색" value={query} onChange={(e) => { setQuery(e.target.value); if (e.target.value) setMenuOpen(true); }} />{query && <button aria-label="검색어 지우기" onClick={() => { setQuery(''); setMenuOpen(false); }}><X size={16} /></button>}</label>
      <button className="mobile-menu" aria-label={menuOpen ? '목차 닫기' : '목차 열기'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      <div className="progress"><span>{ready ? '100' : '0'}%</span><i><b style={{ width: ready ? '100%' : '0%' }} /></i></div>
    </header>
    <div className="workspace" id="top">
      {menuOpen && <button className="backdrop" aria-label="목차 닫기" onClick={() => setMenuOpen(false)} />}
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <a className="hub-link" href="https://hyunchanwi.github.io/study-hub/"><ArrowLeft size={15} /> 전체 과목</a>
        <p className="nav-label">FIRST ROOM</p>
        <button className="week active" onClick={() => go('status')}><span>{ready ? <Check size={14} /> : '01'}</span><b>학습실 준비</b><small>자료 추가 전</small></button>
        <p className="nav-label section-label">{query ? `검색 결과 ${matches.length}개` : '이 페이지에서'}</p>
        <nav>{matches.map((item) => <button key={item.id} onClick={() => go(item.id)}>{item.title}<ArrowRight size={13} /></button>)}</nav>
        {matches.length === 0 && <p className="empty-search">일치하는 항목이 없습니다.</p>}
      </aside>
      <main className="content">
        <section className="hero">
          <div><p className="eyebrow"><span /> DIGITAL MANAGEMENT · READY</p><h1>변화를 외우지 않고,<br /><em>구조로 이해하는 곳.</em></h1><p>강의자료가 아직 등록되지 않았습니다. 내용을 추측해 채우는 대신, 자료가 들어오는 순간 정확한 학습 노트로 전환될 준비를 마쳤습니다.</p><div className="chips"><span>자료 기반</span><span>질문 누적</span><span>시험 복습</span></div></div>
          <button className={`complete ${ready ? 'done' : ''}`} onClick={toggleReady}>{ready ? <><Check size={18} /> 준비 확인됨</> : <><Target size={18} /> 준비 확인</>}</button>
        </section>
        <div className="stack">
          <section className="card status-card" id="status"><div><p className="kicker"><CircleDashed size={16} /> CURRENT STATUS</p><h2>지금은 ‘자료 대기’ 상태예요</h2><p className="lead">현재 디지털경영 폴더에는 강의자료가 없습니다. 그래서 교수님의 범위나 개념을 임의로 만들지 않습니다.</p></div><div className="status-panel"><span>01</span><b>자료가 추가되면</b><p>슬라이드·녹음·질문을 대조해 출처가 분명한 주차별 노트로 게시합니다.</p></div></section>
          <section className="card" id="map"><p className="kicker"><Compass size={16} /> LEARNING MAP</p><h2>자료가 들어오면 이 세 축으로 정리합니다</h2><p className="sub">아래는 강의 내용이 아니라 <b>노트를 분류할 준비 구조</b>입니다. 실제 명칭과 범위는 자료 확인 후 바뀔 수 있습니다.</p><div className="planned-grid">{planned.map(({ icon: Icon, label, title, text }) => <article key={title}><span><Icon size={18} /></span><small>{label} · 자료 확인 전</small><h3>{title}</h3><p>{text}</p></article>)}</div></section>
          <section className="card" id="workflow"><p className="kicker"><BookOpen size={16} /> NOTE PIPELINE</p><h2>대화와 수업이 노트가 되는 과정</h2><div className="pipeline"><article><span>1</span><b>자료 확인</b><p>슬라이드·과제 범위 파악</p></article><ArrowRight /><article><span>2</span><b>강의 대조</b><p>녹음·질문의 강조점 결합</p></article><ArrowRight /><article><span>3</span><b>학습 노트</b><p>개념·예시·문제로 공개</p></article></div><div className="promise"><Lightbulb size={18} /><p><b>게시 원칙:</b> 원본 파일은 공개하지 않고, 검토한 설명과 슬라이드·시간 위치만 남깁니다.</p></div></section>
          <section className="quiz" id="ready"><p className="kicker"><Target size={16} /> READY CHECK</p><h2>학습 준비 원칙 확인</h2><div className="question"><div><span>Q1</span><p>자료가 없더라도 일반적인 디지털경영 내용을 수업 내용처럼 먼저 채운다.</p></div><button onClick={() => setAnswerOpen(!answerOpen)}>{answerOpen ? '해설 닫기' : '정답 확인'}</button>{answerOpen && <div className="answer"><b>정답 X</b><p>이 사이트는 실제 강의자료와 대화를 기준으로 누적합니다. 현재는 정직한 대기 상태가 맞습니다.</p></div>}</div></section>
        </div>
      </main>
      <aside className="rail"><p>현재 상태</p><div><CircleDashed size={18} /><b>자료 대기</b><span>학습실 구조 준비 완료</span></div><p className="rail-label">기억할 원칙</p><blockquote>자료보다 먼저<br />내용을 만들지 않는다.</blockquote></aside>
    </div>
  </div>;
}
