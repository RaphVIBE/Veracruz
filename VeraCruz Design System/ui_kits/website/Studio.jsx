// VeraCruz — studio / about
function Studio() {
  const stats = [
    { n: '14', l: 'Projects drawn' },
    { n: 'MMXX', l: 'Established' },
    { n: '3', l: 'Disciplines' },
    { n: '∞', l: 'Lines on paper' },
  ];
  return (
    <section className="section" id="studio">
      <div className="wrap">
        <div className="sec-head">
          <div className="idx"><span className="num">02</span><h2>The studio</h2></div>
          <span className="meta">Architecture · Product · Brand</span>
        </div>
        <div className="studio">
          <p className="big">
            VeraCruz is a small studio working between <em>architecture</em>, product, and
            brand. We believe the future is something you can <em>see</em> before you can
            stand inside it — so we draw it, by hand, until it's inevitable.
          </p>
          <div>
            <div className="stats">
              {stats.map((s, i) => (
                <div className="stat" key={i}>
                  <div className="n">{s.n}</div>
                  <div className="l small">{s.l}</div>
                </div>
              ))}
            </div>
            <div className="disc">
              <p className="small" style={{ margin: 0 }}>
                Studio copy and figures shown here are placeholder, written in the house voice —
                replace with real bios, history, and credits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { Studio });
