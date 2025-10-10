import styles from './HomePage.module.css'

import { Link } from 'react-router-dom'
import { useEffect } from 'react'


function HomePage() {

    useEffect(()=>{
        document.title = 'Home Page'
    },[])

    return(
        <>
        <header>
            
            <div className={styles.homeHeader}>
                <h1>MacroMatch</h1>
                <div className={styles.categoriesHeader}>
                    <p><a href="#home">Home</a></p>
                    <p><a href="#features">Features</a></p> 
                    <p><a href="#aboutUs">About Us</a></p>
                  
                    
                </div>
                <div className={styles.loginsignupHeader}>
                    <Link to="/loginpage"><button>login</button></Link><br></br>
                    <Link to="/signinpage"><button>sign in</button></Link><br></br>   
                </div>
                            
            </div>

            
        </header>
        <main>
            <section id="home" className="home">
                <div className={styles.homePageContainer}>
                    <div className={styles.whatIsMacro}>
                        <h1>What is MacroMatch?</h1>
                        <br></br>
                        <br></br>
                        <p>MacroMatch is a helping tool for those who wish to reach their fitness goals.
                        Either by losing weight, gaining weight, or maintaining weight. These goals
                        shouldn't be that hard to reach but sometimes there is a need to get some help.
                        Which is where MacroMatch comes into play. Keep on reading and will show how we help.
                        </p>
                    </div>
                    <div className={styles.macroimage}>
                        <img src="/macroMatchhomepage.jpg" className={styles.imageHome} alt="person lifting weights" />
                    </div>
                </div>
            </section>



            <section id="features" className={styles.features}>
                <div className={styles.topfeature}>
                    <h1>Features</h1>
                    <p>The following are the features MacroMatch has</p>
                </div>


                <div className={styles.featuresCategory}>
                    <div>
                        
                        <img src="/homepageTracking.jpeg"/>
                    </div>

                    <div className={styles.calcSpot}>
                        
                        <div className={styles.calcImage}>
                            <div>
                                <img src="/homepageCalc.png" alt="calculator image"/>
                            </div>
                            <div>
                                <h4>Calorie Intake</h4>
                                <p> A Calculator that will tell you the amount of calories you should be consuming daily.</p>
                            </div>
                            
                        </div>

                        <div className={styles.musicImage}>
                            <div>
                                <img src="/homepageMusic.png" alt="calculator image"/>
                            </div>
                            <div>
                                <h4>Spotify Playlist</h4>
                                <p>A playlist that is created based on the type of workout you are doing.</p>
                            </div>                            
                        </div>
                        

                        <div className={styles.foodImage}>
                            <div>
                                <img src="/homepageFood.png" alt="calculator image"/>
                            </div>
                            <div>
                                <h4>Food Tracker</h4>
                                <p>Keeps up with the amount of calories you are eating each day.</p>
                            </div>
                        </div>
                        
                        <div className={styles.workoutImage}>
                            <div>
                                <img src="/homepageWorkout.png" alt="calculator image"/>
                            </div>
                            <div>
                                <h4>Social Feed page</h4>
                                <p>You can connect with other users and share results with each other. You can also share what has been working and what has not. </p>
                            </div>
                        </div>
                        
                    </div>
                    
                </div>
            </section>


            <section id="aboutUs" className={styles.aboutUs}>
                <div>
                    <div className={styles.aboutUsHeader}>
                        <h1>About Us</h1>
                        <p>We are a group of four who really care about fitness. We believe that being fit can lead to a healthy life and wish the same for others. </p>
                    </div>
                    <div className={styles.aboutUsParagraph}>
                        <h4>Why trust us?</h4>
                        <p>This team is built up of computer science majors. We sit on a chair and stare into our computers most of the day. We ourselves need a healthy
                        life style because if we don't then you can imagine what will happen if we don't. (Knees will start cracking way earlier than they should). As well
                        who else would be the best to talk about being able to reach their fitness goals than people who literally be sitting all day. 
                        </p>
                        <h4>What caused us to come together to create this?</h4>
                        <p>There may be fitness apps out there. But there's always something missing. We are trying to create an app that contains everything a person would want in 
                        a fitness app. It does not just isolate yourself. It allows people to connect. You won't be the only one in this journey and others can help you. As well as you can help others.
                        </p>
                        <p>We hope that everyone who uses this are able to reach their goals. If not, well we did our best. </p>
                    </div>
                    
                </div>
            </section>

        </main>

        </>
    )
}

export default HomePage