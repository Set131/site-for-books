import { useState } from 'react';
import pagPrev from '../files_photo/pag_prev.png';
import pagPrevHover from '../files_photo/pag_prev_hover.png';
import pagNext from '../files_photo/pag_next.png';
import pagNextHover from '../files_photo/pag_next_hover.png';

export default function PaginationLinks({ meta, onPageClick }) {
  const [prevImg, setPrevImg] = useState(pagPrev);
  const [nextImg, setNextImg] = useState(pagNext);

  if (!meta) return null;

  function onClick(ev, link) {
    ev.preventDefault();
    if (!link.url) return;
    onPageClick(link);
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 sm:px-6 mt-4">
      
      <div className="flex flex-1 justify-between sm:hidden">
        <button onClick={ev => onClick(ev, meta.links[0])} className="relative inline-flex items-center">
          <img
            src={prevImg}
            onMouseOver={() => setPrevImg(pagPrevHover)}
            onMouseOut={() => setPrevImg(pagPrev)}
            alt="Previous"
            className="w-10 h-10" 
          />
        </button>
        <button onClick={ev => onClick(ev, meta.links[meta.links.length - 1])} className="relative ml-3 inline-flex items-center">
          <img
            src={nextImg}
            onMouseOver={() => setNextImg(pagNextHover)}
            onMouseOut={() => setNextImg(pagNext)}
            alt="Next"
            className="w-10 h-10"
          />
        </button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-center">
        <div>
          {meta.total > meta.per_page && (
            <nav className="isolate inline-flex -space-x-px" aria-label="Pagination">
              
              {/* Кнопка "Previous" */}
              <button onClick={ev => onClick(ev, meta.links[0])} className="mr-2">
                <img
                  src={prevImg}
                  onMouseOver={() => setPrevImg(pagPrevHover)}
                  onMouseOut={() => setPrevImg(pagPrev)}
                  alt="Previous"
                  className="w-10 h-10"
                />
              </button>

              {meta.links.map((link, ind) => {
                if (link.label.includes('Previous') || link.label.includes('Next')) return null;

                return (
                  <a
                    href="#"
                    onClick={ev => onClick(ev, link)}
                    key={ind}
                    aria-current={link.active ? "page" : undefined}
                    className={
                      `relative z-10 inline-flex items-center px-4 py-2 font-medium focus:z-20 
                      transition-colors duration-200 text-2xl
                      ${ind === 1 ? 'rounded-l-md' : ''}
                      ${ind === meta.links.length - 2 ? 'rounded-r-md' : ''}
                      ${link.active
                        ? ' text-lime-400'
                        : ' text-purple-600 hover:text-lime-400 '}`
                    }
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                );
              })}

              <button onClick={ev => onClick(ev, meta.links[meta.links.length - 1])} className="ml-2">
                <img
                  src={nextImg}
                  onMouseOver={() => setNextImg(pagNextHover)}
                  onMouseOut={() => setNextImg(pagNext)}
                  alt="Next"
                  className="w-10 h-10"
                />
              </button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
