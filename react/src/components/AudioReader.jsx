import { useState, useEffect, useRef } from 'react';
import removeMd from 'remove-markdown';

export default function AudioReader({ text, title }) {
  const [isOpen, setIsOpen] = useState(false);       // Открыт ли мини-плеер
  const [isPlaying, setIsPlaying] = useState(false); // Играет или на паузе
  const [rate, setRate] = useState(1.0);             // Скорость чтения
  const [paragraphs, setParagraphs] = useState([]);  // Текст, разбитый на абзацы
  const [currentIndex, setCurrentIndex] = useState(0); // Текущий абзац

  const currentIndexRef = useRef(0);
  const rateRef = useRef(1.0);
  const isStoppedRef = useRef(false);

  // Разбиваем текст на абзацы при загрузке главы
  useEffect(() => {
    stopCompletely();
    if (!text) return;
    const clean = removeMd(text);
    const list = clean.split('\n').map((p) => p.trim()).filter((p) => p.length > 0);
    setParagraphs(list);
  }, [text]);

  // Останавливаем звук при уходе со страницы
  useEffect(() => {
    return () => {
      isStoppedRef.current = true;
      window.speechSynthesis.cancel();
    };
  }, []);

  // Функция озвучки конкретного абзаца
  const speakParagraph = (index, list = paragraphs, currentRate = rateRef.current) => {
    if (index < 0 || index >= list.length) {
      setIsPlaying(false);
      return;
    }

    isStoppedRef.current = true;
    window.speechSynthesis.cancel();

    setTimeout(() => {
      isStoppedRef.current = false;
      currentIndexRef.current = index;
      setCurrentIndex(index);

      const utterance = new SpeechSynthesisUtterance(list[index]);
      utterance.lang = 'uk-UA';
      utterance.rate = currentRate;

      utterance.onend = () => {
        if (!isStoppedRef.current) {
          if (index + 1 < list.length) {
            speakParagraph(index + 1, list, rateRef.current);
          } else {
            setIsPlaying(false); // Глава дочитана
          }
        }
      };

      utterance.onerror = () => {
        if (!isStoppedRef.current) setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }, 50);
  };

  // Кнопка в шапке главы
  const handleStartFromTop = () => {
    if (!paragraphs.length) return;
    setIsOpen(true);
    speakParagraph(0);
  };

  // Пауза / Продолжить в мини-плеере
  const togglePlayPause = () => {
    if (isPlaying) {
      isStoppedRef.current = true;
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      speakParagraph(currentIndexRef.current);
    }
  };

  // Переключение абзаца (Назад / Вперед)
  const handlePrev = () => {
    const prev = Math.max(0, currentIndexRef.current - 1);
    speakParagraph(prev);
  };

  const handleNext = () => {
    const next = Math.min(paragraphs.length - 1, currentIndexRef.current + 1);
    speakParagraph(next);
  };

  // Смена скорости на лету
  const handleRateChange = (newRate) => {
    setRate(newRate);
    rateRef.current = newRate;
    if (isPlaying) {
      speakParagraph(currentIndexRef.current, paragraphs, newRate);
    }
  };

  // Полное закрытие плеера
  const stopCompletely = () => {
    isStoppedRef.current = true;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsOpen(false);
    setCurrentIndex(0);
    currentIndexRef.current = 0;
  };

  const progressPercent = paragraphs.length > 0 
    ? Math.round(((currentIndex + 1) / paragraphs.length) * 100) 
    : 0;

  return (
    <>
      {/* Кнопка запуска вверху страницы */}
      <button
        onClick={handleStartFromTop}
        className="bg-[#0c3200] text-[#ffc400] hover:bg-[#ffc400] hover:text-black border border-[#ffc400] rounded-sm p-2 flex items-center gap-1 font-bold transition cursor-pointer"
      >
        🔊 Прослухати
      </button>

      {/* Всплывающий мини-плеер */}
      {isOpen && (
        <div
          className="
            fixed z-50 bottom-5 right-5 w-80
            max-[750px]:left-4 max-[750px]:right-4 max-[750px]:bottom-22 max-[750px]:w-auto max-[750px]:mx-auto
            bg-[#0c3200] text-white border-2 border-[#ffc400] rounded-md shadow-2xl p-4
          "
        >
          {/* Полоска прогресса сверху */}
          <div className="w-full bg-black/50 h-1.5 rounded-full mb-3 overflow-hidden">
            <div
              className="bg-[#ffc400] h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Шапка мини-плеера: название и кнопка закрыть */}
          <div className="flex justify-between items-start gap-2 mb-3">
            <div className="overflow-hidden">
              <p className="text-xs text-[#ffc400] font-semibold">
                Абзац {currentIndex + 1} з {paragraphs.length}
              </p>
              <p className="text-sm font-bold truncate">
                {title || 'Озвучення розділу'}
              </p>
            </div>
            <button
              onClick={stopCompletely}
              className="text-gray-300 hover:text-[#ffc400] font-bold text-lg leading-none cursor-pointer px-1"
              title="Закрити плеєр"
            >
              ✕
            </button>
          </div>

          {/* Кнопки управления: Назад | Пауза/Старт | Вперед */}
          <div className="flex items-center justify-center gap-4 mb-3">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-3 py-1.5 bg-black/40 hover:bg-[#ffc400] hover:text-black disabled:opacity-40 rounded text-sm font-bold transition cursor-pointer"
              title="Попередній абзац"
            >
              ⏮
            </button>

            <button
              onClick={togglePlayPause}
              className="px-5 py-2 bg-[#ffc400] text-black hover:bg-white rounded font-bold text-base transition cursor-pointer"
            >
              {isPlaying ? '⏸ Пауза' : '▶ Далі'}
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex >= paragraphs.length - 1}
              className="px-3 py-1.5 bg-black/40 hover:bg-[#ffc400] hover:text-black disabled:opacity-40 rounded text-sm font-bold transition cursor-pointer"
              title="Наступний абзац"
            >
              ⏭
            </button>
          </div>

          {/* Переключатель скорости */}
          <div className="flex items-center justify-between pt-2 border-t border-[#ffc400]/30 text-xs">
            <span className="text-gray-300">Швидкість:</span>
            <div className="flex gap-1">
              {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleRateChange(speed)}
                  className={`px-2 py-1 rounded font-bold transition cursor-pointer ${
                    rate === speed
                      ? 'bg-[#ffc400] text-black'
                      : 'bg-black/40 text-gray-300 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
