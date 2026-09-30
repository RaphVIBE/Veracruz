// VeraCruz — work grid
function WorkCard({ p, onOpen }) {
  return (
    <div className="work-card" onClick={() => onOpen(p)}>
      <div className={'frame' + (p.dark ? ' dark' : '')}>
        <img src={p.dark ? A + 'veracruz-symbol-white.png' : p.img}
             alt={p.title} style={{ objectPosition: p.pos }} />
      </div>
      <div className="meta-row">
        <span className="label">{String(p.id).padStart(3, '0')}</span>
        <span className="meta">{p.year}</span>
      </div>
      <h3>{p.title}</h3>
      <span className="meta" style={{ color: 'var(--fg3)' }}>{p.type}</span>
    </div>
  );
}

function Work({ onOpen }) {
  return (
    <section className="section" id="work">
      <div className="wrap">
        <div className="sec-head">
          <div className="idx"><span className="num">01</span><h2>Selected work</h2></div>
          <span className="meta">{PROJECTS.length} projects</span>
        </div>
        <div className="work-grid">
          {PROJECTS.map(p => <WorkCard key={p.id} p={p} onOpen={onOpen} />)}
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { Work, WorkCard });
