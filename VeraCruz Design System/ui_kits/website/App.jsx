// VeraCruz — app composition
function App() {
  const [open, setOpen] = useState(null);   // current project or null
  const [active, setActive] = useState('work');

  const scrollTo = (id) => {
    if (id === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); setActive('work'); return; }
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActive(id);
    }
  };

  const openProject = (p) => { setOpen(p); window.scrollTo({ top: 0 }); };
  const closeProject = () => setOpen(null);

  return (
    <div className="vc-root">
      <Header active={active} onNav={scrollTo} onContact={() => scrollTo('contact')} />
      <Hero onWork={() => scrollTo('work')} onContact={() => scrollTo('contact')} />
      <Work onOpen={openProject} />
      <Studio />
      <Contact />
      <Footer onNav={scrollTo} />
      {open && <ProjectOverlay p={open} onClose={closeProject} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
