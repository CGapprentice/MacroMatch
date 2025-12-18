import styles from './DayPopup.module.css'
import InputPopup from './InputPopup.jsx'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { API_BASE_URL,getCurrentUserToken } from '../../../firebase.js'; // Import getCurrentUserToken

function DayPopup({showPopup, activeDay, eachDayChange, data, setActiveDay, routineId , progressData, setProgressData, setProgressID, todayData, setTodayData, currentDay, postToday, setPostToday}){
    //SEE IF YOU WANT TO ADD AN X BUTTON ONTO THE POPUP

    const capitalizedDay = activeDay.charAt(0).toUpperCase() + activeDay.slice(1);
    
    const[errorMessage, setErrorMessage]= useState("");
    
    const navigate = useNavigate(); // Initialize navigate

    // Token management
    const [token, setToken] = useState(null);

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
            }
        };
        fetchToken();
    }, [navigate]);

    const todayInformation = {}
    const[selected, setSelected] = useState('Walking');
    const[duration, setDuration] = useState(null);
    const[durationUnit, setDurationUnit] = useState('minutes');
    const[speed, setSpeed] = useState(null);
    const[speedUnit, setSpeedUnit]= useState('mph');
    const[distance, setDistance] = useState(null);
    const[distanceUnit, setDistanceUnit] = useState('miles');
    const[highIntensity, setHighIntensity] = useState(null);
    const[highIntensityUnit, setHighIntensityUnit] = useState('seconds');
    const[lowIntensity, setLowIntensity] = useState(null);
    const[lowIntensityUnit, setLowIntensityUnit] = useState('seconds');
    const[restTime, setRestTime] = useState(null);
    const[restTimeUnit, setRestTimeUnit] = useState('seconds');
    
    const[exercise, setExercise] = useState([]);
    const[addingExercise, setAddingExercise] = useState('');
    
    const[notes, setNotes] = useState('');
    const[exercisePerRound, setExercisePerRound] = useState('');

    const[reps,setReps] = useState(0);
    const[sets,setSets] = useState(0);

    const[saved, setSaved] = useState(false);
    
    //This brings the data from the backend into the popups
    useEffect(()=>{
        if(data && showPopup){
            setActiveDay(data.activeDay);
            setSelected(data.selected ||'walking');
            setDuration(data.duration || null);
            setDurationUnit(data.durationUnit || 'minutes');
            setSpeed(data.speed || null);
            setSpeedUnit(data.speedUnit||'mph');
            setDistance(data.distance || null);
            setDistanceUnit(data.distanceUnit || 'miles');
            setHighIntensity(data.highIntensity || null);
            setHighIntensityUnit(data.highIntensityUnit || "seconds");
            setLowIntensity(data.lowIntensity || null);
            setLowIntensityUnit(data.lowIntensityUnit || 'seconds');
            setRestTime(data.restTime || null);
            setRestTimeUnit(data.restTimeUnit || 'seconds');
            setExercise(data.exercise || []);
            setNotes(data.notes || '');
            setExercisePerRound(data.exercisePerRound || '');
        }
    },[showPopup, data]);

    if(showPopup === false) return null;

    const handleEachDayData = async() =>{
        if (!token) { navigate('/login'); return; } // Ensure token is available

        const routineData = {
            activeDay,
            selected,
            duration,
            durationUnit,
            speed,
            speedUnit,
            distance,
            distanceUnit,
            highIntensity,
            highIntensityUnit,
            lowIntensity,
            lowIntensityUnit,
            restTime,
            restTimeUnit,
            exercise,
            notes,
            exercisePerRound,
            reps,
            sets
        }
        if(routineId){
            try{
                const response = await fetch(`${API_BASE_URL}/api/v1/routine/${routineId}`,{
                    method: 'PUT',
                    headers:{
                        'Content-type' : 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(routineData)
                });
                const result = await response.json();
                if(response.status === 401){
                    // Navigation handled by token useEffect
                    return
                }
                //const day = result.routine.activeDay;
                if(response.ok){
                    eachDayChange(activeDay, result.routine);
                    setSaved(true);
                    setErrorMessage('');
                    console.log("Successfully Updated Data routine!");
                }
                if(!response.ok){
                    console.log(result.error);
                    setErrorMessage(result.details);
                    setSaved(false);
                }
            }catch(error){
                console.error('Updating Routine error:', error);
                setErrorMessage(error);
                setSaved(false);
            }
        }else{
            try{
                const response = await fetch(`${API_BASE_URL}/api/v1/routine/`,{
                    method: 'POST',
                    headers: {
                        'Content-Type':'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(routineData)
                });
                const result = await response.json();
                //const day = result.routine.activeDay;
                if(response.ok){
                    eachDayChange(activeDay, result.routine);
                    setSaved(true);
                    setErrorMessage('');
                    setProgressData(prev =>({
                        ...prev,
                        [result.routine.activeDay]: false
                    }))
                    console.log("Successfully POSTED user routine!");
                }
                if(!response.ok){
                    console.log(result.error);
                    setErrorMessage(result.details);
                    setSaved(false);
                }
            }catch(error){
                console.error('Adding Routine error: ', error);
                setErrorMessage(error);
                setSaved(false);
            }
        }
         
    }
   
    
    return(
        <div className={styles.DayPopupContainter}>
            <div className={styles.DayPopup}>
                <div className={styles.topBox}>
                    <h1>{capitalizedDay}</h1> {/* <button onClick={handleDeleting}>X</button>*/}
                </div>
                
                
                <div className={styles.types}>
                    <InputPopup
                        selected={selected} 
                        setSelected={setSelected} 
                        duration={duration} 
                        setDuration={setDuration} 
                        durationUnit={durationUnit}
                        setDurationUnit={setDurationUnit}
                        speed={speed} 
                        setSpeed={setSpeed}
                        speedUnit={speedUnit}
                        setSpeedUnit={setSpeedUnit}
                        distance={distance}
                        setDistance={setDistance}
                        distanceUnit={distanceUnit}
                        setDistanceUnit={setDistanceUnit}
                        highIntensity={highIntensity}
                        setHighIntensity={setHighIntensity}
                        highIntensityUnit={highIntensityUnit}
                        setHighIntensityUnit={setHighIntensityUnit}
                        lowIntensity={lowIntensity}
                        setLowIntensity={setLowIntensity}
                        lowIntensityUnit={lowIntensityUnit}
                        setLowIntensityUnit={setLowIntensityUnit}
                        restTime={restTime}
                        setRestTime={setRestTime}
                        restTimeUnit={restTimeUnit}
                        setRestTimeUnit={setRestTimeUnit}
                        exercise={exercise}
                        setExercise={setExercise}
                        addingExercise={addingExercise}
                        setAddingExercise={setAddingExercise}
                        notes={notes}
                        setNotes={setNotes}
                        exercisePerRound={exercisePerRound}
                        setExercisePerRound={setExercisePerRound}
                        reps={reps}
                        setReps={setReps}
                        sets={sets}
                        setSets={setSets} 
                    />
                    <div className={styles.saveButton}><button onClick={handleEachDayData}>save</button></div>
                    <div className={styles.errorMessage}>
                        {errorMessage ? <div><p>Error:</p> {errorMessage.map((item,index) => (<p key={index}>{item}</p>))} </div>: null}
                    </div> 
                    {saved ? <p>Saved!</p> : null}
                </div>
            </div>
        </div>
    )
}

export default DayPopup