import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './CalorieCalculator.css';
import { supabase } from '../supabaseClient'; // Added for auth check

const CalorieCalculator = () => {
  // Initialize state with empty strings for inputs
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    activity: 'not exercising'
  });
  const [result, setResult] = useState(null);
  const [mealSuggestion, setMealSuggestion] = useState(null);
  const navigate = useNavigate();
  
  // Function to handle printing
  const handlePrint = () => {
    window.print();
  };

  // Check if user is logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      }
    };
    checkSession();
  }, [navigate]);

  // Handle all input changes with a single function
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle radio button changes
  const handleGenderChange = (gender) => {
    setFormData({
      ...formData,
      gender
    });
  };

  const calculateCalories = () => {
    // Parse numeric values from form data
    const age = parseFloat(formData.age);
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    
    // Validate inputs
    if (isNaN(age) || isNaN(height) || isNaN(weight)) {
      alert('Please enter valid numbers for age, height, and weight');
      return;
    }

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (formData.gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Apply activity multiplier
    let activityMultiplier;
    switch (formData.activity) {
      case 'light exercise':
        activityMultiplier = 1.375;
        break;
      case 'moderate exercise':
        activityMultiplier = 1.55;
        break;
      case 'heavy exercise':
        activityMultiplier = 1.725;
        break;
      case 'athlete':
        activityMultiplier = 1.9;
        break;
      case 'not exercising':
      default:
        activityMultiplier = 1.2;
    }

    const maintenanceCalories = Math.round(bmr * activityMultiplier);
    const mildWeightLoss = Math.round(maintenanceCalories - 250);
    const weightLoss = Math.round(maintenanceCalories - 500);
    const extremeWeightLoss = Math.round(maintenanceCalories - 1000);

    setResult({
      maintenance: maintenanceCalories,
      mildWeightLoss,
      weightLoss,
      extremeWeightLoss,
    });
  };

  // Database of meals with nutritional information
  const mealDatabase = [
    {
      name: "Grilled Chicken with Spinach and Mozzarella",
      calories: 450,
      protein: 40,
      carbs: 10,
      fat: 25,
      category: "lunch",
      description: "Tender grilled chicken breast topped with fresh spinach and melted mozzarella cheese."
    },
    {
      name: "Balsamic Chicken with Roasted Vegetables",
      calories: 420,
      protein: 35,
      carbs: 25,
      fat: 18,
      category: "dinner",
      description: "Chicken breast marinated in balsamic vinegar, served with colorful roasted vegetables."
    },
    {
      name: "Tofu Scramble with Whole Wheat Toast",
      calories: 427,
      protein: 22,
      carbs: 45,
      fat: 18,
      category: "breakfast",
      description: "Savory tofu scramble with vegetables, served with a slice of whole wheat toast."
    },
    {
      name: "Cucumber-Tuna Salad Sandwich",
      calories: 540,
      protein: 30,
      carbs: 50,
      fat: 22,
      category: "lunch",
      description: "Fresh tuna salad with crunchy cucumber on whole grain bread."
    },
    {
      name: "Crispy Chicken Tacos",
      calories: 636,
      protein: 35,
      carbs: 60,
      fat: 28,
      category: "dinner",
      description: "Crispy chicken strips in soft taco shells with fresh toppings."
    },
    {
      name: "Parsley and Garlic Chicken with Broccoli",
      calories: 486,
      protein: 54,
      carbs: 15.7,
      fat: 19,
      category: "dinner",
      description: "Spanish-style chicken cutlets with parsley, garlic, and white wine, served with broccoli."
    },
    {
      name: "Greek Salad with Feta",
      calories: 320,
      protein: 12,
      carbs: 15,
      fat: 24,
      category: "lunch",
      description: "Traditional Greek salad with tomatoes, cucumber, olives, and feta cheese."
    },
    {
      name: "Veggie Lasagna Stuffed Portobello Mushrooms",
      calories: 350,
      protein: 18,
      carbs: 20,
      fat: 22,
      category: "dinner",
      description: "Large portobello mushroom caps filled with vegetable lasagna ingredients."
    },
    {
      name: "Low-Carb Broccoli Cheese Soup",
      calories: 280,
      protein: 15,
      carbs: 12,
      fat: 18,
      category: "lunch",
      description: "Creamy broccoli and cheese soup made with minimal carbs."
    },
    {
      name: "Caramelized Onion and Zucchini Frittata",
      calories: 310,
      protein: 20,
      carbs: 10,
      fat: 20,
      category: "breakfast",
      description: "Fluffy egg frittata with caramelized onions and zucchini."
    },
    {
      name: "Thai Beef Salad",
      calories: 380,
      protein: 30,
      carbs: 15,
      fat: 22,
      category: "lunch",
      description: "Spicy Thai-style beef salad with fresh herbs and vegetables."
    },
    {
      name: "Swedish Meatballs with Cauliflower Mash",
      calories: 450,
      protein: 35,
      carbs: 15,
      fat: 28,
      category: "dinner",
      description: "Classic Swedish meatballs served with low-carb cauliflower mash."
    },
    {
      name: "Shrimp Ceviche Stuffed Avocado",
      calories: 320,
      protein: 25,
      carbs: 12,
      fat: 20,
      category: "lunch",
      description: "Fresh shrimp ceviche served in avocado halves."
    },
    {
      name: "Greek Style Salmon with Avocado Tzatziki",
      calories: 480,
      protein: 40,
      carbs: 10,
      fat: 30,
      category: "dinner",
      description: "Grilled salmon with Greek seasonings and avocado tzatziki sauce."
    },
    {
      name: "Pesto Zucchini Noodles with Grilled Chicken",
      calories: 410,
      protein: 35,
      carbs: 15,
      fat: 24,
      category: "dinner",
      description: "Spiralized zucchini noodles with pesto sauce and grilled chicken breast."
    },
    {
      name: "Mexican Chicken Avocado Salad",
      calories: 390,
      protein: 30,
      carbs: 15,
      fat: 25,
      category: "lunch",
      description: "Spicy Mexican-style chicken salad with fresh avocado and vegetables."
    },
    {
      name: "Chicken Cacciatore with Spaghetti Squash",
      calories: 420,
      protein: 35,
      carbs: 20,
      fat: 22,
      category: "dinner",
      description: "Italian chicken cacciatore served over roasted spaghetti squash."
    },
    {
      name: "Buffalo Chicken Lettuce Wraps",
      calories: 350,
      protein: 30,
      carbs: 10,
      fat: 20,
      category: "lunch",
      description: "Spicy buffalo chicken wrapped in crisp lettuce leaves."
    },
    {
      name: "Eggplant Parmesan Boats",
      calories: 380,
      protein: 18,
      carbs: 25,
      fat: 22,
      category: "dinner",
      description: "Halved eggplants filled with tomato sauce and melted cheese."
    },
    {
      name: "Kale-Stuffed Portobello Mushrooms",
      calories: 320,
      protein: 15,
      carbs: 18,
      fat: 22,
      category: "dinner",
      description: "Large portobello mushrooms stuffed with sautéed kale and cheese."
    },
    {
      name: "Roasted Chili Frittata",
      calories: 340,
      protein: 22,
      carbs: 10,
      fat: 23,
      category: "breakfast",
      description: "Spicy egg frittata with roasted chilies and cheese."
    },
    {
      name: "Broccoli and Cheese Omelet",
      calories: 310,
      protein: 25,
      carbs: 8,
      fat: 20,
      category: "breakfast",
      description: "Fluffy omelet filled with broccoli and melted cheese."
    },
    {
      name: "Kale, Ricotta & Squash Omelette",
      calories: 330,
      protein: 20,
      carbs: 15,
      fat: 22,
      category: "breakfast",
      description: "Hearty omelette with kale, ricotta cheese, and butternut squash."
    },
    {
      name: "No Bean Turkey and Sweet Potato Chili",
      calories: 410,
      protein: 35,
      carbs: 30,
      fat: 15,
      category: "dinner",
      description: "Hearty turkey chili with sweet potatoes instead of beans."
    },
    {
      name: "Slow Cooker Jalapeno Popper Chicken Chili",
      calories: 430,
      protein: 40,
      carbs: 20,
      fat: 18,
      category: "dinner",
      description: "Spicy chicken chili with jalapeno popper flavors."
    },
    {
      name: "Low Carb Mu Shu Lettuce Wraps",
      calories: 320,
      protein: 28,
      carbs: 12,
      fat: 18,
      category: "lunch",
      description: "Asian-inspired mu shu filling wrapped in lettuce leaves."
    },
    {
      name: "Skinny Cheeseburger Salad",
      calories: 380,
      protein: 30,
      carbs: 15,
      fat: 22,
      category: "lunch",
      description: "All the flavors of a cheeseburger in a healthy salad form."
    },
    {
      name: "Crispy Fried Salmon with Spring Vegetable Broth",
      calories: 460,
      protein: 35,
      carbs: 15,
      fat: 28,
      category: "dinner",
      description: "Crispy-skinned salmon served with a light spring vegetable broth."
    },
    {
      name: "Shrimp Scampi over Zucchini Noodles",
      calories: 380,
      protein: 30,
      carbs: 15,
      fat: 20,
      category: "dinner",
      description: "Garlicky shrimp scampi served over spiralized zucchini noodles."
    },
    {
      name: "Southwestern Turkey Quinoa Stuffed Peppers",
      calories: 410,
      protein: 30,
      carbs: 35,
      fat: 15,
      category: "dinner",
      description: "Bell peppers stuffed with spicy turkey and quinoa mixture."
    },
    {
      name: "Tangy Chicken Salad",
      calories: 350,
      protein: 30,
      carbs: 10,
      fat: 20,
      category: "lunch",
      description: "Refreshing chicken salad with a tangy dressing."
    },
    {
      name: "Low-Carb Mexican Casserole",
      calories: 420,
      protein: 35,
      carbs: 15,
      fat: 25,
      category: "dinner",
      description: "Spicy Mexican-inspired casserole made with low-carb ingredients."
    },
    {
      name: "High-Protein Green Smoothie",
      calories: 280,
      protein: 20,
      carbs: 25,
      fat: 10,
      category: "breakfast",
      description: "Nutrient-packed green smoothie with added protein."
    },
    {
      name: "Avocado Egg Boats",
      calories: 320,
      protein: 15,
      carbs: 10,
      fat: 25,
      category: "breakfast",
      description: "Halved avocados filled with baked eggs."
    },
    {
      name: "Lemon Garlic Butter Shrimp with Asparagus",
      calories: 380,
      protein: 30,
      carbs: 12,
      fat: 22,
      category: "dinner",
      description: "Succulent shrimp in lemon garlic butter sauce with roasted asparagus."
    },
    {
      name: "Cauliflower Fried Rice",
      calories: 320,
      protein: 20,
      carbs: 15,
      fat: 18,
      category: "dinner",
      description: "Low-carb fried rice made with cauliflower instead of rice."
    },
    {
      name: "Spinach and Feta Stuffed Chicken Breast",
      calories: 420,
      protein: 45,
      carbs: 8,
      fat: 22,
      category: "dinner",
      description: "Chicken breast stuffed with spinach and feta cheese."
    },
    {
      name: "Taco Stuffed Bell Peppers",
      calories: 390,
      protein: 30,
      carbs: 20,
      fat: 20,
      category: "dinner",
      description: "Bell peppers filled with seasoned ground beef and taco toppings."
    },
    {
      name: "Coconut Flour Pancakes",
      calories: 310,
      protein: 15,
      carbs: 20,
      fat: 18,
      category: "breakfast",
      description: "Low-carb pancakes made with coconut flour."
    },
    {
      name: "Salmon and Asparagus Foil Packets",
      calories: 410,
      protein: 35,
      carbs: 10,
      fat: 25,
      category: "dinner",
      description: "Salmon and asparagus baked together in foil for easy cleanup."
    },
    {
      name: "Mediterranean Tuna Salad",
      calories: 350,
      protein: 30,
      carbs: 15,
      fat: 18,
      category: "lunch",
      description: "Tuna salad with Mediterranean flavors like olives and feta."
    },
    {
      name: "Zucchini Lasagna",
      calories: 420,
      protein: 35,
      carbs: 15,
      fat: 25,
      category: "dinner",
      description: "Lasagna made with zucchini slices instead of pasta."
    },
    {
      name: "Bacon and Egg Cups",
      calories: 340,
      protein: 25,
      carbs: 5,
      fat: 24,
      category: "breakfast",
      description: "Eggs baked in muffin tins with bacon and vegetables."
    },
    {
      name: "Grilled Steak Salad",
      calories: 450,
      protein: 40,
      carbs: 10,
      fat: 28,
      category: "lunch",
      description: "Grilled steak strips over fresh greens with vinaigrette."
    },
    {
      name: "Stuffed Cabbage Rolls",
      calories: 380,
      protein: 30,
      carbs: 20,
      fat: 18,
      category: "dinner",
      description: "Cabbage leaves stuffed with seasoned ground meat and rice."
    },
    {
      name: "Chia Seed Pudding",
      calories: 290,
      protein: 12,
      carbs: 25,
      fat: 15,
      category: "breakfast",
      description: "Creamy pudding made with chia seeds and almond milk."
    },
    {
      name: "Baked Cod with Lemon and Herbs",
      calories: 320,
      protein: 35,
      carbs: 5,
      fat: 15,
      category: "dinner",
      description: "Flaky cod fillets baked with fresh lemon and herbs."
    },
    {
      name: "Asian Chicken Lettuce Wraps",
      calories: 340,
      protein: 30,
      carbs: 15,
      fat: 16,
      category: "lunch",
      description: "Asian-spiced ground chicken served in lettuce cups."
    },
    {
      name: "Ratatouille",
      calories: 280,
      protein: 8,
      carbs: 30,
      fat: 15,
      category: "dinner",
      description: "Classic French vegetable stew with eggplant, zucchini, and tomatoes."
    },
    {
      name: "Protein Power Bowl",
      calories: 420,
      protein: 35,
      carbs: 30,
      fat: 18,
      category: "lunch",
      description: "Nutrient-dense bowl with quinoa, vegetables, and lean protein."
    }
  ];

  // Function to generate a meal suggestion based on calorie needs
  const generateMealSuggestion = (targetCalories) => {
    // Filter meals that are within a reasonable range of the target calories
    // For example, meals that are within 100 calories of the target
    const calorieRange = 100;
    const suitableMeals = mealDatabase.filter(meal => 
      Math.abs(meal.calories - targetCalories) <= calorieRange
    );
    
    // If no meals are within range, find the closest ones
    let mealsToChooseFrom = suitableMeals.length > 0 ? 
      suitableMeals : 
      [...mealDatabase].sort((a, b) => 
        Math.abs(a.calories - targetCalories) - Math.abs(b.calories - targetCalories)
      ).slice(0, 10); // Take the 10 closest matches
    
    // Randomly select a meal from the suitable options
    const randomIndex = Math.floor(Math.random() * mealsToChooseFrom.length);
    return mealsToChooseFrom[randomIndex];
  };

  // Function to handle regenerating a new meal suggestion
  const handleRegenerateMeal = () => {
    if (result) {
      // Generate a meal suggestion based on maintenance calories
      // We divide by 3 to suggest a single meal (assuming 3 meals per day)
      const mealCalories = Math.round(result.maintenance / 3);
      setMealSuggestion(generateMealSuggestion(mealCalories));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateCalories();
  };

  // Generate a meal suggestion when results are calculated
  useEffect(() => {
    if (result) {
      // Generate a meal suggestion based on maintenance calories
      // We divide by 3 to suggest a single meal (assuming 3 meals per day)
      const mealCalories = Math.round(result.maintenance / 3);
      setMealSuggestion(generateMealSuggestion(mealCalories));
    }
  }, [result]);

  return (
    <div className="calorie-calculator-container">
      <Navbar showProfile={true} />
      <div className="calorie-calculator-content">
        <h1 className="page-title">Calorie Calculator</h1>

        <div className="calculator-form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="age">AGE:</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                min="15"
                max="80"
                required
                placeholder="Enter your age"
              />
              <span className="input-hint">ages 15-80</span>
            </div>

            <div className="form-group">
              <label>GENDER:</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={() => handleGenderChange('male')}
                  />
                  <span>Male</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={() => handleGenderChange('female')}
                  />
                  <span>Female</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="height">HEIGHT:</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your height"
                />
                <span className="unit">cm</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="weight">WEIGHT:</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your weight"
                />
                <span className="unit">kg</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="activity">ACTIVITY:</label>
              <select
                id="activity"
                name="activity"
                value={formData.activity}
                onChange={handleInputChange}
              >
                <option value="not exercising">Not exercising</option>
                <option value="light exercise">Light exercise (1-2 days/week)</option>
                <option value="moderate exercise">Moderate exercise (3-5 days/week)</option>
                <option value="heavy exercise">Heavy exercise (6-7 days/week)</option>
                <option value="athlete">Athlete (2x per day)</option>
              </select>
            </div>

            <button type="submit" className="calculate-button">=</button>
          </form>

          {result && (
            <div className="result-section">
              <div className="result-header">
                <h2>Result</h2>
                <button className="print-button" onClick={handlePrint}>
                  <span className="print-icon">🖨️</span>
                </button>
              </div>

              <p className="result-description">
                The results show a number of daily calorie estimates that can be used as a guideline for how many calories to consume each day to maintain, lose, or gain weight at a chosen rate.
              </p>

              <div className="calorie-results">
                <div className="calorie-result-row">
                  <div className="calorie-label">Maintain weight</div>
                  <div className="calorie-value">
                    <span className="calorie-number">{result.maintenance}</span>
                    <span className="calorie-percentage">100%</span>
                    <span className="calorie-unit">Calories/day</span>
                  </div>
                </div>

                <div className="calorie-result-row">
                  <div className="calorie-label">
                    Mild weight loss
                    <div className="weight-rate">0.25 kg/week</div>
                  </div>
                  <div className="calorie-value">
                    <span className="calorie-number">{result.mildWeightLoss}</span>
                    <span className="calorie-percentage">90%</span>
                    <span className="calorie-unit">Calories/day</span>
                  </div>
                </div>

                <div className="calorie-result-row">
                  <div className="calorie-label">
                    Weight loss
                    <div className="weight-rate">0.5 kg/week</div>
                  </div>
                  <div className="calorie-value">
                    <span className="calorie-number">{result.weightLoss}</span>
                    <span className="calorie-percentage">79%</span>
                    <span className="calorie-unit">Calories/day</span>
                  </div>
                </div>

                <div className="calorie-result-row">
                  <div className="calorie-label">
                    Extreme weight loss
                    <div className="weight-rate">1 kg/week</div>
                  </div>
                  <div className="calorie-value">
                    <span className="calorie-number">{result.extremeWeightLoss}</span>
                    <span className="calorie-percentage">59%</span>
                    <span className="calorie-unit">Calories/day</span>
                  </div>
                </div>
              </div>

              <p className="result-warning">
                Please consult with a doctor when losing 1 kg or more per week since it requires that you consume less than the minimum recommendation of 1,500 calories a day.
              </p>

              {mealSuggestion && (
                <div className="meal-suggestion-section">
                  <div className="meal-suggestion-header">
                    <h3>Meal Suggestion</h3>
                    <button className="regenerate-button" onClick={handleRegenerateMeal}>
                      <span className="regenerate-icon">🔄</span> New Meal
                    </button>
                  </div>
                  
                  <div className="meal-card">
                    <h4 className="meal-name">{mealSuggestion.name}</h4>
                    <p className="meal-description">{mealSuggestion.description}</p>
                    
                    <div className="meal-nutrition">
                      <div className="nutrition-item">
                        <span className="nutrition-label">Calories</span>
                        <span className="nutrition-value">{mealSuggestion.calories}</span>
                      </div>
                      <div className="nutrition-item">
                        <span className="nutrition-label">Protein</span>
                        <span className="nutrition-value">{mealSuggestion.protein}g</span>
                      </div>
                      <div className="nutrition-item">
                        <span className="nutrition-label">Carbs</span>
                        <span className="nutrition-value">{mealSuggestion.carbs}g</span>
                      </div>
                      <div className="nutrition-item">
                        <span className="nutrition-label">Fat</span>
                        <span className="nutrition-value">{mealSuggestion.fat}g</span>
                      </div>
                    </div>
                    
                    <div className="meal-category">
                      <span className="category-tag">{mealSuggestion.category}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalorieCalculator;
