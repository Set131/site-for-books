import { useState, useEffect, useRef } from "react";
import PageComponent from "../components/PageComponent";
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../axios";
import { Link } from "react-router-dom";
import Bottom from "./Bottom";
import WindEffect from "../components/WindEffect";

export default function Library() {
  const { currentUser, showToast } = useStateContext();
  const [savedBooks, setSavedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasLoaded = useRef(false); 

  useEffect(() => {
    if (currentUser && !hasLoaded.current) {
      hasLoaded.current = true;
      loadSavedBooks();
    } else if (!currentUser) {
      setLoading(false);
    }
  }, [currentUser]);

  const loadSavedBooks = async () => {
    try {
      const { data } = await axiosClient.get('/saved-books');
      setSavedBooks(data.data);
    } catch (error) {
      console.error("Помилка завантаження:", error);
      if (showToast) showToast("Не вдалося завантажити бібліотеку", "error");
    } finally {
      setLoading(false);
    }
  };

  const removeFromLibrary = async (bookId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await axiosClient.delete(`/saved-books/${bookId}`);
      setSavedBooks(savedBooks.filter(item => item.book_id !== bookId));
      if (showToast) showToast("Книгу видалено з бібліотеки", "success");
    } catch (error) {
      console.error("Помилка видалення:", error);
      if (showToast) showToast("Не вдалося видалити книгу", "error");
    }
  };

  const renderRating = (rating) => {
    const ratingValue = rating || 0;
    return (
      <div className="flex items-center gap-1">
        <span className="text-yellow-400 text-sm">★</span>
        <span className="text-white text-xs">{ratingValue.toFixed(1)}</span>
      </div>
    );
  };

  if (!currentUser) {
    return (
      <>
        <WindEffect />
        <PageComponent title="Персональна бібліотека" buttons="">
          <div className="text-center py-20 text-white">
            Увійдіть в систему, щоб побачити свою бібліотеку
          </div>
          <Bottom />
        </PageComponent>
      </>
    );
  }

  return (
    <>
      <WindEffect />
      <PageComponent title="Персональна бібліотека" buttons="">
        <h1 className="sm:text-2xl text-xl font-bold text-white sm:mx-10 mx-0 sm:text-left text-center mb-6">Персональна бібліотека</h1>
        <div className="px-4 sm:px-10">
          {loading ? (
            <div className="text-center py-20 text-white">Завантаження...</div>
          ) : savedBooks.length === 0 ? (
            <div className="text-center py-20 text-[#ffc400]">
              Ваша бібліотека порожня
              <p className="text-gray-400 text-sm mt-2">
                Додавайте книги через кнопку "Додати в бібліотеку" на сторінці книги
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {savedBooks.map((item) => (
                <div key={item.id} className="bg-[#1a1a1a] rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 border border-gray-800 hover:border-[#ffc400]">
                  <Link to={`/book/public/${item.book.slug}`}>
                    <div className="relative w-full aspect-[3/3]">
                      <img 
                        src={item.book.photo_url} 
                        alt={item.book.title}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                      />
                      
                      {/* Кнопка видалення на фото (верхній правий кут) */}
                      <button
                        onClick={(e) => removeFromLibrary(item.book_id, e)}
                        className="absolute top-2 right-2 z-20 bg-black/70 hover:bg-red-600 backdrop-blur-sm rounded-full p-2 transition-all duration-200 group"
                        title="Видалити з бібліотеки"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-4 w-4 text-white group-hover:text-white" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor" 
                          strokeWidth={2}
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                          />
                        </svg>
                      </button>
                      
                      {item.book.age_limit > 0 && (
                        <div className="absolute bottom-2 left-2 z-10">
                          <span className="bg-black/70 backdrop-blur-sm text-red-700 p-1 px-2 rounded-lg text-sm font-extrabold">
                            {item.book.age_limit}+
                          </span>
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 z-10">
                        <div className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg">
                          {renderRating(item.book.rating)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <h4 className="text-sm font-bold text-white text-center truncate">
                        {item.book.title}
                      </h4>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
        <Bottom />
      </PageComponent>
    </>
  );
}