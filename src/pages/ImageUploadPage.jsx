import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ImageUploader from '../components/ImageUploader';
import { supabase } from '../supabaseClient';
import './ImageUploadPage.css';

const ImageUploadPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      }
    };
    
    checkSession();
    
    // Create the storage bucket if it doesn't exist
    const createBucket = async () => {
      try {
        // Check if bucket exists
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets.some(bucket => bucket.name === 'exercise-images');
        
        if (!bucketExists) {
          // Create the bucket
          const { data, error } = await supabase.storage.createBucket('exercise-images', {
            public: true,
            fileSizeLimit: 5242880, // 5MB
          });
          
          if (error) {
            console.error('Error creating bucket:', error);
          } else {
            console.log('Bucket created successfully:', data);
          }
        }
      } catch (err) {
        console.error('Error checking/creating bucket:', err);
      }
    };
    
    createBucket();
  }, [navigate]);

  return (
    <div className="image-upload-page">
      <Navbar />
      <div className="page-content">
        <h1>Exercise Image Upload</h1>
        <p className="page-description">
          Upload images for your workout exercises. The images will be stored in Supabase Storage
          and can be used in your exercises database.
        </p>
        
        <div className="upload-instructions">
          <h2>How to use:</h2>
          <ol>
            <li>Select an image from your computer</li>
            <li>Click "Upload Image" to upload it to Supabase</li>
            <li>Copy the generated URL</li>
            <li>Use this URL in your exercises database for the thumbnail or instructions</li>
          </ol>
        </div>
        
        <ImageUploader />
        
        <div className="database-instructions">
          <h2>Adding to Database:</h2>
          <p>After uploading, use the SQL below to add the exercise with the image URL:</p>
          <pre>
{`INSERT INTO exercises (
  category, 
  title, 
  thumbnail_url, 
  target_muscles, 
  body_part, 
  instructions
)
VALUES (
  'back',
  'Exercise Name',
  'PASTE_IMAGE_URL_HERE',
  'Target Muscles',
  'upper_back', -- or 'lower_back', 'lats'
  '[
    {
      "image": "PASTE_INSTRUCTION_IMAGE_URL_HERE",
      "description": "Step description"
    }
  ]'
);`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadPage;
