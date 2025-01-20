import { selectFromList } from "./listArticles.mjs";
import { chromium } from "@playwright/test";

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

const main = async () => {
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext();
  //const NRK = await context.newPage();

  await browser.close();
  selectFromList(TEST_LINKS);
};

main();
