import { Plus, Users, ChevronRight, Briefcase } from 'lucide-react';
import { useState } from 'react';

interface Workspace {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  role: 'Owner' | 'Project Manager' | 'Developer' | 'Viewer';
}

const MOCK_WORKSPACES: Workspace[] = [
  {
    id: 'w1',
    name: 'QuanTask HQ',
    description: 'Main development workspace',
    memberCount: 12,
    role: 'Owner',
  },
  {
    id: 'w2',
    name: 'Mobile Team',
    description: 'iOS and Android development',
    memberCount: 8,
    role: 'Developer',
  },
  {
    id: 'w3',
    name: 'Design System',
    description: 'Component library and design tokens',
    memberCount: 5,
    role: 'Project Manager',
  },
];

interface WorkspaceSelectorProps {
  onWorkspaceSelect: (workspaceId: string) => void;
}

export function WorkspaceSelector({ onWorkspaceSelect }: WorkspaceSelectorProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState('');

  const handleCreate = () => {
    if (newWorkspaceName.trim()) {
      // In real app, would create workspace
      console.log('Creating workspace:', newWorkspaceName);
      setShowCreateForm(false);
      setNewWorkspaceName('');
      setNewWorkspaceDesc('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Briefcase className="w-12 h-12" style={{ color: 'var(--primary)' }} />
            <h1 className="text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>
              QuanTask
            </h1>
          </div>
          <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
            Select a workspace to continue
          </p>
        </div>

        {/* Workspaces grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {MOCK_WORKSPACES.map((workspace) => (
            <button
              key={workspace.id}
              onClick={() => onWorkspaceSelect(workspace.id)}
              className="group p-6 rounded-xl border-2 transition-all hover:scale-105 hover:shadow-lg text-left"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {workspace.name}
                  </h3>
                  <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {workspace.description}
                  </p>
                </div>
                <ChevronRight
                  className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--primary)' }}
                />
              </div>
              <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{workspace.memberCount} members</span>
                </div>
                <div className="px-2 py-1 rounded-md text-xs font-medium" style={{ background: 'var(--accent-purple-bg)', color: 'var(--accent-purple-text)' }}>
                  {workspace.role}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Create new workspace */}
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full p-6 rounded-xl border-2 border-dashed transition-all hover:scale-105"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <div className="flex items-center justify-center gap-3">
              <Plus className="w-6 h-6" />
              <span className="font-medium">Create new workspace</span>
            </div>
          </button>
        ) : (
          <div className="p-6 rounded-xl border-2" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Create New Workspace
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="e.g., Mobile Team"
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{
                    background: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={newWorkspaceDesc}
                  onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                  placeholder="e.g., iOS and Android development"
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{
                    background: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreate}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    background: 'var(--primary)',
                    color: 'var(--text-on-primary)',
                  }}
                >
                  Create Workspace
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewWorkspaceName('');
                    setNewWorkspaceDesc('');
                  }}
                  className="px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    background: 'var(--surface-hover)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
