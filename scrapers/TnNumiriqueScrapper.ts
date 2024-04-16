import puppeteer, { Browser, Page } from "puppeteer";
import Post, { savePost } from "./Post";
import { PostgresError } from "postgres";

export default async function getPosts() {
  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();

  await page.goto(
    "https://www.tunisienumerique.com/actualite-tunisie/tunisie/",
    { waitUntil: "domcontentloaded" }
  );

  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".infinite-post")).map(
      (el) => (el.children[0] as HTMLAnchorElement).href
    );
  });

  for (const link of links) {
    await page.goto(link, { waitUntil: "domcontentloaded" });
    try {
      const post = await extractArticle(page);
      const newsPost = {
        ...post,
        postedOn: parsePostDate(post.postedOn!),
      } as Post;
      await savePost(newsPost);
    } catch (error) {
      if (error instanceof PostgresError)
        return console.log("nothing to scrape");
    }
  }

  browser.close();
}

getPosts();

function parsePostDate(time: string) {
  const splitTime = time.split(" ");
  const unit = splitTime[splitTime.length - 1];

  const quantity = +splitTime[splitTime.length - 2];
  let date = new Date();

  if (unit.startsWith("heure")) date.setHours(date.getHours() - quantity);
  else if (unit.startsWith("seconde"))
    date.setSeconds(date.getSeconds() - quantity);
  else if (unit.startsWith("minute"))
    date.setSeconds(date.getSeconds() - quantity);
  else date = new Date(time.replace("à", ""));

  return date;
}

async function extractArticle(postPage: Page) {
  const post = await postPage.evaluate(() => {
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
        : accu + `${cur.innerHTML}`;
    }, "");

    const date = document.querySelector(".post-date")!.textContent;

    return {
      title,
      featureImage,
      body,
      source: "tunisienumerique.com",
      postedOn: date,
    };
  });

  return post;
}
