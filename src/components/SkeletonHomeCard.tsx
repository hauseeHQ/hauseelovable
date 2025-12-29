export default function SkeletonHomeCard() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-200" />

      <div className="p-4 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4" />

        <div className="h-4 bg-gray-200 rounded w-1/2" />

        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>

        <div className="flex items-center gap-4 pt-2">
          <div className="h-8 bg-gray-200 rounded w-16" />
          <div className="h-8 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}
