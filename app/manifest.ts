import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Garden Quest School',
    short_name: 'Garden Quest',
    description: 'A naturalist learning world for curious children.',
    start_url: '/picker',
    display: 'standalone',
    background_color: '#F5EBDC',
    theme_color: '#6B8E5A',
    orientation: 'any',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/apple-icon.svg',
        sizes: '180x180',
        type: 'image/svg+xml',
      },
    ],
    categories: ['education', 'kids'],
  };
}
