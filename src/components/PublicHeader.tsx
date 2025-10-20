import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PublicHeader = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              <span className="text-primary">AGV</span>{" "}
              <span className="text-foreground">Loans</span>
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
              Home
            </a>
            <a href="#services" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
              Services
            </a>
            <a href="#calculators" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
              Calculators
            </a>
            <Link to="/login">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Login
              </Button>
            </Link>
          </nav>

          <Link to="/login" className="md:hidden">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
