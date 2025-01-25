export function PostTopics({ topics }: { topics: string[] }) {
  if (topics.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap">
      {topics.map((topic, index) => (
        <span
          key={index}
          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
        >
          {topic}
        </span>
      ))}
    </div>
  );
}
