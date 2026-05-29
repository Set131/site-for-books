// components/ChapterForm.jsx
import ReactMarkdown from 'react-markdown';
import { useState } from 'react';

export default function ChapterForm({ 
  editingChapter, 
  chapterForm, 
  setChapterForm, 
  onSave, 
  onClose, 
  isSaving 
}) {
  const [previewMode, setPreviewMode] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#1a1a1a] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-[#1a1a1a] p-4 border-b border-[#ffc400] flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#ffc400]">
            {editingChapter ? "Редагувати розділ" : "Новий розділ"}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-[#ffc400] text-2xl"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={onSave} className="p-6">
          <div className="mb-4">
            <label className="block text-white mb-2">Номер розділу</label>
            <input
              type="number"
              value={chapterForm.chapter_number}
              onChange={(e) => setChapterForm({ ...chapterForm, chapter_number: parseInt(e.target.value) })}
              className="w-full p-2 rounded-lg bg-[#2a2a2a] text-white border border-[#ffc400]"
              required
              disabled={!!editingChapter}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-white mb-2">Назва розділу (необов'язково)</label>
            <input
              type="text"
              value={chapterForm.title}
              onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
              className="w-full p-2 rounded-lg bg-[#2a2a2a] text-white border border-[#ffc400]"
              placeholder="Назва розділу"
            />
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-white">Текст розділу (Markdown)</label>
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="text-sm text-[#ffc400] hover:underline"
              >
                {previewMode ? "Редагувати" : "Попередній перегляд"}
              </button>
            </div>
            
            {previewMode ? (
              <div className="p-4 rounded-lg bg-[#2a2a2a] border border-[#ffc400] min-h-[300px] prose prose-invert max-w-none">
                <ReactMarkdown>{chapterForm.content_markdown || "*Немає тексту*"}</ReactMarkdown>
              </div>
            ) : (
              <textarea
                value={chapterForm.content_markdown}
                onChange={(e) => setChapterForm({ ...chapterForm, content_markdown: e.target.value })}
                className="w-full p-2 rounded-lg bg-[#2a2a2a] text-white border border-[#ffc400] font-mono"
                rows={15}
                required
                placeholder="# Розділ 1

Текст вашого розділу..."
              />
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className={`bg-[#ffc400] text-black px-6 py-2 rounded-lg font-medium hover:bg-[#e6b000] transition ${
                isSaving ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSaving ? "Збереження..." : (editingChapter ? "Оновити" : "Створити")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition"
            >
              Скасувати
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}