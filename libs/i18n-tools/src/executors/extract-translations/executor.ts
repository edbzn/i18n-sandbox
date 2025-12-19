import { PromiseExecutor } from '@nx/devkit';
import { glob } from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import { ExtractTranslationsExecutorSchema } from './schema';

const runExecutor: PromiseExecutor<ExtractTranslationsExecutorSchema> = async (
  options,
  context
) => {
  const {
    sourceRoot,
    outputPath,
    pattern = "t\\(['\"`]([^'\"`]+)['\"`]\\)",
    include = ['**/*.tsx', '**/*.ts', '**/*.jsx', '**/*.js'],
    exclude = ['**/node_modules/**', '**/*.spec.*', '**/*.test.*'],
  } = options;

  console.log(`🔍 Extracting translations from: ${sourceRoot}`);

  try {
    // Find all matching files
    const files = await glob(include, {
      cwd: sourceRoot,
      ignore: exclude,
      absolute: true,
    });

    console.log(`📁 Found ${files.length} files to scan`);

    // Extract translation keys and default text
    const translationMap = new Map<string, string>();
    const regex = new RegExp(pattern, 'g');

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');

      // Updated pattern to capture both ID and default text
      // Pattern: $localize`:@@id:default text`
      const localizePattern = /\$localize`:@@([^:]+):([^`]*)`/g;
      let match;

      while ((match = localizePattern.exec(content)) !== null) {
        const id = match[1];
        const defaultText = match[2] || id;
        if (!translationMap.has(id)) {
          translationMap.set(id, defaultText);
        }
      }
    }

    console.log(`🔑 Found ${translationMap.size} unique translation keys`);

    // Create translations object
    const enTranslations: Record<string, string> = {};
    const frTranslations: Record<string, string> = {};

    // Add all keys with their default text for English, and keys for French
    for (const [key, defaultText] of Array.from(translationMap.entries()).sort()) {
      enTranslations[key] = defaultText;
      frTranslations[key] = defaultText; // French will need manual translation
    }

    const translations = {
      en: {
        locale: 'en',
        translations: enTranslations,
      },
      fr: {
        locale: 'fr',
        translations: frTranslations,
      },
    };

    // Ensure output directory exists
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    // Write English translations
    const enPath = path.join(outputPath, 'en.json');
    fs.writeFileSync(
      enPath,
      JSON.stringify(translations.en, null, 2),
      'utf-8'
    );

    // Write French translations
    const frPath = path.join(outputPath, 'fr.json');
    fs.writeFileSync(
      frPath,
      JSON.stringify(translations.fr, null, 2),
      'utf-8'
    );

    console.log(`✅ Translations extracted successfully!`);
    console.log(`   - ${enPath}`);
    console.log(`   - ${frPath}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('❌ Error extracting translations:', error);
    return {
      success: false,
    };
  }
};

export default runExecutor;
