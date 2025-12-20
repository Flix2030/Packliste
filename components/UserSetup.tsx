
import React, { useState, useRef } from 'react';
import { AppData, User } from '../types';

interface UserSetupProps {
  onCreateUser: (username: string) => void;
  onImportData: (data: AppData) => void;
  existingUsers: User[];
  onSelectUser: (id: string) => void;
}

const UserSetup: React.FC<UserSetupProps> = ({ onCreateUser, onImportData, existingUsers, onSelectUser }) => {
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(existingUsers.length === 0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] border border-slate-800 overflow-hidden">
        <div className="bg-gradient-to-br from-green-600 via-green-500 to-green-400 p-12 flex flex-col items-center shadow-inner relative">
          <div className="absolute top-4 right-4 text-slate-950 opacity-20 font-black text-6xl select-none uppercase italic">FIX</div>
          <div className="w-24 h-24 bg-slate-950/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-xl border border-white/20 shadow-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"/><path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3"/><rect width="16" height="10" x="4" y="8" rx="2"/></svg>
          </div>
          <h1 className="text-4xl font-black text-slate-950 mb-2 tracking-tighter uppercase italic">Fixpack</h1>
          <p className="text-slate-950/70 text-center font-black uppercase text-[10px] tracking-[0.3em]">High Performance Packing</p>
        </div>
        
        <div className="p-10">
          {isCreating ? (
            <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) onCreateUser(name.trim()); }} className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-3 tracking-widest">Neues Profil</label>
                <input 
                  autoFocus type="text" placeholder="Dein Name" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-6 py-5 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-4 focus:ring-green-400/20 outline-none transition text-xl font-bold text-white shadow-inner"
                />
              </div>
              
              <button 
                type="submit" disabled={!name.trim()}
                className="w-full bg-green-500 text-slate-950 py-5 rounded-2xl font-black text-lg hover:bg-green-400 transition shadow-2xl active:scale-95 disabled:opacity-30 uppercase tracking-widest"
              >
                Starten
              </button>
              {existingUsers.length > 0 && <button type="button" onClick={() => setIsCreating(false)} className="w-full text-slate-500 font-bold py-2 hover:text-white transition text-xs uppercase tracking-widest">Abbrechen</button>}
            </form>
          ) : (
            <div className="space-y-6">
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest text-center">Profil wählen</label>
              <div className="grid grid-cols-1 gap-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                {existingUsers.map(user => (
                  <button key={user.id} onClick={() => onSelectUser(user.id)} className="flex items-center gap-4 p-5 bg-slate-800 border border-slate-700 rounded-3xl hover:bg-slate-700 transition group border-l-4 border-l-green-500">
                    <div className="w-12 h-12 rounded-2xl bg-green-400 flex items-center justify-center font-black text-slate-950 group-hover:scale-110 transition shadow-lg">{user.username.charAt(0).toUpperCase()}</div>
                    <span className="font-black text-white text-lg">{user.username}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setIsCreating(true)} className="w-full py-5 text-green-400 font-black border-2 border-dashed border-slate-800 rounded-3xl hover:bg-slate-800 transition uppercase text-xs tracking-widest">+ Neuer Account</button>
            </div>
          )}
          
          <div className="mt-10 pt-8 border-t border-slate-800 flex justify-center">
            <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => { try { onImportData(JSON.parse(ev.target?.result as string)); } catch (err) { alert("Fehler!"); } };
              reader.readAsText(file);
            }} accept=".json" />
            <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-black text-slate-600 hover:text-green-400 transition uppercase tracking-widest flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Backup einspielen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSetup;
