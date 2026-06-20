export default function RecordDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Medical Record Detail</h1>
      <p className="text-gray-500 mt-1">Record ID: {params.id}</p>
    </div>
  )
}
