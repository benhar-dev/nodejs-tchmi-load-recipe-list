const puppeteer = require("puppeteer");

const WEBSITE_URL = "http://127.0.0.1:3001/liveview_xxx.html";
const RETRY_INTERVAL_MS = 1000;

async function waitForWebsocket(page) {
  let isWebsocketReady = false;

  while (!isWebsocketReady) {
    isWebsocketReady = await page.evaluate(() => {
      return TcHmi.Server.isWebsocketReady();
    });

    if (!isWebsocketReady) {
      console.log("Websocket is not ready yet. Retrying in 1 seconds...");
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS));
    }
  }
}

async function fetchRecipeList(page) {
  return await page.evaluate(() => {
    return new Promise((resolve) => {
      TcHmi.Server.RecipeManagement.listRecipes((reply) => {
        resolve(reply);
      });
    });
  });
}

async function main() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.goto(WEBSITE_URL);

  await waitForWebsocket(page);
  const result = await fetchRecipeList(page);

  console.log(result.value);

  await browser.close();
}

main();
