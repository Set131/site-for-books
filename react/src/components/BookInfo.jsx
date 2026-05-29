// components/BookInfo.jsx
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosClient from "../axios";
import { useStateContext } from "../contexts/ContextProvider";

export default function BookInfo({ book, isAuthor, onDeleteBookClick, renderRating, onRatingUpdate }) {
  const { currentUser, showToast } = useStateContext();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(book.user_rating || null);
  const [selectedRating, setSelectedRating] = useState(book.user_rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isRatingLoading, setIsRatingLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSavingLoading, setIsSavingLoading] = useState(false);

  // Перевіряємо чи книга збережена
  useEffect(() => {
    if (currentUser && book.id) {
      checkSavedStatus();
    }
  }, [currentUser, book.id]);

  const checkSavedStatus = async () => {
    try {
      const { data } = await axiosClient.get(`/saved-books/check/${book.id}`);
      setIsSaved(data.saved);
    } catch (error) {
      console.error("Помилка перевірки статусу:", error);
    }
  };

  // Функція для збереження/видалення книги
  const toggleSaveBook = async () => {
    if (!currentUser) {
      showToast("Увійдіть, щоб зберегти книгу", "error");
      return;
    }

    setIsSavingLoading(true);
    try {
      if (isSaved) {
        await axiosClient.delete(`/saved-books/${book.id}`);
        setIsSaved(false);
        showToast("Книгу видалено з бібліотеки", "success");
      } else {
        await axiosClient.post('/saved-books', { book_id: book.id });
        setIsSaved(true);
        showToast("Книгу додано до бібліотеки", "success");
      }
    } catch (error) {
      console.error("Помилка:", error);
      showToast("Сталася помилка", "error");
    } finally {
      setIsSavingLoading(false);
    }
  };

  // Отримуємо рік з created_at
  const getYear = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).getFullYear();
  };

  // Функція для відкриття модального вікна
  const openRatingModal = () => {
    if (!currentUser) {
      showToast("Увійдіть, щоб оцінити книгу", "error");
      return;
    }
    setSelectedRating(userRating || 0);
    setShowRatingModal(true);
  };

  // Функція для збереження оцінки
  const submitRating = async () => {
    if (selectedRating < 1 || selectedRating > 10) {
      showToast("Виберіть оцінку від 1 до 10", "error");
      return;
    }

    setIsRatingLoading(true);
    try {
      const response = await axiosClient.post(`/book/${book.id}/rate`, { rating: selectedRating });
      setUserRating(selectedRating);
      if (onRatingUpdate) {
        onRatingUpdate(response.data.average_rating);
      }
      showToast("Дякуємо за оцінку!", "success");
      setShowRatingModal(false);
    } catch (err) {
      console.error("Помилка оцінювання:", err);
      showToast(err.response?.data?.message || "Не вдалося оцінити книгу", "error");
    } finally {
      setIsRatingLoading(false);
    }
  };

  return (
    <>
      <div className="lg:w-[25%] w-full lg:pr-4">
        <div className="relative">
          <img 
            src={book.photo_url} 
            alt={book.title} 
            className="rounded-xl w-full"
          />
          {book.age_limit > 0 && (
            <div className="absolute bottom-4.5 left-2">
              <span className="bg-black/70 backdrop-blur-sm text-red-700 px-3 py-3 rounded-lg text-sm font-extrabold">
                {book.age_limit}+
              </span>
            </div>
          )}
          <div className="absolute bottom-2 right-2">
            {renderRating(book.rating)}
          </div>
        </div>

        <h1 className="text-xl mt-3 font-bold text-center lg:text-left sm:hidden block">{book.title}</h1>

        <button
          onClick={toggleSaveBook}
          disabled={isSavingLoading}
          className={`w-full mt-4 py-2 rounded-lg font-bold transition ${
            isSaved 
              ? "bg-[#ffc400] text-black hover:bg-[#e6b000]" 
              : "bg-black text-[#ffc400] border border-[#ffc400] hover:bg-[#1a1a1a]"
          }`}
        >
          {isSavingLoading ? "Завантаження..." : (isSaved ? "✓ У бібліотеці" : "+ Додати в бібліотеку")}
        </button>

        <button
          onClick={openRatingModal}
          className="w-full mt-2 py-2 rounded-lg bg-black text-[#ffc400] font-bold hover:text-white transition border border-[#ffc400]"
        >
          {userRating ? `Змінити оцінку (${userRating}/10)` : "Оцінити книгу"}
        </button>

        <div className="mt-4 space-y-2">
          <div className="bg-black/50 rounded-lg p-3">
            <p className="text-gray-400 text-sm">Автор</p>
            <p className="text-white font-medium">{book.creator_name || "Невідомий"}</p>
          </div>
          
          <div className="bg-black/50 rounded-lg p-3">
            <p className="text-gray-400 text-sm">Рік створення</p>
            <p className="text-white font-medium">{getYear(book.created_at) || "Невідомо"}</p>
          </div>

          <div className="bg-black/50 rounded-lg p-3">
            <p className="text-gray-400 text-sm">Кількість переглядів</p>
            <p className="text-white font-medium">{book.views || 0}</p>
          </div>
        </div>

        {isAuthor && (
          <div className="mt-4">
            <Link
              to={`/books/${book.id}`}
              className="text-[#ffc400] my-2 p-2 flex justify-center bg-black border border-[#ffc400] rounded-xl font-medium"
            >
              Редагувати книгу
            </Link>
            <button
              onClick={onDeleteBookClick}
              className="text-red-700 p-2 flex justify-center bg-black border border-red-700 rounded-xl w-full mt-2"
            >
              Видалити книгу
            </button>
          </div>
        )}
        
        <Link
          to="/catalog"
          className="text-black p-2 justify-center bg-[#cc9d00] rounded-xl mt-5 hover:bg-[#ffc400] transition font-medium block text-center"
        >
          Повернутись до каталогу
        </Link>
      </div>

      {/* Модальне вікно для оцінки */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowRatingModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
            >
              ✕
            </button>
            
            <h2 className="text-2xl font-bold text-[#ffc400] text-center mb-4">
              Оцініть книгу
            </h2>
            
            <p className="text-white text-center mb-6">{book.title}</p>
            
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setSelectedRating(rating)}
                  onMouseEnter={() => setHoverRating(rating)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-3xl transition"
                >
                  <span className={(hoverRating || selectedRating) >= rating ? "text-yellow-400" : "text-gray-600"}>
                    ★
                  </span>
                </button>
              ))}
            </div>
            
            <p className="text-center text-white text-lg mb-6">
              {selectedRating > 0 ? `Ваша оцінка: ${selectedRating} / 10` : "Виберіть оцінку"}
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={submitRating}
                disabled={isRatingLoading || selectedRating === 0}
                className={`flex-1 py-2 rounded-lg font-bold transition ${
                  isRatingLoading || selectedRating === 0
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-[#ffc400] text-black hover:bg-[#e6b000]"
                }`}
              >
                {isRatingLoading ? "Збереження..." : "Зберегти"}
              </button>
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition"
              >
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}