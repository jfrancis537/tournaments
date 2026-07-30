CREATE TABLE IF NOT EXISTS news_posts (
  id TEXT PRIMARY KEY,
  author TEXT NOT NULL,
  title TEXT NOT NULL,
  markdown TEXT NOT NULL,
  createddate TEXT NOT NULL,
  updateddate TEXT NOT NULL
);
 