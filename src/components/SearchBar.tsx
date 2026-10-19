import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";

export function SearchBar({
  initial = "",
  onSubmitted,
  id = "site-search",
}: {
  initial?: string;
  onSubmitted?: () => void;
  id?: string;
}) {
  const [q, setQ] = useState(initial);
  const navigate = useNavigate();
  function submit(e: FormEvent) {
    e.preventDefault();
    navigate({ to: "/products", search: { search: q.trim() || undefined } });
    onSubmitted?.();
  }
  return (
    <form role="search" onSubmit={submit} className="relative w-full">
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <input
        id={id}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search Forma"
        className="h-9 w-full rounded-full border border-input bg-card pl-9 pr-3 text-sm placeholder:text-muted-foreground"
      />
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </form>
  );
}
