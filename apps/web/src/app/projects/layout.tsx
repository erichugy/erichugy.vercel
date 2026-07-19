/**
 * Projects - Layout Component
 * Provides layout structure for all projects routes
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projects - Eric Huang',
  description: 'Interactive projects and tools built by Eric Huang.',
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
