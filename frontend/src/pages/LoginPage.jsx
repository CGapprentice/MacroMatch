import '../login.css'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginWithEmail } from '../firebase'
import {auth, google} from '../firebase.js'
import {signInWithPopup} from 'firebase/auth'


function LoginPage() {
    const navigate = useNavigate();
    
    useState(() => {
        document.title = 'Login Page'
    }, [])

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Login with Firebase
            const userCredential = await loginWithEmail(email, password);
            const user = userCredential.user;
            
            // Get Firebase ID token
            const idToken = await user.getIdToken();
            
            // Send token to backend to sync with MongoDB
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idToken }),
            });

            const data = await response.json();

            if (response.ok) {
                // Save Firebase ID token and user data
                localStorage.setItem('firebase_token', idToken);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Redirect to calculator page
                navigate('/calculatorpage');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            
            // Handle Firebase errors
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
                setError('Invalid email or password');
            } else if (err.code === 'auth/user-not-found') {
                setError('No account found with this email');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Too many failed attempts. Please try again later.');
            } else {
                setError('Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }

    
    const handleGoogleClick = async () =>{
        setError('');
        setLoading(true);
        try{
            const result = await signInWithPopup(auth, google);
            const idToken = await result.user.getIdToken();

            const response = await fetch('http://localhost:5000/api/auth/login',{
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify({idToken})
            });
            const data = await response.json();
            if(data.user.created_at === data.user.updated_at){
                localStorage.setItem('firebase_token', idToken);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/routinepage')    
            }else{
                navigate('/signinpage')
            }
        }catch(error){
            setError("Google Sign-in failed. Please try again.");
        }

    }


    return (
        <div className="loginInfo">
            <div className="gradient"></div>
            <div className="loginContext">
                <h1>MacroMatch</h1>
                <h2>Welcome Back!</h2>
                
                {error && (
                    <div style={{
                        color: 'red',
                        backgroundColor: '#ffebee',
                        padding: '10px',
                        borderRadius: '5px',
                        marginBottom: '15px',
                        width: '30vw'
                    }}>
                        {error}
                    </div>
                )}
                
                <form className="loginText" onSubmit={submit}>
                    <label htmlFor="email">Email: </label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                    />
                    
                    <label htmlFor="password" className="password">
                        Password:
                        <a href="#forgot">Forgot Password?</a>
                    </label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                    />
                    
                    <br />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                
                <div className="after_or">
                    <p className="ORline">OR</p>
                    <div className="button-Google">
                        <button className="google" type="button" onClick={handleGoogleClick}>
                            <img src="/google-logo.png" className="googleLogo" alt="Google Logo" />
                            Google
                        </button>
                    </div>
                </div>
                
                <p>Don't have an account? <Link to="/signinpage">Sign up</Link></p>
            </div>
        </div>
    )
}

export default LoginPage
