import { useState, useEffect } from "react";
import PageComponent from "../components/PageComponent";
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../axios";
import { Link } from "react-router-dom";
import Bottom from "./Bottom";
import WindEffect from "../components/WindEffect";
import Avatar from "../components/Avatar";

export default function Main() {
  const [books, setBooks] = useState([]);
  const [latestChapters, setLatestChapters] = useState([]);
  const [topAuthors, setTopAuthors] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(true);
  const [loadingAuthors, setLoadingAuthors] = useState(true);
  const { showToast } = useStateContext();

  // Завантаження 8 книг для головної сторінки
  useEffect(() => {
    axiosClient
      .get("/book", {
        params: {
          per_page: 8,
          filter: "new",
        },
      })
      .then(({ data }) => {
        setBooks(data.data);
        setLoadingBooks(false);
      })
      .catch((err) => {
        console.error("Помилка завантаження книг:", err);
        setLoadingBooks(false);
      });
  }, []);

  // Завантаження 10 останніх глав
  useEffect(() => {
    axiosClient
      .get("/latest-chapters", {
        params: {
          limit: 10,
        },
      })
      .then(({ data }) => {
        setLatestChapters(data);
        setLoadingChapters(false);
      })
      .catch((err) => {
        console.error("Помилка завантаження глав:", err);
        setLoadingChapters(false);
      });
  }, []);

  // Завантаження топ авторів
  useEffect(() => {
    axiosClient
      .get("/top-authors")
      .then(({ data }) => {
        setTopAuthors(data);
        setLoadingAuthors(false);
      })
      .catch((err) => {
        console.error("Помилка завантаження авторів:", err);
        setLoadingAuthors(false);
      });
  }, []);

  const renderRating = (rating) => {
    const ratingValue = rating || 0;
    return (
      <div className="flex items-center gap-1">
        <span className="text-yellow-400 text-sm">★</span>
        <span className="text-white text-xs">{ratingValue.toFixed(1)}</span>
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} хвилин тому`;
    if (diffHours < 24) return `${diffHours} годин тому`;
    return `${diffDays} днів тому`;
  };

  return (
    <>
      <WindEffect />
      <PageComponent title="Main">
        {/* Популярні книги - горизонтальний скрол без полоси прокрутки */}
        <div className="sm:px-4 px-2">
          <h2 className="text-[#ffc400] text-xl font-bold sm:ml-4 ml-2 mb-4">Популярні книги</h2>
          
          {loadingBooks ? (
            <div className="text-white text-center py-10">Завантаження книг...</div>
          ) : (
            <div className="overflow-x-auto scrollbar-none sm:py-4 sm:px-4 py-2 px-2">
              <div className="flex gap-4 min-w-max">
                {books.map((book) => (
                  <Link
                    key={book.id}
                    to={`/book/public/${book.slug}`}
                    className="block w-[160px] sm:w-[180px] flex-shrink-0 bg-[#1a1a1a] rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 border border-gray-800 hover:border-[#ffc400]"
                  >
                    <div className="relative w-full aspect-[3/3]">
                      <img
                        src={book.photo_url}
                        alt={book.title}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                      />
                      {book.age_limit > 0 && (
                        <div className="absolute bottom-2.5 left-2 z-10">
                          <span className="text-red-700 bg-black/70 px-2 py-1.5 rounded text-xs font-bold">
                            {book.age_limit}+
                          </span>
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 z-10">
                        <div className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded">
                          {renderRating(book.rating)}
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <h4 className="text-sm font-bold text-white text-center truncate">
                        {book.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Топ авторів - горизонтальний скрол без полоси */}
        <div className="sm:px-8 px-4">
          <h2 className="text-[#ffc400] text-xl font-bold mb-4">Топ авторів</h2>
          
          {loadingAuthors ? (
            <div className="text-white text-center py-10">Завантаження авторів...</div>
          ) : topAuthors.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              Ще немає авторів
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-none sm:p-2 p-0">
              <div className="flex gap-4 min-w-max">
                {topAuthors.map((author) => (
                  <Link
                    key={author.id}
                    to={`/profile/${author.id}`}
                    className="items-center gap-2 flex-shrink-0 bg-[#1a1a1a] 
                    rounded-lg p-4 hover:scale-105 transition-transform duration-300 border border-gray-800 
                    hover:border-[#ffc400] flex"
                  >
                    <div className="flex justify-center w-25">
                      <Avatar user={author} size="lg" />
                    </div>
                    <p className="text-white font-medium text-sm text-center truncate w-full">
                      {author.name}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sm:px-8 px-4 mt-4 mb-4">
          <h2 className="text-[#ffc400] text-xl font-bold mb-4">Останні оновлення</h2>
          
          {loadingChapters ? (
            <div className="text-white text-center py-10">Завантаження глав...</div>
          ) : latestChapters.length === 0 ? (
            <div className="text-white text-center py-10">Ще немає глав</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {latestChapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  to={`/book/${chapter.book_slug}/chapter/${chapter.chapter_number}`}
                  className="block bg-[#1a1a1a] hover:border hover:border-[#ffc400] transition-colors duration-200 rounded-lg p-3 border border-gray-800"
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <img
                        src={chapter.book_photo}
                        alt={chapter.book_title}
                        className="w-12 h-16 object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-base truncate">
                        {chapter.book_title}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">
                        Розділ {chapter.chapter_number} - {chapter.title || "Без назви"}
                      </p>
                    </div>
                    <div className="text-gray-500 text-xs flex-shrink-0">
                      {formatDate(chapter.created_at)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <Bottom />
      </PageComponent>
    </>
  );
}