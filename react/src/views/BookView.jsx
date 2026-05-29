// src/pages/BookView.jsx
import { useState, useEffect } from "react";
import TButton from "../components/core/TButton";
import PageComponent from "../components/PageComponent";
import axiosClient from "../axios.js";
import { useNavigate, useParams } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider.jsx";
import WindEffect from "../components/WindEffect";
import Bottom from "./Bottom";
import TagManager from "../components/TagManager";

export default function BookView() {
  const { showToast, currentUser } = useStateContext();
  const navigate = useNavigate();
  const { id } = useParams();

  const [book, setBook] = useState({
    title: "",
    description: "",
    photo: null,
    photo_url: null,
    age_limit: 0,
    tags: [],
  });

  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  
  const onPhotoChoose = (ev) => {
    const file = ev.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setBook({
        ...book,
        photo: file,
        photo_url: reader.result,
      });
      ev.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (ev) => {
    ev.preventDefault();
    setValidationErrors({});
    setError("");

    const payload = {
      title: book.title,
      description: book.description,
      age_limit: parseInt(book.age_limit),
      tags: book.tags.join(","),
    };

    if (currentUser?.id) {
      payload.user_id = currentUser.id;
    }

    if (book.photo_url && !id) {
      payload.photo = book.photo_url;
    } else if (book.photo_url && id && book.photo) {
      payload.photo = book.photo_url;
    }

    let res = null;
    if (id) {
      res = axiosClient.put(`/book/${id}`, payload);
    } else {
      res = axiosClient.post("/book", payload);
    }

    res
      .then(() => {
        navigate("/catalog");
        showToast(id ? "Книгу оновлено" : "Книгу створено");
      })
      .catch((err) => {
        if (err && err.response) {
          if (err.response.data.errors) {
            setValidationErrors(err.response.data.errors);
            showToast("Будь ласка, виправте помилки у формі", "error");
          } else {
            setError(err.response.data.message || "Сталася помилка");
          }
        }
        console.log(err);
      });
  };

  useEffect(() => {
    if (id) {
      axiosClient.get(`/book/${id}`).then(({ data }) => {
        const bookData = data.data;
        setBook({
          title: bookData.title || "",
          description: bookData.description || "",
          photo_url: bookData.photo_url,
          age_limit: bookData.age_limit || 0,
          tags: bookData.tags ? bookData.tags.split(",") : [],
        });
      });
    }
  }, [id]);

  return (
    <>
      <WindEffect />
      <PageComponent title={!id ? "Додати нову книгу" : "Редагувати книгу"} buttons="">
        <form onSubmit={onSubmit}>
          <div className="shadow sm:overflow-hidden sm:rounded-md bg-[#2a2a2a]" style={{ margin: "0 5%" }}>
            <div className="space-y-6 px-4 py-5 sm:p-6" style={{ padding: "5%" }}>
              {error && (
                <div className="bg-red-500 text-white py-3 px-3 rounded mb-4">{error}</div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#ffc400]">
                  Обкладинка
                </label>
                <div className="mt-1 flex items-center">
                  {book.photo_url ? (
                    <img
                      src={book.photo_url}
                      alt=""
                      className="w-32 h-32 object-cover rounded border border-[#ffc400]"
                    />
                  ) : (
                    <span className="border border-[#ffc400] flex justify-center items-center text-gray-400 h-32 w-32 overflow-hidden rounded bg-[#0c3200]">
                      <h1>Немає фото</h1>
                    </span>
                  )}
                  <button
                    type="button"
                    className="relative ml-5 rounded-md bg-[#ffc400] py-2 px-3 text-sm font-medium text-[#0c3200] shadow-sm"
                  >
                    <input
                      type="file"
                      className="absolute left-0 top-0 right-0 bottom-0 opacity-0 cursor-pointer"
                      onChange={onPhotoChoose}
                    />
                    Змінити
                  </button>
                </div>
                {validationErrors.photo && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.photo[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#ffc400]">
                  Назва книги <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={book.title}
                  onChange={(ev) => setBook({ ...book, title: ev.target.value })}
                  placeholder="Назва книги"
                  className="mt-1 block w-full rounded-md border border-[#ffc400] shadow-sm sm:text-sm p-2 bg-black text-white"
                />
                {validationErrors.title && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.title[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#ffc400]">
                  Вікове обмеження
                </label>
                <select
                  value={book.age_limit}
                  onChange={(ev) => setBook({ ...book, age_limit: parseInt(ev.target.value) })}
                  className="mt-1 block rounded-md shadow-sm sm:text-sm p-2 text-[#ffc400] border border-[#ffc400] bg-[#0c3200]"
                >
                  <option value={0}>0+ (без обмежень)</option>
                  <option value={6}>6+</option>
                  <option value={12}>12+</option>
                  <option value={16}>16+</option>
                  <option value={18}>18+</option>
                </select>
              </div>

              <TagManager 
                selectedTags={book.tags}
                onTagsChange={(newTags) => setBook({ ...book, tags: newTags })}
              />
                
              <div>
                <label className="block text-sm font-medium text-[#ffc400]">
                  Опис
                </label>
                <textarea
                  rows="10"
                  value={book.description || ""}
                  onChange={(ev) => setBook({ ...book, description: ev.target.value })}
                  placeholder="Опишіть книгу"
                  className="mt-1 block w-full rounded-md border border-[#ffc400] shadow-sm sm:text-sm p-2 bg-black text-white"
                />
              </div>
            </div>
            <div className="bg-[#2a2a2a] px-4 py-3 text-right sm:px-6 flex justify-end mx-7 font-medium">
              <TButton>Зберегти</TButton>
            </div>
          </div>
        </form>
        <Bottom />
      </PageComponent>
    </>
  );
}