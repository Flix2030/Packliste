
import React, { useState, useEffect } from 'react';
import { User, PackingList, Item, AppData } from './types';
import { loadAppData, saveAppData, exportDataAsJSON } from './services/storageService';
import { generateId } from './constants';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ListDisplay from './components/ListDisplay';
import UserSetup from './components/UserSetup';

const App: React.FC = () => {
  const [data, setData] = useState<AppData>({ users: [], currentUserId: null });
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [showEmptyInput, setShowEmptyInput] = useState(false);
  const [emptyListName, setEmptyListName] = useState('');

  useEffect(() => {
    const loadedData = loadAppData();
    setData(loadedData);
    if (loadedData.currentUserId) {
      const user = loadedData.users.find(u => u.id === loadedData.currentUserId);
      if (user && user.lists.length > 0) {
        setActiveListId(user.lists[0].id);
      }
    }
    setIsLoaded(true);
  }, []);

  

  useEffect(() => {
    if (isLoaded) {
      saveAppData(data);
    }
  }, [data, isLoaded]);

  const currentUser = data.users.find(u => u.id === data.currentUserId) || null;
  const activeList = currentUser?.lists.find(l => l.id === activeListId) || null;

  const handleCreateUser = (username: string) => {
    const newUser: User = { id: generateId(), username, lists: [] };
    setData(prev => ({ ...prev, users: [...prev.users, newUser], currentUserId: newUser.id }));
    setActiveListId(null);
  };

  const handleSelectUser = (userId: string) => {
    setData(prev => ({ ...prev, currentUserId: userId }));
    const user = data.users.find(u => u.id === userId);
    setActiveListId(user && user.lists.length > 0 ? user.lists[0].id : null);
  };

  const handleLogout = () => {
    setData(prev => ({ ...prev, currentUserId: null }));
    setActiveListId(null);
  };

  const handleDeleteUser = (userId: string) => {
    if (!confirm("Benutzer und alle zugehörigen Listen wirklich löschen?")) return;
    setData(prev => {
      const newUsers = prev.users.filter(u => u.id !== userId);
      const newCurrentId = prev.currentUserId === userId ? (newUsers[0]?.id || null) : prev.currentUserId;
      return { ...prev, users: newUsers, currentUserId: newCurrentId };
    });
  };

  const handleAddList = (title: string, description: string = '', duration: number = 7) => {
    if (!data.currentUserId) return;
    const newList: PackingList = { 
      id: generateId(), 
      title, 
      description, 
      duration, 
      items: [], 
      createdAt: Date.now() 
    };
    setData(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === prev.currentUserId ? { ...u, lists: [newList, ...u.lists] } : u)
    }));
    setActiveListId(newList.id);
    setShowEmptyInput(false);
    setEmptyListName('');
  };

  const handleUpdateListItems = (listId: string, updatedItems: Item[]) => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === prev.currentUserId ? {
        ...u, lists: u.lists.map(l => l.id === listId ? { ...l, items: updatedItems } : l)
      } : u)
    }));
  };

  const handleUpdateListMetadata = (listId: string, updates: Partial<PackingList>) => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === prev.currentUserId ? {
        ...u, lists: u.lists.map(l => l.id === listId ? { ...l, ...updates } : l)
      } : u)
    }));
  };

  const handleDeleteList = (listId: string) => {
    // Confirmation handled in the component calling this
    setData(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === prev.currentUserId ? { ...u, lists: u.lists.filter(l => l.id !== listId) } : u)
    }));
    setActiveListId(null);
  };

  const handleMoveItem = (itemId: string, targetUserId: string, targetListId: string) => {
    setData(prev => {
      let movedItem: Item | null = null;
      const usersAfterRemoval = prev.users.map(u => ({
        ...u, lists: u.lists.map(l => {
          const item = l.items.find(i => i.id === itemId);
          if (item) { movedItem = item; return { ...l, items: l.items.filter(i => i.id !== itemId) }; }
          return l;
        })
      }));
      if (!movedItem) return prev;
      const usersAfterAddition = usersAfterRemoval.map(u => u.id === targetUserId ? {
        ...u, lists: u.lists.map(l => l.id === targetListId ? { ...l, items: [...l.items, movedItem!] } : l)
      } : u);
      return { ...prev, users: usersAfterAddition };
    });
  };

  if (!data.currentUserId || data.users.length === 0) {
    return <UserSetup onCreateUser={handleCreateUser} onImportData={setData} existingUsers={data.users} onSelectUser={handleSelectUser} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      <Sidebar 
        users={data.users} 
        currentUserId={data.currentUserId} 
        activeListId={activeListId} 
        onSelectUser={handleSelectUser} 
        onDeleteUser={handleDeleteUser} 
        onSelectList={setActiveListId} 
        onAddList={handleAddList} 
        onDeleteList={handleDeleteList} 
        onAddUser={handleCreateUser} 
        onLogout={handleLogout} 
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header currentUser={currentUser} activeList={activeList} allData={data} onImportData={setData} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-950">
          {activeList ? (
            <ListDisplay 
              list={activeList} 
              users={data.users} 
              currentUserId={data.currentUserId} 
              onUpdateItems={(items) => handleUpdateListItems(activeList.id, items)} 
              onUpdateListMetadata={(updates) => handleUpdateListMetadata(activeList.id, updates)}
              onDeleteList={() => handleDeleteList(activeList.id)}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl border border-slate-800 flex flex-col items-center max-w-md text-center animate-list-item">
                <div className="w-20 h-20 bg-green-900/20 text-green-400 rounded-3xl flex items-center justify-center mb-6 border border-green-500/20 shadow-lg">
                   <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                </div>
                <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight italic">Keine Liste aktiv</h3>
                <p className="mb-8 text-slate-400 font-medium text-sm">Bereit für dein nächstes Abenteuer? Erstelle eine neue Liste in der Sidebar.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
