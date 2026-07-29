import { Editor } from '@tiptap/react';
import { Button, ButtonGroup, IconButton } from '@mui/joy';
import { FormatBold, FormatItalic, FormatListBulleted, FormatListNumbered, InsertLink } from '@mui/icons-material';

import styles from './NewsPostEditorToolbar.module.css';

interface INewsPostEditorToolbarProps {
  editor: Editor | null;
}

export const NewsPostEditorToolbar: React.FC<INewsPostEditorToolbarProps> = (props) => {

  const { editor } = props;

  function setLink() {
    if (!editor) {
      return;
    }
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', previousUrl ?? '');
    if (url === null) {
      return;
    }
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  }

  function render() {
    if (!editor) {
      return null;
    }

    return (
      <div className={styles.toolbar}>
        <ButtonGroup variant='soft' size='sm'>
          <IconButton
            variant={editor.isActive('bold') ? 'solid' : 'plain'}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <FormatBold />
          </IconButton>
          <IconButton
            variant={editor.isActive('italic') ? 'solid' : 'plain'}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <FormatItalic />
          </IconButton>
          <Button
            variant={editor.isActive('heading', { level: 2 }) ? 'solid' : 'plain'}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            H2
          </Button>
          <Button
            variant={editor.isActive('heading', { level: 3 }) ? 'solid' : 'plain'}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            H3
          </Button>
          <IconButton
            variant={editor.isActive('bulletList') ? 'solid' : 'plain'}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <FormatListBulleted />
          </IconButton>
          <IconButton
            variant={editor.isActive('orderedList') ? 'solid' : 'plain'}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <FormatListNumbered />
          </IconButton>
          <IconButton
            variant={editor.isActive('link') ? 'solid' : 'plain'}
            onClick={setLink}
          >
            <InsertLink />
          </IconButton>
        </ButtonGroup>
      </div>
    )
  }

  return render();
}
