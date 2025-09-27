// src/services/api.js - Development version with mocking
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    // In development, simulate API calls with localStorage
    if (IS_DEVELOPMENT) {
      return this.mockRequest(endpoint, options);
    }

    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Mock API calls for development
  mockRequest(endpoint, options) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          console.log('Mock API call:', endpoint, options);
          
          if (endpoint.includes('/calculator-data') && options.method === 'POST') {
            // Mock save calculator data
            const data = JSON.parse(options.body);
            localStorage.setItem(`calculator_data_${endpoint.split('/')[2]}`, JSON.stringify(data));
            resolve({ success: true, data });
          } else if (endpoint.includes('/calculator-data') && !options.method) {
            // Mock get calculator data
            const userId = endpoint.split('/')[2];
            const data = localStorage.getItem(`calculator_data_${userId}`);
            resolve(data ? JSON.parse(data) : null);
          } else if (options.method === 'PUT') {
            // Mock update profile
            resolve({ success: true });
          } else {
            resolve({ success: true });
          }
        } catch (error) {
          reject(error);
        }
      }, 500); // Simulate network delay
    });
  }

  // User-related API calls
  async saveUserCalculatorData(userId, data, token) {
    return this.request(`/users/${userId}/calculator-data`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  async getUserCalculatorData(userId, token) {
    return this.request(`/users/${userId}/calculator-data`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async updateUserProfile(userId, profileData, token) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
  }
}

export default new ApiService();