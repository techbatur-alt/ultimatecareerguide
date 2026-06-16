import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Quote, Star, BookOpen, GraduationCap, Award } from "lucide-react";

const ministerialTestimonials = [
  {
    name: "Prof Kader Asmal",
    title: "Former Minister of Education",
    quote: "Education provides an opportunity for young people to secure themselves a bright future. It equips them to make a positive contribution to our economy and democracy. Choosing appropriate careers is a step towards achieving these objectives. We salute The Ultimate Career Guide in its efforts to provide career information that is accessible nation-wide and which is, with each new edition, improved and upgraded according to the changing environment.",
  },
  {
    name: "Ms Naledi Pandor",
    title: "Former Minister of Education",
    quote: "The Ultimate Career Guide is an established and authoritative publication in the career guidance field and supports our aim to provide better information to young people on how to approach their dream of improving their lives and those of their future families. To all our staff and learners attached to the different levels of education institutions in our country, I recommend this guide. Use it to map a journey from school to a rewarding career.",
  },
];

const provincialTestimonials = [
  { province: "Eastern Cape", quote: "The Ultimate Career Guide is an oasis of guidelines to a young mind lost in a desert of incomprehensible information." },
  { province: "Free State", quote: "The Ultimate Career Guide is a comprehensive manual, filled with important information that is presented colorful and user-friendly." },
  { province: "Gauteng", quote: "I support the endeavors of this publication aimed at providing information about available career options." },
  { province: "KwaZulu-Natal", quote: "I want to thank The Ultimate Career Guide for their profound contribution in ensuring learners make informed decisions." },
  { province: "Limpopo", quote: "The distinctive characteristics of this publication are its comprehensiveness, user-friendliness and informative content." },
  { province: "Mpumalanga", quote: "I can recommend The Ultimate Career Guide as a handbook to inform and teach our children about all the possibilities." },
  { province: "Northern Cape", quote: "I have no doubt that The Ultimate Career Guide has the knowledge and passion for education." },
  { province: "North West", quote: "This guide will help children decide on a career and help solve unemployment issues." },
  { province: "Western Cape", quote: "I sincerely think The Ultimate Career Guide will assist learners to make well-informed decisions about a variety of careers." },
];

const privateTestimonials = [
  { name: "Barbara A. Donaldson", title: "Industrial & Counselling Psychologist", quote: "The comprehensive descriptions of careers in the Guide has come in very useful in matters where I have been giving evidence in Court." },
  { name: "Antoinette Cook", title: "Educational Psychologist", quote: "I think The Ultimate Career Guide is the best career resource that is currently available. Congratulations on an outstanding product!" },
  { name: "Dr Lanette Hattingh", title: "Educational Psychologist, Edu Ecstatic (Pty) Ltd", quote: "There is absolutely nothing in print that compares to the information available in The Ultimate Career Guide. Every new edition is a surprise – packed with new, ever-more useful information!" },
  { name: "Clem Sunter", title: "Chairman, Corporate Affairs – Anglo American Corporation of SA", quote: "I compliment and encourage publications like The Ultimate Career Guide to keep being a vehicle, whether for choosing a career, or for changing careers." },
];

const whyUCGPoints = [
  "Support of National DOE plus all 9 Provincial MEC's since inception in 2000.",
  "Available in both printed and digital format.",
  "Provides the highest number of careers (1,100+), in user-friendly A4 size.",
  "Careers expanded to include 6,400+ areas of interest/speciality.",
  "Over 10,200 Bursaries from 1,400+ organisations.",
  "Hailed by competitors as the best career guidance publication in SA.",
  "Eliminates time-consuming clicking – undergrad courses included as part of University entries.",
  "Job creation potential runs into thousands.",
  "Sponsors' exposure is vast — guides used many years longer than their minimum shelf life.",
];

const Testimonials = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hero-graduates.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 to-primary/80" />
        <div className="container relative z-10 text-center">
          <p className="font-display text-sm uppercase tracking-widest text-primary-foreground/70 mb-3">What They Say</p>
          <h1 className="font-display text-4xl md:text-5xl font-black text-primary-foreground mb-4">
            Testimonials & References
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Trusted by Ministers of Education, Provincial MECs, and leading professionals across South Africa since 2000.
          </p>
        </div>
      </section>

      <div className="container max-w-5xl py-12">
        <Tabs defaultValue="ministerial" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-12 mb-8">
            <TabsTrigger value="ministerial" className="font-display">Ministerial</TabsTrigger>
            <TabsTrigger value="provincial" className="font-display">Provincial MECs</TabsTrigger>
            <TabsTrigger value="private" className="font-display">Professionals</TabsTrigger>
          </TabsList>

          <TabsContent value="ministerial" className="space-y-6">
            {ministerialTestimonials.map((t, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-shadow">
                <Quote className="w-10 h-10 text-primary mb-4 opacity-30" />
                <p className="text-foreground italic leading-relaxed mb-6 text-lg">"{t.quote}"</p>
                <div className="flex items-center gap-3 border-t border-border pt-4">
                  <div className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center">
                    <Award className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <span className="font-display font-bold">{t.name}</span>
                    <p className="text-sm text-muted-foreground">{t.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="provincial" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {provincialTestimonials.map((t, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center shrink-0">
                      <span className="text-primary-foreground font-display text-xs font-bold">{t.province.substring(0, 2).toUpperCase()}</span>
                    </div>
                    <h3 className="font-display font-bold">{t.province}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm italic leading-relaxed">"{t.quote}"</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="private" className="space-y-6">
            {privateTestimonials.map((t, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-shadow">
                <Quote className="w-8 h-8 text-primary mb-3 opacity-30" />
                <p className="text-foreground italic leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3 border-t border-border pt-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <span className="font-display font-bold">{t.name}</span>
                    <p className="text-sm text-muted-foreground">{t.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>

        {/* Why UCG */}
        <section className="mt-16">
          <div className="text-center mb-10">
            <p className="font-display text-sm uppercase tracking-widest text-primary mb-2">The Facts</p>
            <h2 className="font-display text-3xl font-black flex items-center justify-center gap-3">
              <BookOpen className="w-8 h-8 text-primary" />
              Why Use The Ultimate Career Guide?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {whyUCGPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-4 bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center shrink-0">
                  <span className="text-primary-foreground font-display text-sm font-bold">{i + 1}</span>
                </div>
                <p className="text-sm leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Testimonials;
