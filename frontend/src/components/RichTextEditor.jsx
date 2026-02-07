import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Editor, Toolbar } from '@wangeditor/editor-for-react';
import '@wangeditor/editor/dist/css/style.css';

const toolbarConfig = {};

const RichTextEditor = ({ value, onChange }) => {
  const [editor, setEditor] = useState(null);
  const [html, setHtml] = useState(value || '');

  useEffect(() => {
    setHtml(value || '');
  }, [value]);

  useEffect(() => () => {
    if (editor) {
      editor.destroy();
    }
  }, [editor]);

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 8 }}>
      <Toolbar editor={editor} defaultConfig={toolbarConfig} style={{ borderBottom: '1px solid #e2e8f0' }} />
      <Editor
        defaultConfig={{ placeholder: 'input content here...' }}
        value={html}
        onCreated={setEditor}
        onChange={editorInstance => {
          const htmlStr = editorInstance.getHtml();
          setHtml(htmlStr);
          onChange?.(htmlStr);
        }}
        style={{ height: 280, overflowY: 'auto', padding: '0 12px' }}
      />
    </div>
  );
};

RichTextEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};

RichTextEditor.defaultProps = {
  value: '',
  onChange: undefined,
};

export default RichTextEditor;
