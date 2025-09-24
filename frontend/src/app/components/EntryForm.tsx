export default function EntryForm({ id }: { id?: string }) {
  return (
    <form>
      <h2>{id ? "Edit Entry" : "New Entry"}</h2>
      {/* Form fields will go here */}
    </form>
  );
}
