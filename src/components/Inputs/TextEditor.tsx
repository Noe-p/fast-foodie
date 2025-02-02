import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface TextEditorProps {
  className?: string;
  onChange?: (value: string) => void;
  value?: string;
  
}

export function TextEditor(props: TextEditorProps): JSX.Element {
  const { className, value, onChange } = props;

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }, 'bold', 'italic', 'underline', {'list': 'ordered'}, {'indent': '-1'}, {'indent': '+1'}],
    ],
  }

  return <ReactQuill theme="snow" modules={modules} className='bg-background' value={value} onChange={onChange} />;
}
