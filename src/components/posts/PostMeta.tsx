import { format } from "date-fns";

interface PostMetaProps {
  createdAt: string;
  postedAt: string | null;
}

export function PostMeta({ createdAt, postedAt }: PostMetaProps) {
  return (
    <div className="flex gap-2 items-center text-sm">
      <span className="text-gray-500">
        {format(new Date(createdAt), "PPP")}
      </span>
      {postedAt && (
        <span className="text-gray-500">
          · Publié le {format(new Date(postedAt), "PPP")}
        </span>
      )}
    </div>
  );
}
