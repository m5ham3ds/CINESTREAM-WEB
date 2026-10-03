export type SiteConfig = {
  name: string; tagline: string; description: string; themeColor: string;
  app: { version: string; versionCode: number | null; releaseDate: string | null; platform: string };
  download: { url: string }; links: { support: string | null; privacy: string | null; terms: string | null };
};
