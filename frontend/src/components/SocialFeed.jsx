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

  const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!newPost.trim() || !user) return;

        try {
            const newPostRef = await addDoc(collection(db, 'posts'), {
                text: newPost,
                userName: user.name || 'Anonymous User', // Use user's name from context
                userAvatar: user.avatarUrl || 'default-avatar.png', // Placeholder
                likes: 0,
                comments: 0,
                isLiked: false, // Client-side tracking
                createdAt: serverTimestamp(),
            });
            // Add the new post to the local state (front of the array)
            setPosts([{ 
                id: newPostRef.id, 
                text: newPost,
                userName: user.name || 'Anonymous User',
                userAvatar: user.avatarUrl || 'default-avatar.png',
                likes: 0,
                comments: 0,
                isLiked: false,
                createdAt: { toDate: () => new Date() } // Mock Date for fresh posts
            }, ...posts]);
            setNewPost('');
        } catch (error) {
            console.error('Error adding document: ', error);
        }
    };
    
    // Mock data for the trending/challenges section
    const trendingPosts = [
        { title: "Top 5 Protein Smoothies", likes: 120, comments: 45 },
        { title: "Best 30-Minute HIIT Workouts", likes: 98, comments: 22 },
        { title: "Macro-Friendly Desserts Guide", likes: 85, comments: 15 },
    ];

    const challenges = [
        { name: "30-Day Plank Challenge", participants: 452 },
        { name: "Meatless Monday", participants: 1200 },
        { name: "5K Daily Step Goal", participants: 3120 },
    ];

    return (
        <div className="social-feed-container">
            {/* 1. Main Content - Posts and New Post Form */}
            <div className="posts-section">
                
                {/* A. New Post Form */}
                <div className="new-post-card card">
                    <h3 className="card-title">Share Your Progress</h3>
                    <form onSubmit={handlePostSubmit} className="new-post-form">
                        <textarea
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            placeholder="What's your workout win today? Share your macros, a recipe, or a motivation quote!"
                            rows="3"
                            maxLength="280"
                        />
                        <div className="post-actions">
                            <button type="submit" disabled={!newPost.trim()} className="post-button">
                                Post to Feed
                            </button>
                            <span className="char-count">{newPost.length}/280</span>
                        </div>
                    </form>
                </div>

                {/* B. Posts Feed */}
                <div className="feed-list">
                    {posts.length === 0 ? (
                        <p className="table-empty">No posts yet. Be the first to share!</p>
                    ) : (
                        posts.map((post) => (
                            <div key={post.id} className="post-card card">
                                <div className="post-header">
                                    <img src={post.userAvatar || 'default-avatar.png'} alt="Avatar" className="user-avatar" />
                                    <div className="user-info">
                                        <span className="post-user-name">{post.userName}</span>
                                        <span className="post-time">{post.createdAt.toDate().toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="post-body">
                                    <p>{post.text}</p>
                                </div>
                                <div className="post-footer">
                                    <div className={`post-like ${post.isLiked ? 'liked' : ''}`} onClick={() => handleLike(post.id)}>
                                        <Heart size={14} fill={post.isLiked ? 'red' : 'none'} color={post.isLiked ? 'red' : 'var(--color-secondary-text)'} />
                                        <span className="like-count">{post.likes}</span>
                                    </div>
                                    <div className="post-comment">
                                        <MessageCircle size={14} color="var(--color-secondary-text)" />
                                        <span className="comment-count">{post.comments}</span>
                                    </div>
                                    <Share2 size={14} color="var(--color-secondary-text)" className="share-icon" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 2. Sidebar - Trending and Challenges */}
            <div className="sidebar-section">
                
                <div className="trending-section card">
                    <div className="trending-title card-title">
                        <span>📈 Trending Posts</span>
                    </div>
                    <ul className="trending-list">
                        {trendingPosts.map((post, index) => (
                            <li key={index} className="trending-item">
                                {post.title} <span className="trending-stats">({post.likes} likes)</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="challenges-section card">
                    <div className="challenges-title card-title">
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
        </div>
    );
};

export default SocialFeed;