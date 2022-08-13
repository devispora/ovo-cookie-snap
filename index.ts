import { chromium } from "playwright";

const LOGIN_PORTAL_URL = "https://lpj.daybreakgames.com/ps2/live/";
const REFRESH_VERSION_URL =
  "https://lpj.daybreakgames.com/ps2/live/refresh_version?launchPoint=soe";

type AccountInfo = {
  username: string;
  token: string;
};

async function scrapeLoginToken(
  username: string,
  password: string
): Promise<AccountInfo> {
  const browser = await chromium.launch({ headless: false });
  const browserCtx = await browser.newContext();

  const page = await browserCtx.newPage();

  await page.goto(LOGIN_PORTAL_URL);

  const detailsFetch: Promise<AccountInfo> = new Promise(async (res) => {
    page.on("response", async (response) => {
      if (response.url() === REFRESH_VERSION_URL) {
        const cookies = await browserCtx.cookies(LOGIN_PORTAL_URL);

        const tokenCookie = cookies.filter(
          (cookie) => cookie.name === "lp-token"
        )[0];

        res({
          username,
          token: tokenCookie.value,
        });
      }
    });
  });

  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.locator("id=loginSubmit").click();

  const accountDetails = await detailsFetch;

  await browserCtx.close();
  await browser.close();

  return accountDetails;
}

(async () => {
  const accountDetails = await scrapeLoginToken("username", "password");

  console.log(accountDetails);
})();
