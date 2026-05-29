import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { Link, Navigate, NavLink, Outlet } from 'react-router-dom'
import { useStateContext } from '../contexts/ContextProvider'
import axiosClient from '../axios'
import logo from '../files_photo/logo.png';
import menu from "../files_photo/menus.png"
import { useState } from "react";
import { useEffect } from "react";
import Avatar from '../components/Avatar'; 

const navigation = [
  { name: 'Головна', to: '/'},
  { name: 'Каталог', to: '/catalog'},
  { name: 'Про сайт', to: '/about'},
  { name: 'Контакти', to: '/contacts'}
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function DefaultLayout() {
  const {currentUser, userToken, setCurrentUser, setUserToken} = useStateContext();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    axiosClient.get('/me')
      .then(({ data }) => {
        setCurrentUser(data)
      })
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      const menuBlock = document.querySelector('.menu-dropdown');
      const userButton = document.querySelector('.user-button');
      
      if (isOpen && menuBlock && !menuBlock.contains(event.target) && !userButton?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!userToken){
    return <Navigate to='/login'/>
  }

  const logout = (ev) => {
    ev.preventDefault();
    axiosClient.post('/logout')
    .then(res => {
      setCurrentUser({});
      setUserToken(null);
    });
  }

  return (
    <>
      <div className="min-h-full">
        <Disclosure as="nav" style={{ backgroundColor: '#000000' }} className='mobile-menu-semicircle'>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <div className="shrink-0">
                  <Link to="/">
                    <img
                      alt="."
                      src={logo}
                      className="w-10"
                    />
                  </Link>
                </div>
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    {navigation.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.to}
                        className={({isActive}) => classNames(
                          isActive ? 'margin-2 bg-[#0c3200]' : 'hover:text-[#ffc400]',
                          'rounded-md px-3 py-2 text-sm font-medium text-white transition-all duration-400'
                        )}
                      >
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6">
                  <div className="relative ml-3">
                    <div className='flex'>
                      <div className='flex'>
                        {currentUser.name && (
                          <button 
                            className='flex items-center gap-2 p-2 user-button' 
                            onClick={() => setIsOpen(!isOpen)}
                          >
                            <Avatar user={currentUser} size="sm" showName={true} />
                          </button>
                        )}
                        {!currentUser.name && (
                          <a className='flex p-2' href="#" onClick={(ev) => logout(ev)}>
                            <p className='text-white'>Увійти</p>
                          </a>
                        )}
                      </div>

                      {isOpen && (
                        <div className="absolute right-0 w-50 bg-black text-white rounded-b-lg shadow-lg px-8 z-50 mt-13 py-5 menu-dropdown">
                          <ul className="space-y-3 font-medium text-center">
                            <li>
                              <Link className="hover:text-[#ffc400] block" to={`/profile/${currentUser.id}`}>Профіль</Link>
                            </li>
                            <li>
                              <Link className="hover:text-[#ffc400] block" to={`/library/${currentUser.id}`}>Бібліотека</Link>
                            </li>
                            <li>
                              <Link className="hover:text-[#ffc400] block" to={`/notifications/${currentUser.id}`}>Повідомлення</Link>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="-mr-2 flex md:hidden">
                <DisclosureButton className="group relative">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Меню</span>
                  <img src={menu} alt="." className='w-50% m-auto w-8 mr-[5%]'/>
                </DisclosureButton>
              </div>
            </div>
          </div>
          
          <DisclosurePanel className="md:hidden">
            <div className="grid grid-cols-2 gap-2 px-2 pt-2 pb-3 sm:px-3">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  className={({isActive}) => classNames(
                    isActive ? 'bg-[#0c3200]' : 'hover:text-[#ffc400] hover:bg-gray-800',
                    'rounded-md px-3 py-2 text-sm font-medium text-white transition-all duration-400 text-center'
                  )}
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          </DisclosurePanel>
        </Disclosure>
        <Outlet />
      </div>
    </>
  )
}