import { useEffect } from "react";

interface BlogSEOProps {
  title: string;
  description: string;
  image?: string;
  canonicalUrl?: string;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    tags?: string[];
  };
}

export default function BlogSEO({
  title,
  description,
  image,
  canonicalUrl,
  article,
}: BlogSEOProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper to update or create meta tag
    const setMeta = (property: string, content: string, isName = false) => {
      const attr = isName ? "name" : "property";
      let meta = document.querySelector(`meta[${attr}="${property}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, property);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // Basic meta
    setMeta("description", description, true);

    // Open Graph
    setMeta("og:title", title);
    setMeta("og:description", description);
    setMeta("og:type", article ? "article" : "website");
    if (image) setMeta("og:image", image);

    // Twitter Card
    setMeta("twitter:card", image ? "summary_large_image" : "summary", true);
    setMeta("twitter:title", title, true);
    setMeta("twitter:description", description, true);
    if (image) setMeta("twitter:image", image, true);

    // Article specific
    if (article) {
      if (article.publishedTime) {
        setMeta("article:published_time", article.publishedTime);
      }
      if (article.modifiedTime) {
        setMeta("article:modified_time", article.modifiedTime);
      }
      if (article.author) {
        setMeta("article:author", article.author);
      }
    }

    // Canonical URL
    if (canonicalUrl) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonicalUrl);
    }

    // Cleanup function
    return () => {
      // Optionally remove meta tags on unmount
    };
  }, [title, description, image, canonicalUrl, article]);

  return null;
}
