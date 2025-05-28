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
  ];
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="user-panel-trigger" title="User settings">
          <User />
          <span style={{ marginLeft: 8 }}>{user?.username}</span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="user-panel-overlay" />
        <Dialog.Content className="user-panel-content">
          <div className="user-panel-header">
            <span className="user-panel-avatar">
              <img src={user?.avatar_url} alt={user?.username} />
            </span>
            <span className="user-panel-username">{user?.username}</span>
            <Dialog.Close asChild>
              <button className="user-panel-close"><X /></button>
            </Dialog.Close>
          </div>
          <NeonBorderBox info style={{ margin: '1rem 0' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <LucideImage size={20} />
              <span>Change avatar (soon)</span>
            </div>
          </NeonBorderBox>
          <NeonBorderBox color="#ff4fd8" style={{ margin: '1rem 0' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <Download size={20} />
              <button onClick={onExport}>Export your data</button>
            </div>
          </NeonBorderBox>
          <NeonBorderBox error style={{ margin: '1rem 0' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <LogOut size={20} />
              <button onClick={onLogout}>Remove OAuth & all data</button>
            </div>
          </NeonBorderBox>
          <NeonBorderBox info style={{ margin: '1rem 0' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <Settings size={20} />
              <span>Customize homepage:</span>
            </div>
            <div className="user-panel-homepage-options">
              {homepageOptions.map(opt => (
                <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0' }}>
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
