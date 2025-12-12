import styles from './ForgotPassword.module.css'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { getAuth, sendPasswordResetEmail } from 'firebase/auth'

function ForgotPassword(){
    useState(()=>{
        document.title = 'Forgot Password'
    },[])
    const[email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleForgotPassword = () =>{
        const auth = getAuth();
        sendPasswordResetEmail(auth, email).then(()=>{
            console.log("Email sent to User to change password");
            alert("Sent an email to change password");
            navigate('/login')
        })
        .catch((error) =>{
            console.log('Something went wrong with sending email to change password')
        })
    }

    return(
        <div className={styles.overall}>
            <div className={styles.forgotPasswordBox}>
                <img src="/forgotPass.png"/>
                <h1>Forgot your password?</h1>
                <p>Enter your email so that we can send you an email to change your password</p>
                <div className={styles.emailForm}>
                    <label htmlFor='email'>Email: </label>
                    <input
                        type="text"
                        id="email"
                        value={email}
                        placeholder='Enter your email'
                        onChange={(e)=>setEmail(e.target.value)}
                    />
                </div>
                
                <button onClick={handleForgotPassword}>Send Email</button>
                <div className={styles.returnToLogin}>
                    <Link to='/login' ><p>return to login</p></Link>
                </div>
            </div>
            
        
        </div>
    )
}

export default ForgotPassword