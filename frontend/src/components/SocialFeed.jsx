import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, TrendingUp, Users, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from './UserContext';

const SocialFeed = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: { name: 'Christopher G', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face', timeAgo: '2 hours ago' },
      title: 'Crushing My Macro Goals!',
      calories: '2100 Calories Today',
      content: 'Feeling great today after hitting all my protein and carb targets! Meal prepping makes such a difference. Had a delicious salmon and quinoa bowl for lunch. Who else is staying consistent?',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&h=200&fit=crop',
      likes: 58,
      comments: 12,
      isLiked: false
    },
    {
      id: 2,
      user: { name: 'Valeria M', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face', timeAgo: 'Yesterday' },
      title: 'New PB and Fueling Up!',
      calories: '2350 Calories Today',
      content: 'Just hit a new personal best on my deadlift! Celebrated with a hearty chicken stir-fry. Macro Match has really helped me understand how to fuel my body for performance. Highly recommend tracking! 💪',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&h=200&fit=crop',
      likes: 92,
      comments: 28,
      isLiked: true
    },
    {
      id: 3,
      user: { name: 'Michael A', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face', timeAgo: '1 day ago' },
      title: 'Smoothie Bowl Power!',
      calories: '1800 Calories Today',
      content: 'Morning routine sorted with this protein-packed berry smoothie bowl! It\'s delicious and keeps me full until lunch. What are your go-to breakfast macros?',
      image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=500&h=200&fit=crop',
      likes: 45,
      comments: 9,
      isLiked: false
    },
    {
      id: 4,
      user: { name: 'George', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face', timeAgo: '1 day ago' },
      title: 'Post-Workout Refuel',
      calories: '2050 Calories Today',
      content: 'After a tough leg day, this high-carb, high-protein recovery meal is exactly what I needed. Feeling energized and ready for tomorrow! Don\'t forget to refuel properly!',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&h=200&fit=crop',
      likes: 71,
      comments: 15,
      isLiked: false
    }
  ]);

  const [newPost, setNewPost] = useState('');

  const trendingPosts = [
    { title: 'Top 5 Protein Sources for...', author: 'by Fitness', category: 'nutrition' },
    { title: 'My Journey: From Beginner...', author: 'by HealthyJoe', category: 'transformation' },
    { title: 'Quick & Easy Healthy...', author: 'by MealMaster', category: 'recipes' },
    { title: 'The Importance of...', author: 'by NutritionalBasics', category: 'education' }
  ];

  const challenges = [
    {
      id: 1,
      title: '7-Day Protein Power Up',
      participants: '1,250 participants',
      icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
      color: 'bg-blue-100'
    },
    {
      id: 2,
      title: '30-Day Hydration Challenge',
      participants: '890 participants',
      icon: <Droplets className="w-6 h-6 text-cyan-600" />,
      color: 'bg-cyan-100'
    }
  ];

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleNewPost = () => {
    if (newPost.trim()) {
      const post = {
        id: Date.now(),
        user: { name: 'You', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face', timeAgo: 'Just now' },
        title: 'New Update',
        calories: '0 Calories Today',
        content: newPost,
        image: null,
        likes: 0,
        comments: 0,
        isLiked: false
      };
      setPosts([post, ...posts]);
      setNewPost('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
  <div className="max-w-6xl mx-auto flex items-center justify-between p-5">
    <Link to="/calculator" className="text-xl font-bold text-gray-800">MacroMatch</Link>
    <nav className="flex items-center gap-6">
      <Link 
        to="/social" 
        className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
      >
        Social Feed
      </Link>
      <Link 
        to="/calculator" 
        className="text-gray-600 hover:text-gray-800 transition-colors"
      >
        Caloric Intake
      </Link>
      <a href="#" className="text-gray-600 hover:text-gray-800">Spotify Integration</a>
      <a href="#" className="text-gray-600 hover:text-gray-800">User Settings</a>
    </nav>
  </div>
</header>

      <div className="max-w-6xl mx-auto p-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Page Title */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">Social Feed</h1>
              <div className="flex items-center gap-3">
                <select className="text-sm border border-gray-300 rounded-lg px-3 py-2">
                  <option>Latest</option>
                  <option>Popular</option>
                  <option>Following</option>
                </select>
                <button 
                  onClick={handleNewPost}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700"
                >
                  + New Post
                </button>
              </div>
            </div>

            {/* New Post Input */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="flex items-start gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face" 
                  alt="Your avatar" 
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Share your caloric intake, thoughts, or workout progress..."
                    className="w-full border-0 resize-none focus:outline-none text-gray-700 placeholder-gray-400"
                    rows="3"
                  />
                  {newPost && (
                    <div className="flex justify-end mt-2">
                      <button 
                        onClick={handleNewPost}
                        className="text-blue-600 font-medium text-sm hover:text-blue-700"
                      >
                        Post
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                  {/* Post Header */}
                  <div className="p-4 pb-2">
                    <div className="flex items-center gap-3 mb-3">
                      <img 
                        src={post.user.avatar} 
                        alt={post.user.name} 
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-800">{post.user.name}</h3>
                        <p className="text-xs text-gray-500">{post.user.timeAgo}</p>
                      </div>
                    </div>
                    
                    <h2 className="text-lg font-semibold text-gray-800 mb-1">{post.title}</h2>
                    <p className="text-sm font-medium text-blue-600 mb-3">{post.calories}</p>
                  </div>

                  {/* Post Image */}
                  {post.image && (
                    <div className="px-4 pb-3">
                      <img 
                        src={post.image} 
                        alt="Post content" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="px-4 pb-4">
                    <p className="text-gray-700 text-sm leading-relaxed">{post.content}</p>
                  </div>

                  {/* Post Actions */}
                  <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 text-sm ${post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                      >
                        <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                        {post.likes}
                      </button>
                      <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-500">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments}
                      </button>
                    </div>
                    <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-500">
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Posts */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Trending Posts</h3>
              <div className="space-y-3">
                {trendingPosts.map((trend, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 leading-tight">{trend.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{trend.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Macro Challenges */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Macro Challenges</h3>
              <div className="space-y-4">
                {challenges.map((challenge) => (
                  <div key={challenge.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors">
                    <div className={`w-12 h-12 ${challenge.color} rounded-lg flex items-center justify-center mb-3`}>
                      {challenge.icon}
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">{challenge.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{challenge.participants}</p>
                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                      Join Challenge
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 py-6 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-5 flex justify-between items-center text-gray-500">
          <div className="flex gap-4">
            <a href="#" className="text-sm hover:text-gray-700">Product</a>
            <span>|</span>
            <a href="#" className="text-sm hover:text-gray-700">Legal</a>
          </div>
          <div className="flex gap-3">
            <a href="#" className="text-sm hover:text-gray-700">f</a>
            <a href="#" className="text-sm hover:text-gray-700">t</a>
            <a href="#" className="text-sm hover:text-gray-700">ig</a>
            <a href="#" className="text-sm hover:text-gray-700">in</a>
          </div>
        </div>
      </footer>


    </div>
  );
};

export default SocialFeed;