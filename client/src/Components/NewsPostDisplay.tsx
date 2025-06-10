import { NewsPost } from "@common/Models/NewsPost"
import { Card, CardContent, Divider, Typography } from "@mui/joy";
import Markdown from "react-markdown";

import styles from './NewsPostDisplay.module.css';

interface INewsPostDisplayProps {
  post: NewsPost
}

export const NewsPostDisplay: React.FC<INewsPostDisplayProps> = (props) => {

  function render() {
    return (
      <Card className={styles["post-card"]}>
        <CardContent>
          <Typography level='title-md'>{props.post.title}</Typography>
          <Divider />
          <Markdown>{props.post.markdown}</Markdown>
        </CardContent>
      </Card>
    )
  }

  return render();
}