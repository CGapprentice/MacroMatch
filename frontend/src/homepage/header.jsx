import styles from './header.module.css'
import { Link } from 'react-router-dom'
import { getAuth, signOut } from 'firebase/auth'
import{useNavigate} from 'react-router-dom'

function HomePageHeader() {
    const auth = getAuth();
    const navigate = useNavigate();
    const handleLogout = () =>{
        signOut(auth).then(()=>{
            localStorage.removeItem('firebase_token');
            localStorage.removeItem('user');
            console.log("User signed out")
            navigate('/')
        }).catch((error)=>{
            console.error("Error signing out user: ", error)
        });
    }

    return(
        <header>
                <div className={styles.header}>
                    <h1>MacroMatch</h1>
                    <div className={styles.links}>
                        <p>Social Feed</p> {/* Change to link when have social feed page*/}
                        <Link to='/calculatorpage'>Caloric Intake</Link>

                        <Link to='/spotifyintegration'><p>Spotify Integration </p></Link>
                        <Link to='/routinepage'><p>Your Routine</p></Link>
                        <Link to='/usersettingspage'><p>User Settings</p></Link>
                        

                    </div>
                    <div className={styles.logoutButton}>
                        <button onClick={handleLogout}> Logout </button>
                    </div>
                    <div className={styles.line}></div>
                </div>
        </header>
    )
}
export default HomePageHeader