import type { SiteConfig } from '../types/site';

export const siteConfig: SiteConfig = {
  name: 'CineStream',
  tagline: 'عالم الترفيه بين يديك',
  description: 'CineStream — تجربة Android للأفلام والمسلسلات والأنمي مع البحث والمصادر والجودة والتنزيلات والمكتبة والمشاركة.',
  themeColor: '#0F1115',
  app: { version: '1.0', versionCode: 1, releaseDate: '2024-05-25', platform: 'Android' },
  download: { url: '' },
  links: { support: null, privacy: null, terms: null },
};

export const asset = (p: string) =>
  import.meta.env.BASE_URL.replace(/\/$/, '') + '/' + p.replace(/^\//, '');
