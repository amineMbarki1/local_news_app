import puppeteer, { Page } from "puppeteer";

async function getPosts() {
  const browser = await puppeteer.launch({
    defaultViewport: null,
    devtools: true,
  });

  const page = await browser.newPage();

  await page.goto(
    "https://www.tunisienumerique.com/actualite-tunisie/tunisie/",
    { waitUntil: "domcontentloaded" }
  );

  let indicies: [number, number] = [0, 9];
  let pageNum = 1;

  const postLinks = await extractPostLinks(page);


  
  

  loadNextPageData(page);

  //console.log(await extractPostLinks(page));

  //await browser.close();
}

getPosts();

const indices = [0, 9];

async function loadNextPageData(page: Page) {
  page
    .waitForResponse((request) =>
      request
        .url()
        .startsWith(
          "https://www.tunisienumerique.com/actualite-tunisie/tunisie/page/"
        )
    )
    .then(() => {
      extractPostLinks(page)
        .then(async (links) => {
          for (const link of links) {
            await page.goto(link);
            const post = await extractArticle(page, link);
            console.log("extracted this one", post);
          }
          await page.goto(
            "https://www.tunisienumerique.com/actualite-tunisie/tunisie/"
          );
        })
        .then(() => {
          indices[0] += 9;
          indices[1] += 9;
          loadNextPageData(page);
        });
    });
  await page.click(".inf-more-but");
}

async function extractPostLinks(page: Page) {
  return await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".infinite-post")).map(
      (el) => (el.children[0] as HTMLAnchorElement).href
    );
  });
}

async function extractArticle(page: Page, postLink: string) {
  const post = await page.evaluate(() => {
    const title = document.querySelector(".post-title")!.textContent;
    const featureImageEl = document.querySelector("#post-feat-img")!
      .children[0] as HTMLImageElement;
    const featureImage = featureImageEl.src;
    const postBodyElements = Array.from(
      document.querySelector("#content-main")!.children
    );
    const excludeIndex = postBodyElements.findLastIndex((element) => {
      return element.classList.contains("simplesocialbuttons");
    });

    const paragrapheElements = postBodyElements.slice(4, excludeIndex);

    const body = paragrapheElements.reduce((accu, cur) => {
      return cur.textContent!.trim().length === 0
        ? accu
        : accu + `<p>${cur.textContent}</p>`;
    }, "");

    return { title, featureImage, body, source: "tunisienumerique.com" };
  });

  return post;
}
