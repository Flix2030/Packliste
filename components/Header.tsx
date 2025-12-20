
import React, { useRef } from 'react';
import { User, PackingList, AppData } from '../types';
import { exportDataAsJSON } from '../services/storageService';

interface HeaderProps {
  currentUser: User | null;
  activeList: PackingList | null;
  allData: AppData;
  onImportData: (data: AppData) => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, activeList, allData, onImportData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportAll = () => {
    exportDataAsJSON(allData, `fixpack_backup_${new Date().toISOString().split('T')[0]}.json`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.users) onImportData(json);
        else if (json.items && currentUser) {
          const updatedUsers = allData.users.map(u => u.id === currentUser.id ? { ...u, lists: [json, ...u.lists] } : u);
          onImportData({ ...allData, users: updatedUsers });
        }
      } catch (err) { alert("Format ungültig."); }
    };
    reader.readAsText(file);
  };

  const totalItems = activeList?.items.length || 0;
  const packedItems = activeList?.items.filter(i => i.isCompleted).length || 0;
  const progressPercent = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-6 z-10 shadow-2xl relative">
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {activeList ? (
          <>
            <div className="flex items-center gap-4 min-w-0">
              <h1 className="text-3xl font-black text-white truncate tracking-tighter uppercase italic min-w-0 flex-1">
                {activeList.title}
              </h1>
              <span className="flex-shrink-0 px-3 py-1 bg-green-400/10 text-green-400 text-[10px] font-black rounded-full border border-green-400/30 uppercase tracking-[0.2em]">
                {progressPercent}% FERTIG
              </span>
            </div>
            <div className="w-full max-w-sm h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-400 transition-all duration-700 ease-out shadow-[0_0_12px_rgba(74,222,128,0.6)]" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </>
        ) : (
          <h1 className="text-2xl font-black text-white tracking-tight uppercase italic truncate">
            Hallo, <span className="text-green-400">{currentUser?.username}</span>
          </h1>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleImport} accept=".json" />
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-300 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 hover:text-white transition shadow-lg active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Import
        </button>

        <button 
          onClick={handleExportAll}
          className="flex items-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-950 bg-green-400 rounded-xl hover:bg-green-300 transition shadow-xl green-glow active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Backup
        </button>
      </div>
    </header>
  );
};

export default Header;
