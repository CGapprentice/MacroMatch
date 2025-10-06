import Header from '../../homepage/header.jsx'
import styles from './SpotifyIntegration.module.css'
import {useEffect } from 'react'

function SpotifyIntegration(){
    useEffect(()=>{
        document.title = "Spotify Integration"
    }, [])
    return(
        <>
            <header> 
                <Header/>
            </header>
            <main>
                <section className={styles.spotifyConnection}>
                    <div className={styles.spotifyContainer}>
                        <div className={styles.spotify}>
                            <img src='Spotifylogo.png' alt = "Spotify Logo" className={styles.spotifyLogo}/>
                            <div className={styles.spotifyText}>
                                <h3>Spotify Connected</h3>
                                <p>Your Spotify account is linked. Generate personalized workout playlists.</p>
                            </div>
                        </div>
                        <div className={styles.manageConnectionButton}>
                            <button className={styles.managebutton}> Mannage connection </button>
                        </div>

                    </div>
                </section>
                <section className={styles.generatePlaylist}>
                    <div className={styles.playlistContainer}>
                        <div className={styles.playlistHeader}>
                            <h1>Generate Your Workout Playlist</h1>
                            <p>Select your workout preferences to create a custom playlist that matches your tempo and mood.</p>
                        </div>
                        <div className={styles.workoutType}>
                            <label for="workoutPreference"><b>Workout Type</b></label>
                            <select id="workoutPreferences">
                                <option value="cardio">Cardio</option>
                                <option value="strength">Strength training</option>
                                <option value="yoga">Yoga</option>
                                <option value="cycling">Cycling</option>
                                <option value="dancing">Dancing</option>
                                <option value="running">Running</option>
                                <option value="walking">Walking</option>
                                <option value="hiking">Hiking</option>
                            </select>
                        </div>

                        <div className={styles.tempo}>
                            <label for="tempoPreference"><b>Tempo Preference (BPM): </b></label>{/* ADD FUNCTION TO SHOW WHICH BPM SELECTED */}
                            <input type="range" id="tempoPreference" min="60" max = "180" className="slider"/>
                            <div className={styles.rangeLabels}>
                                <span>60 BPM (Slow)</span>
                                <span>180 BPM (Fast)</span>
                            </div>
                            
                        </div>
                        <div className={styles.preferredGenres}>
                            <h4>Prefered Genres</h4>
                            <div className={styles.genresLabels}>
                                <button>Pop</button>
                                <button>Rock</button>
                                <button>Electronic</button>
                                <button>Hip Hop</button>
                                <button>Classical</button>
                                <button>Jazz</button>
                                <button>Latin</button>
                                <button>R&B</button>
                            </div>
                            <div className={styles.generateButton}>
                                <button className={styles.generatePlaylistButton}>Generate Playlist</button>
                            </div>
                            
                            
                        </div>

                    </div>
                </section>
            </main>
        </>
    )
}
export default SpotifyIntegration