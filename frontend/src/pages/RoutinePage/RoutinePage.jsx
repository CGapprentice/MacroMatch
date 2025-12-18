import styles from './RoutinePage.module.css'
import { useEffect, useState } from 'react'
import HomePageHeader from '../../homepage/header.jsx'
import SummaryPage from "./components/SummaryPage.jsx"
import { useNavigate } from "react-router-dom"
import { isSameWeek } from 'date-fns'
import { getCurrentUserToken, API_BASE_URL } from '../../firebase.js'; // Import getCurrentUserToken
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import DayPopup from './components/DayPopup.jsx'

function RoutinePage(){
    //Changes tab title to be Routine Page
    useEffect(()=>{
        document.title = 'Routine Page';
    },[]);

    //errorMessage is to be able to let user know if anything is wrong
    const[errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    // Token management
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const userToken = await getCurrentUserToken();
                if (!userToken) {
                    localStorage.removeItem('firebase_token')
                    navigate('/login');
                    return;
                }
                setToken(userToken);
            } catch (error) {
                console.error("Failed to fetch Firebase token:", error);
                localStorage.removeItem('firebase_token')
                navigate('/login');
            } finally {
                setIsLoading(false);
            }
        };
        fetchToken();
    }, [navigate]); // navigate is stable, so it's safe to include.

    //Brings to specific user


    // routineSummary is boolean where if there is a routine
    // to show the routine page instead of creating another workout
    const [routineSummary, setRoutineSummary] = useState(false);

    //data is an array that will contain objectID from mongo and will 
    //be an array containing the day and the workout routine.
    const[data, setData] = useState({});

    //chooseDay will show which days the user has clicked to 
    //add to their routine

    /*
        REMINDER:
            - Need to update chooseDay status
            when updating data so that it can not 
            automatically set to false when they are not
    */
    const[chooseDay, setChooseDay] = useState({
        sunday: false,
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false
    });

    //showPopup is for each day choices.
    const[showPopup, setShowPopup] = useState(false);

    //activaeDay is the day user have clicked
    const[activeDay, setActiveDay] = useState('');
    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday","saturday"];
    const today = new Date();
    const currentDay = daysOfWeek[today.getDay()];
    const[todayRoutine, setTodayRoutine] = useState(false);
    const todayInformation = {}
    const[todayData, setTodayData] = useState({});
    const[progressData, setProgressData] = useState({});
    const[postToday, setPostToday] = useState(false);
    const[progressID, setProgressID] = useState(null);
    const[checkGet, setCheckGet] = useState(true);

    //this checks if all days are false to just have the add routine button if there's no popup
    const check = Object.values(chooseDay).every(value => value === false);
    useEffect (() =>{
        if (!token) return; // Only run if token is available
        const getProgressRoutine = async () =>{
            try{
                const response = await fetch(`${API_BASE_URL}/api/v1/progress/`,{
                    method: 'GET',
                    headers: {
                        'Content-Type' :'application/json',
                        Authorization: `Bearer ${token}`
                    }
                });
                if(response.status === 401){
                    // navigate('/login') is already handled by the token fetching useEffect
                    return
                }
                const result = await response.json();
                const days = result.progress[0];
                if(response.ok){
                    setProgressData(days.progress);
                    setProgressID(days.id);
                    if(!isSameWeek(today,days.updated_at)){
                        const newWeek = Object.fromEntries(Object.keys(days.progress).map(day => [day,false]))
                        try{
                            const updateResponse = await fetch(`${API_BASE_URL}/api/v1/progress/${days.id}`, {
                                method: 'PUT',
                                headers:{
                                    'Content-Type' : 'application/json',
                                    Authorization: `Bearer ${token}`
                                },
                                body: JSON.stringify({progress: newWeek})
                            })
                            const updateResult = await updateResponse.json()
                            if(updateResponse.ok){
                                setProgressData(updateResult.progress.progress);
                                setProgressID(updateResult.progress.id);
                            }
                            if(!updateResponse.ok){
                                console.log("Something went wrong with updating: ", updateResult.error)
                            }
                        }
                        catch(error){
                            console.error("Couldn't update data: ", error);
                        }
                    }

                }
                if(!response.ok){
                    console.log('Error is: ', result.error)
                }
            }
            catch(error){
                console.error('failed to get progressData', error);
            }
            
        }; getProgressRoutine();
    },[token, navigate, today]);
    

    /*
        The following brings the user's previous data onto the screen.
        Meaning that it will bring in the Routine that the user has previously
        submitted
    */
    useEffect (()=>{
        if (!token) return; // Only run if token is available
        const getSummaryRoutine = async () => {
            try{
                const result = await fetch(`${API_BASE_URL}/api/v1/routine/`,{
                    method: 'GET',
                    headers:{
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                });
                if(result.status === 401){
                    // navigate('/login') is already handled by the token fetching useEffect
                    return
                }
                if(result.ok){
                    const response = await result.json();
                    
                    const routinesEachDay = {}
                    const progressDays = {}
                    const updatedDays = {...chooseDay};
                    response.routine.forEach(routine=>{
                        routinesEachDay[routine.activeDay] = routine;
                        updatedDays[routine.activeDay] = true;
                        if(currentDay === routine.activeDay){
                            setTodayRoutine(true);
                            todayInformation[routine.activeDay] = routine
                            setTodayData(todayInformation);
                        }
                    });
                    setData(routinesEachDay);
                    setRoutineSummary(true);
                    setChooseDay(updatedDays);
                    setCheckGet(false);
                }
            }catch(error){
                console.error('Get User routine error: ', error);
                setErrorMessage(error);
            }
        }; getSummaryRoutine();
    },[token, navigate, currentDay]);

  
    /*
        Deals with when the user clicks the days button to either show the popup
        for the specific day or remove it. If it is removed with data in it. It 
        will delete the data from both the backend and the frontend.
    */
    const handleDayClick = async(selectedDay) =>{
        if (!token) { navigate('/login'); return; } // Ensure token is available
        const changed= chooseDay[selectedDay]
        setChooseDay(prevState => ({
            ...prevState,
            [selectedDay]: !prevState[selectedDay]
        })); 
        if(!changed && !data[selectedDay]?.id){
            setActiveDay(selectedDay);
            setShowPopup(true);
        }else{
            const routineId = data[selectedDay]?.id;
            if(!routineId){
                return;
            }
            try{
                const response = await fetch(`${API_BASE_URL}/api/v1/routine/${routineId}`,{
                    method: 'DELETE',
                    headers:{
                        'Content-type' : 'application/json',
                        Authorization : `Bearer ${token}`
                    }
                });
                if(response.status === 401){
                    // navigate('/login') is already handled by the token fetching useEffect
                    return
                }
                if(response.ok){
                    setShowPopup(false);
                    setData(prev=>{
                        const update = {...prev};
                        delete update[selectedDay];
                        return update;
                    });
                    setChooseDay(prev => ({
                        ...prev,
                        [selectedDay]: false
                    }));
                    
                    console.log("Successfully deleted workout!!")
                    const removeProgress = {...progressData};
                    delete removeProgress[selectedDay];
                    setProgressData(removeProgress);
                    try{
                        const response = await fetch(`${API_BASE_URL}/api/v1/progress/${progressID}`,{
                            method: 'PUT',
                            headers:{
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify({progress: removeProgress})
                        });
                        if(response.status === 401){
                            // navigate('/login') is already handled by the token fetching useEffect
                            return
                        }
                        const result = await response.json()
                        if(response.ok){
                            setProgressData(result.progress.progress);
                            setProgressID(result.progress.id);
                        }
                        if(!response.ok){
                            console.log("failed to update progress day by deleting a day")
                        }
                    }catch(error){
                        console.error("Failed to connect to routine's progress" , error);
                    }
                }else{
                    const dataError = await response.json();
                    console.error("Failed to delete day from PUT method: ", dataError);
                }
            }catch(error){
                console.error("Delete Routine Failed: ", error);
                setErrorMessage("Wasn't able to delete routine try later");
            }

        }
            
    };


    
    const addRoutine =  async ()=>{
        if (!token) { navigate('/login'); return; } // Ensure token is available
        if(!progressID){
            console.error('No progressID!');
            return;
        }
        try{
            const response = await fetch (`${API_BASE_URL}/api/v1/progress/${progressID}`,{
                method: 'PUT',
                headers: {
                    'Content-Type' : 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({progress: progressData})
            });
            const result = await response.json()
            if(response.ok){
                setRoutineSummary(true);
                setProgressData(result.progress.progress);
                setProgressID(result.progress.id);
            }
            if(!response.ok){
                console.log("Connects to backend but error is: ", result.error);

            }
        }catch(error){
            console.error("Failed to connect to backend to update data: ", error);
        }
    }
    
    const initiateProgressData = async () =>{
        if (!token) { navigate('/login'); return; } // Ensure token is available
        try{
            const response = await fetch(`${API_BASE_URL}/api/v1/progress/`,{
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({progress: progressData})
            })
            const result = await response.json();
            if(response.ok){
                console.log("Initiated progress routine to have all false for all days the users have added");
                setProgressData(result.progress.progress);
                setRoutineSummary(true);
                setProgressID(result.progress.id);
                setCheckGet(false);
            }
            if(!response.ok){
                console.log('failed to get progress routine: ', result.error);
            }
        }
        catch(error){
            console.error('Error with posting initial progress routine', error);
        }
        
    }

    if (isLoading) {
        return <div>Loading...</div>; // Or a more sophisticated loading spinner
    }

    return(
        <>
        <header>
            <HomePageHeader />
        </header>
        {(routineSummary || todayRoutine ) ? (<SummaryPage data={data} setRoutineSummary={setRoutineSummary} todayData={todayData} setTodayRoutine={setTodayRoutine} currentDay={currentDay}  todayRoutine={todayRoutine} progressData={progressData} setProgressData={setProgressData} token={token} progressID={progressID} setProgressID ={setProgressID} />
        ): <main className={styles.mainRoutine}>
            <section className={styles.chooseContainer}>
                <div className={styles.days}>
                    <div className={styles.routineHeader}>
                        <h1>Workout Routine</h1>
                    </div>
                    <div className={styles.dayButtons}>
                        <button className={`${styles.set} ${chooseDay.sunday ? styles.chooseDay : ''}`} onClick={() => handleDayClick('sunday')}>Sun</button>
                        <button className={`${styles.set} ${chooseDay.monday ? styles.chooseDay : ''}`} onClick={() => handleDayClick('monday')}>Mon</button>
                        <button className={`${styles.set} ${chooseDay.tuesday ? styles.chooseDay : ''}`} onClick={() => handleDayClick('tuesday')}>Tue</button>
                        <button className={`${styles.set} ${chooseDay.wednesday ? styles.chooseDay : ''}`} onClick={() => handleDayClick('wednesday')}>Wed</button>
                        <button className={`${styles.set} ${chooseDay.thursday ? styles.chooseDay : ''}`} onClick={() => handleDayClick('thursday')}>Thu</button>
                        <button className={`${styles.set} ${chooseDay.friday ? styles.chooseDay : ''}`} onClick={() => handleDayClick('friday')}>Fri</button>
                        <button className={`${styles.set} ${chooseDay.saturday ? styles.chooseDay : ''}`} onClick={() => handleDayClick('saturday')}>Sat</button>
                    </div>
                </div>
            </section>
            <section className={styles.routineSection}>
                {Object.entries(chooseDay)
                .filter(([day,isOpen]) => isOpen)
                .map(([day]) => (
                    <div className={styles.popUp} key={day}>
                        <DayPopup key={day} showPopup={true} 
                        activeDay={day} 
                        selectedDay={day} 
                        eachDayChange={(day, data) => 
                            setData(prev => ({...prev, [day]: data})) 
                        }
                        data={data[day]}
                        setActiveDay={setActiveDay}
                        routineId = {data[day]?.id}
                        
                        //progressData has all workout days setting true or false
                        progressData={progressData}
                        setProgressData={setProgressData}
                        //todayData is needed so if user adds today it should show up with the data
                        todayData={todayData}
                        setTodayData={setTodayData}

                        //check if user adds current day to add true to todayRoutine
                        currentDay={currentDay}
                        todayRoutine={todayRoutine}
                        setTodayRoutine={setTodayRoutine}

                        postToday={postToday}
                        setPostToday={setPostToday}

                        setProgressID={setProgressID}
                        


                        />
                    </div>
                ))}
                {check || routineSummary ? null : <div className={styles.addbutton}>
                    {checkGet ?  <button onClick={initiateProgressData}>add routine</button>:<button onClick={addRoutine}>add routine</button>}
                    
                </div> }
                       
            </section>


            
        </main>}
        </>
    )
}

export default RoutinePage