import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { volumes } from "@/lib/volumes";
import { BookOpen, GraduationCap } from "lucide-react";


const Volumes = () => {
  const careerVolumes = volumes.filter((v) => v.category === "career");
  const guidanceVolumes = volumes.filter((v) => v.category === "guidance");

  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hero-graduates.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 to-primary/80" />
        <div className="container relative z-10 text-center">
          <p className="font-display text-sm uppercase tracking-widest text-primary-foreground/70 mb-3">Your Library</p>
          <h1 className="font-display text-4xl md:text-5xl font-black text-primary-foreground mb-4">eVolumes Library</h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">
            Click on any volume to start reading. All 13 volumes included in your subscription.
          </p>
        </div>
      </section>

      <div className="container py-12">
        {/* Career Volumes */}
        <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" /> Career Volumes (1–10)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mb-14">
          {careerVolumes.map((vol) => (
            <VolumeCard key={vol.id} vol={vol} />
          ))}
        </div>

        {/* Guidance Volumes */}
        <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary" /> Career-Related Information (11–13)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {guidanceVolumes.map((vol) => (
            <div key={vol.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center shrink-0">
                  <span className="text-primary-foreground font-display font-bold text-sm">V{vol.id}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold mb-1">Volume {vol.id} — {vol.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{vol.description}</p>
                  <Link to={`/volume/${vol.id}`}>
                    <Button size="sm">View Extract</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Training */}
        <div className="mt-14 bg-card border border-border rounded-xl p-8 text-center">
          <h2 className="font-display text-2xl font-bold mb-2">eTraining Guide</h2>
          <p className="text-muted-foreground mb-4">Learn how to use the Ultimate Career Guide effectively.</p>
          <a href="https://gamma.app/docs/ULTIMATE-CAREER-GUIDE-TRAINING-MANUAL-14ex81f9iwaa03n?mode=doc" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="font-display">Open Training Manual</Button>
          </a>
        </div>
      </div>
    </div>
  );
};

const VolumeCard = ({ vol }: { vol: (typeof volumes)[0] }) => (
  <Link to={`/volume/${vol.id}`} className="group">
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
      {vol.coverImage ? (
        <div className="relative">
          <img src={vol.coverImage} alt={`Volume ${vol.id} - ${vol.title}`} className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      ) : (
        <div className="w-full aspect-[3/4] gradient-brand flex items-center justify-center">
          <span className="text-primary-foreground font-display text-2xl font-bold">V{vol.id}</span>
        </div>
      )}
      <div className="p-3">
        <h3 className="font-display text-sm font-bold truncate">Vol. {vol.id} — {vol.title}</h3>
        <p className="text-xs text-muted-foreground">{vol.pages}</p>
      </div>
    </div>
  </Link>
);

export default Volumes;
