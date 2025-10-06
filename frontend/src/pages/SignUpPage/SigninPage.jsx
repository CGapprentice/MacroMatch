import styles from './SignupPage.module.css'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { auth, google } from "../../firebase.js";
import {signInWithPopup , getAdditionalUserInfo } from "firebase/auth";  

import { createUserWithEmailAndPassword , updateProfile } from "firebase/auth"

function SignInPage(){
    useState(()=> {
        document.title = 'Sign Up Page'
    },[])


    const [errors, setErrors] = useState({});
    const[message, setMessage] = useState("");
  
    

    
    const navigate = useNavigate();



    const [userForm, setUserForm] = useState({
        fname: "",
        lname: "",
        email: "",
        password: ""
    });

    function validateUserForm(){
        const errors = {};
        if(!userForm.fname.trim()){
            errors.fname = "First name is required";
        }
        if(!userForm.lname.trim()){
            errors.lname = "Last name is required";
        }
        if(!userForm.email.trim()){
            errors.email = "Email is required";
        }
        if(!userForm.password.trim()){
            errors.password = "Password is required";
        }
        else if(userForm.password.length < 8){
            errors.password = "Password must be at least 8 characters";
        }
        return errors;
    }

    const handleFormChange = (e) => {
        const{name, value} = e.target;
        setUserForm(prev => ({...prev, [name]: value}))
    };


    async function handleClickSubmit(e){
        e.preventDefault();

        const validateErrors = validateUserForm();

        if(Object.keys(validateErrors).length > 0){
            setErrors(validateErrors);
            if(validateErrors.fname) setMessage(validateErrors.fname);
            else if(validateErrors.lname) setMessage(validateErrors.lname);
            else if(validateErrors.email) setMessage(validateErrors.email);
            else if(validateErrors.password) setMessage(validateErrors.password);
            /* FIX TO SHOW WHAT USERS NEED TO FILL OUT */
            return;
        }


        setErrors({});
        setMessage("");

        try{
            let userCredential = await createUserWithEmailAndPassword( auth, userForm.email, userForm.password);

            
            const idToken = await userCredential.user.getIdToken();
            localStorage.setItem("firebasetoken", idToken);

            /* 
            Adding User's Full Name into the system. Could change it later to create a page to add 
            a full profile for the user
            */
            const fullName = `${userForm.fname} ${userForm.lname}`;
            await updateProfile(userCredential.user, {displayName: fullName,
            }).then(() => {
                console.log("User added successfully add with full name", fullName);
            }).catch((error) =>{
                console.error("Error updating user with their full name", error);
            });


            /* For testing purposes, I'll navigate it to user profile 
            once that is done return it to calculator page
            navigate('/calculatorpage');
            */
            /* This is only to test user profile */
            navigate('/usersettingspage')
            console.log("User created successfully")
            
        }
        catch(error){
            console.error("Error Creating Uesr: ", error);

            if(error.code === "auth/email-already-in-use"){
                setMessage("Email already exists.");
            }
            else{
                setMessage("Authentication failed. Please try again.");
            }
        }
    
    }

  
    const [user, setUser] = useState(null);
    
    const handleGoogleAuthClick = async () =>{
        try{
            const result = await signInWithPopup(auth, google);
            const idToken = await result.user.getIdToken();
            localStorage.setItem("firebasetoken", idToken);



            const newUser = getAdditionalUserInfo(result).isNewUser;
            if(newUser){
                console.log("New User can sign up");
            }else{
                console.log("User exists already");
                setMessage("User already exists. Please log in instead.")
                return;
            }

            setUser(result.user);
            /*For testing purposes, I'll navigate it to user profile
            once that is done return to calculator page
            navigate('/calculatorpage');
            */
            /* This is only to test user profile */
            navigate('/usersettingspage');
            console.log("Google sign-in successful");
        }
        catch(error){
            console.error("Error during Google sign-in: ", error);
            setMessage("Google sign-in failed. Please try again.");

            
        }
    }


    return(
        <>
        <div className={styles.signInbackground}>
            <div className={styles.signContainer}>
                <h1>Sign up</h1>
                <div className={styles.flName}>
                    <form>

                        <label for="fname">First Name </label>
                        <input 
                            type="text" 
                            id="fname" 
                            name="fname"
                            value={userForm.fname}
                            onChange={handleFormChange}
                            placeholder='Input first name' required 
                        />

                        <label for="lname">Last Name </label>
                        <input 
                            type="text" 
                            id="lname" 
                            name="lname" 
                            value={userForm.lname}
                            onChange={handleFormChange}
                            placeholder='Input last name' required 
                        />


                        <label for="email">Email </label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            value={userForm.email}
                            onChange={handleFormChange}
                            placeholder='example.email@gmail.com' required 
                        />


                        <label for="password" className="password">Password</label> 
                        
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            value={userForm.password}
                            onChange={handleFormChange}
                            placeholder='Enter at least 8+ characters' 
                            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                            minlength="8" required 
                        />

                    </form>
                </div>
                <div className={styles.afterform}>
                    <button className={styles.signUp} onClick={handleClickSubmit}>Sign Up</button> 
                    <p>{message}</p>
                    <p>Already have an account? <Link to="/loginpage">log in</Link></p>
                    <p className='Or'>OR</p>
                    <button className={styles.googlesignin} onClick={handleGoogleAuthClick}> <img src="/google_logo.png" className={styles.googleLogo} alt="Google Logo"/></button>

                </div>
    

            </div>
        </div>
        </>
    )
}

export default SignInPage