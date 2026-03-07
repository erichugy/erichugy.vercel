/**
 * Music Mixer - Layout Component
 * Provides layout structure for the mixer route
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Music Mixer - Create Ambient Sound Mixes',
  description:
    'Create and customize ambient sound mixes with nature sounds. Mix rain, thunder, fireplace, and more with independent volume and timing controls.',
  keywords: [
    'music mixer',
    'ambient sounds',
    'nature sounds',
    'mix creator',
    'relaxation',
  ],
};

export default function MixerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      {children}
    </div>
  );
}
