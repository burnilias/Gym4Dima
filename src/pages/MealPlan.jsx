import React, { useState, useEffect } from 'react';
// Add Arabic font for Moroccan mode
import './MealPlan.css'; // Ensure this is present for custom styles
import { supabase } from '../supabaseClient'; // Import Supabase client
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './MealPlan.css';

const moroccanDayMealsDarija = [
  // Petit Déjeuner (Breakfast)
  { type: "petit_dejeuner", name: "بيض مسلوق مع خبز داري", description: "بيض مسلوق مع خبز داري الكامل و زيت الزيتون.", calories: 250, ingredients: ["2 بيضات مسلوقتين", "40g خبز داري الكامل", "10ml زيت الزيتون"] },
  { type: "petit_dejeuner", name: "حرشة بالجبن السالم", description: "حرشة دافئة مع جبن سالم و كأس شاي بالنعناع.", calories: 320, ingredients: ["80g حرشة", "30g جبن سالم", "150ml أتاي بالنعناع"] },
  { type: "petit_dejeuner", name: "عصيدة الشوفان بالحليب الجودة", description: "شوفان مع حليب الجودة و قطع تفاح و قرفة.", calories: 280, ingredients: ["40g شوفان", "200ml حليب الجودة", "50g تفاح", "قرفة"] },
  { type: "petit_dejeuner", name: "بيض بالخليع", description: "بيضتين مخفوقتين مع 20g خليع و خبز داري.", calories: 270, ingredients: ["2 بيضات", "20g خليع", "30g خبز داري"] },
  { type: "petit_dejeuner", name: "زبادي بيرلي مع فواكه", description: "زبادي بيرلي مع موز و عسل و لوز.", calories: 260, ingredients: ["150g بيرلي", "1 موزة", "10g عسل", "10g لوز"] },
  { type: "petit_dejeuner", name: "أومليت بالخضر", description: "بيضتين مع سبانخ و طماطم و جبن سالم.", calories: 280, ingredients: ["2 بيضات", "30g سبانخ", "40g طماطم", "20g جبن سالم"] },
  { type: "petit_dejeuner", name: "كسكس الشعير بالحليب", description: "كسكس الشعير مع الحليب و زبيب.", calories: 300, ingredients: ["80g كسكس الشعير داري", "150ml حليب الجودة", "15g زبيب"] },
  { type: "petit_dejeuner", name: "خبز داري مع أفوكا و بيض", description: "خبز داري مع أفوكا مهروسة و بيضة مسلوقة.", calories: 310, ingredients: ["40g خبز داري", "50g أفوكا", "1 بيضة"] },
  { type: "petit_dejeuner", name: "عصير برتقال طبيعي و تمر", description: "عصير برتقال مع تمر و لوز.", calories: 220, ingredients: ["150ml عصير برتقال", "30g تمر", "10g لوز"] },
  { type: "petit_dejeuner", name: "شاي أخضر مع كعك الشعير", description: "شاي أخضر مع كعك الشعير و جبن بيرلي.", calories: 270, ingredients: ["120ml شاي أخضر", "30g كعك الشعير", "20g جبن بيرلي"] },


];

