import { memo, useState, useRef, useEffect } from 'react';

/**
 * Inline editable text label.
 * Double-click to edit; blur or Enter to commit.
 * @param {object} props
 * @param {string} props.value
 * @param {function} props.onChange - (newValue: string) => void
 * @param {string} [props.className] - Additional classes for the display span
 */
export const EditableLabel = memo(function EditableLabel({
  value,
  onChange,
  className = '',
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) {
      onChange(trimmed);
    } else {
      setDraft(value);
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={`bg-transparent border border-accent rounded px-1 py-0 text-text-primary outline-none ${className}`}
        style={{ width: `${Math.max(draft.length, 3) + 2}ch` }}
      />
    );
  }

  return (
    <span
      onDoubleClick={() => setEditing(true)}
      className={`cursor-text hover:text-accent transition-colors ${className}`}
      title="Double-click to edit"
    >
      {value}
    </span>
  );
});
