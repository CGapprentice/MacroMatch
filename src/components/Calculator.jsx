// src/components/Calculator.jsx
import React, { useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { useSpotify } from './SpotifyIntegration';
import { useNavigate } from 'react-router-dom';

// Workout database (keep your existing database)
const workoutDatabase = {
  beginner: {
    none: [
      {name: "Walking", cardio: true, burn: 0.05, duration: "30-45"},
      {name: "Bodyweight Squats", strength: true, burn: 0.06, duration: "15-20"},
      {name: "Push-ups (Modified)", strength: true, burn: 0.05, duration: "10-15"},
      {name: "Basic Stretching", flexibility: true, burn: 0.025, duration: "15-20"}
    ],
    basic: [
      {name: "Light Dumbbell Circuit", strength: true, burn: 0.08, duration: "25-30"},
      {name: "Resistance Band Workout", strength: true, burn: 0.07, duration: "20-25"},
      {name: "Beginner HIIT", cardio: true, burn: 0.10, duration: "15-20"},
      {name: "Yoga Flow", flexibility: true, burn: 0.04, duration: "30"}
    ],
    home: [
      {name: "Beginner Strength Circuit", strength: true, burn: 0.09, duration: "30"},
      {name: "Treadmill Walk/Jog", cardio: true, burn: 0.08, duration: "25-30"},
      {name: "Basic Weight Training", strength: true, burn: 0.10, duration: "30-35"},
      {name: "Pilates", flexibility: true, burn: 0.05, duration: "30"}
    ],
    gym: [
      {name: "Machine Circuit Training", strength: true, burn: 0.11, duration: "35"},
      {name: "Elliptical/Bike", cardio: true, burn: 0.10, duration: "30"},
      {name: "Beginner Free Weights", strength: true, burn: 0.12, duration: "30-35"},
      {name: "Pool Walking", cardio: true, burn: 0.08, duration: "30"}
    ]
  },
  intermediate: {
    none: [
      {name: "Running", cardio: true, burn: 0.12, duration: "30"},
      {name: "Advanced Bodyweight", strength: true, burn: 0.10, duration: "25"},
      {name: "HIIT Bodyweight", cardio: true, burn: 0.15, duration: "25"},
      {name: "Vinyasa Yoga", flexibility: true, burn: 0.06, duration: "45"}
    ],
    basic: [
      {name: "Dumbbell Complex", strength: true, burn: 0.13, duration: "35"},
      {name: "Kettlebell Swings", strength: true, burn: 0.14, duration: "20"},
      {name: "Resistance HIIT", cardio: true, burn: 0.16, duration: "25"},
      {name: "Power Yoga", flexibility: true, burn: 0.08, duration: "45"}
    ],
    home: [
      {name: "Full Body Strength", strength: true, burn: 0.14, duration: "45"},
      {name: "Cardio Intervals", cardio: true, burn: 0.15, duration: "30"},
      {name: "Olympic Lift Variations", strength: true, burn: 0.16, duration: "40"},
      {name: "Advanced Pilates", flexibility: true, burn: 0.07, duration: "45"}
    ],
    gym: [
      {name: "Compound Movements", strength: true, burn: 0.15, duration: "45"},
      {name: "Cycling Classes", cardio: true, burn: 0.14, duration: "45"},
      {name: "Full Body Split", strength: true, burn: 0.16, duration: "60"},
      {name: "Swimming", cardio: true, burn: 0.13, duration: "45"}
    ]
  },
  advanced: {
    none: [
      {name: "Sprint Intervals", cardio: true, burn: 0.18, duration: "25"},
      {name: "Advanced Calisthenics", strength: true, burn: 0.16, duration: "45"},
      {name: "Plyometric Training", strength: true, burn: 0.17, duration: "30"},
      {name: "Intensive Yoga", flexibility: true, burn: 0.10, duration: "60"}
    ],
    basic: [
      {name: "Heavy Dumbbell Training", strength: true, burn: 0.17, duration: "45"},
      {name: "Kettlebell Complex", strength: true, burn: 0.18, duration: "35"},
      {name: "Advanced HIIT", cardio: true, burn: 0.20, duration: "30"},
      {name: "Ashtanga Yoga", flexibility: true, burn: 0.12, duration: "75"}
    ],
    home: [
      {name: "Powerlifting Session", strength: true, burn: 0.18, duration: "60"},
      {name: "Advanced Cardio", cardio: true, burn: 0.19, duration: "40"},
      {name: "Olympic Lifting", strength: true, burn: 0.20, duration: "60"},
      {name: "Advanced Stretching", flexibility: true, burn: 0.08, duration: "45"}
    ],
    gym: [
      {name: "Heavy Compound Lifts", strength: true, burn: 0.19, duration: "75"},
      {name: "High-Intensity Cardio", cardio: true, burn: 0.18, duration: "45"},
      {name: "Periodized Training", strength: true, burn: 0.20, duration: "90"},
      {name: "Competitive Swimming", cardio: true, burn: 0.16, duration: "60"}
    ]
  }
};

// Main Calculator Component
const Calculator = () => {
  const { user, saveUserData, loadUserData, loading, logout } = useUser();
  const { isConnected: spotifyConnected, generatePlaylist } = useSpotify();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: 'male',
    activity: '1.55',
    targetWeight: '',
    bodyFat: '',
    units: 'imperial',
    fitnessLevel: 'intermediate',
    equipment: 'home',
    timeAvailable: '30-45',
    primaryGoal: 'general',
    workoutType: 'mixed',
    dietType: 'balanced'
  });

  // Results state
  const [results, setResults] = useState({
    bmr: null,
    tdee: null,
    recommendedIntake: null,
    dailyGoal: null,
    macros: { protein: 30, carbs: 45, fats: 25 },
    macroGrams: { protein: 0, carbs: 0, fats: 0 },
    workouts: []
  });

  const [lastSaved, setLastSaved] = useState(null);

  // Load user data on component mount
  useEffect(() => {
    const loadSavedData = async () => {
      const savedData = await loadUserData();
      if (savedData && savedData.personalInfo) {
        setFormData(prev => ({
          ...prev,
          ...savedData.personalInfo
        }));
        if (savedData.lastCalculation) {
          setResults(prev => ({
            ...prev,
            ...savedData.lastCalculation
          }));
        }
      }
    };
    
    if (user) {
      loadSavedData();
    }
  }, [user]);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update placeholders based on units
  const getPlaceholder = (field) => {
    const isMetric = formData.units === 'metric';
    switch(field) {
      case 'weight':
        return isMetric ? '70 (kg)' : '154 (lbs)';
      case 'height':
        return isMetric ? '175 (cm)' : '69 (inches)';
      case 'targetWeight':
        return isMetric ? '65 (kg)' : '143 (lbs)';
      default:
        return '';
    }
  };

  // Calculate macros based on goals
  const calculateMacros = (calories, goal, dietType, bodyFat) => {
    let protein, carbs, fats;
    
    switch(dietType) {
      case 'high_protein':
        protein = 35; carbs = 35; fats = 30;
        break;
      case 'low_carb':
        protein = 30; carbs = 20; fats = 50;
        break;
      case 'low_fat':
        protein = 25; carbs = 60; fats = 15;
        break;
      default: // balanced
        if (goal === 'muscle_gain') {
          protein = 30; carbs = 45; fats = 25;
        } else if (goal === 'weight_loss') {
          protein = 35; carbs = 35; fats = 30;
        } else {
          protein = 25; carbs = 50; fats = 25;
        }
    }
    
    return { protein, carbs, fats };
  };

  // Get personalized workouts
  const getPersonalizedWorkouts = (level, equipment, goal, workoutType, timeAvailable, tdee) => {
    const workouts = workoutDatabase[level][equipment] || workoutDatabase[level]['none'];
    let filteredWorkouts = [];
    
    workouts.forEach(workout => {
      let matches = false;
      switch(workoutType) {
        case 'cardio':
          matches = workout.cardio;
          break;
        case 'strength':
          matches = workout.strength;
          break;
        case 'flexibility':
          matches = workout.flexibility;
          break;
        case 'mixed':
          matches = true;
          break;
      }
      if (matches) filteredWorkouts.push(workout);
    });
    
    if (filteredWorkouts.length === 0) {
      filteredWorkouts = workouts;
    }
    
    const timeMultiplier = timeAvailable === '15-30' ? 0.8 : 
                          timeAvailable === '60+' ? 1.3 : 1.0;
    
    return filteredWorkouts.slice(0, 4).map(workout => ({
      ...workout,
      estimatedBurn: Math.round(tdee * workout.burn * timeMultiplier),
      duration: workout.duration + ' min'
    }));
  };

  // Main calculation function
  const calculateCalories = async () => {
    const { weight: weightStr, height: heightStr, age: ageStr, gender, activity, targetWeight: targetWeightStr, bodyFat: bodyFatStr, units } = formData;
    
    const age = parseFloat(ageStr);
    let weight = parseFloat(weightStr);
    let height = parseFloat(heightStr);
    const targetWeight = parseFloat(targetWeightStr);
    const bodyFat = parseFloat(bodyFatStr);

    if (!age || !weight || !height) {
      alert('Please fill out Age, Height and Weight.');
      return;
    }

    // Convert imperial to metric if necessary
    if (units === 'imperial') {
      weight = weight * 0.45359237; // lbs -> kg
      height = height * 2.54;       // inches -> cm
    }

    // Calculate BMR using Mifflin-St Jeor equation
    let bmr = (10 * weight) + (6.25 * height) - (5 * age) + (gender === 'male' ? 5 : -161);
    
    // If body fat is provided, use Katch-McArdle formula for more accuracy
    if (bodyFat && !isNaN(bodyFat)) {
      const leanMass = weight * (1 - bodyFat / 100);
      bmr = 370 + (21.6 * leanMass);
    }

    // Calculate TDEE
    const tdee = bmr * parseFloat(activity);

    // Calculate recommended intake based on goal
    let recommended = Math.round(tdee);
    let dailyGoal = recommended;
    
    if (targetWeight && !isNaN(targetWeight)) {
      const weightDiff = targetWeight - weight;
      if (formData.primaryGoal === 'weight_loss' || weightDiff < 0) {
        dailyGoal = recommended - 500;
      } else if (formData.primaryGoal === 'muscle_gain' || weightDiff > 0) {
        dailyGoal = recommended + 300;
      }
    }

    // Calculate dynamic macros
    const macros = calculateMacros(dailyGoal, formData.primaryGoal, formData.dietType, bodyFat);
    
    // Calculate macro grams
    const proteinGrams = Math.round((dailyGoal * (macros.protein / 100)) / 4);
    const carbGrams = Math.round((dailyGoal * (macros.carbs / 100)) / 4);
    const fatGrams = Math.round((dailyGoal * (macros.fats / 100)) / 9);

    // Generate personalized workout plan
    const workouts = getPersonalizedWorkouts(
      formData.fitnessLevel, formData.equipment, formData.primaryGoal, 
      formData.workoutType, formData.timeAvailable, tdee
    );

    const newResults = {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      recommendedIntake: recommended,
      dailyGoal,
      macros,
      macroGrams: { protein: proteinGrams, carbs: carbGrams, fats: fatGrams },
      workouts
    };

    setResults(newResults);

    // Save to user profile
    const dataToSave = {
      personalInfo: formData,
      lastCalculation: newResults,
      calculatedAt: new Date().toISOString()
    };

    const saveResult = await saveUserData(dataToSave);
    if (saveResult.success) {
      setLastSaved(new Date());
    }
  };

  const formatKcal = (n) => {
    if (n === null || n === undefined || isNaN(n)) return '— kcal/day';
    return `${Math.round(n).toLocaleString()} kcal/day`;
  };

  const handleGeneratePlaylist = async () => {
  if (!spotifyConnected) {
    alert('Please connect your Spotify account first or configure Spotify credentials!');
    return;
  }
  
  try {
    const duration = parseInt(formData.timeAvailable.split('-')[0]);
    const playlist = await generatePlaylist(formData.workoutType, duration, formData.fitnessLevel);
    alert(`Created playlist: "${playlist.name}" 🎵\nOpen Spotify to listen!`);
  } catch (error) {
    if (error.message.includes('Spotify integration is not configured')) {
      alert('Spotify integration is not set up yet. Please configure Spotify credentials.');
    } else {
      alert('Failed to generate playlist. Please try again.');
    }
  }
};

  return (
    <div className="calculator-container">
      {/* Header */}
      <header className="calculator-header">
        <div className="header-content">
          <div className="header-title">MacroMatch</div>
          <div className="header-user">
            <span className="user-welcome">Welcome, {user?.name || user?.email}</span>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        </div>
      </header>

      <main className="calculator-main">
        {/* Title */}
        <div className="title-section">
          <h1 className="main-title">Enhanced Caloric Intake Calculator</h1>
          <p className="subtitle">Get personalized caloric recommendations, dynamic workout plans, and calculated macronutrient breakdowns.</p>
          {lastSaved && (
            <div className="save-status">✓ Last saved: {lastSaved.toLocaleTimeString()}</div>
          )}
        </div>

        {/* Form Card */}
        <div className="form-card">
          <h2 className="section-title">Basic Information</h2>
          <p className="section-subtitle">Enter your current metrics and goals.</p>

          <div className="form-grid">
            <div>
              <label className="form-label">Current Weight</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder={getPlaceholder('weight')}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Height</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                placeholder={getPlaceholder('height')}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                placeholder="30"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="form-label">Activity Level</label>
              <select
                name="activity"
                value={formData.activity}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="1.2">Sedentary</option>
                <option value="1.375">Light Activity</option>
                <option value="1.55">Moderate Activity</option>
                <option value="1.725">Very Active</option>
                <option value="1.9">Extremely Active</option>
              </select>
            </div>

            <div>
              <label className="form-label">Target Weight</label>
              <input
                type="number"
                name="targetWeight"
                value={formData.targetWeight}
                onChange={handleInputChange}
                placeholder={getPlaceholder('targetWeight')}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Body Fat % (optional)</label>
              <input
                type="number"
                name="bodyFat"
                value={formData.bodyFat}
                onChange={handleInputChange}
                placeholder="20"
                min="5"
                max="50"
                step="0.1"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Units</label>
              <select
                name="units"
                value={formData.units}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="imperial">Imperial (lbs / inches)</option>
                <option value="metric">Metric (kg / cm)</option>
              </select>
            </div>
          </div>

          {/* Fitness Preferences Section */}
          <div className="preferences-section">
            <h4 className="preferences-title">Fitness Preferences</h4>
            
            <div className="form-grid">
              <div>
                <label className="form-label">Fitness Level</label>
                <select
                  name="fitnessLevel"
                  value={formData.fitnessLevel}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="form-label">Available Equipment</label>
                <select
                  name="equipment"
                  value={formData.equipment}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="none">No Equipment</option>
                  <option value="basic">Basic (Dumbbells/Resistance Bands)</option>
                  <option value="home">Home Gym</option>
                  <option value="gym">Full Gym</option>
                </select>
              </div>

              <div>
                <label className="form-label">Workout Time Available</label>
                <select
                  name="timeAvailable"
                  value={formData.timeAvailable}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="15-30">15-30 minutes</option>
                  <option value="30-45">30-45 minutes</option>
                  <option value="45-60">45-60 minutes</option>
                  <option value="60+">60+ minutes</option>
                </select>
              </div>

              <div>
                <label className="form-label">Primary Goal</label>
                <select
                  name="primaryGoal"
                  value={formData.primaryGoal}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="endurance">Endurance</option>
                  <option value="general">General Fitness</option>
                </select>
              </div>

              <div>
                <label className="form-label">Preferred Workout Type</label>
                <select
                  name="workoutType"
                  value={formData.workoutType}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="cardio">Cardio Focus</option>
                  <option value="strength">Strength Focus</option>
                  <option value="mixed">Mixed Training</option>
                  <option value="flexibility">Flexibility Focus</option>
                </select>
              </div>

              <div>
                <label className="form-label">Dietary Preference</label>
                <select
                  name="dietType"
                  value={formData.dietType}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="balanced">Balanced</option>
                  <option value="low_carb">Low Carb</option>
                  <option value="high_protein">High Protein</option>
                  <option value="low_fat">Low Fat</option>
                </select>
              </div>
            </div>
          </div>

          <div className="button-container">
            <button
              onClick={calculateCalories}
              disabled={loading}
              className="calculate-button"
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Saving...
                </>
              ) : (
                'Calculate My Personalized Plan'
              )}
            </button>
          </div>
        </div>

        {/* Results Row */}
        <div className="results-grid">
          {/* Caloric Snapshot */}
          <div className="result-card">
            <h3 className="card-title">Your Caloric Snapshot</h3>
            <p className="card-subtitle">Personalized recommendations for your goals.</p>

            <div className="result-items">
              <div className="result-item">
                <span className="result-label">Basal Metabolic Rate (BMR)</span>
                <span className="result-value">{formatKcal(results.bmr)}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Total Daily Energy Expenditure</span>
                <span className="result-value">{formatKcal(results.tdee)}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Recommended Daily Intake</span>
                <span className="result-value">{formatKcal(results.recommendedIntake)}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Daily Caloric Goal</span>
                <span className={`result-goal ${
                  results.dailyGoal < results.recommendedIntake ? 'goal-loss' :
                  results.dailyGoal > results.recommendedIntake ? 'goal-gain' : ''
                }`}>
                  {formatKcal(results.dailyGoal)}
                </span>
              </div>
            </div>

            <p className="disclaimer">Calculations based on your personal metrics and goals. Consult a professional for personalized advice.</p>
          </div>

          {/* Workout Plan */}
          <div className="result-card workout-plan">
            <h3 className="card-title">Personalized Workout Plan</h3>
            <p className="card-subtitle">Customized exercises based on your preferences and goals.</p>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr className="table-header">
                    <th className="table-cell">Exercise</th>
                    <th className="table-cell">Duration</th>
                    <th className="table-cell">Estimated Burn</th>
                  </tr>
                </thead>
                <tbody>
                  {results.workouts.length > 0 ? (
                    results.workouts.map((workout, index) => (
                      <tr key={index} className="table-row">
                        <td className="table-cell">{workout.name}</td>
                        <td className="table-cell">{workout.duration}</td>
                        <td className="table-cell">{workout.estimatedBurn} kcal</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="table-empty">Complete the form to see your personalized workout plan</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="playlist-button">
              <button
                onClick={handleGeneratePlaylist}
                className="playlist-button-style"
              >
                {spotifyConnected ? (
                  <>🎵 Generate Workout Playlist</>
                ) : (
                  <>🎧 Connect Spotify to Generate Playlist</>
                )}
              </button>
              {spotifyConnected && (
                <div className="playlist-status">✓ Spotify connected</div>
              )}
            </div>
          </div>
        </div>

        {/* Macronutrient Breakdown */}
        <div className="result-card macro-breakdown">
          <h3 className="card-title">Dynamic Macronutrient Breakdown</h3>
          <p className="card-subtitle">Calculated distribution based on your goals and dietary preferences.</p>

          <div className="macro-container">
            {/* Placeholder for chart - replace with plain CSS styling if needed */}
            <div className="macro-chart">
              <div className="chart-center">
                <div className="macro-percent">{results.macros.carbs}% / {results.macros.protein}% / {results.macros.fats}%</div>
              </div>
            </div>

            <div className="macro-details">
              <div className="macro-legend">
                <div className="legend-item">
                  <div className="legend-color purple-800"></div>
                  <span>Proteins — <strong>{results.macros.protein}%</strong></span>
                </div>
                <div className="legend-item">
                  <div className="legend-color purple-600"></div>
                  <span>Carbohydrates — <strong>{results.macros.carbs}%</strong></span>
                </div>
                <div className="legend-item">
                  <div className="legend-color cyan-600"></div>
                  <span>Fats — <strong>{results.macros.fats}%</strong></span>
                </div>
              </div>

              <div className="macro-values">
                <div className="macro-value">
                  <div className="value-number">{results.macroGrams.protein}g</div>
                  <div className="value-label">Protein Daily</div>
                </div>
                <div className="macro-value">
                  <div className="value-number">{results.macroGrams.carbs}g</div>
                  <div className="value-label">Carbs Daily</div>
                </div>
                <div className="macro-value">
                  <div className="value-number">{results.macroGrams.fats}g</div>
                  <div className="value-label">Fats Daily</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="calculator-footer">
        <div className="footer-content">
          <div className="footer-links">
            <a href="#" className="footer-link">Product</a>
            <span>|</span>
            <a href="#" className="footer-link">Legal</a>
          </div>
          <div className="footer-social">
            <a href="#" className="social-link">f</a>
            <a href="#" className="social-link">t</a>
            <a href="#" className="social-link">ig</a>
            <a href="#" className="social-link">in</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Calculator;