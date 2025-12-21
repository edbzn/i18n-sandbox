import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentLocale = location.pathname.startsWith('/fr') ? 'fr' : 'en';
  const [itemCount, setItemCount] = useState(0);
  const [minutes, setMinutes] = useState(0);

  // Check if we're in production
  const isProduction = import.meta.env.PROD && import.meta.env.BASE_URL !== '/';

  // Evaluate ICU expressions on each render to pick up new translations
  const itemsCountMessage = $localize`:@@itemsCount:{${itemCount}:VAR_PLURAL:, plural, =0 {No items} =1 {One item} other {${itemCount}:INTERPOLATION: items}}`;
  const minutesAgoMessage = $localize`:@@minutesAgo:{${minutes}:VAR_PLURAL:, plural, =0 {just now} =1 {one minute ago} other {${minutes}:INTERPOLATION: minutes ago}}`;

  const switchLocale = (locale: string) => {
    if (isProduction) {
      // Production: Navigate to the root of the other locale's build
      window.location.href = `/${locale}/`;
    } else {
      // Development: Use React Router and reload to pick up new translations
      navigate(`/${locale}`);
      window.location.reload();
    }
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

      <h2>ICU Expression Examples</h2>

      <div style={{ margin: '1.5rem 0', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h3 style={{ marginTop: 0, color: '#1976d2' }}>Pluralization</h3>
        <p>Item count: {itemCount}</p>
        <p>{itemsCountMessage}</p>
        <button
          onClick={() => setItemCount(itemCount + 1)}
          style={{
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Add Item
        </button>
      </div>

      <div style={{ margin: '1.5rem 0', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h3 style={{ marginTop: 0, color: '#1976d2' }}>Time Ago</h3>
        <p>Minutes: {minutes}</p>
        <p>{minutesAgoMessage}</p>
        <button
          onClick={() => setMinutes(minutes + 1)}
          style={{
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Add Minute
        </button>
      </div>

      <hr style={{ margin: '2rem 0' }} />
    </div>
  );
}

export default App;
