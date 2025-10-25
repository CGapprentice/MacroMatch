import styles from './DayPopup.module.css'
import InputPopup from './InputPopup.jsx'
import { useState } from 'react'

function DayPopup({showPopup, activeDay, setDay, eachDayChange, setShowPopup}){
    const [routine, setRoutine] = useState('');
    const capitalizedDay = activeDay.charAt(0).toUpperCase() + activeDay.slice(1);
    
    
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
    const[excercisePerRound, setExercisePerRound] = useState('');

    const[reps,setReps] = useState(0);
    const[sets,setSets] = useState(0);
    
    const[data, setData] = useState('');
    
    if(showPopup === false) return null;

   function handleEachDayData(){
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
            excercisePerRound,
            reps,
            sets
        }
        console.log(data);
        eachDayChange(activeDay, data);

    }
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
                        excercisePerRound={excercisePerRound}
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