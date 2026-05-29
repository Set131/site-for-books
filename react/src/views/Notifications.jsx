// views/Notifications.jsx
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axiosClient from "../axios";
import PageComponent from "../components/PageComponent";
import { useStateContext } from '../contexts/ContextProvider';
import WindEffect from "../components/WindEffect";
import Bottom from "./Bottom";

export default function Notifications() {
  const { id } = useParams();
  const { currentUser, showToast } = useStateContext();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = currentUser?.id == id;

  useEffect(() => {
    if (currentUser && isOwnProfile) {
      loadLibraryChapters();
    } else if (currentUser && !isOwnProfile) {
      setLoading(false);
    }
  }, [currentUser, id]);

  const loadLibraryChapters = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/library-chapters', {
        params: { limit: 20 }
      });
      setChapters(data);
    } catch (error) {
      console.error("Помилка завантаження:", error);
    } finally {
      setLoading(false);
    }
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

  if (!currentUser) {
    return (
      <>
        <WindEffect />
        <PageComponent title="Сповіщення" buttons="">
          <div className="text-center py-20 text-white">Увійдіть, щоб побачити сповіщення</div>
          <Bottom />
        </PageComponent>
      </>
    );
  }

  if (!isOwnProfile) {
    return (
      <>
        <WindEffect />
        <PageComponent title="Сповіщення" buttons="">
          <div className="text-center py-20 text-white">
            У вас немає доступу до сповіщень цього користувача
          </div>
          <Bottom />
        </PageComponent>
      </>
    );
  }

  return (
    <>
      <WindEffect />
      <PageComponent title="Сповіщення" buttons="">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h2 className="text-[#ffc400] text-xl font-bold mb-4">Повідомлення</h2>
          
          {loading ? (
            <div className="text-white text-center py-10">Завантаження...</div>
          ) : chapters.length === 0 ? (
            <div className="text-center py-20 text-[#ffc400]">
              Немає нових розділів
              <p className="text-gray-400 text-sm mt-2">
                Додавайте книги в бібліотеку, щоб бачити тут нові розділи
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {chapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  to={`/book/${chapter.book_slug}/chapter/${chapter.chapter_number}`}
                  className="block bg-[#1a1a1a] hover:border hover:border-[#ffc400] 
                  transition-colors duration-200 rounded-lg p-3 border border-gray-800"
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