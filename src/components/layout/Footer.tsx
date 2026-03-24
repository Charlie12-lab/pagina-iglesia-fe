export default function Footer() {
  const year = new Date().getFullYear();

  const cols = [
    {
      title: 'Producto',
      links: ['Directorio', 'Eventos', 'Blog', 'Mapa'],
    },
    {
      title: 'Para Iglesias',
      links: ['Registrar iglesia', 'Panel admin', 'Planes y precios'],
    },
    {
      title: 'Compañía',
      links: ['Acerca de', 'Blog', 'Contacto', 'Privacidad', 'Términos'],
    },
  ];

  return (
    <footer style={{ background: 'var(--gray-900)', color: 'rgba(255,255,255,0.45)', padding: '44px 44px 20px' }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '36px', paddingBottom: '28px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Brand */}
        <div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: '17px', fontWeight: 600, color: 'white', marginBottom: '9px' }}>
            Iglesia de <span style={{ color: 'var(--bondi-light)' }}>Cristo</span>
          </div>
          <p style={{ fontSize: '12.5px', lineHeight: 1.8, maxWidth: '220px' }}>
            El directorio más completo de iglesias en Ecuador y Latinoamérica. Conectando comunidades de fe.
          </p>
        </div>

        {/* Columns */}
        {cols.map(col => (
          <div key={col.title}>
            <h4 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '10.5px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
              {col.title}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {col.links.map(link => (
                <li key={link}>
                  <a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '12.5px' }}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: '1120px', margin: '16px auto 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
        <span>© {year} Iglesia de Cristo · Todos los derechos reservados.</span>
        <span>Hecho con fe en Ecuador 🙏</span>
      </div>
    </footer>
  );
}
