import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaStar, FaRegStar, FaComment } from 'react-icons/fa';
import CommentSection from './CommentSection';
import styles from './SocialFeatures.module.css';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

const SOCKET_URL = 'https://drm-backend.vercel.app';

const SocialFeatures = ({ reportId }) => {
  const [likes, setLikes] = useState({ count: 0, userLiked: false });
  const [ratings, setRatings] = useState({ 
    average: 0, 
    total: 0, 
    userRating: null,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'https://drm-backend.vercel.app/api';

  useEffect(() => {
    fetchSocialData();
  }, [reportId]);

  useEffect(() => {
    // Setup socket listeners for comments and likes
    const socket = io(SOCKET_URL, { transports: ['websocket'], withCredentials: true });

    const onCommentCreated = (payload) => {
      if (payload?.reportId === reportId) {
        setCommentCount((c) => c + 1);
        window.dispatchEvent(new CustomEvent('commentsUpdated', { detail: { reportId } }));
        toast.info('New comment received');
      }
    };
    const onCommentUpdated = (payload) => {
      if (payload?.reportId === reportId) {
        window.dispatchEvent(new CustomEvent('commentsUpdated', { detail: { reportId } }));
        toast.info('A comment was updated');
      }
    };
    const onCommentDeleted = (payload) => {
      if (payload?.reportId === reportId) {
        setCommentCount((c) => Math.max(0, c - 1));
        window.dispatchEvent(new CustomEvent('commentsUpdated', { detail: { reportId } }));
        toast.info('A comment was deleted');
      }
    };
    const onLikeUpdated = (payload) => {
      if (payload?.reportId === reportId) {
        setLikes((prev) => ({ count: payload.likeCount ?? prev.count, userLiked: prev.userLiked }));
        toast.info(payload.liked ? 'Someone liked this report' : 'A like was removed');
      }
    };

    socket.on('comment:created', onCommentCreated);
    socket.on('comment:updated', onCommentUpdated);
    socket.on('comment:deleted', onCommentDeleted);
    socket.on('like:updated', onLikeUpdated);

    return () => {
      socket.off('comment:created', onCommentCreated);
      socket.off('comment:updated', onCommentUpdated);
      socket.off('comment:deleted', onCommentDeleted);
      socket.off('like:updated', onLikeUpdated);
      socket.close();
    };
  }, [reportId]);

  const fetchSocialData = async () => {
    try {
      setLoading(true);
      const [likesResponse, ratingsResponse, commentsResponse] = await Promise.all([
        fetch(`${API_URL}/likes/${reportId}`, {
          credentials: 'include'
        }),
        fetch(`${API_URL}/ratings/${reportId}`, {
          credentials: 'include'
        }),
        fetch(`${API_URL}/comments/${reportId}`, {
          credentials: 'include'
        })
      ]);

      if (likesResponse.ok) {
        const likesData = await likesResponse.json();
        setLikes(likesData);
      } else {
        console.error('Failed to fetch likes:', likesResponse.status);
      }

      if (ratingsResponse.ok) {
        const ratingsData = await ratingsResponse.json();
        setRatings(ratingsData);
      } else {
        console.error('Failed to fetch ratings:', ratingsResponse.status);
      }

      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        const countRec = (nodes) => nodes.reduce((acc, n) => acc + 1 + (n.items ? countRec(n.items) : 0), 0);
        setCommentCount(Array.isArray(commentsData) ? countRec(commentsData) : 0);
      }
    } catch (error) {
      console.error('Error fetching social data:', error);
      setError('Failed to load social features');
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async () => {
    try {
      const response = await fetch(`${API_URL}/likes/${reportId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setLikes(prev => ({
          count: data.likeCount,
          userLiked: data.liked
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleRating = async (rating) => {
    try {
      const response = await fetch(`${API_URL}/ratings/${reportId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rating })
      });

      if (response.ok) {
        const statsResponse = await fetch(`${API_URL}/ratings/${reportId}`, { credentials: 'include' });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setRatings(statsData);
        }
      }
    } catch (error) {
      console.error('Error adding rating:', error);
    }
  };

  const handleDeleteRating = async () => {
    try {
      const response = await fetch(`${API_URL}/ratings/${reportId}`, { method: 'DELETE', credentials: 'include' });
      if (response.ok) {
        const statsResponse = await fetch(`${API_URL}/ratings/${reportId}`, { credentials: 'include' });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setRatings(statsData);
        }
      }
    } catch (error) {
      console.error('Error deleting rating:', error);
    }
  };

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= rating;
      return (
        <span
          key={index}
          className={`${styles.star} ${interactive ? styles.interactive : ''}`}
          onClick={interactive ? () => onStarClick(starValue) : undefined}
        >
          {isFilled ? <FaStar /> : <FaRegStar />}
        </span>
      );
    });
  };

  if (loading) return <div className={styles.loading}>Loading social features...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.socialFeatures}>
      <div className={styles.likesSection}>
        <button 
          className={`${styles.likeButton} ${likes.userLiked ? styles.liked : ''}`}
          onClick={handleLikeToggle}
        >
          {likes.userLiked ? <FaHeart /> : <FaRegHeart />}
          <span>{likes.count}</span>
        </button>
      </div>

      <div className={styles.ratingsSection}>
        <div className={styles.ratingDisplay}>
          <div className={styles.averageRating}>
            <span className={styles.ratingNumber}>{ratings.average}</span>
            <div className={styles.stars}>{renderStars(Math.round(ratings.average))}</div>
            <span className={styles.totalRatings}>({ratings.total} ratings)</span>
          </div>
        </div>

        <div className={styles.userRating}>
          <span>Your rating: </span>
          <div className={styles.userStars}>{renderStars(ratings.userRating || 0, true, handleRating)}</div>
          {ratings.userRating && (
            <button className={styles.removeRating} onClick={handleDeleteRating}>Remove</button>
          )}
        </div>

        <div className={styles.ratingDistribution}>
          {[5, 4, 3, 2, 1].map(star => (
            <div key={star} className={styles.distributionRow}>
              <span>{star}★</span>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${ratings.total > 0 ? (ratings.distribution[star] / ratings.total) * 100 : 0}%` }} />
              </div>
              <span>{ratings.distribution[star]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.commentsSection}>
        <button className={styles.commentsToggle} onClick={() => setShowComments(!showComments)}>
          <FaComment />
          <span>Comments</span>
          {commentCount > 0 && <span className={styles.commentBadge}>{commentCount}</span>}
        </button>
        {showComments && (
          <div className={styles.commentsContainer}>
            <CommentSection reportId={reportId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialFeatures;
