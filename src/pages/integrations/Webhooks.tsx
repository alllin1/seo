import { useState } from "react";
import { Copy, Check, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useWebhookCredentials } from "../../hooks/useWebhookCredentials";
import CredentialTable from "../../components/webhooks/CredentialTable";
import GenerateCredentialModal from "../../components/webhooks/GenerateCredentialModal";
import APIDocumentation from "../../components/webhooks/APIDocumentation";

export default function Webhooks() {
  const { toast } = useToast();
  const { data: credentials, isLoading, refetch } = useWebhookCredentials();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get the API endpoint URL from environment
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const apiEndpoint = `${supabaseUrl}/functions/v1/seo-blog-api`;

  const copyEndpoint = async () => {
    try {
      await navigator.clipboard.writeText(apiEndpoint);
      setCopied(true);
      toast({ title: "Copied!", description: "API endpoint copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">SEO Blog API</h1>
          <p className="text-muted-foreground">
            Manage webhook credentials and connect your SEO platform
          </p>
        </header>

        {/* API Endpoint Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">API Endpoint</CardTitle>
            <CardDescription>
              Use this URL to connect your SEO platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-3 bg-muted rounded-md text-sm font-mono overflow-x-auto">
                {apiEndpoint}
              </code>
              <Button variant="outline" size="icon" onClick={copyEndpoint}>
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API Documentation */}
        <APIDocumentation endpoint={apiEndpoint} />

        {/* Credentials Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Webhook Credentials</CardTitle>
                <CardDescription>
                  Generate API keys for your SEO platform to authenticate
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate New Key
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CredentialTable
              credentials={credentials || []}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        <GenerateCredentialModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      </div>
    </div>
  );
}
