import '../sign.css'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import { auth, google } from "../firebase.js";
import {signInWithPopup, signOut } from "firebase/auth";  

function SignInPage(){
    useState(()=> {
        document.title = 'Sign Up Page'
    },[])

  

    const [user, setUser] = useState(null);

    const handleAuthClick = () =>{
        if(user){
            signOut(auth).catch(console.error);
            setUser(null);
        }else{
            signInWithPopup(auth, google).then((result)=>setUser(result.user)).catch(console.error);
        }
    }


    return(
        <>
        <div className="signIn-background">
            <div className='signContainer'>
                <h1>Sign up</h1>
                <div className="flName">
                    <form>
                        <label for="fname">First Name </label>
                        <input type="text" id="fname" name="fname" placeholder='Input first name' required />
                        <label for="lname">Last Name </label>
                        <input type="text" id="lname" name="lname" placeholder='Input last name'required />
                        <label for="email">Email </label>
                        <input type="email" id="email" name="email" placeholder='example.email@gmail.com' required />
                        <label for="password" className="password">Password</label> 
                        <input type="password" id="password" name="password" placeholder='Enter at least 8+ characters' minlength="8" required />
                    </form>
                </div>
                <div className="afterform">
                    <button className="signUp">Sign Up</button> 
                    <p>Already have an account? <Link to="/loginpage">log in</Link></p>
                    <p className='Or'>OR</p>
                    <button className="google-signin" onClick={handleAuthClick}> <img src="/google_logo.png" className="googleLogo" alt="Google Logo"/></button>

                </div>
    

            </div>
        </div>
        </>
    )
}

export default SignInPage