// VeraCruz — contact (inverted) + footer
function Contact({ refEl }) {
  const [sent, setSent] = useState(false);
  const submit = (e) => { e.preventDefault(); setSent(true); };
  return (
    <section className="section contact" id="contact" ref={refEl} style={{ borderBottom: 'none' }}>
      <div className="wrap">
        <Eyebrow dark>03 — Start a project</Eyebrow>
        <h2 style={{ marginTop: '14px' }}>Tell us what<br />you're imagining.</h2>
        <div className="contact-grid">
          <form onSubmit={submit}>
            <div className="field"><label>Name</label><input placeholder="Your name" required /></div>
            <div className="field"><label>Email</label><input type="email" placeholder="you@studio.com" required /></div>
            <div className="field"><label>The idea</label><textarea rows="3" placeholder="A line is enough to start." /></div>
            <Button variant="cherry">Send</Button>
            <div className="sent">{sent ? '● Received — we\u2019ll be in touch.' : ''}</div>
          </form>
          <div className="contact-side">
            <div className="row"><span className="k">Email</span><span className="v">hello@veracruz.studio</span></div>
            <div className="row"><span className="k">Studio</span><span className="v">Brussels · BE</span></div>
            <div className="row"><span className="k">Social</span><span className="v">@veracruz.studio</span></div>
            <div className="row"><span className="k">Hours</span><span className="v">Mon–Fri</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({ onNav }) {
  return (
    <footer className="vc-footer">
      <div className="wrap">
        <div className="foot-top">
          <div className="foot-brand">
            <img src={A + 'veracruz-logotype-white.png'} alt="VeraCruz" />
            <p className="small" style={{ color: 'var(--fg2-on-dark)', maxWidth: '260px', marginTop: '16px' }}>
              We draw the future before it's built.
            </p>
          </div>
          <div className="foot-cols">
            <div className="foot-col">
              <span className="h">Navigate</span>
              <a onClick={() => onNav('work')}>Work</a>
              <a onClick={() => onNav('studio')}>Studio</a>
              <a onClick={() => onNav('contact')}>Contact</a>
            </div>
            <div className="foot-col">
              <span className="h">Elsewhere</span>
              <a>Instagram</a>
              <a>Are.na</a>
              <a>LinkedIn</a>
            </div>
          </div>
        </div>
        <div className="foot-bot">
          <span className="meta">© MMXXVI VERACRUZ STUDIO</span>
          <span className="meta">EST. MMXX · BRUSSELS</span>
        </div>
      </div>
    </footer>
  );
}
Object.assign(window, { Contact, Footer });
