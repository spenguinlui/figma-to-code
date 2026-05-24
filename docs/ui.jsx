// UI primitives for the figma-to-code docs site.
// Exposed on window so other babel <script> tags can use them.

const { useState, useEffect, useRef } = React;

// ---------- tiny syntax highlighter ----------
// Token marks are pre-baked in the source string as <span class="tok-X">...</span>.
// CodeBlock just renders innerHTML to keep things simple and safe (we author the strings).
function CodeBlock({ file, lang, children }) {
  return (
    <div className="code">
      <div className="code-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="code-dots"><span></span><span></span><span></span></div>
          {file ? <span className="code-file">{file}</span> : null}
        </div>
        {lang ? <span className="code-lang">{lang}</span> : null}
      </div>
      <pre dangerouslySetInnerHTML={{ __html: children }} />
    </div>
  );
}

function Callout({ kind = 'info', label, children }) {
  const cls = 'callout' + (kind === 'warn' ? ' callout--warn' : kind === 'danger' ? ' callout--danger' : kind === 'ok' ? ' callout--ok' : '');
  return (
    <div className={cls}>
      {label ? <div className="callout-label">{label}</div> : null}
      <div>{children}</div>
    </div>
  );
}

function Pill({ kind = 'ok', children }) {
  const cls = 'pill' + (kind === 'warn' ? ' pill--warn' : kind === 'info' ? ' pill--info' : kind === 'bad' ? ' pill--bad' : '');
  return <span className={cls}><span className="pill-dot"></span>{children}</span>;
}

function Table({ head, rows }) {
  return (
    <div className="tablewrap">
      <table>
        <thead>
          <tr>{head.map((h, i) => <th key={i}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => <td key={j} dangerouslySetInnerHTML={{ __html: c }} />)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------- hero diagram: Figma node tree → React code ----------
function HeroDiagram() {
  return (
    <div className="hero-diagram">
      <div className="hero-frame">
        <div className="hero-frame-head">
          <span className="hero-frame-name">NewsCard / Default</span>
          <span className="hero-frame-tag">FRAME · 1440</span>
        </div>
        <div className="mock-node mock-node--accent">
          <span className="mn-name">⬚ NewsCard</span>
          <span className="mn-size">266 × 320</span>
        </div>
        <div className="mock-children">
          <div className="mock-node"><span className="mn-name">⬚ Thumbnail</span><span className="mn-size">266 × 178</span></div>
          <div className="mock-node"><span className="mn-name">T  CategoryTag</span><span className="mn-size">auto</span></div>
          <div className="mock-node"><span className="mn-name">T  Title</span><span className="mn-size">266 × 48</span></div>
          <div className="mock-node"><span className="mn-name">T  Date</span><span className="mn-size">auto</span></div>
        </div>
      </div>

      <div className="hero-arrow">
        <svg width="60" height="20" viewBox="0 0 60 20" fill="none">
          <path d="M0 10 H50 M45 5 L52 10 L45 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="hero-arrow-label">get_design_<br />context()</span>
        <svg width="60" height="20" viewBox="0 0 60 20" fill="none" style={{ marginTop: 4 }}>
          <path d="M0 10 H50 M45 5 L52 10 L45 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="hero-code">
        <div className="hero-code-head">
          <span className="hero-code-dot"></span>
          <span>NewsCard.tsx · react + tailwind v4</span>
        </div>
        <pre dangerouslySetInnerHTML={{ __html:
`<span class="tok-c">// Purpose: 新聞卡片，圖片 + 分類 + 標題 + 日期</span>
<span class="tok-k">export function</span> <span class="tok-f">NewsCard</span><span class="tok-p">(</span><span class="tok-p">{</span> title, date, tag, image, className, style <span class="tok-p">})</span> <span class="tok-p">{</span>
  <span class="tok-k">return</span> <span class="tok-p">(</span>
    <span class="tok-t">&lt;article</span>
      <span class="tok-a">className</span>=<span class="tok-s">{\`w-[266px] rounded-[10px] \${className ?? ""}\`}</span>
      <span class="tok-a">style</span>=<span class="tok-p">{{</span>...style<span class="tok-p">}}</span><span class="tok-t">&gt;</span>
      <span class="tok-t">&lt;img</span> <span class="tok-a">src</span>=<span class="tok-p">{</span>image<span class="tok-p">}</span> <span class="tok-a">className</span>=<span class="tok-s">"h-[178px] w-full"</span> <span class="tok-t">/&gt;</span>
      <span class="tok-t">&lt;CategoryTag</span> <span class="tok-a">label</span>=<span class="tok-p">{</span>tag<span class="tok-p">}</span> <span class="tok-t">/&gt;</span>
      <span class="tok-t">&lt;h3</span> <span class="tok-a">className</span>=<span class="tok-s">"text-ink leading-6"</span><span class="tok-t">&gt;</span><span class="tok-p">{</span>title<span class="tok-p">}</span><span class="tok-t">&lt;/h3&gt;</span>
      <span class="tok-t">&lt;time</span> <span class="tok-a">className</span>=<span class="tok-s">"text-gray text-[12px]"</span><span class="tok-t">&gt;</span><span class="tok-p">{</span>date<span class="tok-p">}</span><span class="tok-t">&lt;/time&gt;</span>
    <span class="tok-t">&lt;/article&gt;</span>
  <span class="tok-p">);</span>
<span class="tok-p">}</span>`
        }} />
      </div>
    </div>
  );
}

// ---------- sidebar nav meta ----------
const NAV = [
  {
    section: 'Getting started',
    items: [
      { id: 'overview',     num: '01', label: '概覽',         dot: 'var(--dot-6)' },
      { id: 'quickstart',   num: '02', label: '快速開始',     dot: 'var(--dot-5)' },
      { id: 'access',       num: '03', label: '存取與 .env',  dot: 'var(--dot-2)' },
    ],
  },
  {
    section: 'Guides',
    items: [
      { id: 'usage',        num: '04', label: '使用指南',     dot: 'var(--dot-4)' },
      { id: 'commands',     num: '05', label: '指令參考',     dot: 'var(--dot-3)' },
      { id: 'styling',      num: '06', label: '樣式規則',     dot: 'var(--dot-7)' },
    ],
  },
  {
    section: 'Maintainers',
    items: [
      { id: 'architecture', num: '07', label: '架構',         dot: 'var(--dot-1)' },
      { id: 'visual',       num: '08', label: '視覺回歸',     dot: 'var(--dot-5)' },
      { id: 'troubleshoot', num: '09', label: '疑難排解',     dot: 'var(--dot-2)' },
    ],
  },
];

function flatNav() {
  return NAV.flatMap(s => s.items);
}

function navIndex(id) {
  const flat = flatNav();
  return flat.findIndex(i => i.id === id);
}

function adjacent(id) {
  const flat = flatNav();
  const i = flat.findIndex(x => x.id === id);
  return { prev: flat[i - 1], next: flat[i + 1] };
}

Object.assign(window, {
  CodeBlock, Callout, Pill, Table, HeroDiagram,
  NAV, flatNav, navIndex, adjacent,
});
