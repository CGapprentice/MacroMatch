import express from 'express';
// Use the new standard way to handle module paths in ES Modules
import path from 'path'; 
// import UserData from '../models/UserData.js'; // You may need this later

const router = express.Router();

// 1. GET route to load user data by ID
// This matches the URL /api/calculator/load/TEST_USER_FIREBASE_UID_1
router.get('/load/:userId', async (req, res) => {
    const { userId } = req.params;
    console.log(`[MongoDB] Attempting to load data for user: ${userId}`);

    try {
        // --- Placeholder for REAL MongoDB Logic ---
        /* const user = await UserData.findOne({ userId });

        if (user && user.calculatorData) {
            return res.status(200).json({ success: true, data: user.calculatorData });
        }
        */
        
        // --- MOCK SUCCESS RESPONSE (No data found, but request succeeded) ---
        // Sending a 200 OK and null data fixes the frontend error (404).
        return res.status(200).json({ 
            success: true, 
            data: null, 
            message: 'User data not found in DB (initial load).' 
        });

    } catch (error) {
        console.error(`[MongoDB] Error loading data for ${userId}:`, error);
        return res.status(500).json({ success: false, message: 'Server error during load.' });
    }
});

// 🚨 NEW: POST route to save user data by ID
// This handles the URL /api/calculator/save/TEST_USER_FIREBASE_UID_1
router.post('/save/:userId', async (req, res) => {
    const { userId } = req.params;
    const calculatorData = req.body; // The data sent from the frontend is in the request body

    console.log(`[MongoDB] Attempting to save data for user: ${userId}`);
    // console.log('Data received:', calculatorData); // You can uncomment this to see the data

    try {
        // --- Placeholder for REAL MongoDB Logic (Creating or Updating the document) ---
        /*
        await UserData.findOneAndUpdate(
            { userId }, // Find by the unique userId
            { $set: { calculatorData, lastUpdated: new Date() } }, // Set the new data
            { upsert: true, new: true } // Creates the document if it doesn't exist (upsert)
        );
        */
        
        // --- MOCK SUCCESS RESPONSE ---
        // Sending a 200 OK and success: true will fix the frontend error.
        return res.status(200).json({ 
            success: true, 
            message: 'Calculator data saved (Mock response).',
            data: calculatorData // Optional: Echo back the saved data
        });

    } catch (error) {
        console.error(`[MongoDB] Error saving data for ${userId}:`, error);
        return res.status(500).json({ success: false, message: 'Server error during save.' });
    }
});

// 🚨 CRITICAL: Use export default for ES Modules
export default router;