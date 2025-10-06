// src/components/PlaylistGenerator.jsx
import React, { useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { useSpotify } from './SpotifyIntegration';

const PlaylistGenerator = () => {
  console.log('PlaylistGenerator loaded');

  const { user, loadUserData } = useUser();
  const { isConnected: spotifyConnected, generatePlaylist, connectSpotify } = useSpotify();

  const [formData, setFormData] = useState({
    workoutType: 'mixed',
    duration: 30,
    fitnessLevel: 'intermediate',
    tempo: 120,
    genres: ['pop', 'rock'],
  });

  const [recentPlaylist, setRecentPlaylist] = useState(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);

  // Load recent playlist from user data
  useEffect(() => {
    const loadPlaylist = async () => {
      const savedData = await loadUserData();
      if (savedData && savedData.lastPlaylist) {
        setRecentPlaylist(savedData.lastPlaylist);
      }
    };
    if (user) {
      loadPlaylist();
    }
  }, [user, loadUserData]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle genre selection (multi-select)
  const toggleGenre = (genre) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  // Generate or customize playlist
  const handleGenerate = async () => {
    if (!spotifyConnected) {
      connectSpotify();
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const playlist = await generatePlaylist(
        formData.workoutType,
        formData.duration,
        formData.fitnessLevel
      );
      setRecentPlaylist(playlist);
      // Save to user data
      await saveUserData({ lastPlaylist: playlist });
    } catch (error) {
      setGenerationError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Customize existing playlist (example: add a track)
  const handleCustomize = async (action, trackId) => {
    if (!recentPlaylist) return;

    // Example logic for customization (expand as needed)
    try {
      // API call to add/remove track (using Spotify API)
      console.log(`Customizing playlist: ${action} track ${trackId}`);
      // Implement actual API call here
    } catch (error) {
      setGenerationError(error.message);
    }
  };

  return (
    <div className="playlist-generator-container">
      <h2 className="playlist-title">Generate Your Workout Playlist</h2>
      <p className="playlist-subtitle">Select your workout preferences to create a custom playlist that matches your tempo and mood.</p>

      {/* Spotify Connection */}
      <div className="spotify-connection">
        <button
          onClick={connectSpotify}
          className="spotify-button"
          disabled={spotifyConnected}
        >
          {spotifyConnected ? 'Spotify Connected' : 'Connect Spotify'}
        </button>
        {spotifyConnected && <p className="spotify-status">✓ Connected</p>}
      </div>

      {/* Form for Customization / Build from Scratch */}
      <div className="playlist-form">
        <label className="form-label">Workout Type</label>
        <select
          name="workoutType"
          value={formData.workoutType}
          onChange={handleInputChange}
          className="form-input"
        >
          <option value="cardio">Cardio Focus</option>
          <option value="strength">Strength Focus</option>
          <option value="mixed">Mixed Training</option>
          <option value="flexibility">Flexibility Focus</option>
        </select>

        <label className="form-label">Duration (minutes)</label>
        <input
          type="number"
          name="duration"
          value={formData.duration}
          onChange={handleInputChange}
          className="form-input"
        />

        <label className="form-label">Fitness Level</label>
        <select
          name="fitnessLevel"
          value={formData.fitnessLevel}
          onChange={handleInputChange}
          className="form-input"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <label className="form-label">Target Tempo (BPM)</label>
        <input
          type="range"
          name="tempo"
          min="60"
          max="180"
          value={formData.tempo}
          onChange={handleInputChange}
          className="form-slider"
        />
        <span className="slider-value">{formData.tempo} BPM</span>

        <label className="form-label">Preferred Genres</label>
        <div className="genre-buttons">
          {['pop', 'rock', 'electronic', 'hip-hop', 'classical', 'jazz'].map(genre => (
            <button
              key={genre}
              onClick={() => toggleGenre(genre)}
              className={`genre-button ${formData.genres.includes(genre) ? 'active' : ''}`}
            >
              {genre.charAt(0).toUpperCase() + genre.slice(1)}
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !spotifyConnected}
          className="generate-button"
        >
          {isGenerating ? 'Generating...' : 'Generate Playlist'}
        </button>
        {generationError && <p className="error-message">{generationError}</p>}
      </div>

      {/* Recently Generated Playlists */}
      <div className="recent-playlists">
        <h3 className="recent-title">Recently Generated Playlists</h3>
        {recentPlaylist ? (
          <div className="playlist-card">
            <h4 className="playlist-name">{recentPlaylist.name}</h4>
            <p className="playlist-description">{recentPlaylist.description}</p>
            <a href={recentPlaylist.external_urls.spotify} target="_blank" rel="noopener noreferrer" className="playlist-link">Open in Spotify</a>
            <button onClick={() => setIsCustomizing(!isCustomizing)} className="customize-button">
              {isCustomizing ? 'Close Customization' : 'Customize'}
            </button>
            {isCustomizing && (
              <div className="customization-section">
                <button onClick={() => handleCustomize('add', 'track-id')} className="customize-action">Add Track</button>
                <button onClick={() => handleCustomize('remove', 'track-id')} className="customize-action">Remove Track</button>
                {/* Expand with track list and input for new tracks */}
              </div>
            )}
          </div>
        ) : (
          <p className="no-playlists">No recent playlists. Generate one above!</p>
        )}
      </div>
    </div>
  );
};

export default PlaylistGenerator;