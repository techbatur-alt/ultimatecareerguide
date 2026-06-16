import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Phone, BookOpen, Shield, Calendar, Eye, Globe, Target, Users, Building2, GraduationCap, Award, CheckCircle, MapPin, Send } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const clients = [
  "North West Education Department — Life Skills and HIV/AIDS Education",
  "Mpumalanga Education Department",
  "KwaZulu-Natal Education Department",
  "Gauteng Department of Education",
  "BHP Billiton",
  "XStrata",
  "De Beers",
  "Free State Library Services",
  "Western Cape Library Services",
  "All Educational Institutions (Universities, UoTs, TVET/FET Colleges, Schools)",
  "Psychologists & Personnel Agencies",
];

const About = () => {
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });

  return (
    <div>
      {/* Hero banner */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hero-graduates.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 to-primary/80" />
        <div className="container relative z-10 text-center">
          <p className="text-sm uppercase tracking-widest text-primary-foreground/70 mb-3">Discover Our Story</p>
          <h1 className="text-4xl md:text-5xl font-black text-primary-foreground mb-4">About Us</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            25+ years of empowering South Africa's learners with comprehensive career guidance
          </p>
        </div>
      </section>

      <div className="container max-w-5xl py-12">
        <Tabs defaultValue="ucg" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-12 bg-secondary">
            <TabsTrigger value="ucg" className="text-xs sm:text-sm text-secondary-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">eUCG</TabsTrigger>
            <TabsTrigger value="ibatur" className="text-xs sm:text-sm text-secondary-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">IBATUR</TabsTrigger>
            <TabsTrigger value="contact" className="text-xs sm:text-sm text-secondary-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Contact</TabsTrigger>
            <TabsTrigger value="terms" className="text-xs sm:text-sm text-secondary-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">T&Cs</TabsTrigger>
          </TabsList>

          {/* About the eUCG */}
          <TabsContent value="ucg" className="mt-8 space-y-8">
            {/* Intro with image */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold">About the Ultimate Career Guide</h2>
                </div>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  The Ultimate Career Guide is a high-quality reference work — regularly updated, expanded and packed with career and career-related information. It is always geared towards supplying up-to-date information in a clear, concise manner to users, assisting them with the precision of career choice and subsequent mapping of a career path.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  The E-version is A4 in size with 1,600+ pages, colour-coded for easy reference, including comments from the Minister of Basic Education and all nine Provincial Education Departments.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <img src="/images/covers/volume-01.jpg" alt="Volume 1" className="rounded-xl shadow-lg w-full aspect-[3/4] object-cover" />
                <img src="/images/covers/volume-02.jpg" alt="Volume 2" className="rounded-xl shadow-lg w-full aspect-[3/4] object-cover mt-6" />
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { val: "8th Edition", sub: "Oct 2025" },
                { val: "13 Volumes", sub: "10 Career + 3 Guidance" },
                { val: "1,100+", sub: "Careers Covered" },
                { val: "10,200+", sub: "Bursaries Listed" },
                { val: "6,400+", sub: "Areas of Speciality" },
                { val: "1,600+", sub: "Total Pages" },
                { val: "1,400+", sub: "Financial Aid Orgs" },
                { val: "25+ Years", sub: "Since 2000" },
              ].map((s) => (
                <div key={s.val} className="bg-muted rounded-xl p-5 text-center border border-border hover:border-primary/30 transition-colors">
                  <p className="text-lg font-black text-primary">{s.val}</p>
                  <p className="text-xs text-muted-foreground">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Edition History */}
            <div className="bg-card border border-border rounded-xl p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Edition History
              </h3>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {[
                  { ed: "1st", year: "2000" }, { ed: "2nd", year: "2002" }, { ed: "3rd", year: "2004" }, { ed: "4th", year: "2007" },
                  { ed: "5th", year: "2009" }, { ed: "6th", year: "2014" }, { ed: "7th", year: "2021" }, { ed: "8th", year: "2025" },
                ].map((e) => (
                  <div key={e.ed} className={`rounded-xl p-3 text-center border ${e.ed === "8th" ? "gradient-brand text-primary-foreground border-transparent" : "bg-secondary text-secondary-foreground border-border"}`}>
                    <p className="font-bold text-sm">{e.ed}</p>
                    <p className={`text-xs ${e.ed === "8th" ? "text-primary-foreground/80" : "text-secondary-foreground/70"}`}>{e.year}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* What Each Career Provides */}
            <div className="bg-card border border-border rounded-xl p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" /> What Each Career Entry Provides
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "What does one do in this career?", "What will the workplace be like?",
                  "Satisfactory and demanding aspects", "Instruments, tools or materials used",
                  "Where can I study?", "Types of companies that might employ you",
                  "APS (Admission Point Score) information", "Compulsory subjects and marks required",
                  "Similar careers to consider", "How to prepare for this career",
                  "Personality traits, interests and abilities", "Expected 1st year subjects and study duration",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 bg-muted rounded-lg p-3">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="gradient-brand rounded-xl p-8 text-primary-foreground">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" /> Subscription & Pricing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-primary-foreground/10 backdrop-blur rounded-xl p-6">
                  <p className="text-3xl font-black">R3,415</p>
                  <p className="text-sm opacity-80">Initial Pricing — 1 Year access to all 13 eVolumes</p>
                </div>
                <div className="bg-primary-foreground/10 backdrop-blur rounded-xl p-6">
                  <p className="text-3xl font-black">R500/yr</p>
                  <p className="text-sm opacity-80">Subsequent Subscription — Includes new editions, updates & training</p>
                </div>
              </div>
              <p className="text-sm mt-4 opacity-70">Each subscription allows 1 account holder + 1 student/learner, on up to 2 devices.</p>
            </div>
          </TabsContent>

          {/* About IBATUR */}
          <TabsContent value="ibatur" className="mt-8 space-y-8">
            <div className="bg-secondary text-secondary-foreground rounded-xl p-8">
              {/* Publisher section with Alba's photo */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img src="/images/ibatur-logo.jpg" alt="IBATUR Education" className="h-16 object-contain" />
                    <div>
                      <h2 className="text-2xl font-bold text-secondary-foreground">IBATUR Education CC</h2>
                      <p className="text-secondary-foreground/70 text-sm">A House of Learning — Reg. No. 2008/154448/23</p>
                    </div>
                  </div>

                  <div className="bg-secondary-foreground/10 rounded-xl p-6">
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-secondary-foreground">
                      <Eye className="w-5 h-5 text-primary" /> Vision
                    </h3>
                    <p className="text-secondary-foreground/80 leading-relaxed">
                      To be Africa's leading provider of comprehensive, accessible, and transformative career guidance — empowering every learner to make informed career decisions regardless of their geographic, economic, or social circumstances.
                    </p>
                  </div>

                  <div className="bg-secondary-foreground/10 rounded-xl p-6">
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-secondary-foreground">
                      <Target className="w-5 h-5 text-primary" /> Mission
                    </h3>
                    <p className="text-secondary-foreground/80 leading-relaxed">
                      To research, compile, publish and distribute the most comprehensive career guidance resource in South Africa — welcoming people to a multiplicity of opportunities, upliftment, and the journey of becoming their own teacher.
                    </p>
                  </div>
                </div>

                {/* Publisher Card with Photo */}
                <div className="bg-secondary-foreground/10 rounded-xl p-6 text-center">
                  <img src="/images/alba-picture.jpg" alt="Alba Delport — Publisher" className="w-40 h-40 rounded-full mx-auto mb-4 object-cover shadow-lg border-4 border-primary/40" />
                  <h3 className="text-lg font-bold text-secondary-foreground">Alba Delport</h3>
                  <p className="text-primary text-sm font-bold mb-3">Publisher & Entrepreneur</p>
                  <p className="text-secondary-foreground/70 text-xs leading-relaxed">
                    34 years' experience in researching, compiling, publishing and expanding career guidance publications. Based in the Midrand Area of Johannesburg. Focused on education, upliftment and betterment of the future of all South Africans.
                  </p>
                </div>
              </div>

              {/* Corporate Profile */}
              <div className="bg-secondary-foreground/10 rounded-xl p-8 mt-8">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-secondary-foreground">
                  <Users className="w-5 h-5 text-primary" /> Corporate Profile
                </h3>
                <p className="text-secondary-foreground/80 leading-relaxed mb-4">
                  IBATUR Education CC is a South African publishing company specialising in career guidance and educational resources. Since 2000, IBATUR has been publishing The Ultimate Career Guide, rendering a much-needed service to South Africa's learners.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-secondary-foreground/10 rounded-xl p-5 text-center">
                    <p className="text-2xl font-black text-primary">5,000+</p>
                    <p className="text-xs text-secondary-foreground/70">Schools Reached</p>
                  </div>
                  <div className="bg-secondary-foreground/10 rounded-xl p-5 text-center">
                    <p className="text-2xl font-black text-primary">4.5M</p>
                    <p className="text-xs text-secondary-foreground/70">Learners Reached</p>
                  </div>
                  <div className="bg-secondary-foreground/10 rounded-xl p-5 text-center">
                    <p className="text-2xl font-black text-primary">12M+</p>
                    <p className="text-xs text-secondary-foreground/70">Monthly Views</p>
                  </div>
                </div>
              </div>

              {/* Our Aim */}
              <div className="bg-secondary-foreground/10 rounded-xl p-8 mt-8">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-secondary-foreground">
                  <Globe className="w-5 h-5 text-primary" /> Our Aim
                </h3>
                <p className="text-secondary-foreground/80 leading-relaxed">
                  To help equip as many people as possible, but especially learners in remote, rural and deep-rural areas who do not have access to comprehensive career information, to make a positive contribution to the economy and social prosperity of our country.
                </p>
              </div>

              {/* Clients */}
              <div className="bg-secondary-foreground/10 rounded-xl p-8 mt-8">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-secondary-foreground">
                  <Building2 className="w-5 h-5 text-primary" /> Some of Our Clients
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {clients.map((c) => (
                    <div key={c} className="flex items-start gap-3 bg-secondary-foreground/5 rounded-lg p-3">
                      <span className="text-primary font-bold mt-0.5">•</span>
                      <span className="text-sm text-secondary-foreground/80">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Contact Us — donasmates-style layout */}
          <TabsContent value="contact" className="mt-8">
            <div className="bg-secondary text-secondary-foreground rounded-xl overflow-hidden">
              {/* Header */}
              <div className="relative py-16 px-8 text-center" style={{ backgroundImage: "url('/images/hero-graduates.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>
                <div className="absolute inset-0 bg-secondary/85" />
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold text-secondary-foreground mb-2">Partner With Us</h2>
                  <p className="text-secondary-foreground/70 max-w-xl mx-auto">
                    Join us in empowering the next generation. Whether through subscriptions, sponsorship, or partnerships, every contribution makes a difference.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Contact Form */}
                <div className="p-8">
                  <h3 className="text-xl font-bold mb-6 text-secondary-foreground">Send Us a Message</h3>
                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!contactForm.name || !contactForm.email || !contactForm.message) {
                        alert("Please fill in your name, email and message.");
                        return;
                      }
                      const subject = encodeURIComponent(`UCG Contact: ${contactForm.name}`);
                      const body = encodeURIComponent(
                        `Name: ${contactForm.name}\nEmail: ${contactForm.email}\n\n${contactForm.message}`
                      );
                      // Open the user's email client pre-populated. Reliable & works with no infra.
                      window.location.href = `mailto:info@ibatur.co.za?subject=${subject}&body=${body}`;
                    }}
                  >
                    <div>
                      <label className="text-sm text-secondary-foreground/70 mb-1 block">Your Name</label>
                      <input
                        type="text"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full rounded-lg bg-secondary-foreground/10 border border-secondary-foreground/20 px-4 py-3 text-secondary-foreground placeholder:text-secondary-foreground/40 focus:outline-none focus:border-primary"
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm text-secondary-foreground/70 mb-1 block">Email Address</label>
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full rounded-lg bg-secondary-foreground/10 border border-secondary-foreground/20 px-4 py-3 text-secondary-foreground placeholder:text-secondary-foreground/40 focus:outline-none focus:border-primary"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm text-secondary-foreground/70 mb-1 block">Message</label>
                      <textarea
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        rows={4}
                        className="w-full rounded-lg bg-secondary-foreground/10 border border-secondary-foreground/20 px-4 py-3 text-secondary-foreground placeholder:text-secondary-foreground/40 focus:outline-none focus:border-primary resize-none"
                        placeholder="How can we help?"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full gap-2">
                      <Send className="w-4 h-4" /> Send Message
                    </Button>
                    <p className="text-xs text-secondary-foreground/50 text-center">
                      Opens your email app pre-filled. Or email us directly at info@ibatur.co.za
                    </p>
                  </form>
                </div>

                {/* Contact Info */}
                <div className="p-8 bg-secondary-foreground/5">
                  <h3 className="text-xl font-bold mb-6 text-secondary-foreground">Contact Information</h3>
                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-bold text-secondary-foreground text-sm">Email</p>
                        <a href="mailto:alba@ibatur.co.za" className="text-primary text-sm hover:underline">alba@ibatur.co.za</a>
                        <span className="text-secondary-foreground/50 text-sm"> | </span>
                        <a href="mailto:info@ibatur.co.za" className="text-primary text-sm hover:underline">info@ibatur.co.za</a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-bold text-secondary-foreground text-sm">Phone</p>
                        <a href="tel:+27833329584" className="text-primary text-sm hover:underline">+27 83 332 9584</a>
                        <span className="text-secondary-foreground/50 text-sm"> | </span>
                        <a href="tel:+27781697903" className="text-primary text-sm hover:underline">+27 78 169 7903</a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-bold text-secondary-foreground text-sm">Address</p>
                        <p className="text-secondary-foreground/70 text-sm">PO Box 636, Lonehill 2062, South Africa</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center shrink-0">
                        <Globe className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-bold text-secondary-foreground text-sm">Website</p>
                        <a href="https://careers4africa.com" target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline">careers4africa.com</a>
                      </div>
                    </div>
                  </div>

                  {/* Resources */}
                  <div className="mt-8 pt-6 border-t border-secondary-foreground/10">
                    <h4 className="font-bold text-secondary-foreground text-sm mb-4">Resources</h4>
                    <a href="https://gamma.app/docs/ULTIMATE-CAREER-GUIDE-TRAINING-MANUAL-14ex81f9iwaa03n?mode=doc" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-secondary-foreground/10 rounded-lg p-3 hover:bg-secondary-foreground/15 transition-colors mb-2">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-bold text-sm text-secondary-foreground">Training Manual</p>
                        <p className="text-xs text-secondary-foreground/60">Learn how to use the eUCG effectively</p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Terms & Conditions */}
          <TabsContent value="terms" className="mt-8">
            <div className="bg-secondary text-secondary-foreground rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-secondary-foreground">
                <Shield className="w-6 h-6 text-primary" /> Terms & Conditions
              </h2>
              <div className="space-y-4">
                {[
                  { title: "1. Intellectual Property", text: "The Ultimate Career Guide (eUCG) and all its contents are the intellectual property of IBATUR Education CC. Unauthorized reproduction, distribution, copying, screenshotting, or any form of duplication is strictly prohibited." },
                  { title: "2. Subscription Terms", text: "The initial subscription fee of ZAR 3,415.00 grants access to all 13 eVolumes for 1 year. Annual renewal at ZAR 500.00 includes new editions, updates, and after-sales training." },
                  { title: "3. Account Usage", text: "Each subscription is limited to 1 account holder and 1 registered student/learner sub-profile. Access is limited to 2 devices simultaneously." },
                  { title: "4. Content Protection", text: "Screenshots, screen recording, copying, printing, or any form of content extraction is prohibited. The platform employs technical measures to prevent such activities." },
                  { title: "5. KYC Requirements", text: "All account holders must complete KYC verification including email confirmation, mobile verification, and ID number submission." },
                  { title: "6. Refund Policy", text: "Subscriptions are non-refundable after activation. A cooling-off period of 7 days applies from the date of purchase, provided no volumes have been accessed." },
                ].map((t) => (
                  <div key={t.title} className="bg-secondary-foreground/10 rounded-xl p-5 border-l-4 border-primary">
                    <h4 className="font-bold mb-2 text-secondary-foreground">{t.title}</h4>
                    <p className="text-sm text-secondary-foreground/70">{t.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default About;
