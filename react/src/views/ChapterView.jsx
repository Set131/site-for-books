// views/ChapterView.jsx
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosClient from "../axios";
import PageComponent from "../components/PageComponent";
import { useStateContext } from "../contexts/ContextProvider";
import WindEffect from "../components/WindEffect";
import Bottom from "./Bottom";
import ReactMarkdown from 'react-markdown';

export default function ChapterView() {
  const { bookSlug, chapterNumber } = useParams();
  const [chapter, setChapter] = useState(null);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, showToast } = useStateContext();

  useEffect(() => {
  setLoading(true);
  axiosClient
    .get(`/book/get-by-slug/${bookSlug}`)
    .then(({ data }) => {
      setBook(data.data);
      return axiosClient.get(`/books/${data.data.id}/chapters/${chapterNumber}`);
    })
    .then(({ data }) => {
      setChapter(data);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Помилка завантаження:", err);
      setError("Не вдалося завантажити розділ");
      setLoading(false);
    });
}, [bookSlug, chapterNumber, currentUser]);

  const downloadChapter = () => {
    if (!chapter || !book) return;
    
    // Формуємо назву файлу: назва_книги_chapter_номер_глави.txt
    const bookName = book.title.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_').substring(0, 50);
    const fileName = `${bookName}_chapter_${chapter.chapter_number}.txt`;
    
    // Формуємо вміст файлу
    const content = `Назва книги: ${book.title}
Автор: ${book.creator_name}
Розділ ${chapter.chapter_number}: ${chapter.title || 'Без назви'}
Дата: ${new Date(chapter.created_at).toLocaleDateString('uk-UA')}

${'='.repeat(60)}

${chapter.content_markdown || 'Текст відсутній'}

${'='.repeat(60)}
Переглядів: ${chapter.views}
Завантажено: ${new Date().toLocaleString('uk-UA')}
`;
    
    // Створюємо blob і скачуємо
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast("Главу завантажено", "success");
  };

  // Функція для додавання додаткового переносу між абзацами
  const addExtraLineBreaks = (text) => {
    if (!text) return "Текст відсутній";
    
    // Замінюємо два переноси (\n\n) на три переноси (\n\n\n)
    // Це додасть додатковий порожній рядок між абзацами
    return text.replace(/\n\n/g, '\n\n\n');
  };

  if (loading) {
    return (
      <>
        <WindEffect />
        <PageComponent title="Завантаження..." buttons="">
          <div className="text-center py-20 text-white">Завантаження розділу...</div>
          <Bottom />
        </PageComponent>
      </>
    );
  }

  if (error || !chapter) {
    return (
      <>
        <WindEffect />
        <PageComponent title="Помилка" buttons="">
          <div className="text-center py-20 text-red-500">{error || "Розділ не знайдено"}</div>
          <Bottom />
        </PageComponent>
      </>
    );
  }

  const processedContent = addExtraLineBreaks(chapter.content_markdown);

  return (
    <>
      <WindEffect />
      <PageComponent title={chapter.title || `Розділ ${chapter.chapter_number}`} buttons="">
        <div className="max-w-4xl mx-auto px-4 py-8 bg-black">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
            <Link
              to={`/book/public/${bookSlug}`}
              className="bg-[#ffc400] hover:bg-white rounded-sm p-2 flex items-center gap-1 font-bold"
            >
              Назад до змісту
            </Link>
            <div className="flex gap-2">
              <button
                onClick={downloadChapter}
                className="bg-[#0c3200] text-[#ffc400] border border-[#ffc400] rounded-sm p-2 flex items-center gap-1 font-bold transition"
              >
                Завантажити
              </button>
            </div>
            <div className="text-white text-sm">
              {book?.title}
            </div>
          </div>

          <h1 className="sm:text-3xl text-xl font-bold text-white mb-2">
            {chapter.title || `Розділ ${chapter.chapter_number}`}
          </h1>
          
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#ffc400]">
            <span className="text-[#ffc400]">Розділ {chapter.chapter_number}</span>
            <span className="text-gray-400 text-sm">{chapter.views} переглядів</span>
          </div>

          <div className="prose prose-invert max-w-none text-white sm:text-left text-justify">
            <ReactMarkdown>
              {processedContent}
            </ReactMarkdown>
          </div>

          <div className="flex justify-between mt-12 pt-6 border-t border-gray-700">
            {chapter.previous_chapter && (
              <Link
                to={`/book/${bookSlug}/chapter/${chapter.previous_chapter}`}
                className="bg-[#ffc400] hover:bg-white rounded-sm p-2 font-bold"
              >
                Попередній
              </Link>
            )}
            {chapter.next_chapter && (
              <Link
                to={`/book/${bookSlug}/chapter/${chapter.next_chapter}`}
                className="bg-[#ffc400] hover:bg-white rounded-sm p-2 ml-auto font-bold"
              >
                Наступний
              </Link>
            )}
          </div>
        </div>
        <Bottom />
      </PageComponent>
    </>
  );
}