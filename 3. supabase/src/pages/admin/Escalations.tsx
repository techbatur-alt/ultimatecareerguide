import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import BackHomeBar from "@/components/BackHomeBar";

const Escalations = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <BackHomeBar />
      <div className="mb-8">
        <h1 className="font-display text-4xl md:text-5xl font-black">
          <span className="text-primary">Escalations</span> Queue
        </h1>
        <p className="text-muted-foreground mt-2">Executive visibility for the highest-priority customer and delivery issues.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            L6 escalation workspace
          </CardTitle>
          <CardDescription>This route is now available to executive users so the portal no longer falls through to an empty screen.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The escalation view is intentionally lightweight for now so it can be expanded into a ticket queue, owner assignment, and SLA tracker in a later phase.
          </p>
          <Button asChild variant="outline">
            <Link to="/admin/dashboard">
              Return to dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Escalations;
