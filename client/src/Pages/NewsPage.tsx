import { useEffect, useState } from "react";
import { NewsAPI } from "../APIs/NewsAPI";
import { NewsPost } from "@common/Models/NewsPost";
import { Container, Typography } from "@mui/joy";
import { NewsPostDisplay } from "../Components/NewsPostDisplay";

import pageStyles from './NewsPage.module.css';
import { Pagination } from "../Components/Pagination";

export const NewsPage: React.FC = () => {

  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<NewsPost[]>();
  const [totalPages, setTotalPages] = useState<number>(0);

  useEffect(() => {
    NewsAPI.getNewsPosts(page).then(r => {
      setPosts(r.posts);
      setPage(r.page);
      setTotalPages(r.totalPages);
    });
  }, [page]);

  // function handlePageChange(page: number) {
  //   setPage(page);
  // }

  function render() {
    return (
      <Container className={pageStyles["main-container"]}>
        <Typography className={pageStyles.heading} marginBottom='1rem' level='h1' >
          Kingsgate Pickleball News
        </Typography>
        <div className={pageStyles["post-container"]}>
          {posts ? posts.map(p => (
            <NewsPostDisplay post={p} key={p.id} />
          )) : 'Loading...'}
        </div>
        <Pagination
          count={totalPages}
          page={page}
          onChange={setPage}
        />
        {/* <ThemeProvider theme={createTheme()}>
          <Pagination
            count={totalPages}
            page={page}
            shape='rounded'
            variant='outlined'
            onChange={handlePageChange}
          />
        </ThemeProvider> */}
      </Container>
    )
  }

  return render();
}