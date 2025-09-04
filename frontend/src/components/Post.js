import React, { useState, useEffect } from 'react';
import { postsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Post = ({ post, onPostUpdate }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.is_liked === 1);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentCount, setCommentCount] = useState(post.comment_count);

  const handleLike = async () => {
    try {
      const response = await postsAPI.likePost(post.id);
      setLiked(response.data.liked);
      setLikeCount(prev => response.data.liked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const loadComments = async () => {
    if (!showComments) {
      try {
        const response = await postsAPI.getComments(post.id);
        setComments(response.data.comments);
      } catch (error) {
        console.error('Error loading comments:', error);
      }
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await postsAPI.addComment(post.id, newComment);
      setComments([...comments, response.data.comment]);
      setNewComment('');
      setCommentCount(prev => prev + 1);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
    return `${Math.floor(diffInHours / 168)}w`;
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg mb-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center p-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold mr-3">
          {post.username?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{post.username}</p>
          <p className="text-gray-500 text-xs">{formatDate(post.created_at)}</p>
        </div>
      </div>

      {/* Image */}
      <div className="relative">
        <img 
          src={`http://localhost:5000${post.image_url}`} 
          alt="Post" 
          className="w-full h-auto"
        />
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center space-x-4 mb-2">
          <button 
            onClick={handleLike}
            className={`${liked ? 'text-red-500' : 'text-gray-700'} hover:text-red-500 transition-colors`}
          >
            <svg className="w-6 h-6" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button 
            onClick={loadComments}
            className="text-gray-700 hover:text-gray-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>

        {/* Like count */}
        {likeCount > 0 && (
          <p className="font-semibold text-sm mb-2">{likeCount} {likeCount === 1 ? 'like' : 'likes'}</p>
        )}

        {/* Caption */}
        {post.caption && (
          <p className="text-sm mb-2">
            <span className="font-semibold mr-2">{post.username}</span>
            {post.caption}
          </p>
        )}

        {/* Comment count */}
        {commentCount > 0 && (
          <button 
            onClick={loadComments}
            className="text-gray-500 text-sm mb-2 hover:text-gray-700"
          >
            View all {commentCount} comments
          </button>
        )}

        {/* Comments */}
        {showComments && (
          <div className="space-y-2 mb-3">
            {comments.map((comment) => (
              <div key={comment.id} className="text-sm">
                <span className="font-semibold mr-2">{comment.username}</span>
                {comment.content}
                <span className="text-gray-500 text-xs ml-2">{formatDate(comment.created_at)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Add comment */}
        <form onSubmit={handleAddComment} className="flex items-center">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 text-sm border-none outline-none"
          />
          {newComment.trim() && (
            <button 
              type="submit"
              className="text-blue-500 font-semibold text-sm hover:text-blue-700"
            >
              Post
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Post;
