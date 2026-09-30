// VeraCruz — sticky header
function Header({ active, onNav, onContact }) {
  const items = [
    { id: 'work', label: 'Work' },
    { id: 'studio', label: 'Studio' },
    { id: 'contact', label: 'Contact' },
  ];
  return (
    <header className="vc-header">
      <div className="wrap bar">
        <div className="vc-brand" onClick={() => onNav('top')}>
          <img className="sym" src={A + 'veracruz-symbol.png'} alt="VeraCruz symbol" />
          <img className="word" src={A + 'veracruz-logotype.png'} alt="VeraCruz" />
        </div>
        <nav className="vc-nav">
          {items.map(it => (
            <a key={it.id}
               className={active === it.id ? 'active' : ''}
               onClick={() => onNav(it.id)}>{it.label}</a>
          ))}
          <button className="vc-cta" onClick={onContact}>Start a project</button>
        </nav>
      </div>
    </header>
  );
}
Object.assign(window, { Header });
