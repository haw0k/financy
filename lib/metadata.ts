import { siteConfig } from '@/config';
import type { Metadata } from 'next';

interface ICreateMetadataOptions {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}

export function createMetadata(options: ICreateMetadataOptions = {}): Metadata {
  const title = options.title ? `${options.title} — ${siteConfig.name}` : siteConfig.name;
  const description = options.description ?? siteConfig.description;
  const url = options.path ? `${siteConfig.url}${options.path}` : siteConfig.url;
  const imageUrl = `${siteConfig.url}${siteConfig.socialPreview}`;

  return {
    title,
    description,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
    },
    robots: options.noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      type: 'website',
      locale: 'en_US',
      images: [
        {
          url: imageUrl,
          width: 1280,
          height: 640,
          alt: `${siteConfig.name} logo`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}
