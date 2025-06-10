
import { NewsAPIConstants } from "@common/Constants/NewsAPIConstants";
import { NewsPost } from '@common/Models/NewsPost';
import express, { Router } from 'express';
import { DateTime } from 'luxon';
import { v4 as uuid } from "uuid";

namespace NewsController {
  export const path = NewsAPIConstants.BASE_PATH;
  export const router = express.Router();

  function generateSamplePosts(start: number): NewsPost[] {
    const posts: NewsPost[] = [];
    for(let i = start; i < start + 10; i++) {
      posts.push({
        id: uuid(),
        author: 'Fredrick Smith',
        createdDate: DateTime.now(),
        updatedDate: DateTime.now(),
        title: `Post Number ${i}`,
        markdown: '### This is example markdown content!'
      });
    }
    return posts;
  }

  router.get(NewsAPIConstants.GET_NEWS_POSTS(), async (req,resp) => {
    let page = Number(req.params.page);
    if(page > 7) {
      page = 1;
    }
    const startPost = (10 * (page - 1));
    const sampleData: NewsAPIConstants.NewsPostPagedResponse = {
      page: page,
      count: 10,
      posts: generateSamplePosts(startPost),
      totalPages: 7
    }
    resp.json(sampleData);
  });
}

const both: [string, Router] = [NewsController.path, NewsController.router];
export { both as NewsController };
