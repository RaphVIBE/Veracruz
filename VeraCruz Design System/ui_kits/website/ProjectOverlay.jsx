// VeraCruz — project detail overlay
function ProjectOverlay({ p, onClose }) {
  if (!p) return null;
  const facts = Object.entries(p.facts);
  return (
    <div className="overlay">
      <div className="ov-bar">
        <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <button className="ov-close" onClick={onClose}>← Back to work</button>
          <span className="meta">{String(p.id).padStart(3, '0')} · {p.type}</span>
        </div>
      </div>
      <div className="wrap ov-hero">
        <Eyebrow>{p.type} · {p.year}</Eyebrow>
        <h1>{p.title}</h1>
        <p className="lead" style={{ maxWidth: '620px', marginTop: '22px' }}>{p.blurb}</p>
      </div>
      <div className="wrap">
        <div className={'ov-figure' + (p.dark ? '' : '')}
             style={p.dark ? { background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' } : null}>
          {p.dark
            ? <img src={A + 'veracruz-symbol-white.png'} alt={p.title} style={{ width: 'auto', height: '52%', filter: 'none' }} />
            : <img src={p.img} alt={p.title} style={{ objectPosition: p.pos }} />}
        </div>
      </div>
      <div className="wrap ov-body">
        <div className="ov-facts">
          <Eyebrow>Details</Eyebrow>
          <div style={{ marginTop: '14px' }}>
            {facts.map(([k, v]) => (
              <div className="row" key={k}><span className="k">{k}</span><span className="v">{v}</span></div>
            ))}
          </div>
        </div>
        <div className="ov-text">
          {p.body.map((t, i) => <p key={i}>{t}</p>)}
          <p className="small" style={{ color: 'var(--fg3)' }}>
            Imagery is the studio's hand-drawn concept sketch, shown as a placeholder across projects —
            swap in each project's own drawings.
          </p>
        </div>
      </div>
    </div>
  );
}
Object.assign(window, { ProjectOverlay });
