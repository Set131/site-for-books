// components/Comments.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../axios";
import { useStateContext } from "../contexts/ContextProvider";
import Avatar from "./Avatar";

export default function Comments({ bookId }) {
  const { currentUser, showToast } = useStateContext();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [bookId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get(`/books/${bookId}/comments`);
      setComments(data);
    } catch (err) {
      console.error("Помилка завантаження коментарів:", err);
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      showToast("Увійдіть, щоб залишити коментар", "error");
      return;
    }
    if (!newComment.trim()) {
      showToast("Введіть текст коментаря", "error");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await axiosClient.post(`/books/${bookId}/comments`, {
        content: newComment.trim()
      });
      setComments([data, ...comments]);
      setNewComment("");
      showToast("Коментар додано", "success");
    } catch (err) {
      console.error("Помилка додавання коментаря:", err);
      showToast("Не вдалося додати коментар", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId, commentUserId) => {
    if (currentUser?.id !== commentUserId) {
      showToast("Ви не можете видалити цей коментар", "error");
      return;
    }

    if (!window.confirm("Ви впевнені, що хочете видалити цей коментар?")) return;

    try {
      await axiosClient.delete(`/comments/${commentId}`);
      setComments(comments.filter(c => c.id !== commentId));
      showToast("Коментар видалено", "success");
    } catch (err) {
      console.error("Помилка видалення коментаря:", err);
      showToast("Не вдалося видалити коментар", "error");
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

  if (loading) {
    return <div className="text-center py-10 text-white">Завантаження коментарів...</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-[#ffc400] mb-4 border-b border-[#ffc400] pb-2">
        Коментарі ({comments.length})
      </h2>

      <form onSubmit={submitComment} className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={currentUser ? "Напишіть коментар..." : "Увійдіть, щоб залишити коментар"}
          disabled={!currentUser || submitting}
          rows={3}
          className="w-full p-3 rounded-lg bg-[#2a2a2a] text-white border border-gray-700 focus:border-[#ffc400] outline-none resize-none"
        />
        <button
          type="submit"
          disabled={!currentUser || submitting || !newComment.trim()}
          className={`mt-2 px-4 py-2 rounded-lg font-medium transition ${
            !currentUser || submitting || !newComment.trim()
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-[#ffc400] text-black hover:bg-[#e6b000]"
          }`}
        >
          {submitting ? "Відправлення..." : "Залишити коментар"}
        </button>
      </form>

      {comments.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          Ще немає коментарів. Будьте першим!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const canDelete = currentUser?.id === comment.user_id;
            
            return (
              <div key={comment.id} className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800">
                <div className="flex justify-between items-start">
                  {/* 👇 Клікабельний блок автора */}
                  <Link 
                    to={`/profile/${comment.user_id}`}
                    className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer"
                  >
                    <Avatar user={{ name: comment.user.name, avatar_url: comment.user.avatar_url }} size="sm" />
                    <div>
                      <p className="text-white font-medium">{comment.user.name}</p>
                      <p className="text-gray-500 text-xs">{formatDate(comment.created_at)}</p>
                    </div>
                  </Link>
                  {canDelete && (
                    <button
                      onClick={() => deleteComment(comment.id, comment.user_id)}
                      className="text-red-500 hover:text-red-400 transition text-sm"
                    >
                      Видалити
                    </button>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-gray-300">{comment.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}