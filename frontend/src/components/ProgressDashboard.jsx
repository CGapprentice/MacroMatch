// src/components/ProgressDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Activity, Target, Utensils } from 'lucide-react';
import styles from './ProgressDashboard.module.css';
import { useUser} from '../components/UserContext'

// --- MOCK DATA: REPLACE THIS WITH YOUR API CALL ---
// This is a placeholder for the data fetched from your group mate's meal log.
const mockMealLog = [
    // This is the data for today (Nov 9) - adjust date for testing
    { date: '2025-11-09', totalCalories: 1850, protein: 120, carbs: 200, fats: 70 },
    { date: '2025-11-08', totalCalories: 2200, protein: 140, carbs: 250, fats: 80 },
    // You'd typically fetch the log for the current date from your backend:
    // const today = new Date().toISOString().split('T')[0];
];
// ----------------------------------------------------

// Helper component for visual progress
const ProgressBar = ({ label, consumed, target, unit, color }) => {
    const percentage = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
    const isOver = consumed > target;
    const barColor = isOver ? '#d32f2f' : color; // Red if over target, otherwise the specified color

    return (
        <div className="progress-bar-container" style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '5px' }}>
                <span style={{ fontWeight: '600' }}>{label}</span>
                <span style={{ color: barColor, fontWeight: '600' }}>
                    {consumed}{unit} / {target}{unit}
                </span>
            </div>
            <div className="progress-bar-track" style={{ height: '10px', backgroundColor: 'var(--color-background-alt, #e0e0e0)', borderRadius: '5px', overflow: 'hidden' }}>
                <div 
                    className="progress-bar-fill" 
                    style={{ 
                        width: `${percentage}%`, 
                        height: '100%', 
                        backgroundColor: barColor, 
                        transition: 'width 0.5s ease-in-out' 
                    }}
                ></div>
            </div>
        </div>
    );
};

const ProgressDashboard = () => {
    const { user, macroResults} = useUser();
    const [todayLog, setTodayLog] = useState(null);
    /*useEffect(()=>{
        const today = new Date().toISOString().slice(0,10);
        if(macroResu)
    })**/
    const protein = macroResults?.protein;
    const fats = macroResults?.fats;
    const carbs = macroResults?.carbs;
    const calories = macroResults?.totalCalories;
    const today = new Date().toISOString().split('T')[0];

    // Get the targets calculated from Calculator.jsx
    const targets = user?.calculatorData.lastCalculation;
    let log = null;

    useEffect(() => {
        // Find today's log entry (or fetch it from your API)
        if(Array.isArray(macroResults)){
            log = macroResults.find(item => item.date === today); 
        }else if(macroResults && macroResults.date === today){
            log = macroResults;
        }

        setTodayLog(log || { calories: 0, protein: 0, carbs: 0, fats: 0 });
    }, []);

    if (!targets ) {
        return (
            <div style={{ padding: '20px', maxWidth: '800px', margin: '50px auto', textAlign: 'center' }}>
                <h2 style={{ color: 'var(--color-primary)' }}>Progress Dashboard</h2>
                <p>Please complete the **Calculator** first to set your daily calorie and macro targets.</p>
            </div>
        );
    }

    if (!todayLog ) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading progress...</div>;
    }

    // Assign targets
    const calorieTarget = targets.dailyGoal;
    const proteinTarget = targets.macroGrams.protein;
    const carbsTarget = targets.macroGrams.carbs;
    const fatsTarget = targets.macroGrams.fats;

    // Data for the progress bars
    const progressData = [
        { label: 'Calories', consumed: todayLog.totalCalories, target: calorieTarget, unit: 'kcal', color: 'var(--color-primary, #9c27b0)' },
        { label: 'Protein', consumed: todayLog.protein, target: proteinTarget, unit: 'g', color: '#4caf50' }, 
        { label: 'Carbs', consumed: todayLog.carbs, target: carbsTarget, unit: 'g', color: '#2196f3' }, 
        { label: 'Fats', consumed: todayLog.fats, target: fatsTarget, unit: 'g', color: '#ff9800' }
    ];

    const remainingCalories = Math.max(0, calorieTarget - todayLog.totalCalories);

    return (
        
        <main className={styles.dashboardPage}>
            {console.log(macroResults)}
            <h1 className={styles.dashboardTitle}>
                <Activity size={32} />
                Daily Progress Tracker
            </h1>
            
            <div className={styles.dashboardGrid}>
                
                {/* Summary Card */}
                <div className={`${styles.summaryCard} ${styles.card}`}>
                    <div className={styles.summaryHeader}>
                        <Utensils size={28} />
                        <h2>Today's Status</h2>
                    </div>

                    <div style={{ marginBottom: '25px', textAlign: 'center' }}>
                        <p className={`${styles.calorieCount} ${progressData[0].consumed > calorieTarget ? styles.overTarget : styles.underTarget}`}>
                            {Math.abs(calorieTarget - progressData[0].consumed)}
                        </p>
                        <p className={styles.calorieLabel}>
                            {progressData[0].consumed > calorieTarget ? 'Calories Over Target' : 'Calories Remaining'}
                        </p>
                    </div>

                    <div className={styles.goalInfo}>
                        <p style={{ margin: '0 0 5px 0' }}>
                            **Goal:** {targets.goal}
                        </p>
                        <p style={{ margin: '0' }}>
                            **TDEE:** {targets.tdee} kcal
                        </p>
                    </div>
                </div>

                {/* Progress Bars and Detailed View */}
                <div className={`${styles.progressBarsCard} ${styles.card}`}>
                    <div className={styles.progressHeader}>
                        <Target size={28} />
                        <h2>Macro Progress</h2>
                    </div>
                    
                    {progressData.map(data => (
                        <ProgressBar key={data.label} {...data} />
                    ))}

                    <p className={styles.progressNote}>
                        *Data based on your **Calculator** results and the group meal log.
                    </p>
                </div>
            </div>
        </main>
    );
};

export default ProgressDashboard;