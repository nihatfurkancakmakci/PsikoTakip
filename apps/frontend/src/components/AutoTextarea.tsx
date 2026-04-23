'use client';

import { useEffect, useRef, TextareaHTMLAttributes } from 'react';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & { minRows?: number };

export default function AutoTextarea({ minRows = 3, style, ...props }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => { resize(); }, [props.value]);

  return (
    <textarea
      ref={ref}
      rows={minRows}
      onInput={resize}
      style={{ resize: 'none', overflow: 'hidden', ...style }}
      {...props}
    />
  );
}
