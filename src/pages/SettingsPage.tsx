import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heading, Button, TextInput, PasswordInput,
  ToastNotification, Stack, InlineLoading, Tile, Toggle,
} from '@carbon/react';
import { Password, Notification, UserAvatar } from '@carbon/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/services/api';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { AppPage } from '@/components/layout/AppPage';
import type { User } from '@/types/api';

function ProfileSection() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('me', { json: { name, email } }).json<User>();
      setToast({ kind: 'success', message: 'Profile updated' });
    } catch {
      setToast({ kind: 'error', message: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Tile className="settings-section">
      <div className="settings-section__header">
        <UserAvatar size={20} />
        <h4>Profile</h4>
      </div>
      {toast && (
        <ToastNotification
          kind={toast.kind}
          title={toast.kind === 'success' ? 'Success' : 'Error'}
          subtitle={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      <form onSubmit={handleSave}>
        <Stack gap={5}>
          <TextInput
            id="settings-name"
            labelText="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextInput
            id="settings-email"
            labelText="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" disabled={saving}>
            {saving ? <InlineLoading description="Saving..." /> : 'Save Changes'}
          </Button>
        </Stack>
      </form>
    </Tile>
  );
}

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setToast({ kind: 'error', message: 'New passwords do not match' });
      return;
    }
    if (newPassword.length < 8) {
      setToast({ kind: 'error', message: 'Password must be at least 8 characters' });
      return;
    }
    setSaving(true);
    try {
      await api.put('me/password', {
        json: { currentPassword, newPassword },
      });
      setToast({ kind: 'success', message: 'Password changed' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setToast({ kind: 'error', message: 'Failed to change password' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Tile className="settings-section">
      <div className="settings-section__header">
        <Password size={20} />
        <h4>Password</h4>
      </div>
      {toast && (
        <ToastNotification
          kind={toast.kind}
          title={toast.kind === 'success' ? 'Success' : 'Error'}
          subtitle={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      <form onSubmit={handleChangePassword}>
        <Stack gap={5}>
          <PasswordInput
            id="settings-current-password"
            labelText="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <PasswordInput
            id="settings-new-password"
            labelText="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <PasswordInput
            id="settings-confirm-password"
            labelText="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button type="submit" disabled={saving}>
            {saving ? <InlineLoading description="Updating..." /> : 'Change Password'}
          </Button>
        </Stack>
      </form>
    </Tile>
  );
}

function NotificationsSection() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [surveyCompleteNotifs, setSurveyCompleteNotifs] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const handleSave = async () => {
    try {
      await api.patch('auth/me/preferences', {
        json: {
          emailNotifications: emailNotifs,
          surveyCompletionNotifications: surveyCompleteNotifs,
          weeklyDigest,
        },
      });
    } catch {
      // Silently fail for notification preferences
    }
  };

  return (
    <Tile className="settings-section">
      <div className="settings-section__header">
        <Notification size={20} />
        <h4>Notifications</h4>
      </div>
      <Stack gap={5}>
        <Toggle
          id="notif-email"
          labelText="Email notifications"
          toggled={emailNotifs}
          onToggle={(value) => { setEmailNotifs(value); handleSave(); }}
        />
        <Toggle
          id="notif-survey-complete"
          labelText="Survey completion alerts"
          toggled={surveyCompleteNotifs}
          onToggle={(value) => { setSurveyCompleteNotifs(value); handleSave(); }}
        />
        <Toggle
          id="notif-weekly-digest"
          labelText="Weekly digest"
          toggled={weeklyDigest}
          onToggle={(value) => { setWeeklyDigest(value); handleSave(); }}
        />
      </Stack>
    </Tile>
  );
}

export function SettingsPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      await api.delete('auth/me');
      signOut();
      navigate('/');
    } catch {
      // Error handling
    }
  };

  return (
    <AppPage>
      <Heading>Account Settings</Heading>
      <Stack gap={6} className="settings-page__content">
        <ProfileSection />
        <PasswordSection />
        <NotificationsSection />
        <Tile className="settings-section settings-section--danger">
          <h4>Danger Zone</h4>
          <p className="settings-section__description">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button kind="danger" onClick={() => setDeleteAccountOpen(true)}>
            Delete Account
          </Button>
        </Tile>
      </Stack>
      <ConfirmModal
        open={deleteAccountOpen}
        onClose={() => setDeleteAccountOpen(false)}
        title="Delete Account"
        description="Are you sure you want to delete your account? All surveys, responses, and data will be permanently deleted."
        confirmLabel="Delete Account"
        danger
        onConfirm={handleDeleteAccount}
      />
    </AppPage>
  );
}
