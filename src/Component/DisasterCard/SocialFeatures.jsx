import React, { useState, useEffect } from "react";
import { FaHeart, FaRegHeart, FaStar, FaRegStar, FaComment } from "react-icons/fa";
import CommentSection from "./CommentSection";
import styles from "./SocialFeatures.module.css";

// 🔥 Toast notifications are optional but help give instant feedback
import { toast } from "react-toastify";

const SocialFeatures = ({ reportId }) => {
  const API_URL = "https://drm-backend.vercel.app/api";
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

  // ====== HANDLERS ======

  // Optimistic like toggle
  const handleReaction = async (reaction) => {
    // Optimistic update
    setLikes((prev) => {
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
      // reload server counts
      try {
        const likesRes = await fetch(`${API_URL}/likes/${reportId}/count?sessionId=${encodeURIComponent(sessionId)}`);
        if (likesRes.ok) {
          const data = await likesRes.json();
          setLikes({
            count: data.likeCount ?? 0,
            userLiked: !!data.userLiked,
            userReaction: data.userReaction || null,
            distribution: data.distribution || { like:0,love:0,care:0,haha:0,wow:0,sad:0,angry:0 },
          });
        }
      } catch {}
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
          <span>· {likes.count}</span>
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
      </button>
            ))}
        </div>
        )}
      </div>

      {/* Ratings removed per request */}

      {/* Comments 💬 */}
      <div className={styles.commentsSection}>
        <button onClick={() => setShowComments((p) => !p)} className={styles.commentsToggle}>
          <FaComment /> <span>Comments</span>
          {commentCount > 0 && <span className={styles.commentBadge}>{commentCount}</span>}
        </button>
        {showComments && <CommentSection reportId={reportId} />}
      </div>
    </div>
  );
};

export default SocialFeatures;
