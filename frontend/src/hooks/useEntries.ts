import { useState, useEffect } from "react";

export function useEntries() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch entries logic will go here
    setLoading(false);
  }, []);

  return { entries, loading };
}
