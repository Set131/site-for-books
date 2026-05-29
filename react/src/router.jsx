import { createBrowserRouter } from "react-router-dom";
import Login from './views/Login.jsx';
import Signup from './views/Signup.jsx';
import GuestLayout from './components/GuestLayout.jsx';
import DefaultLayout from "./components/DefaultLayout.jsx";
import About from "./views/About.jsx";
import Profile from "./views/Profile.jsx";
import Main from "./views/Main.jsx";
import Catalog from "./views/Catalog.jsx";
import Library from "./views/Library.jsx";
import Notifications from "./views/Notifications.jsx";
import OwnBooks from "./views/OwnBooks.jsx";
import Contacts from "./views/Contacts.jsx";
import BookView from "./views/BookView.jsx";
import BookPublicView from "./views/BookPublicView.jsx";
import ChapterView from "./views/ChapterView.jsx";
import Friends from "./views/Friends.jsx";

const router = createBrowserRouter([
    {
        path: '/',
        element: <DefaultLayout />,
        children: [
            {
                path: '/',
                element: <Main />
            },
            {
                path: '/catalog',
                element: <Catalog />
            },
            {
                path: '/about',
                element: <About />
            },
            {
                path: '/contacts',
                element: <Contacts />
            },
            {
                path: "/profile/:id",
                element: <Profile />,
            },
            {
                path: "/library/:id",
                element: <Library />,
            },
            {
                path: "/own_books/:id",
                element: <OwnBooks />,
            },
            {
                path: "/notifications/:id",
                element: <Notifications />,
            },
            {
                path: "/books/create",
                element: <BookView />
            },
            {
                path: "/books/:id",
                element: <BookView />
            },
            {
                path: "/book/public/:slug",
                element: <BookPublicView />
            },
            {
                path: "/book/:bookSlug/chapter/:chapterNumber",
                element: <ChapterView />
            },
            {
                path: "/friends/:id",
                element: <Friends />
            }
        ]
    },
    {
        path: '/',
        element: <GuestLayout />,
        children: [
            {
                path: '/login',
                element: <Login />
            },
            {
                path: '/signup',
                element: <Signup />
            },
        ]
    },
])

export default router;