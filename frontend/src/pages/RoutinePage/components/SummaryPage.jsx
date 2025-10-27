import {useState} from 'react'
import RoutinePage from '../RoutinePage.jsx'
import styles from "./SummaryPage.module.css"
import { get } from 'react-hook-form';

function SummaryPage({data,setRoutineSummary}){
    console.log(data);
    
 
    const days = data;

   
    return(
        <>
        <div className={styles.editButton}>
            <button onClick={()=> setRoutineSummary(false)}>Edit</button>
        </div>
        <div className={styles.summaryPage}>
            
            {days && Object.entries(days).map(([day, routine])=>(
                <div className={styles.boxes} key={day}>
                    <h1>{typeof routine.activeDay === "string"? routine.activeDay.charAt(0).toUpperCase() + routine.activeDay.slice(1): ""}</h1>
                    {routine.selected === "Cycling" || routine.selected==="Walking" || routine.selected==="Running" || routine.selected==="Swimming" || routine.selected==="Elliptical" || routine.selected === "Treadmill" ? 
                    (<div className={styles.cardioSection}>
                        <p><b>Type of workout: </b>{routine.selected}</p>
                        <p><b>Duration: </b>{routine.duration}</p>
                        <p><b>Speed:</b> {routine.speed}</p>
                        <p><b>Distance:</b> {routine.distance}</p>
                    </div>
                    ) 
                    : null }
                   {routine.selected==="HIIT" || routine.selected==="Cardio intervals" ? 
                    ( <div className={styles.intervalSection}>
                        <p><b>Type of Workout:</b> {routine.selected}</p>
                        <p><b>Exercise Per Round:</b> {routine.exercisePerRound}</p>
                        <p><b>Total Duration:</b> {routine.duration}</p>
                        <p><b>High Intensity time:</b> {routine.highIntensity}</p>
                        <p><b>Low Intensiy time:</b> {routine.lowIntensity}</p>
                        <p><b>Rest time:</b> {routine.restTime}</p>

                    </div>
                    ): null } 

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
                        </div>
                    ) : null}

                    {routine.selected==="Yoga" || routine.selected==="Pilates" ? 
                    (
                        <div className={styles.yogaSection}>
                            <p><b>Type of workout:</b> {routine.selected}</p>
                            <p><b>Duration:</b> {routine.duration}</p>
                            <p><b>Notes:</b> {routine.notes}</p>
                        </div>
                    ) : null} 
                
                </div>
            ))}

        </div>
    </>      
    )
}

export default SummaryPage