
import styles from './LoginPage.module.css'
import React, { useState, useEffect} from 'react'
import { Link } from 'react-router-dom'

function LoginPage() {

    useState(()=> {
        document.title = 'Login Page'
    },[])

    const[email, setEmail] = useState('');
    const[password, setPassword] = useState('');

    const submit=()=>{
       
        setEmail(email);
        setPassword(password);
        console.log("Email:", email);
        console.log("Password:" ,password);
    }

    return(
        <div className={styles.loginInfo}>
            {/*<img src="/MMlogin.png" className="loginImage" alt="MacroMatch background"/>*/}
            <div className={styles.gradient}>
            </div>
            <div className={styles.loginContext}>
                <h1>MacroMatch</h1>
                <h2>Welcome Back!</h2>
                <form className={styles.loginText}>
                    <label for="email">Email: </label>
                    <input type="email" id="email" name="email" required />
                    <label for="password" className="password">Password:<a href="url">Forgot Password?</a> </label> 
                    <input type="password" id="password" name="password" required />
                    <br></br>
                    <button type="submit" onClick={submit}>Login</button>
                </form>
                <div className={styles.after_or}>
                    <p className={styles.ORline}>OR</p>
                    <div className={styles.buttonGoogle}>
                        <button className={styles.google}> <img src="/google-logo.png" className={styles.googleLogo} alt="Google Logo"/>Google</button>
                    </div>
                </div>
                    
                   
                    <p> Don't have an account? <Link to="/signinpage">Sign up</Link></p>
        
            </div>
        </div>

    )
}

export default LoginPage
