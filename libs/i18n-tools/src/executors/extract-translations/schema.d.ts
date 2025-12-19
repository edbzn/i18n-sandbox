export interface ExtractTranslationsExecutorSchema {
  sourceRoot: string;
  outputPath: string;
  pattern?: string;
  include?: string[];
  exclude?: string[];
}
