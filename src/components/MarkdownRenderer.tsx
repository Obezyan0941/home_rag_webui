import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function getLanguageFromClassName(className?: string): string | null {
  if (!className) return null;
  const match = /language-(\w+)/.exec(className);
  return match ? match[1].toLowerCase() : null;
}

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  node?: any;
  [key: string]: any;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ 
  children, 
  language,
  ...props 
}) => {
  const codeString = React.Children.toArray(children)
    .map(child => String(child))
    .join('')
    .replace(/\n$/, '');

  return (
    <SyntaxHighlighter
      language={language}
      style={materialDark}
      PreTag="div"
      showLineNumbers={false}
      wrapLines={true}
      customStyle={{ 
        fontSize: '0.9em',
        borderRadius: '6px',
        margin: '0.8em 0'
      }}
      codeTagProps={{ style: { fontSize: 'inherit' } }}
      {...props}
    >
      {codeString}
    </SyntaxHighlighter>
  );
};

const renderCode = (props: CodeBlockProps) => {
  const { inline, className, children, ...rest } = props;
  const lang = getLanguageFromClassName(className);

  if (!inline && lang) {
    return <CodeBlock language={lang} {...rest}>{children}</CodeBlock>;
  }

  return (
    <code className={className} {...rest}>
      {children}
    </code>
  );
};

export interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
}) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code: renderCode,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;