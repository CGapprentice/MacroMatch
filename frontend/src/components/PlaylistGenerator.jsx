// src/components/PlaylistGenerator.jsx
import React, { useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { useSpotify } from './SpotifyIntegration';
import { Music } from 'lucide-react';

// --- Helper Functions (You should implement these or import them) ---
// Mock function to simulate generating a playlist from the calculator results
const generateInitialPlaylist = (calculatorData) => {
    console.log("Auto-generating playlist based on:", calculatorData);
    // Replace this with real generation logic based on TDEE, macros, goals, etc.
    return ['Song 1 (Workout Focus)', 'Song 2 (Cardio Mix)', 'Song 3 (Cool Down)'];
};

// Mock function to simulate generating a playlist from scratch/user input
const generateFromScratch = (criteria) => {
    console.log("Generating playlist from scratch with criteria:", criteria);
    // Replace this with real generation logic based on user's manual input
    return ['Custom Song A', 'Custom Song B', 'Custom Song C'];
};
// --------------------------------------------------------------------

const PlaylistGenerator = () => {
    // Retrieve user and spotify data
    const { userData } = useUser(); 
    const { isConnected, connectSpotify, generatePlaylist } = useSpotify(); // Destructure Spotify functions
    
    // Check for the existence of the calculator results
    const hasCalculatorData = userData && userData.calculatorData;

    // State to manage the current playlist data
    // Initialize with a mock or user's stored data if available
    const [currentPlaylist, setCurrentPlaylist] = useState(
        generateInitialPlaylist(userData?.calculatorData) || null
    ); 
    const [playlistStatus, setPlaylistStatus] = useState(null); 
    const [isCustom, setIsCustom] = useState(false); 

    // Mock workout data for the playlist context
    const workout = {
        type: userData?.calculatorData?.workoutPlan?.[0]?.name || 'Light Cardio',
        duration: userData?.calculatorData?.workoutPlan?.[0]?.duration || '30 min',
        context: 'Daily maintenance workout'
    };


    const handleGenerateSpotifyPlaylist = async () => {
        if (!isConnected || !hasCalculatorData) return;
        setPlaylistStatus('Generating...');
        try {
            // NOTE: The 'generatePlaylist' call here would need the actual workout context
            // and the user's Spotify profile, which is handled inside useSpotify.
            // For now, we mock the success.
            const result = await generatePlaylist(workout.type); // Pass the workout type to the hook
            
            // In a real app, this would return the actual playlist URL/ID
            console.log("Spotify Playlist Created:", result); 
            setPlaylistStatus('Playlist successfully created on Spotify! 🎧');
            
            // You might want to update currentPlaylist with the new Spotify tracks
            // For now, we keep the existing display mock.

        } catch (error) {
            console.error("Spotify Playlist Error:", error);
            setPlaylistStatus('Failed to create playlist. Check console for details.');
        }
    };

    const handleEraseAndStartNew = () => {
        setCurrentPlaylist(null);
        setPlaylistStatus(null);
        setIsCustom(false);
    }
    
    // Placeholder for custom generation trigger
    const handleGenerateNew = (criteria) => {
        setIsCustom(true);
        const newTracks = generateFromScratch(criteria);
        setCurrentPlaylist(newTracks);
        setPlaylistStatus('Custom playlist generated locally.');
    }


    return (
        <main className="app-container calculator-content">
            <div className="results-grid">
                <div className="playlist-card card">
                    <h2 className="card-title">Your Workout Playlist</h2>
                    <p className="card-subtitle">Music recommendations based on your **{workout.type}** workout plan.</p>

                    {/* Spotify Connection Status/Button */}
                    <div className="spotify-connection-status" style={{marginBottom: '20px'}}>
                        <div className="legend-item">
                            <span className="legend-color" style={{backgroundColor: isConnected ? 'var(--color-success)' : 'var(--color-danger)'}}></span>
                            **Spotify Status:** {isConnected ? 'Connected' : 'Not Connected'}
                        </div>
                    </div>

                    {!isConnected && (
                        <div className="playlist-button">
                             <button 
                                onClick={connectSpotify}
                                className="playlist-button-style"
                                style={{backgroundColor: '#1DB954'}} // Spotify Green
                            >
                                Connect with Spotify
                            </button>
                        </div>
                    )}


                    {/* Playlist Display */}
                    <div className="table-container">
                        <table className="data-table">
                            <thead className="table-header">
                                <tr>
                                    <th className="table-cell"><Music size={14} /> Track Name</th>
                                    <th className="table-cell">Artist</th>
                                    <th className="table-cell">Genre</th>
                                    <th className="table-cell">Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentPlaylist && currentPlaylist.length > 0 ? (
                                    currentPlaylist.map((track, index) => (
                                        <tr key={index} className="table-row">
                                            <td className="table-cell">{track}</td>
                                            <td className="table-cell">Mock Artist {index + 1}</td>
                                            <td className="table-cell">{['Pop', 'Rock', 'Electronic', 'Hip-Hop'][index % 4]}</td>
                                            <td className="table-cell">{Math.floor(Math.random() * 5) + 2} min</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="table-cell table-empty">
                                            {hasCalculatorData 
                                                ? "Run the calculator to generate an initial playlist plan!"
                                                : "Please complete the Macro Calculator first."
                                            }
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Action Buttons */}
                    <div className="playlist-button">
                        {isConnected && currentPlaylist && (
                            <button 
                                onClick={handleGenerateSpotifyPlaylist}
                                disabled={playlistStatus === 'Generating...'}
                                className="playlist-button-style"
                            >
                                {playlistStatus === 'Generating...' ? 'Adding to Spotify...' : 'Add Playlist to Spotify Now'}
                            </button>
                        )}
                        {playlistStatus && <p className="playlist-status" style={{color: playlistStatus.includes('Failed') ? 'var(--color-danger)' : 'var(--color-success)'}}>{playlistStatus}</p>}

                        {/* Options to erase/start new (from your previous component logic) */}
                        {currentPlaylist ? (
                            <div className="playlist-options" style={{marginTop: '15px'}}>
                                <button onClick={handleEraseAndStartNew} className='playlist-button-style' style={{backgroundColor: '#666', fontSize: '0.9rem'}}>
                                    Erase Current & Start New Playlist
                                </button>
                            </div>
                        ) : (
                            <div className="playlist-options" style={{marginTop: '15px'}}>
                                <button 
                                    onClick={() => {
                                        setIsCustom(false); 
                                        setCurrentPlaylist(generateInitialPlaylist(userData.calculatorData));
                                        setPlaylistStatus('Initial plan re-generated.');
                                    }}
                                    disabled={!hasCalculatorData}
                                    className='playlist-button-style'
                                    style={{backgroundColor: '#9c27b0', fontSize: '0.9rem'}}
                                >
                                    Re-generate Initial Plan
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default PlaylistGenerator;
