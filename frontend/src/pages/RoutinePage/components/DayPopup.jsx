import styles from './DayPopup.module.css'
import InputPopup from './InputPopup.jsx'
import { useState, useEffect } from 'react'

function DayPopup({showPopup, activeDay, eachDayChange, data, setActiveDay }){

    const capitalizedDay = activeDay.charAt(0).toUpperCase() + activeDay.slice(1);
    
    const[errorMessage, setErrorMessage]= useState("");
    const token = localStorage.getItem('firebase_token')

    
    const[selected, setSelected] = useState('Running');
    const[duration, setDuration] = useState('');
    const[speed, setSpeed] = useState('');
    const[distance, setDistance] = useState('');
    const[highIntensity, setHighIntensity] = useState('');
    const[lowIntensity, setLowIntensity] = useState('');
    const[restTime, setRestTime] = useState('');
    
    const[exercise, setExercise] = useState([]);
    const[addingExercise, setAddingExercise] = useState('');
    
    const[notes, setNotes] = useState('');
    const[exercisePerRound, setExercisePerRound] = useState('');

    const[reps,setReps] = useState(0);
    const[sets,setSets] = useState(0);
    
    
    useEffect(()=>{
        if(data && showPopup){
            setActiveDay(data.activeDay);
            setSelected(data.selected ||'');
            setDuration(data.duration || '');
            setSpeed(data.speed || '');
            setDistance(data.distance || '');
            setHighIntensity(data.highIntensity || '');
            setLowIntensity(data.lowIntensity || '');
            setRestTime(data.restTime || '');
            setExercise(data.exercise || []);
            setNotes(data.notes || '');
            setExercisePerRound(data.exercisePerRound || '');
            //see if need to add reps and sets separately
        }
    },[showPopup, data]);

    if(showPopup === false) return null;

    const handleEachDayData = async() =>{
        const routineData = {
                activeDay,
                selected,
                duration,
                speed,
                distance,
                highIntensity,
                lowIntensity,
                restTime,
                exercise,
                notes,
                exercisePerRound,
                reps,
                sets
        }
        if(data){
            try{
                const response = await fetch("http://localhost:5000/api/v1/routine/",
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type' : 'application/json',
                            Authorization : `Bearer ${token}`
                        },
                        body: JSON.stringify(routineData)
                    }
                );
                const result = await response.json();
                if(!response.ok){
                    setErrorMessage(result.error);
                }
            }catch(error){
                console.log("failed to update: ", error);
                setErrorMessage("Failed to update routine");
            }
        }else{
            console.log(routineData);
            eachDayChange(activeDay, routineData);
            try{
                const response = await fetch('http://localhost:5000/api/v1/routine/',{
                method: 'POST',
                headers: {
                    'Content-Type':'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(routineData)
            });
            const result = await response.json();
            if(!response.ok){
                console.log(result.error);
                setErrorMessage(result.error);
            }
            }catch(error){
                console.error('Adding Routine error: ', error);
                setErrorMessage(error);
            }

        }
    }
    

    /*
   const handleEachDayData = async ()=>{
        const data = {
            activeDay,
            selected,
            duration,
            speed,
            distance,
            highIntensity,
            lowIntensity,
            restTime,
            exercise,
            notes,
            exercisePerRound,
            reps,
            sets
        }
        console.log(data);
        eachDayChange(activeDay, data);
        try{
            const response = await fetch('http://localhost:5000/api/v1/routine',{
            method: 'POST',
            headers: {
                'Content-Type':'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                activeDay: activeDay,
                selected: selected,
                duration: duration,
                speed: speed,
                distance: distance,
                highIntensity: highIntensity,
                lowIntensity: lowIntensity,
                restTime: restTime,
                exercise: exercise,
                notes: notes,
                exercisePerRound: exercisePerRound,
            }),
        });
        const data = await response.json();
        if(!response.ok){
            setErrorMessage(data.error)
        }
        }catch(error){
            console.error('Adding Routine error: ', error);
            setErrorMessage(error);
        }
        
    }*/

    /* Function helps closing Popup and clearing. Only thing is that need to change the button colors
    function handleDeleting(){
        setShowPopup(false);
        setRoutine('');
        setSelected('Running');
        setDuration('');
        setSpeed('');
        setDistance('');
        setHighIntensity('');
        setLowIntensity('');
        setRestTime('');
        setExercise([]);
        setNotes('');
        setExercisePerRound('');
        setReps(0);
        setSets(0);
    }
    */
   
    
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
                        speed={speed} 
                        setSpeed={setSpeed}
                        distance={distance}
                        setDistance={setDistance}
                        highIntensity={highIntensity}
                        setHighIntensity={setHighIntensity}
                        lowIntensity={lowIntensity}
                        setLowIntensity={setLowIntensity}
                        restTime={restTime}
                        setRestTime={setRestTime}
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
                    
                </div>
            </div>
        </div>
    )
}

export default DayPopup