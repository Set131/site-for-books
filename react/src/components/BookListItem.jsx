// components/BookListItem.jsx
export default function BookListItem({ book, onDeleteClick }) {
  const renderRatingStars = (rating) => {
    const normalizedRating = (rating / 10) * 5;
    const fullStars = Math.floor(normalizedRating);
    const hasHalfStar = normalizedRating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-400">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-400">½</span>}
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-500">☆</span>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full p-5 rounded-xl border-purple-300 border-2 my-5 bg-[#ffffff]">
      <div className="sm:flex">
        <div className="sm:w-[20%] w-full">
          <img 
            src={book.photo_url} 
            alt={book.title}
            className="object-cover rounded-xl w-full h-48 sm:h-auto"
          />
        </div>
        
        <div className="text-white sm:w-[80%] sm:pl-5 mt-4 sm:mt-0">
          <h4 className="text-xl font-bold text-center sm:text-left">
            {book.title}
          </h4>
          
          <div className="my-3">
            <p>
              <span className='text-[#8742A0]'>Опис:</span> {book.description?.substring(0, 200)}...
            </p>
          </div>
          
          <div className='flex flex-wrap justify-between items-center mt-4'>
            <div className="flex items-center space-x-2 flex-wrap gap-2">
              {renderRatingStars(book.rating)}
              <span className="text-white">({book.rating.toFixed(1)})</span>
              {book.age_limit > 0 && (
                <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs">
                  {book.age_limit}+
                </span>
              )}
              {book.tags && (
                <div className="flex flex-wrap gap-1">
                  {book.tags.split(',').slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="bg-[#8742A0] text-white text-xs px-2 py-1 rounded-full">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex space-x-2 mt-3 sm:mt-0">
              <a 
                href={`/book/public/${book.slug}`} 
                className="my-auto p-2 rounded-xl bg-[#8742A0] hover:bg-[#6b3580] transition"
              >
                Детальніше
              </a>
              <button 
                onClick={() => onDeleteClick(book.id)}
                className="my-auto p-2 rounded-xl bg-red-600 hover:bg-red-700 transition"
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}