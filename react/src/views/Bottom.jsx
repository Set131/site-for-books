import { useStateContext } from '../contexts/ContextProvider'
import { Link, NavLink } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Bottom() {
  const { currentUser } = useStateContext();
  const [isVisible, setIsVisible] = useState(true);
  const [isPermanent, setIsPermanent] = useState(false);
  const hideTimeoutRef = useRef(null);
  const lastScrollY = useRef(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // Функция для показа панели
  const showBottomNav = () => {
    setIsVisible(true);
    
    // Сбрасываем таймер
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    // Устанавливаем таймер на скрытие через 5 секунд
    if (!isPermanent) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    }
  };

  // Функция для скрытия панели
  const hideBottomNav = () => {
    if (!isPermanent) {
      setIsVisible(false);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    }
  };

  // Обработчик скролла
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Показываем панель при скролле
      if (Math.abs(currentScrollY - lastScrollY.current) > 5) {
        showBottomNav();
        
        // Таймер для определения окончания скролла
        if (isScrolling) {
          clearTimeout(window.scrollTimeout);
        }
        setIsScrolling(true);
        
        window.scrollTimeout = setTimeout(() => {
          setIsScrolling(false);
          // Скрываем через 5 секунд после остановки скролла
          if (!isPermanent) {
            hideTimeoutRef.current = setTimeout(() => {
              setIsVisible(false);
            }, 5000);
          }
        }, 150);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isPermanent, isScrolling]);

  // Обработчик кликов по экрану
  useEffect(() => {
    const handleScreenClick = (e) => {
      // Проверяем, что клик не по навигационной панели
      const bottomNav = document.getElementById('bottom-nav');
      if (bottomNav && !bottomNav.contains(e.target)) {
        showBottomNav();
      }
    };

    window.addEventListener('click', handleScreenClick);
    return () => window.removeEventListener('click', handleScreenClick);
  }, [isPermanent]);

  // Обработчик касаний для мобильных
  useEffect(() => {
    const handleTouch = () => {
      showBottomNav();
    };

    window.addEventListener('touchstart', handleTouch);
    return () => window.removeEventListener('touchstart', handleTouch);
  }, [isPermanent]);

  // Показываем панель при загрузке страницы
  useEffect(() => {
    showBottomNav();
    
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Обработчик наведения мыши (для десктопа)
  useEffect(() => {
    const handleMouseMove = () => {
      showBottomNav();
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isPermanent]);

  // Функция для временной фиксации панели при клике на кнопку
  const handleNavClick = () => {
    setIsPermanent(true);
    setIsVisible(true);
    
    // Через 10 секунд возвращаем автоматический режим
    setTimeout(() => {
      setIsPermanent(false);
      // Скрываем через 5 секунд после возврата в автоматический режим
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    }, 10000);
  };

  if (!currentUser?.id) return null;

  return (
    <div 
      id="bottom-nav"
      className={`fixed bottom-0 left-0 right-0 md:hidden bg-black text-white m-2 rounded-xl opacity-80 transition-all duration-300 z-50
        ${isVisible ? 'translate-y-0' : 'translate-y-[calc(100%+8px)]'}`}
    >
      <div className="flex justify-between h-14">
        <NavLink 
          onClick={handleNavClick}
          className={({isActive}) => classNames(
            isActive ? 'border-[#ffc400] border-4 rounded-xl m-auto p-3 bg-orange-900 text-[#ffc400] font-medium' : 
            'm-auto py-3 px-4 font-medium'
          )} 
          to={`/profile/${currentUser.id}`}
        >
          Профіль
        </NavLink>
        
        <NavLink 
          onClick={handleNavClick}
          className={({isActive}) => classNames(
            isActive ? 'border-[#ffc400] border-4 rounded-xl m-auto p-3 bg-orange-900 text-[#ffc400] font-medium' : 
            'm-auto py-3 px-4 font-medium'
          )} 
          to={`/library/${currentUser.id}`}
        >
          Бібліотека
        </NavLink>
        
        <NavLink 
          onClick={handleNavClick}
          className={({isActive}) => classNames(
            isActive ? 'border-[#ffc400] border-4 rounded-xl m-auto p-3 bg-orange-900 text-[#ffc400] font-medium' : 
            'm-auto py-3 px-4 font-medium'
          )} 
          to={`/notifications/${currentUser.id}`}
        >
          Повідомлення
        </NavLink>
      </div>
    </div>
  );
}