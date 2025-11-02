import { Link } from "react-router-dom";
import DecorativeBackground from "@/components/DecorativeBackground";
import CalculatorsContent from "@/components/CalculatorsContent";
import { Button } from "@/components/ui/button";

const PublicCalculators = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      <DecorativeBackground />

      {/* Lightweight public header */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b">
        <div className="container mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="font-semibold text-lg text-foreground">
            AGV Loans
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm">Home</Button>
            </Link>
            <Link to="/login">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Calculators content */}
      <CalculatorsContent />

      {/* Simple footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground">
        © 2025 AGV Loan Management System • Public calculators
      </footer>
    </div>
  );
};

export default PublicCalculators;
