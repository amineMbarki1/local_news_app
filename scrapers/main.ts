import getPostsFromTnNumirique from "./TnNumiriqueScrapper";
import getPostsFromLeaders from "./LeadersScrapper";

(async () => {
  await getPostsFromLeaders();
  getPostsFromTnNumirique();
})();
