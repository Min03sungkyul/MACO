import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '마코 MACO - 사장님 곁의 마케팅 코치',
    short_name: '마코',
    description: '하루 15분, 우리 가게에 맞는 홍보 루틴',
    start_url: '/',
    display: 'standalone',
    background_color: '#111111',
    theme_color: '#ffffff',
    lang: 'ko',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
