import { Editor, useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Markdown, MarkdownStorage } from 'tiptap-markdown';
import { Card } from '@mui/joy';
import { useEffect } from 'react';
import { NewsPostEditorToolbar } from './NewsPostEditorToolbar';

import styles from './NewsPostEditor.module.css';

interface INewsPostEditorProps {
  initialMarkdown?: string;
  onChange: (markdown: string) => void;
}

function getMarkdown(editor: Editor): string {
  const storage = editor.storage as unknown as { markdown: MarkdownStorage };
  return storage.markdown.getMarkdown();
}

export const NewsPostEditor: React.FC<INewsPostEditorProps> = (props) => {

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Markdown.configure({ html: false }),
    ],
    content: props.initialMarkdown ?? '',
    onUpdate: ({ editor }) => {
      props.onChange(getMarkdown(editor));
    },
  });

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  function render() {
    return (
      <Card className={styles["editor-card"]}>
        <NewsPostEditorToolbar editor={editor} />
        <EditorContent className={styles["editor-content"]} editor={editor} />
      </Card>
    )
  }

  return render();
}
