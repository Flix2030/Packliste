
import React, { useState } from 'react';
import { Item, User } from '../types';

interface PackingListItemProps {
  item: Item;
  users: User[];
  currentUserId: string | null;
  onUpdate: (updates: Partial<Item>) => void;
  onDelete: () => void;
  onMove: (targetUserId: string, targetListId: string) => void;
}

const PackingListItem: React.FC<PackingListItemProps> = ({ 
  item, onDelete, onUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleNameSave = () => {
    onUpdate({ name: editName });
    setIsEditing(false);
  };

  const changeTargetQty = (delta: number) => {
    const newQty = Math.max(1, item.targetQuantity + delta);
    const newPacked = Math.min(item.packedQuantity, newQty);
    onUpdate({ targetQuantity: newQty, packedQuantity: newPacked });
  };

  const handleDeleteTrigger = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onDelete();
    }, 400);
  };

  const progress = Math.min(100, Math.round((item.packedQuantity / item.targetQuantity) * 100));

  return (
    <div className={`group relative bg-slate-900 p-6 rounded-[2rem] shadow-xl border-2 transition-all duration-500 overflow-hidden ${
      isDeleting ? 'animate-flash-red' : 
      item.isCompleted ? 'border-green-400/40 bg-green-400/5' : 'border-slate-800 hover:border-slate-700'
    }`}>
      {/* Fixed Layout: Left to Right */}
      <div className="flex items-center gap-6 relative z-10">
        <button 
          onClick={() => onUpdate({ isCompleted: !item.isCompleted, packedQuantity: !item.isCompleted ? item.targetQuantity : 0 })}
          className={`w-10 h-10 flex-shrink-0 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 transform active:scale-90 ${
            item.isCompleted 
              ? 'bg-green-400 border-green-400 text-slate-950 shadow-[0_0_20px_rgba(74,222,128,0.5)]' 
              : 'border-slate-700 bg-slate-950 group-hover:border-green-400/50'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-opacity duration-300 ${item.isCompleted ? 'opacity-100' : 'opacity-0'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </button>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input 
              autoFocus type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameSave} onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              className="w-full bg-slate-950 border border-green-400/50 rounded-xl px-4 py-2 outline-none text-white font-black text-lg shadow-inner"
            />
          ) : (
            <h4 className={`text-xl font-black tracking-tight truncate transition-all duration-500 ${item.isCompleted ? 'text-slate-500 italic line-through' : 'text-slate-100'}`}>
              {item.name}
            </h4>
          )}
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button onClick={() => setIsEditing(true)} className="p-2 text-slate-500 hover:text-green-400 hover:bg-slate-800 rounded-xl transition-all active:scale-125" title="Bearbeiten">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
          </button>
          
          <button onClick={handleDeleteTrigger} className="p-2 text-slate-500 hover:text-red-500 hover:bg-slate-800 rounded-xl transition-all active:scale-125" title="Löschen">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button 
                onClick={() => changeTargetQty(-1)} 
                className="w-8 h-8 flex items-center justify-center bg-green-400/10 hover:bg-green-400 hover:text-slate-950 text-green-400 rounded-xl transition-all border border-green-400/20 font-bold active:scale-75"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <button 
                onClick={() => changeTargetQty(1)} 
                className="w-8 h-8 flex items-center justify-center bg-green-400/10 hover:bg-green-400 hover:text-slate-950 text-green-400 rounded-xl transition-all border border-green-400/20 font-bold active:scale-150"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${item.isCompleted ? 'text-green-400' : 'text-slate-500'}`}>
              STATUS: {item.packedQuantity} / {item.targetQuantity}
            </span>
          </div>
          <span className={`text-xs font-black italic tracking-tighter transition-all duration-500 ${item.isCompleted ? 'text-green-400 scale-110' : 'text-slate-400'}`}>
            {progress}% FERTIG
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <input 
            type="range" 
            min="0" 
            max={item.targetQuantity} 
            value={item.packedQuantity}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              onUpdate({ packedQuantity: Math.min(val, item.targetQuantity) });
            }}
            style={{
              background: `linear-gradient(90deg, #4ade80 ${progress}%, #0f172a ${progress}%)`
            }}
            className="accent-green-400 cursor-pointer w-full h-2 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default PackingListItem;
