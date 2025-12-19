# i18n Sandbox

This workspace demonstrates internationalization (i18n) setup for Angular, React, and Node.js applications using `@angular/localize` in an Nx monorepo.

## Architecture

### Angular App (`apps/ng-app`)
- Uses `@angular/localize` for internationalization
- Supports both English (`en-US`) and French (`fr`) locales
- Translations extracted using Angular's official `extract-i18n` tool
- Translation files in XLIFF format: `apps/ng-app/src/i18n/messages.xlf` and `messages.fr.xlf`
- Production build generates separate bundles for each locale

### React App (`apps/react-app`)
- Uses `@angular/localize` for runtime translation loading
- Uses `$localize` tagged template literals for translations in JSX
- Translation extraction automated using custom Nx executor
- Translation files: `apps/react-app/src/i18n/en.json` and `fr.json`

### Node App (`apps/node-app`)
- Uses `@angular/localize` for backend translations
- Uses `$localize` tagged template literals in TypeScript code
- Translation extraction automated using custom Nx executor  
- Translation files: `apps/node-app/src/i18n/en.json` and `fr.json`

### i18n Tools Plugin (`libs/i18n-tools`)
- Custom Nx plugin with an executor for extracting translations
- Scans source files for `$localize` tagged templates
- Generates translation JSON files in the Angular localize format
- Configured for both React and Node apps

## Usage

### Running the Apps

**Angular App (English):**
```bash
npx nx serve ng-app
```

**Angular App (French):**
```bash
npx nx serve ng-app --configuration=fr
```

**React App:**
```bash
npx nx serve react-app
# Access at: http://localhost:4200/
```

**Node API:**
```bash
npx nx serve node-app
# Access at: http://localhost:3000/api
```

### Building Angular for Production

Build all locales:
```bash
npx nx build ng-app --configuration=production
```

Output will be in:
- `dist/apps/ng-app/browser/en-US/` - English version
- `dist/apps/ng-app/browser/fr/` - French version

### Extracting Translations

**Angular:**
```bash
npx nx extract-i18n ng-app
```
- Generates `apps/ng-app/src/i18n/messages.xlf`
- Manually create `messages.fr.xlf` with French translations

**React:**
```bash
npx nx extract-i18n react-app
```
- Scans for `$localize` patterns
- Generates `apps/react-app/src/i18n/en.json` and `fr.json`

**Node:**
```bash
npx nx extract-i18n node-app
```
- Scans for `$localize` patterns
- Generates `apps/node-app/src/i18n/en.json` and `fr.json`

### Switching Languages

**Angular:**
1. For development: Edit `apps/ng-app/project.json` serve configurations
2. For production: Use the production build which generates separate bundles

**React:**
Edit `apps/react-app/src/i18n-init.ts`:
```typescript
const currentLocale = EN; // Change to FR for French
```

**Node:**
Edit `apps/node-app/src/i18n-init.ts`:
```typescript
const currentLocale = EN; // Change to FR for French
```

## Translation File Formats

### Angular (XLIFF)
```xml
<trans-unit id="welcomeTitle" datatype="html">
  <source>Welcome to Angular</source>
  <target>Bienvenue sur Angular</target>
</trans-unit>
```

### React & Node (JSON)
```json
{
  "locale": "en",
  "translations": {
    "key.name": "Translation value"
  }
}
```

## Using Translations in Code

### Angular

**In Templates:**
```html
<h1 i18n="@@welcomeTitle">Welcome to Angular</h1>
```

**In TypeScript:**
```typescript
const message = $localize`:@@welcomeTitle:Welcome to Angular`;
```

### React

**In JSX:**
```tsx
<h1>{$localize`:@@welcome.title:Welcome to React`}</h1>
```

### Node

**In TypeScript:**
```typescript
const message = $localize`:@@api.welcome:Hello API`;
```

## Customizing the Extraction Pattern

The React and Node translation extraction can be customized by modifying the executor options in their respective `project.json` files:

```json
{
  "targets": {
    "extract-i18n": {
      "executor": "@i18n-sandbox/i18n-tools:extract-translations",
      "options": {
        "sourceRoot": "apps/react-app/src",
        "outputPath": "apps/react-app/src/i18n",
        "pattern": "\\$localize`:@@([^:]+):[^`]*`",
        "include": ["**/*.tsx", "**/*.ts"],
        "exclude": ["**/node_modules/**", "**/*.spec.*"]
      }
    }
  }
}
```

## Development

### Building the i18n-tools Plugin

After making changes to the plugin:

```bash
npx nx build i18n-tools
```

### Adding New Translation Keys

**Angular:**
1. Add the key to the template with `i18n` attribute or use `$localize` in TypeScript
2. Run extraction: `npx nx extract-i18n ng-app`
3. Update `messages.fr.xlf` with French translations

**React/Node:**
1. Add translation calls using `$localize`:
   ```typescript
   $localize`:@@myKey:Default text`
   ```
2. Run the extraction command:
   ```bash
   npx nx extract-i18n react-app  # or node-app
   ```
3. Update the generated translation JSON files with actual translations

## Technical Details

- All apps use `@angular/localize` for consistency
- Translation files are loaded at runtime for React and Node
- Angular uses compile-time localization for production builds
- The custom Nx executor uses regex patterns to extract translation keys
- TypeScript configurations include `resolveJsonModule: true` for JSON imports
