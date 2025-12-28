interface RatingButtonsProps {
  value: number | null;
  onChange: (rating: number) => void;
  questionId: number;
}

export default function RatingButtons({ value, onChange, questionId }: RatingButtonsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`w-12 h-12 rounded-full border-2 font-semibold text-lg transition-all hover:scale-105 ${
              value === rating
                ? 'bg-primary-400 border-primary-400 text-white'
                : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
            }`}
            aria-label={`Rate ${rating} out of 5 for question ${questionId}`}
          >
            {rating}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Very unsure</span>
        <span>Very confident</span>
      </div>
    </div>
  );
}
