import type { Project } from '@/lib/types/database';

export function formatProjectForSharing(project: Project): string {
  const lines = [
    `✂️ ${project.title}`,
    '',
    project.description ?? '',
    '',
    `Category: ${project.category}`,
    `Difficulty: ${project.difficulty}`,
    project.estimated_time ? `Time: ${project.estimated_time}` : '',
    '',
    '📦 Materials:',
    ...(project.materials ?? []).map((m) => `  • ${m.name} — ${m.quantity}`),
    '',
    '📋 Steps:',
    ...(project.steps ?? []).map((s) => `  ${s.order}. ${s.title}`),
    '',
    'Shared from Thimbl — Your Crafting Companion 🧵',
  ];
  return lines.filter(Boolean).join('\n');
}

export async function shareProject(project: Project): Promise<'shared' | 'copied' | 'failed'> {
  const text = formatProjectForSharing(project);

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title: project.title, text });
      return 'shared';
    } catch {
      // User cancelled or share failed — fall through to clipboard
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return 'copied';
    } catch {
      return 'failed';
    }
  }

  return 'failed';
}
