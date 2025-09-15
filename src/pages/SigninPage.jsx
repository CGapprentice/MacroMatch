import '../sign.css'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

function SignInPage(){
    return(
        <>
        <div className="signIn-background">
            <div className='signContainer'>
                <h1>Sign up</h1>
                <div className="flName">
                    <form>
                        <label for="fname">First Name </label>
                        <input type="text" id="fname" placeholder='Input first name' required />
                        <label for="lname">Last Name </label>
                        <input type="text" id="lname" placeholder='Input last name'required />
                        <label for="email">Email </label>
                        <input type="email" id="email" placeholder='example.email@gmail.com' required />
                        <label for="password" className="password">Password</label> 
                        <input type="password" id="password" placeholder='Enter at least 8+ characters' required />
                    </form>
                </div>
                <div className="afterform">
                    <button className="signUp">Sign Up</button> 
                    <p>Already have an account? <Link to="/loginpage">log in</Link></p>
                    <p>OR</p>
                    <button className="google-signin"> <img src="/google_logo.png" className="googleLogo" alt="Google Logo"/></button>

                </div>
    

            </div>
        </div>
        </>
    )
}

export default SignInPage