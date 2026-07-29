import { NewsPost } from "@common/Models/NewsPost"
import { Box, Card, CardContent, Divider, IconButton, Typography } from "@mui/joy";
import { DeleteForeverOutlined, EditOutlined } from "@mui/icons-material";
import Markdown from "react-markdown";
import { useContext } from "react";
import { useLocation } from "wouter";
import { UserContext } from "../Contexts/UserContext";
import { NewsAPI } from "../APIs/NewsAPI";
import { newsPostEditUrl } from "../Utilities/RouteUtils";

import styles from './NewsPostDisplay.module.css';

interface INewsPostDisplayProps {
  post: NewsPost;
  onDeleted?: () => void;
}

export const NewsPostDisplay: React.FC<INewsPostDisplayProps> = (props) => {

  const { user } = useContext(UserContext);
  const [, setLocation] = useLocation();

  const isAdmin = !!user?.roles.includes('Admin');

  async function deletePost() {
    if (!window.confirm('Delete this post?')) {
      return;
    }
    await NewsAPI.deleteNewsPost(props.post.id);
    props.onDeleted?.call(undefined);
  }

  function render() {
    return (
      <Card className={styles["post-card"]}>
        <CardContent>
          <Box className={styles.header}>
            <Typography level='title-md'>{props.post.title}</Typography>
            {isAdmin && (
              <Box className={styles.actions}>
                <IconButton size='sm' onClick={() => setLocation(newsPostEditUrl(props.post.id))}>
                  <EditOutlined />
                </IconButton>
                <IconButton size='sm' onClick={deletePost}>
                  <DeleteForeverOutlined />
                </IconButton>
              </Box>
            )}
          </Box>
          <Divider />
          <Markdown>{props.post.markdown}</Markdown>
        </CardContent>
      </Card>
    )
  }

  return render();
}
