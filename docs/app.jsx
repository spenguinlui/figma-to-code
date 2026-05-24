// App shell: topbar + sidebar + routed content with hash routing.
// (React hooks are accessed via React.* — top-level destructure happens in ui.jsx)

function useHashRoute(initial = 'overview') {
  const valid = Object.keys(PAGES);
  const read = () => {
    const h = window.location.hash.replace(/^#\/?/, '').trim();
    return valid.includes(h) ? h : initial;
  };
  const [route, setRoute] = useState(read());
  useEffect(() => {
    const onHash = () => {
      const r = read();
      setRoute(r);
      window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const go = (id) => {
    if (window.location.hash !== '#/' + id) {
      window.location.hash = '#/' + id;
    } else {
      window.scrollTo({ top: 0 });
    }
  };
  return [route, go];
}

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('figma-to-code-docs-dark');
    if (saved !== null) return saved === '1';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('figma-to-code-docs-dark', dark ? '1' : '0');
  }, [dark]);
  return [dark, setDark];
}

function BrandMark() {
  // Original mark: a square frame with a small node + connecting line — abstract "node to component"
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="1.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="8.5" y="8.5" width="6" height="6" rx="1" fill="currentColor"/>
      <path d="M7.5 7.5 L8.5 8.5" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  );
}

function Sidebar({ route, go, open, onClose }) {
  return (
    <aside className={'sidebar' + (open ? ' open' : '')}>
      {NAV.map(sec => (
        <div className="sidebar-section" key={sec.section}>
          <h4>{sec.section}</h4>
          {sec.items.map(item => (
            <div
              key={item.id}
              className={'nav-link' + (route === item.id ? ' active' : '')}
              onClick={() => { go(item.id); onClose && onClose(); }}
            >
              <span className="nav-num">{item.num}</span>
              <span className="nav-dot" style={{ background: item.dot }}></span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      ))}

      <div className="sidebar-section">
        <h4>Resources</h4>
        <a
          className="nav-link"
          href="https://github.com/spenguinlui/figma-to-code"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="nav-num">↗</span>
          <span className="nav-dot" style={{ background: 'var(--ink-3)' }}></span>
          <span>GitHub repo</span>
        </a>
      </div>
    </aside>
  );
}

function TopBar({ dark, setDark, onMenu }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="ghost-btn menu-btn"
          onClick={onMenu}
          aria-label="menu"
          style={{ padding: '6px 8px' }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="2" y1="4" x2="14" y2="4"/>
            <line x1="2" y1="8" x2="14" y2="8"/>
            <line x1="2" y1="12" x2="14" y2="12"/>
          </svg>
        </button>
        <div className="brand">
          <div className="brand-mark"><BrandMark /></div>
          <span>figma-to-code</span>
          <small>/ docs</small>
        </div>
      </div>

      <div className="topbar-right">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-5)' }}>
          v0.1 · 內部文件
        </span>
        <span className="brand-divider"></span>
        <button
          className="ghost-btn"
          onClick={() => setDark(!dark)}
          title="toggle theme"
          aria-label="toggle theme"
        >
          {dark
            ? <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="3.2"/><line x1="8" y1="1.5" x2="8" y2="3"/><line x1="8" y1="13" x2="8" y2="14.5"/><line x1="1.5" y1="8" x2="3" y2="8"/><line x1="13" y1="8" x2="14.5" y2="8"/><line x1="3.5" y1="3.5" x2="4.5" y2="4.5"/><line x1="11.5" y1="11.5" x2="12.5" y2="12.5"/><line x1="3.5" y1="12.5" x2="4.5" y2="11.5"/><line x1="11.5" y1="4.5" x2="12.5" y2="3.5"/></svg>
            : <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M13 9.5A5.5 5.5 0 0 1 6.5 3a0.5 0.5 0 0 0-0.7-0.6A6.5 6.5 0 1 0 13.6 10.2 0.5 0.5 0 0 0 13 9.5z"/></svg>}
          <span>{dark ? 'Light' : 'Dark'}</span>
        </button>
        <a
          className="ghost-btn"
          href="https://github.com/spenguinlui/figma-to-code"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.34c-2.22.48-2.69-1.07-2.69-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.22.82 1.22.82.71 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.77-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.01.08-2.11 0 0 .67-.21 2.2.82a7.65 7.65 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.91.08 2.11.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.74.54 1.49v2.21c0 .21.15.46.55.38A8 8 0 0 0 8 0z"/></svg>
          <span>GitHub</span>
        </a>
      </div>
    </header>
  );
}

function PageFooter({ route, go }) {
  const { prev, next } = adjacent(route);
  return (
    <div className="page-foot">
      {prev ? (
        <div className="foot-btn" onClick={() => go(prev.id)}>
          <small>← 上一頁 · {prev.num}</small>
          <span>{prev.label}</span>
        </div>
      ) : <div style={{ flex: '1 1 240px' }} />}
      {next ? (
        <div className="foot-btn right" onClick={() => go(next.id)}>
          <small>下一頁 · {next.num} →</small>
          <span>{next.label}</span>
        </div>
      ) : <div style={{ flex: '1 1 240px' }} />}
    </div>
  );
}

function TOC({ route }) {
  const entries = PAGE_TOC[route] || [];
  if (!entries.length) return null;
  return (
    <aside className="toc">
      <h5>On this page</h5>
      {entries.map(([id, label]) => (
        <a key={id} href={`#/${route}#${id}`} onClick={(e) => {
          e.preventDefault();
          const el = document.getElementById(id);
          if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 70;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }}>{label}</a>
      ))}
    </aside>
  );
}

function App() {
  const [route, go] = useHashRoute('overview');
  const [dark, setDark] = useDarkMode();
  const [menuOpen, setMenuOpen] = useState(false);

  // ensure URL has a route
  useEffect(() => {
    if (!window.location.hash) window.location.hash = '#/overview';
  }, []);

  const Page = PAGES[route] || PAGES.overview;

  return (
    <>
      <TopBar dark={dark} setDark={setDark} onMenu={() => setMenuOpen(o => !o)} />
      <div className="shell">
        <Sidebar route={route} go={go} open={menuOpen} onClose={() => setMenuOpen(false)} />
        <main className="main">
          <article className="content">
            <Page go={go} />
            <PageFooter route={route} go={go} />
          </article>
          <TOC route={route} />
        </main>
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
