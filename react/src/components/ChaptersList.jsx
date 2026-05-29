// components/ChaptersList.jsx
import { Link } from "react-router-dom";

export default function ChaptersList({ 
  chapters, 
  loadingChapters, 
  isAuthor, 
  bookSlug,
  onEditChapter, 
  onDeleteChapter 
}) {
  if (loadingChapters) {
    return <div className="text-center py-10">Завантаження розділів...</div>;
  }

  if (chapters.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        {isAuthor ? "У цієї книги ще немає розділів. Додайте перший розділ!" : "У цієї книги ще немає розділів"}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chapters.map((chapter) => (
        <div
          key={chapter.id}
          className="sm:flex block justify-between items-center p-3 bg-black/30 rounded-lg hover:bg-black/50 transition"
        >
          <Link
            to={`/book/${bookSlug}/chapter/${chapter.chapter_number}`}
            className="flex-1"
          >
            <span className="text-[#ffc400] sm:font-medium font-bold mr-3">Розділ {chapter.chapter_number}</span>
            <span className="text-white">{chapter.title || `Розділ ${chapter.chapter_number}`}</span>
          </Link>
          {isAuthor && (
            <div className="flex gap-2 justify-between">
              <button
                onClick={() => onEditChapter(chapter)}
                className="text-blue-400 hover:text-blue-300 transition px-2"
              >
                Редагувати
              </button>
              <button
                onClick={() => onDeleteChapter(chapter.chapter_number)}
                className="text-red-500 hover:text-red-400 transition px-2"
              >
                Видалити
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}