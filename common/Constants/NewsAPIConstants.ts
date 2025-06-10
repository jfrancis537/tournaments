import { NewsPost } from "../Models/NewsPost";

export namespace NewsAPIConstants {
  export const BASE_PATH = '/api/v1/news';

  export interface NewsPostPagedResponse {
    page: number;
    totalPages: number;
    posts: NewsPost[]
    count: number;
  }

  export function GET_NEWS_POSTS(page: number): string;
  export function GET_NEWS_POSTS(): '/posts/page/:page';
  export function GET_NEWS_POSTS(page: number | string = ':page') {
    return `/posts/page/${page}`;
  }
}