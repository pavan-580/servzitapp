const areas = [
  ['Marketplace', 'Providers, listings, categories, locations'],
  ['Operations', 'Bookings, enquiries, site visits'],
  ['Trust & safety', 'Provider reviews, reports, audit history'],
  ['Finance', 'Payments and settlements'],
];

export default function HomePage() {
  return (
    <main className="shell">
      <aside className="rail"><div className="brandMark">S</div><span>OPERATIONS</span><nav aria-label="Main navigation"><a className="active" href="#overview">Overview</a>{areas.map(([name]) => <a key={name} href={`#${name.toLowerCase().replaceAll(' ', '-')}`}>{name}</a>)}</nav><div className="railFoot">SERVZ'IT<br/><small>OWNER CONSOLE</small></div></aside>
      <section className="content" id="overview">
        <header><div><p className="eyebrow">MARKETPLACE CONTROL CENTER</p><h1>Good morning.</h1><p className="muted">Your operations overview will appear here as live marketplace data becomes available.</p></div><div className="adminChip"><span className="statusDot"/>System foundation</div></header>
        <div className="notice"><span>i</span><p><strong>Setup in progress</strong><br/>Metrics and management actions are not connected yet. No sample counts or provider records are shown as real data.</p></div>
        <div className="sectionHeading"><div><p className="eyebrow">WORKSPACE</p><h2>Operations areas</h2></div></div>
        <div className="grid">{areas.map(([name, desc], i) => <article className="areaCard" key={name} id={name.toLowerCase().replaceAll(' ', '-')}><div className="cardTop"><span className="iconBox">{['⌂', '↗', '✓', '₹'][i]}</span><span className="arrow">↗</span></div><h3>{name}</h3><p>{desc}</p><span className="coming">Foundation planned</span></article>)}</div>
        <footer>Discover. Connect. Book. Grow. <span>© SERVZ'IT</span></footer>
      </section>
    </main>
  );
}
