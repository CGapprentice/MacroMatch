import styles from './RoutinePage.module.css'
import { useEffect, useState } from 'react'
import HomePageHeader from '../../homepage/header.jsx'
import SummaryPage from "./components/SummaryPage.jsx"
import { useNavigate } from "react-router-dom"


import DayPopup from './components/DayPopup.jsx'

function RoutinePage(){

    //Changes tab title to be Routine Page
    useEffect(()=>{
        document.title = 'Routine Page';
    },[]);

    //errorMessage is to be able to let user know if anything is wrong
    const[errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    //Brings to specific user
    const token = localStorage.getItem('firebase_token')


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

    //this checks if all days are false to just have the add routine button if there's no popup
    const check = Object.values(chooseDay).every(value => value === false);
    
    useEffect (()=>{
        const getSummaryRoutine = async () => {
            try{
                const result = await fetch('http://localhost:5000/api/v1/routine/',{
                    method: 'GET',
                    headers:{
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                });
                if(result.status === 401){
                    localStorage.removeItem("firebase_token");
                    navigate('/login')
                    return
                }
                if(result.ok){
                    const response = await result.json();

                    const routinesEachDay = {}
                    const updatedDays = {...chooseDay};
                    response.routine.forEach(routine=>{
                        routinesEachDay[routine.activeDay] = routine;
                        updatedDays[routine.activeDay] = true;
                    });
                    setData(routinesEachDay);
                    setRoutineSummary(true);
                    setChooseDay(updatedDays);
                }
            }catch(error){
                console.error('Get User routine error: ', error);
                setErrorMessage(error);
            }
        }; getSummaryRoutine();
    },[]);

  
    const handleDayClick = async(selectedDay) =>{
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
                const response = await fetch(`http://localhost:5000/api/v1/routine/${routineId}`,{
                    method: 'DELETE',
                    headers:{
                        'Content-type' : 'application/json',
                        Authorization : `Bearer ${token}`
                    }
                });
                if(response.status === 401){
                    localStorage.removeItem("firebase_token")
                    navigate('/login')
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
                }else{
                    const dataError = await response.json();
                    console.error("Failed to delete: ", dataError);
                }
            }catch(error){
                console.error("Delete Routine Failed: ", error);
                setErrorMessage("Wasn't able to delete routine try later");
            }
        }
            
    };

    

    const addRoutine= ()=>{
        setRoutineSummary(true);
    }


    return(
        <>
        <header>
            <HomePageHeader />
        </header>
        {routineSummary ? (
            <SummaryPage data={data} setRoutineSummary={setRoutineSummary}/>
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
                        />
                    </div>
                ))}
                {check || routineSummary ? null : <div className={styles.addbutton}>
                    <button onClick={addRoutine}>add routine</button> 
                </div> }
                       
            </section>


            
        </main>}
        </>
    )
}

export default RoutinePage