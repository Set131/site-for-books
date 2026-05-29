// components/TagManager.jsx
import { useState } from "react";
import { ALL_TAGS } from "../constants/tags";

export default function TagManager({ selectedTags, onTagsChange }) {
  const [showTagSelector, setShowTagSelector] = useState(false);

  // Додати/видалити тег до вибраних
  const toggleTag = (tagName) => {
    if (selectedTags.includes(tagName)) {
      onTagsChange(selectedTags.filter(t => t !== tagName));
    } else {
      onTagsChange([...selectedTags, tagName]);
    }
  };

  // Видалити тег з вибраних
  const removeSelectedTag = (tagName) => {
    onTagsChange(selectedTags.filter(t => t !== tagName));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-[#ffc400] mb-2">
        Теги
      </label>

      {/* Відображення вибраних тегів */}
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedTags.length === 0 && (
          <span className="text-gray-400 text-sm">Теги не вибрані</span>
        )}
        {selectedTags.map((tag) => (
          <span
            key={tag}
            className="bg-[#ffc400] text-black px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeSelectedTag(tag)}
              className="hover:text-red-700 ml-1 text-lg font-bold"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Кнопка показати/сховати список */}
      <button
        type="button"
        onClick={() => setShowTagSelector(!showTagSelector)}
        className="text-sm text-[#ffc400] border border-[#ffc400] bg-[#0c3200] px-3 py-1 rounded-lg hover:bg-[#ffc400] hover:text-[#0c3200] transition"
      >
        {showTagSelector ? "Сховати список" : "Вибрати теги"}
      </button>

      {/* Список всіх тегів для вибору */}
      {showTagSelector && (
        <div className="mt-3 p-3 border border-gray-300 rounded-lg max-h-40 overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  selectedTags.includes(tag)
                    ? "bg-[#ffc400] text-black"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}