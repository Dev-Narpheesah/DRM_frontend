import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import DownArrow from '../../assets/down-arrow.svg?react';
import UpArrow from '../../assets/up-arrow.svg?react';
import './CommentSection.css';

const API_URL = 'https://drm-backend.vercel.app/api' || 'http://localhost:4000/api';
const authToken = JSON.parse(localStorage.getItem('user') || '{}')?.token;

const CommentSection = ({ reportId }) => {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [activeReplyId, setActiveReplyId] = useState(null);
  const isMounted = useRef(true);
  const currentUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  }, []);
  const currentName = currentUser?.name || currentUser?.username || currentUser?.email || 'Anonymous';

  const formatRelativeTime = useCallback((dateInput) => {
    const date = new Date(dateInput);
    const now = new Date();
    const diffMs = Math.max(0, now - date);
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    if (seconds < 60) return `${seconds || 1}s`;
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    if (weeks < 5) return `${weeks}w`;
    if (months < 12) return `${months}mo`;
    return `${years}y`;
  }, []);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_URL}/comments/${reportId}?page=1&limit=50`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to fetch comments');
      const payload = await res.json();
      const data = Array.isArray(payload) ? payload : (payload?.data || []);
      if (!isMounted.current) return;

      const flat = Array.isArray(data) ? data : [];
      const normalized = flat.map((c) => ({
        id: c._id,
        name: c.name || 'Anonymous',
        text: c.text,
        reportId: c.reportId,
        parentId: c.parentId || null,
        items: [],
        createdAt: c.createdAt,
      }));
      const byId = new Map();
      normalized.forEach((n) => byId.set(n.id, n));
      normalized.forEach((n) => {
        if (n.parentId && byId.get(n.parentId)) {
          byId.get(n.parentId).items.push(n);
        }
      });
      const roots = normalized.filter((n) => !n.parentId);
      setTree(roots);
    } catch (e) {
      if (!isMounted.current) return;
      setError(e.message || 'Failed to load comments');
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [reportId]);


  useEffect(() => {
    isMounted.current = true;
    fetchComments();
    // Use a namespaced event per report to avoid cross-card updates
    const eventName = `commentsUpdated:${reportId}`;
    const handler = () => {
      fetchComments();
    };
    window.addEventListener(eventName, handler);
    // Also listen to legacy global event but gate strictly by reportId
    const legacyHandler = (e) => {
      if (e?.detail?.reportId === reportId) fetchComments();
    };
    window.addEventListener('commentsUpdated', legacyHandler);
    return () => {
      isMounted.current = false;
      window.removeEventListener(eventName, handler);
      window.removeEventListener('commentsUpdated', legacyHandler);
    };
  }, [reportId, fetchComments]);

  const addOptimistic = (list, parentId, node) => {
    if (!parentId) return [node, ...list];
    return list.map((item) => {
      if (item.id === parentId) {
        return { ...item, items: [node, ...(item.items || [])] };
      }
      if (item.items && item.items.length) {
        return { ...item, items: addOptimistic(item.items, parentId, node) };
      }
      return item;
    });
  };

  const updateOptimistic = (list, id, updater) => {
    return list.map((item) => {
      if (item.id === id) return updater(item);
      if (item.items && item.items.length) {
        return { ...item, items: updateOptimistic(item.items, id, updater) };
      }
      return item;
    });
  };

  const deleteOptimistic = (list, id) => {
    return list
      .filter((item) => item.id !== id)
      .map((item) => ({
        ...item,
        items: item.items ? deleteOptimistic(item.items, id) : [],
      }));
  };

  const handleCreate = async (text, parentId = null, clear) => {
    const trimmed = (text || '').trim();
    if (!trimmed) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticNode = {
      id: tempId,
      name: currentName,
      text: trimmed, // ✅ use text, not name
      reportId,
      parentId: parentId || null,
      items: [],
      createdAt: new Date().toISOString(),
      optimistic: true,
    };
    setTree((prev) => addOptimistic(prev, parentId, optimisticNode));
    if (clear) clear();

    try {
      // 🚨 everyone can post, no auth required
      const response = await fetch(`${API_URL}/comments/${reportId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: currentName, text: trimmed, parentId }),
      });
      if (!response.ok) throw new Error('Failed to add comment');
      const saved = await response.json();
      // Replace temp with saved
      setTree((prev) =>
        updateOptimistic(prev, tempId, () => ({
          ...optimisticNode,
          id: saved._id,
          name: saved.name || currentName,
          text: saved.text,
          optimistic: false,
        }))
      );
      // Notify this report's listeners to refresh counts
      const eventName = `commentsUpdated:${reportId}`;
      window.dispatchEvent(new CustomEvent(eventName));
      // Legacy global event for backward compatibility
      window.dispatchEvent(new CustomEvent('commentsUpdated', { detail: { reportId } }));
    } catch (e) {
      // Revert on failure
      setTree((prev) => deleteOptimistic(prev, tempId));
      alert('Failed to add comment');
    }
  };

  const handleEdit = async (id, newText) => {
    const trimmed = (newText || '').trim();
    if (!trimmed) return;
    const prevTree = tree;
    setTree((prev) =>
      updateOptimistic(prev, id, (item) => ({ ...item, text: trimmed }))
    );
    try {
      // Edit endpoint not implemented on backend - revert immediately
      setTree(prevTree);
    } catch (e) {
      setTree(prevTree);
      alert('Failed to edit comment');
    }
  };

  const handleDelete = async (id) => {
    const prevTree = tree;
    setTree((prev) => deleteOptimistic(prev, id));
    try {
      const response = await fetch(`${API_URL}/comments/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      });
      if (!response.ok) throw new Error('Failed to delete comment');
      // Notify this report's listeners to refresh counts
      const eventName = `commentsUpdated:${reportId}`;
      window.dispatchEvent(new CustomEvent(eventName));
      window.dispatchEvent(new CustomEvent('commentsUpdated', { detail: { reportId } }));
    } catch (e) {
      setTree(prevTree);
      alert('Failed to delete comment');
    }
  };

  return (
    <div className="comment-section">
      <div className="input-container">
        <input
          type="text"
          className="input-container__input input-container__input--first"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Type your comment..."
          aria-label="New comment"
        />
        <button
          className="action action--reply"
          onClick={() =>
            handleCreate(newComment, null, () => setNewComment(''))
          }
          aria-label="Submit comment"
        >
          Comment
        </button>
      </div>

      {loading && <p>Loading comments...</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <div className="nested-comments">
        {tree.map((node) => (
          <CommentNode
            key={node.id}
            node={node}
            activeReplyId={activeReplyId}
            setActiveReplyId={setActiveReplyId}
            onReply={(text) => handleCreate(text, node.id)}
            onEdit={(text) => handleEdit(node.id, text)}
            onDelete={() => handleDelete(node.id)}
            formatRelativeTime={formatRelativeTime}
          />
        ))}
      </div>
    </div>
  );
};

const CommentNode = ({ node, onReply, onEdit, onDelete, activeReplyId, setActiveReplyId, formatRelativeTime }) => {
  const [replyText, setReplyText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(node.text || ''); // ✅ use text
  const [expanded, setExpanded] = useState(true);
  const isReplyOpen = activeReplyId === node.id;
  const relative = React.useMemo(() => (node.createdAt ? new Date(node.createdAt) : new Date()), [node.createdAt]);

  return (
    <div className="comment-container">
      <div className="comment-header">
        <span className="comment-author">{node.name || 'User'}</span>
        <span className="comment-time">• {formatRelativeTime(relative)} ago</span>
        {node.optimistic && <span className="comment-pending">sending…</span>}
      </div>

      {isEditing ? (
        <div className="edit-row">
          <input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="input-container__input"
            aria-label="Edit comment"
          />
          <button
            className="action action--reply"
            onClick={() => {
              onEdit(editText);
              setIsEditing(false);
            }}
          >
            Save
          </button>
          <button
            className="action action--reply"
            onClick={() => {
              setIsEditing(false);
              setEditText(node.text || '');
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <span className="comment-text">{node.text}</span> // ✅ render text
      )}

      <div className="action-container">
        <button
          className="action reply-toggle"
          onClick={() => {
            setActiveReplyId(isReplyOpen ? null : node.id);
          }}
          aria-label="Reply to comment"
        >
          {isReplyOpen ? (
            <UpArrow className="action-icon" />
          ) : (
            <DownArrow className="action-icon" />
          )}
          Reply
        </button>
        <button
          className="action action--reply"
          onClick={() => setIsEditing(true)}
          aria-label="Edit comment"
        >
          Edit
        </button>
        <button
          className="action action--reply"
          onClick={onDelete}
          aria-label="Delete comment"
        >
          Delete
        </button>
        {node.items?.length > 0 && (
          <button
            className="action action--reply"
            onClick={() => setExpanded((v) => !v)}
            aria-label="Toggle replies"
          >
            {expanded ? 'Hide Replies' : 'Show Replies'} ({node.items.length})
          </button>
        )}
      </div>

      {isReplyOpen && (
        <div className="reply-row">
          <input
            type="text"
            className="reply-input"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            aria-label="Reply to comment"
          />
          <div className="reply-actions">
            <button
              className="reply-button"
              onClick={() => {
                onReply(replyText);
                setReplyText('');
                setActiveReplyId(null);
              }}
            >
              Reply
            </button>
            <button
              className="reply-cancel"
              onClick={() => {
                setActiveReplyId(null);
                setReplyText('');
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {expanded && node.items?.length > 0 && (
        <div className="nested-comments">
          {node.items.map((child) => (
            <CommentNode
              key={child.id}
              node={child}
              activeReplyId={activeReplyId}
              setActiveReplyId={setActiveReplyId}
              onReply={(text) => onReply(text)}
              onEdit={(text) => onEdit(text)}
              onDelete={() => onDelete(child.id)}
              formatRelativeTime={formatRelativeTime}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
