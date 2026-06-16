import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, School, Library, Building, Shield, Users, GraduationCap, ArrowRight, Heart } from "lucide-react";

const categories = [
  {
    title: "Primary Schools",
    icon: School,
    image: "/images/covers/volume-03.jpg",
    description: "Introducing career awareness to young learners from an early age. The UCG helps primary school educators integrate career exploration into Life Orientation lessons, sparking curiosity and ambition in children across South Africa.",
  },
  {
    title: "Secondary Schools",
    icon: GraduationCap,
    image: "/images/covers/volume-05.jpg",
    description: "Equipping high school learners with the tools to make informed career decisions. Subject choices, APS requirements, bursary information, and career paths — all in one comprehensive resource that transforms Life Orientation classrooms.",
  },
  {
    title: "Libraries",
    icon: Library,
    image: "/images/covers/volume-07.jpg",
    description: "Provincial and municipal libraries serve as critical access points for career information. The UCG is available in libraries across all 9 provinces, ensuring communities have free access to comprehensive career guidance resources.",
  },
  {
    title: "Correctional Service Centres",
    icon: Shield,
    image: "/images/covers/volume-09.jpg",
    description: "Rehabilitation through career guidance. The UCG provides inmates with information on career options post-release, helping to reduce recidivism by empowering individuals with knowledge about legitimate career paths and opportunities.",
  },
  {
    title: "Community Centres",
    icon: Heart,
    image: "/images/covers/volume-01.jpg",
    description: "Bringing career guidance directly to communities. Community centres in townships, rural areas, and informal settlements use the UCG to run career workshops, helping unemployed youth and career changers explore new opportunities.",
  },
];

const impactStats = [
  { value: "200,000", label: "Career Guides", sub: "to be distributed" },
  { value: "20,808", label: "Schools", sub: "reached nationwide" },
  { value: "11M+", label: "Learners", sub: "impacted across SA" },
  { value: "53,709", label: "UCG Sets", sub: "distributed" },
];

const UCGProject = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hero-graduates.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/90 via-secondary/80 to-secondary/95" />
        <div className="container relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-display font-bold mb-4">
            Careers4Africa-SA26
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-black text-primary-foreground mb-4">
            UCG Career Guidance<br />
            <span className="text-primary">Project</span>
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Our most ambitious education initiative yet — distributing 200,000 comprehensive career guides to empower young South Africans to discover career opportunities and plan their futures with confidence.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/sponsorship">
              <Button size="lg" className="font-display h-14 text-lg px-8">
                <Heart className="w-5 h-5 mr-2" /> Support This Project
              </Button>
            </Link>
            <Link to="/sponsorship-tracker">
              <Button size="lg" variant="secondary" className="font-display h-14 text-lg px-8 bg-primary-foreground text-secondary">
                Sponsorship Tracker <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {impactStats.map((s) => (
              <div key={s.label} className="text-center bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <p className="font-display text-3xl md:text-4xl font-black text-primary">{s.value}</p>
                <p className="font-display font-bold text-sm">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Gallery */}
      <section className="py-16 bg-muted">
        <div className="container">
          <div className="text-center mb-12">
            <p className="font-display text-sm uppercase tracking-widest text-primary mb-2">Where We Reach</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Distribution Categories</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              The UCG reaches learners and communities through multiple channels across South Africa
            </p>
          </div>
          <div className="space-y-8">
            {categories.map((cat, i) => (
              <div key={cat.title} className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${i % 2 !== 0 ? "lg:direction-rtl" : ""}`}>
                <div className={`${i % 2 !== 0 ? "lg:order-2" : ""}`}>
                  <div className="relative rounded-xl overflow-hidden shadow-xl group">
                    <img src={cat.image} alt={cat.title} className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center">
                        <cat.icon className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <span className="font-display font-bold text-primary-foreground text-lg">{cat.title}</span>
                    </div>
                  </div>
                </div>
                <div className={`${i % 2 !== 0 ? "lg:order-1" : ""}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center">
                      <cat.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-2xl font-bold">{cat.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{cat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Mission Section */}
      <section className="py-20 bg-background">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <p className="font-display text-sm uppercase tracking-widest text-primary mb-2">Our Purpose</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Support Our Mission</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Using career guidance as a critical tool to empower youth, bridging the gap between education and employment in South Africa's most vulnerable communities.
            </p>
          </div>

          {/* Challenge */}
          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <h3 className="font-display text-xl font-bold mb-4">The Challenge We Address</h3>
            <p className="text-muted-foreground mb-6">
              In communities across South Africa, young people face unprecedented challenges: limited career awareness, resource inequality, and a widening skills gap. Youth unemployment stands at 62.4% — millions of learners make life-altering career choices without adequate guidance.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: Shield, title: "Protection", desc: "Keeping youth informed and away from uninformed career choices" },
                { icon: Users, title: "Community", desc: "Supporting learners in under-resourced schools and communities" },
                { icon: Heart, title: "Empowerment", desc: "Providing comprehensive career information to bridge inequality" },
              ].map((item) => (
                <div key={item.title} className="bg-muted rounded-xl p-6 text-center">
                  <div className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center mx-auto mb-3">
                    <item.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h4 className="font-display font-bold mb-1">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-card border border-border rounded-xl p-8 border-l-4 border-l-primary">
              <h3 className="font-display text-xl font-bold mb-3">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To harness the transformative power of career guidance as the primary tool for youth development, enabling young people across South Africa to overcome barriers of access and make informed career decisions.
              </p>
              <ul className="space-y-2">
                {[
                  "Bridge the career information gap in rural and township schools",
                  "Provide comprehensive guidance to every learner regardless of location",
                  "Create pathways to education and career opportunities",
                  "Extend career guidance to libraries and community centres",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary font-bold mt-0.5">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card border border-border rounded-xl p-8 border-l-4 border-l-primary">
              <h3 className="font-display text-xl font-bold mb-3">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We envision a South Africa where every young person, regardless of their socioeconomic background, has access to comprehensive career guidance and the information needed to thrive as positive contributors to society.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><span className="text-primary font-bold mt-0.5">→</span> Every school equipped with career guidance resources</li>
                <li className="flex items-start gap-2"><span className="text-primary font-bold mt-0.5">→</span> Young people empowered as informed career decision-makers</li>
                <li className="flex items-start gap-2"><span className="text-primary font-bold mt-0.5">→</span> Breaking cycles of unemployment through education</li>
                <li className="flex items-start gap-2"><span className="text-primary font-bold mt-0.5">→</span> A nationwide network of career guidance access points</li>
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="gradient-brand rounded-xl p-10 text-center text-primary-foreground">
            <h3 className="font-display text-2xl font-bold mb-3">Join Us in Making a Difference</h3>
            <p className="opacity-90 mb-6 max-w-lg mx-auto">
              Your support helps us reach more young people and expand career guidance to more communities across South Africa.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/sponsorship">
                <Button size="lg" variant="secondary" className="font-display">
                  <Heart className="w-4 h-4 mr-2" /> Become a Sponsor
                </Button>
              </Link>
              <a href="mailto:info@ibatur.co.za">
                <Button size="lg" variant="secondary" className="font-display">
                  <Building className="w-4 h-4 mr-2" /> Contact Us
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UCGProject;
