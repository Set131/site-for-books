import { useState, useEffect } from "react";
import PageComponent from "../components/PageComponent";
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../axios";
import { Link } from "react-router-dom";
import Bottom from "./Bottom";
import WindEffect from "../components/WindEffect";
import PaginationLinks from "../components/PaginationLinks";

export default function OwnBooks() {
  const { currentUser, showToast } = useStateContext();
  const [books, setBooks] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);

  const onDeleteClick = (id) => {
    if (window.confirm("Ви впевнені, що хочете видалити цю книгу?")) {
      axiosClient.delete(`/book/${id}`).then(() => {
        getBooks();
        showToast("Книгу видалено");
      });
    }
  };

  const onPageClick = (link) => {
    if (!link.url) return;
    getBooks(link.url);
  };

  const getBooks = (url = "/book") => {
    setLoading(true);
    axiosClient
      .get(url, {
        params: {
          user_id: currentUser?.id,
        },
      })
      .then(({ data }) => {
        const userBooks = data.data.filter(book => book.user_id === currentUser?.id);
        setBooks(userBooks);
        setMeta({
          ...data.meta,
          total: userBooks.length,
          current_page: 1,
          last_page: 1,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Помилка завантаження:", err);
        setLoading(false);
        showToast("Не вдалося завантажити ваші книги", "error");
      });
  };

  useEffect(() => {
    if (currentUser?.id) {
      getBooks();
    }
  }, [currentUser]);

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
        <PageComponent title="Мої книги" buttons="">
          <div className="text-center py-20 text-white">
            Увійдіть в систему, щоб побачити свої книги
          </div>
          <Bottom />
        </PageComponent>
      </>
    );
  }

  return (
    <>
      <WindEffect />
      <PageComponent
        title="Мої книги"
        buttons={
          <Link to="/books/create">
            <span className="text-black justify-center bg-[#ffc400] font-bold flex p-3 rounded-2xl text-sm sm:text-base">
              + Додати книгу
            </span>
          </Link>
        }
      >
        <div className="px-4 sm:px-10">
          {loading ? (
            <div className="text-center py-20 text-white">Завантаження...</div>
          ) : books.length === 0 ? (
            <div className="text-center py-20 text-[#ffc400]">
              У вас ще немає книг. Додайте першу книгу!
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {books.map((book) => (
                  <div 
                    key={book.id} 
                    className="block bg-[#1a1a1a] rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer border border-gray-800 hover:border-[#ffc400] group"
                  >
                    <Link to={`/book/public/${book.slug}`}>
                      <div className="relative w-full aspect-[3/3]">
                        <img 
                          src={book.photo_url} 
                          alt={book.title}
                          className="absolute top-0 left-0 w-full h-full object-cover"
                        />
                        {book.age_limit > 0 && (
                          <div className="absolute top-2 left-2 z-10">
                            <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                              {book.age_limit}+
                            </span>
                          </div>
                        )}
                        <div className="absolute bottom-2 right-2 z-10">
                          <div className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg">
                            {renderRating(book.rating)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-bold text-white text-center line-clamp-2 flex-1">
                            {book.title}
                          </h4>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
              {books.length > 0 && (
                <div className="mt-6">
                  <PaginationLinks meta={meta} onPageClick={onPageClick} />
                </div>
              )}
            </>
          )}
        </div>
        <Bottom />
      </PageComponent>
    </>
  );
}