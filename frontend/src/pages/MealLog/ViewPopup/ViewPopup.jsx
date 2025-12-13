import styles from "./ViewPopup.module.css"
import { useUser } from '../../../components/UserContext.jsx'

function ViewPopup({day, setShowView, setCheckOption}){
    const{ calculatorResults } = useUser();

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
                            <p>{meal.calories}</p>
                            <p>{meal.notes}</p>
                        </div>
                    </div>
                ))}
                <div className={styles.calories}>
                    <div className={styles.calorieOptions}>
                        <p><b>Total Calories</b></p>
                        <p><b>Calorie Goal</b></p>
                    </div>
                    <div className={styles.calorieNum}>
                        {(calculatorResults.dailyGoal - day.totalCalories) > 0 ?
                            <>
                                <p className={styles.good}>{day.totalCalories}</p>  
                                <p>{calculatorResults.dailyGoal}</p> 
                            </>
                        :   <>
                                <p className={styles.bad}>{day.totalCalories}</p>  
                                <p>{calculatorResults.dailyGoal}</p> 
                            </>}
                    </div>
                    <div className={styles.advice}>
                        {(calculatorResults.dailyGoal - day.totalCalories) > 0 ?
                            <div className={styles.adviceGreen}>
                                <p>You have stayed within your daily calorie limit!!</p>
                            </div>
                        :
                            <div className={styles.adviceRed}>
                                <p>You have passed your daily calorie limit </p>
                            </div>
                        }
                    </div>
                              
                </div>
            </div>
            
        </div>
    )
}

export default ViewPopup