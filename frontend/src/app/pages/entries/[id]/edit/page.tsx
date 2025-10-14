import EntryForm from "@/app/components/EntryForm";

export default function EditEntryPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Edit Entry</h1>
      <EntryForm id={params.id} />
    </div>
  );
}
