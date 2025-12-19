
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import HomePageHeader from '../../homepage/header.jsx'
import styles from './UserSettings.module.css'

import { useUser } from '../../components/UserContext.jsx'
import { getCurrentUserToken, API_BASE_URL } from '../../firebase.js'; // Import API_BASE_URL

import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import ToggleSwitch from './toggleSwitch/toggleSwitch.jsx';
import { set } from 'react-hook-form';


function UserSettingsPage(){
    //const API_BASE_URL = 'http://localhost:5000'
    const {clickGooglePopUp} = useUser()
    useEffect(()=>{
        document.title = "User Settings"
        //loadUserData();
    }, [])

    
    const navigate = useNavigate();

    // Token management
    const [token, setToken] = useState(null);
    const [isTokenLoading, setIsTokenLoading] = useState(true);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const userToken = await getCurrentUserToken();
                if (!userToken) {
                    navigate('/login');
                    return;
                }
                setToken(userToken);
            } catch (error) {
                console.error("Failed to fetch Firebase token:", error);
                navigate('/login');
            } finally {
                setIsTokenLoading(false);
            }
        };
        fetchToken();
    }, [navigate]);


    const[uploadPicture, setUploadPicture] = useState(null);
    
    const uploadFile = (e) =>{
        e.preventDefault();
        console.log("Picture uploaded: ", uploadPicture);
    }

    // Temporary variables until authentication is properly implemented
    const[loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const[userFormMessage, setUserFormMessage] = useState("");
    const [userForm, setUserForm] = useState({
        firstName: '',
        lastName: '',
        email: ''
    });
    
    const[currentPassword, setCurrentPassword] = useState('');
    const[changePassword, setChangePassword] = useState('');
    const[confirmChangePassword, setConfirmChangePassword] = useState('');
    const[passwordErrorMessage, setPasswordErrorMessage] = useState('');
    const[passwordMessage, setPasswordMessage] = useState('');

    useEffect(()=>{
        if (!token) return;
        const postPicture = async() =>{
            try{
                const response = await fetch(`${API_BASE_URL}/api/v1/pictures/`,{
                    method: 'GET',
                    headers:{
                        'Content-Type' : 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                });
                if(response.status === 401){
                    // Navigation handled by token useEffect
                    return
                }
                const data = await response.json();
                if(response.ok){
                    setUploadPicture(data.pictures.uploadPicture);
                }
                if(!response.ok){
                    setMessage("Error", response.error || response.detail);
                }
            }catch(error){
                console.log("Error getting user profile picture: ", error);
                setMessage("Error with getting user profile picture");
            }
        }; postPicture();
    },[token]);

    const changePicture = async(e) =>{
        e.preventDefault();
        if(!uploadPicture) return;
        if(!token) return;

        const formData = new FormData();
        formData.append('uploadPicture', uploadPicture);


        try{
            const response = await fetch(`${API_BASE_URL}/api/v1/pictures/`,{
                method: 'POST',
                headers:{
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });
            if(response.status === 401){
                // Navigation handled by token useEffect
                return;
            }
            const data = await response.json()
            if(response.ok){
                setUploadPicture(data.pictures.uploadPicture);
            }
            if(!response.ok){
                setMessage("Error: ", data.detail);
            }
        }catch(error){
            console.log("Error with changing picture: ", error );
            setMessage("Error with changing picture: ", error );
        }
    }
    

    //Brings User's name and email
    useEffect (()=>{
        if (!token) return;
        const loadUserData = async () => {
            try{
                const response = await fetch(`${API_BASE_URL}/api/auth/profile`,{
                    method: 'GET',
                    headers: {
                        'Content-Type' : 'application/json',
                        Authorization : `Bearer ${token}`  
                    }
                });
                if(response.status === 401){
                    // Navigation handled by token useEffect
                    return
                }
                if(!response.ok){
                    throw new Error("Failed to get Users information", response.status);
                }
                const data = await response.json();
                if(response.ok){
                    setUserForm({
                        firstName: data.user.name?.split(' ')[0]|| '',
                        lastName: data.user.name?.split(' ')[1] || '',
                        email: data.user.email || ''
                    }); 
                }
                
            }catch(error){
                console.error("Error fetching user data: ", error);
            }
        }; loadUserData();
    },[token]);

    //Updates User's name and email
    const handleUpdateProfile = async() =>{
        if (!token) return;
        const updatedData ={
            name: `${userForm.firstName} ${userForm.lastName}`.trim(),
            email: userForm.email
        };
        try{
            const response = await fetch(`${API_BASE_URL}/api/auth/profile`,{
                method: 'PUT',
                headers: {
                    'Content-Type' : 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });
            
            if(response.status === 401){
                // Navigation handled by token useEffect
                return 
            }
            const result = await response.json();
            if(response.ok){
                setUserForm({
                    firstName: result.user.name?.split(' ')[0] || '',
                    lastName: result.user.name?.split(' ')[1] || '',
                    email: result.user.email || ''
                })
                setUserFormMessage("Profile has been updated!")
            }
            if(!response.ok){
                setUserFormMessage(result.error || "Failed to update profile");
            }
        }catch(error){
            setUserFormMessage("Error in updating profile information: " + error);
        }

    }
    

    const handleUpdatePassword = () =>{
        const auth = getAuth();
        const user = auth.currentUser;

        const credential = EmailAuthProvider.credential(
            user.email,
            currentPassword
        )

        if(!currentPassword || currentPassword.trim() === '' || !changePassword || changePassword.trim() === '' ||  !confirmChangePassword || confirmChangePassword.trim() === ''){
            setPasswordMessage('All inputs can not have a blank submission');
        }else{
            reauthenticateWithCredential(user,credential).then( () =>{
                console.log('Password is correct. User can change password');
                if(changePassword === confirmChangePassword){
                    if(changePassword !== currentPassword){
                        updatePassword(user, changePassword).then(()=>{
                            console.log('User successfully changed password');
                            setPasswordMessage('Successfully changed password');
                            setCurrentPassword('');
                            setChangePassword('');
                            setConfirmChangePassword('');
                        }).catch((error) => {
                            setPasswordMessage('Failed to update Password.');
                            console.error('User was unable to change password: ', error);
                        })
                    }else{
                        setPasswordMessage('The new password can not match current password');
                    }
                
                }else{
                    setPasswordMessage('The new password and confirm new password does not match');
                }
            

            }).catch((error)=>{
                console.error('The password just entered does not match current password');
                setPasswordMessage('The password just entered does not match current password');
            })
        }

        
        
    }


    const handleInput = (e) =>{
        const{name, value} = e.target;
        setUserForm(prev => ({...prev, [name]: value}));
    }

    


    
       
    /*
     useEffect (()=>{
        const auth = getAuth();
        const user = auth.currentUser;
            
        if(user && user.displayName){
            const fullname = user.displayName.split(" ");
            const firstname = fullname[0];
            const lastname = fullname[1];
            const email = auth.currentUser.email;
            setUserForm({
                firstName: firstname,
                lastName: lastname,
                email: email
            })
        }
    },[])

    
   
    const handleDefault = (e) =>{
        const{name, value} = e.target;
        setUserForm(prev => ({...prev, [name]: value}))
    };
    */
    



    /*
        Personal Notes:
        - Don't forget that when you are going to updateEmail need to reauthenicateWithCredentials
        - updateProfile only works for displayName and photoURL
        - Need to make sure that still signed in when trying to update email or password

    */

    /* 
    TODO:
    - Connect to the backend to fetch and update user data
    - Update Profile function
    - Change Profile picture function
    - Change Password function
    - Work on notification preferences, privacy settings, account options, and
    deleting account
    */

    
    
    

    return(
        <>
            <header>
                <HomePageHeader/>
            </header>
            
            <main>
                <section className={styles.profileSecurity}>
                    <div className={styles.profileSecurityContainer}>
                        <div className={styles.profileHeader}>
                            <h3>Profile & Security</h3>
                            <p>Manage your personal information and password</p>
                        </div>
                        <div className={styles.profilePic}>
                            <h4>Personal Details</h4>
                            {/*placeholder for profile picture upload*/}
                            <div className={styles.picPlaceholder}>
                                {uploadPicture === null ? 
                                    (<img src="/updateUserGuest.png" alt = "Profile Picture"/>)
                                    :
                                    (<img src={uploadPicture ? URL.createObjectURL(uploadPicture) : "/updateUserGuest.png"} alt="Profile Picture"/>)
                                }
                                
                                <input 
                                    type="file" 
                                    accept="image/png, image/jpeg, image/jpg, image/gif, image/webp" 
                                    onChange={(e)=> setUploadPicture(e.target.files[0])}/>
                                <button type='submit' onClick={changePicture}> Change Photo </button>
                            </div>
                        </div>
                        {clickGooglePopUp ? null : 
                        (
                            <>
                                <div className={styles.personalInfo}>
                                    <form className={styles.personalInfoForm}>

                                    <div>
                                        <label htmlFor="firstName">First Name </label>
                                        {/* TODO: Uncomment when userForm is available */}
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={userForm.firstName}
                                            onChange={handleInput}
                                        />
                                    </div>
                                
                                    <div>
                                        <label htmlFor="LastName"> Last Name </label>
                                            {/* TODO: Uncomment when userForm is available */}
                                            <input
                                                type="text"
                                                id="lastName"
                                                name="lastName"
                                                value={userForm.lastName}
                                                onChange={handleInput}
                                            />
                                    </div>
                               
                                    <div>
                                        <label htmlFor="email"> Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={userForm.email}
                                            onChange={handleInput}
                                        />

                                    </div>
                                    {/*<div>
                                        <label htmlFor="username"> Username </label>
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                        />

                                    </div>*/}
                                
                                
                                </form>
                                <div className={styles.profileUpdateButton}>
                                    <button type="button" onClick={handleUpdateProfile}> Update Profile</button>
                                    <p>{userFormMessage}</p>
                                </div>
                                </div>
                                <div className={styles.changepassword}>
                                    <h3>Change Password</h3>
                                    <form>
                                        <label htmlFor="currentPassword"> Current Password </label>
                                        <input
                                            type="password"
                                            id="currentPassword"
                                            name="currentPassword"
                                            placeholder="Current Password"
                                            value={currentPassword}
                                            onChange= {(e) => setCurrentPassword(e.target.value)}
                                            required
                                        />

                                        <label htmlFor="newPassword"> New Password </label>
                                        <input
                                            type="password"
                                            id="newPassword"
                                            name="newPassword"
                                            placeholder="New Password"
                                            value={changePassword}
                                            onChange={(e) => setChangePassword(e.target.value)}
                                            required
                                        />

                                        <label htmlFor="confirmNewPassword"> Confirm New Password </label>
                                        <input
                                            type="password"
                                            id="confirmNewPassword"
                                            name="confirmNewPassword"
                                            placeholder="Confirm New Password"
                                            value={confirmChangePassword}
                                            onChange={(e) => setConfirmChangePassword(e.target.value)}
                                            required
                                        />

                                        <button type="button" onClick={handleUpdatePassword}> Update Password</button>

                                        {passwordMessage === 'Successfully changed password' ?  <div className={styles.passwordMessage}>{passwordMessage} </div> : <div className={styles.passwordErrorMessage}> {passwordMessage}</div> }

                                    </form>
                                </div>
                            </>
                        )
                        }
                        

                    </div>
                    

                </section>
                <section className={styles.NotificationPreferences}>
                    <div className={styles.notificationContainer}>
                        <div className={styles.notificationsHeader}>
                            <h3>Notification Preferences</h3>
                            <p> Choose what you'd like to be notified about.</p>
                        </div>
                        <div className={styles.notificationOptions}>
                            <div className={styles.newPosts}>
                                <p>New Social Posts</p>
                                <ToggleSwitch/>
                            </div>
                            <div className={styles.messages}>
                                <p>Direct Messages</p>
                                <ToggleSwitch/>
                            </div>
                            <div className={styles.workoutReminders}>
                                <p>Workout Reminders</p>
                                <ToggleSwitch/>
                            </div>
                            <div className={styles.goals}>
                                <p>Goal Achievements</p>
                                <ToggleSwitch/>
                            </div>
                            
                            <div className={styles.Updates}>
                                <p>App Updates & Offers </p>
                                <ToggleSwitch/>
                             </div>
                        </div>
                    </div>
                </section>

                <section className={styles.privacySettings}>
                    <div className={styles.privacyContainer}>
                        <div className={styles.privacyHeader}>
                            <h3>Privacy Settings</h3>
                            <p> Control the visibility of your data and activity.</p>
                        </div>
                        <div className={styles.privacyCategories}>
                            <div className={styles.makePublic}>
                                <p>Make Profile Public</p>
                                <ToggleSwitch/>
                            </div>
                            <div className={styles.activityStatus}>
                                <p>Show Activity Status</p>
                                <ToggleSwitch/>

                            </div>
                            <div className={styles.shareWithFriends}>
                                <p>Share Workout Data with Friends</p>
                                <ToggleSwitch/>

                            </div>
                            <div className={styles.footerPrivacy}>
                                <p> Macro Match respects your privacy. For more detailed information on how we collect, use, and protect your data,
                                    please refer to our Privacy Policy.
                                </p>
                                <h4>Read Our Privacy Policy</h4>
                            </div>
                        </div>
                    </div>

                </section>

                <section className={styles.options}>
                    <div className={styles.optionsContainer}>
                        <div className={styles.optionsHeader}>
                            <h3>Account Options</h3>
                            <p> Manage your account status</p>
                        </div>
                        <div className={styles.exportData}>
                            <h4>Data Export</h4>
                            <p>Download a copy of your activity logs, caloric records, and workout plans.</p>
                            <button className={styles.downloadButton}>Download My Data</button>
                        </div>
                        <div className={styles.deleteAccount}>
                            <h4> Permanently Delete Account</h4>
                            <p>Initiate the process to permanently remove your account and all associated data from Macro Match.</p>
                            <div className={styles.deleteWarning}>
                                <p> This action is irreversible and all your data will be permanently lost. Your 
                                    social feed history, personalized plans, and progress will be deleted. You will lose access to 
                                    all Macro Match features.
                                </p>
                            </div>
                            <button className={styles.deleteButton}>Delete My Account</button>
                        </div>
                    </div>
                </section>
            
            </main>

        </>

    )

}

export default UserSettingsPage