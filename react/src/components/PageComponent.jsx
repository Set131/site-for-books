
export default function PageComponent({ title, buttons = '', search = null, children }) {
  return (
    <>
      <header style={{ backgroundColor: '#0c3200' }}>
        <div className="flex justify-between items-center mx-auto max-w-7xl py-3 sm:px-6 lg:px-8">
          <div className="flex items-center w-full justify-between sm:mx-2 mx-4">
            {buttons}
            {search && (
              <div className="relative max-w-md w-full sm:w-[60%]">
                <input
                  type="text"
                  value={search.value}
                  onChange={(e) => search.onChange(e.target.value)}
                  className="text-white bg-black py-2 border-[#ffc400] border-2 focus:outline-none focus:ring-0 w-full p-2"
                  style={{borderRadius: "12px"}}
                />
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="bg-[#0c3200] min-h-screen">
        <div className="mx-auto max-w-7xl py-2">{children}</div>
      </main>
      <footer className='h-10 w-full' style={{ backgroundColor: '#0c3200' }}></footer>
    </>
  );
}