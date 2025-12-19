import styles from './MealHistory.module.css'
import MealLog from '../MealLog/MealLog.jsx'
import { useNavigate } from "react-router-dom"
import { useState, useEffect} from 'react'
import ViewPopup from "./ViewPopup/ViewPopup.jsx"
import { useUser } from '../../components/UserContext.jsx'
import { API_BASE_URL} from '../../firebase.js'

function MealHistory({dayMeal, setDayMeal, totalCarbs, totalFats, totalProtein}){
    //const API_BASE_URL = 'http://localhost:5000'
    const[checkOption, setCheckOption] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('firebase_token');
    const[showView, setShowView] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    let { calculatorResults } = useUser();
    // If calculatorResults is missing, default to empty object
    if (!calculatorResults) {
        calculatorResults = { dailyGoal: '', macroGrams: { protein: '', carbs: '', fats: '' }, tdee: '', goal: '' };
    }
    const mealOrder = ["Breakfast", "Lunch", "Dinner", "Snack"];

    const handleView = (day) =>{
        setSelectedDate(day);
        setShowView(true);
    }
    dayMeal.sort((a,b) => mealOrder.indexOf(a.mealType) - mealOrder.indexOf(b.mealType));

    const handleDelete = async(day) =>{
        const date = dayMeal.find(meal => meal.date === day);
        let check = true;
        if(date){
            for (const meal of date.newMeal){
                if(!meal.id){
                    console.log("There's no id for ", meal);
                    check = false;
                    break;
                }
                try{
                    const response = await fetch(`${API_BASE_URL}/api/v1/meals/${meal.id}`,{
                        method: 'DELETE',
                        headers:{
                            'Content-type' : 'application/json',
                            Authorization: `Bearer ${token}`
                        }
                    });
                    if(response.status === 401){
                        localStorage.removeItem("firebase_token")
                        navigate('/login')
                        check = false;
                        return
                    }
                    if(response.ok){
                        console.log("Successfully deleted meal: ", meal);
                    }else{
                        console.log("Connected to backend but couldn't delete meal: " , meal);
                        check = false;
                        break;
                    }
                }catch(error){
                    console.log("Failed to delete: ", error);
                    check = false;
                    break;
                }
            }
        }
        {check && setDayMeal(prevDay => prevDay.filter(date => date.date !== day));}

    }
  

    return(
        <>
            <div className={styles.mealLogHistory}>
                <div className={styles.historyTitle}>
                    <h1>Meal Log History </h1>
                </div>
                <>
                    <div className={styles.mealHistory}>
                        {dayMeal.map ((day,index)=> (
                            <div key={day.date} className={styles.eachDay}>
                                <h3>{day.date}</h3>
                                <div className={styles.meals}>
                                    {day.newMeal.map(meal=>(
                                        <div key={meal.id}>
                                            <p><b>{meal.mealType}</b></p>
                                            <p>{meal.meal}</p>
                                            <p>{meal.calories !== null ? Math.round(meal.calories) : ""}</p>                                   
                                        </div>
                                        
                                    ))}
                                </div>
                                <div className={styles.options}>
                                    <div className={styles.calories}>
                                        {calculatorResults.dailyGoal === "" ?
                                            <div className={styles.justTotalCal}>
                                                <p><b>Total Calories</b></p>
                                                <p>{day.totalCalories !== null ? Math.round(day.totalCalories) : ""}</p>
                                            </div>
                                        :calculatorResults.dailyGoal >= day.totalCalories ?
                                            <div className={styles.entire}>
                                                <div className={styles.withinGoal}>
                                                    <p><b>Total Calories</b></p>
                                                    <p className={styles.changegreen}>{day.totalCalories !== null ? Math.round(day.totalCalories) : ""}</p>
                                                </div>
                                                <div className={styles.withinGoalCal}>
                                                    {calculatorResults.dailyGoal?<p><b>Goal: </b></p> : null }
                                                    <p>{calculatorResults.dailyGoal}</p>
                                                </div>

                                            </div>
                                        :
                                            <div className={styles.outOfGoal}>
                                                <p><b>Total Calories</b></p>
                                                <p className={styles.changered}>{day.totalCalories}</p>
                                                {calculatorResults.dailyGoal?<p><b>Goal: </b></p> : null }
                                                <p>{calculatorResults.dailyGoal}</p>
                                            </div>
                                        }
                                            <div style={{position: "relative", display: "inline-block"}}>
                                                <button onClick={() => setCheckOption(checkOption === index ? null : index)}><img src='../../public/mealLogOption.png'/> </button>
                                                {checkOption === index && (
                                                    <div className={styles.optionBox}>
                                                        <button onClick={() => handleView(day)}>View</button>
                                                        <button onClick={()=> handleDelete(day.date)}>Delete</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>  
                        ))}
                        
                    </div>
                </>
            
             </div>
             {showView && selectedDate ? <ViewPopup day={selectedDate} setShowView={setShowView} setCheckOption={setCheckOption} totalCarbs={totalCarbs} totalProtein={totalProtein} totalFats={totalFats}/> : null}
        </>
    )
}

export default MealHistory