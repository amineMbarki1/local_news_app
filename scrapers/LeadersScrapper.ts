import puppeteer, { Page } from "puppeteer";
import Post, { savePost } from "./Post";
import { PostgresError } from "postgres";

export default async function getPosts() {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto("https://www.leaders.com.tn/categorie/news", {
    waitUntil: "domcontentloaded",
  });

  const articleLinks = await extractArticleLinks(page);

  for (const link of articleLinks) {
    await page.goto(link, { waitUntil: "domcontentloaded" });
    try {
      const article = await extractArticle(page);
      const newsPost = {
        ...article,
        postedOn: new Date(article.postedOn!),
      } as Post;
      savePost(newsPost);
    } catch (err) {
      if (err instanceof PostgresError) return console.log("nothing to scrape");
      
    }
  }
}

async function extractArticleLinks(page: Page) {
  return await page.evaluate(() => {
    const linkElements = Array.from(
      document.querySelectorAll(
        "#sitewrap > div.content > div.container.inner > div > div.col-xs-12.col-sm-8.col-md-8 > div > div.title > a"
      )
    ) as HTMLAnchorElement[];

    return linkElements.map((el) => el.href);
  });
}

async function extractArticle(postPage: Page) {
  return await postPage.evaluate(() => {
    const featureImage = (
      document.querySelector(
        "#sitewrap > div.content > div.container.inner > div:nth-child(1) > div.col-xs-12.col-sm-8.col-md-8 > div.thumb > img"
      ) as HTMLImageElement
    ).src;

    const title = document.querySelector(
      "#sitewrap > div.content > div.container.inner > div:nth-child(1) > div.col-xs-12.col-sm-8.col-md-8 > h1"
    )?.textContent;

    const bodyElements = Array.from(
      document.querySelector(".article_body")!.children
    );
    const lastParagraphIndex = bodyElements.findLastIndex((el) =>
      el.outerHTML.includes("text-align: right;")
    );

    let body = bodyElements
      .slice(0, lastParagraphIndex)
      .reduce((acc, cur) => acc + cur.outerHTML, "");

    // const regex = /src=".+"/g;

    // body.replace(regex, (match, ...args) => {
    //   console.log(args);
    //   console.log(match);
    //   return match;
    //prefix:https://www.leaders.com.tn/
    // });

    const date = document
      .querySelector(
        "#sitewrap > div.content > div.container.inner > div:nth-child(1) > div.col-xs-12.col-sm-8.col-md-8 > div.infos"
      )
      ?.textContent?.split("-")[1];

    return {
      featureImage,
      title,
      body,
      postedOn: date,
      source: "leaders.com.tn",
    };
  });
}
