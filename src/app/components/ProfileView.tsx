import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Camera, CheckCircle2, Github, Loader2, Save, Settings, User } from 'lucide-react';
import { CURRENT_USER } from '../data/store';
import { fetchMyProfile, updateMyProfile, uploadMyProfilePicture } from '../api/client';

// Keeps backend/network profile errors readable for this screen.
function profileError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  if (message.includes('Unable to reach the backend')) return 'Cannot reach the backend right now. Please try again later.';
  return message || fallback;
}

export function ProfileView() {
  // Personal profile page for editing name, bio, photo, and local preference toggles.
  const [fullName, setFullName] = useState(CURRENT_USER.name);
  const [gitHubHandle, setGitHubHandle] = useState(CURRENT_USER.githubHandle || '');
  const [bio, setBio] = useState(CURRENT_USER.bio || '');
  const [profilePictureUrl, setProfilePictureUrl] = useState(CURRENT_USER.profilePictureUrl || '');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  // Load the current profile once, avoiding state updates if the user navigates away mid-request.
  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchMyProfile()
      .then((profile) => {
        if (!active) return;
        setFullName(profile.name);
        setGitHubHandle(profile.githubHandle || '');
        setBio(profile.bio || '');
        setProfilePictureUrl(profile.profilePictureUrl || '');
      })
      .catch((requestError) => {
        if (active) setError(profileError(requestError, 'Unable to load profile.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Saves text profile fields through the API and mirrors the returned values into the form.
  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }

    setSaving(true);
    setNotice('');
    setError('');

    try {
      const profile = await updateMyProfile({
        fullName: fullName.trim(),
        bio: bio.trim(),
        githubHandle: gitHubHandle.trim(),
      });
      setFullName(profile.name);
      setGitHubHandle(profile.githubHandle || '');
      setBio(profile.bio || '');
      setNotice('Profile updated.');
    } catch (requestError) {
      setError(profileError(requestError, 'Unable to update profile.'));
    } finally {
      setSaving(false);
    }
  };

  // Uploads a selected image immediately and clears the file input so the same file can be reselected later.
  const uploadPicture = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setNotice('');
    setError('');

    try {
      const url = await uploadMyProfilePicture(file);
      if (url) setProfilePictureUrl(url);
      setNotice('Profile picture updated.');
    } catch (requestError) {
      setError(profileError(requestError, 'Unable to upload profile picture.'));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6" style={{ background: 'var(--background)', fontFamily: 'var(--font-family-body)' }}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-lg text-[var(--foreground)]">Profile</h1>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">Manage your personal information and preferences.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border px-3 py-2 text-xs" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }}>
            {error}
          </div>
        )}
        {notice && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' }}>
            <CheckCircle2 size={13} />
            {notice}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <section className="rounded-lg border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                {profilePictureUrl ? (
                  <img src={profilePictureUrl} alt="" className="h-24 w-24 rounded-full object-cover" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full text-2xl text-white" style={{ background: 'var(--primary)', fontFamily: 'var(--font-family-mono)' }}>
                    {CURRENT_USER.avatar || 'U'}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border text-white shadow-sm" style={{ background: 'var(--primary)', borderColor: 'var(--card)' }}>
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={uploadPicture} />
                </label>
              </div>
              <h2 className="text-sm text-[var(--foreground)]">{CURRENT_USER.name || 'User'}</h2>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{CURRENT_USER.email}</p>
              <p className="mt-3 rounded-full px-2 py-1 text-[10px] capitalize" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                {CURRENT_USER.role}
              </p>
            </div>
          </section>

          <section className="rounded-lg border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="border-b px-5 py-4" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <User size={15} className="text-[var(--muted-foreground)]" />
                <h2 className="text-sm text-[var(--foreground)]">Personal Details</h2>
              </div>
            </div>

            <form onSubmit={saveProfile} className="space-y-4 p-5">
              <label className="block">
                <span className="mb-1.5 block text-xs text-[var(--muted-foreground)]">Full name</span>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  disabled={loading}
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                  style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                  <Github size={12} />
                  GitHub handle
                </span>
                <input
                  value={gitHubHandle}
                  onChange={(event) => setGitHubHandle(event.target.value)}
                  disabled={loading}
                  placeholder="octocat"
                  maxLength={39}
                  autoCapitalize="none"
                  spellCheck={false}
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                  style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs text-[var(--muted-foreground)]">Bio</span>
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  rows={4}
                  placeholder="Tell teammates about your role, skills, or availability."
                  className="w-full resize-none rounded-lg border px-3 py-2.5 text-sm outline-none"
                  style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </label>
              <button
                disabled={saving || loading}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs text-white disabled:opacity-50"
                style={{ background: 'var(--primary)' }}
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                {saving ? 'Saving...' : 'Save profile'}
              </button>
            </form>
          </section>

          <section className="rounded-lg border p-5 lg:col-start-2" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <Settings size={15} className="text-[var(--muted-foreground)]" />
              <h2 className="text-sm text-[var(--foreground)]">Preferences</h2>
            </div>
            <div className="mt-4 space-y-3">
              <label className="flex items-center justify-between rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--border)' }}>
                <span>
                  <span className="block text-xs text-[var(--foreground)]">Email notifications</span>
                  <span className="mt-0.5 block text-[10px] text-[var(--muted-foreground)]">Receive task assignment and report status updates.</span>
                </span>
                <input type="checkbox" defaultChecked />
              </label>
              <label className="flex items-center justify-between rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--border)' }}>
                <span>
                  <span className="block text-xs text-[var(--foreground)]">Compact sidebar</span>
                  <span className="mt-0.5 block text-[10px] text-[var(--muted-foreground)]">Keep project navigation denser on smaller screens.</span>
                </span>
                <input type="checkbox" />
              </label>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
