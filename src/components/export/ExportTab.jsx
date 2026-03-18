import { memo, useState, useCallback } from 'react';

/**
 * Code block with copy button for a single export format.
 */
export const ExportTab = memo(function ExportTab({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-2 py-1 text-base font-medium rounded border border-border text-text-secondary hover:text-text-primary hover:border-text-tertiary transition-colors z-10"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <pre className="bg-surface-0 border border-border rounded-lg p-4 pr-16 text-base font-mono text-text-secondary overflow-auto max-h-96 whitespace-pre">
        {code}
      </pre>
    </div>
  );
});
