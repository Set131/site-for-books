import PageComponent from "../components/PageComponent";
import Bottom from "./Bottom";
import WindEffect from "../components/WindEffect";

export default function Contacts() {
 
  return (
    <>
      <WindEffect />
      <PageComponent
        title="Контакти"
      >
        <p className='text-4xl my-10 flex justify-center text-white'>Контакти</p>
            <div className='mx-8 mb-8 text-white'>
              <hr />
              <div className='flex justify-between'>
                <p>Телефон №1 :</p>
                <p>+38 096 858 345</p>
              </div>
              <hr />
              <div className='flex justify-between'>
                <p>Телефон №2 :</p>
                <p>+38 050 923 167</p>
              </div>
              <hr />
              <div className='flex justify-between'>
                <p>Пошта :</p>
                <p>site_for_books@gmail.com</p>
              </div>
              <hr />
            </div>
        <Bottom/>
    </PageComponent>
    </>
  );
}