import { LockKeyhole, Users } from 'lucide-react';

interface ProjectAccessNoticeProps {
  projectName?: string;
}

export function ProjectAccessNotice({ projectName }: ProjectAccessNoticeProps) {
  return (
    <div
      className="h-full flex items-center justify-center px-6"
      style={{ background: 'var(--background)', fontFamily: 'var(--font-family-body)' }}
    >
      <div className="max-w-md text-center">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'var(--muted)' }}
        >
          <LockKeyhole size={24} className="text-[var(--muted-foreground)]" />
        </div>
        <h2 className="text-base text-[var(--foreground)] mb-2">Project access is restricted</h2>
        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
          You are not a member of {projectName ? `"${projectName}"` : 'this project'}.
          Ask a project manager to add you before viewing its tasks, sprints, and members.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--muted-foreground)]">
          <Users size={13} />
          Project membership is managed from project settings.
        </div>
      </div>
    </div>
  );
}
