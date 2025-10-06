// src/components/SocialFeed.jsx
import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, TrendingUp, Users } from 'lucide-react';
import { useUser } from './UserContext';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';

const SocialFeed = () => {
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
    fetchPosts();
  }, []);

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleNewPost = async () => {
    if (!newPost.trim() || !user) return;

    try {
      const post = {
        user: { 
          name: user.displayName || user.name || 'Anonymous', 
          avatar: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face', 
          timeAgo: 'Just now' 
        },
        title: 'New Update',
        calories: '0 Calories Today',
        content: newPost,
        image: null,
        likes: 0,
        comments: 0,
        isLiked: false,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'posts'), post);
      setPosts([{ ...post, id: docRef.id }, ...posts]);
      setNewPost('');
    } catch (error) {
      console.error('Error adding post:', error);
      alert('Failed to post. Please try again.');
    }
  };

  const trendingPosts = [
    { title: "Top Cardio Tips", likes: 45, comments: 12 },
    { title: "Strength Training 101", likes: 33, comments: 8 },
  ];
  
  const challenges = [
    { name: "30-Day Challenge", participants: 120 },
    { name: "Water Intake Goal", participants: 85 },
  ];

  return (
    <div className="social-feed-container">
      <div className="post-input">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's on your mind? Share your fitness journey!"
          className="post-textarea"
        />
        <button
          onClick={handleNewPost}
          disabled={!user || !newPost.trim()}
          className="post-button"
        >
          Post
        </button>
      </div>

      <div className="feed-list">
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <img
                src={post.user.avatar}
                alt={post.user.name}
                className="post-avatar"
              />
              <div className="post-user">
                <h4 className="post-username">{post.user.name}</h4>
                <p className="post-time">{post.user.timeAgo}</p>
              </div>
            </div>
            <h3 className="post-title">{post.title}</h3>
            <p className="post-content">{post.content}</p>
            {post.image && <img src={post.image} alt="Post" className="post-image" />}
            <div className="post-actions">
              <span className="post-calories">{post.calories}</span>
              <div className="post-like">
                <Heart
                  size={14}
                  fill={post.isLiked ? '#ef4444' : 'none'}
                  onClick={() => handleLike(post.id)}
                  className="like-icon"
                />
                <span className="like-count">{post.likes}</span>
              </div>
              <div className="post-comment">
                <MessageCircle size={14} />
                <span className="comment-count">{post.comments}</span>
              </div>
              <Share2 size={14} className="share-icon" />
            </div>
          </div>
        ))}
      </div>

      <div className="trending-section">
        <div className="trending-title">
          <span>📈 Trending Posts</span>
        </div>
        <ul className="trending-list">
          {trendingPosts.map((post, index) => (
            <li key={index} className="trending-item">
              {post.title} <span className="trending-stats">({post.likes} likes, {post.comments} comments)</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="challenges-section">
        <div className="challenges-title">
          <span>👥 Challenges</span>
        </div>
        <ul className="challenges-list">
          {challenges.map((challenge, index) => (
            <li key={index} className="challenges-item">
              {challenge.name} <span className="challenges-stats">({challenge.participants} participants)</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SocialFeed;