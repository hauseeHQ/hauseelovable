import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AssessmentQuestion, AssessmentCategory } from '../../types';
import QuestionCard from './QuestionCard';
import { CATEGORY_INFO } from './assessmentQuestions';

interface CategorySectionProps {
  category: AssessmentCategory;
  questions: AssessmentQuestion[];
  answers: (number | null)[];
  onAnswerChange: (questionId: number, rating: number) => void;
}

export default function CategorySection({
  category,
  questions,
  answers,
  onAnswerChange,
}: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const categoryInfo = CATEGORY_INFO[category];
  const answeredCount = questions.filter(q => answers[q.id - 1] !== null).length;

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{categoryInfo.icon}</span>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900">
              {categoryInfo.title}
            </h3>
            <p className="text-sm text-gray-600">{categoryInfo.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {answeredCount}/{questions.length}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              answer={answers[question.id - 1]}
              onAnswerChange={onAnswerChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
