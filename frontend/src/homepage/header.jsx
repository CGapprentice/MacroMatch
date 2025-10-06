import styles from './header.module.css'
import { Link, useNavigate } from 'react-router-dom'
/* ADD FUNCTION TO MAKE TEXT BOLD WHEN GOING THROUGH
THE PAGES */

function HomePageHeader() {
    return(
        <header>
                <div className={styles.header}>
                    <h1>MacroMatch</h1>
                    <div className={styles.links}>
                        <p>Social Feed</p> {/* Change to link when have social feed page*/}
                        <Link to='/calculatorpage'>Caloric Intake</Link>

                        <Link to='/spotifyintegration'><p>Spotify Integration </p></Link>
                        <Link to='/usersettingspage'><p>User Settings</p></Link>

                    </div>
                    <div className={styles.line}></div>
                </div>
        </header>
    )
}
export default HomePageHeader



