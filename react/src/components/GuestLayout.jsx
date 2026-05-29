import { Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import logo from "../files_photo/logo.png";
import WindEffect from "./WindEffect";

export default function GuestLayout() {

  const {userToken} = useStateContext();

  if (userToken){
    return <Navigate to='/'/>
  }

  return (
    <>
      <WindEffect />
      <div className="bg-[#0c3200] sm:pt-1 pt-15 pb-10" style={{minHeight: "100vh"}}>
        <div className="flex h-[full] flex-1 flex-col justify-center lg:px-8 my-auto">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <img
              alt="Your Company"
              src={logo}
              className="mx-auto h-30 w-auto  mt-5"
            />
          </div>

          <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
            <Outlet/>
          </div>
        </div>
      </div>
    </>
  )
}
