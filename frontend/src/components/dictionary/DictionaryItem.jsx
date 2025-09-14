import React from "react";

const DictionaryItem = React.memo(function DictionaryItem({
  item,
  onRemove,
  className,
  closeButtonClass,
}) {
  return (
    <div className={className}>
      <span>{item}</span>
      <button
        type="button"
        onClick={() => onRemove(item)}
        className={closeButtonClass}
        aria-label={`Remove ${item}`}
      >
        ×
      </button>
    </div>
  );
});

export default DictionaryItem;
