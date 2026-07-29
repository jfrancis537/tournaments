import { NewsAPIConstants } from "@common/Constants/NewsAPIConstants";
import { NewsPost, NewsPostOptions, SerializedNewsPost } from "@common/Models/NewsPost";
import { HttpStatusError } from "../Errors/HttpStatusError";

export namespace NewsAPI {

  export async function getNewsPosts(page: number): Promise<{ page: number; totalPages: number; count: number; posts: NewsPost[] }> {
    const response = await fetch(`${NewsAPIConstants.BASE_PATH}${NewsAPIConstants.GET_NEWS_POSTS(page)}`);
    if (response.ok) {
      const result = await response.json() as NewsAPIConstants.NewsPostPagedResponse;
      return { ...result, posts: result.posts.map(NewsPost.Deserialize) };
    }
    throw new HttpStatusError(`Failed to get posts for page: ${page}`, response.status);
  }

  export async function getNewsPost(id: string): Promise<NewsPost> {
    const response = await fetch(`${NewsAPIConstants.BASE_PATH}${NewsAPIConstants.GET_NEWS_POST(id)}`);
    if (response.ok) {
      return NewsPost.Deserialize(await response.json() as SerializedNewsPost);
    }
    throw new HttpStatusError(`Failed to get post: ${id}`, response.status);
  }

  export async function createNewsPost(options: NewsPostOptions): Promise<NewsPost> {
    const response = await fetch(`${NewsAPIConstants.BASE_PATH}${NewsAPIConstants.CREATE_NEWS_POST()}`, {
      method: 'PUT',
      body: JSON.stringify(options),
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      throw new HttpStatusError('Failed to create news post', response.status);
    }
    return NewsPost.Deserialize(await response.json() as SerializedNewsPost);
  }

  export async function updateNewsPost(id: string, options: NewsPostOptions): Promise<NewsPost> {
    const response = await fetch(`${NewsAPIConstants.BASE_PATH}${NewsAPIConstants.UPDATE_NEWS_POST(id)}`, {
      method: 'PUT',
      body: JSON.stringify(options),
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      throw new HttpStatusError('Failed to update news post', response.status);
    }
    return NewsPost.Deserialize(await response.json() as SerializedNewsPost);
  }

  export async function deleteNewsPost(id: string): Promise<void> {
    const response = await fetch(`${NewsAPIConstants.BASE_PATH}${NewsAPIConstants.DELETE_NEWS_POST(id)}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new HttpStatusError('Failed to delete news post', response.status);
    }
  }
}
