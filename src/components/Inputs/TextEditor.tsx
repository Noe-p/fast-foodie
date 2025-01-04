import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import tw from 'tailwind-styled-components';
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
      [{ 'header': [1, 2, false] }, 'bold', 'italic', 'underline', {'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
    ],
  }

  return <ReactQuill theme="snow" modules={modules} className='bg-background' value={value} onChange={onChange} />;
}

const Main = tw.div`
  grid
  grid-cols-1
  sm:grid-cols-4
`;