import readline from "readline";
import chalk from "chalk";
import open from "open";

const VIEWPORT_SIZE = process.stdout.rows - 6;

const renderList = (items, selectedIndex, scrollOffset) => {
  console.clear();

  const visibleItems = items.slice(scrollOffset, scrollOffset + VIEWPORT_SIZE);

  if (scrollOffset > 0) {
    console.log(chalk.dim("↑ Flere artikler over"));
  } else {
    console.log();
  }

  visibleItems.forEach((item, index) => {
    const actualIndex = scrollOffset + index;
    if (actualIndex === selectedIndex) {
      console.log(
        chalk.black.bgWhite(`> ${item.title}
  (${item.href}) <`),
      );
    } else {
      console.log(`  ${item.title.replace(/[\r\n]+/gm, " ")}`);
    }
  });

  if (scrollOffset + VIEWPORT_SIZE < items.length) {
    console.log(chalk.dim("↓ Flere artikler under"));
  } else {
    console.log();
  }
};

/**
 * Viser en liste med lenker i terminalen, og lar brukeren åpne de i nettleseren.
 * @param {{
   title: string
   href: string
 }[]} items Lenker som skal vises i terminalen
 */
export const selectFromList = (items) => {
  return new Promise((resolve) => {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);

    let selectedIndex = 0;
    let scrollOffset = 0;

    const updateScroll = () => {
      if (selectedIndex < scrollOffset) {
        scrollOffset = selectedIndex;
      } else if (selectedIndex >= scrollOffset + VIEWPORT_SIZE) {
        scrollOffset = selectedIndex - VIEWPORT_SIZE + 1;
      }
    };

    renderList(items, selectedIndex, scrollOffset);

    process.stdin.on("keypress", (_str, key) => {
      if ((key.ctrl && key.name === "c") || key.name === "q") {
        process.stdin.setRawMode(false);
      }

      switch (key.name) {
        case "up":
          selectedIndex =
            selectedIndex > 0 ? selectedIndex - 1 : items.length - 1;
          updateScroll();
          break;
        case "down":
          selectedIndex =
            selectedIndex < items.length - 1 ? selectedIndex + 1 : 0;
          updateScroll();
          break;
        case "return":
          process.stdin.setRawMode(false);
          process.stdin.removeAllListeners("keypress");
          resolve(items[selectedIndex]);
          return;
      }

      renderList(items, selectedIndex, scrollOffset);
    });
  });
};


