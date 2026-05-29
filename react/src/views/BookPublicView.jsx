import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosClient from "../axios";
import PageComponent from "../components/PageComponent";
import { useStateContext } from "../contexts/ContextProvider";
import WindEffect from "../components/WindEffect";
import Bottom from "./Bottom";
import BookInfo from "../components/BookInfo";
import ChaptersList from "../components/ChaptersList";
import ChapterForm from "../components/ChapterForm";
import Comments from "../components/Comments"; // 👈 Додаємо імпорт

export default function BookPublicView() {
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);
  const [deleted, setDeleted] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [chapterForm, setChapterForm] = useState({ title: "", content_markdown: "", chapter_number: "" });
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { slug } = useParams();
  const { currentUser, showToast } = useStateContext();
  const navigate = useNavigate();

  useEffect(() => {
    axiosClient
      .get(`/book/get-by-slug/${slug}`)
      .then(({ data }) => {
        setBook(data.data);
        if (data.data.id) {
          loadChapters(data.data.id);
        }
      })
      .catch((err) => {
        setError("Не вдалося завантажити книгу");
        console.error(err);
      });
  }, [slug]);

  const loadChapters = async (bookId) => {
    setLoadingChapters(true);
    try {
      const { data } = await axiosClient.get(`/books/${bookId}/chapters`);
      setChapters(data);
    } catch (err) {
      console.error("Помилка завантаження розділів:", err);
    } finally {
      setLoadingChapters(false);
    }
  };

  const openAddChapterForm = () => {
    setEditingChapter(null);
    const maxNumber = chapters.length > 0 
      ? Math.max(...chapters.map(c => c.chapter_number)) 
      : 0;
    setChapterForm({ 
      title: "", 
      content_markdown: "", 
      chapter_number: maxNumber + 1 
    });
    setShowChapterForm(true);
  };

  const openEditChapterForm = async (chapter) => {
    try {
      const { data } = await axiosClient.get(`/books/${book.id}/chapters/${chapter.chapter_number}`);
      setEditingChapter(data);
      setChapterForm({
        title: data.title || "",
        content_markdown: data.content_markdown || "",
        chapter_number: data.chapter_number
      });
      setShowChapterForm(true);
    } catch (err) {
      console.error("Помилка завантаження розділу:", err);
      showToast("Не вдалося завантажити розділ", "error");
    }
  };

  const closeChapterForm = () => {
    setShowChapterForm(false);
    setEditingChapter(null);
    setChapterForm({ title: "", content_markdown: "", chapter_number: "" });
  };

  const saveChapter = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    
    try {
      if (editingChapter) {
        await axiosClient.put(`/books/${book.id}/chapters/${editingChapter.chapter_number}`, {
          title: chapterForm.title,
          content_markdown: chapterForm.content_markdown
        });
        showToast("Розділ оновлено", "success");
      } else {
        await axiosClient.post(`/books/${book.id}/chapters`, {
          chapter_number: parseInt(chapterForm.chapter_number),
          title: chapterForm.title,
          content_markdown: chapterForm.content_markdown
        });
        showToast("Розділ створено", "success");
      }
      
      setShowChapterForm(false);
      setEditingChapter(null);
      await loadChapters(book.id);
      
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Помилка збереження розділу";
      showToast(errorMessage, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteChapter = async (chapterNumber) => {
    if (window.confirm("Ви впевнені, що хочете видалити цей розділ?")) {
      try {
        await axiosClient.delete(`/books/${book.id}/chapters/${chapterNumber}`);
        showToast("Розділ видалено", "success");
        await loadChapters(book.id);
      } catch (err) {
        showToast("Помилка видалення розділу", "error");
      }
    }
  };

  const onDeleteBookClick = () => {
    if (book) {
      axiosClient.delete(`/book/${book.id}`)
        .then(() => {
          setDeleted(true);
          setTimeout(() => navigate("/catalog"), 2000);
        })
        .catch(() => setError("Не вдалося видалити книгу"));
    }
  };

  const renderRating = (rating) => {
    const ratingValue = rating || 0;
    return (
      <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg">
        <span className="text-[#ffc400] text-2xl">★</span>
        <span className="text-white text-lg font-medium">{ratingValue.toFixed(1)}</span>
      </div>
    );
  };

  if (error) {
    return (
      <>
        <WindEffect />
        <PageComponent title="Книга" buttons="">
          <div className="text-red-500 text-center py-10">{error}</div>
          <Bottom />
        </PageComponent>
      </>
    );
  }

  if (deleted) {
    return (
      <>
        <WindEffect />
        <PageComponent title="Книга" buttons="">
          <div className="text-[#ffc400] justify-center flex font-bold mb-60 flex-col items-center">
            <p className="p-4">Книга успішно видалена!</p>
            <Link to="/catalog" className="p-4 text-black bg-[#ffc400] mt-20 rounded-xl">
              Повернутись до каталогу
            </Link>
          </div>
          <Bottom />
        </PageComponent>
      </>
    );
  }

  if (!book) {
    return (
      <>
        <WindEffect />
        <PageComponent title="Книга" buttons="">
          <div className="text-center py-10 text-white">Завантаження...</div>
          <Bottom />
        </PageComponent>
      </>
    );
  }

  const isAuthor = currentUser?.id == book.user_id;

  return (
    <>
      <WindEffect />
      <PageComponent title={book.title} buttons="">
        <div className="flex text-white justify-center w-full flex-col lg:flex-row px-4">
          
          <BookInfo 
            book={book}
            isAuthor={isAuthor}
            onDeleteBookClick={onDeleteBookClick}
            renderRating={renderRating}
          />

          <div className="lg:w-[75%] w-full mt-4 lg:mt-0">
            <h1 className="text-3xl mb-3 font-bold text-center lg:text-left sm:block hidden">{book.title}</h1>
            <div className="mt-4 p-4 border-2 border-[#cc9d00] rounded-2xl bg-[#2a2a2a]">
              <p className="whitespace-pre-wrap">{book.description}</p>
              
              {book.tags && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {book.tags.split(',').map((tag, index) => (
                      <span key={index} className="bg-[#ffc400] text-black px-2 py-1 rounded-lg text-sm font-medium">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8">
              <div className="flex justify-between items-center mb-4 border-b border-[#ffc400] pb-2">
                <h2 className="text-2xl font-bold text-[#ffc400]">Зміст</h2>
                {isAuthor && (
                  <button
                    onClick={openAddChapterForm}
                    className="bg-[#ffc400] text-black px-4 py-2 rounded-lg font-medium hover:bg-[#e6b000] transition"
                  >
                    + Додати розділ
                  </button>
                )}
              </div>

              <ChaptersList
                chapters={chapters}
                loadingChapters={loadingChapters}
                isAuthor={isAuthor}
                bookSlug={book.slug}
                onEditChapter={openEditChapterForm}
                onDeleteChapter={deleteChapter}
              />
            </div>
            
            {/* 👇 ВИКОРИСТОВУЄМО КОМПОНЕНТ КОМЕНТАРІВ */}
            <Comments bookId={book.id} isAuthor={book.user_id} />
          </div>
        </div>

        {showChapterForm && isAuthor && (
          <ChapterForm
            editingChapter={editingChapter}
            chapterForm={chapterForm}
            setChapterForm={setChapterForm}
            onSave={saveChapter}
            onClose={closeChapterForm}
            isSaving={isSaving}
          />
        )}

        <Bottom />
      </PageComponent>
    </>
  );
}