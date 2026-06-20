'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotes } from '@/hooks/useNotes';
import { useThemeContext } from '@/context/ThemeContext';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { 
  FolderPlus, 
  Trash2, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  Folder as FolderIcon,
  Tag,
  Star,
  FileText,
  HelpCircle,
  Plus,
  X,
  Edit2
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Mobile-responsive sidebar. Transforms into a slide-up bottom sheet on mobile layouts
 * and a standard fixed column sidebar on desktop screen sizes.
 */
export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logOut } = useAuth();
  const { theme, toggleTheme } = useThemeContext();
  
  const { 
    notes,
    folders, 
    activeFolderId, 
    setActiveFolderId, 
    selectedTag, 
    setSelectedTag,
    addFolder,
    editFolder,
    removeFolder,
    addNote,
    allTags
  } = useNotes();

  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#8b5cf6'); // Default violet
  
  const [editingFolder, setEditingFolder] = useState<{ id: string; name: string; color: string } | null>(null);
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);

  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isEditingFolder, setIsEditingFolder] = useState(false);
  const [isDeletingFolder, setIsDeletingFolder] = useState(false);
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  const colorsList = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#64748b'];

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || isCreatingFolder) return;
    
    setIsCreatingFolder(true);
    try {
      await addFolder(newFolderName.trim(), newFolderColor);
      setNewFolderName('');
      setIsNewFolderOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleEditFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFolder || !editingFolder.name.trim() || isEditingFolder) return;
    
    setIsEditingFolder(true);
    try {
      await editFolder(editingFolder.id, editingFolder.name.trim(), editingFolder.color);
      setEditingFolder(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEditingFolder(false);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (isDeletingFolder) return;
    if (confirm("Are you sure you want to delete this folder? All notes inside will be moved to 'Unassigned'.")) {
      setIsDeletingFolder(true);
      try {
        await removeFolder(folderId);
        setEditingFolder(null); // Ensure modal closes after delete
      } catch (err) {
        console.error(err);
      } finally {
        setIsDeletingFolder(false);
      }
    }
  };

  const handleAddNewNote = async () => {
    if (isCreatingNote) return;
    setIsCreatingNote(true);
    try {
      await addNote({
        title: 'New Note',
        content: '<p></p>',
        plainText: '',
        color: '#fbfbfb',
        tags: [],
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingNote(false);
    }
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          // Mobile Bottom Sheet styling
          "fixed inset-x-0 bottom-0 z-40 max-h-[85vh] bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 rounded-t-[32px] shadow-2xl transition-transform duration-350 ease-out flex flex-col",
          isOpen ? "translate-y-0" : "translate-y-full",
          // Desktop sidebar — full height, fixed layout
          "md:translate-y-0 md:static md:w-72 md:h-screen md:max-h-screen md:border-t-0 md:border-r md:rounded-none md:shadow-none"
        )}
      >
        {/* ── FIXED TOP: Logo + New Note ── */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4 space-y-4">
          {/* Header & Logo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 bg-brand-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-brand-500/25">
                <FileText size={20} />
              </div>
              <span className="font-display font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                Aether Notes
              </span>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 md:hidden cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Note Add */}
          <Button
            id="btn-sidebar-add-note"
            onClick={handleAddNewNote}
            isLoading={isCreatingNote}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl cursor-pointer"
          >
            <Plus size={18} />
            New Note
          </Button>
        </div>

        {/* ── SCROLLABLE MIDDLE: Nav + Folders + Tags ── */}
        <div className="flex-1 overflow-y-auto px-6 pb-2 space-y-6 min-h-0">
          {/* Core Views navigation */}
          <div className="space-y-1">
            <button
              id="sidebar-nav-all"
              onClick={() => { setActiveFolderId(null); setSelectedTag(null); onClose(); }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer",
                activeFolderId === null && !selectedTag
                  ? "bg-brand-50 dark:bg-brand-950/20 text-brand-700 dark:text-brand-300"
                  : "text-slate-650 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
              )}
            >
              <div className="flex items-center gap-2.5">
                <FileText size={18} />
                <span>All Notes</span>
              </div>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                {notes.filter(n => !n.isDeleted).length}
              </span>
            </button>

            <button
              id="sidebar-nav-favorites"
              onClick={() => { setActiveFolderId('favorites'); setSelectedTag(null); onClose(); }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer",
                activeFolderId === 'favorites'
                  ? "bg-brand-50 dark:bg-brand-950/20 text-brand-700 dark:text-brand-300"
                  : "text-slate-650 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Star size={18} />
                <span>Favorites</span>
              </div>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                {notes.filter(n => n.isFavorite && !n.isDeleted).length}
              </span>
            </button>

            <button
              id="sidebar-nav-trash"
              onClick={() => { setActiveFolderId('trash'); setSelectedTag(null); onClose(); }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer",
                activeFolderId === 'trash'
                  ? "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400"
                  : "text-slate-650 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Trash2 size={18} />
                <span>Trash</span>
              </div>
              <span className="text-xs bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full font-medium">
                {notes.filter(n => n.isDeleted).length}
              </span>
            </button>
          </div>

          {/* Folders Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1">
                Folders
              </span>
              <button
                id="btn-sidebar-add-folder"
                onClick={() => setIsNewFolderOpen(true)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-brand-500 cursor-pointer"
                title="Add new folder"
              >
                <FolderPlus size={16} />
              </button>
            </div>

            <div className="space-y-1">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className={cn(
                    "group flex items-center justify-between px-3 py-1.5 rounded-xl text-sm font-semibold transition-all cursor-pointer",
                    activeFolderId === folder.id
                      ? "bg-brand-50 dark:bg-brand-950/20 text-brand-700 dark:text-brand-300"
                      : "text-slate-650 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
                  )}
                >
                  <div
                    className="flex items-center gap-2.5 flex-1 min-w-0"
                    onClick={() => { setActiveFolderId(folder.id); setSelectedTag(null); onClose(); }}
                  >
                    <FolderIcon size={18} style={{ color: folder.color }} />
                    <span className="truncate">{folder.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                      {folder.noteCount}
                    </span>
                    <button
                      onClick={() => setEditingFolder({ id: folder.id, name: folder.name, color: folder.color })}
                      className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer transition-opacity"
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {folders.length === 0 && (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic pl-3 py-1">
                  No folders created
                </p>
              )}
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-2">
            <div className="px-2">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1">
                Tags
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 px-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  id={`tag-filter-${tag}`}
                  onClick={() => {
                    setSelectedTag(selectedTag === tag ? null : tag);
                    onClose();
                  }}
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold cursor-pointer border",
                    selectedTag === tag
                      ? "bg-brand-500 text-white border-transparent"
                      : "bg-slate-100 text-slate-650 border-transparent hover:bg-slate-250 dark:bg-slate-800 dark:text-slate-350 dark:hover:bg-slate-700/60"
                  )}
                >
                  <Tag size={10} />
                  {tag}
                </button>
              ))}
              {allTags.length === 0 && (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic pl-1 py-1">
                  No inline tags found
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── FIXED BOTTOM: User info + theme toggle ── */}
        <div className="flex-shrink-0 px-6 pb-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-3 bg-white dark:bg-slate-900">
          {/* Active User Account Block */}
          {user && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName || 'U'}`}
                  alt={user.displayName || 'User'}
                  className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner"
                />
                <div className="text-left">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[130px]">
                    {user.displayName || 'User Profile'}
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[130px]">
                    {user.email}
                  </p>
                </div>
              </div>

              <button
                id="btn-sidebar-logout"
                onClick={logOut}
                className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-450 hover:text-rose-500 rounded-xl transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}

          {/* Quick Settings Bar */}
          <div className="flex items-center justify-between">
            <button
              id="btn-sidebar-theme-toggle"
              onClick={toggleTheme}
              className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white transition-colors cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={16} />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon size={16} />
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            <button
              id="btn-sidebar-shortcuts"
              onClick={() => setIsShortcutModalOpen(true)}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-650 dark:text-slate-550 dark:hover:text-slate-350 cursor-pointer"
              title="Keyboard shortcuts (Ctrl+/)"
            >
              <HelpCircle size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* NEW FOLDER MODAL */}
      <Modal isOpen={isNewFolderOpen} onClose={() => setIsNewFolderOpen(false)} title="Create Folder">
        <form onSubmit={handleCreateFolder} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">Folder Name</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-brand-500 dark:text-white"
              placeholder="e.g. Work, Personal, Recipes"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">Folder Theme Color</label>
            <div className="flex items-center gap-2">
              {colorsList.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewFolderColor(color)}
                  className={cn(
                    "h-7 w-7 rounded-full transition-transform active:scale-90 border-2 cursor-pointer",
                    newFolderColor === color ? "border-slate-800 scale-110 dark:border-white" : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsNewFolderOpen(false)} disabled={isCreatingFolder}>Cancel</Button>
            <Button type="submit" isLoading={isCreatingFolder}>Create Folder</Button>
          </div>
        </form>
      </Modal>

      {/* EDIT FOLDER MODAL */}
      <Modal isOpen={!!editingFolder} onClose={() => setEditingFolder(null)} title="Manage Folder">
        {editingFolder && (
          <form onSubmit={handleEditFolderSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">Rename Folder</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-brand-500 dark:text-white"
                value={editingFolder.name}
                onChange={(e) => setEditingFolder({ ...editingFolder, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">Theme Color</label>
              <div className="flex items-center gap-2">
                {colorsList.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setEditingFolder({ ...editingFolder, color })}
                    className={cn(
                      "h-7 w-7 rounded-full transition-transform active:scale-90 border-2 cursor-pointer",
                      editingFolder.color === color ? "border-slate-800 scale-110 dark:border-white" : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button 
                type="button" 
                variant="danger" 
                onClick={() => handleDeleteFolder(editingFolder.id)}
                isLoading={isDeletingFolder}
                disabled={isEditingFolder}
                className="gap-1.5"
              >
                <Trash2 size={16} />
                Delete
              </Button>

              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => setEditingFolder(null)} disabled={isEditingFolder || isDeletingFolder}>Cancel</Button>
                <Button type="submit" isLoading={isEditingFolder} disabled={isDeletingFolder}>Save Changes</Button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* KEYBOARD SHORTCUTS MODAL */}
      <Modal isOpen={isShortcutModalOpen} onClose={() => setIsShortcutModalOpen(false)} title="Keyboard Shortcuts">
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-100 dark:border-slate-850">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Action</span>
            <span className="font-semibold text-slate-500 dark:text-slate-400 text-right">Shortcut</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Create New Note</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs">Ctrl + N</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Save Note</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs">Ctrl + S</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Focus Note Search</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs">Ctrl + K</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Toggle Sidebar Menu</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs">Ctrl + /</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Display Help Modal</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs">?</kbd>
            </div>
          </div>
          
          <div className="flex justify-end pt-3">
            <Button onClick={() => setIsShortcutModalOpen(false)}>Done</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
