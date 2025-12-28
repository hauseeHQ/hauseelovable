interface SkeletonLoaderProps {
  type?: 'text' | 'title' | 'card' | 'avatar' | 'button';
  count?: number;
  className?: string;
}

export default function SkeletonLoader({
  type = 'text',
  count = 1,
  className = '',
}: SkeletonLoaderProps) {
  const getSkeletonClass = () => {
    switch (type) {
      case 'text':
        return 'h-4 w-full rounded';
      case 'title':
        return 'h-8 w-3/4 rounded';
      case 'card':
        return 'h-48 w-full rounded-lg';
      case 'avatar':
        return 'h-12 w-12 rounded-full';
      case 'button':
        return 'h-10 w-32 rounded-lg';
      default:
        return 'h-4 w-full rounded';
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`bg-gray-200 animate-shimmer ${getSkeletonClass()} ${className}`}
          style={{
            backgroundImage:
              'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '1000px 100%',
          }}
        />
      ))}
    </>
  );
}
