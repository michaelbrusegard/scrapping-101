import { selectFromList } from "./listArticles.js";
import { chromium } from "@playwright/test";
import readline from 'readline';

const TEST_LINKS = [
  {
    title: "NRK",
    href: "https://nrk.no",
  },
  {
    title: "VG",
    href: "https://vg.no",
  },
  {
    title: "Dagbladet",
    href: "https://dagbladet.no",
  },
  {
    title: "Aftenposten",
    href: "https://aftenposten.no",
  },
];

function getKeywordInput() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Enter keyword to search for: ', (keyword) => {
      rl.close();
      resolve(keyword);
    });
  });
};

const getArticleLinks = async (page, link) => {
  if (link.title === 'NRK') {
    return await page.evaluate(() => {
      const articleElements = document.querySelectorAll('.kur-room a');
      return Array.from(articleElements).map(link => ({
        href: link.href,
        title: link.querySelector('.kur-room__title span')?.textContent?.trim() || ''
      }));
    });
  } else if (link.title === 'Dagbladet') {
    return await page.evaluate(() => {
      const articleElements = document.querySelectorAll('article.preview a[itemprop="url"]');
      return Array.from(articleElements).map(link => ({
        href: link.href,
        title: link.querySelector('.headline')?.textContent?.trim() || ''
      }));
    });
  } else if (link.title === 'VG') {
    return await page.evaluate(() => {
      const articleElements = document.querySelectorAll('article a');
      return Array.from(articleElements).map(link => ({
        href: link.href,
        title: link.querySelector('.headline')?.textContent?.trim() || ''
      }));
    });
  } else if (link.title === 'Aftenposten') {
    return await page.evaluate(() => {
      const articleElements = document.querySelectorAll('article');

      return Array.from(articleElements)
        .map(article => {
          const linkElement = article.querySelector('a');
          const titleElement = article.querySelector('.title');
          if (!linkElement || !titleElement) {
            return null; // Return null for invalid entries
          }

          return {
            href: linkElement?.href || '',
            title: titleElement?.textContent?.trim() || ''
          };
        })
        .filter(item => item !== null);
    });
  }
  return [];
};

const getArticleContent = async (page, link) => {
  return await page.evaluate(() => {
    const articleContent = document.querySelector('article');
    return articleContent ? articleContent.innerText : '';
  });
};

// Replace the existing main function with this updated version
const main = async () => {
  console.log('Select provider');
  const link = await selectFromList(TEST_LINKS);
  const keyword = await getKeywordInput();
  if (!keyword) {
    console.error('No keyword provided');
    process.exit(1);
  }
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(link.href);

  const articleLinks = await getArticleLinks(page, link);
  const articlesWithKeyword = [];

  for (const article of articleLinks) {
    try {
      const page = await context.newPage();
      await page.goto(article.href);

      const articleText = await getArticleContent(page, link);
      if (articleText.toLowerCase().includes(keyword.toLowerCase())) {
        articlesWithKeyword.push(article);
      }

      await page.close();
    } catch (error) {
      console.error(`Error processing ${article.href}: ${error.message}`);
    }
  }

  console.log(`Found articles containing ${keyword}:`);
  articlesWithKeyword.forEach(article => {
    console.log(`Title: ${article.title}`);
    console.log(`URL: ${article.href}`);
    console.log('---');
  });

  console.log('Total articles found:', articleLinks.length);
  console.log(`Number of articles with ${keyword}:`, articlesWithKeyword.length);
  console.log(`Percentage of articles containing ${keyword}:`, (articlesWithKeyword.length / articleLinks.length) * 100);

  await browser.close();
  process.exit(0);
};

main();
