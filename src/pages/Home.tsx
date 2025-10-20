import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Coins, Calculator, ArrowUpDown, Shield } from "lucide-react";
import DecorativeBackground from "@/components/DecorativeBackground";
import SimpleParticleBackground from "@/components/SimpleParticleBackground";
import FloatingElements from "@/components/FloatingElements";
import AnimatedGrid from "@/components/AnimatedGrid";
import keypadImage from "@/assets/keypad-security.jpg";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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

      {/* Hero Section */}
      <section id="home" className="relative py-16 md:py-24 overflow-hidden">
        <DecorativeBackground />
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 relative z-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Welcome to <span className="text-primary">AGV</span>
                <br />
                <span className="text-foreground/80">Private Loan Management</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Secure financial services backed by gold and land assets. Exclusive loan 
                management system for tracking, processing, and managing financial agreements.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/login">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                    Secure Login
                  </Button>
                </Link>
                <a href="#calculators">
                  <Button size="lg" variant="outline" className="px-8">
                    Loan Calculators
                  </Button>
                </a>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden card-shadow">
                <img 
                  src={keypadImage} 
                  alt="Secure keypad for financial transactions" 
                  className="w-full h-auto"
                />
                <div className="absolute top-4 right-4">
                  <div className="bg-white rounded-full p-3 shadow-lg">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="inline-block bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Confidential
                  </span>
                </div>
                <div className="absolute bottom-4 right-4">
                  <div className="bg-white rounded-full p-3 shadow-lg">
                    <span className="text-2xl">❤️</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-background relative">
        <SimpleParticleBackground density="low" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Our <span className="text-primary">Services</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Land Document Loans */}
            <Card className="card-shadow hover:elevated-shadow transition-smooth">
              <CardContent className="p-8">
                <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Land Document Loans</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Secure loans against land documents with competitive interest rates and flexible 
                  repayment terms. All documents stored with maximum security.
                </p>
              </CardContent>
            </Card>

            {/* Gold Loans */}
            <Card className="card-shadow hover:elevated-shadow transition-smooth border-2 border-primary/20">
              <CardContent className="p-8">
                <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <Coins className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Gold Loans</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Immediate loans against gold assets with best-in-market valuation. Secure 
                  storage and detailed asset tracking for complete transparency.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Loan Calculators Section */}
      <section id="calculators" className="py-16 bg-muted/50 relative">
        <SimpleParticleBackground density="medium" />
        <FloatingElements elementCount={6} animationSpeed="slow" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Loan <span className="text-primary">Calculators</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* EMI Calculator */}
            <Card className="card-shadow hover:elevated-shadow transition-smooth text-center">
              <CardContent className="p-8">
                <div className="flex justify-center mb-6">
                  <Calculator className="h-12 w-12 text-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground">EMI Calculator</h3>
                <p className="text-muted-foreground mb-6">
                  Calculate monthly loan payments based on principal amount, interest rate, and loan tenure.
                </p>
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  Use Calculator
                </Button>
              </CardContent>
            </Card>

            {/* Gold Loan Calculator */}
            <Card className="card-shadow hover:elevated-shadow transition-smooth text-center">
              <CardContent className="p-8">
                <div className="flex justify-center mb-6">
                  <Coins className="h-12 w-12 text-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground">Gold Loan Calculator</h3>
                <p className="text-muted-foreground mb-6">
                  Estimate loan amounts against gold based on weight, purity, and current gold rates.
                </p>
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  Use Calculator
                </Button>
              </CardContent>
            </Card>

            {/* Gold Conversion */}
            <Card className="card-shadow hover:elevated-shadow transition-smooth text-center">
              <CardContent className="p-8">
                <div className="flex justify-center mb-6">
                  <ArrowUpDown className="h-12 w-12 text-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground">Gold Conversion</h3>
                <p className="text-muted-foreground mb-6">
                  Convert between carat and percentage purity to accurately assess gold asset values.
                </p>
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  Use Converter
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Secure Access CTA */}
      <section className="py-20 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
        <SimpleParticleBackground density="high" color="rgba(255, 255, 255, 0.8)" />
        <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Secure Access Required
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            This system contains confidential financial information. Only authorized personnel may proceed.
          </p>
          <Link to="/login">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-12">
              Secure Login
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-primary/95 text-white border-t border-white/10 relative overflow-hidden">
        <AnimatedGrid spacing={60} opacity={0.08} animationSpeed={0.5} />
        <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
          <p className="text-sm mb-2">
            © 2025 <strong>AGV Loan Management System</strong>. All Rights Reserved
          </p>
          <p className="text-xs text-white/70">
            Private and confidential financial management system
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
