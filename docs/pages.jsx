// Each page is a function returning { title, lede, toc, body }.
// toc is built from h2/h3 in body — we also emit an explicit list for the sidebar.

// ============================================================
// 01 — OVERVIEW
// ============================================================
function PageOverview({ go }) {
  return (
    <>
      <div className="eyebrow"><span className="dot"></span>OVERVIEW · 01</div>
      <h1 className="page-title">把 Figma 設計稿 <br/>轉成 React + Tailwind 元件。</h1>
      <p className="page-lede">
        figma-to-code 是一個 Figma → React 元件 harness 模板，工作流以 <strong>AI 驅動</strong>為主——你把任務描述清楚交給 Claude Code，並驗收結果。從 Figma 生成元件、組裝頁面、像素級視覺對齊（≤1px），改共用元件後自動回歸驗證受影響頁。附一個範例元件讓整套開箱即跑。
      </p>

      <div className="meta-row">
        <Pill kind="info">Vite + React 19</Pill>
        <Pill kind="info">Tailwind v4</Pill>
        <Pill kind="info">TypeScript</Pill>
        <Pill kind="warn">Figma MCP + REST</Pill>
        <Pill>本地 preview · :3003</Pill>
      </div>

      <HeroDiagram />

      <h2 id="what-it-does">能做什麼</h2>
      <div className="cards">
        <div className="card" onClick={() => go('usage')}>
          <span className="card-tag"><span className="tag-dot" style={{ background: 'var(--dot-6)' }}></span>GENERATE</span>
          <h4>從 Figma 生成元件</h4>
          <p>給 Claude Code 一個 Figma node ID，自動透過 MCP 取規格、REST API 匯出素材，輸出到 <code>components/&lt;分類&gt;/</code>。</p>
        </div>
        <div className="card" onClick={() => go('usage')}>
          <span className="card-tag"><span className="tag-dot" style={{ background: 'var(--dot-5)' }}></span>COMPOSE</span>
          <h4>組裝整個頁面</h4>
          <p>以元件庫拼出 <code>pages/&lt;頁&gt;/*.tsx</code>，並登錄到 <code>dev/Preview.tsx</code> 的本地路由。</p>
        </div>
        <div className="card" onClick={() => go('visual')}>
          <span className="card-tag"><span className="tag-dot" style={{ background: 'var(--dot-4)' }}></span>ALIGN</span>
          <h4>像素級視覺對齊</h4>
          <p>實作 → 截圖比對 → 調整，收斂到 ≤1px。每斷點上限 5 輪，無進展即停損。</p>
        </div>
        <div className="card" onClick={() => go('visual')}>
          <span className="card-tag"><span className="tag-dot" style={{ background: 'var(--dot-1)' }}></span>REGRESS</span>
          <h4>自動視覺回歸</h4>
          <p>改共用元件後，依依賴表只驗用到它的頁面：元件層數值斷言 + 頁面層截圖比對。</p>
        </div>
      </div>

      <h2 id="reading-order">建議閱讀順序</h2>
      <ol>
        <li><a onClick={() => go('quickstart')}>快速開始</a>——把專案跑起來</li>
        <li><a onClick={() => go('usage')}>使用指南</a>——常見任務怎麼交給 Claude Code</li>
        <li><a onClick={() => go('commands')}>指令參考</a>——npm scripts 與 skill 指令</li>
        <li><a onClick={() => go('visual')}>視覺回歸</a>——兩層驗證的邊界與用法</li>
      </ol>

      <Callout kind="info" label="專案規範 / 必讀">
        詳細工作規範見專案內的 <code>CLAUDE.md</code>。日後要改 / 擴充這專案見 <a onClick={() => go('architecture')}>架構</a>。
      </Callout>
    </>
  );
}

// ============================================================
// 02 — QUICK START
// ============================================================
function PageQuickStart({ go }) {
  return (
    <>
      <div className="eyebrow"><span className="dot" style={{ background: 'var(--dot-5)' }}></span>QUICK START · 02</div>
      <h1 className="page-title">把專案跑起來。</h1>
      <p className="page-lede">三件事：裝環境、拿存取權、啟動 dev server。</p>

      <h2 id="prereq">自己要裝</h2>
      <ul>
        <li><strong>Node.js</strong> ≥ 20</li>
        <li><strong>Claude Code</strong> + Figma MCP server 設定</li>
        <li><strong>Chrome</strong> + <strong>Claude in Chrome</strong> 擴充（視覺比對需要）</li>
      </ul>

      <h2 id="first-run">第一次啟動</h2>
      <CodeBlock file="terminal" lang="bash">{
`<span class="tok-c"># 1. 安裝依賴</span>
<span class="tok-f">npm</span> install

<span class="tok-c"># 2. 啟動 dev server</span>
<span class="tok-f">npm</span> run dev

<span class="tok-c"># → 開瀏覽器 http://localhost:3003</span>`
      }</CodeBlock>

      <Callout kind="ok" label="預期看到">
        Vite 啟動完成、preview 頁列出所有已實作元件 / 頁面。任何 console error 都要先處理。
      </Callout>

      <h2 id="next">下一步</h2>
      <div className="cards">
        <div className="card" onClick={() => go('access')}>
          <span className="card-tag"><span className="tag-dot" style={{ background: 'var(--dot-2)' }}></span>NEXT</span>
          <h4>拿存取權 + 設 .env</h4>
          <p>沒有 Figma 存取權的話，AI 拉不到設計稿、prototype 開不了。</p>
        </div>
        <div className="card" onClick={() => go('usage')}>
          <span className="card-tag"><span className="tag-dot" style={{ background: 'var(--dot-4)' }}></span>NEXT</span>
          <h4>下第一個任務</h4>
          <p>例：「幫我做 NewsCard，Figma node <code>1234:5678</code>」。</p>
        </div>
      </div>
    </>
  );
}

// ============================================================
// 03 — ACCESS / ENV
// ============================================================
function PageAccess({ go }) {
  return (
    <>
      <div className="eyebrow"><span className="dot" style={{ background: 'var(--dot-2)' }}></span>ACCESS · 03</div>
      <h1 className="page-title">存取與 <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7em' }}>.env</code> 參數。</h1>
      <p className="page-lede">這個專案吃外部資源——Figma 設計檔、Figma 個人 token。沒有這些 AI 就生不出對的東西。</p>

      <h2 id="must-have">必須先拿到的存取權</h2>
      <ol>
        <li><strong>GitHub repo</strong>——請 admin 加你為 collaborator</li>
        <li><strong>Figma 檔案</strong>——請 admin 邀你進 Figma 專案（否則 MCP 拉不到設計稿、prototype 開不了）</li>
        <li><strong><code>.env</code></strong>——跟 admin 私下索取（不在 git 裡）</li>
      </ol>

      <h2 id="env-vars">.env 參數</h2>
      <Table
        head={['變數', '用途', '怎麼拿']}
        rows={[
          ['<code>FIGMA_FILE_KEY</code>', 'Figma 檔案 key', 'Figma URL <code>figma.com/design/&lt;FILE_KEY&gt;/...</code>'],
          ['<code>FIGMA_CANVAS_NODE_ID</code>', '畫布根節點 ID', 'Figma URL <code>?node-id=&lt;ID&gt;</code>'],
          ['<code>FIGMA_ACCESS_TOKEN</code>', 'Personal Access Token（匯出真實 SVG/PNG 用）', 'Figma → Settings → Account → Personal access tokens'],
        ]}
      />

      <CodeBlock file=".env" lang="dotenv">{
`<span class="tok-c"># Figma 檔案定位</span>
<span class="tok-a">FIGMA_FILE_KEY</span>=<span class="tok-s">your-file-key</span>
<span class="tok-a">FIGMA_CANVAS_NODE_ID</span>=<span class="tok-s">your-canvas-node-id</span>

<span class="tok-c"># 匯出 SVG / PNG 用</span>
<span class="tok-a">FIGMA_ACCESS_TOKEN</span>=<span class="tok-s">figd_***</span>`
      }</CodeBlock>

      <Callout kind="info" label="設定">
        <code>.env.example</code> 含 <code>FIGMA_FILE_KEY</code> / <code>FIGMA_CANVAS_NODE_ID</code> / <code>FIGMA_ACCESS_TOKEN</code>。Framer 已棄用，相關設定已移除。
      </Callout>

      <Callout kind="danger" label="切勿提交">
        <code>.env</code> 已加入 <code>.gitignore</code>。token 外洩請立即至 Figma → Personal access tokens 撤銷。
      </Callout>
    </>
  );
}

// ============================================================
// 04 — USAGE
// ============================================================
function PageUsage({ go }) {
  return (
    <>
      <div className="eyebrow"><span className="dot" style={{ background: 'var(--dot-4)' }}></span>USAGE · 04</div>
      <h1 className="page-title">使用指南：把任務交給 Claude Code。</h1>
      <p className="page-lede">核心是把任務交給 Claude Code。工程師負責下指令、驗收、做最終決策。AI 會用 MCP 取精確規格、用 REST API 匯出真實素材（不憑空畫）、建到對應 <code>components/&lt;分類&gt;/</code>、加進 <code>dev/Preview.tsx</code>。</p>

      <h2 id="common">常見任務</h2>
      <Table
        head={['我想做', '這樣說']}
        rows={[
          ['<strong>從 Figma 生成元件</strong>', '「幫我做 NewsCard，Figma node <code>1234:5678</code>」'],
          ['<strong>組裝整個頁面</strong>', '「組裝 &lt;頁面&gt; 頁面」'],
          ['<strong>視覺對齊到像素</strong>', '「&lt;頁面&gt; 在 mobile 跟設計稿不一致，修到 ≤1px」'],
          ['<strong>匯出 Figma 素材</strong>', '「把這個 logo 的真實 SVG 抓下來」'],
          ['<strong>同步設計 tokens</strong>', '「Figma 改了品牌色，更新 tokens」'],
          ['<strong>拆 / 合元件粒度</strong>', '「這元件太肥，拆成設計師可自由組合的小單位」'],
          ['<strong>推進視覺比對進度</strong>', '「看 <code>VISUAL_CHECK_PROGRESS.md</code>，挑下一個沒對齊的頁面」'],
          ['<strong>改完確認沒弄壞別頁</strong>', '「我改了 &lt;共用元件&gt;，跑回歸確認沒影響到頁面」'],
        ]}
      />

      <h2 id="dataflow">資料流</h2>
      <CodeBlock file="how it works" lang="ascii">{
`<span class="tok-c">Figma 設計稿</span>
   │ get_design_context (MCP) + REST API 匯素材
   ▼
<span class="tok-a">components/&lt;分類&gt;/*.tsx</span>   <span class="tok-c">元件（props 控制所有視覺面向）</span>
   │ 組裝
   ▼
<span class="tok-a">pages/&lt;頁&gt;/*.tsx</span>          <span class="tok-c">頁面（每頁一子資料夾，README 含 Figma node ID）</span>
   │ 註冊
   ▼
<span class="tok-a">dev/Preview.tsx</span>           <span class="tok-c">本地 preview 路由入口（Vite, port 3003）</span>`
      }</CodeBlock>

      <Callout label="設計 token 單一真相">
        改色 / 改字一律從 <code>config/tokens.ts</code> 改起（與 <code>dev/index.css @theme</code> 同步）。詳細見 <a onClick={() => go('styling')}>樣式規則</a>。
      </Callout>

      <h2 id="boundaries">不做什麼 / 已知限制</h2>
      <ul>
        <li><strong>Framer 已棄用</strong>。元件保留的 <code>import &#123; addPropertyControls, ControlType &#125; from "framer"</code> 是 no-op shim（<code>dev/framer-stub.ts</code>），搬 Next.js 時 codemod 一次性刪除。</li>
        <li><strong>視覺比對是硬規則</strong>：差異 &gt; 1px 就要修，不接受「結構性論證」跳過。</li>
        <li><strong>圖檔素材</strong>必須從 Figma REST API 抓真實檔案，禁止截圖拼湊。</li>
        <li><strong>Figma Starter plan 有 rate limit</strong>，視覺比對 loop 前先 cache 設計稿（<code>scripts/cache-figma-nodes.mjs</code>）。</li>
        <li><strong>回歸不驗</strong>：跨瀏覽器差異、互動 / 動畫狀態（hover / 展開 / 輪播）、CI / 遠端——皆只本機 Chromium。</li>
        <li><strong>元件庫組裝率</strong>：部分頁面 inline 重寫元件，這些元件改了頁面層回歸抓不到，<code>/visual-regression</code> 會明示「僅驗元件層」。</li>
      </ul>
    </>
  );
}

// ============================================================
// 05 — COMMANDS
// ============================================================
function PageCommands({ go }) {
  return (
    <>
      <div className="eyebrow"><span className="dot" style={{ background: 'var(--dot-3)' }}></span>COMMANDS · 05</div>
      <h1 className="page-title">指令參考。</h1>
      <p className="page-lede">兩類：Claude Code 的 skill 指令（前門）+ npm scripts（底層）。</p>

      <h2 id="skills">Skill 指令</h2>
      <Table
        head={['指令', '何時用']}
        rows={[
          ['<code>/refine-component &lt;元件&gt;</code>', '單元件視覺收斂（實作 → 截圖比對 → 調整，收斂到 ≤1px；收斂完自動回歸受影響頁）'],
          ['<code>/figma-compare</code>', '視覺比對 7 步 SOP（開 Figma prototype + localhost side-by-side）'],
          ['<code>/visual-regression &lt;元件&gt;</code>', '改共用元件後，自動驗用到它的頁面有沒有跑版'],
        ]}
      />

      <h2 id="npm">npm scripts</h2>
      <Table
        head={['指令', '用途']}
        rows={[
          ['<code>npm run dev</code>', '啟動 preview → <code>http://localhost:3003</code>'],
          ['<code>npm run build</code>', '建構驗證（產出 <code>dist/</code>）'],
          ['<code>npm run test:visual</code>', '全站視覺回歸（所有頁 × 3 斷點）'],
          ['<code>npm run test:component &lt;元件&gt;</code>', '單元件數值斷言'],
          ['<code>npm run build:depmap</code>', '重建元件→頁面依賴表'],
          ['<code>npm run baseline:update</code>', '認可當前畫面為回歸基準（會覆寫，慎用）'],
        ]}
      />

      <h2 id="produces">會產出什麼</h2>
      <ul>
        <li><code>components/&lt;分類&gt;/*.tsx</code>——元件</li>
        <li><code>pages/&lt;頁&gt;/*.tsx</code>——頁面</li>
        <li><code>tests/visual/baseline/*.png</code> + <code>specs/*.json</code>——回歸基準</li>
        <li><code>dev/Preview.tsx</code> 的 preview 路由</li>
      </ul>

      <h2 id="verify">怎麼確認做對了</h2>
      <ol>
        <li><code>npm run dev</code> 開 <code>http://localhost:3003</code> 看元件 / 頁面有 render、無 console error。</li>
        <li>視覺對齊：差異 ≤1px（元件層數值斷言 + 頁面層截圖比對）。</li>
        <li>回歸：<code>npm run test:visual</code> 全綠 = 沒弄壞既有頁面。</li>
      </ol>
    </>
  );
}

// ============================================================
// 06 — STYLING
// ============================================================
function PageStyling({ go }) {
  return (
    <>
      <div className="eyebrow"><span className="dot" style={{ background: 'var(--dot-7)' }}></span>STYLING · 06</div>
      <h1 className="page-title">樣式規則（Tailwind v4）。</h1>
      <p className="page-lede">設計 token 的<strong>單一真相</strong>在 <code>config/tokens.ts</code>（與 <code>dev/index.css @theme</code> 同步）。改色 / 改字從那裡，不要在文件複製值。</p>

      <h2 id="tokens">語意 token</h2>
      <Table
        head={['Token', '值', '用途']}
        rows={[
          ['<code>font-sans</code>', 'Montserrat + Noto fallback', '全站字體'],
          ['<code>text-ink</code> / <code>bg-ink</code>', '#414040', '主要文字色'],
          ['<code>text-gray</code>', '#9E9E9F', '次級文字'],
          ['<code>border-gray-light</code>', '#D9D9D9', '分隔線 / 淺灰'],
          ['<code>border-silver</code>', '#C8C9CA', '邊框'],
          ['<code>bg-bg-gray</code>', '#F0F0F0', '背景灰'],
          ['<code>text-brand-yellow</code> / <code>bg-brand-yellow</code>', '#FFD900', '主色黃'],
          ['<code>text-brand-green</code> / <code>bg-brand-green</code>', '#B6D56A', '品牌綠'],
          ['<code>text-brand-blue</code> / <code>bg-brand-blue</code>', '#79B4C5', '品牌藍'],
          ['<code>text-link</code>', '#005DE9', '連結藍'],
        ]}
      />

      <div className="swatches" title="brand swatches">
        <div className="swatch" style={{ background: '#FFD900' }} title="#FFD900" />
        <div className="swatch" style={{ background: '#B6D56A' }} title="#B6D56A" />
        <div className="swatch" style={{ background: '#79B4C5' }} title="#79B4C5" />
        <div className="swatch" style={{ background: '#005DE9' }} title="#005DE9" />
        <div className="swatch" style={{ background: '#414040' }} title="#414040" />
        <div className="swatch" style={{ background: '#9E9E9F' }} title="#9E9E9F" />
        <div className="swatch" style={{ background: '#D9D9D9' }} title="#D9D9D9" />
        <div className="swatch" style={{ background: '#F0F0F0' }} title="#F0F0F0" />
      </div>

      <Callout label="提醒">
        此表為快速查閱；新增 / 修改 token 以 <code>config/tokens.ts</code> + <code>dev/index.css @theme</code> 為準。
      </Callout>

      <h2 id="rules">樣式撰寫規則</h2>
      <ul>
        <li><strong>靜態樣式</strong>一律用 Tailwind utility class</li>
        <li><strong>設計規格 px 值</strong>用任意值語法：<code>w-[266px]</code>、<code>leading-7</code>、<code>tracking-[0.5px]</code>、<code>rounded-[10px]</code></li>
        <li><strong>動態值</strong>（透過 props 傳入的顏色、尺寸）→ 用 <code>style=&#123;&#123;...&#125;&#125;</code> inline 覆寫，<strong>不要</strong>用 <code>className=&#123;`text-[$&#123;color&#125;]`&#125;</code>（Tailwind JIT 偵測不到動態字串）</li>
        <li><strong>Hover / 狀態</strong>：簡單的優先用 <code>hover:</code> 前綴；需要 JS state 才能控制的（如同時改多個元素）用 React state + 條件 className</li>
        <li><strong>Spread style prop</strong>：根元素一定要 <code>style=&#123;&#123;...style&#125;&#125;</code> 接受外部覆寫</li>
        <li><strong>className prop</strong>：根元素接受 <code>className</code> prop 讓使用端能加 utility</li>
      </ul>

      <CodeBlock file="components/cards/NewsCard.tsx" lang="tsx">{
`<span class="tok-k">interface</span> <span class="tok-f">NewsCardProps</span> <span class="tok-p">{</span>
  title<span class="tok-p">:</span> <span class="tok-a">string</span><span class="tok-p">;</span>
  accentColor<span class="tok-p">?:</span> <span class="tok-a">string</span><span class="tok-p">;</span>      <span class="tok-c">// 動態 → 走 style</span>
  className<span class="tok-p">?:</span> <span class="tok-a">string</span><span class="tok-p">;</span>
  style<span class="tok-p">?:</span> <span class="tok-f">CSSProperties</span><span class="tok-p">;</span>
<span class="tok-p">}</span>

<span class="tok-k">export function</span> <span class="tok-f">NewsCard</span><span class="tok-p">(</span><span class="tok-p">{</span> title, accentColor = <span class="tok-s">"#FFD900"</span>, className, style <span class="tok-p">}:</span> <span class="tok-f">NewsCardProps</span><span class="tok-p">)</span> <span class="tok-p">{</span>
  <span class="tok-k">return</span> <span class="tok-p">(</span>
    <span class="tok-t">&lt;article</span>
      <span class="tok-a">className</span>=<span class="tok-s">{\`w-[266px] rounded-[10px] bg-white \${className ?? ""}\`}</span>
      <span class="tok-a">style</span>=<span class="tok-p">{{</span> borderTopColor<span class="tok-p">:</span> accentColor, ...style <span class="tok-p">}}</span><span class="tok-t">&gt;</span>
      <span class="tok-t">&lt;h3</span> <span class="tok-a">className</span>=<span class="tok-s">"text-ink text-[16px] leading-6"</span><span class="tok-t">&gt;</span><span class="tok-p">{</span>title<span class="tok-p">}</span><span class="tok-t">&lt;/h3&gt;</span>
    <span class="tok-t">&lt;/article&gt;</span>
  <span class="tok-p">);</span>
<span class="tok-p">}</span>`
      }</CodeBlock>

      <h2 id="responsive">響應式</h2>
      <ul>
        <li>用 Tailwind 響應式前綴：<code>md:</code>、<code>lg:</code>，斷點預設 <code>sm 640 / md 768 / lg 1024 / xl 1280</code></li>
        <li>設計稿基準寬度 1440px → 用 <code>xl:</code> 對應桌機</li>
        <li>視覺收斂的三個斷點：<strong>D=1440px / T=768px / M=375px</strong></li>
      </ul>

      <h2 id="naming">命名</h2>
      <ul>
        <li>元件 prop 命名用語意化英文（<code>accentColor</code> 不是 <code>bgColor</code>）</li>
        <li>元件檔名 PascalCase（<code>NewsCard.tsx</code>、<code>HeroSection.tsx</code>）</li>
      </ul>

      <h2 id="property-controls">PropertyControls</h2>
      <p>元件保留 <code>addPropertyControls(...)</code> 區段（no-op shim），記錄哪些 prop 是設計可調整的；之後搬 Next.js 時統一移除。</p>
    </>
  );
}

// ============================================================
// 07 — ARCHITECTURE
// ============================================================
function PageArchitecture({ go }) {
  return (
    <>
      <div className="eyebrow"><span className="dot" style={{ background: 'var(--dot-1)' }}></span>ARCHITECTURE · 07</div>
      <h1 className="page-title">架構與擴充。</h1>
      <p className="page-lede">給日後接手改這專案的工程師。使用者怎麼用見<a onClick={() => go('usage')}>使用指南</a>；這裡講<strong>架構與怎麼動它</strong>。</p>

      <h2 id="overview">架構概覽</h2>
      <CodeBlock file="data flow" lang="ascii">{
`<span class="tok-c">Figma 設計稿</span>
   │ get_design_context (MCP) + REST API 匯素材
   ▼
<span class="tok-a">components/&lt;分類&gt;/*.tsx</span>   <span class="tok-c">元件（props 控制所有視覺面向）</span>
   │ 組裝
   ▼
<span class="tok-a">pages/&lt;頁&gt;/*.tsx</span>          <span class="tok-c">頁面（每頁一子資料夾，README 含 Figma node ID）</span>
   │ 註冊
   ▼
<span class="tok-a">dev/Preview.tsx</span>           <span class="tok-c">本地 preview 路由入口（Vite, port 3003）</span>`
      }</CodeBlock>

      <ul>
        <li>設計 token 單一真相 = <code>config/tokens.ts</code>（與 <code>dev/index.css @theme</code> 同步）。</li>
        <li>視覺正確性由<strong>兩層回歸</strong>守（見<a onClick={() => go('visual')}>視覺回歸</a>）。</li>
      </ul>

      <h2 id="wiring">wiring 怎麼運作</h2>
      <Table
        head={['元件', '做什麼']}
        rows={[
          ['<code>.claude/skills/refine-component/</code>', '單元件視覺收斂迴圈；每輪呼叫逃生閥 <code>converge-guard.mjs</code>（避免無限燒 token）；收斂完跑回歸'],
          ['<code>.claude/skills/figma-compare/</code>', '視覺比對 7 步 SOP'],
          ['<code>.claude/skills/visual-regression/</code>', '兩層回歸前門：元件層數值斷言 + 頁面層截圖比對'],
          ['<code>scripts/build-dep-map.mjs</code>', '靜態解析 import → 元件→頁面依賴表（回歸只跑受影響頁的依據）'],
          ['<code>scripts/visual-regression/</code>', 'capture（截圖）/ diff（pixelmatch 絕對像素門檻）/ assert-component（數值斷言）/ run（orchestrator）/ converge-guard（逃生閥）'],
          ['<code>.claude/settings.json</code>', '啟用 figma plugin'],
        ]}
      />

      <h2 id="extend">怎麼擴充</h2>
      <h3>加元件</h3>
      <ul>
        <li>建 <code>components/&lt;分類&gt;/&lt;Name&gt;.tsx</code>（檔頭註解 Purpose + For Designer；props 用 <code>?</code> + default）</li>
        <li>在 <code>dev/Preview.tsx</code> 加 <code>&lt;ComponentPreview&gt;</code> block（自動帶 <code>data-component</code> 給回歸用）</li>
      </ul>

      <h3>加頁面</h3>
      <ul>
        <li>建 <code>pages/&lt;slug&gt;/</code> + 在 <code>dev/main.tsx</code> 加 route</li>
        <li><code>npm run build:depmap</code> 更新依賴表</li>
      </ul>

      <h3>元件層量錯（被預覽包裝遮住）</h3>
      <p>在該 preview 區塊目標元件加 <code>data-component-root</code>。</p>

      <h3>認可新基準</h3>
      <p>對齊後 <code>npm run baseline:update</code> / <code>... --update-spec</code>（Figma 改版也要重抓）。</p>

      <h2 id="rationale">設計依據</h2>
      <p>關鍵設計決策與理由：</p>
      <ul>
        <li>回歸頁面層用<strong>絕對像素門檻</strong>（非整頁百分比）——百分比會稀釋 localized 小元件位移（停動畫後雜訊地板實測 0px）。</li>
        <li>收斂迴圈有<strong>逃生閥</strong>（每斷點上限 5 輪 / 無進展即停損寫 <code>tests/visual/known-diffs.md</code>）。</li>
        <li>anti-scope：不驗跨瀏覽器 / 互動動畫 / CI。</li>
      </ul>

      <h2 id="verify-changes">怎麼驗證改動</h2>
      <ul>
        <li>改 script / skill：跑 <code>npm run test:visual</code>（全頁面）+ 抽測 <code>npm run test:component &lt;元件&gt;</code>，確認無改動時全綠（雜訊 0px）。</li>
        <li>故意改壞一個元件 → 回歸該紅 → 還原該綠（break-revert 自驗）。</li>
        <li>動 wiring 前先想：這是把好習慣自動化，還是把當下的壞流程固化？可機驗的改動（script / skill）先自己跑過 break-revert 再交付，別丟給別人驗。</li>
      </ul>
    </>
  );
}

// ============================================================
// 08 — VISUAL REGRESSION
// ============================================================
function PageVisual({ go }) {
  return (
    <>
      <div className="eyebrow"><span className="dot" style={{ background: 'var(--dot-5)' }}></span>VISUAL REGRESSION · 08</div>
      <h1 className="page-title">視覺回歸系統。</h1>
      <p className="page-lede">兩層驗證、可自動化、有逃生閥。</p>

      <h2 id="from">為什麼兩層</h2>
      <p>「視覺比對」若靠人肉眼開瀏覽器截圖比，有三個問題：</p>
      <ol>
        <li>改一個共用元件無法自動回頭驗其他頁</li>
        <li>比對標準不一致</li>
        <li>收斂迴圈無上限會燒 token</li>
      </ol>
      <p>所以升級成<strong>可自動化、可回歸</strong>的兩層驗證。</p>

      <h2 id="what">組成</h2>
      <ol>
        <li><strong>依賴表</strong>：<code>build-dep-map.mjs</code> 算出「元件→用到它的頁面」（含遞移）。</li>
        <li><strong>兩層驗證引擎</strong>（Playwright）：元件層數值斷言 + 頁面層截圖比對。</li>
        <li><strong>逃生閥</strong>：收斂迴圈每斷點上限 N 輪 / 無進展即停損，script 強制（非自律）。</li>
        <li><strong>首批基準</strong>：對所有頁面 + 元件建 baseline / spec。</li>
      </ol>

      <h2 id="now">現在能做什麼</h2>
      <Table
        head={['你說 / 你做', '系統行為']}
        rows={[
          ['改了某共用元件，想確認沒弄壞頁面', '<code>/visual-regression &lt;元件&gt;</code> → 元件層斷言 + 只驗用到它的頁'],
          ['全站回歸', '<code>npm run test:visual</code>（所有頁 × 3 斷點）'],
          ['單元件數值檢查', '<code>npm run test:component &lt;元件&gt;</code>'],
          ['認可新狀態為基準', '<code>... --update-baseline</code> / <code>... --update-spec</code>'],
          ['跑單元件視覺收斂', '<code>/refine-component &lt;元件&gt;</code>（每輪呼叫逃生閥 guard，收斂完自動回歸受影響頁）'],
        ]}
      />

      <h2 id="layers">兩層各管什麼</h2>
      <div className="cards">
        <div className="card" style={{ cursor: 'default' }}>
          <span className="card-tag"><span className="tag-dot" style={{ background: 'var(--dot-4)' }}></span>LAYER 1</span>
          <h4>元件層（嚴格 ≤1px）</h4>
          <p>量元件渲染值（寬高 / 色 / 字 / 圓角 / gap / padding）對 <code>tests/visual/specs/&lt;元件&gt;.json</code>。精準、可指出哪欄變了。</p>
        </div>
        <div className="card" style={{ cursor: 'default' }}>
          <span className="card-tag"><span className="tag-dot" style={{ background: 'var(--dot-5)' }}></span>LAYER 2</span>
          <h4>頁面層（catch-all）</h4>
          <p>截全頁圖對 <code>tests/visual/baseline/</code>，<strong>差異像素 &gt;10 即 fail</strong>（絕對像素，非整頁百分比）。抓位移 / 配色錯。</p>
        </div>
      </div>

      <h2 id="daily">日常怎麼用</h2>
      <ol>
        <li><code>npm run dev</code>（回歸前置，要跑著）</li>
        <li>改元件 → <code>/visual-regression &lt;元件&gt;</code></li>
        <li>紅了 → 看 <code>tests/visual/diff/</code> 的差異圖定位 → 修 → 重跑</li>
        <li>若是「刻意改設計」→ 對齊後 <code>--update-spec</code> / <code>--update-baseline</code> 認可新基準</li>
        <li>Figma 改版 → 重抓基準（同上）</li>
      </ol>

      <h2 id="bounds">邊界（誠實標記，非漏洞）</h2>
      <ul>
        <li><strong>元件層精度</strong>：量測對象自動解析——靠 className 訊號穿透預覽的版面包裝、並優先選沒被縮放的區塊。實測 38 元件皆量到真元件根。結構特異的極少數可在預覽加 <code>data-component-root</code> 覆寫。</li>
        <li><strong>orphan 元件</strong>（沒被任何頁面組裝的）：頁面層保護不到，只靠元件層。<code>dep-map.json</code> 的 <code>orphans</code> 欄列出；<code>/visual-regression</code> 對它們會明示「僅驗元件層」。</li>
        <li><strong>不驗</strong>：跨瀏覽器、互動 / 動畫狀態、CI / 遠端（皆已決定不做首期）。</li>
        <li><strong>baseline 機器相依</strong>：在哪台機器 / 哪版 Chromium 截的就對哪個比；換機器要重建基準。</li>
      </ul>

      <h2 id="map">檔案地圖</h2>
      <CodeBlock file="files" lang="tree">{
`<span class="tok-a">scripts/build-dep-map.mjs</span>                  <span class="tok-c">元件→頁面依賴表</span>
<span class="tok-a">scripts/visual-regression/</span>
  _shared.mjs        <span class="tok-c">共用（斷點 / 停動畫 / 開瀏覽器）</span>
  capture.mjs        <span class="tok-c">截圖</span>
  diff.mjs           <span class="tok-c">頁面層 pixelmatch（絕對像素門檻）</span>
  assert-component.mjs  <span class="tok-c">元件層數值斷言</span>
  converge-guard.mjs    <span class="tok-c">收斂逃生閥</span>
  run.mjs            <span class="tok-c">orchestrator（查依賴表只驗受影響頁）</span>
<span class="tok-a">tests/visual/</span>
  baseline/*.png     <span class="tok-c">頁面基準（git tracked）</span>
  specs/*.json       <span class="tok-c">元件規格（git tracked）</span>
  known-diffs.md     <span class="tok-c">逃生閥停損紀錄</span>
  dep-map.json       <span class="tok-c">依賴表（可重建）</span>
<span class="tok-a">.claude/skills/visual-regression/SKILL.md</span>  <span class="tok-c">前門 /visual-regression</span>`
      }</CodeBlock>
    </>
  );
}

// ============================================================
// 09 — TROUBLESHOOT
// ============================================================
function PageTroubleshoot({ go }) {
  return (
    <>
      <div className="eyebrow"><span className="dot" style={{ background: 'var(--dot-2)' }}></span>TROUBLESHOOT · 09</div>
      <h1 className="page-title">疑難排解。</h1>
      <p className="page-lede">出錯時對照症狀找解法。</p>

      <h2 id="table">症狀 → 怎麼救</h2>
      <Table
        head={['症狀', '怎麼救']}
        rows={[
          ['回歸 / 比對說 <code>dev server 沒回應</code>', '先在另一個終端機 <code>npm run dev</code>'],
          ['Figma 拉不到設計稿 / prototype 開不了', '確認已被邀進 Figma 專案 + <code>.env</code> 的 token 有效'],
          ['視覺比對只跑一次就 rate limit', '跑 <code>scripts/cache-figma-nodes.mjs</code> 先 cache，別在 loop 裡打 API'],
          ['回歸全綠但你覺得有改到', '看是不是 orphan 元件（頁面用 inline 副本）；或 baseline 過期 → <code>npm run baseline:update</code>'],
          ['Chrome 視覺比對沒反應', '確認 Claude in Chrome 擴充已連線'],
        ]}
      />

      <h2 id="who">誰維護 / 怎麼回報</h2>
      <ul>
        <li>維護 / 存取申請：找 repo admin。</li>
        <li>發現問題 / 想加功能：跟維護者說，或在團隊溝通管道回報（這專案 AI 驅動，迭代由維護者跑，你只要把問題講清楚）。</li>
        <li>改 / 擴充這專案的架構說明見<a onClick={() => go('architecture')}>架構</a>。</li>
      </ul>

      <Callout kind="ok" label="提醒">
        這專案 AI 驅動，工程師主要任務是把問題描述清楚——「在哪個頁面、哪個元件、哪個斷點、差異是什麼」越具體越好。
      </Callout>
    </>
  );
}

// ============================================================
// page TOC entries (manual for sidebar TOC rendering)
// ============================================================
const PAGE_TOC = {
  overview:     [['what-it-does', '能做什麼'], ['reading-order', '建議閱讀順序']],
  quickstart:   [['prereq', '自己要裝'], ['first-run', '第一次啟動'], ['next', '下一步']],
  access:       [['must-have', '必須拿到的存取權'], ['env-vars', '.env 參數']],
  usage:        [['common', '常見任務'], ['dataflow', '資料流'], ['boundaries', '不做什麼']],
  commands:     [['skills', 'Skill 指令'], ['npm', 'npm scripts'], ['produces', '會產出什麼'], ['verify', '怎麼確認']],
  styling:      [['tokens', '語意 token'], ['rules', '撰寫規則'], ['responsive', '響應式'], ['naming', '命名'], ['property-controls', 'PropertyControls']],
  architecture: [['overview', '架構概覽'], ['wiring', 'wiring 怎麼運作'], ['extend', '怎麼擴充'], ['rationale', '設計依據'], ['verify-changes', '驗證改動']],
  visual:       [['from', '為什麼兩層'], ['what', '組成'], ['now', '現在能做什麼'], ['layers', '兩層各管什麼'], ['daily', '日常怎麼用'], ['bounds', '邊界'], ['map', '檔案地圖']],
  troubleshoot: [['table', '症狀對照表'], ['who', '誰維護']],
};

const PAGES = {
  overview:     PageOverview,
  quickstart:   PageQuickStart,
  access:       PageAccess,
  usage:        PageUsage,
  commands:     PageCommands,
  styling:      PageStyling,
  architecture: PageArchitecture,
  visual:       PageVisual,
  troubleshoot: PageTroubleshoot,
};

Object.assign(window, { PAGES, PAGE_TOC });
