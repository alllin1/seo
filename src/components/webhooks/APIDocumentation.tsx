import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface APIDocumentationProps {
  endpoint: string;
}

export default function APIDocumentation({ endpoint }: APIDocumentationProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const exampleRequest = `curl -X POST "${endpoint}/posts" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "title": "My Blog Post",
    "slug": "my-blog-post",
    "content": "<p>Your HTML content here...</p>",
    "excerpt": "A brief summary of the post",
    "author": "John Doe",
    "featuredImage": "https://example.com/image.jpg",
    "status": "published",
    "contentId": "uuid-from-your-platform",
    "seo": {
      "metaTitle": "My Blog Post | Site Name",
      "metaDescription": "A compelling meta description",
      "focusKeyword": "blog post",
      "seoScore": 85
    }
  }'`;

  const copyExample = async () => {
    try {
      await navigator.clipboard.writeText(exampleRequest);
      setCopied(true);
      toast({ title: "Copied!", description: "Example copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const methods = [
    { method: "GET", path: "/", description: "API documentation (no auth)" },
    { method: "GET", path: "/posts", description: "List all posts" },
    { method: "GET", path: "/posts/:id", description: "Get single post" },
    { method: "POST", path: "/posts", description: "Create new post" },
    { method: "PUT", path: "/posts/:id", description: "Update post" },
    { method: "DELETE", path: "/posts/:id", description: "Delete post" },
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "POST":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "PUT":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "DELETE":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "";
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">API Reference</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                Hide <ChevronUp className="ml-1 h-4 w-4" />
              </>
            ) : (
              <>
                Show <ChevronDown className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Available Methods */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Available Methods</h3>
            <div className="space-y-2">
              {methods.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-sm p-2 rounded bg-muted/50"
                >
                  <Badge variant="outline" className={getMethodColor(m.method)}>
                    {m.method}
                  </Badge>
                  <code className="font-mono text-xs">{m.path}</code>
                  <span className="text-muted-foreground">—</span>
                  <span className="text-muted-foreground">{m.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Authentication */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Authentication</h3>
            <p className="text-sm text-muted-foreground">
              Include your API key in the{" "}
              <code className="px-1.5 py-0.5 bg-muted rounded text-xs">
                x-api-key
              </code>{" "}
              header for all requests except <code className="px-1.5 py-0.5 bg-muted rounded text-xs">GET /</code>.
            </p>
          </div>

          {/* Example Request */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Example Request</h3>
              <Button variant="ghost" size="sm" onClick={copyExample}>
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-xs font-mono">
              {exampleRequest}
            </pre>
          </div>

          {/* Supported Fields */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Supported Fields</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <p className="font-medium">Basic</p>
                <ul className="text-muted-foreground space-y-0.5">
                  <li>• title, slug, content</li>
                  <li>• excerpt, author, status</li>
                  <li>• featuredImage, keywords</li>
                </ul>
              </div>
              <div className="space-y-1">
                <p className="font-medium">SEO</p>
                <ul className="text-muted-foreground space-y-0.5">
                  <li>• seo.metaTitle, seo.metaDescription</li>
                  <li>• seo.focusKeyword, seo.seoScore</li>
                  <li>• openGraph, twitter, schema</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Image Handling Note */}
          <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
            <h4 className="text-sm font-semibold text-primary mb-1">
              Automatic Image Persistence
            </h4>
            <p className="text-xs text-muted-foreground">
              Temporary image URLs (Replicate, DALL-E) are automatically
              downloaded and stored permanently in your storage bucket.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
