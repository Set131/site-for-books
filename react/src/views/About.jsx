import PageComponent from '../components/PageComponent';
import logo from '../files_photo/logo.png';
import Bottom from "./Bottom";
import WindEffect from "../components/WindEffect";

export default function About() {
  return (
    <>
      <WindEffect />
      <PageComponent>
        <div className='sm:flex block px-4'>
          <img src={logo} alt="." className='w-[50%] mb-auto mx-auto'/>
          <div className='sm:w-[50%] text-white'>
            <p className='text-4xl my-10 flex justify-center'>Про сайт</p>
            <p className='px-6 font-bold text-[#ffc400]'>Для чого потрібен наш сайт?</p>
            <p className='px-4 text-sm text-justify'><span className='ml-5'></span></p>
            <p className='px-6 font-bold text-[#ffc400]'>Як розмістити свою книгу на сайті?</p>
            <p className='px-4 text-sm text-justify'><span className='ml-5'></span></p>
          </div>
        </div>
        <Bottom />
      </PageComponent>
    </>
  )
}
