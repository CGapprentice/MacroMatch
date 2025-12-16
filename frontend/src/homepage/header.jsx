import styles from './header.module.css'
import { Link } from 'react-router-dom'
import { getAuth, signOut } from 'firebase/auth'
import{useNavigate} from 'react-router-dom'

import { useUser } from '../components/UserContext.jsx'

function HomePageHeader() {
    const{resetClickGooglePopUp} = useUser()
    const auth = getAuth();
    const navigate = useNavigate();
    const handleLogout = () =>{
        signOut(auth).then(()=>{
            localStorage.removeItem('firebase_token');
            localStorage.removeItem('user');
            resetClickGooglePopUp();
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
                    
                    <div className={styles.logoutButton}>
                        <button onClick={handleLogout}> Logout </button>
                    </div>
                    <div className={styles.line}></div>
                </div>
        </header>
    )
}
export default HomePageHeader