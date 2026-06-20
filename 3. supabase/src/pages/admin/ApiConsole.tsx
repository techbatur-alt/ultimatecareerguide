import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, TerminalSquare } from "lucide-react";
import { Link } from "react-router-dom";
import BackHomeBar from "@/components/BackHomeBar";

const ApiConsole = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <BackHomeBar />
      <div className="mb-8">
        <h1 className="font-display text-4xl md:text-5xl font-black">
          <span className="text-primary">API</span> Console
        </h1>
        <p className="text-muted-foreground mt-2">Support tooling and direct API workflow access for internal operations.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TerminalSquare className="h-5 w-5 text-primary" />
            Internal operations console
          </CardTitle>
          <CardDescription>This workspace is ready to host API diagnostics, test payloads, and support workflow actions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The current build includes the shell and routing for the console so administrators can reach it from the portal without hitting empty pages.
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

export default ApiConsole;
