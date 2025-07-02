import Action from './Action';
import DownArrow from '../../assets/down-arrow.svg?react';
import UpArrow from '../../assets/up-arrow.svg?react';
import './CommentSection.css';

const CommentSection = ({ comment, reportId }) => {
  const API_URL = 'https://drm-backend.vercel.app/api';

  const handleNewComment = async (inputElement, isReply = false) => {
    const text = inputElement.value.trim();
    if (!text) return;

    try {
      const response = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          reportId,
          parentId: isReply ? comment.id : comment.id,
          name: text,
        }),
      });

      if (!response.ok) throw new Error('Failed to add comment');

      // Clear input and refetch comments
      inputElement.value = '';
      await refetchComments();
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment');
    }
  };

  const handleEditComment = async (commentId, textElement) => {
    const text = textElement.innerText.trim();
    if (!text) return;

    try {
      const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: text }),
      });

      if (!response.ok) throw new Error('Failed to edit comment');

      // Refetch comments
      await refetchComments();
    } catch (err) {
      console.error('Error editing comment:', err);
      alert('Failed to edit comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete comment');

      // Refetch comments
      await refetchComments();
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment');
    }
  };

  const refetchComments = async () => {
    try {
      const response = await fetch(`${API_URL}/comments/${reportId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch comments');

      const commentData = await response.json();
      // Trigger a parent refresh (handled in DisasterCard)
      window.dispatchEvent(new CustomEvent('commentsUpdated', { detail: { reportId } }));
    } catch (err) {
      console.error('Error fetching comments:', err);
      alert('Failed to load comments');
    }
  };

  if (!comment) return null;

  return (
    <div className="comment-section">
      <div className={comment.id === 1 ? 'input-container' : 'comment-container'}>
        {comment.id === 1 ? (
          <>
            <input
              type="text"
              className="input-container__input input-container__input--first"
              autoFocus
              placeholder="Type your comment..."
              aria-label="New comment"
            />
            <Action
              className="action action--reply"
              type="COMMENT"
              handleClick={() => handleNewComment(document.querySelector('.input-container__input--first'))}
              aria-label="Submit comment"
            />
          </>
        ) : (
          <>
            <span
              className="comment-text"
              contentEditable={false}
              aria-label="Comment text"
            >
              {comment.name || ''}
            </span>
            <div className="action-container">
              <Action
                className="action action--reply"
                type={
                  <>
                    <DownArrow className="action-icon" />
                    Reply
                  </>
                }
                handleClick={() => {
                  const replyInput = document.querySelector(`#reply-input-${comment.id}`);
                  if (replyInput) replyInput.style.display = 'block';
                }}
                aria-label="Reply to comment"
              />
              <Action
                className="action action--reply"
                type="EDIT"
                handleClick={() => {
                  const textElement = document.querySelector(`#comment-text-${comment.id}`);
                  if (textElement) {
                    textElement.contentEditable = true;
                    textElement.classList.add('comment-text--editable');
                    textElement.focus();
                  }
                }}
                aria-label="Edit comment"
              />
              <Action
                className="action action--reply"
                type="SAVE"
                handleClick={() => handleEditComment(comment.id, document.querySelector(`#comment-text-${comment.id}`))}
                aria-label="Save edited comment"
              />
              <Action
                className="action action--reply"
                type="CANCEL"
                handleClick={() => {
                  const textElement = document.querySelector(`#comment-text-${comment.id}`);
                  if (textElement) {
                    textElement.contentEditable = false;
                    textElement.classList.remove('comment-text--editable');
                    textElement.innerText = comment.name || '';
                  }
                }}
                aria-label="Cancel edit"
              />
              <Action
                className="action action--reply"
                type="DELETE"
                handleClick={() => handleDeleteComment(comment.id)}
                aria-label="Delete comment"
              />
            </div>
          </>
        )}
      </div>

      <div className="nested-comments">
        {comment.id !== 1 && (
          <div className="input-container" id={`reply-input-${comment.id}`} style={{ display: 'none' }}>
            <input
              type="text"
              className="input-container__input"
              autoFocus
              placeholder="Type your reply..."
              aria-label="Reply to comment"
            />
            <Action
              className="action action--reply"
              type="REPLY"
              handleClick={() => handleNewComment(document.querySelector(`#reply-input-${comment.id} .input-container__input`), true)}
              aria-label="Submit reply"
            />
            <Action
              className="action action--reply"
              type="CANCEL"
              handleClick={() => {
                const replyInput = document.querySelector(`#reply-input-${comment.id}`);
                if (replyInput) replyInput.style.display = 'none';
              }}
              aria-label="Cancel reply"
            />
          </div>
        )}

        {comment?.items?.map((cmnt) => (
          <CommentSection
            key={cmnt.id}
            comment={cmnt}
            reportId={reportId}
          />
        ))}
      </div>
    </div>
  );
};

export default CommentSection;