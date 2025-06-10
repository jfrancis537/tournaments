import { NewsAPIConstants } from "@common/Constants/NewsAPIConstants";
import { NewsPost } from "@common/Models/NewsPost";
import { HttpStatusError } from "../Errors/HttpStatusError";

export namespace NewsAPI {


  
  export async function getNewsPosts(page: number): Promise<NewsAPIConstants.NewsPostPagedResponse> {
    const response = await fetch(`${NewsAPIConstants.BASE_PATH}${NewsAPIConstants.GET_NEWS_POSTS(page)}`);
    if(response.ok) {
      const result = await response.json() as NewsAPIConstants.NewsPostPagedResponse;
      return result;
    }
    throw new HttpStatusError(`Failed to get posts for page: ${page}`,response.status);
  }
}