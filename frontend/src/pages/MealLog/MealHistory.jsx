import styles from './MealHistory.module.css'
import MealLog from '../MealLog/MealLog.jsx'
import { useNavigate } from "react-router-dom"
import { useState, useEffect} from 'react'


function MealHistory({dayMeal, totalCalories}){
    /*const navigate = useNavigate();
    const[errorMessage, setErrorMessage] = useState('');
    useEffect(()=>{
        const getMealLogHistory = async () =>{
            try{
                const result = await fetch('http://localhost:5000/api/v1/meals/',{
                    method: 'GET',
                    headers:{
                        'Content-Type' : 'applicatoin/json',
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
                    
                    const groupByDate = response.reduce((acc, obj)=>{
                        const key = obj.date;
                        if(!acc[key]){
                            acc[key] =[];
                        }
                        acc[key].push(obj);
                        return acc;
                    },{});

                    const sortedData = groupByDate.sort((a,b) => b.date - a.date);
                    const groupDates = Object.entries(sortedData).map(([date,meal])=>({
                        date,
                        newMeal: meal
                    }));
                    setDayMeal(groupDates);


                }
            }catch(error){
                console.error('Getting User History Meals error: ', error);
                setErrorMessage(error);
            }; getMealLogHistory();
        }
    })*/
    return(
        <>
            <div className={styles.mealLogHistory}>
                <div className={styles.historyTitle}>
                    <h1>Meal Log History</h1>
                </div>
                <>
                    <div className={styles.mealHistory}>
                        {dayMeal.map (day => (
                            <div key={day.date} className={styles.eachDay}>
                                <h3>{day.date}</h3>
                                <div className={styles.meals}>
                                    {day.newMeal.map(meal=>(
                                        <div key={meal.meal}>
                                            <p><b>{meal.mealType}</b></p>
                                            <p>{meal.meal}</p>
                                            <p>{meal.calories}</p>                                  
                                        </div>
                                        
                                    ))}
                                </div>
                                
                                <div className={styles.options}>
                                    <div className={styles.calories}>
                                        <p><b>Total Calories</b></p>
                                        <p>{totalCalories}</p>
                                    </div>
                                    <button><img src='../../public/mealLogOption.png'/> </button>
                                </div>
                            </div>  
                        ))}
                        
                    </div>
                </>
            
             </div>
        </>
    )
}

export default MealHistory