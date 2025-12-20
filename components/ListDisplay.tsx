
import React, { useState } from 'react';
import { PackingList, Item, User } from '../types';
import { generateId } from '../constants';
import PackingListItem from './PackingListItem';
import { GoogleGenAI, Type } from "@google/genai";

// Helper component for the "tAIk" branding
const TAIkBrand = ({ className = "" }: { className?: string }) => (
  <span className={`font-black lowercase ${className}`}>
    <span className="text-orange-400">t</span>
    <span className="text-green-400 uppercase">AI</span>
    <span className="text-orange-400">k</span>
  </span>
);

interface ListDisplayProps {
  list: PackingList;
  users: User[];
  currentUserId: string | null;
  onUpdateItems: (items: Item[]) => void;
  onUpdateListMetadata: (updates: Partial<PackingList>) => void;
  onDeleteList: () => void;
}

const ListDisplay: React.FC<ListDisplayProps> = ({ 
  list, 
  users, 
  currentUserId,
  onUpdateItems, 
  onUpdateListMetadata,
  onDeleteList
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemTarget, setNewItemTarget] = useState(1);
  const [isAiMode, setIsAiMode] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{name: string, reason: string}[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [chatResponse, setChatResponse] = useState<string | null>(null);
  const [searchLinks, setSearchLinks] = useState<{web: {uri: string, title: string}}[]>([]);
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [customFocus, setCustomFocus] = useState('');
  
  // AI Categories
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Kleidung']);
  const categories = ['Kleidung', 'Technik', 'Ausrüstung', 'Unterhaltung', 'Dokumente'];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const item: Item = { id: generateId(), name: newItemName.trim(), targetQuantity: newItemTarget, packedQuantity: 0, isCompleted: false };
    onUpdateItems([...list.items, item]);
    setNewItemName('');
    setNewItemTarget(1);
  };

  const updateItem = (itemId: string, updates: Partial<Item>) => {
    const newItems = list.items.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, ...updates };
        if ('packedQuantity' in updates || 'targetQuantity' in updates) {
          const t = 'targetQuantity' in updates ? (updates.targetQuantity as number) : updated.targetQuantity;
          const p = 'packedQuantity' in updates ? (updates.packedQuantity as number) : updated.packedQuantity;
          updated.packedQuantity = Math.min(Math.max(0, p), t);
          updated.isCompleted = updated.packedQuantity >= t;
        }
        return updated;
      }
      return item;
    });
    onUpdateItems(newItems);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleCheckWithAi = async () => {
    setIsAiLoading(true);
    setAiSuggestions([]);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const currentItems = list.items.map(i => i.name).join(', ');
      const prompt = `Du bist ein intelligenter Reise-Assistent namens tAIk (wie das Wort 'take' mit 'AI' in der Mitte).
      Die Reise heißt "${list.title}" und dauert ${list.duration} Tage.
      Zweck: ${list.description}.
      Fokus-Kategorien: ${selectedCategories.join(', ')}.
      Eigener Schwerpunkt des Nutzers: ${customFocus || 'Keiner'}.
      Bereits auf der Liste: ${currentItems || 'Keine Artikel'}.
      
      Aufgabe: Analysiere die Liste. Schlage sinnvolle Ergänzungen für die gewählten Kategorien und den Nutzerwunsch vor.
      Antworte NUR in JSON als Array von Objekten mit "name" (Artikelname) und "reason" (Warum braucht man das?).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                reason: { type: Type.STRING }
              },
              required: ["name", "reason"]
            }
          }
        }
      });

      const suggestions = JSON.parse(response.text || '[]');
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setIsAiLoading(true);
    setChatResponse(null);
    setSearchLinks([]);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Reise: ${list.title} (${list.description}), ${list.duration} Tage. 
      Nutzer fragt: ${chatMessage}
      Aufgabe: Prüfe Wettervorhersagen am Ziel, Einreisebestimmungen (z.B. Reisepass, Visum) oder sonstige wichtige Regeln. 
      Antworte präzise auf Deutsch als tAIk.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      setChatResponse(response.text || "Keine Information gefunden.");
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      setSearchLinks(chunks as any);
      setChatMessage('');
    } catch (error) {
      setChatResponse("Fehler bei der Anfrage.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const addAiItem = (name: string) => {
    const item: Item = { id: generateId(), name, targetQuantity: 1, packedQuantity: 0, isCompleted: false };
    onUpdateItems([...list.items, item]);
    setAiSuggestions(prev => prev.filter(s => s.name !== name));
  };

  const handleMetadataSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingMetadata(false);
  };

  const allChecked = list.items.length > 0 && list.items.every(i => i.isCompleted);

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-32 animate-list-item">
      {/* Header Info & Edit */}
      <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 flex flex-col md:flex-row justify-between gap-6 items-start">
        {isEditingMetadata ? (
          <form onSubmit={handleMetadataSave} className="flex-1 w-full space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Name der Packliste</label>
              <input 
                value={list.title} 
                onChange={e => onUpdateListMetadata({ title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 font-black text-xl text-white"
                placeholder="Listenname"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Zweck / Notizen</label>
              <textarea 
                value={list.description}
                onChange={e => onUpdateListMetadata({ description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300 h-24 resize-none"
                placeholder="Beschreibung/Zweck"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dauer: {list.duration} Tage</label>
              <input 
                type="range" min="1" max="20" value={list.duration}
                onChange={e => onUpdateListMetadata({ duration: parseInt(e.target.value) })}
                className="flex-1"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-6 py-2.5 bg-green-400 text-slate-950 text-xs font-black uppercase rounded-xl">Speichern</button>
              <button type="button" onClick={() => setIsEditingMetadata(false)} className="px-6 py-2.5 bg-slate-800 text-slate-400 text-xs font-black uppercase rounded-xl">Abbrechen</button>
            </div>
          </form>
        ) : (
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">{list.title}</h2>
              <button onClick={() => setIsEditingMetadata(true)} className="p-1.5 text-slate-500 hover:text-green-400 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              </button>
            </div>
            <p className="text-sm text-slate-400 font-medium mb-3">{list.description || 'Keine Beschreibung'}</p>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-slate-800 text-slate-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-slate-700">{list.duration} Tage</span>
              <button 
                onClick={() => { if(confirm("Gesamte Packliste wirklich löschen?")) onDeleteList(); }}
                className="text-[10px] font-black text-red-500/50 hover:text-red-500 uppercase tracking-widest transition"
              >
                Liste Löschen
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col items-end gap-3">
          <button 
            onClick={() => setIsAiMode(!isAiMode)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition shadow-xl ${isAiMode ? 'bg-slate-800 text-green-400 border border-green-400/30' : 'bg-green-400 text-slate-950 shadow-green-400/20 active:scale-95'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            {isAiMode ? 'Liste anzeigen' : <><TAIkBrand /> Assistent</>}
          </button>
        </div>
      </div>

      {isAiMode ? (
        <div className="space-y-8 animate-list-item">
          {/* AI Settings & Logic */}
          <div className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800 shadow-2xl space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center font-black shadow-lg border border-slate-800">
                  <TAIkBrand className="text-sm" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Was soll <TAIkBrand /> prüfen?</h3>
              </div>
              
              <div className="space-y-4">
                 <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Standard Kategorien</label>
                 <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => toggleCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedCategories.includes(cat) ? 'bg-green-400 border-green-400 text-slate-950' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                 <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Eigener Schwerpunkt (Optional)</label>
                 <input 
                  type="text"
                  placeholder="z.B. Nur Luxus-Artikel, Fokus auf Kamera-Equipment..."
                  value={customFocus}
                  onChange={e => setCustomFocus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4 text-sm focus:border-green-400 outline-none transition-all placeholder:text-slate-700 font-medium"
                 />
              </div>
            </div>

            <div className="flex justify-center">
              <button 
                onClick={handleCheckWithAi}
                disabled={isAiLoading || (selectedCategories.length === 0 && !customFocus.trim())}
                className="group relative flex items-center gap-3 px-10 py-5 bg-green-400 text-slate-950 font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-green-300 transition-all shadow-xl shadow-green-400/20 disabled:opacity-50 active:scale-95"
              >
                {isAiLoading ? (
                  <div className="w-5 h-5 border-3 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:rotate-12 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                )}
                Vorschläge von <TAIkBrand />
              </button>
            </div>
          </div>

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-list-item">
              {aiSuggestions.map((s, idx) => (
                <div key={idx} className="bg-slate-900/50 p-6 rounded-3xl border border-green-400/20 flex flex-col justify-between group hover:border-green-400 transition-all">
                  <div>
                    <h4 className="text-base font-black text-slate-100 mb-1">{s.name}</h4>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{s.reason}</p>
                  </div>
                  <button 
                    onClick={() => addAiItem(s.name)}
                    className="mt-6 flex items-center justify-center gap-2 py-3 bg-green-400 text-slate-950 text-[10px] font-black uppercase rounded-xl hover:bg-green-300 transition-all active:scale-95 shadow-lg shadow-green-400/10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Hinzufügen
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* AI Chat/Q&A */}
          <div className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest"><TAIkBrand /> Reise-Chat</h3>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Frage nach Wetter, Regeln & Tipps</p>
              </div>
            </div>

            <form onSubmit={handleAskAi} className="relative">
              <input 
                type="text" 
                placeholder="Wie wird das Wetter? Was sind die Einreisebestimmungen?"
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-6 py-5 text-sm focus:border-green-400 outline-none transition-all pr-16"
              />
              <button disabled={isAiLoading} type="submit" className="absolute right-4 top-4 p-2 bg-green-400 text-slate-950 rounded-xl hover:scale-105 transition active:scale-90 disabled:opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            </form>

            {chatResponse && (
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 animate-list-item">
                <p className="text-sm text-slate-300 leading-relaxed mb-4">{chatResponse}</p>
                {searchLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800/50">
                    {searchLinks.map((link, i) => link.web && (
                      <a key={i} href={link.web.uri} target="_blank" rel="noreferrer" className="text-[9px] text-green-400 hover:underline bg-green-400/5 px-3 py-1.5 rounded-lg border border-green-400/20 truncate max-w-[200px]">
                        {link.web.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <section>
            <form onSubmit={handleAddItem} className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-slate-800 flex flex-col sm:flex-row gap-6 items-end green-glow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-3 ml-2 tracking-[0.2em]">Schnelles Hinzufügen</label>
                <input 
                  type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="z.B. Socken, Reisepass..."
                  className="w-full px-6 py-4 bg-slate-950 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-green-400/50 outline-none transition-all text-white placeholder:text-slate-700 font-bold"
                />
              </div>
              <div className="w-full sm:w-48">
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-3 ml-2 tracking-[0.2em]">Menge: {newItemTarget}</label>
                <input 
                  type="range" min="1" max="50" value={newItemTarget} 
                  onChange={(e) => setNewItemTarget(parseInt(e.target.value) || 1)}
                  className="w-full h-8 accent-green-400"
                />
              </div>
              <button type="submit" className="w-full sm:w-auto px-10 py-4 bg-green-400 text-slate-950 font-black rounded-2xl hover:bg-green-300 transition-all shadow-xl shadow-green-400/20 active:scale-95 uppercase tracking-widest text-sm">
                ➕ Hinzufügen
              </button>
            </form>
          </section>

          <div className="flex items-center justify-between px-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.25em]">{list.items.length} Artikel im Inventar</h3>
            <button 
              onClick={() => { 
                if(allChecked) {
                  if(confirm("Alle Markierungen aufheben?")) onUpdateItems(list.items.map(i => ({ ...i, isCompleted: false, packedQuantity: 0 })));
                } else {
                  if(confirm("Alle Artikel als 'gepackt' markieren?")) onUpdateItems(list.items.map(i => ({ ...i, isCompleted: true, packedQuantity: i.targetQuantity })));
                }
              }}
              className="text-[10px] font-black text-green-400 uppercase tracking-widest hover:text-green-300 transition"
            >
              {allChecked ? 'ALLE NICHT MEHR ABHAKEN' : 'ALLE ABHAKEN'}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {list.items.length > 0 ? (
              list.items.map((item) => (
                <PackingListItem 
                  key={item.id} item={item} users={users} currentUserId={currentUserId}
                  onUpdate={(updates) => updateItem(item.id, updates)}
                  onDelete={() => { if(confirm(`"${item.name}" wirklich von der Liste löschen?`)) onUpdateItems(list.items.filter(i => i.id !== item.id)) }}
                  onMove={() => {}}
                />
              ))
            ) : (
              <div className="text-center py-32 bg-slate-900/20 rounded-[4rem] border-2 border-dashed border-slate-800 flex flex-col items-center justify-center">
                <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">Deine Liste ist leer.</p>
                <p className="text-slate-700 text-[10px] mt-2 font-black uppercase tracking-[0.2em]">Nutze den <TAIkBrand /> Assistenten für Tipps!</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ListDisplay;
