import { useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../axios";
import { useStateContext } from "../contexts/ContextProvider";

export default function Login() {
  const { setCurrentUser, setUserToken } = useStateContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({ __html: "" });

  const onSubmit = (ev) => {
    ev.preventDefault();
    setError({ __html: "" });

    axiosClient
      .post("/login", {
        email,
        password,
      })
      .then(({ data }) => {
        setCurrentUser(data.user);
        setUserToken(data.token);
      })
      .catch((error) => {
        if (error.response) {
          const finalErrors = Object.values(error.response.data.errors).reduce(
            (accum, next) => [...accum, ...next],
            []
          );
          setError({ __html: finalErrors.join("<br>") });
        }
        console.error(error);
      });
  };

  return (
    <>
      <div className="bg-[#0c3200]">
      <h2 className="mt-6 text-center text-3xl tracking-tight text-white">
        Вхід
      </h2>

      {error.__html && (
        <div
          className="bg-red-500 rounded py-2 px-3 text-white"
          dangerouslySetInnerHTML={error}
        ></div>
      )}

      <form onSubmit={onSubmit} className="mt-8 space-y-6 mx-5" action="#" method="POST">
        <input type="hidden" name="remember" defaultValue="true" />
        <div>
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
              onChange={(ev) => setEmail(ev.target.value)}
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
              onChange={(ev) => setPassword(ev.target.value)}
              className="mb-5 relative block w-full rounded-md bg-neutral-600 shadow-[#ffc400] shadow-md px-3 py-2  focus:z-10 sm:text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="accent-[#ffc400] h-5 w-5 rounded border-black border-4"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-white"
            >
              Запам'ятати мене
            </label>
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-[#000000] py-2 px-4 text-sm font-medium text-white hover:text-[#ffc400] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            Вхід
          </button>
        </div>

        <p className="mt-2 text-center text-sm text-[#ffc400]">
          <Link
            to="/signup"
            className="font-medium "
          >
            Створити обліковий запис
          </Link>
        </p>
      </form>
      </div>
    </>
  );
}