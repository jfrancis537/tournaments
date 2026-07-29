import fs from 'fs';
import os from 'os';
import path from 'path';
import { DateTime } from 'luxon';
import { afterEach, describe, expect, test } from 'vitest';
import { NewsPost } from '@common/Models/NewsPost';
import { JsonDatabase } from './JsonDatabase';
import { DatabaseError, DatabaseErrorType } from './DatabaseError';

let nextId = 0;

function makePost(overrides: Partial<NewsPost> = {}): NewsPost {
  const id = `post-${nextId++}`;
  return {
    id,
    author: 'Author',
    title: `Title ${id}`,
    markdown: '# content',
    createdDate: DateTime.now(),
    updatedDate: DateTime.now(),
    ...overrides,
  };
}

let dbPath: string;

function makeDb() {
  dbPath = path.join(os.tmpdir(), `news-json-db-test-${nextId++}.json`);
  return new JsonDatabase(dbPath);
}

afterEach(() => {
  if (dbPath && fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
});

describe('JsonDatabase news posts', () => {

  test('addNewsPost then getNewsPost round-trips', async () => {
    const db = makeDb();
    const post = makePost();
    await db.addNewsPost(post);

    const fetched = await db.getNewsPost(post.id);
    expect(fetched.id).toBe(post.id);
    expect(fetched.title).toBe(post.title);
    expect(fetched.markdown).toBe(post.markdown);
  });

  test('getNewsPost throws MissingRecord for unknown id', async () => {
    const db = makeDb();
    await expect(db.getNewsPost('does-not-exist')).rejects.toMatchObject({
      type: DatabaseErrorType.MissingRecord,
    });
  });

  test('deletePost removes the post', async () => {
    const db = makeDb();
    const post = makePost();
    await db.addNewsPost(post);
    await db.deletePost(post.id);

    await expect(db.getNewsPost(post.id)).rejects.toBeInstanceOf(DatabaseError);
  });

  test('getNewsPosts paginates newest-first and reports totalCount', async () => {
    const db = makeDb();
    const now = DateTime.now();
    const posts = Array.from({ length: 15 }, (_, i) => makePost({
      title: `Post ${i}`,
      createdDate: now.plus({ minutes: i }),
    }));
    for (const post of posts) {
      await db.addNewsPost(post);
    }

    const page1 = await db.getNewsPosts(1, 10);
    expect(page1.totalCount).toBe(15);
    expect(page1.posts).toHaveLength(10);
    expect(page1.posts[0].title).toBe('Post 14');

    const page2 = await db.getNewsPosts(2, 10);
    expect(page2.posts).toHaveLength(5);
    expect(page2.posts[4].title).toBe('Post 0');
  });

  test('getNewsPosts returns an empty array past the last page', async () => {
    const db = makeDb();
    await db.addNewsPost(makePost());

    const result = await db.getNewsPosts(5, 10);
    expect(result.posts).toHaveLength(0);
    expect(result.totalCount).toBe(1);
  });
});
