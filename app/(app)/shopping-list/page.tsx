'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, Check, Trash2 } from 'lucide-react';
import {
  getShoppingList,
  saveShoppingItem,
  updateShoppingItem,
  deleteShoppingItem,
  generateId,
} from '@/lib/storage';
import type { ShoppingListItem } from '@/lib/types/database';

/**
 * Shopping List Page
 *
 * Shows all materials needed across active projects (from localStorage).
 * Users can check off items, add custom items, and delete items.
 */

export default function ShoppingListPage() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    setItems(getShoppingList());
  }, []);

  const toggleItem = (itemId: string, currentState: boolean) => {
    updateShoppingItem(itemId, { is_checked: !currentState });
    setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, is_checked: !currentState } : i));
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    const item: ShoppingListItem = {
      id: generateId(),
      user_id: 'local',
      project_id: null,
      item_name: newItem.trim(),
      quantity: newQuantity.trim() || null,
      is_checked: false,
      is_custom: true,
      created_at: new Date().toISOString(),
    };
    saveShoppingItem(item);
    setItems((prev) => [item, ...prev]);
    setNewItem('');
    setNewQuantity('');
    setShowAdd(false);
  };

  const removeItem = (itemId: string) => {
    deleteShoppingItem(itemId);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const unchecked = items.filter((i) => !i.is_checked);
  const checked = items.filter((i) => i.is_checked);

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-5">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1
            className="text-2xl font-bold mb-1"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
          >
            Shopping List
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {items.length} items · {checked.length} purchased
          </p>
        </motion.div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="w-10 h-10 rounded-full flex items-center justify-center min-h-[44px] min-w-[44px]"
          style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
          aria-label="Add item"
        >
          <Plus size={20} />
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            className="card p-4 mb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Item name"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addItem()}
                className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-colour)',
                  color: 'var(--text-primary)',
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Quantity (optional)"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl text-sm border outline-none"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-colour)',
                    color: 'var(--text-primary)',
                  }}
                />
                <button
                  onClick={addItem}
                  className="px-4 py-2.5 rounded-xl text-white text-sm font-medium min-h-[44px]"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {items.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag size={48} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
            Your shopping list is empty
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Start a project to auto-fill materials, or add items manually
          </p>
        </div>
      )}

      {items.length > 0 && (
        <div className="space-y-4">
          {unchecked.length > 0 && (
            <div className="space-y-1">
              {unchecked.map((item) => (
                <motion.div key={item.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl" layout>
                  <button
                    onClick={() => toggleItem(item.id, item.is_checked)}
                    className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 min-h-[44px] min-w-[44px]"
                    style={{ borderColor: 'var(--border-colour)' }}
                    aria-label={`Mark ${item.item_name} as purchased`}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {item.item_name}
                    </span>
                    {item.quantity && (
                      <span className="text-xs ml-1.5" style={{ color: 'var(--text-muted)' }}>
                        ({item.quantity})
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    style={{ color: 'var(--text-muted)' }}
                    aria-label={`Delete ${item.item_name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {checked.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Purchased ({checked.length})
              </p>
              <div className="space-y-1 opacity-60">
                {checked.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2 px-3">
                    <button
                      onClick={() => toggleItem(item.id, item.is_checked)}
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 min-h-[44px] min-w-[44px]"
                      style={{ backgroundColor: 'var(--accent-secondary)' }}
                    >
                      <Check size={14} className="text-white" />
                    </button>
                    <span className="text-sm line-through flex-1" style={{ color: 'var(--text-muted)' }}>
                      {item.item_name}{item.quantity && ` (${item.quantity})`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
