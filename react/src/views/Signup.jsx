import { Link } from "react-router-dom";
import { useState } from "react";
import axiosClient from '../axios.js'
import { useStateContext } from "../contexts/ContextProvider.jsx";

export default function Signup() {
  const { setCurrentUser, setUserToken } = useStateContext();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState({ __html: "" });

  const onSubmit = (ev) => {
    ev.preventDefault();
    setError({ __html: "" });

    axiosClient
      .post("/signup", {
        name: fullName,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      .then(({ data }) => {
        setCurrentUser(data.user)
        setUserToken(data.token)
      })
      .catch((error) => {
        if (error.response) {
          const finalErrors = Object.values(error.response.data.errors).reduce((accum, next) => [...accum, ...next], [])
          console.log(finalErrors)
          setError({__html: finalErrors.join('<br>')})
        }
        console.error(error)
      });
  };

  return (
    <>
      <div className="bg-[#0c3200]">
        <h2 className="text-center text-3xl tracking-tight text-white">
          Реєстрація
        </h2>

        {error.__html && (
          <div
            className="bg-red-500 rounded py-2 px-3 text-white mx-5"
            dangerouslySetInnerHTML={error}
          ></div>
        )}

        <form onSubmit={onSubmit} className="mt-8 space-y-6 mx-5" action="#" method="POST">
          <input type="hidden" name="remember" defaultValue="true" />
          <div>
            <div className="rounded-md text-white">
              <label htmlFor="full-name" className="text-sm">
                Нік
              </label>
              <input
                id="full-name"
                name="name"
                type="text"
                required
                value={fullName}
                onChange={ev => setFullName(ev.target.value)}
                className="mb-5 relative block w-full rounded-md bg-neutral-600 shadow-[#ffc400] shadow-md px-3 py-2 focus:z-10 sm:text-sm"
              />
            </div>
            <div className="rounded-md text-white">
              <label htmlFor="email-address" className="text-sm">
                Пошта
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={ev => setEmail(ev.target.value)}
                className="mb-5 relative block w-full rounded-md bg-neutral-600 shadow-[#ffc400] shadow-md px-3 py-2 focus:z-10 sm:text-sm"
              />
            </div>
            <div className="rounded-md text-white">
              <label htmlFor="password" className="text-sm">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={ev => setPassword(ev.target.value)}
                className="mb-5 relative block w-full rounded-md bg-neutral-600 shadow-[#ffc400] shadow-md px-3 py-2 focus:z-10 sm:text-sm"
              />
            </div>
            <div className="rounded-md text-white">
              <label htmlFor="password-confirmation" className="text-sm">
                Пароль (повторити)
              </label>
              <input
                id="password-confirmation"
                name="password_confirmation"
                type="password"
                required
                value={passwordConfirmation}
                onChange={ev => setPasswordConfirmation(ev.target.value)}
                className="relative block w-full rounded-md bg-neutral-600 shadow-[#ffc400] shadow-md px-3 py-2 focus:z-10 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-[#000000] py-2 px-4 text-sm font-medium text-white hover:text-[#ffc400] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              Зареєструватися
            </button>
          </div>

          <p className="mt-2 text-center text-sm text-[#ffc400]">
            <Link
              to="/login"
              className="font-medium"
            >
              Увійти через існуючий акаунт
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}