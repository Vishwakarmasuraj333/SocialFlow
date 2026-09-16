'use client';

import React, { useState, useEffect } from 'react';
import {
  Inbox as InboxIcon,
  MessageSquare,
  Send,
  CheckCircle2,
  Smile,
  Meh,
  Frown,
  User,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

export default function InboxPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingReply, setIsSendingReply] = useState(false);

  const fetchInbox = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        type: typeFilter,
      });
      const res = await fetch(`/api/inbox?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        if (data.items?.length > 0 && !selectedItem) {
          setSelectedItem(data.items[0]);
        }
      }
    } catch {
      showToast('Failed to load inbox interactions', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, [statusFilter, typeFilter]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !replyText.trim()) return;

    setIsSendingReply(true);
    try {
      const res = await fetch(`/api/inbox/${selectedItem.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyText.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast('Reply dispatched to platform!', 'success');
        setReplyText('');
        // Update local state
        setSelectedItem((prev: any) => ({
          ...prev,
          status: 'REPLIED',
          replies: [...(prev.replies || []), data.reply],
        }));
        fetchInbox();
      } else {
        showToast(data.error || 'Failed to dispatch reply', 'error');
      }
    } catch {
      showToast('Network error while sending reply', 'error');
    } finally {
      setIsSendingReply(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            Unified Social Inbox
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Incoming comments, direct messages, and brand mentions aggregated across connected networks.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchInbox} isLoading={isLoading}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh Inbox
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm dark:shadow-none">
        {['ALL', 'UNREAD', 'READ', 'REPLIED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === st
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-950/80 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            {st}
          </button>
        ))}

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2" />

        {['ALL', 'COMMENT', 'MENTION', 'MESSAGE'].map((tp) => (
          <button
            key={tp}
            onClick={() => setTypeFilter(tp)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              typeFilter === tp
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-950/80 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            {tp === 'ALL' ? 'All Types' : tp}
          </button>
        ))}
      </div>

      {/* 2-Column Split: Message List & Conversation Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Message Thread List (5 Cols) */}
        <Card className="lg:col-span-5 border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-0 overflow-hidden shadow-sm dark:shadow-none">
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>Interactions ({items.length})</span>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800/80 max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-lg bg-slate-100 dark:bg-slate-800/40 skeleton-shimmer" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                <InboxIcon className="h-8 w-8 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="font-semibold text-slate-700 dark:text-slate-400">Inbox Zero</p>
                <p className="mt-1">No incoming comments or mentions in this filter.</p>
              </div>
            ) : (
              items.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`w-full p-4 text-left transition-colors flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-l-4 border-indigo-500'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-950/50'
                    }`}
                  >
                    <img
                      src={item.senderAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${item.senderName}`}
                      alt={item.senderName}
                      className="h-10 w-10 rounded-full border border-slate-300 dark:border-slate-700 object-cover shrink-0"
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                          {item.senderName}
                        </span>
                        <Badge variant={item.platform === 'LINKEDIN' ? 'default' : 'info'} className="text-[9px]">
                          {item.platform}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{item.content}</p>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                        <span>{new Date(item.receivedAt).toLocaleDateString()}</span>
                        <span className="capitalize">{item.type.toLowerCase()}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        {/* Right: Message Inspector & Reply Composer (7 Cols) */}
        <Card className="lg:col-span-7 border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 flex flex-col justify-between min-h-[500px] shadow-sm dark:shadow-none">
          {selectedItem ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              {/* Interaction Details */}
              <div className="space-y-4">
                <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedItem.senderAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${selectedItem.senderName}`}
                      alt={selectedItem.senderName}
                      className="h-12 w-12 rounded-full border border-slate-300 dark:border-slate-700 object-cover"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedItem.senderName}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {selectedItem.senderHandle || selectedItem.platform} • {new Date(selectedItem.receivedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <Badge variant="default">{selectedItem.platform}</Badge>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 leading-relaxed">
                  {selectedItem.content}
                </div>

                {/* Existing Replies Trail */}
                {selectedItem.replies?.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Dispatched Responses ({selectedItem.replies.length})
                    </p>
                    {selectedItem.replies.map((reply: any) => (
                      <div
                        key={reply.id}
                        className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/70 dark:bg-indigo-950/20 text-xs text-slate-800 dark:text-slate-200 ml-6"
                      >
                        <div className="flex items-center justify-between font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
                          <span>{reply.author?.name || 'You'}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {new Date(reply.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p>{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Send Response via {selectedItem.platform} API
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Write a reply to ${selectedItem.senderName}...`}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" size="sm" isLoading={isSendingReply} className="flex items-center gap-1.5">
                    <Send className="h-3.5 w-3.5" /> Dispatch Reply
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-12 text-slate-400 dark:text-slate-500 my-auto">
              <MessageSquare className="h-10 w-10 mb-2 opacity-40 text-slate-400" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-400">Select an interaction</p>
              <p className="text-xs text-slate-500 mt-1">
                Choose a comment or mention from the left column to inspect conversation and reply.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
