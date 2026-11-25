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
      question: "How to add a book to the library?",
      answer: "Go to the page of the book you like and click the 'Add to Library' button under the book photo. The book will be automatically saved to your personal library."
    },
    {
      question: "How to create your own book?",
      answer: "Go to the 'My Books' section (available in your profile) and click the '+ Add Book' button. Fill in the book information (title, description, cover, tags, age restriction). After creating the book, you will be able to add chapters."
    },
    {
      question: "How to add chapters to your book?",
      answer: "After creating the book, go to its page. In the 'Table of Contents' section, click '+ Add Chapter'. Specify the chapter number, title (optional), and text in Markdown format. Chapters are automatically ordered by number."
    },
    {
      question: "What is Markdown and how to use it?",
      answer: "Markdown is a simple markup language for text formatting. You can use: # Heading, **bold text**, *italic*, [link](url), - list, 1. numbered list, ```code```, > quote. The text is automatically converted to HTML when saved."
    },
    {
      question: "How to rate a book?",
      answer: "On the book page, click the 'Rate Book' button under the photo. Choose a rating from 1 to 10. You can change your rating at any time. The average book rating is automatically calculated from all user ratings."
    },
    {
      question: "How to add a friend?",
      answer: "Go to the profile of the user you want to add as a friend and click the 'Add Friend' button. The user will receive a request. After confirmation, you will become friends."
    },
    {
      question: "Where can I see my friends?",
      answer: "In your profile, click the 'Friends' button. There you will see a list of your friends, as well as pending friend requests awaiting confirmation."
    },
    {
      question: "How to receive notifications about new chapters?",
      answer: "Add the book to your library. When the author adds a new chapter to this book, you will receive a notification on the 'Messages' page."
    },
    {
      question: "Can I delete a comment?",
      answer: "Yes, you can only delete your own comments. To do this, click the 'Delete' button next to your comment. The book author can also delete comments under their book."
    },
    {
      question: "How to change profile photo?",
      answer: "Go to your profile, click 'Change Photo' under the avatar, select a new image and save. The photo will be automatically cropped to a square."
    },
    {
      question: "How to change phone number?",
      answer: "In your profile, click the 'Change' button next to the phone field. Enter 9 digits of the number without the country code (format: XX XXX XX XX). After saving, the number will be displayed in the format +380 (XX) XXX-XX-XX."
    }
  ];

  return (
    <>
      <WindEffect />
      <PageComponent title="About" buttons="">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Hero section */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
            <div className="md:w-1/2 flex justify-center">
              <img src={logo} alt="Logo" className="w-48 md:w-64 p-2" />
            </div>
            <div className="md:w-1/2 text-white">
              <h1 className="text-4xl font-bold text-[#ffc400] mb-4 text-center md:text-left">About</h1>
              <p className="text-gray-300 leading-relaxed text-center md:text-left">
                Welcome to our website — a space for readers and authors of books!
              </p>
              <p className="text-gray-300 leading-relaxed mt-4 text-center md:text-left">
                Here you can read books online, add them to your library, 
                receive notifications about new chapters, interact with other 
                readers through comments, and add friends. Authors can publish 
                their own books and chapters using a convenient Markdown editor.
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 text-center">
            <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800">
              <div className="text-3xl font-bold text-[#ffc400]">∞</div>
              <div className="text-white text-sm mt-1">Books in catalog</div>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800">
              <div className="text-3xl font-bold text-[#ffc400]">100+</div>
              <div className="text-white text-sm mt-1">Active authors</div>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800">
              <div className="text-3xl font-bold text-[#ffc400]">1000+</div>
              <div className="text-white text-sm mt-1">Daily readers</div>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800">
              <div className="text-3xl font-bold text-[#ffc400]">24/7</div>
              <div className="text-white text-sm mt-1">Access to books</div>
            </div>
          </div>

          {/* "How it works" section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[#ffc400] mb-6 text-center">How it works?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#1a1a1a] rounded-lg p-6 text-center border border-gray-800 hover:border-[#ffc400] transition">
                <h3 className="text-white font-bold text-lg mb-2">Read</h3>
                <p className="text-gray-400 text-sm">Browse books and read chapters online</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-6 text-center border border-gray-800 hover:border-[#ffc400] transition">
                <h3 className="text-white font-bold text-lg mb-2">Write</h3>
                <p className="text-gray-400 text-sm">Create your own books and add chapters</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-6 text-center border border-gray-800 hover:border-[#ffc400] transition">
                <h3 className="text-white font-bold text-lg mb-2">Connect</h3>
                <p className="text-gray-400 text-sm">Comment, rate, and add friends</p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#ffc400] mb-6 text-center">Frequently Asked Questions</h2>
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