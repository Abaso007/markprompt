import Highlight, { defaultProps, Language } from 'prism-react-renderer';
import { FC } from 'react';

export type CodeProps = {
  code: string;
  language: Language;
  className?: string;
  noPreWrap?: boolean;
  showLineNumbers?: boolean;
};

export const Code: FC<CodeProps> = ({
  code,
  language,
  noPreWrap,
  showLineNumbers,
  className: _className,
}) => {
  return (
    <div className={_className}>
      <Highlight {...defaultProps} code={code} language={language}>
        {({ className, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${className} ${
              !noPreWrap ? 'whitespace-pre-wrap' : ''
            }`}
          >
            {tokens.map((line, i) => (
              <div key={`code-line-${i}`} {...getLineProps({ line, key: i })}>
                {showLineNumbers && (
                  <span className="inline-block w-6">{i + 1}</span>
                )}
                {line.map((token, key) => (
                  <span
                    key={`code-line-${i}-${key}`}
                    {...getTokenProps({ token, key })}
                  />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
};
