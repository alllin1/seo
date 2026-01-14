import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCreateWebhookCredential } from "../../hooks/useWebhookCredentials";

interface GenerateCredentialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GenerateCredentialModal({
  open,
  onOpenChange,
}: GenerateCredentialModalProps) {
  const { toast } = useToast();
  const createMutation = useCreateWebhookCredential();
  const [name, setName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!name.trim()) {
      toast({ title: "Please enter a name", variant: "destructive" });
      return;
    }

    try {
      const credential = await createMutation.mutateAsync(name.trim());
      setGeneratedKey(credential.api_key);
      toast({ title: "Credential generated successfully!" });
    } catch {
      toast({ title: "Failed to generate credential", variant: "destructive" });
    }
  };

  const copyKey = async () => {
    if (!generatedKey) return;
    try {
      await navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      toast({ title: "Copied!", description: "API key copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleClose = () => {
    setName("");
    setGeneratedKey(null);
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {generatedKey ? "API Key Generated" : "Generate New API Key"}
          </DialogTitle>
          <DialogDescription>
            {generatedKey
              ? "Copy your API key now. It won't be shown again!"
              : "Create a new API key for your SEO platform to authenticate."}
          </DialogDescription>
        </DialogHeader>

        {!generatedKey ? (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Credential Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., SEO AutoPilot"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                />
                <p className="text-xs text-muted-foreground">
                  A friendly name to identify this credential
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Generating..." : "Generate Key"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Your API Key</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-3 bg-muted rounded-md text-sm font-mono break-all">
                    {generatedKey}
                  </code>
                  <Button variant="outline" size="icon" onClick={copyKey}>
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-destructive font-medium">
                  ⚠️ Save this key now! It will not be shown again.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
