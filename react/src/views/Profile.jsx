import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../axios";
import PageComponent from "../components/PageComponent";
import Bottom from "./Bottom";
import { useStateContext } from '../contexts/ContextProvider';
import WindEffect from "../components/WindEffect";
import Avatar from "../components/Avatar";

export default function Profile() {
  const { id } = useParams();
  const { setCurrentUser, setUserToken, currentUser } = useStateContext();
  const [user, setUser] = useState(null);
  const [userBooks, setUserBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [apiError, setApiError] = useState(null);
  const [editAvatarMode, setEditAvatarMode] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const [friendStatus, setFriendStatus] = useState(null);
  const [friendLoading, setFriendLoading] = useState(false);

  const logout = (ev) => {
    ev.preventDefault();
    axiosClient.post('/logout')
      .then(res => {
        setCurrentUser({});
        setUserToken(null);
      });
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileResponse = await axiosClient.get(`/profile/${id}`);
        setUser(profileResponse.data);
        setPhoneInput(profileResponse.data.phone ? profileResponse.data.phone.replace("+380", "") : "");
        
        // Завантажуємо книги ТІЛЬКИ якщо це НЕ свій профіль
        if (currentUser?.id != id) {
          await loadUserBooks(id);
        } else {
          setLoadingBooks(false);
        }
        
        if (currentUser?.id && currentUser.id != id) {
          const statusResponse = await axiosClient.get(`/friends/status/${id}`);
          setFriendStatus(statusResponse.data.status);
        }
      } catch (error) {
        console.error("Помилка завантаження даних:", error);
        setApiError("Помилка завантаження даних профілю");
      }
    };

    fetchData();
  }, [id, currentUser]);

  const loadUserBooks = async (userId) => {
    setLoadingBooks(true);
    try {
      const { data } = await axiosClient.get('/book', {
        params: { user_id: userId }
      });
      setUserBooks(data.data);
    } catch (error) {
      console.error("Помилка завантаження книг:", error);
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleFriendAction = async () => {
    setFriendLoading(true);
    try {
      if (friendStatus === 'none') {
        await axiosClient.post('/friends/request', { friend_id: id });
        setFriendStatus('sent');
      } else if (friendStatus === 'received') {
        await axiosClient.post(`/friends/accept/${id}`);
        setFriendStatus('friend');
      } else if (friendStatus === 'friend' || friendStatus === 'sent') {
        await axiosClient.delete(`/friends/${id}`);
        setFriendStatus('none');
      }
    } catch (error) {
      console.error("Помилка:", error);
    } finally {
      setFriendLoading(false);
    }
  };

  const getFriendButtonText = () => {
    switch (friendStatus) {
      case 'none': return '➕ Додати в друзі';
      case 'sent': return '⏳ Запит надіслано';
      case 'received': return '✅ Прийняти запит';
      case 'friend': return '👥 В друзях';
      default: return '➕ Додати в друзі';
    }
  };

  const formatPhoneForDisplay = (phone) => {
    if (!phone) return "Не вказано";
    return `${phone.slice(0, 3)} (${phone.slice(3, 6)}) ${phone.slice(6, 9)}-${phone.slice(9, 11)}-${phone.slice(11)}`;
  };

  const handleSave = () => {
    if (phoneInput.length !== 9 || !/^\d+$/.test(phoneInput)) {
      setPhoneError("Введіть коректний номер (9 цифр без коду країни)");
      return;
    }

    const fullPhone = `+380${phoneInput}`;

    axiosClient
      .put(`/profile/${id}`, { phone: fullPhone })
      .then(({ data }) => {
        setUser(data);
        setEditMode(false);
        setPhoneError("");
        setPhoneInput(data.phone ? data.phone.replace("+380", "") : "");
        if (currentUser?.id === data.id) {
          setCurrentUser(data);
        }
      })
      .catch((err) => {
        console.error(err);
        setApiError("Помилка при оновленні профілю");
      });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result);
        setAvatarFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveAvatar = async () => {
    if (!avatarFile) return;
    
    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const { data } = await axiosClient.put(`/profile/${id}`, {
          avatar: reader.result
        });
        setUser(data);
        setAvatarPreview(null);
        setAvatarFile(null);
        setEditAvatarMode(false);
        if (currentUser?.id === data.id) {
          setCurrentUser(data);
        }
      } catch (err) {
        console.error("Помилка завантаження аватара:", err);
        setApiError("Не вдалося завантажити фото");
      } finally {
        setUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(avatarFile);
  };

  const isOwnProfile = currentUser?.id == id;

  const renderRating = (rating) => {
    const ratingValue = rating || 0;
    return (
      <div className="flex items-center gap-1">
        <span className="text-yellow-400 text-sm">★</span>
        <span className="text-white text-xs">{ratingValue.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <>
      <WindEffect />
      <PageComponent title={user ? `Профіль: ${user.name}` : "Профіль"}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-black text-white shadow-md opacity-80 overflow-hidden">
            <div className="w-full p-4">
              <div className="flex flex-col items-center mb-6">
                <Avatar user={user} size="xl" />
                {isOwnProfile && !editAvatarMode && (
                  <button
                    onClick={() => setEditAvatarMode(true)}
                    className="mt-2 text-[#ffc400] text-sm hover:underline"
                  >
                    Змінити фото
                  </button>
                )}
                
                {!isOwnProfile && currentUser && (
                  <button
                    onClick={handleFriendAction}
                    disabled={friendLoading}
                    className={`mt-2 px-4 py-1 rounded text-sm font-medium transition ${
                      friendStatus === 'friend'
                        ? 'bg-green-600 text-white'
                        : friendStatus === 'sent'
                        ? 'bg-gray-600 text-white'
                        : friendStatus === 'received'
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#ffc400] text-black hover:bg-[#e6b000]'
                    }`}
                  >
                    {getFriendButtonText()}
                  </button>
                )}
                
                {editAvatarMode && (
                  <div className="mt-4 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="text-white text-sm"
                    />
                    {avatarPreview && (
                      <div className="mt-3 flex gap-2 justify-center">
                        <button
                          onClick={saveAvatar}
                          disabled={uploadingAvatar}
                          className="bg-[#ffc400] text-black px-4 py-1 rounded font-medium"
                        >
                          {uploadingAvatar ? "Збереження..." : "Зберегти"}
                        </button>
                        <button
                          onClick={() => {
                            setEditAvatarMode(false);
                            setAvatarPreview(null);
                            setAvatarFile(null);
                          }}
                          className="bg-gray-600 text-white px-4 py-1 rounded"
                        >
                          Скасувати
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <h1 className="text-2xl font-bold">Профіль користувача</h1>
              <br />
              <p><strong>Імʼя:</strong> {user?.name || "Завантаження..."}</p>
              <br />
              <p><strong>Email:</strong> {user?.email || "Завантаження..."}</p>
              <br />
              <p><strong>Дата створення:</strong> {user?.created_at || "Завантаження..."}</p>
              <br />
              <div>
                <strong>Телефон:</strong>
                {editMode ? (
                  <div className="mt-1">
                    <div className="sm:flex items-center gap-2 block">
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-[#ffc400] bold">+380</span>
                        <input
                          type="tel"
                          value={phoneInput}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            if (value.length <= 9) {
                              setPhoneInput(value);
                              setPhoneError("");
                            }
                          }}
                          className="border h-10 rounded pl-16 w-full border-[#ffc400] bg-black text-white"
                          placeholder="XX XXX XX XX"
                          maxLength={9}
                        />
                      </div>
                      <div className="flex justify-baseline mt-4 sm:mt-0">
                        <button
                          onClick={handleSave}
                          className="text-[#ffc400] p-3 bg-black font-bold border px-4 py-2 rounded transition mr-[10%]"
                        >
                          Зберегти
                        </button>
                        <button
                          onClick={() => {
                            setEditMode(false);
                            setPhoneInput(user?.phone ? user.phone.replace("+380", "") : "");
                            setPhoneError("");
                          }}
                          className="text-[#ffc400] p-3 bg-black font-bold border px-4 py-2 rounded transition"
                        >
                          Скасувати
                        </button>
                      </div>
                    </div>
                    {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
                    <p className="text-gray-500 text-sm mt-1">Введіть 9 цифр номера без коду країни</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <span>{user?.phone ? formatPhoneForDisplay(user.phone) : "Не вказано"}</span>
                    {isOwnProfile && (
                      <button
                        onClick={() => setEditMode(true)}
                        className="text-[#ffc400] p-3 bg-black rounded-xl font-bold border"
                      >
                        {user?.phone ? "Змінити" : "Додати"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <br />
            
            {isOwnProfile && (
              <div className="block sm:flex text-white border-t border-gray-800">
                <div className="h-35 w-full flex justify-between">
                  <Link className="hover:shadow-[#ffc400] hover:shadow-lg m-auto w-full h-full flex 
                    justify-center bg-black border-1 border-[#ffc400] hover:opacity-70" to={`/own_books/${user?.id}`}>
                    <h2 className="m-auto text-2xl">Власні книги</h2>
                  </Link>
                  <Link className="hover:shadow-[#ffc400] hover:shadow-lg m-auto w-full h-full flex 
                    justify-center bg-black border-1 border-[#ffc400] hover:opacity-70" to={`/friends/${user?.id}`}>
                    <h2 className="m-auto text-2xl">Друзі</h2>
                  </Link>
                </div>
                <div className="h-35 w-full flex justify-between">
                  <Link className="hover:shadow-[#ffc400] hover:shadow-lg m-auto w-full h-full flex 
                    justify-center bg-black border-1 border-[#ffc400] hover:opacity-70" to={`/`}>
                    <h2 className="m-auto text-2xl">Магазин</h2>
                  </Link>
                  <button
                    onClick={logout}
                    className="hover:shadow-[#ffc400] hover:shadow-lg m-auto w-full h-full flex 
                    justify-center bg-[#440000] border-1 border-[#ffc400] hover:opacity-70"
                  >
                    <h2 className="m-auto text-2xl">Вийти</h2>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Книги користувача - показуємо ТІЛЬКИ іншим користувачам, НЕ власнику */}
          {!isOwnProfile && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-[#ffc400] mb-4">
                Книги користувача
              </h2>
              
              {loadingBooks ? (
                <div className="text-center py-10 text-white">Завантаження книг...</div>
              ) : userBooks.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  У користувача ще немає книг
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {userBooks.map((book) => (
                    <Link
                      key={book.id}
                      to={`/book/public/${book.slug}`}
                      className="bg-[#1a1a1a] rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 border border-gray-800 hover:border-[#ffc400]"
                    >
                      <div className="relative w-full aspect-[3/3]">
                        <img
                          src={book.photo_url}
                          alt={book.title}
                          className="absolute top-0 left-0 w-full h-full object-cover"
                        />
                        {book.age_limit > 0 && (
                          <div className="absolute bottom-2 left-2 z-10">
                            <span className="bg-black/50 text-red-800 px-2 py-1 rounded text-xs font-bold">
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
                      <div className="p-2">
                        <h4 className="text-sm font-bold text-white text-center truncate">
                          {book.title}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <Bottom/>
      </PageComponent>
    </>
  );
}