import '../sign.css'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerWithEmail } from '../firebase'

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
            
            // Register with Firebase
            const userCredential = await registerWithEmail(formData.email, formData.password);
            const user = userCredential.user;
            
            // Get Firebase ID token
            const idToken = await user.getIdToken();
            
            // Send to backend to create user in MongoDB
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
                // Save Firebase token and user data
                localStorage.setItem('firebase_token', idToken);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Redirect to calculator page
                navigate('/calculatorpage');
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error:', err);
            
            // Handle Firebase errors
            if (err.code === 'auth/email-already-in-use') {
                setError('Email already in use');
            } else if (err.code === 'auth/invalid-email') {
                setError('Invalid email address');
            } else if (err.code === 'auth/weak-password') {
                setError('Password is too weak');
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

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
                            
                            <p>Already have an account? <Link to="/loginpage">log in</Link></p>
                            
                            <p className='Or'>OR</p>
                            
                            <button className="google-signin" type="button">
                                <img src="/google_logo.png" className="googleLogo" alt="Google Logo" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default SignInPage
