// views/Friends.jsx
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axiosClient from "../axios";
import PageComponent from "../components/PageComponent";
import { useStateContext } from '../contexts/ContextProvider';
import WindEffect from "../components/WindEffect";
import Bottom from "./Bottom";
import Avatar from "../components/Avatar";

export default function Friends() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, showToast } = useStateContext();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Використовуємо id з параметрів або currentUser.id
  const userId = id || currentUser?.id;
  const isOwnProfile = currentUser?.id == userId;

  useEffect(() => {
    if (userId) {
      loadFriends();
      if (isOwnProfile) {
        loadPendingRequests();
      }
    }
  }, [userId]);

  const loadFriends = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data } = await axiosClient.get(`/friends/${userId}`);
      setFriends(data);
    } catch (error) {
      console.error("Помилка завантаження друзів:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingRequests = async () => {
    if (!userId) return;
    setLoadingRequests(true);
    try {
      const { data } = await axiosClient.get('/friends/pending');
      setPendingRequests(data);
    } catch (error) {
      console.error("Помилка завантаження запитів:", error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const acceptRequest = async (friendId) => {
    try {
      await axiosClient.post(`/friends/accept/${friendId}`);
      if (showToast) showToast("Друга додано", "success");
      navigate(0);
    } catch (error) {
      console.error("Помилка:", error);
      if (showToast) showToast("Не вдалося прийняти запит", "error");
    }
  };

  const rejectRequest = async (friendId) => {
    try {
      await axiosClient.delete(`/friends/${friendId}`);
      if (showToast) showToast("Запит відхилено", "success");
      loadPendingRequests();
    } catch (error) {
      console.error("Помилка:", error);
      if (showToast) showToast("Не вдалося відхилити запит", "error");
    }
  };

  const removeFriend = async (friendId) => {
    if (!window.confirm("Ви впевнені, що хочете видалити друга?")) return;
    
    try {
      await axiosClient.delete(`/friends/${friendId}`);
      if (showToast) showToast("Друга видалено", "success");
      navigate(0);
    } catch (error) {
      console.error("Помилка:", error);
      if (showToast) showToast("Не вдалося видалити друга", "error");
    }
  };

  // Показуємо завантаження, поки немає userId
  if (!currentUser) {
    return (
      <>
        <WindEffect />
        <PageComponent title="Друзі" buttons="">
          <div className="text-center py-20 text-white">Увійдіть, щоб побачити друзів</div>
          <Bottom />
        </PageComponent>
      </>
    );
  }

  if (!userId) {
    return (
      <>
        <WindEffect />
        <PageComponent title="Друзі" buttons="">
          <div className="text-center py-20 text-white">Завантаження...</div>
          <Bottom />
        </PageComponent>
      </>
    );
  }

  return (
    <>
      <WindEffect />
      <PageComponent title="Друзі" buttons="">
        <div className="max-w-4xl mx-auto px-4 py-8">
          
          {/* Запити в друзі (тільки для власного профілю) */}
          {isOwnProfile && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[#ffc400] mb-4">Запити в друзі</h2>
              {loadingRequests ? (
                <div className="text-white">Завантаження...</div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-gray-400">Немає нових запитів</div>
              ) : (
                <div className="space-y-2">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between bg-[#1a1a1a] rounded-lg p-3 border border-gray-800">
                      <Link to={`/profile/${request.id}`} className="flex items-center gap-3">
                        <Avatar user={request} size="md" />
                        <span className="text-white font-medium">{request.name}</span>
                      </Link>
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptRequest(request.id)}
                          className="bg-[#ffc400] text-black px-4 py-1 rounded font-medium hover:bg-[#e6b000] transition"
                        >
                          Прийняти
                        </button>
                        <button
                          onClick={() => rejectRequest(request.id)}
                          className="bg-red-600 text-white px-4 py-1 rounded font-medium hover:bg-red-700 transition"
                        >
                          Відхилити
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Список друзів */}
          <h2 className="text-xl font-bold text-[#ffc400] mb-4">
            {isOwnProfile ? "Мої друзі" : "Друзі користувача"}
          </h2>
          
          {loading ? (
            <div className="text-white text-center py-10">Завантаження...</div>
          ) : friends.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              {isOwnProfile ? "У вас ще немає друзів" : "У користувача немає друзів"}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {friends.map((friend) => (
                <div key={friend.id} className="bg-[#1a1a1a] rounded-lg p-4 text-center border border-gray-800 hover:border-[#ffc400] transition">
                  <Link to={`/profile/${friend.id}`} className="flex flex-col items-center">
                    <Avatar user={friend} size="xl" />
                    <p className="text-white font-medium mt-2">{friend.name}</p>
                  </Link>
                  {isOwnProfile && (
                    <button
                      onClick={() => removeFriend(friend.id)}
                      className="mt-2 text-red-500 text-sm hover:text-red-400 transition"
                    >
                      Видалити з друзів
                    </button>
                  )}
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