import { SerializedNewsPost } from "../Models/NewsPost";

export namespace NewsAPIConstants {
  export const BASE_PATH = '/api/v1/news';

  export interface NewsPostPagedResponse {
    page: number;
    totalPages: number;
    posts: SerializedNewsPost[]
    count: number;
  }

  export function GET_NEWS_POSTS(page: number): string;
  export function GET_NEWS_POSTS(): '/posts/page/:page';
  export function GET_NEWS_POSTS(page: number | string = ':page') {
    return `/posts/page/${page}`;
  }

  export function GET_NEWS_POST(id: string): string;
  export function GET_NEWS_POST(): '/get/:id';
  export function GET_NEWS_POST(id = ':id') {
    return `/get/${id}`;
  }

  export const CREATE_NEWS_POST = () => {
    return `/create`;
  }

  export function UPDATE_NEWS_POST(id: string): string;
  export function UPDATE_NEWS_POST(): '/update/:id';
  export function UPDATE_NEWS_POST(id = ':id') {
    return `/update/${id}`;
  }

  export function DELETE_NEWS_POST(id: string): string;
  export function DELETE_NEWS_POST(): '/delete/:id';
  export function DELETE_NEWS_POST(id = ':id') {
    return `/delete/${id}`;
  }
}