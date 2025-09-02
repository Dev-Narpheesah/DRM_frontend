import React, { useState, useEffect } from "react";
import { API_URL as API_URL_BASE } from "../../config";
import { FaHeart, FaRegHeart, FaStar, FaRegStar, FaComment } from "react-icons/fa";
import CommentSection from "./CommentSection";
import styles from "./SocialFeatures.module.css";

// 🔥 Toast notifications are optional but help give instant feedback
import { toast } from "react-toastify";

const SocialFeatures = ({ reportId }) => {
  const API_URL = API_URL_BASE;
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const authToken = storedUser?.token;
  const userId = storedUser?.id || storedUser?._id || null;
  const sessionId = (() => {
    const key = "sessionId";
    let sid = localStorage.getItem(key);
    if (!sid) {
      sid = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(key, sid);
    }
    return sid;
  })();

  const reactionEmoji = {
    like: '👍',
    love: '❤️',
    care: '🤗',
    haha: '😂',
    wow: '😮',
    sad: '😢',
    angry: '😡',
  };
  const reactionLabel = {
    like: 'Like',
    love: 'Love',
    care: 'Care',
    haha: 'Haha',
    wow: 'Wow',
    sad: 'Sad',
    angry: 'Angry',
  };

  const [likes, setLikes] = useState({ count: 0, userLiked: false, userReaction: null, distribution: { like:0,love:0,care:0,haha:0,wow:0,sad:0,angry:0 } });
  const prevLikesRef = React.useRef(null);
  const [ratings, setRatings] = useState({
    average: 0,
    total: 0,
    userRating: null,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [showComments, setShowComments] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const touchTimerRef = React.useRef(null);
  const barRef = React.useRef(null);
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showReactionsDetail, setShowReactionsDetail] = useState(false);
  const [reactionsDetail, setReactionsDetail] = useState(null);
  const [activeReactionTab, setActiveReactionTab] = useState('all');
  const bodyLockStateRef = React.useRef({ locked: false, prevOverflow: '', prevPaddingRight: '' });

  // Fetch all social stats (likes, ratings, comments)
  useEffect(() => {
    const fetchSocialData = async () => {
      try {
        setLoading(true);
        const [likesRes, ratingsRes, commentsRes] = await Promise.all([
          fetch(`${API_URL}/likes/${reportId}/count?sessionId=${encodeURIComponent(sessionId)}`),
          fetch(`${API_URL}/ratings/${reportId}/stats?userId=${encodeURIComponent(userId || sessionId)}`),
          fetch(`${API_URL}/comments/${reportId}`),
        ]);

        if (likesRes.ok) {
          const data = await likesRes.json();
          setLikes({
            count: data.likeCount ?? 0,
            userLiked: !!data.userLiked,
            userReaction: data.userReaction || null,
            distribution: data.distribution || { like:0,love:0,care:0,haha:0,wow:0,sad:0,angry:0 },
          });
        }

        if (ratingsRes.ok) {
          const data = await ratingsRes.json();
          setRatings({
            average: data.averageRating ?? 0,
            total: data.totalRatings ?? 0,
            userRating: data.userRating ?? null,
            distribution: data.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          });
        }

        if (commentsRes.ok) {
          const comments = await commentsRes.json();
          const countComments = (arr) =>
            arr.reduce((acc, c) => acc + 1 + (c.items ? countComments(c.items) : 0), 0);
          setCommentCount(Array.isArray(comments) ? countComments(comments) : 0);
        }
      } catch (err) {
        toast.error("⚠️ Failed to load social features");
      } finally {
        setLoading(false);
      }
    };

    fetchSocialData();
  }, [reportId, authToken]);

  // Update comment count reactively when this report's comments change
  useEffect(() => {
    const eventName = `commentsUpdated:${reportId}`;
    const handler = async () => {
      try {
        const commentsRes = await fetch(`${API_URL}/comments/${reportId}`);
        if (commentsRes.ok) {
          const comments = await commentsRes.json();
          const countComments = (arr) => arr.reduce((acc, c) => acc + 1 + (c.items ? countComments(c.items) : 0), 0);
          setCommentCount(Array.isArray(comments) ? countComments(comments) : 0);
        }
      } catch {}
    };
    window.addEventListener(eventName, handler);
    return () => window.removeEventListener(eventName, handler);
  }, [reportId]);

  // ====== HANDLERS ======

  // Optimistic like toggle
  const handleReaction = async (reaction) => {
    // Optimistic update
    setLikes((prev) => {
      prevLikesRef.current = prev;
      const hadReaction = !!prev.userReaction;
      const prevReaction = prev.userReaction;
      const next = { ...prev, userReaction: reaction === prevReaction ? null : reaction };
      // Adjust counts
      const dist = { ...prev.distribution };
      if (prevReaction) dist[prevReaction] = Math.max(0, (dist[prevReaction] || 0) - 1);
      if (reaction && reaction !== prevReaction) dist[reaction] = (dist[reaction] || 0) + 1;
      next.distribution = dist;
      next.count = Object.values(dist).reduce((a, b) => a + b, 0);
      next.userLiked = !!next.userReaction;
      return next;
    });

    try {
      const res = await fetch(`${API_URL}/likes/${reportId}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, reactionType: reaction }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLikes((prev) => ({
        ...prev,
        count: data.likeCount ?? prev.count,
        distribution: data.distribution || prev.distribution,
        userReaction: data.reaction || null,
        userLiked: !!(data.reaction || null),
      }));
    } catch {
      toast.error("❌ Failed to react");
      // Revert optimistic change on failure
      setLikes((prev) => prevLikesRef.current || prev);
    }
  };

  const loadReactionsDetail = async () => {
    try {
      const res = await fetch(`${API_URL}/likes/${reportId}/reactions`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setReactionsDetail(data);
      setActiveReactionTab('all');
      setShowReactionsDetail(true);
    } catch {
      toast.error('Failed to load reactions');
    }
  };

  const onMouseEnterBar = () => setShowPicker(true);
  const onMouseLeaveBar = () => {};
  const onTouchStartBar = () => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    touchTimerRef.current = setTimeout(() => setShowPicker(true), 350);
  };
  const onTouchEndBar = () => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
  };

  useEffect(() => {
    if (!showPicker) return;
    const handleClickOutside = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showPicker]);

  // Escape-to-close for comments overlay
  useEffect(() => {
    if (!showComments) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setShowComments(false);
        try {
          document.body.style.overflow = bodyLockStateRef.current.prevOverflow || '';
          document.body.style.paddingRight = bodyLockStateRef.current.prevPaddingRight || '';
          bodyLockStateRef.current.locked = false;
        } catch {}
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showComments]);

  // Remove ratings functionality entirely per request

  // Render stars ⭐
  const renderStars = (value, interactive = false, onClick = null) =>
    Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1;
      const isFilled = starValue <= value;
      return (
        <span
          key={i}
          className={`${styles.star} ${interactive ? styles.interactive : ""}`}
          onClick={interactive ? () => onClick(starValue) : undefined}
        >
          {isFilled ? <FaStar /> : <FaRegStar />}
        </span>
      );
    });

  if (loading) return <div className={styles.loading}>Loading social features...</div>;

  return (
    <div className={styles.socialFeatures}>
      {/* Reactions */}
      <div
        className={styles.reactionBar}
        ref={barRef}
        onMouseEnter={onMouseEnterBar}
        onMouseLeave={onMouseLeaveBar}
        onTouchStart={onTouchStartBar}
        onTouchEnd={onTouchEndBar}
      >
        <button
          className={`${styles.likeButton} ${likes.userReaction ? styles.liked : ""}`}
          onClick={() => handleReaction(likes.userReaction ? null : 'like')}
          aria-haspopup="true"
          aria-expanded={showPicker}
        >
          <span className={styles.reactionEmoji} aria-hidden>
            {likes.userReaction ? reactionEmoji[likes.userReaction] : '👍'}
          </span>
          <span>{likes.userReaction ? reactionLabel[likes.userReaction] : 'Like'}</span>
          <span role="button" onClick={(e) => { e.stopPropagation(); loadReactionsDetail(); }}>· {likes.count}</span>
        </button>
        {showPicker && (
          <div className={styles.reactionPicker} role="menu">
            {[
              { k:'like',  e:'👍',  label:'Like' },
              { k:'love',  e:'❤️',  label:'Love' },
              { k:'care',  e:'🤗',  label:'Care' },
              { k:'haha',  e:'😂',  label:'Haha' },
              { k:'wow',   e:'😮',  label:'Wow' },
              { k:'sad',   e:'😢',  label:'Sad' },
              { k:'angry', e:'😡',  label:'Angry' },
            ].map((r) => (
              <button
                key={r.k}
                className={styles.reactionItem}
                onClick={() => { handleReaction(r.k); setShowPicker(false); }}
                aria-label={`React ${r.k}`}
                role="menuitem"
                data-label={r.label}
              >
                <span className={styles.reactionEmoji}>{r.e}</span>
                <span style={{ fontSize: 10, marginLeft: 4 }} aria-hidden>
                  {likes?.distribution?.[r.k] ?? 0}
                </span>
              </button>
            ))}
        </div>
        )}
      </div>

      {/* Ratings removed per request */}

      {showReactionsDetail && reactionsDetail && (
        <div className={styles.reactionsDetail}>
          <div className={styles.reactionsTabs}>
            {[
              { k: 'all', label: 'All', e: '✨' },
              { k: 'like', label: 'Like', e: '👍' },
              { k: 'love', label: 'Love', e: '❤️' },
              { k: 'care', label: 'Care', e: '🤗' },
              { k: 'haha', label: 'Haha', e: '😂' },
              { k: 'wow', label: 'Wow', e: '😮' },
              { k: 'sad', label: 'Sad', e: '😢' },
              { k: 'angry', label: 'Angry', e: '😡' },
            ].map(t => (
              <button key={t.k} className={`${styles.reactionsTab} ${activeReactionTab === t.k ? styles.active : ''}`} onClick={() => setActiveReactionTab(t.k)}>
                <span>{t.e}</span><span>{t.label}</span>
              </button>
            ))}
            <div style={{ marginLeft: 'auto' }}>
              <button className={styles.reactionsTab} onClick={() => setShowReactionsDetail(false)}>Close</button>
            </div>
          </div>
          <div className={styles.reactionsList}>
            {(() => {
              const entries = [];
              if (activeReactionTab === 'all') {
                for (const k of ['like','love','care','haha','wow','sad','angry']) {
                  for (const item of (reactionsDetail?.[k] || [])) {
                    entries.push({ ...item, reaction: k });
                  }
                }
              } else {
                for (const item of (reactionsDetail?.[activeReactionTab] || [])) {
                  entries.push({ ...item, reaction: activeReactionTab });
                }
              }
              if (!entries.length) return <div style={{ padding: 8, color: '#6b7280' }}>No reactions</div>;
              return entries.map((u) => (
                <div key={`${u.reaction}-${u.id}`} className={styles.reactionsListItem}>
                  <span style={{ fontSize: 16 }}>{reactionEmoji[u.reaction]}</span>
                  <span>{u.name}</span>
                  {u.isGuest && <span style={{ color: '#6b7280', fontSize: 12 }}>(Guest)</span>}
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* Comments 💬 */}
      <div className={styles.commentsSection}>
        <button onClick={() => {
          setShowComments(true);
          try {
            const docEl = document.documentElement;
            const scrollBarWidth = Math.max(0, window.innerWidth - docEl.clientWidth);
            bodyLockStateRef.current.prevOverflow = document.body.style.overflow;
            bodyLockStateRef.current.prevPaddingRight = document.body.style.paddingRight;
            document.body.style.overflow = 'hidden';
            if (scrollBarWidth) document.body.style.paddingRight = `${scrollBarWidth}px`;
            bodyLockStateRef.current.locked = true;
          } catch {}
        }} className={styles.commentsToggle} aria-haspopup="dialog" aria-expanded={showComments}>
          <FaComment /> <span>Comments</span>
          {commentCount > 0 && <span className={styles.commentBadge}>{commentCount}</span>}
        </button>
        {showComments && (
          <div className={styles.commentsOverlay} role="dialog" aria-modal="true">
            <div className={styles.commentsBackdrop} onClick={() => {
              setShowComments(false);
              try {
                document.body.style.overflow = bodyLockStateRef.current.prevOverflow || '';
                document.body.style.paddingRight = bodyLockStateRef.current.prevPaddingRight || '';
                bodyLockStateRef.current.locked = false;
              } catch {}
            }} />
            <div className={styles.commentsPanel}>
              <div className={styles.commentsHeader}>
                <span>Comments</span>
                <button className={styles.closeButton} onClick={() => {
                  setShowComments(false);
                  try {
                    document.body.style.overflow = bodyLockStateRef.current.prevOverflow || '';
                    document.body.style.paddingRight = bodyLockStateRef.current.prevPaddingRight || '';
                    bodyLockStateRef.current.locked = false;
                  } catch {}
                }} aria-label="Close comments">✕</button>
              </div>
              <div className={styles.commentsBody}>
                <CommentSection reportId={reportId} composerAtBottom={true} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialFeatures;
