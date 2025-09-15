import * as Dialog from '@radix-ui/react-dialog';
import { User, LogOut, Download, Image as LucideImage, Settings, Home, CheckSquare, X, Edit, Trash2, BarChart3, Upload, CloudUpload, Palette } from 'lucide-react';
import { useAtom } from 'jotai';
import { useState, useEffect, useRef } from 'react';
import { collectionsAtom } from '@/store/collectionAtom';
import NeonBorderBox from './NeonBorderBox';
import './UserPanel.scss';

export default function UserPanel({ user, onLogout, onExport, onAvatarChange }) {
  const [open, setOpen] = useState(false);
  const [collections] = useAtom(collectionsAtom);
  const [customAvatar, setCustomAvatar] = useState(null);
  const [customNickname, setCustomNickname] = useState(user?.username || '');
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [themeColor, setThemeColor] = useState('purple');
  const [customAccent, setCustomAccent] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedAvatar = localStorage.getItem('customAvatar');
    const savedNickname = localStorage.getItem('customNickname');
  const savedTheme = localStorage.getItem('themeColor');
  const savedAccent = localStorage.getItem('customAccentColor');
    if (savedAvatar) setCustomAvatar(savedAvatar);
    if (savedNickname) setCustomNickname(savedNickname);
    if (savedTheme) {
      setThemeColor(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    if (savedAccent) {
      setCustomAccent(savedAccent);
      try { document.documentElement.style.setProperty('--accent', savedAccent); } catch {}
    }
  }, []);

  useEffect(() => {
    setUnsavedChanges(true);
  }, [customAvatar, customNickname]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        setCustomAvatar(base64);
        localStorage.setItem('customAvatar', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout');
    localStorage.removeItem('customAvatar');
    localStorage.removeItem('customNickname');
    setCustomAvatar(null);
    setCustomNickname(user?.username || '');
    setUnsavedChanges(false);
    setOpen(false);
    window.location.reload();
  };

  const handleRemoveCollections = () => {
    // Clear collections
    localStorage.removeItem('userCollections');
    setUnsavedChanges(false);
    setOpen(false);
    window.location.reload();
  };

  const handleRemoveEverything = () => {
    setShowWarningModal(true);
  };

  const confirmRemoveEverything = async () => {
    await fetch('/api/auth/logout');
    localStorage.clear();
    setShowWarningModal(false);
    setOpen(false);
    window.location.reload();
  };

  const handleSave = () => {
    localStorage.setItem('customNickname', customNickname);
    localStorage.setItem('themeColor', themeColor);
    if (customAccent) {
      localStorage.setItem('customAccentColor', customAccent);
    } else {
      localStorage.removeItem('customAccentColor');
    }
    try {
      document.documentElement.setAttribute('data-theme', themeColor);
      if (customAccent) document.documentElement.style.setProperty('--accent', customAccent);
    } catch {}
    setUnsavedChanges(false);
    setOpen(false);
  };

  const handleExit = () => {
    if (unsavedChanges) {
      setShowConfirmModal(true);
    } else {
      setOpen(false);
    }
  };

  const confirmExitWithoutSaving = () => {
    setCustomAvatar(localStorage.getItem('customAvatar'));
    setCustomNickname(localStorage.getItem('customNickname') || user?.username || '');
    setUnsavedChanges(false);
    setShowConfirmModal(false);
    setOpen(false);
  };

  const backToPanel = () => {
    setShowConfirmModal(false);
  };

  const safeCollections = collections?.collections || [];
  const stats = {
    collections: safeCollections.length,
    subcollections: safeCollections.reduce((acc, col) => acc + (col.subcollections?.length || 0), 0),
    beatmaps: Object.keys(collections?.beatmaps || {}).length,
    tags: Object.keys(collections?.tags || {}).length,
  };

  const selectTheme = (color) => {
    setThemeColor(color);
    setUnsavedChanges(true);
    // live preview
    try {
      document.documentElement.setAttribute('data-theme', color);
      if (customAccent) document.documentElement.style.setProperty('--accent', customAccent);
    } catch {}
  };

  const handleCustomAccentChange = (e) => {
    const val = e.target.value;
    setCustomAccent(val);
    setUnsavedChanges(true);
    try { document.documentElement.style.setProperty('--accent', val); } catch {}
  };

  const resetCustomAccent = () => {
    setCustomAccent('');
    try {
      document.documentElement.style.removeProperty('--accent');
    } catch {}
  };

  return (
    <>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <button className="user-panel-button" title="User settings">
            {customAvatar || user?.avatar_url ? (
              <img src={customAvatar || user.avatar_url} alt={customNickname || user?.username} className="user-panel-avatar-img" />
            ) : (
              <User />
            )}
            <span className="username-span">{customNickname || user?.username}</span>
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="user-panel-overlay" />
          <Dialog.Content className="user-panel-content user-panel-redesign">
            <Dialog.Title className="sr-only">User Settings Panel</Dialog.Title>
            <button className="user-panel-close" onClick={handleExit}><X /></button>
            
            <div className="user-panel-main">
              <div className="user-panel-left">
                <div className="avatar-section">
                  <div 
                    className={`avatar-upload ${dragging ? 'dragging' : ''}`}
                    onClick={handleAvatarClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {customAvatar ? (
                      <img src={customAvatar} alt="Custom Avatar" className="custom-avatar" />
                    ) : (
                      <>
                        {dragging ? (
                          <>
                            <CloudUpload size={40} />
                            <span>Drop here</span>
                          </>
                        ) : (
                          <>
                            <LucideImage size={40} />
                            <span>Change Avatar</span>
                          </>
                        )}
                      </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={(e) => handleFileSelect(e.target.files[0])} 
                  />
                </div>
                <div className="nickname-section">
                  {isEditingNickname ? (
                    <input 
                      type="text" 
                      value={customNickname} 
                      onChange={(e) => setCustomNickname(e.target.value)} 
                      onBlur={() => setIsEditingNickname(false)} 
                      autoFocus 
                    />
                  ) : (
                    <span onClick={() => setIsEditingNickname(true)} className="nickname-display">
                      {customNickname || user?.username} <Edit size={16} />
                    </span>
                  )}
                </div>
              </div>
              
              <div className="user-panel-right">
                <div className="theme-picker">
                  <div className="theme-picker-header">
                    <Palette size={18} />
                    <span>Theme color</span>
                  </div>
                  <div className="theme-options">
                    {['purple','green','blue','red','gray'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        aria-label={`Set theme ${c}`}
                        className={`theme-swatch ${c} ${themeColor === c ? 'active' : ''}`}
                        onClick={() => selectTheme(c)}
                        title={c}
                      />
                    ))}
                  </div>
                  <div className="custom-accent">
                    <label htmlFor="custom-accent-color">Custom accent</label>
                    <input
                      id="custom-accent-color"
                      type="color"
                      value={customAccent || '#000000'}
                      onChange={handleCustomAccentChange}
                      aria-label="Pick custom accent color"
                    />
                    <button type="button" className="reset-accent" onClick={resetCustomAccent}>
                      Reset
                    </button>
                  </div>
                </div>
                <div className="action-buttons">
                  <button className="action-btn logout-btn" onClick={handleLogout}>
                    <LogOut size={20} />
                    Log Out
                  </button>
                  <button className="action-btn remove-collections-btn" onClick={handleRemoveCollections}>
                    <Trash2 size={20} />
                    Remove Collections
                  </button>
                  <button className="action-btn remove-all-btn" onClick={handleRemoveEverything}>
                    <Trash2 size={20} />
                    Remove Everything
                  </button>
                </div>
              </div>
            </div>
            
            <div className="user-panel-stats">
              <h3><BarChart3 size={20} /> Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Collections:</span>
                  <span className="stat-value">{stats.collections}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Subcollections:</span>
                  <span className="stat-value">{stats.subcollections}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Beatmaps:</span>
                  <span className="stat-value">{stats.beatmaps}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Tags:</span>
                  <span className="stat-value">{stats.tags}</span>
                </div>
              </div>
            </div>
            
            <div className="user-panel-bottom">
              <button className="save-btn" onClick={handleSave}>Save</button>
              <button className="exit-btn" onClick={handleExit}>Exit without Saving</button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Warning Modal */}
      <Dialog.Root open={showWarningModal} onOpenChange={setShowWarningModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="user-panel-overlay" />
          <Dialog.Content className="warning-modal">
            <div className="warning-header">
              <h2>WARNING</h2>
              <button onClick={() => setShowWarningModal(false)}><X /></button>
            </div>
            <p>This action will permanently delete all your collections data and remove Osuverse OAuth authorization.</p>
            <p>This cannot be undone.</p>
            <div className="warning-buttons">
              <button onClick={confirmRemoveEverything} className="confirm-btn">Confirm</button>
              <button onClick={() => setShowWarningModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Confirm Exit Modal */}
      <Dialog.Root open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="user-panel-overlay" />
          <Dialog.Content className="confirm-modal">
            <h2>Are you sure?</h2>
            <p>Unsaved changes will not be saved.</p>
            <div className="confirm-buttons">
              <button onClick={handleSave} className="save-close-btn">Save & Close</button>
              <button onClick={backToPanel} className="back-btn">Back to Panel</button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
