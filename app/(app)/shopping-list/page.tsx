'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, Check, X, Trash2, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { ShoppingListItem } from '@/lib/types/database';

/**
 * Shopping List Page
 *
 * Shows all materials needed across active projects.
 * Users can check off items, add custom items, and delete items.
 */

export default function ShoppingListPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const fetchItems = useCallback(async () => {
    if (!user) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('shopping_list_items')
      .select('*')
      .eq('user_id', user.id)
      .order('is_checked')
      .order('created_at', { ascending: false });

    setItems((data as ShoppingListItem[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Toggle item checked state
  const toggleItem = async (itemId: string, currentState: boolean) => {
    const supabase = createClient();
    await supabase
      .from('shopping_list_items')
      .update({ is_checked: !currentState })
      .eq('id', itemId);

    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, is_checked: !currentState } : item
      )
    );
  };

  // Add custom item
  const addItem = async () => {
    if (!user || !newItem.trim()) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('shopping_list_items')
      .insert({
        user_id: user.id,
        item_name: newItem.trim(),
        quantity: newQuantity.trim() || null,
        is_custom: true,
      })
      .select()
      .single();

    if (data) {
      setItems((prev) => [data as ShoppingListItem, ...prev]);
    }
    setNewItem('');
    setNewQuantity('');
    setShowAdd(false);
  };

  // Delete item
  const deleteItem = async (itemId: string) => {
    const supabase = createClient();
    await supabase.from('shopping_list_items').delete().eq('id', itemId);
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const unchecked = items.filter((i) => !i.is_checked);
  const checked = items.filter((i) => i.is_checked);

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
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

      {/* Add item form */}
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

      {/* Items list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag size={48} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
            Your shopping list is empty
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Start a project to auto-fill materials, or add items manually
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Unchecked items */}
          {unchecked.length > 0 && (
            <div className="space-y-1">
              {unchecked.map((item) => (
                <motion.div
                  key={item.id}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl"
                  layout
                >
                  <button
                    onClick={() => toggleItem(item.id, item.is_checked)}
                    className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 min-h-[44px] min-w-[44px]"
                    style={{ borderColor: 'var(--border-colour)' }}
                    aria-label={`Mark ${item.item_name} as purchased`}
                  >
                    {/* Empty circle */}
                  </button>
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
                    onClick={() => deleteItem(item.id)}
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

          {/* Checked items */}
          {checked.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Purchased ({checked.length})
              </p>
              <div className="space-y-1 opacity-60">
                {checked.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-2 px-3"
                  >
                    <button
                      onClick={() => toggleItem(item.id, item.is_checked)}
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 min-h-[44px] min-w-[44px]"
                      style={{ backgroundColor: 'var(--accent-secondary)' }}
                      aria-label={`Unmark ${item.item_name}`}
                    >
                      <Check size={14} className="text-white" />
                    </button>
                    <span className="text-sm line-through flex-1" style={{ color: 'var(--text-muted)' }}>
                      {item.item_name}
                      {item.quantity && ` (${item.quantity})`}
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
