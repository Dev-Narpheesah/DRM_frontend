import React, { useState, useEffect } from "react";
import { FaHeart, FaRegHeart, FaStar, FaRegStar, FaComment } from "react-icons/fa";
import CommentSection from "./CommentSection";
import styles from "./SocialFeatures.module.css";

// 🔥 Toast notifications are optional but help give instant feedback
import { toast } from "react-toastify";

const SocialFeatures = ({ reportId }) => {
  const API_URL = "https://drm-backend.vercel.app/api";
  const authToken = JSON.parse(localStorage.getItem("user") || "{}")?.token;

  const [likes, setLikes] = useState({ count: 0, userLiked: false });
  const [ratings, setRatings] = useState({
    average: 0,
    total: 0,
    userRating: null,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch all social stats (likes, ratings, comments)
  useEffect(() => {
    const fetchSocialData = async () => {
      try {
        setLoading(true);
        const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

        const [likesRes, ratingsRes, commentsRes] = await Promise.all([
          fetch(`${API_URL}/likes/${reportId}/count`, { headers }),
          fetch(`${API_URL}/ratings/${reportId}/stats`, { headers }),
          fetch(`${API_URL}/comments/${reportId}`),
        ]);

        if (likesRes.ok) {
          const data = await likesRes.json();
          setLikes({ count: data.likeCount ?? 0, userLiked: !!data.userLiked });
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
  const handleLikeToggle = async () => {
    if (!authToken) return toast.info("🔑 Please log in to like");

    // Optimistic UI update
    setLikes((prev) => ({
      count: prev.count + (prev.userLiked ? -1 : 1),
      userLiked: !prev.userLiked,
    }));

    try {
      const res = await fetch(`${API_URL}/likes/${reportId}/toggle`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setLikes({ count: data.likeCount, userLiked: data.liked });
    } catch {
      toast.error("❌ Failed to update like");
      // rollback if error
      setLikes((prev) => ({
        count: prev.userLiked ? prev.count - 1 : prev.count + 1,
        userLiked: !prev.userLiked,
      }));
    }
  };

  // Optimistic rating
  const handleRating = async (value) => {
    if (!authToken) return toast.info("🔑 Please log in to rate");

    const oldRatings = { ...ratings };

    // Optimistic update (just replace user rating)
    setRatings((prev) => ({
      ...prev,
      userRating: value,
    }));

    try {
      const res = await fetch(`${API_URL}/ratings/${reportId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ rating: value }),
      });

      if (!res.ok) throw new Error();
      const stats = await res.json();
      setRatings(stats);
    } catch {
      toast.error("❌ Failed to update rating");
      setRatings(oldRatings); // rollback
    }
  };

  const handleDeleteRating = async () => {
    if (!authToken) return toast.info("🔑 Please log in to remove rating");

    try {
      const res = await fetch(`${API_URL}/ratings/${reportId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!res.ok) throw new Error();
      const stats = await res.json();
      setRatings(stats);
    } catch {
      toast.error("❌ Failed to remove rating");
    }
  };

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
      {/* Likes ❤️ */}
      <button
        className={`${styles.likeButton} ${likes.userLiked ? styles.liked : ""}`}
        onClick={handleLikeToggle}
      >
        {likes.userLiked ? <FaHeart /> : <FaRegHeart />}
        <span>{likes.count}</span>
      </button>

      {/* Ratings ⭐ */}
      <div className={styles.ratingsSection}>
        <div className={styles.averageRating}>
          <span>{ratings.average.toFixed(1)}</span>
          <div>{renderStars(Math.round(ratings.average))}</div>
          <span>({ratings.total} ratings)</span>
        </div>

        <div className={styles.userRating}>
          <span>Your rating: </span>
          {renderStars(ratings.userRating || 0, true, handleRating)}
          {ratings.userRating && (
            <button onClick={handleDeleteRating} className={styles.removeRating}>
              Remove
            </button>
          )}
        </div>
      </div>

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
