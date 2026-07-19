/**
 * Music Mixer - Mix Sidebar Component
 * Sidebar for managing mixes (create, list, delete, rename, duplicate)
 */

import React, { useState, useCallback } from 'react';
import type { Mix } from '../lib/types';

interface MixSidebarProps {
  /** List of all mixes */
  mixes: Mix[];
  /** Currently selected mix ID */
  currentMixId: string | null;
  /** Callback when a mix is selected */
  onSelectMix: (mixId: string) => void;
  /** Callback to create new mix */
  onCreateMix: (name?: string) => void;
  /** Callback to delete mix */
  onDeleteMix: (mixId: string) => void;
  /** Callback to rename mix */
  onRenameMix: (mixId: string, newName: string) => void;
  /** Callback to duplicate mix */
  onDuplicateMix: (mixId: string) => void;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Mix sidebar component for managing saved mixes
 * Provides create, select, rename, delete, and duplicate functionality
 *
 * Usage:
 * ```tsx
 * <MixSidebar
 *   mixes={mixes}
 *   currentMixId={currentMixId}
 *   onSelectMix={selectMix}
 *   onCreateMix={createMix}
 *   onDeleteMix={deleteMix}
 *   onRenameMix={renameMix}
 *   onDuplicateMix={duplicateMix}
 * />
 * ```
 */
export const MixSidebar: React.FC<MixSidebarProps> = ({
  mixes,
  currentMixId,
  onSelectMix,
  onCreateMix,
  onDeleteMix,
  onRenameMix,
  onDuplicateMix,
  className = '',
}) => {
  const [editingMixId, setEditingMixId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null);

  const handleCreateClick = useCallback(() => {
    onCreateMix();
  }, [onCreateMix]);

  const handleSelectMix = useCallback(
    (mixId: string) => {
      onSelectMix(mixId);
      setExpandedMenuId(null);
    },
    [onSelectMix]
  );

  const handleStartRename = useCallback((mix: Mix) => {
    setEditingMixId(mix.id);
    setEditingName(mix.name);
  }, []);

  const handleSaveRename = useCallback(
    (mixId: string) => {
      if (editingName.trim()) {
        onRenameMix(mixId, editingName.trim());
      }
      setEditingMixId(null);
      setEditingName('');
    },
    [editingName, onRenameMix]
  );

  const handleCancelRename = useCallback(() => {
    setEditingMixId(null);
    setEditingName('');
  }, []);

  const handleDeleteClick = useCallback(
    (mixId: string) => {
      if (
        confirm(
          'Are you sure you want to delete this mix? This action cannot be undone.'
        )
      ) {
        onDeleteMix(mixId);
        setExpandedMenuId(null);
      }
    },
    [onDeleteMix]
  );

  const handleDuplicateClick = useCallback(
    (mixId: string) => {
      onDuplicateMix(mixId);
      setExpandedMenuId(null);
    },
    [onDuplicateMix]
  );

  const toggleMenu = useCallback((mixId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedMenuId((prev) => (prev === mixId ? null : mixId));
  }, []);

  return (
    <div
      className={`flex flex-col h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          My Mixes
        </h2>
        <button
          onClick={handleCreateClick}
          aria-label="Create new mix"
          className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
        >
          <span className="flex items-center justify-center gap-2">
            <span className="text-lg">+</span>
            New Mix
          </span>
        </button>
      </div>

      {/* Mix list */}
      <div className="flex-1 overflow-y-auto">
        {mixes.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <p className="text-sm">No mixes yet.</p>
            <p className="text-xs mt-1">Create one to get started!</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {mixes.map((mix) => (
              <li key={mix.id} className="relative">
                {editingMixId === mix.id ? (
                  // Editing mode
                  <div className="p-3 flex gap-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(mix.id);
                        if (e.key === 'Escape') handleCancelRename();
                      }}
                      className="flex-1 px-2 py-1 border border-blue-500 rounded text-sm dark:bg-gray-800 dark:text-white"
                      aria-label="Edit mix name"
                    />
                    <button
                      onClick={() => handleSaveRename(mix.id)}
                      className="px-2 py-1 bg-green-500 text-white rounded text-xs font-semibold hover:bg-green-600"
                      aria-label="Save mix name"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelRename}
                      className="px-2 py-1 bg-gray-400 text-white rounded text-xs font-semibold hover:bg-gray-500"
                      aria-label="Cancel editing"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  // Normal mode
                  <button
                    onClick={() => handleSelectMix(mix.id)}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      currentMixId === mix.id
                        ? 'bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    aria-current={currentMixId === mix.id ? 'page' : undefined}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {mix.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {mix.sounds.filter((s) => s.enabled).length}/
                          {mix.sounds.length} sounds
                        </p>
                      </div>
                      <button
                        onClick={(e) => toggleMenu(mix.id, e)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        aria-label="Mix options menu"
                      >
                        <svg
                          className="w-5 h-5 text-gray-600 dark:text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 8c1.1 0 2-0.9 2-2s-0.9-2-2-2-2 0.9-2 2 0.9 2 2 2zm0 2c-1.1 0-2 0.9-2 2s0.9 2 2 2 2-0.9 2-2-0.9-2-2-2zm0 6c-1.1 0-2 0.9-2 2s0.9 2 2 2 2-0.9 2-2-0.9-2-2-2z" />
                        </svg>
                      </button>
                    </div>

                    {/* Dropdown menu */}
                    {expandedMenuId === mix.id && (
                      <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-max">
                        <button
                          onClick={() => {
                            handleStartRename(mix);
                            setExpandedMenuId(null);
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => handleDuplicateClick(mix.id)}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300"
                        >
                          Duplicate
                        </button>
                        <button
                          onClick={() => handleDeleteClick(mix.id)}
                          className="block w-full text-left px-4 py-2 hover:bg-red-100 dark:hover:bg-red-900 text-sm text-red-600 dark:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
