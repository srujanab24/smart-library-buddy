import { Search, CheckCircle, MapPin, Sparkles } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Fast Book Search",
    description:
      "Quickly find books by title, author, or category with our instant search functionality.",
  },
  {
    icon: CheckCircle,
    title: "Availability Tracking",
    description:
      "Real-time updates on book availability status — know instantly if a book is available or issued.",
  },
  {
    icon: MapPin,
    title: "Rack Location Display",
    description:
      "Get exact rack numbers and shelf positions to locate books instantly in the library.",
  },
  {
    icon: Sparkles,
    title: "Smart Recommendations",
    description:
      "Discover related books based on categories and authors with intelligent recommendations.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Powerful Features
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to efficiently manage and retrieve books from your library.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="feature-card group animate-fade-in opacity-0"
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: "forwards",
              }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 text-accent mb-4 transition-transform group-hover:scale-110">
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
