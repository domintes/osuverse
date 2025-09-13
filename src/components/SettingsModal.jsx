'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Palette, Grid, Eye, Download, Upload, Trash2, RefreshCw } from 'lucide-react';
import './settingsModal.scss';

/**
 * Settings Modal - ustawienia aplikacji
 */
export default function SettingsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('appearance');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="settings-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="settings-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <div className="modal-title">
              <Settings size={20} />
              Settings
            </div>
            <motion.button
              className="close-btn"
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={20} />
            </motion.button>
          </div>

          {/* Content */}
          <div className="modal-content">
            {/* Tabs */}
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'appearance' ? 'active' : ''}`}
                onClick={() => setActiveTab('appearance')}
              >
                <Palette size={16} />
                Appearance
              </button>
              <button
                className={`tab ${activeTab === 'collections' ? 'active' : ''}`}
                onClick={() => setActiveTab('collections')}
              >
                <Grid size={16} />
                Collections
              </button>
              <button
                className={`tab ${activeTab === 'data' ? 'active' : ''}`}
                onClick={() => setActiveTab('data')}
              >
                <Download size={16} />
                Data
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'appearance' && (
                <div className="settings-section">
                  <h3>Theme & Display</h3>
                  <div className="setting-item">
                    <label>Default Columns</label>
                    <select defaultValue={3}>
                      <option value={1}>1 Column</option>
                      <option value={2}>2 Columns</option>
                      <option value={3}>3 Columns</option>
                      <option value={4}>4 Columns</option>
                      <option value={5}>5 Columns</option>
                    </select>
                  </div>
                  <div className="setting-item">
                    <label>
                      <input type="checkbox" defaultChecked />
                      Show auto-generated tags
                    </label>
                  </div>
                  <div className="setting-item">
                    <label>
                      <input type="checkbox" defaultChecked />
                      Animate collections
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'collections' && (
                <div className="settings-section">
                  <h3>Collection Settings</h3>
                  <div className="setting-item">
                    <label>
                      <input type="checkbox" defaultChecked />
                      Auto-sort by priority
                    </label>
                  </div>
                  <div className="setting-item">
                    <label>
                      <input type="checkbox" defaultChecked />
                      Show empty collections
                    </label>
                  </div>
                  <div className="setting-item">
                    <button className="action-btn">
                      <RefreshCw size={16} />
                      Refresh all collections
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="settings-section">
                  <h3>Import & Export</h3>
                  <div className="setting-item">
                    <button className="action-btn">
                      <Download size={16} />
                      Export Collections
                    </button>
                  </div>
                  <div className="setting-item">
                    <button className="action-btn">
                      <Upload size={16} />
                      Import Collections
                    </button>
                  </div>
                  <div className="setting-item danger">
                    <button className="action-btn danger">
                      <Trash2 size={16} />
                      Clear All Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <span className="version">Osuverse v0.1.0</span>
            <button className="save-btn" onClick={onClose}>
              Save & Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
