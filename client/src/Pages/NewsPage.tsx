import { useCallback, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { NewsAPI } from "../APIs/NewsAPI";
import { NewsPost } from "@common/Models/NewsPost";
import { Button, Container, Typography } from "@mui/joy";
import { NewsPostDisplay } from "../Components/NewsPostDisplay";
import { UserContext } from "../Contexts/UserContext";
import { newsPostEditUrl, NEW_POST_ID } from "../Utilities/RouteUtils";

import pageStyles from './NewsPage.module.css';
import { Pagination } from "../Components/Pagination";

export const NewsPage: React.FC = () => {

  const { user } = useContext(UserContext);
  const [, setLocation] = useLocation();

  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<NewsPost[]>();
  const [totalPages, setTotalPages] = useState<number>(0);

  const isAdmin = !!user?.roles.includes('Admin');

  const refresh = useCallback(() => {
    NewsAPI.getNewsPosts(page).then(r => {
      setPosts(r.posts);
      setPage(r.page);
      setTotalPages(r.totalPages);
    });
  }, [page]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function render() {
    return (
      <Container className={pageStyles["main-container"]}>
        <Typography className={pageStyles.heading} marginBottom='1rem' level='h1' >
          Kingsgate Pickleball News
        </Typography>
        {isAdmin && (
          <Button
            sx={{ alignSelf: 'flex-start', margin: '0 1rem 1rem' }}
            onClick={() => setLocation(newsPostEditUrl(NEW_POST_ID))}
          >
            New Post
          </Button>
        )}
        <div className={pageStyles["post-container"]}>
          {posts ? posts.map(p => (
            <NewsPostDisplay post={p} key={p.id} onDeleted={refresh} />
          )) : 'Loading...'}
        </div>
        <Pagination
          count={totalPages}
          page={page}
          onChange={setPage}
        />
      </Container>
    )
  }

  return render();
}
