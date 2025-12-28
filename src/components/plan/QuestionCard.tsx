import { AssessmentQuestion } from '../../types';
import RatingButtons from './RatingButtons';

interface QuestionCardProps {
  question: AssessmentQuestion;
  answer: number | null;
  onAnswerChange: (questionId: number, rating: number) => void;
}

export default function QuestionCard({ question, answer, onAnswerChange }: QuestionCardProps) {
  return (
    <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
      <div className="mb-4">
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
            Q{question.id}
          </span>
          <p className="text-gray-900 font-medium leading-relaxed flex-1">
            {question.text}
          </p>
        </div>
      </div>
      <RatingButtons
        value={answer}
        onChange={(rating) => onAnswerChange(question.id, rating)}
        questionId={question.id}
      />
    </div>
  );
}
