import styles from "./SummaryPage.module.css"
import ProgressRoutine from "./ProgressRoutine";
import { useState } from 'react'
import { motion } from 'framer-motion'

function SummaryPage({data,setRoutineSummary, todayData, setTodayRoutine, currentDay,todayRoutine, progressData, setProgressData, token, progressID, setProgressID}){
    const routineToday = todayData[currentDay];
    const[completeRoutine, setCompleteRoutine] = useState(null);
    const progress = Object.values(progressData).filter(Boolean).length;
    const totalDays = Object.keys(progressData).length
    const days = data;
   
    const dayOrder = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday","saturday"];

    const sortedDays = Object.entries(days).sort(([a],[b]) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

    const handleAddingProgress = async(day) =>{
        const update = {...progressData, [day]:true};
        setProgressData(update);
        try{
            const response = await fetch(`http://localhost:5000/api/v1/progress/${progressID}`, {
                method: 'PUT',
                headers:{
                    'Content-Type' : 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({progress: update})
            })
            const result = await response.json()
            if(response.ok){
                setProgressData(result.progress.progress);
                setProgressID(result.progress.id);
                console.log(progressData);
            }
            if(!response.ok){
                console.log("Something went wrong with updating: ", result.error)
            }
        }
        catch(error){
            console.error("Couldn't update data: ", error);
        }
        
    }

    const handleDeletingProgress = async(day) =>{
        const update = {...progressData,[day]:false};
        setProgressData(update);
        try{
            const response = await fetch(`http://localhost:5000/api/v1/progress/${progressID}`, {
                method: 'PUT',
                headers:{
                    'Content-Type' : 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({progress: update})
            })
            const result = await response.json()
            if(response.ok){
                setProgressData(result.progress.progress);
                setProgressID(result.progress.id);
                console.log(progressData);
            }
            if(!response.ok){
                console.log("Something went wrong with updating: ", result.error)
            }
        }
        catch(error){
            console.error("Couldn't update data: ", error);
        }
    }

    return(
        <>
        
        <div className={styles.top}>
            
            <div className={styles.editButton}>
                <div className={styles.progressrow}>
                    <div className={styles.progress}> 
                        <motion.div 
                            className={styles.progressbar}
                            intial={{width:0}}
                            animate={{width:`${(progress/ totalDays) * 100}%`}} 
                            transition={{duration: 1, ease: "easeOut"}}
                        />
                    </div>
                    <div className={styles.progressInfo}>
                        <p>{progress} / {totalDays}</p>
                        {(progress/totalDays) * 100 === 100 ? <p>You finished this week's workout routine!! </p>:null}
                    </div>
                    
                </div>

                <button onClick={()=> setRoutineSummary(false)}>Edit</button>
            </div>
            
        </div>
        <div className={styles.summaryPage}>
            
            {sortedDays.map(([day, routine])=> (
                progressData[day] ?(
                    <div className={styles.todayBox} key ={day}>
                        <h1>{typeof routine.activeDay === "string"? routine.activeDay.charAt(0).toUpperCase() + routine.activeDay.slice(1): ""}</h1>
                        {routine.selected === "Cycling" || routine.selected==="Walking" || routine.selected==="Running" || routine.selected==="Swimming" || routine.selected==="Elliptical" || routine.selected === "Treadmill" ? 
                            (<div className={styles.cardioSection}>
                                <p><b>Type of workout: </b>{routine.selected}</p>
                                <p><b>Duration: </b>{routine.duration} {routine.durationUnit}</p>
                                <p><b>Speed:</b> {routine.speed} {routine.speedUnit}</p>
                                <p><b>Distance:</b> {routine.distance} {routine.distanceUnit}</p>
                                <br></br><br></br>
                                <p>Didn't do the work out? </p> <button onClick={()=>handleDeletingProgress(day)}>yes</button>
                            </div>
                            ) 
                        : null }
                        {routine.selected==="HIIT" || routine.selected==="Cardio intervals" ? 
                            ( <div className={styles.intervalSection}>
                                <p><b>Type of Workout:</b> {routine.selected}</p>
                                <p><b>Exercise Per Round:</b> {routine.exercisePerRound}</p>
                                <p><b>Total Duration:</b> {routine.duration} {routine.durationUnit}</p>
                                <p><b>High Intensity time:</b> {routine.highIntensity} {routine.highIntensityUnit}</p>
                                <p><b>Low Intensiy time:</b> {routine.lowIntensity} {routine.lowIntensityUnit}</p>
                                <p><b>Rest time:</b> {routine.restTime} {routine.restTimeUnit}</p>
                                <br></br><br></br>
                                <p>Didn't do the work out? </p> <button onClick={()=>handleDeletingProgress(day)}>yes</button>
                            </div>
                            )
                        : null } 

                        {routine.selected==="Strength" ? (
                            <div className={styles.strengthSection}>
                                <p><b>Type of Workout:</b> {routine.selected}</p>
                                {routine.exercise && routine.exercise.map((exercise, each) =>(
                                    <div key={each}>
                                        <p><b>Exercise:</b> {exercise.name}</p>
                                        <p><b>Reps:</b> {exercise.reps}</p>
                                        <p><b>Sets:</b> {exercise.sets}</p>
                                    </div>

                                ))}
                                <br></br><br></br>
                                <p>Didn't do the work out? </p> <button onClick={()=>handleDeletingProgress(day)}>yes</button>
                            </div>
                        ) 
                        : null}

                        {routine.selected==="Yoga" || routine.selected==="Pilates" ? 
                        (
                            <div className={styles.yogaSection}>
                                <p><b>Type of workout:</b> {routine.selected}</p>
                                <p><b>Duration:</b> {routine.duration} {routine.durationUnit}</p>
                                <p><b>Notes:</b> {routine.notes}</p>
                                <br></br><br></br>
                                <p>Didn't do the work out?  </p> <button onClick={()=>handleDeletingProgress(day)}>yes</button>
                            </div>
                        ) 
                        : null}
                    </div>
                )
                :
                (
                    <div className={styles.boxes} key ={day}>
                        <h1>{typeof routine.activeDay === "string"? routine.activeDay.charAt(0).toUpperCase() + routine.activeDay.slice(1): ""}</h1>
                        {routine.selected === "Cycling" || routine.selected==="Walking" || routine.selected==="Running" || routine.selected==="Swimming" || routine.selected==="Elliptical" || routine.selected === "Treadmill" ? 
                            (<div className={styles.cardioSection}>
                                <p><b>Type of workout: </b>{routine.selected}</p>
                                <p><b>Duration: </b>{routine.duration} {routine.durationUnit}</p>
                                <p><b>Speed:</b> {routine.speed} {routine.speedUnit}</p>
                                <p><b>Distance:</b> {routine.distance} {routine.distanceUnit}</p>
                                <br></br><br></br>
                                <p>Did you do this workout this week?</p>  <button onClick={()=>handleAddingProgress(day)}>Yes</button>
                            </div>
                            ) 
                        : null }
                        {routine.selected==="HIIT" || routine.selected==="Cardio intervals" ? 
                            ( <div className={styles.intervalSection}>
                                <p><b>Type of Workout:</b> {routine.selected}</p>
                                <p><b>Exercise Per Round:</b> {routine.exercisePerRound}</p>
                                <p><b>Total Duration:</b> {routine.duration} {routine.durationUnit}</p>
                                <p><b>High Intensity time:</b> {routine.highIntensity} {routine.highIntensityUnit}</p>
                                <p><b>Low Intensiy time:</b> {routine.lowIntensity} {routine.lowIntensityUnit}</p>
                                <p><b>Rest time:</b> {routine.restTime} {routine.restTimeUnit}</p>
                                <br></br><br></br>
                                <p>Did you do this workout this week?</p>  <button onClick={()=>handleAddingProgress(day)}>Yes</button> 
                            </div>
                            )
                        : null } 

                        {routine.selected==="Strength" ? (
                            <div className={styles.strengthSection}>
                                <p><b>Type of Workout:</b> {routine.selected}</p>
                                {routine.exercise && routine.exercise.map((exercise, each) =>(
                                    <div key={each}>
                                        <p><b>Exercise:</b> {exercise.name}</p>
                                        <p><b>Reps:</b> {exercise.reps}</p>
                                        <p><b>Sets:</b> {exercise.sets}</p>
                                    </div>
                    
                                ))}
                                <br></br><br></br>
                                <p>Did you do this workout this week?</p> <button onClick={()=>handleAddingProgress(day)}>Yes</button> 
                            </div>
                        ) 
                        : null}

                        {routine.selected==="Yoga" || routine.selected==="Pilates" ? 
                        (
                            <div className={styles.yogaSection}>
                                <p><b>Type of workout:</b> {routine.selected}</p>
                                <p><b>Duration:</b> {routine.duration} {routine.durationUnit}</p>
                                <p><b>Notes:</b> {routine.notes}</p>
                                <br></br><br></br>
                                <p>Did you do this workout this week?</p> <button onClick={()=>handleAddingProgress(day)}>Yes</button>  
                            </div>
                        ) 
                        : null}
                    </div>
                )
            ))}

        </div>
        {(todayRoutine && (todayData && Object.keys(todayData).length > 0)) ? <ProgressRoutine todayData={todayData} setTodayRoutine={setTodayRoutine} currentDay={currentDay} totalDays={totalDays}  completeRoutine={completeRoutine} setCompleteRoutine={setCompleteRoutine} progress={progress} routineToday={routineToday} progressData={progressData} setProgressData={setProgressData} progressID={progressID} token={token}/> : null}
    </>      
    )
}

export default SummaryPage