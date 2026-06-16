import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { volumes } from "@/lib/volumes";
import DRMProtection from "@/components/DRMProtection";

const VolumeViewer = () => {
  const { id } = useParams<{ id: string }>();
  

  const volumeId = parseInt(id || "1", 10);
  const volume = volumes.find((v) => v.id === volumeId);

  if (!volume) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-display text-2xl font-bold mb-4">Volume Not Found</h1>
        <Link to="/volumes">
          <Button>Back to Volumes</Button>
        </Link>
      </div>
    );
  }


  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <DRMProtection />
      {/* Header bar */}
      <div className="bg-card border-b border-border px-4 py-2 flex items-center gap-4">
        <Link to="/volumes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        </Link>
        <h1 className="font-display text-sm font-bold truncate">
          Volume {volume.id} — {volume.title}
        </h1>
        <span className="text-xs text-muted-foreground ml-auto">{volume.pages}</span>
      </div>

      {/* PDF viewer — single extract PDF for all volumes */}
      <div className="flex-1 bg-muted">
        <iframe
          src={`/documents/volume-extract.pdf#toolbar=0&navpanes=0`}
          className="w-full h-full border-0"
          title={`Volume ${volume.id} - ${volume.title}`}
        />
      </div>
    </div>
  );
};

export default VolumeViewer;
