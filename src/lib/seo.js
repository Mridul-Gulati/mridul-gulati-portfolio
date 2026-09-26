import { site } from "@/data/site";

// Per-page metadata with a correct canonical URL and Open Graph/Twitter tags.
// Next.js replaces (not merges) a parent's openGraph object, so the shared fields are repeated here.
export function pageMetadata({ title, description, path, type = "website", images, ...rest }) {
  const fullTitle = title ? `${title} | ${site.name}` : `${site.name} | AI Engineer`;
  return {
    ...(title && { title }),
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: site.name,
      locale: "en_GB",
      title: fullTitle,
      description,
      url: path,
      ...(images && { images }),
      ...rest.openGraph,
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, ...(images && { images }) },
    ...(rest.robots && { robots: rest.robots }),
  };
}
