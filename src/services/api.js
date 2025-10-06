// src/services/api.js
const ApiService = {
  saveUserCalculatorData: async (userId, calculatorData, token) => {
    console.log('Mock saveUserCalculatorData:', { userId, calculatorData, token });
    return { success: true }; // Mock success
  },
  getUserCalculatorData: async (userId, token) => {
    console.log('Mock getUserCalculatorData:', { userId, token });
    return null; // Mock no data
  },
  updateUserProfile: async (userId, profileData, token) => {
    console.log('Mock updateUserProfile:', { userId, profileData, token });
    return { success: true }; // Mock success
  }
};

export default ApiService;