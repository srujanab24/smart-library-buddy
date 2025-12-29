import { BookOpen, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-secondary/30 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-accent" />
            <span className="font-display font-semibold">Smart Library</span>
          </div>
          
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="h-4 w-4 text-warning fill-warning" /> for Academic Excellence
          </p>
          
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Smart Library System
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
