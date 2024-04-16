import sql from "./db";

export default interface Post {
  source: string;
  body: string;
  title: string;
  featureImage: string;
  id?: string;
  postedOn:Date;
}

export async function savePost(post: Post) {
  return await sql`
    INSERT INTO news_articles (title,body, source, postedon, feature_image) VALUES(
      ${post.title},
      ${post.body},
      ${post.source},
      ${post.postedOn},
      ${post.featureImage}
    )
    returning *
    `;
}
