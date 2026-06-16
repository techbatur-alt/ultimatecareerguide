import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Shield, GraduationCap, ArrowRight, Users, Award } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "13 Comprehensive Volumes",
    desc: "From Art to Science, Business to Medical — 1,100+ careers with 6,400+ areas of speciality covered in depth.",
  },
  {
    icon: GraduationCap,
    title: "Study & Bursary Info",
    desc: "10,200+ bursaries, entry requirements, places to study, and financial aid from 1,400+ organisations.",
  },
  {
    icon: Shield,
    title: "IP Protected Content",
    desc: "Secure, subscription-based access to South Africa's most comprehensive career guide since 2000.",
  },
  {
    icon: Users,
    title: "Trusted Nationwide",
    desc: "Endorsed by the Department of Basic Education and all 9 Provincial MECs of Education.",
  },
  {
    icon: Award,
    title: "25+ Years of Excellence",
    desc: "8th Edition — researched, compiled and continuously improved over 25 years by IBATUR Education.",
  },
];

const stats = [
  { value: "1,100+", label: "Careers" },
  { value: "13", label: "Volumes" },
  { value: "10,200+", label: "Bursaries" },
  { value: "25+", label: "Years" },
];

const Index = () => {
  return (
    <div>
      {/* Hero — graduation photo background */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero-graduates.jpg')" }}
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 via-secondary/40 to-secondary/60" />
        {/* Red accent bar at top */}
        <div className="absolute top-0 left-0 right-0 h-2 gradient-brand" />

        <div className="container text-center relative z-10 py-20">
          <div className="flex items-center justify-center gap-6 mb-8 animate-fade-in">
            <img src="/images/ucg-logo.png" alt="Ultimate Career Guide" className="h-20 md:h-28 object-contain" />
          </div>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black text-primary-foreground mb-4 animate-fade-in tracking-tight">
            Ultimate Career Guide
          </h1>
          <p className="text-lg md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto mb-2 animate-fade-in font-display" style={{ animationDelay: "0.2s" }}>
            "Linking People and Careers, Finding Future Solutions"
          </p>
          <p className="text-sm md:text-base text-primary-foreground/70 mb-10 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            8th Edition • 13 Volumes • 1,600+ Pages • 1,100+ Careers • 10,200+ Bursaries
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Link to="/volumes">
              <Button size="lg" className="font-display text-lg px-8 h-14">
                Explore Volumes <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="font-display text-lg px-8 h-14 bg-primary-foreground text-secondary hover:bg-primary-foreground/90">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stat boxes — directly under the hero */}
      <section className="bg-background border-b border-border">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="border-2 border-primary rounded-xl bg-card text-center py-5 px-3 hover:shadow-lg transition-shadow"
              >
                <p className="font-display text-2xl md:text-4xl font-black text-primary leading-none">{s.value}</p>
                <p className="font-display text-xs md:text-sm text-primary mt-2 uppercase tracking-wider font-bold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-14">
            <p className="font-display text-sm uppercase tracking-widest text-primary mb-2">Why Choose UCG</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Your Complete Career Companion
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-full gradient-brand flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-display text-base font-bold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Volume Preview Grid */}
      <section className="py-20 bg-muted border-y border-border">
        <div className="container">
          <div className="text-center mb-10">
            <p className="font-display text-sm uppercase tracking-widest text-primary mb-2">Our Library</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              10 Career Volumes + 3 Guidance Volumes
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Access all 13 volumes with a single subscription — <strong className="text-foreground">ZAR 3,415.00</strong>.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {Array.from({ length: 10 }, (_, i) => (
              <Link key={i} to="/volumes" className="group">
                <div className="rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-border hover:-translate-y-1">
                  <img
                    src={`/images/covers/volume-${String(i + 1).padStart(2, "0")}.jpg`}
                    alt={`Volume ${i + 1}`}
                    className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/volumes">
              <Button size="lg" className="font-display h-12">
                View All Volumes <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-brand text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/images/hero-graduates.jpg')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="container text-center relative z-10">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Start Your Career Journey Today
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-lg mx-auto">
            Subscribe now and unlock all 13 volumes of the Ultimate Career Guide for just <strong>ZAR 3,415.00/year</strong>.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="font-display text-lg px-10 h-14">
              Sign Up
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
