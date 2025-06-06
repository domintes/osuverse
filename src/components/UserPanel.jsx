import * as Dialog from '@radix-ui/react-dialog';
import { User, LogOut, Download, Image as LucideImage, Settings, Home, CheckSquare, X } from 'lucide-react';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { collectionsAtom } from '@/store/collectionAtom';
import NeonBorderBox from './NeonBorderBox';
import './UserPanel.scss';

export default function UserPanel({ user, onLogout, onExport, onAvatarChange, homepageConfig, setHomepageConfig }) {
  const [open, setOpen] = useState(false);
  const [collections] = useAtom(collectionsAtom);
  // Przykładowe opcje personalizacji
  const homepageOptions = [
    { key: 'showCollections', label: 'Show collections section', color: 'pink' },
    { key: 'showTags', label: 'Show tag filter section', color: 'blue' },
    { key: 'showSearch', label: 'Show search box', color: 'green' },
    { key: 'showRanked', label: 'Show only ranked beatmaps on home', color: 'purple' },
    { key: 'showCustomSection', label: 'Show custom section', color: 'orange' },
  ];  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="user-panel-button" title="User settings">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.username} className="user-panel-avatar-img" />
          ) : (
            <User />
          )}
          <span className="username-span">{user?.username}</span>
        </button>
      </Dialog.Trigger><Dialog.Portal>
        <Dialog.Overlay className="user-panel-overlay" />
        <Dialog.Content className="user-panel-content">
          <Dialog.Title className="sr-only">User Settings Panel</Dialog.Title>
          <div className="user-panel-header">
            <span className="user-panel-avatar">
              <img src={user?.avatar_url} alt={user?.username} />
            </span>
            <span className="user-panel-username">{user?.username}</span>
            <Dialog.Close asChild>
              <button className="user-panel-close"><X /></button>
            </Dialog.Close>
          </div><NeonBorderBox info className="neon-border-container">
            <div className="flex-container">
              <LucideImage size={20} />
              <span>Change avatar (soon)</span>
            </div>
          </NeonBorderBox>          <NeonBorderBox color="#ff4fd8" className="neon-border-container">
            <div className="flex-container">
              <Download size={20} />
              <button onClick={onExport}>Export your data</button>
            </div>
          </NeonBorderBox>          <NeonBorderBox error className="neon-border-container">
            <div className="flex-container">
              <LogOut size={20} />
              <button onClick={onLogout}>Remove OAuth & all data</button>
            </div>
          </NeonBorderBox>          <NeonBorderBox info className="neon-border-container">
            <div className="flex-container">
              <Settings size={20} />
              <span>Customize homepage:</span>
            </div>
            <div className="user-panel-homepage-options">
              {homepageOptions.map(opt => (
                <label key={opt.key}>
                  <input
                    type="checkbox"
                    checked={homepageConfig[opt.key]}
                    onChange={e => setHomepageConfig(cfg => ({ ...cfg, [opt.key]: e.target.checked }))}
                  />
                  <CheckSquare size={18} color={opt.color} />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </NeonBorderBox>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
