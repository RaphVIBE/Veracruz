// VeraCruz — hero
function Hero({ onWork, onContact }) {
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div>
          <Eyebrow>Studio · Est. MMXX</Eyebrow>
          <h1 style={{ marginTop: '22px' }}>We draw the future<br />before it's built<span className="accent">.</span></h1>
          <p className="lead">A studio for architecture, product, and the spaces between — working in ink, light, and intent.</p>
          <div className="hero-actions">
            <Button variant="ink" onClick={onWork}>See the work</Button>
            <Button variant="ghost" onClick={onContact}>Start a project</Button>
          </div>
        </div>
        <div className="hero-img">
          <img src={A + 'city-sketch.png'} alt="Futuristic city concept sketch" />
          <span className="tag"><Eyebrow>Vertical City · 2025</Eyebrow></span>
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { Hero });
