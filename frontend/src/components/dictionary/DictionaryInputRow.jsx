import React, { useCallback } from "react";

const DictionaryInputRow = ({
  value,
  onChange,
  onAdd,
  placeholder,
  inputClass,
  buttonClass,
}) => {
  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && value.trim()) {
        e.preventDefault();
        onAdd();
      }
    },
    [onAdd, value]
  );

  return (
    <>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={inputClass}
        aria-label="Dictionary path"
      />
      <button
        type="button"
        onClick={onAdd}
        className={buttonClass}
        disabled={!value.trim()}
      >
        Add
      </button>
    </>
  );
};

export default React.memo(DictionaryInputRow);
