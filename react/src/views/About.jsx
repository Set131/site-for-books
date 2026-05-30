import { useState } from "react";
import PageComponent from '../components/PageComponent';
import logo from '../files_photo/logo.png';
import Bottom from "./Bottom";
import WindEffect from "../components/WindEffect";
import { Link } from "react-router-dom";

export default function About() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "Як додати книгу в бібліотеку?",
      answer: "Перейдіть на сторінку книги, яка вам сподобалася, і натисніть кнопку «Додати в бібліотеку» під фото книги. Книга автоматично збережеться у вашій персональній бібліотеці."
    },
    {
      question: "Як створити власну книгу?",
      answer: "Перейдіть у розділ «Мої книги» (доступний у вашому профілі) та натисніть кнопку «+ Додати книгу». Заповніть інформацію про книгу (назва, опис, обкладинка, теги, вікове обмеження). Після створення книги ви зможете додавати розділи."
    },
    {
      question: "Як додати розділи до своєї книги?",
      answer: "Після створення книги перейдіть на її сторінку. В розділі «Зміст» натисніть «+ Додати розділ». Вкажіть номер розділу, назву (необов'язково) та текст у форматі Markdown. Розділи автоматично впорядковуються за номером."
    },
    {
      question: "Що таке Markdown і як його використовувати?",
      answer: "Markdown — це проста мова розмітки для форматування тексту. Ви можете використовувати: # Заголовок, **жирний текст**, *курсив*, [посилання](url), - список, 1. нумерований список, ```код```, > цитата. Текст автоматично конвертується в HTML при збереженні."
    },
    {
      question: "Як оцінити книгу?",
      answer: "На сторінці книги натисніть кнопку «Оцінити книгу» під фото. Оберіть оцінку від 1 до 10. Ви можете змінити свою оцінку в будь-який момент. Середня оцінка книги розраховується автоматично з усіх оцінок користувачів."
    },
    {
      question: "Як додати друга?",
      answer: "Перейдіть на профіль користувача, якого хочете додати в друзі, та натисніть кнопку «Додати в друзі». Користувач отримає запит. Після підтвердження ви станете друзями."
    },
    {
      question: "Де я можу побачити своїх друзів?",
      answer: "У вашому профілі натисніть на кнопку «Друзі». Там ви побачите список ваших друзів, а також запити в друзі, які очікують на підтвердження."
    },
    {
      question: "Як отримувати сповіщення про нові розділи?",
      answer: "Додайте книгу в бібліотеку. Коли автор додасть новий розділ до цієї книги, ви отримаєте сповіщення на сторінці «Повідомлення»."
    },
    {
      question: "Чи можна видалити коментар?",
      answer: "Так, ви можете видалити лише свої коментарі. Для цього натисніть кнопку «Видалити» поруч із вашим коментарем. Автор книги також може видаляти коментарі під своєю книгою."
    },
    {
      question: "Як змінити фото профілю?",
      answer: "Перейдіть у свій профіль, натисніть «Змінити фото» під аватаром, виберіть нове зображення та збережіть. Фото буде автоматично обрізане до квадрата."
    },
    {
      question: "Як змінити номер телефону?",
      answer: "У вашому профілі натисніть кнопку «Змінити» поруч із полем телефону. Введіть 9 цифр номера без коду країни (формат: XX XXX XX XX). Після збереження номер відображатиметься у форматі +380 (XX) XXX-XX-XX."
    }
  ];

  return (
    <>
      <WindEffect />
      <PageComponent title="Про сайт" buttons="">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Герой-секція */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
            <div className="md:w-1/2 flex justify-center">
              <img src={logo} alt="Logo" className="w-48 md:w-64 p-2" />
            </div>
            <div className="md:w-1/2 text-white">
              <h1 className="text-4xl font-bold text-[#ffc400] mb-4 text-center md:text-left">Про сайт</h1>
              <p className="text-gray-300 leading-relaxed text-center md:text-left">
                Ласкаво просимо на наш сайт — простір для читачів та авторів книг!
              </p>
              <p className="text-gray-300 leading-relaxed mt-4 text-center md:text-left">
                Тут ви можете читати книги онлайн, додавати їх у бібліотеку, 
                отримувати сповіщення про нові розділи, спілкуватися з іншими 
                читачами через коментарі та додавати друзів. Автори можуть публікувати 
                власні книги та розділи, використовуючи зручний Markdown редактор.
              </p>
            </div>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 text-center">
            <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800">
              <div className="text-3xl font-bold text-[#ffc400]">∞</div>
              <div className="text-white text-sm mt-1">Книг у каталозі</div>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800">
              <div className="text-3xl font-bold text-[#ffc400]">100+</div>
              <div className="text-white text-sm mt-1">Активних авторів</div>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800">
              <div className="text-3xl font-bold text-[#ffc400]">1000+</div>
              <div className="text-white text-sm mt-1">Щоденних читачів</div>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800">
              <div className="text-3xl font-bold text-[#ffc400]">24/7</div>
              <div className="text-white text-sm mt-1">Доступ до книг</div>
            </div>
          </div>

          {/* Секція "Як це працює" */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[#ffc400] mb-6 text-center">Як це працює?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#1a1a1a] rounded-lg p-6 text-center border border-gray-800 hover:border-[#ffc400] transition">
                <h3 className="text-white font-bold text-lg mb-2">Читайте</h3>
                <p className="text-gray-400 text-sm">Переглядайте книги та читайте розділи онлайн</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-6 text-center border border-gray-800 hover:border-[#ffc400] transition">
                <h3 className="text-white font-bold text-lg mb-2">Пишіть</h3>
                <p className="text-gray-400 text-sm">Створюйте власні книги та додавайте розділи</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-6 text-center border border-gray-800 hover:border-[#ffc400] transition">
                <h3 className="text-white font-bold text-lg mb-2">Спілкуйтесь</h3>
                <p className="text-gray-400 text-sm">Коментуйте, оцінюйте та додавайте друзів</p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#ffc400] mb-6 text-center">Можливі питання</h2>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-[#1a1a1a] rounded-lg border border-gray-800 overflow-hidden">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-5 py-4 text-left flex justify-between items-center hover:bg-[#252525] transition"
                  >
                    <span className="text-white font-medium">{faq.question}</span>
                    <span className="text-[#ffc400] text-xl">
                      {openFaq === index ? "−" : "+"}
                    </span>
                  </button>
                  {openFaq === index && (
                    <div className="px-5 pb-4">
                      <p className="text-gray-400 text-sm leading-relaxed pt-6">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <Bottom />
      </PageComponent>
    </>
  );
}