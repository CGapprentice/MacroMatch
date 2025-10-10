
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import HomePageHeader from '../../homepage/header.jsx'
import styles from './UserSettings.module.css'


import { getAuth, updateProfile, updateEmail, reauthenticateWithCredential , onAuthStateChanged } from "firebase/auth";
import ToggleSwitch from './toggleSwitch/toggleSwitch.jsx';


function UserSettingsPage(){
    useEffect(()=>{
        document.title = "User Settings"
    }, [])

    // Temporary variables until authentication is properly implemented
    const [message, setMessage] = useState("");
    const [userForm, setUserForm] = useState({
        firstName: '',
        lastName: '',
        email: ''
    });

    const handleDefault = (e) => {
        const {name, value} = e.target;
        setUserForm(prev => ({...prev, [name]: value}))
    };

    /*
        const auth = getAuth();
        const[message, setMessage] = useState("");

        const fullname = auth.currentUser.displayName.split(" ");
        const firstName = fullname[0];
        const lastName = fullname[1];
        const email = auth.currentUser.email;

        const[userForm, setUserForm] = useState({
            firstName: firstName,
            lastName: lastName,
            email: email
        });

    
   
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
                                <img src="/updateUserGuest.png" alt = "Profile Picture"/>
                                <button> Change Photo </button>
                            </div>
                        </div>
                        <div className={styles.personalInfo}>
                            <form className={styles.personalInfoForm}>

                                <div>
                                    <label for="firstName">First Name </label>
                                    {/* TODO: Uncomment when userForm is available */}
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={userForm.firstName}
                                        onChange={handleDefault}
                                    />
                                </div>
                                
                                <div>
                                     <label for="LastName"> Last Name </label>
                                     {/* TODO: Uncomment when userForm is available */}
                                        <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={userForm.lastName}
                                        onChange={handleDefault}
                                        />
                                </div>
                               
                                <div>
                                    <label for="email"> Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={userForm.email}
                                        onChange={handleDefault}
                                    />

                                </div>
                                <div>
                                    <label for="username"> Username </label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                    />

                                </div>
                                
                                
                             </form>
                             <div className={styles.profileUpdateButton}>
                                    <button type="submit"> Update Profile</button>
                            </div>
                        </div>
                        <div className={styles.changepassword}>
                            <h3>Change Password</h3>
                            <form>
                                <label for="currentPassword"> Current Password </label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    name="currentPassword"
                                    placeholder="Current Password"
                                />

                                <label for="newPassword"> New Password </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    placeholder="New Password"
                                    required
                                />

                                <label for="confirmNewPassword"> Confirm New Password </label>
                                <input
                                    type="password"
                                    id="confirmNewPassword"
                                    name="confirmNewPassword"
                                    placeholder="Confirm New Password"
                                    required
                                />

                                <button type="submit"> Update Password</button>
                                <p>{message}</p>

                            </form>
                        </div>

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