import { Link, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axiosClient from "../axios";
import PageComponent from "../components/PageComponent";
import Bottom from "./Bottom";
import { useStateContext } from '../contexts/ContextProvider';
import WindEffect from "../components/WindEffect";

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
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  const [friendStatus, setFriendStatus] = useState(null);
  const [friendLoading, setFriendLoading] = useState(false);
  
  const fileInputRef = useRef(null);

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
      case 'none': return 'Додати в друзі';
      case 'sent': return 'Запит надіслано';
      case 'received': return 'Прийняти запит';
      case 'friend': return 'В друзях';
      default: return 'Додати в друзі';
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

  // Функція для вибору фото - одразу відкриває діалог вибору файлу
  const handleAvatarClick = () => {
    if (isOwnProfile && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result);
        setAvatarFile(file);
        // Відразу зберігаємо фото після вибору
        saveAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveAvatar = async (imageData) => {
    if (!imageData) return;
    
    setUploadingAvatar(true);
    try {
      const { data } = await axiosClient.put(`/profile/${id}`, {
        avatar: imageData
      });
      setUser(data);
      setAvatarPreview(null);
      setAvatarFile(null);
      setIsHovering(false);
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

  // Отримуємо першу літеру імені
  const getFirstLetter = () => {
    if (!user?.name) return "?";
    return user.name.charAt(0).toUpperCase();
  };

  return (
    <>
      <WindEffect />
      <PageComponent title={user ? `Профіль: ${user.name}` : "Профіль"}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Прихований input для вибору файлу */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          
          <div 
            className="relative rounded-lg overflow-hidden"
            style={{
              backgroundImage: user?.avatar_url ? `url(${user.avatar_url})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            
            <div className="relative z-10 bg-black/40 text-white shadow-md overflow-hidden">
              <div className="w-full p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
                  
                  {/* Фото - при натисканні відкривається вибір файлу */}
                  <div className="flex flex-col items-center md:items-start flex-shrink-0">
                    <div 
                      className="relative group cursor-pointer"
                      onMouseEnter={() => isOwnProfile && setIsHovering(true)}
                      onMouseLeave={() => isOwnProfile && setIsHovering(false)}
                      onClick={handleAvatarClick}
                    >
                      {user?.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.name}
                          className="w-48 h-48 md:w-56 md:h-56 rounded-full border-4 border-[#ffc400] object-cover transition-all duration-300 group-hover:brightness-75"
                        />
                      ) : (
                        <div className="w-48 h-48 md:w-56 md:h-56 rounded-full border-4 border-[#ffc400] bg-[#ffc400] flex items-center justify-center transition-all duration-300 group-hover:brightness-75">
                          <span className="text-black text-7xl font-bold">
                            {getFirstLetter()}
                          </span>
                        </div>
                      )}
                      
                      {isOwnProfile && (
                        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="text-white text-sm font-medium bg-black/70 px-3 py-1 rounded-full">
                            Змінити фото
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {uploadingAvatar && (
                      <div className="mt-2 text-center">
                        <p className="text-[#ffc400] text-sm">Збереження...</p>
                      </div>
                    )}
                  </div>

                  {/* Інформація про користувача */}
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{user?.name || "Завантаження..."}</h1>
                    
                    {!isOwnProfile && currentUser && (
                      <button
                        onClick={handleFriendAction}
                        disabled={friendLoading}
                        className={`mb-4 px-4 py-1 rounded text-sm font-medium transition ${
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
                    
                    <div className="space-y-2 mt-2">
                      <p><strong>Email:</strong> {user?.email || "Завантаження..."}</p>
                      <p><strong>Дата створення:</strong> {user?.created_at || "Завантаження..."}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <strong>Телефон:</strong>
                        {editMode ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[#ffc400]">+380</span>
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
                              className="border rounded px-3 py-1 w-32 bg-black/50 text-white border-[#ffc400]"
                              placeholder="XX XXX XX XX"
                              maxLength={9}
                            />
                            <button
                              onClick={handleSave}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Зберегти
                            </button>
                            <button
                              onClick={() => {
                                setEditMode(false);
                                setPhoneInput(user?.phone ? user.phone.replace("+380", "") : "");
                                setPhoneError("");
                              }}
                              className="bg-gray-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Скасувати
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span>{user?.phone ? formatPhoneForDisplay(user.phone) : "Не вказано"}</span>
                            {isOwnProfile && (
                              <button
                                onClick={() => setEditMode(true)}
                                className="text-sm bg-[#ffc400] text-black hover:bg-[#e6b000] px-3 py-1 rounded font-bold"
                              >
                                {user?.phone ? "Змінити" : "Додати"}
                              </button>
                            )}
                          </div>
                        )}
                        {phoneError && <p className="text-red-500 text-xs">{phoneError}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <br />
              
              {isOwnProfile && (
                <div className="block sm:flex text-white border-t border-gray-800">
                  <div className="w-full sm:flex justify-between block">
                    <div className="flex justify-between h-35 sm:w-2/3 w-full">
                      <Link className="hover:shadow-[#ffc400] hover:shadow-lg m-auto w-full h-full flex 
                        justify-center bg-black border-1 border-[#ffc400] hover:opacity-70" to={`/own_books/${user?.id}`}>
                        <h2 className="m-auto text-2xl">Власні книги</h2>
                      </Link>
                      <Link className="hover:shadow-[#ffc400] hover:shadow-lg m-auto w-full h-full flex 
                        justify-center bg-black border-1 border-[#ffc400] hover:opacity-70" to={`/friends/${user?.id}`}>
                        <h2 className="m-auto text-2xl">Друзі</h2>
                      </Link>
                    </div>
                    <button
                      onClick={logout}
                      className="hover:shadow-[#ffc400] hover:shadow-lg m-auto sm:w-1/3 w-full sm:h-full flex 
                      justify-center bg-[#440000] border-1 border-[#ffc400] hover:opacity-70 h-35"
                    >
                      <h2 className="m-auto text-2xl">Вийти</h2>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

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