import { useState } from "react";
import PageComponent from "../components/PageComponent";
import Bottom from "./Bottom";
import WindEffect from "../components/WindEffect";
import axiosClient from "../axios";
import { useStateContext } from '../contexts/ContextProvider';
import facebook from "../files_photo/free-icon-facebook-5968764.png";
import twitter from "../files_photo/twitter.png";
import instagram from "../files_photo/instagram.png";
import telegram from "../files_photo/free-icon-telegram-2111646.png";

export default function Contacts() {
  const { currentUser, showToast } = useStateContext();
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      if (showToast) showToast("Введіть повідомлення", "error");
      return;
    }
    
    setSubmitting(true);
    setErrors({});
    
    try {
      await axiosClient.post('/contact', formData);
      if (showToast) showToast("Повідомлення відправлено! Ми відповімо вам найближчим часом.", "success");
      setFormData({
        ...formData,
        message: ''
      });
    } catch (error) {
      console.error("Помилка:", error);
      if (error.response?.status === 422 && error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        if (showToast) showToast("Будь ласка, виправте помилки у формі", "error");
      } else {
        if (showToast) showToast("Не вдалося відправити повідомлення", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <WindEffect />
      <PageComponent title="Контакти">
        <div className="max-w-4xl mx-auto px-4 py-8 bg-black rounded-xl border border-gray-800">
          <p className='text-4xl mb-8 flex justify-center text-white'>Контакти</p>
          
          <div className='text-[#ffc400] sm:flex sm:justify-between block'>
            <div className='sm:w-[47%] bg-[#0c3200] border border-[#ffc400] rounded-xl p-5 w-[100%] mb-8'>
              <p className="flex justify-center font-bold mb-4">Наші номери</p>
              <div className="flex justify-between">
                <p>+380968583454</p>
                <p>+380509231674</p>
              </div>
            </div>
            <div className="w-[6%]"></div>
            <div className='sm:w-[47%] bg-[#0c3200] border border-[#ffc400] rounded-xl p-5 w-[100%] mb-8'>
              <p className="flex justify-center font-bold mb-4">Наша пошта :</p>
              <p className="flex justify-center">site_for_books@gmail.com</p>
            </div>
          </div>

          <div className='text-[#ffc400] bg-[#0c3200] border border-[#ffc400] rounded-xl py-5 px-15 w-[100%] mb-8'>
            <p className="flex justify-center font-bold mb-4">Наші соціальні мережі</p>
            <div className="md:flex justify-center block">
              <div className="flex justify-between">
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="w-[150px] p-5">
                  <img src={facebook} alt="." />
                </a>
                <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="w-[150px] p-5">
                  <img src={twitter} alt="." />
                </a>
              </div>
              <div className="flex justify-between">
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="w-[150px] p-5">
                  <img src={instagram} alt="." />
                </a>
                <a href="https://www.telegram.com" target="_blank" rel="noopener noreferrer" className="w-[150px] p-5">
                  <img src={telegram} alt="." />
                </a>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#ffc400]">
            <h2 className="text-xl font-bold text-[#ffc400] mb-4 text-center">Написати нам</h2>
            <p className="text-gray-400 text-center mb-6">
              Маєте питання або пропозиції? Напишіть нам, і ми відповімо найближчим часом!
            </p>
            
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-white text-sm mb-1">Ім'я *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`w-full p-2 rounded-lg bg-[#2a2a2a] text-white border ${errors.name ? 'border-red-500' : 'border-gray-700'} focus:border-[#ffc400] outline-none`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
                </div>
                <div>
                  <label className="block text-white text-sm mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`w-full p-2 rounded-lg bg-[#2a2a2a] text-white border ${errors.email ? 'border-red-500' : 'border-gray-700'} focus:border-[#ffc400] outline-none`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-white text-sm mb-1">Повідомлення *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder="Опишіть ваше питання або проблему..."
                  className={`w-full p-2 rounded-lg bg-[#2a2a2a] text-white border ${errors.message ? 'border-red-500' : 'border-gray-700'} focus:border-[#ffc400] outline-none resize-none`}
                />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message[0]}</p>}
              </div>
              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-2 rounded-lg font-bold transition ${
                  submitting 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-[#ffc400] text-black hover:bg-[#e6b000]'
                }`}
              >
                {submitting ? "Відправлення..." : "Надіслати"}
              </button>
            </form>
          </div>
        </div>
        <Bottom />
      </PageComponent>
    </>
  );
}