import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, CheckCircle, Layers, Users } from "lucide-react";

interface Stats {
  totalBooks: number;
  availableBooks: number;
  categories: number;
  issuedBooks: number;
}

const StatsSection = () => {
  const [stats, setStats] = useState<Stats>({
    totalBooks: 0,
    availableBooks: 0,
    categories: 0,
    issuedBooks: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: books } = await supabase.from("books").select("*");

      if (books) {
        const categories = new Set(books.map((book) => book.category));
        const availableBooks = books.filter((book) => book.availability);

        setStats({
          totalBooks: books.length,
          availableBooks: availableBooks.length,
          categories: categories.size,
          issuedBooks: books.length - availableBooks.length,
        });
      }
    };

    fetchStats();
  }, []);

  const statItems = [
    { icon: BookOpen, label: "Total Books", value: stats.totalBooks, color: "text-accent" },
    { icon: CheckCircle, label: "Available", value: stats.availableBooks, color: "text-success" },
    { icon: Layers, label: "Categories", value: stats.categories, color: "text-primary" },
    { icon: Users, label: "Issued", value: stats.issuedBooks, color: "text-warning" },
  ];

  return (
    <section className="py-16 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {statItems.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center p-6 rounded-2xl bg-card border border-border shadow-card animate-scale-in opacity-0"
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: "forwards",
              }}
            >
              <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
              <div className="font-display text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
