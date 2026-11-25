import { useState, useEffect } from "react";
import PageComponent from "../components/PageComponent";
import { useStateContext } from "../contexts/ContextProvider";
import PaginationLinks from "../components/PaginationLinks";
import axiosClient from "../axios";
import debounce from 'lodash.debounce';
import { Link } from "react-router-dom";
import Bottom from "./Bottom";
import WindEffect from "../components/WindEffect";
import { ALL_TAGS } from "../constants/tags";

export default function Catalog() {
  const { showToast } = useStateContext();
  const [books, setBooks] = useState([]);
  const [meta, setMeta] = useState({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("new");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedAgeLimit, setSelectedAgeLimit] = useState("all");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isAgeFilterOpen, setIsAgeFilterOpen] = useState(false);

  const onDeleteClick = (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      axiosClient.delete(`/book/${id}`).then(() => {
        getBooks();
        showToast("Book deleted");
      });
    }
  };

  const onPageClick = (link) => {
    if (!link.url) return;
    getBooks(link.url);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setIsSortOpen(false);
  };

  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAgeFilterChange = (age) => {
    setSelectedAgeLimit(age);
    setIsAgeFilterOpen(false);
  };

  const resetAllFilters = () => {
    setSelectedTags([]);
    setSelectedAgeLimit("all");
  };

  const getAgeFilterText = () => {
    if (selectedAgeLimit === "all") return "All ages";
    return `${selectedAgeLimit}+`;
  };

  const getBooks = (url = "/book") => {
    axiosClient
      .get(url, {
        params: {
          search,
          filter,
          tags: selectedTags.join(','),
          age_limit: selectedAgeLimit !== "all" ? selectedAgeLimit : undefined,
        },
      })
      .then(({ data }) => {
        setBooks(data.data);
        setMeta(data.meta);
      });
  };

  useEffect(() => {
    const debounced = debounce(() => {
      getBooks();
    }, 300);
    
    debounced();

    return () => debounced.cancel();
  }, [search, filter, selectedTags, selectedAgeLimit]);

  const renderRating = (rating) => {
    const ratingValue = rating || 0;
    return (
      <div className="flex items-center gap-1">
        <span className="text-yellow-400 text-lg">★</span>
        <span className="text-white font-medium">{ratingValue.toFixed(1)}</span>
      </div>
    );
  };

  const getFilterText = () => {
    switch(filter) {
      case 'new': return 'New';
      case 'popular': return 'Popular';
      case 'rating': return 'By rating';
      default: return 'New';
    }
  };

  const hasActiveFilters = selectedTags.length > 0 || selectedAgeLimit !== "all";

  return (
    <>
      <WindEffect />
      <PageComponent
        title="Book Catalog"
        buttons={<div></div>}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Search books by title..."
        }}
      >
        <div className="hidden lg:flex gap-4">
          {/* Sidebar with filters */}
          <div className="w-[20%] min-h-screen bg-black/50 rounded-lg p-4">
            {/* Reset all filters button - TOP */}
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="w-full text-sm text-red-500 hover:text-red-400 transition py-2 mb-4 border border-red-500 rounded-lg"
              >
                ✕ Clear all filters
              </button>
            )}

            {/* Age restriction filter - FIRST */}
            <h3 className="text-[#ffc400] font-bold text-xl mb-4 border-b border-[#ffc400] pb-2">
              Age restriction
            </h3>
            
            <div className="flex flex-col gap-2 mb-6">
              {["all", 0, 6, 12, 16, 18].map((age) => (
                <button
                  key={age}
                  onClick={() => handleAgeFilterChange(age)}
                  className={`px-3 py-2 rounded-lg text-sm transition text-left ${
                    selectedAgeLimit === age
                      ? "bg-[#ffc400] text-black font-medium"
                      : "bg-[#0c3200] text-white hover:bg-black/50"
                  }`}
                >
                  {age === "all" ? "All ages" : `${age}+`}
                </button>
              ))}
            </div>

            {/* Tag filter - SECOND */}
            <h3 className="text-[#ffc400] font-bold text-xl mb-4 border-b border-[#ffc400] pb-2">
              Filter by tags
            </h3>
            
            <div className="flex flex-col gap-2">
              {ALL_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-2 rounded-lg text-sm transition text-left ${
                    selectedTags.includes(tag)
                      ? "bg-[#ffc400] text-black font-medium"
                      : "bg-[#0c3200] text-white hover:bg-black/50"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 w-[80%] overflow-hidden">
            <div className="flex">
              <div className="justify-between w-full mb-4 mx-10 sm:flex hidden border border-[#ffc400] rounded-sm bg-black">
                {["new", "popular", "rating"].map((type) => (
                  <div className="w-full" key={type}>
                    <button
                      onClick={() => handleFilterChange(type)}
                      className={`flex h-10 px-4 justify-center items-center rounded-sm m-auto w-full transition ${
                        filter === type 
                          ? "bg-[#ffc400] text-black" 
                          : "bg-black text-[#ffc400]"
                      }`}
                    >
                      <p className="mx-1">
                        {type === "new" && "New"}
                        {type === "popular" && "Popular"}
                        {type === "rating" && "By rating"}
                      </p>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="sm:px-10 px-0">
              {books.length === 0 ? (
                <div className="text-center font-bold text-[#ffc400] py-10">
                  No books found
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {books.map((book) => (
                      <Link 
                        key={book.id} 
                        to={`/book/public/${book.slug}`}
                        className="block bg-[#1a1a1a] rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer border border-gray-800 hover:border-[#ffc400] group"
                      >
                        <div className="relative w-full aspect-[3/3]">
                          <img 
                            src={book.photo_url} 
                            alt={book.title}
                            className="absolute top-0 left-0 w-full h-full object-cover"
                          />
                          {book.age_limit > 0 && (
                            <div className="absolute bottom-3.5 left-2 z-10">
                              <span className="bg-black/70 text-red-700 px-2 py-2 rounded-lg text-sm backdrop-blur-sm font-extrabold">
                                {book.age_limit}+
                              </span>
                            </div>
                          )}
                          <div className="absolute bottom-2 right-2 z-10">
                            <div className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg">
                              {renderRating(book.rating)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-3">
                          <h4 className="text-sm font-bold text-white text-center truncate">
                            {book.title}
                          </h4>
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  {books.length > 0 && <PaginationLinks meta={meta} onPageClick={onPageClick} />}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile version */}
        <div className="lg:hidden block">
          {/* Sorting */}
          <div className="px-4 mb-4">
            <details className="bg-black rounded-lg border border-[#ffc400]" open={isSortOpen}>
              <summary 
                className="text-[#ffc400] font-medium p-3 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  setIsSortOpen(!isSortOpen);
                }}
              >
                Sort: {getFilterText()}
              </summary>
              <div className="flex flex-col gap-2 border-t border-[#ffc400] p-3">
                <button
                  onClick={() => handleFilterChange('new')}
                  className={`px-3 py-2 rounded-lg text-sm transition text-left ${
                    filter === 'new'
                      ? "bg-[#ffc400] text-black font-medium"
                      : "bg-[#0c3200] text-white hover:bg-black/50"
                  }`}
                >
                  New
                </button>
                <button
                  onClick={() => handleFilterChange('popular')}
                  className={`px-3 py-2 rounded-lg text-sm transition text-left ${
                    filter === 'popular'
                      ? "bg-[#ffc400] text-black font-medium"
                      : "bg-[#0c3200] text-white hover:bg-black/50"
                  }`}
                >
                  Popular
                </button>
                <button
                  onClick={() => handleFilterChange('rating')}
                  className={`px-3 py-2 rounded-lg text-sm transition text-left ${
                    filter === 'rating'
                      ? "bg-[#ffc400] text-black font-medium"
                      : "bg-[#0c3200] text-white hover:bg-black/50"
                  }`}
                >
                  By rating
                </button>
              </div>
            </details>
          </div>

          {/* Reset filters button for mobile */}
          {hasActiveFilters && (
            <div className="px-4 mb-4">
              <button
                onClick={resetAllFilters}
                className="w-full text-sm text-red-500 hover:text-red-400 transition py-2 border border-red-500 rounded-lg bg-black"
              >
                ✕ Clear all filters
              </button>
            </div>
          )}

          {/* Age restriction filter - mobile */}
          <div className="px-4 mb-4">
            <details className="bg-black rounded-lg border border-[#ffc400]" open={isAgeFilterOpen}>
              <summary 
                className="text-[#ffc400] font-medium p-3 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  setIsAgeFilterOpen(!isAgeFilterOpen);
                }}
              >
                Age: {getAgeFilterText()}
              </summary>
              <div className="flex flex-col gap-2 border-t border-[#ffc400] p-3">
                {["all", 0, 6, 12, 16, 18].map((age) => (
                  <button
                    key={age}
                    onClick={() => handleAgeFilterChange(age)}
                    className={`px-3 py-2 rounded-lg text-sm transition text-left ${
                      selectedAgeLimit === age
                        ? "bg-[#ffc400] text-black font-medium"
                        : "bg-[#0c3200] text-white hover:bg-black/50"
                    }`}
                  >
                    {age === "all" ? "All ages" : `${age}+`}
                  </button>
                ))}
              </div>
            </details>
          </div>

          {/* Tag filter */}
          <div className="px-4 mb-4">
            <details className="bg-black rounded-lg border border-[#ffc400]">
              <summary className="text-[#ffc400] font-medium p-3 cursor-pointer">
                Filter by tags {selectedTags.length > 0 && `(${selectedTags.length})`}
              </summary>
              <div className="p-3 flex flex-col gap-2 border-t border-[#ffc400] max-h-60 overflow-y-auto">
                {ALL_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-2 rounded-lg text-sm transition text-left ${
                      selectedTags.includes(tag)
                        ? "bg-[#ffc400] text-black font-medium"
                        : "bg-[#0c3200] text-white hover:bg-black/50"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </details>
          </div>

          <div className="px-4">
            {books.length === 0 ? (
              <div className="text-center font-bold text-[#ffc400] py-10">
                No books found
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {books.map((book) => (
                    <Link 
                      key={book.id} 
                      to={`/book/public/${book.slug}`}
                      className="block bg-[#1a1a1a] rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer border border-gray-800 hover:border-[#ffc400] group"
                    >
                      <div className="relative w-full aspect-[3/3]">
                        <img 
                          src={book.photo_url} 
                          alt={book.title}
                          className="absolute top-0 left-0 w-full h-full object-cover"
                        />
                        {book.age_limit > 0 && (
                          <div className="absolute bottom-3.5 left-2 z-10">
                            <span className="bg-black/70 text-red-700 px-2 py-2 rounded-lg backdrop-blur-sm font-extrabold text-sm">
                              {book.age_limit}+
                            </span>
                          </div>
                        )}
                        <div className="absolute bottom-2 right-2 z-10">
                          <div className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg">
                            {renderRating(book.rating)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2">
                        <h4 className="text-xs font-bold text-white text-center truncate">
                          {book.title}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>
                
                {books.length > 0 && <PaginationLinks meta={meta} onPageClick={onPageClick} />}
              </>
            )}
          </div>
        </div>

        <Bottom />
      </PageComponent>
    </>
  );
}