const MealPlan = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [calories, setCalories] = useState('');
  const [goal, setGoal] = useState('maintenance');
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [mealPlan, setMealPlan] = useState(null);
const [moroccanMode, setMoroccanMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle printing meal plan
  const handlePrintMealPlan = () => {
    window.print();
  };

  // Check if user is logged in using Supabase session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        navigate('/login');
      }
    };
    checkSession();
  }, [navigate]);

  const handleCaloriesChange = (e) => {
    setCalories(e.target.value);
  };

  const handleGoalChange = (e) => {
    setGoal(e.target.value);
  };

  const handleMealsPerDayChange = (e) => {
    setMealsPerDay(parseInt(e.target.value));
  };

  const handleNextStep = () => {
    if (step === 1 && calories) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  const generateMealPlan = () => {
    setIsLoading(true);
    
    // Calculate adjusted calories based on goal
    let adjustedCalories = parseInt(calories);
    if (goal === 'weight_loss') {
      adjustedCalories = Math.max(0, adjustedCalories - 500);
    } else if (goal === 'weight_gain') {
      adjustedCalories = adjustedCalories + 500;
    }
    // For maintenance, keep as entered
    // Calculate calories per meal
    const caloriesPerMeal = Math.round(adjustedCalories / mealsPerDay);
    
    // Sample meal options for different calorie ranges with detailed measurements
    const lowCalMeals = [
      { 
        name: "Salad with Grilled Chicken", 
        description: "Mixed greens with 100g grilled chicken, 50g cucumber, 50g cherry tomatoes, and 1 tablespoon light dressing.", 
        calories: 250,
        ingredients: [
          "100g grilled chicken breast",
          "50g mixed greens",
          "50g cucumber, sliced",
          "50g cherry tomatoes, halved",
          "1 tablespoon olive oil",
          "1 tablespoon lemon juice",
          "1/2 teaspoon dried herbs (thyme, oregano)"
        ]
      },
      { 
        name: "Lentil Soup", 
        description: "300ml lentil soup (made with 70g dry red lentils, 50g diced carrots, 50g diced celery, 50g diced onion, 1 clove garlic, 500ml vegetable broth, and spices). Served with 1 small slice (40g) whole grain bread.", 
        calories: 380,
        ingredients: [
          "70g dry red lentils",
          "50g carrots, diced",
          "50g celery, diced",
          "50g onion, diced",
          "1 clove garlic, minced",
          "500ml vegetable broth",
          "1/2 teaspoon cumin",
          "1/4 teaspoon turmeric",
          "1 small slice whole grain bread (40g)"
        ]
      },
      { 
        name: "Grilled Fish with Vegetables", 
        description: "120g grilled fish fillet (seasoned with 1/2 teaspoon olive oil, lemon juice, dill) with 100g steamed broccoli and 100g baked sweet potato.", 
        calories: 350,
        ingredients: [
          "120g fish fillet",
          "1/2 teaspoon olive oil",
          "1 teaspoon lemon juice",
          "1/4 teaspoon dried dill",
          "100g broccoli florets",
          "100g sweet potato",
          "Pinch of salt and pepper"
        ]
      },
      { 
        name: "Perly Yogurt with Berries", 
        description: "200g Perly yogurt (6g protein) with 100g mixed berries (strawberries, blueberries, raspberries) and 1 teaspoon of honey.", 
        calories: 250,
        ingredients: [
          "200g Perly yogurt (6g protein)",
          "100g mixed berries",
          "1 teaspoon honey"
        ]
      },
      { 
        name: "Central Laban with Fruit", 
        description: "200g Central laban (Moroccan buttermilk) with 1 tablespoon honey and 100g mixed fresh fruits (apple, banana, and orange slices).", 
        calories: 220,
        ingredients: [
          "200g Central laban",
          "1 tablespoon honey",
          "100g mixed fresh fruits"
        ]
      }
    ];
    
    const mediumCalMeals = [
      { 
        name: "Grilled Chicken with Quinoa and Jaouda Yogurt Sauce", 
        description: "150g grilled chicken breast seasoned with herbs, served with 100g cooked quinoa and 150g steamed vegetables (broccoli, carrots, and bell peppers). Topped with a sauce made from 50g Jaouda plain yogurt, lemon juice, and herbs.", 
        calories: 450,
        ingredients: [
          "150g chicken breast",
          "100g uncooked quinoa",
          "150g mixed vegetables (broccoli, carrots, bell peppers)",
          "50g Jaouda plain yogurt",
          "1 tablespoon lemon juice",
          "Herbs and spices to taste"
        ]
      },
      { 
        name: "Moroccan Breakfast Bowl with Perly and Central", 
        description: "100g Perly yogurt mixed with 100g Central laban, topped with 30g granola, 20g mixed nuts, 20g dried fruits, and 1 tablespoon honey.", 
        calories: 420,
        ingredients: [
          "100g Perly yogurt",
          "100g Central laban",
          "30g granola",
          "20g mixed nuts (almonds, walnuts)",
          "20g dried fruits (apricots, dates)",
          "1 tablespoon honey"
        ]
      },
      { 
        name: "Salim Cheese Vegetable Frittata", 
        description: "3 eggs whisked with 30ml Jaouda milk, mixed with 50g diced vegetables and 40g grated Salim cheese. Baked until golden and served with a side of fresh greens.", 
        calories: 400,
        ingredients: [
          "3 large eggs",
          "30ml Jaouda milk",
          "50g mixed vegetables (bell peppers, onions, tomatoes)",
          "40g Salim cheese, grated",
          "Fresh greens for side salad",
          "Pinch of salt and pepper"
        ]
      },
      { 
        name: "Tuna Wrap", 
        description: "85g tuna (canned in water, drained) mixed with 1 tablespoon light mayo and 1 teaspoon Dijon mustard. Wrapped in a whole wheat tortilla (40g) with 30g lettuce and 30g diced cucumber.", 
        calories: 420,
        ingredients: [
          "85g tuna (canned in water, drained)",
          "1 tablespoon light mayonnaise",
          "1 teaspoon Dijon mustard",
          "40g whole wheat tortilla",
          "30g lettuce, shredded",
          "30g cucumber, diced"
        ]
      },
      { 
        name: "Protein Smoothie", 
        description: "25g protein powder, 1 medium banana (100g), 200ml Jaouda milk, 5g chia seeds, and 3-4 ice cubes. Blend until smooth.", 
        calories: 250,
        ingredients: [
          "25g protein powder (vanilla or chocolate)",
          "1 medium banana (100g)",
          "200ml Jaouda milk",
          "5g chia seeds",
          "3-4 ice cubes"
        ]
      }
    ];
    
    const highCalMeals = [
      { 
        name: "Salmon with Sweet Potato and Jaouda Cream Sauce", 
        description: "200g baked salmon fillet with herbs and lemon, served with 200g roasted sweet potato and 150g asparagus. Topped with a rich sauce made from 50ml Jaouda cream, dill, and lemon zest.", 
        calories: 650,
        ingredients: [
          "200g salmon fillet",
          "200g sweet potato",
          "150g asparagus",
          "50ml Jaouda cream",
          "1 lemon, sliced",
          "Fresh herbs (dill, parsley)",
          "Salt and pepper to taste"
        ]
      },
      { 
        name: "Moroccan Protein Smoothie Bowl", 
        description: "300ml Jaouda milk blended with 1 banana, 30g protein powder, 100g Perly yogurt, 20g peanut butter, and ice. Topped with 15g granola, 10g chia seeds, and 10g sliced almonds.", 
        calories: 600,
        ingredients: [
          "300ml Jaouda milk",
          "1 medium banana",
          "30g protein powder",
          "100g Perly yogurt",
          "20g peanut butter",
          "15g granola",
          "10g chia seeds",
          "10g sliced almonds"
        ]
      },
      { 
        name: "Salim Cheese and Vegetable Stuffed Chicken", 
        description: "250g chicken breast stuffed with 50g Salim cheese, spinach, and sun-dried tomatoes. Served with 150g roasted vegetables and 100g brown rice cooked in Jaouda milk for extra creaminess.", 
        calories: 680,
        ingredients: [
          "250g chicken breast",
          "50g Salim cheese",
          "30g spinach",
          "20g sun-dried tomatoes",
          "150g mixed roasted vegetables",
          "100g brown rice",
          "100ml Jaouda milk (for cooking rice)",
          "Herbs and spices to taste"
        ]
      },
      { 
        name: "Central Laban Overnight Oats with Protein", 
        description: "80g oats soaked overnight in 200ml Central laban and 100ml Jaouda milk, mixed with 30g protein powder, 1 tablespoon honey, and 1 teaspoon cinnamon. Topped with 30g mixed nuts and 100g fresh berries.", 
        calories: 620,
        ingredients: [
          "80g rolled oats",
          "200ml Central laban",
          "100ml Jaouda milk",
          "30g protein powder",
          "1 tablespoon honey",
          "1 teaspoon cinnamon",
          "30g mixed nuts",
          "100g fresh berries"
        ]
      },
      { 
        name: "Steak with Potatoes", 
        description: "150g lean steak (sirloin or tenderloin) with 150g roasted potatoes (tossed with 1 teaspoon olive oil, rosemary, and garlic) and 100g steamed mixed vegetables (broccoli, carrots, cauliflower).", 
        calories: 650,
        ingredients: [
          "150g lean steak (sirloin or tenderloin)",
          "150g potatoes, cubed",
          "1 teaspoon olive oil",
          "1/2 teaspoon dried rosemary",
          "1 clove garlic, minced",
          "100g mixed vegetables (broccoli, carrots, cauliflower)",
          "1/2 teaspoon salt",
          "1/4 teaspoon black pepper"
        ]
      },
      { 
        name: "Pasta with Meat Sauce", 
        description: "80g dry whole grain pasta (cooked) with sauce made from 100g lean ground beef, 150g tomato sauce, 50g diced onions, 1 clove garlic, 50g diced bell peppers, and Italian herbs. Top with 15g grated parmesan.", 
        calories: 600,
        ingredients: [
          "80g dry whole grain pasta",
          "100g lean ground beef (90% lean)",
          "150g tomato sauce",
          "50g onions, diced",
          "1 clove garlic, minced",
          "50g bell peppers, diced",
          "1 teaspoon olive oil (for cooking)",
          "1 teaspoon dried Italian herbs",
          "15g grated parmesan cheese",
          "1/2 teaspoon salt",
          "1/4 teaspoon black pepper"
        ]
      },
      { 
        name: "Burrito Bowl", 
        description: "150g cooked brown rice, 100g black beans, 100g grilled chicken, 50g corn, 1/4 avocado (35g), 30g salsa, and 20g shredded cheese.",
        calories: 700,
        ingredients: [
          "150g cooked brown rice (50g dry)",
          "100g black beans (canned, drained)",
          "100g grilled chicken breast",
          "50g corn kernels",
          "1/4 avocado (35g), diced",
          "30g salsa",
          "20g shredded cheddar cheese",
          "1/2 teaspoon cumin",
          "1/4 teaspoon chili powder",
          "Juice of 1/4 lime",
          "Fresh cilantro (optional)"
        ]
      },
      { 
        name: "Protein Pancakes", 
        description: "Pancakes made with 50g oat flour, 25g protein powder, 1 whole egg, 100ml milk, 1/2 teaspoon baking powder. Topped with 1 medium banana (100g), 1 tablespoon peanut butter, and 1 teaspoon maple syrup.",
        calories: 580,
        ingredients: [
          "50g oat flour",
          "25g protein powder (vanilla)",
          "1 whole egg",
          "100ml milk (dairy or plant-based)",
          "1/2 teaspoon baking powder",
          "1 medium banana (100g), sliced",
          "1 tablespoon (15g) peanut butter",
          "1 teaspoon maple syrup",
          "1/4 teaspoon cinnamon"
        ]
      },
      { 
        name: "Chicken Stir Fry", 
        description: "120g chicken breast stir-fried with 200g mixed vegetables (bell peppers, broccoli, carrots, snap peas) in 1 tablespoon sesame oil and 1 tablespoon soy sauce. Served over 150g cooked brown rice.",
        calories: 620,
        ingredients: [
          "120g chicken breast, sliced",
          "50g bell peppers, sliced",
          "50g broccoli florets",
          "50g carrots, julienned",
          "50g snap peas",
          "1 tablespoon sesame oil",
          "1 tablespoon low-sodium soy sauce",
          "1 clove garlic, minced",
          "1 teaspoon grated ginger",
          "150g cooked brown rice (50g dry)",
          "1 teaspoon sesame seeds for garnish"
        ]
      }
    ];
    
    // New meal selection logic (prevents repetitions for variety)
    const allMealsMaster = [...lowCalMeals, ...mediumCalMeals, ...highCalMeals];
    const availableMeals = [...allMealsMaster]; // Create a copy to remove meals as they're selected
    const generatedMealPlan = [];
    let currentPlanCalories = 0;
    
    // Track used meal names to prevent duplicates
    const usedMealNames = new Set();

    for (let i = 0; i < mealsPerDay; i++) {
      const mealsRemainingInPlan = mealsPerDay - i;
      
      if (mealsRemainingInPlan <= 0) { // Stop if no more meals needed
        break; 
      }
      
      if (availableMeals.length === 0) { // Stop if available meal list is empty
        console.error("Error: Available meal list is empty. Cannot generate more unique meals.");
        break; 
      }

      const idealCaloriesForNextMeal = (adjustedCalories - currentPlanCalories) / mealsRemainingInPlan;

      let bestMatch = null;
      let bestMatchIndex = -1;
      let minDiff = Infinity;

      // Iterate over the available meals to find the best match
      for (let j = 0; j < availableMeals.length; j++) {
        const meal = availableMeals[j];
        
        // Skip this meal if we've already used it
        if (usedMealNames.has(meal.name)) {
          continue;
        }
        
        const diff = Math.abs(meal.calories - idealCaloriesForNextMeal);
        if (diff < minDiff) {
          minDiff = diff;
          bestMatch = meal;
          bestMatchIndex = j;
        } else if (diff === minDiff) {
          // Tie-breaking: if diff is same, prefer one that undershoots or is smaller
          if (bestMatch && meal.calories < bestMatch.calories) {
               bestMatch = meal;
               bestMatchIndex = j;
          }
        }
      }

      if (bestMatch) {
        // Add the meal to the plan
        generatedMealPlan.push({
          mealNumber: i + 1,
          ...bestMatch 
        });
        
        // Track this meal name as used
        usedMealNames.add(bestMatch.name);
        
        // Update total calories
        currentPlanCalories += bestMatch.calories;
        
        // If we're running out of unique meals, allow duplicates as a fallback
        if (usedMealNames.size >= allMealsMaster.length * 0.8) {
          console.log("Warning: Running low on unique meals. Some meals may be repeated.");
          usedMealNames.clear(); // Reset to allow some repetition if necessary
        }
      } else {
        // This case implies allMealsMaster was empty, which is checked above.
        // Or, if idealCaloriesForNextMeal is NaN/Infinity due to mealsRemainingInPlan being 0 (also checked).
        // This should ideally not be reached if allMealsMaster has meals.
        console.error("Error: Could not select a best match meal. Halting meal plan generation for this meal slot.");
        break; 
      }
    }
    // End of new meal selection logic.
    // currentPlanCalories now holds the total calories for the generatedMealPlan.
    // The `setTimeout` below will use `currentPlanCalories` as `totalCalories`.
    
    setTimeout(() => {
      setMealPlan({
        meals: generatedMealPlan,
        totalCalories: currentPlanCalories, // Use the sum of actual selected meals
        goal,
        mealsPerDay
      });
      setIsLoading(false);
      setStep(4);
    }, 1500); // Simulate loading time
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="meal-plan-step">
            <h2>Step 1: Enter Your Daily Calories</h2>
            <div className="input-container">
              <input
                type="number"
                value={calories}
                onChange={handleCaloriesChange}
                placeholder="Enter calories"
                min="1200"
                max="5000"
                required
              />
              <span className="input-suffix">calories</span>
            </div>
            <p className="input-hint">Enter your daily calorie needs (from 1200 to 5000)</p>
            <button 
              className="next-button" 
              onClick={handleNextStep}
              disabled={!calories}
            >
              Next
            </button>
          </div>
        );
      
      case 2:
        return (
          <div className="meal-plan-step">
            <h2>Step 2: Choose Your Goal</h2>
            <div className="goal-options">
              <div 
                className={`goal-option ${goal === 'weight_loss' ? 'selected' : ''}`}
                onClick={() => setGoal('weight_loss')}
              >
                <div className="goal-icon">↓</div>
                <h3>Weight Loss</h3>
                <p>500 calories deficit per day</p>
              </div>
              
              <div 
                className={`goal-option ${goal === 'maintenance' ? 'selected' : ''}`}
                onClick={() => setGoal('maintenance')}
              >
                <div className="goal-icon">⟷</div>
                <h3>Maintenance</h3>
                <p>Maintain current weight</p>
              </div>
              
              <div 
                className={`goal-option ${goal === 'weight_gain' ? 'selected' : ''}`}
                onClick={() => setGoal('weight_gain')}
              >
                <div className="goal-icon">↑</div>
                <h3>Weight Gain</h3>
                <p>500 calories surplus per day</p>
              </div>
            </div>
            <div className="button-group">
              <button className="back-button" onClick={handlePrevStep}>Back</button>
              <button className="next-button" onClick={handleNextStep}>Next</button>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="meal-plan-step">
            <h2>Step 3: Number of Meals Per Day</h2>
            <div className="meals-selector">
              <label htmlFor="meals-per-day">Select number of meals:</label>
              <select 
                id="meals-per-day" 
                value={mealsPerDay} 
                onChange={handleMealsPerDayChange}
              >
                <option value="2">2 meals</option>
                <option value="3">3 meals</option>
                <option value="4">4 meals</option>
                <option value="5">5 meals</option>
                <option value="6">6 meals</option>
              </select>
            </div>
            <div className="button-group">
              <button className="back-button" onClick={handlePrevStep}>Back</button>
              <button className="generate-button" onClick={generateMealPlan}>
                Generate Meal Plan
              </button>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className={`meal-plan-result${moroccanMode ? ' moroccan-mode' : ''}`}>
            <div className="meal-plan-header">
              <h2 style={moroccanMode ? {fontFamily: 'Amiri, Noto Naskh Arabic, serif', direction: 'rtl'} : {}}>
                {moroccanMode ? 'برنامج وجبات مغربية ليوم كامل' : 'Your Personalized Meal Plan'}
              </h2>
              <label className="switch">
                <input type="checkbox" checked={moroccanMode} onChange={() => setMoroccanMode(!moroccanMode)} />
                <span className="slider round">
                  <span className="switch-label left">🌍</span>
                  <span className="switch-label right">🇲🇦</span>
                </span>
              </label>
              <button className="print-button" onClick={handlePrintMealPlan}>
                <span className="print-icon">🖨️</span>
              </button>
            </div>
            <div className="meal-plan-summary">
              {moroccanMode ? (
                <>
                  <div className="summary-item">
                    <span className="summary-label">الهدف:</span>
                    <span className="summary-value">
                      {goal === 'weight_loss' ? 'نقصان الوزن' : goal === 'weight_gain' ? 'زيادة الوزن' : 'المحافظة على الوزن'}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">السعرات الكلية:</span>
                    <span className="summary-value">{mealPlan.totalCalories} سعرة</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">عدد الوجبات:</span>
                    <span className="summary-value">{mealsPerDay}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="summary-item">
                    <span className="summary-label">Goal:</span>
                    <span className="summary-value">
                      {goal === 'weight_loss' ? 'Weight Loss' : 
                       goal === 'weight_gain' ? 'Weight Gain' : 'Maintenance'}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Daily Calories:</span>
                    <span className="summary-value">{mealPlan.totalCalories} calories</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Meals Per Day:</span>
                    <span className="summary-value">{mealsPerDay}</span>
                  </div>
                </>
              )}
            </div>
            <div className="meals-container">
              {moroccanMode ? (() => {
  let displayedCount = 0;
  const maxMeals = mealsPerDay;
  const sections = [
    { type: 'petit_dejeuner', title: 'فطور الصباح' },
    { type: 'dejeuner', title: 'الغداء' },
    { type: 'dessert', title: 'التحلية' },
    { type: 'diner', title: 'العشاء' }
  ];
  return sections.map((section, sectionIdx) => {
    if (displayedCount >= maxMeals) return null;
    const meals = moroccanDayMealsDarija.filter(m => m.type === section.type);
    // Only show meals up to the remaining number needed
    const mealsToShow = meals.slice(0, maxMeals - displayedCount);
    if (!mealsToShow.length) return null;
    const sectionContent = (
      <div key={section.type} className="moroccan-meal-section">
        <h3 style={{fontFamily: 'Amiri, Noto Naskh Arabic, serif', color: '#f0c14b', fontWeight: 'bold', margin: 0, marginBottom: '1rem'}}>{section.title}</h3>
        {mealsToShow.map((meal, i) => (
          <div className="meal-card moroccan-card" key={i} style={{fontFamily: 'Amiri, Noto Naskh Arabic, serif', direction: 'rtl'}}>
            <div className="meal-header">
              <h3 style={{margin: 0, color: '#f0c14b'}}>{`وجبة ${displayedCount + i + 1}`}</h3>
              <span className="meal-calories">{meal.calories} سعرة</span>
            </div>
            <h4 className="meal-name">{meal.name}</h4>
            <p className="meal-description">{meal.description}</p>
            <div className="ingredients-list">
              <h5>المكونات:</h5>
              <ul>
                {meal.ingredients.map((ingredient, j) => (
                  <li key={j}>{ingredient}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    );
    displayedCount += mealsToShow.length;
    return sectionContent;
  });
})() : (
                mealPlan.meals.map((meal) => (
                  <div className="meal-card" key={meal.mealNumber}>
                    <div className="meal-header">
                      <h3>Meal {meal.mealNumber}</h3>
                      <span className="meal-calories">{meal.calories} calories</span>
                    </div>
                    <h4 className="meal-name">{meal.name}</h4>
                    <p className="meal-description">{meal.description}</p>
                    <div className="ingredients-list">
                      <h5>Ingredients:</h5>
                      <ul>
                        {meal.ingredients.map((ingredient, index) => (
                          <li key={index}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button className="restart-button" onClick={() => setStep(1)}>
              {moroccanMode ? 'إنشاء خطة جديدة' : 'Create New Meal Plan'}
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="meal-plan-container">
      <Navbar showProfile={true} />
      <div className="meal-plan-content">
        <h1 className="page-title">Meal Plan Generator</h1>
        
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Generating your personalized meal plan...</p>
          </div>
        ) : (
          renderStepContent()
        )}
      </div>
    </div>
  );
};

export default MealPlan;