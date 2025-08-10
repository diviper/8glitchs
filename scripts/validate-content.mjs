import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const glitchesDir = path.join(process.cwd(), 'content/glitches');

const REQUIRED_FRONT_MATTER = ['id', 'title', 'category', 'tags', 'status'];
const ALLOWED_CATEGORIES = ['Квант', 'Время', 'Космос', 'Информация', 'Логика', 'Идентичность'];
const REQUIRED_SECTIONS = [
  'TL;DR',
  'Научная опора',
  'Парадокс',
  'Дневник Дивайпера',
  'Юнг',
  'Сенека',
  'Рик',
  'Сцена/механика',
  'Ссылки',
];

async function validateContent() {
  let errorCount = 0;
  console.log('--- Running Content Validator ---');

  try {
    const files = await fs.readdir(glitchesDir);
    const mdFiles = files.filter(file => file.endsWith('.md'));

    for (const file of mdFiles) {
      const filePath = path.join(glitchesDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const { data, content: markdownContent } = matter(content);

      let fileHasError = false;
      const logError = (message) => {
        if (!fileHasError) {
          console.log(`\n[!] Validation errors in ${file}:`);
          fileHasError = true;
        }
        console.log(`  - ${message}`);
        errorCount++;
      };

      // 1. Validate Front Matter fields
      for (const field of REQUIRED_FRONT_MATTER) {
        if (data[field] === undefined || data[field] === null) {
          logError(`Missing required front matter field: '${field}'`);
        }
      }

      // 2. Validate Category value
      if (data.category && !ALLOWED_CATEGORIES.includes(data.category)) {
        logError(`Invalid category: '${data.category}'. Must be one of: ${ALLOWED_CATEGORIES.join(', ')}`);
      }

      // 3. Validate ID format
      if (data.id && !data.id.startsWith('glitch-')) {
          logError(`Invalid id format: '${data.id}'. Must start with 'glitch-'.`);
      }

      // 4. Validate Sections
      const sectionHeaders = (markdownContent.match(/### (.*)/g) || []).map(h => h.substring(4).trim());
      for (const section of REQUIRED_SECTIONS) {
        if (!sectionHeaders.includes(section)) {
          logError(`Missing required section: '### ${section}'`);
        }
      }
    }

  } catch (error) {
    console.error('\nAn error occurred during validation:', error);
    process.exit(1);
  }

  if (errorCount > 0) {
    console.log(`\n--- Validation Complete: Found ${errorCount} error(s). ---`);
    process.exit(1); // Exit with error code if issues are found
  } else {
    console.log('\n--- Validation Complete: All content files are valid! ---');
  }
}

validateContent();
