import { useState } from "react";
import { Copy, Check, Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  useToggleWebhookCredential,
  useDeleteWebhookCredential,
} from "../../hooks/useWebhookCredentials";
import type { WebhookCredential } from "../../types/blog";

interface CredentialTableProps {
  credentials: WebhookCredential[];
  isLoading: boolean;
}

export default function CredentialTable({
  credentials,
  isLoading,
}: CredentialTableProps) {
  const { toast } = useToast();
  const toggleMutation = useToggleWebhookCredential();
  const deleteMutation = useDeleteWebhookCredential();
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleVisibility = (id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyApiKey = async (apiKey: string, id: string) => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopiedKey(id);
      toast({ title: "Copied!", description: "API key copied to clipboard" });
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await toggleMutation.mutateAsync({ id, isActive });
      toast({
        title: isActive ? "Credential activated" : "Credential deactivated",
      });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Credential deleted" });
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const maskApiKey = (key: string) => {
    return `${key.slice(0, 8)}${"•".repeat(24)}${key.slice(-8)}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (credentials.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No credentials yet.</p>
        <p className="text-sm">Generate a new API key to get started.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>API Key</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Used</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {credentials.map((credential) => (
          <TableRow key={credential.id}>
            <TableCell className="font-medium">{credential.name}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                  {visibleKeys.has(credential.id)
                    ? credential.api_key
                    : maskApiKey(credential.api_key)}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => toggleVisibility(credential.id)}
                >
                  {visibleKeys.has(credential.id) ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => copyApiKey(credential.api_key, credential.id)}
                >
                  {copiedKey === credential.id ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </TableCell>
            <TableCell>
              <Switch
                checked={credential.is_active}
                onCheckedChange={(checked) =>
                  handleToggle(credential.id, checked)
                }
              />
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDate(credential.last_used_at)}
            </TableCell>
            <TableCell>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Credential</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{credential.name}"? This
                      will immediately revoke access for any services using this
                      API key.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(credential.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
