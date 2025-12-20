
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';

interface SidebarProps {
  users: User[];
  currentUserId: string | null;
  activeListId: string | null;
  onSelectUser: (id: string) => void;
  onDeleteUser: (id: string) => void;
  onSelectList: (id: string) => void;
  onAddList: (title: string, description: string, duration: number) => void;
  onDeleteList: (id: string) => void;
  onAddUser: (username: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  users, 
  currentUserId, 
  activeListId, 
  onSelectUser, 
  onDeleteUser, 
  onSelectList, 
  onAddList,
  onDeleteList,
  onAddUser,
  onLogout
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [newListDuration, setNewListDuration] = useState(7);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const currentUser = users.find(u => u.id === currentUserId);

  useEffect(() => {
    if (isAddingList && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingList]);

  const handleCreateListSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListTitle.trim()) {
      onAddList(newListTitle.trim(), newListDesc.trim(), newListDuration);
      setNewListTitle('');
      setNewListDesc('');
      setNewListDuration(7);
      setIsAddingList(false);
    }
  };

  const handleAddNewUserAction = () => {
    const name = window.prompt("Name des neuen Nutzers:");
    if (name && name.trim()) {
      onAddUser(name.trim());
      setIsUserMenuOpen(false);
    }
  };

  return (
    <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full shadow-2xl z-20">
      <div className="p-8 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-400 p-2 rounded-xl shadow-lg shadow-green-500/20">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"/><path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3"/><rect width="16" height="10" x="4" y="8" rx="2"/></svg>
          </div>
          <span className="font-black text-white text-2xl tracking-tighter uppercase italic">Fixpack</span>
        </div>

        <div className="relative">
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-full flex items-center justify-between p-3.5 bg-slate-800 rounded-2xl hover:bg-slate-700 transition border border-slate-700 green-glow group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-400 text-slate-950 flex items-center justify-center font-black text-sm group-hover:scale-105 transition">
                {currentUser?.username.charAt(0).toUpperCase()}
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-[10px] font-black text-green-400 uppercase tracking-widest leading-none mb-1">Profil</p>
                <p className="font-bold text-slate-100 truncate text-sm">{currentUser?.username}</p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 text-green-400 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>

          {isUserMenuOpen && (
            <div className="absolute left-0 right-0 mt-3 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-list-item">
              <div className="max-h-60 overflow-y-auto py-2 custom-scrollbar">
                <p className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-700/50 mb-1 text-center">Profil wechseln</p>
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between px-2 hover:bg-slate-700/50 group">
                    <button 
                      onClick={() => {
                        onSelectUser(user.id);
                        setIsUserMenuOpen(false);
                      }}
                      className={`flex-1 text-left p-3 text-sm font-bold transition ${user.id === currentUserId ? 'text-green-400' : 'text-slate-300 hover:text-white'}`}
                    >
                      {user.username}
                    </button>
                    {users.length > 1 && (
                      <button 
                        onClick={() => { if(confirm(`Benutzer "${user.username}" wirklich löschen?`)) onDeleteUser(user.id); }}
                        className="p-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-700 p-2 flex flex-col gap-1 bg-slate-900/30">
                <button 
                  onClick={handleAddNewUserAction}
                  className="w-full flex items-center gap-3 p-3 text-xs font-black text-slate-400 hover:text-green-400 transition uppercase tracking-widest"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Nutzer hinzufügen
                </button>
                <button 
                  onClick={() => {
                    onLogout();
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 text-xs font-black text-slate-500 hover:text-white transition uppercase tracking-widest"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Abmelden
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
        <div className="flex items-center justify-between px-2 mb-4">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Packlisten</h3>
          <button 
            onClick={() => setIsAddingList(!isAddingList)}
            className={`p-1.5 rounded-lg transition-all border shadow-lg ${isAddingList ? 'bg-green-400 text-slate-950 border-green-400' : 'bg-green-400/10 text-green-400 border-green-400/20 hover:bg-green-400 hover:text-slate-950'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform ${isAddingList ? 'rotate-45' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>

        {isAddingList && (
          <form onSubmit={handleCreateListSubmit} className="mb-4 animate-list-item space-y-4 bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Name der Liste</label>
              <input 
                ref={inputRef}
                type="text"
                placeholder="z.B. Winterurlaub Österreich"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-bold text-white outline-none focus:border-green-400 transition-all"
              />
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Beschreibung / Ziel</label>
              <textarea 
                placeholder="Wir gehen Skifahren und Wandern..."
                value={newListDesc}
                onChange={(e) => setNewListDesc(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-white outline-none focus:border-green-400 transition-all h-20 resize-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Dauer: {newListDuration} Tage</label>
              </div>
              <input 
                type="range" min="1" max="20" value={newListDuration}
                onChange={(e) => setNewListDuration(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-2.5 bg-green-400 text-slate-950 text-[10px] font-black uppercase rounded-xl hover:bg-green-300 transition-colors shadow-lg shadow-green-400/20">Liste erstellen</button>
              <button type="button" onClick={() => setIsAddingList(false)} className="px-3 py-2.5 bg-slate-800 text-slate-400 text-[10px] font-black uppercase rounded-xl hover:text-white transition-colors">Abbruch</button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {currentUser?.lists.map(list => (
            <div 
              key={list.id} 
              className={`group flex items-center justify-between px-4 py-4 rounded-2xl cursor-pointer transition-all border ${
                activeListId === list.id 
                  ? 'bg-green-400/10 text-green-400 border-green-400/40 green-glow' 
                  : 'hover:bg-slate-800 text-slate-400 border-transparent'
              }`}
              onClick={() => onSelectList(list.id)}
            >
              <div className="flex items-center gap-4 truncate">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-black">
                  {list.duration}d
                </div>
                <div className="truncate">
                  <span className="font-bold truncate text-sm tracking-tight block">{list.title}</span>
                  <span className="text-[9px] text-slate-500 truncate block">{list.description || 'Keine Beschreibung'}</span>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if(confirm(`Packliste "${list.title}" wirklich löschen? Alle Artikel gehen verloren.`)) onDeleteList(list.id);
                }}
                className="p-2 opacity-100 md:opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-500 transition-all transform hover:scale-110"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          ))}

          {currentUser?.lists.length === 0 && !isAddingList && (
            <div className="text-center py-12 px-6 border-2 border-dashed border-slate-800 rounded-3xl group hover:border-green-400/20 transition-colors space-y-4">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Keine Listen vorhanden</p>
              <button 
                onClick={() => setIsAddingList(true)}
                className="block w-full text-[10px] font-black text-green-400 hover:text-green-300 transition-colors uppercase tracking-[0.2em] border-b border-green-400/30 pb-1"
              >
                Erste Liste erstellen
              </button>
              <button 
                onClick={handleAddNewUserAction}
                className="block w-full text-[10px] font-black text-slate-500 hover:text-green-400 transition-colors uppercase tracking-[0.2em] pt-2"
              >
                + Nutzer hinzufügen
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 bg-slate-950/40 border-t border-slate-800 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Version</span>
          <span className="text-[10px] font-bold text-slate-500">2.7.0 Pro</span>
        </div>
        <div className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]"></div>
      </div>
    </div>
  );
};

export default Sidebar;
