import styles from "./ViewPopup.module.css"
import { useUser } from '../../../components/UserContext.jsx'
import { number } from "framer-motion";

function ViewPopup({day, setShowView, setCheckOption, totalFats, totalCarbs, totalProtein}){
    let { calculatorResults } = useUser();
    
    if (!calculatorResults) {
        calculatorResults = { dailyGoal: '', macroGrams: { protein: '', carbs: '', fats: '' }, tdee: '', goal: '' };
    }
    

    const handleClose = () =>{
        setShowView(false);
        setCheckOption(false);
    }
    return(
        <div className={styles.background}>
            <div className={styles.boxPopup}>
                <div className={styles.topPopup}>
                    <h1>Meals for {day.date}</h1>
                    <button className={styles.exitbutton} onClick={handleClose}>X</button>
                    
                </div>
                {day.newMeal.map(meal =>(
                    <div key={meal.id} className={styles.meals}>
                        <div className={styles.header}>
                            <h3>{meal.mealType}</h3> <p>at {meal.time}</p>
                        </div>
                        <div>
                            <p>{meal.meal}</p>
                            <p> Calories: {meal.calories !== null ? Math.round(meal.calories) : ""}</p>
                            <p>Note: <br></br>{meal.notes}</p>
                            <p>Fats: {meal.fats !== null ? Math.round(meal.fats):""}</p>
                            <p>Protein: {meal.protein !== null ? Math.round(meal.protein) :""}</p>
                            <p>Carbs: {meal.carbs !== null ? Math.round(meal.carbs):""}</p>
                        </div>
                    </div>
                ))}
                
                <div className={styles.calorieOptions}>
                        <div className={styles.caloriesView}>
                            <p><b>Total Calories</b></p>
                            
                            {calculatorResults.dailyGoal==="" ?
                            <p>{day.totalCalories !== null ? Math.round(day.totalCalories) : ""}</p>
                            :
                                ((calculatorResults.dailyGoal - day.totalCalories) > 0) ? <p className={styles.green}>{day.totalCalories !== null ? Math.round(day.totalCalories) : ""}</p> 
                            : <p className={styles.red}>{day.totalCalories !== null ? Math.round(day.totalCalories) : ""}</p>}
                        </div>

                        <div className={styles.calorieGoalview}>
                            {calculatorResults.dailyGoal==='' ? null : <p><b>Calorie Goal</b></p>}
                            <p>{calculatorResults.dailyGoal}</p>    
                        </div>
                        
                        
                        <div className={styles.carbsview}>
                            <p><b>Total carbs</b></p>
                            {/*<p>{totalCarbs !== null ? Math.round(totalCarbs): ''}</p>*/}
                            {Math.round(day.newMeal.reduce((sum,meal)=>sum + Number(meal.carbs),0))}
                        </div>
                        <div className={styles.fatsview}>
                            <p><b>Total fats</b></p>
                            {/*<p>{totalFats !== null ? Math.round(totalFats):""}</p>*/}
                            {Math.round(day.newMeal.reduce((sum,meal)=>sum + Number(meal.fats),0))}
                        </div>
                        <div className={styles.fatsview}>
                            <p><b>Total protein</b></p>
                            {/*<p>{totalProtein !== null ? Math.round(totalProtein):""}</p>*/}
                            {Math.round(day.newMeal.reduce((sum,meal)=>sum + Number(meal.protein),0))}
                        </div>

                    </div>
                <div className={styles.calories}>
                    
                    <div className={styles.advice}>
                        {calculatorResults.dailyGoal ==="" ? 
                            null
                        :
                        (calculatorResults.dailyGoal - day.totalCalories) > 0 ?
                            <div className={styles.adviceGreen}>
                                <p>You have stayed within your daily calorie limit!!</p>
                            </div>
                        :
                        (calculatorResults.dailyGoal - day.totalCalories) < 0 ?
                            <div className={styles.adviceRed}>
                                <p>You have passed your daily calorie limit </p>
                            </div>
                        : null}
                    </div>
                              
                </div>
            </div>
            
        </div>
    )
}

export default ViewPopup