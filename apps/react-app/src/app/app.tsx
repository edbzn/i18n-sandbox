import { useNavigate, useLocation } from 'react-router-dom';

export function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentLocale = location.pathname.startsWith('/fr') ? 'fr' : 'en';

  const switchLocale = (locale: string) => {
    navigate(`/${locale}`);
    window.location.reload(); // Reload to reinitialize translations
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => switchLocale('en')}
          style={{
            marginRight: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: currentLocale === 'en' ? '#1976d2' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          English
        </button>
        <button
          onClick={() => switchLocale('fr')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: currentLocale === 'fr' ? '#1976d2' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Français
        </button>
      </div>

      <h1 style={{ color: '#1976d2' }}>
        {$localize`:@@welcome.title:Welcome to React`}
      </h1>
      <p>
        {$localize`:@@welcome.description:This is an example of internationalization using @angular/localize in React`}
      </p>
      <button
        style={{
          backgroundColor: '#1976d2',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        {$localize`:@@actions.getStarted:Get Started`}
      </button>
      <p>{$localize`:@@currentLanguage:Current Language: English`}</p>
      <hr style={{ margin: '2rem 0' }} />
    </div>
  );
}

export default App;
