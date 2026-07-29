
import { NewsAPIConstants } from "@common/Constants/NewsAPIConstants";
import { NewsPost, NewsPostOptions } from '@common/Models/NewsPost';
import express, { Router } from 'express';
import { DateTime } from 'luxon';
import { v4 as uuid } from "uuid";
import { Database } from "../Database/Database";
import { DatabaseError, DatabaseErrorType } from "../Database/DatabaseError";
import { RequireRole } from "../MiddleWare/RequireRoleMiddleware";
import { asyncHandler } from "../Utilities/AsyncHandler";

const PAGE_SIZE = 10;

namespace NewsController {
  export const path = NewsAPIConstants.BASE_PATH;
  export const router = express.Router();

  router.get(NewsAPIConstants.GET_NEWS_POSTS(), asyncHandler(async (req, resp) => {
    const page = Math.max(1, Number(req.params.page) || 1);
    const { posts, totalCount } = await Database.instance.getNewsPosts(page, PAGE_SIZE);
    const response: NewsAPIConstants.NewsPostPagedResponse = {
      page,
      count: posts.length,
      posts: posts.map(NewsPost.Serialize),
      totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    };
    resp.json(response);
  }));

  router.get(NewsAPIConstants.GET_NEWS_POST(), asyncHandler(async (req, resp) => {
    try {
      const post = await Database.instance.getNewsPost(req.params.id);
      resp.json(NewsPost.Serialize(post));
    } catch (err) {
      if (err instanceof DatabaseError && err.type === DatabaseErrorType.MissingRecord) {
        resp.sendStatus(404);
        return;
      }
      throw err;
    }
  }));

  router.put(NewsAPIConstants.CREATE_NEWS_POST(), RequireRole('Admin'), asyncHandler(async (req, resp) => {
    const body: NewsPostOptions = req.body;
    const now = DateTime.now();
    const post: NewsPost = {
      id: uuid(),
      author: body.author,
      title: body.title,
      markdown: body.markdown,
      createdDate: now,
      updatedDate: now,
    };
    const created = await Database.instance.addNewsPost(post);
    resp.status(201).json(NewsPost.Serialize(created));
  }));

  router.put(NewsAPIConstants.UPDATE_NEWS_POST(), RequireRole('Admin'), asyncHandler(async (req, resp) => {
    const body: NewsPostOptions = req.body;
    try {
      const existing = await Database.instance.getNewsPost(req.params.id);
      const updated = await Database.instance.updateNewsPost(req.params.id, {
        author: body.author,
        title: body.title,
        markdown: body.markdown,
        createdDate: existing.createdDate,
        updatedDate: DateTime.now(),
      });
      resp.status(200).json(NewsPost.Serialize(updated));
    } catch (err) {
      if (err instanceof DatabaseError && err.type === DatabaseErrorType.MissingRecord) {
        resp.sendStatus(404);
        return;
      }
      throw err;
    }
  }));

  router.delete(NewsAPIConstants.DELETE_NEWS_POST(), RequireRole('Admin'), asyncHandler(async (req, resp) => {
    try {
      await Database.instance.getNewsPost(req.params.id);
    } catch (err) {
      if (err instanceof DatabaseError && err.type === DatabaseErrorType.MissingRecord) {
        resp.sendStatus(404);
        return;
      }
      throw err;
    }
    await Database.instance.deletePost(req.params.id);
    resp.sendStatus(204);
  }));
}

const both: [string, Router] = [NewsController.path, NewsController.router];
export { both as NewsController };
