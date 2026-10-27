// check-4-letter-discord-usernames.js
const { chromium } = require('playwright');

const alphabet = 'abcdefghijklmnopqrstuvwxyz';
const results = [];

function generateNames() {
  const names = [];
  for (const a of alphabet) {
    for (const b of alphabet) {
      for (const c of alphabet) {
        for (const d of alphabet) {
          names.push(`${a}${b}${c}${d}`);
        }
      }
    }
  }
  return names;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

(async () => {
  const names = generateNames();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://discord.com/register');

  // Discord may show email + password fields even before username is visible.
  // Keep a temporary email so the page is in a valid signup state.
  await page.fill('input[name="email"]', 'temp.user@example.com');
  await page.fill('input[name="password"]', 'StrongPass123!');

  const usernameInput = page
    .locator('input[name="username"], input[placeholder*="Username" i], input[aria-label*="Username" i]')
    .first();

  let found = 0;

  for (const name of names) {
    await usernameInput.fill(name);
    await usernameInput.blur();
    await sleep(350);

    const errorVisible = await page
      .locator('text=/username.*(taken|already.*used|not available|invalid)/i')
      .count();

    if (errorVisible === 0) {
      results.push(name);
      console.log('AVAILABLE:', name);
      found++;
      if (found >= 20) break; // stop after 20 examples
    }
  }

  console.log('\nFound available usernames:', results.length);
  console.log(results.slice(0, 20));

  await browser.close();
})();