import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import SearchInput from "@/components/ui/search-input";
import BookGrid from "@/components/books/BookGrid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Book } from "@/types/book";
import { Filter, X } from "lucide-react";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const searchQuery = searchParams.get("q") || "";
  const selectedCategory = searchParams.get("category") || "";
  const availabilityFilter = searchParams.get("available") || "";

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      const { data } = await supabase.from("books").select("*").order("title");

      if (data) {
        setBooks(data);
        const uniqueCategories = [...new Set(data.map((book) => book.category))];
        setCategories(uniqueCategories.sort());
      }
      setLoading(false);
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    let result = [...books];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.category.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      result = result.filter((book) => book.category === selectedCategory);
    }

    if (availabilityFilter === "true") {
      result = result.filter((book) => book.availability);
    } else if (availabilityFilter === "false") {
      result = result.filter((book) => !book.availability);
    }

    setFilteredBooks(result);
  }, [books, searchQuery, selectedCategory, availabilityFilter]);

  const updateSearchParams = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = searchQuery || selectedCategory || availabilityFilter;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Find a Book
          </h1>
          <p className="text-muted-foreground">
            Search our library collection by title, author, or category.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          <div className="flex gap-4">
            <SearchInput
              value={searchQuery}
              onChange={(value) => updateSearchParams("q", value)}
              placeholder="Search by title, author, or category..."
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-accent text-accent-foreground">
                  !
                </Badge>
              )}
            </Button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="p-6 rounded-2xl border border-border bg-card animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Filter Options</h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear all
                  </Button>
                )}
              </div>

              {/* Category Filter */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === "" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSearchParams("category", "")}
                  >
                    All
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSearchParams("category", category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Availability</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={availabilityFilter === "" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSearchParams("available", "")}
                  >
                    All
                  </Button>
                  <Button
                    variant={availabilityFilter === "true" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSearchParams("available", "true")}
                  >
                    Available
                  </Button>
                  <Button
                    variant={availabilityFilter === "false" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSearchParams("available", "false")}
                  >
                    Issued
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filteredBooks.length}
            </span>{" "}
            {filteredBooks.length === 1 ? "book" : "books"}
            {searchQuery && (
              <>
                {" "}
                for "<span className="font-semibold text-foreground">{searchQuery}</span>"
              </>
            )}
          </p>
        </div>

        {/* Book Grid */}
        <BookGrid books={filteredBooks} loading={loading} />
      </div>
    </Layout>
  );
};

export default Search;
