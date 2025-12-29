import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Book } from "@/types/book";
import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  CheckCircle,
  XCircle,
  LayoutDashboard,
} from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  "Fiction",
  "Science Fiction",
  "Fantasy",
  "Romance",
  "Computer Science",
  "Science",
  "History",
  "Philosophy",
  "Finance",
  "Self-Help",
  "Psychology",
  "Business",
];

interface BookFormData {
  title: string;
  author: string;
  category: string;
  isbn: string;
  availability: boolean;
  rack_number: string;
  shelf: string;
  description: string;
  cover_image: string;
}

const emptyForm: BookFormData = {
  title: "",
  author: "",
  category: "",
  isbn: "",
  availability: true,
  rack_number: "",
  shelf: "",
  description: "",
  cover_image: "",
};

const Admin = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState<BookFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const stats = {
    total: books.length,
    available: books.filter((b) => b.availability).length,
    issued: books.filter((b) => !b.availability).length,
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setBooks(data);
    }
    setLoading(false);
  };

  const openAddDialog = () => {
    setEditingBook(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      category: book.category,
      isbn: book.isbn || "",
      availability: book.availability,
      rack_number: book.rack_number,
      shelf: book.shelf,
      description: book.description || "",
      cover_image: book.cover_image || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingBook) {
        const { error } = await supabase
          .from("books")
          .update(formData)
          .eq("id", editingBook.id);

        if (error) throw error;
        toast.success("Book updated successfully!");
      } else {
        const { error } = await supabase.from("books").insert([formData]);

        if (error) throw error;
        toast.success("Book added successfully!");
      }

      setDialogOpen(false);
      fetchBooks();
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;

    try {
      const { error } = await supabase.from("books").delete().eq("id", id);

      if (error) throw error;
      toast.success("Book deleted successfully!");
      fetchBooks();
    } catch (error) {
      toast.error("Failed to delete book.");
    }
  };

  const toggleAvailability = async (book: Book) => {
    try {
      const { error } = await supabase
        .from("books")
        .update({ availability: !book.availability })
        .eq("id", book.id);

      if (error) throw error;
      toast.success(
        `Book marked as ${!book.availability ? "available" : "issued"}`
      );
      fetchBooks();
    } catch (error) {
      toast.error("Failed to update availability.");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
              <LayoutDashboard className="h-8 w-8 text-accent" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your library books, availability, and locations.
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                Add New Book
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingBook ? "Edit Book" : "Add New Book"}
                </DialogTitle>
                <DialogDescription>
                  {editingBook
                    ? "Update the book information below."
                    : "Fill in the details to add a new book to the library."}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Title *
                    </label>
                    <Input
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Book title"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Author *
                    </label>
                    <Input
                      required
                      value={formData.author}
                      onChange={(e) =>
                        setFormData({ ...formData, author: e.target.value })
                      }
                      placeholder="Author name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Category *
                    </label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">ISBN</label>
                    <Input
                      value={formData.isbn}
                      onChange={(e) =>
                        setFormData({ ...formData, isbn: e.target.value })
                      }
                      placeholder="978-0000000000"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Rack Number *
                    </label>
                    <Input
                      required
                      value={formData.rack_number}
                      onChange={(e) =>
                        setFormData({ ...formData, rack_number: e.target.value })
                      }
                      placeholder="A1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Shelf *
                    </label>
                    <Input
                      required
                      value={formData.shelf}
                      onChange={(e) =>
                        setFormData({ ...formData, shelf: e.target.value })
                      }
                      placeholder="1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-1 block">
                      Cover Image URL
                    </label>
                    <Input
                      value={formData.cover_image}
                      onChange={(e) =>
                        setFormData({ ...formData, cover_image: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-1 block">
                      Description
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Brief description of the book"
                      rows={3}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-1 block">
                      Availability
                    </label>
                    <Select
                      value={formData.availability ? "true" : "false"}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          availability: value === "true",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Available</SelectItem>
                        <SelectItem value="false">Issued</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting
                      ? "Saving..."
                      : editingBook
                      ? "Update Book"
                      : "Add Book"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-6 rounded-2xl bg-card border border-border shadow-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <BookOpen className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Books</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border shadow-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">{stats.available}</p>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border shadow-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/10">
                <XCircle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Issued</p>
                <p className="text-2xl font-bold">{stats.issued}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Books Table */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <div className="h-6 bg-secondary rounded animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))
              ) : books.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      No books found. Add your first book!
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                books.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{book.category}</Badge>
                    </TableCell>
                    <TableCell>
                      Rack {book.rack_number}, Shelf {book.shelf}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAvailability(book)}
                        className={
                          book.availability
                            ? "text-success hover:text-success"
                            : "text-warning hover:text-warning"
                        }
                      >
                        {book.availability ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Available
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-1" />
                            Issued
                          </>
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(book)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(book.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
