export function PostListLoading() {
  return (
    <div className="flex justify-center items-center min-h-[200px]">
      <p className="text-gray-500">Chargement...</p>
    </div>
  );
}

export function PostListEmpty() {
  return <p className="text-center text-gray-500">Aucune publication</p>;
}

export function PostListHeader({
  onCreateClick,
}: {
  onCreateClick: () => void;
}) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">Mes publications</h1>
      <button
        onClick={onCreateClick}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
      >
        Générer
      </button>
    </div>
  );
}
