import { useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button, Container, FormControl, FormLabel, Input } from "@mui/joy";
import { NewsAPI } from "../APIs/NewsAPI";
import { UserContext } from "../Contexts/UserContext";
import { NewsPostEditor } from "../Components/NewsPostEditor/NewsPostEditor";
import { NEWS_PAGE_URL, NEW_POST_ID } from "../Utilities/RouteUtils";

interface INewsPostEditorPageProps {
  postId: string;
}

export const NewsPostEditorPage: React.FC<INewsPostEditorPageProps> = (props) => {

  const { user } = useContext(UserContext);
  const [, setLocation] = useLocation();

  const isNew = props.postId === NEW_POST_ID;

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState(user?.email ?? '');
  const [markdown, setMarkdown] = useState('');
  const [loaded, setLoaded] = useState(isNew);

  useEffect(() => {
    if (!isNew) {
      NewsAPI.getNewsPost(props.postId).then(post => {
        setTitle(post.title);
        setAuthor(post.author);
        setMarkdown(post.markdown);
        setLoaded(true);
      });
    }
  }, [isNew, props.postId]);

  async function submit() {
    const options = { title, author, markdown };
    if (isNew) {
      await NewsAPI.createNewsPost(options);
    } else {
      await NewsAPI.updateNewsPost(props.postId, options);
    }
    setLocation(NEWS_PAGE_URL);
  }

  function canSubmit() {
    return title !== '' && author !== '' && markdown !== '';
  }

  function render() {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2, pb: 4 }}>
        <FormControl>
          <FormLabel>Title</FormLabel>
          <Input value={title} onChange={(e) => setTitle(e.currentTarget.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Author</FormLabel>
          <Input readOnly value={author} />
        </FormControl>
        <FormControl>
          <FormLabel>Content</FormLabel>
          {loaded && <NewsPostEditor initialMarkdown={markdown} onChange={setMarkdown} />}
        </FormControl>
        <Button sx={{ alignSelf: 'flex-start' }} disabled={!canSubmit()} onClick={submit}>
          {isNew ? 'Publish' : 'Save'}
        </Button>
      </Container>
    )
  }

  return render();
}
