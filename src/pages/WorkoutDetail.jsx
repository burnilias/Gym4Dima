import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './WorkoutDetail.css';
import { supabase } from '../supabaseClient';

const WorkoutDetail = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [language, setLanguage] = useState('english');
  const [exercises, setExercises] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in and get language preference
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      }
    };
    checkSession();

    // Get saved language preference
    const savedLanguage = localStorage.getItem('language') || 'english';
    setLanguage(savedLanguage);

    // Listen for language change events
    const handleLanguageChange = (event) => {
      setLanguage(event.detail.language);
    };

    window.addEventListener('languageChange', handleLanguageChange);

    return () => {
      window.removeEventListener('languageChange', handleLanguageChange);
    };
  }, [navigate]);

  // Fetch exercises from Supabase database
  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        // Fetch exercises from the database
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .eq('category', type);
          
        if (error) {
          console.error('Error fetching exercises:', error);
          setExercises({ all: [] });
        } else if (data && data.length > 0) {
          // Format the data to match our application structure
          const formattedData = {
            all: data.map(exercise => ({
              id: exercise.id,
              thumbnail: exercise.thumbnail_url,
              title: exercise.title,
              targetMuscles: exercise.target_muscles,
              instructions: exercise.instructions || []
            }))
          };
          
          // Add body part filters for back exercises
          if (type === 'back') {
            if (data.some(ex => ex.body_part === 'upper_back')) {
              formattedData.upper = data
                .filter(ex => ex.body_part === 'upper_back')
                .map(exercise => ({
                  id: exercise.id,
                  thumbnail: exercise.thumbnail_url,
                  title: exercise.title,
                  targetMuscles: exercise.target_muscles,
                  instructions: exercise.instructions || []
                }));
            }
            
            if (data.some(ex => ex.body_part === 'lower_back')) {
              formattedData.lower = data
                .filter(ex => ex.body_part === 'lower_back')
                .map(exercise => ({
                  id: exercise.id,
                  thumbnail: exercise.thumbnail_url,
                  title: exercise.title,
                  targetMuscles: exercise.target_muscles,
                  instructions: exercise.instructions || []
                }));
            }
            
            if (data.some(ex => ex.body_part === 'lats')) {
              formattedData.lats = data
                .filter(ex => ex.body_part === 'lats')
                .map(exercise => ({
                  id: exercise.id,
                  thumbnail: exercise.thumbnail_url,
                  title: exercise.title,
                  targetMuscles: exercise.target_muscles,
                  instructions: exercise.instructions || []
                }));
            }
            
            if (data.some(ex => ex.body_part === 'mid_back')) {
              formattedData.mid = data
                .filter(ex => ex.body_part === 'mid_back')
                .map(exercise => ({
                  id: exercise.id,
                  thumbnail: exercise.thumbnail_url,
                  title: exercise.title,
                  targetMuscles: exercise.target_muscles,
                  instructions: exercise.instructions || []
                }));
            }
          }
          
          // Add body part filters for leg exercises
          if (type === 'legs') {
            if (data.some(ex => ex.body_part === 'quads')) {
              formattedData.quads = data
                .filter(ex => ex.body_part === 'quads')
                .map(exercise => ({
                  id: exercise.id,
                  thumbnail: exercise.thumbnail_url,
                  title: exercise.title,
                  targetMuscles: exercise.target_muscles,
                  instructions: exercise.instructions || []
                }));
            }
            
            if (data.some(ex => ex.body_part === 'hamstrings')) {
              formattedData.hamstrings = data
                .filter(ex => ex.body_part === 'hamstrings')
                .map(exercise => ({
                  id: exercise.id,
                  thumbnail: exercise.thumbnail_url,
                  title: exercise.title,
                  targetMuscles: exercise.target_muscles,
                  instructions: exercise.instructions || []
                }));
            }
            
            if (data.some(ex => ex.body_part === 'glutes')) {
              formattedData.glutes = data
                .filter(ex => ex.body_part === 'glutes')
                .map(exercise => ({
                  id: exercise.id,
                  thumbnail: exercise.thumbnail_url,
                  title: exercise.title,
                  targetMuscles: exercise.target_muscles,
                  instructions: exercise.instructions || []
                }));
            }
            
            if (data.some(ex => ex.body_part === 'calves')) {
              formattedData.calves = data
                .filter(ex => ex.body_part === 'calves')
                .map(exercise => ({
                  id: exercise.id,
                  thumbnail: exercise.thumbnail_url,
                  title: exercise.title,
                  targetMuscles: exercise.target_muscles,
                  instructions: exercise.instructions || []
                }));
            }
          }
          
          // Add body part filters for abs exercises
          if (type === 'abs') {
            if (data.some(ex => ex.body_part === 'abs')) {
              formattedData.abs = data
                .filter(ex => ex.body_part === 'abs')
                .map(exercise => ({
                  id: exercise.id,
                  thumbnail: exercise.thumbnail_url,
                  title: exercise.title,
                  targetMuscles: exercise.target_muscles,
                  instructions: exercise.instructions || []
                }));
            }
            
            if (data.some(ex => ex.body_part === 'obliques')) {
              formattedData.obliques = data
                .filter(ex => ex.body_part === 'obliques')
                .map(exercise => ({
                  id: exercise.id,
                  thumbnail: exercise.thumbnail_url,
                  title: exercise.title,
                  targetMuscles: exercise.target_muscles,
                  instructions: exercise.instructions || []
                }));
            }
            
            if (data.some(ex => ex.body_part === 'lower_abs')) {
              formattedData.lower = data
                .filter(ex => ex.body_part === 'lower_abs')
                .map(exercise => ({
                  id: exercise.id,
                  thumbnail: exercise.thumbnail_url,
                  title: exercise.title,
                  targetMuscles: exercise.target_muscles,
                  instructions: exercise.instructions || []
                }));
            }
          }
          
          // Add body part filters for arms exercises
          if (type === 'arms') {
            if (data.some(ex => ex.body_part === 'biceps')) {
              formattedData.biceps = data
                .filter(ex => ex.body_part === 'biceps')
                .map(exercise => ({
                  id: exercise.id,
                  thumbnail: exercise.thumbnail_url,
                  title: exercise.title,
                  targetMuscles: exercise.target_muscles,
                  instructions: exercise.instructions || []
                }));
            }
            
            if (data.some(ex => ex.body_part === 'triceps')) {
              formattedData.triceps = data
                .filter(ex => ex.body_part === 'triceps')
                .map(exercise => ({
                  id: exercise.id,
                  thumbnail: exercise.thumbnail_url,
                  title: exercise.title,
                  targetMuscles: exercise.target_muscles,
                  instructions: exercise.instructions || []
                }));
            }
            
            if (data.some(ex => ex.body_part === 'forearms')) {
              formattedData.forearms = data
                .filter(ex => ex.body_part === 'forearms')
                .map(exercise => ({
                  id: exercise.id,
                  thumbnail: exercise.thumbnail_url,
                  title: exercise.title,
                  targetMuscles: exercise.target_muscles,
                  instructions: exercise.instructions || []
                }));
            }
          }
          
          // Add body part filters for chest exercises
          if (type === 'chest') {
            if (data.some(ex => ex.body_part === 'upper')) {
              formattedData.upper = data
                .filter(ex => ex.body_part === 'upper')
                .map(exercise => ({
                  id: exercise.id,
                  thumbnail: exercise.thumbnail_url,
                  title: exercise.title,
                  targetMuscles: exercise.target_muscles,
                  instructions: exercise.instructions || []
                }));
            }
            
            if (data.some(ex => ex.body_part === 'middle')) {
              formattedData.middle = data
                .filter(ex => ex.body_part === 'middle')
                .map(exercise => ({
                  id: exercise.id,
                  thumbnail: exercise.thumbnail_url,
                  title: exercise.title,
                  targetMuscles: exercise.target_muscles,
                  instructions: exercise.instructions || []
                }));
            }
            
            if (data.some(ex => ex.body_part === 'lower')) {
              formattedData.lower = data
                .filter(ex => ex.body_part === 'lower')
                .map(exercise => ({
                  id: exercise.id,
                  thumbnail: exercise.thumbnail_url,
                  title: exercise.title,
                  targetMuscles: exercise.target_muscles,
                  instructions: exercise.instructions || []
                }));
            }
          }
          
          // We're using specific body part filters above, so we don't need this generic one
          
          setExercises(formattedData);
        } else {
          // If no data in database, show empty state
          console.log('No exercises found in database');
          setExercises({ all: [] });
        }
      } catch (err) {
        console.error('Exception fetching exercises:', err);
        setExercises({ all: [] });
      } finally {
        setLoading(false);
      }
    };
    
    if (type) {
      fetchExercises();
    }
  }, [type]);


  // Get the title based on workout type
  const getWorkoutTitle = () => {
    switch(type) {
      case 'back':
        return 'Back Workout';
      case 'chest':
        return 'Chest Workout';
      case 'legs':
        return 'Legs Workout';
      case 'arms':
        return 'Arms Workout';
      case 'shoulders':
        return 'Shoulders Workout';
      case 'abs':
        return 'Abs Workout';
      default:
        return 'Workout';
    }
  };

  // Get filter options based on workout type
  const getFilterOptions = () => {
    switch (type) {
      case 'back':
        return [
          { value: 'all', label: language === 'english' ? 'All Back Exercises' : 'Tous les exercices du dos' },
          { value: 'upper', label: language === 'english' ? 'Upper Back' : 'Haut du dos' },
          { value: 'lower', label: language === 'english' ? 'Lower Back' : 'Bas du dos' },
          { value: 'lats', label: language === 'english' ? 'Lats' : 'Grands dorsaux' },
          { value: 'mid', label: language === 'english' ? 'Mid Back' : 'Milieu du dos' }
        ];
      case 'legs':
        return [
          { value: 'all', label: language === 'english' ? 'All Leg Exercises' : 'Tous les exercices de jambes' },
          { value: 'quads', label: language === 'english' ? 'Quadriceps' : 'Quadriceps' },
          { value: 'hamstrings', label: language === 'english' ? 'Hamstrings' : 'Ischio-jambiers' },
          { value: 'glutes', label: language === 'english' ? 'Glutes' : 'Fessiers' },
          { value: 'calves', label: language === 'english' ? 'Calves' : 'Mollets' }
        ];
      case 'abs':
        return [
          { value: 'all', label: language === 'english' ? 'All Ab Exercises' : 'Tous les exercices abdominaux' },
          { value: 'abs', label: language === 'english' ? 'Rectus Abdominis' : 'Grand Droit' },
          { value: 'obliques', label: language === 'english' ? 'Obliques' : 'Obliques' },
          { value: 'lower', label: language === 'english' ? 'Lower Abs' : 'Bas des abdominaux' }
        ];
      case 'chest':
        return [
          { value: 'all', label: language === 'english' ? 'All Chest Exercises' : 'Tous les exercices de poitrine' },
          { value: 'upper', label: language === 'english' ? 'Upper Chest' : 'Haut de la poitrine' },
          { value: 'lower', label: language === 'english' ? 'Lower Chest' : 'Bas de la poitrine' },
          { value: 'middle', label: language === 'english' ? 'Middle Chest' : 'Milieu de la poitrine' }
        ];
      case 'arms':
        return [
          { value: 'all', label: language === 'english' ? 'All Arm Exercises' : 'Tous les exercices de bras' },
          { value: 'biceps', label: language === 'english' ? 'Biceps' : 'Biceps' },
          { value: 'triceps', label: language === 'english' ? 'Triceps' : 'Triceps' },
          { value: 'forearms', label: language === 'english' ? 'Forearms' : 'Avant-bras' }
        ];
      default:
        return [
          { value: 'all', label: language === 'english' ? 'All Exercises' : 'Tous les exercices' }
        ];
    }
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  };

  // Get exercises based on selected filter
  const getFilteredExercises = () => {
    if (loading) return [];
    if (!exercises) return [];
    
    // If 'all' filter is selected, return all exercises
    if (selectedFilter === 'all') {
      return exercises.all || [];
    }
    
    // Otherwise, only return exercises that match the selected filter
    return exercises[selectedFilter] || [];
  };

  // Handle exercise click
  const handleExerciseClick = (exercise) => {
    setSelectedExercise(exercise);
  };

  // Close exercise modal
  const closeExerciseModal = () => {
    setSelectedExercise(null);
  };

  const handleApplyExercise = () => {
    // Logic for applying the exercise will go here
    console.log('Apply exercise:', selectedExercise);
    closeExerciseModal(); // Close modal after applying
  };

  return (
    <div className="workout-detail-container">
      <Navbar showProfile={true} />
      <div className="workout-detail-content">
        <h1 className="page-title">{getWorkoutTitle()}</h1>

        {/* Filter Options */}
        <div className="filter-options">
          {getFilterOptions().map(option => (
            <button 
              key={option.value}
              className={`filter-option ${selectedFilter === option.value ? 'active' : ''}`}
              onClick={() => handleFilterChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Exercise Grid */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading exercises...</p>
          </div>
        ) : (
          <div className="exercise-grid">
            {getFilteredExercises().map(exercise => (
              <div 
                key={exercise.id} 
                className="exercise-card"
                onClick={() => handleExerciseClick(exercise)}
              >
                <div className="exercise-thumbnail-container">
                  <img src={exercise.thumbnail} alt={exercise.title} className="exercise-thumbnail" />
                  <div className="exercise-overlay">
                    <span className="view-details">View Details</span>
                  </div>
                </div>
                <div className="exercise-info">
                  <h3 className="exercise-title">{exercise.title}</h3>
                  <p className="exercise-muscles">{exercise.targetMuscles}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Exercise Modal */}
        {selectedExercise && (
          <div className="exercise-modal" onClick={closeExerciseModal}>
            <div className="exercise-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="exercise-modal-header">
                <button className="close-modal-button" onClick={closeExerciseModal}>×</button>
                <h2>{selectedExercise.title}</h2>
                <button
                  className="apply-exercise-button"
                  onClick={() => handleApplyExercise(selectedExercise)}
                >
                  Apply
                </button>
              </div>
              
              <div className="exercise-modal-body">
                <div className="exercise-target">
                  <h3>Target Muscles</h3>
                  <p>{selectedExercise.targetMuscles}</p>
                </div>
                
                <div className="exercise-instructions">
                  <h3>Instructions</h3>
                  <div className="instruction-steps">
                    {selectedExercise.instructions.map((step, index) => (
                      <div key={index} className="instruction-step">
                        <div className="step-number">{index + 1}</div>
                        <div className="step-content">
                          <div className="step-image-container">
                            <img src={step.image} alt={`Step ${index + 1}`} className="step-image" />
                          </div>
                          <p className="step-description">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutDetail;