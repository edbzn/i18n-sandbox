import { exec } from 'child_process';
import { promisify } from 'util';
import { type ExecutorContext } from '@nx/devkit';
import * as fs from 'fs';
import * as path from 'path';

interface LocalizeCompileExecutorOptions {
  outputPath: string;
  browserTarget: string;
  locales: string[];
}

export interface LocalizeCompileExecutorResult {
  success: boolean;
  error?: string;
}

export default async function runExecutor(
  options: LocalizeCompileExecutorOptions,
  context: ExecutorContext,
): Promise<LocalizeCompileExecutorResult> {
  try {
    if (!context.projectName) {
      return {
        success: false,
        error: 'No projectName provided',
      };
    }

    const project = context.projectsConfigurations.projects[context.projectName];
    const appRoot = project.root;
    const translationsDir = path.join(context.root, appRoot, 'src', 'i18n');

    console.log(`🌐 Localizing ${context.projectName}...`);
    console.log(`📂 App root: ${appRoot}`);
    console.log(`📁 Translations directory: ${translationsDir}`);

    // Build the application first
    console.log('🔨 Building application...');
    const buildCmd = `npx nx run ${context.projectName}:build`;
    await promisify(exec)(buildCmd, { cwd: context.root });

    const buildOutputDir = path.join(context.root, options.outputPath);
    console.log(`📦 Build output: ${buildOutputDir}`);

    // For each locale, run localize-translate
    for (const locale of options.locales) {
      console.log(`\n🌍 Processing locale: ${locale}`);

      const translationFile = path.join(translationsDir, `${locale}.json`);
      if (!fs.existsSync(translationFile)) {
        console.warn(`⚠️  Translation file not found: ${translationFile}`);
        continue;
      }

      const localeOutputDir = path.join(buildOutputDir, locale);

      // Run localize-translate to process $localize calls with ICU expressions
      const translateCmd = `npx localize-translate -s "**/*.js" -t ${translationFile} -o ${localeOutputDir} -r ${buildOutputDir}`;
      console.log(`📋 Command: ${translateCmd}`);

      try {
        const result = await promisify(exec)(translateCmd, { cwd: context.root });
        if (result.stdout) console.log('   ', result.stdout.trim());
        if (result.stderr) console.warn('   ', result.stderr.trim());

        // Copy index.html to locale folder
        const indexHtml = path.join(buildOutputDir, 'index.html');
        if (fs.existsSync(indexHtml)) {
          fs.copyFileSync(indexHtml, path.join(localeOutputDir, 'index.html'));
          console.log(`   📄 Copied index.html to ${locale}/`);
        }

        // Copy favicon and other root assets
        const favicon = path.join(buildOutputDir, 'favicon.ico');
        if (fs.existsSync(favicon)) {
          fs.copyFileSync(favicon, path.join(localeOutputDir, 'favicon.ico'));
        }

        console.log(`   ✅ Locale ${locale} processed`);
      } catch (error) {
        console.error(`   ❌ Error processing locale ${locale}:`, error);
      }
    }

    console.log('\n✅ Localization completed successfully');
    return { success: true };

  } catch (error) {
    console.error('❌ Localization failed:', error);
    return {
      success: false,
      error: `Localization failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
