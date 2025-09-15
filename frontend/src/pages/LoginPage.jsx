
import '../login.css'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

function LoginPage() {
    const[email, setEmail] = useState('');
    const[password, setPassword] = useState('');

    const submit=(e)=>{
        e.preventDefault();
        setEmail(email);
        setPassword(password);
        console.log("Email:", email);
        console.log("Password:" ,password);
    }

    return(
        <div className="loginInfo">
            {/*<img src="/MMlogin.png" className="loginImage" alt="MacroMatch background"/>*/}
            <div className="gradient">
            </div>
            <div className="loginContext">
                <h1>MacroMatch</h1>
                <h2>Welcome Back!</h2>
                <form className="loginText">
                    <label for="email">Email: </label>
                    <input type="email" id="email" required />
                    <label for="password" className="password">Password:<a href="url">Forgot Password?</a> </label> 
                    <input type="password" id="password" required />
                    <br></br>
                    <button type="submit" onClick={submit}>Login</button>
                </form>
                <div className="after_or">
                    <p className="ORline">OR</p>
                    <div className="button-Google">
                        <button className="google"> <img src="/google-logo.png" className="googleLogo" alt="Google Logo"/>Google</button>
                    </div>
                </div>
                    
                   
                    <p> Don't have an account? <Link to="/signinpage">Sign up</Link></p>
        
            </div>
        </div>

    )
}

export default LoginPage;