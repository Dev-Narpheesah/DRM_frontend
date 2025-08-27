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
  const isMounted = useRef(true);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_URL}/comments/${reportId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to fetch comments');
      const data = await res.json();
      if (!isMounted.current) return;

      const flat = Array.isArray(data) ? data : [];
      const normalized = flat.map((c) => ({
        id: c._id,
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
    const handler = (e) => {
      if (e?.detail?.reportId === reportId) fetchComments();
    };
    window.addEventListener('commentsUpdated', handler);
    return () => {
      isMounted.current = false;
      window.removeEventListener('commentsUpdated', handler);
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
        body: JSON.stringify({ text: trimmed, parentId }),
      });
      if (!response.ok) throw new Error('Failed to add comment');
      const saved = await response.json();
      // Replace temp with saved
      setTree((prev) =>
        updateOptimistic(prev, tempId, () => ({
          ...optimisticNode,
          id: saved._id,
          text: saved.text,
          optimistic: false,
        }))
      );
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
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to delete comment');
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
            onReply={(text) => handleCreate(text, node.id)}
            onEdit={(text) => handleEdit(node.id, text)}
            onDelete={() => handleDelete(node.id)}
          />
        ))}
      </div>
    </div>
  );
};

const CommentNode = ({ node, onReply, onEdit, onDelete }) => {
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(node.text || ''); // ✅ use text
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="comment-container">
      <div className="comment-header">
        <span className="comment-author">User</span>
        <span className="comment-time">
          {new Date(node.createdAt || Date.now()).toLocaleString()}
        </span>
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
          className="action action--reply"
          onClick={() => setIsReplyOpen((v) => !v)}
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
        <div className="input-container">
          <input
            type="text"
            className="input-container__input"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your reply..."
            aria-label="Reply to comment"
          />
          <button
            className="action action--reply"
            onClick={() => {
              onReply(replyText);
              setReplyText('');
              setIsReplyOpen(false);
            }}
          >
            Reply
          </button>
          <button
            className="action action--reply"
            onClick={() => {
              setIsReplyOpen(false);
              setReplyText('');
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {expanded && node.items?.length > 0 && (
        <div className="nested-comments">
          {node.items.map((child) => (
            <CommentNode
              key={child.id}
              node={child}
              onReply={(text) => onReply(text)}
              onEdit={(text) => onEdit(text)}
              onDelete={() => onDelete(child.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
