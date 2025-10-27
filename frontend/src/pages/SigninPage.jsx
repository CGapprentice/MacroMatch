import '../sign.css'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginWithEmail } from '../firebase'
import {auth,google} from '../firebase.js'
import {signInWithPopup} from 'firebase/auth'

function SignInPage() {
    const navigate = useNavigate();
    
    useState(() => {
        document.title = 'Sign Up Page'
    }, [])

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validate password length
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            const name = `${formData.firstName} ${formData.lastName}`.trim();

            // Send to backend to create user in Firebase + MongoDB
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    name: name
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Now sign in with Firebase to get ID token
                const userCredential = await loginWithEmail(formData.email, formData.password);
                const idToken = await userCredential.user.getIdToken();

                // Save Firebase token and user data (with token included)
                const userData = {
                    ...data.user,
                    token: idToken
                };
                localStorage.setItem('firebase_token', idToken);
                localStorage.setItem('macromatch_user', JSON.stringify(userData));

                // Redirect to calculator page
                navigate('/calculatorpage');
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleGoogleClick = async () =>{
        setError('');
        setLoading(true);
        try{
            const result = await signInWithPopup(auth, google);
            const idToken = await result.user.getIdToken();
            
            const response = await fetch('http://localhost:5000/api/auth/login',{
                method:'POST',
                headers:{
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify({idToken})
            });
            const data = await response.json();

            if (response.ok) {
                // Save user data and token
                const userData = {
                    ...data.user,
                    token: idToken
                };
                localStorage.setItem('firebase_token', idToken);
                localStorage.setItem('macromatch_user', JSON.stringify(userData));

                // Navigate to calculator page on successful login
                navigate('/calculatorpage');
            } else {
                setError(data.error || 'Google sign-in failed');
            }
        }catch(error){
            console.error("Error with signing up with google: ", error);
            setError("Google sign-in failed. Please try again");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="signIn-background">
            <div className='signContainer'>
                <h1>Sign up</h1>
                
                {error && (
                    <div style={{
                        color: 'red',
                        backgroundColor: '#ffebee',
                        padding: '10px',
                        borderRadius: '5px',
                        marginBottom: '15px',
                        width: '100%',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}
                
                <div className="flName">
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="firstName">First Name </label>
                        <input 
                            type="text" 
                            id="firstName" 
                            name="firstName" 
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder='Input first name' 
                            required 
                        />
                        
                        <label htmlFor="lastName">Last Name </label>
                        <input 
                            type="text" 
                            id="lastName" 
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder='Input last name'
                            required 
                        />
                        
                        <label htmlFor="email">Email </label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder='example.email@gmail.com' 
                            required 
                        />
                        
                        <label htmlFor="password" className="password">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder='Enter at least 6+ characters' 
                            minLength="6" 
                            required 
                        />
                        
                        <div className="afterform">
                            <button className="signUp" type="submit" disabled={loading}>
                                {loading ? 'Signing up...' : 'Sign Up'}
                            </button>
                            
                            <p>Already have an account? <Link to="/login">log in</Link></p>
                            
                            <p className='Or'>OR</p>
                            <div className="googleButton">
                                <button className="google-signin" type="button" onClick={handleGoogleClick}>
                                    <img src="/google_logo.png" className="googleLogo" alt="Google Logo" />
                                </button>
                            </div>
                            
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default SignInPage
