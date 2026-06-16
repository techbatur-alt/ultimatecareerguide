import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Heart, GraduationCap, HandHeart, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Partners = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hero-graduates.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 to-primary/80" />
        <div className="container relative z-10 text-center">
          <p className="font-display text-sm uppercase tracking-widest text-primary-foreground/70 mb-3">Together We Grow</p>
          <h1 className="font-display text-4xl md:text-5xl font-black text-primary-foreground mb-4">Our Partners</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Together we are linking people and careers, finding future solutions.
          </p>
        </div>
      </section>

      <div className="container max-w-5xl py-12">
        <Tabs defaultValue="npos" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-12 mb-8">
            <TabsTrigger value="npos" className="font-display text-xs sm:text-sm"><Heart className="w-4 h-4 mr-1 hidden sm:inline" /> NPOs</TabsTrigger>
            <TabsTrigger value="pbos" className="font-display text-xs sm:text-sm"><HandHeart className="w-4 h-4 mr-1 hidden sm:inline" /> PBOs</TabsTrigger>
            <TabsTrigger value="dbe" className="font-display text-xs sm:text-sm"><GraduationCap className="w-4 h-4 mr-1 hidden sm:inline" /> DBE</TabsTrigger>
            <TabsTrigger value="sponsors" className="font-display text-xs sm:text-sm"><Building2 className="w-4 h-4 mr-1 hidden sm:inline" /> Sponsors</TabsTrigger>
          </TabsList>

          <TabsContent value="npos" className="mt-6">
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary-foreground" />
                </div>
                <h2 className="font-display text-2xl font-bold">Non-Profit Organisations (NPOs)</h2>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                We partner with NPOs across South Africa to ensure career guidance reaches every learner, especially those in remote and rural communities who need it most.
              </p>
              <div className="bg-muted rounded-xl p-8 text-center">
                <Heart className="w-12 h-12 mx-auto text-primary/30 mb-3" />
                <p className="text-muted-foreground italic mb-3">Partner information coming soon. Contact us to become a partner.</p>
                <a href="mailto:info@ibatur.co.za">
                  <Button variant="outline" className="font-display"><Mail className="w-4 h-4 mr-2" /> info@ibatur.co.za</Button>
                </a>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pbos" className="mt-6">
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center">
                  <HandHeart className="w-6 h-6 text-primary-foreground" />
                </div>
                <h2 className="font-display text-2xl font-bold">Public Benefit Organisations (PBOs)</h2>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                PBOs play a vital role in our mission to make career guidance accessible to all South African learners. Through Section 18A tax-deductible donations, sponsors can contribute to providing free UCG sets to disadvantaged schools.
              </p>
              <div className="bg-muted rounded-xl p-8 text-center">
                <HandHeart className="w-12 h-12 mx-auto text-primary/30 mb-3" />
                <p className="text-muted-foreground italic mb-3">Partner information coming soon.</p>
                <a href="mailto:info@ibatur.co.za">
                  <Button variant="outline" className="font-display"><Mail className="w-4 h-4 mr-2" /> Contact Us</Button>
                </a>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dbe" className="mt-6">
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-primary-foreground" />
                </div>
                <h2 className="font-display text-2xl font-bold">Department of Basic Education</h2>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                The Ultimate Career Guide has been endorsed by the Department of Basic Education and all 9 Provincial MECs of Education since 2000. Life Orientation is a compulsory subject, and the UCG supports educators in delivering comprehensive career guidance.
              </p>
              <h3 className="font-display font-bold text-lg mb-4">Provincial Departments Served:</h3>
              <div className="grid grid-cols-3 gap-3">
                {["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"].map(p => (
                  <div key={p} className="bg-muted rounded-xl px-4 py-3 text-center font-display font-medium text-sm border border-border hover:border-primary/30 transition-colors">{p}</div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sponsors" className="mt-6">
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <h2 className="font-display text-2xl font-bold">Sponsors</h2>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                We offer multi-tiered sponsorship opportunities through our Careers4Africa-SA26 project, reaching 20,808 schools and impacting 11+ million learners.
              </p>
              <div className="bg-muted rounded-xl p-6 border-l-4 border-primary mb-6">
                <h3 className="font-display font-bold mb-2">Some of Our Clients</h3>
                <p className="text-muted-foreground text-sm">
                  North West, Mpumalanga, KwaZulu-Natal & Gauteng Education Departments • BHP Billiton • XStrata • De Beers • Free State & Western Cape Library Services • Universities & TVET Colleges
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link to="/sponsorship">
                  <Button className="font-display">View Sponsorship Tiers</Button>
                </Link>
                <Link to="/sponsorship-tracker">
                  <Button variant="outline" className="font-display">View Sponsorship Tracker</Button>
                </Link>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Partners;
