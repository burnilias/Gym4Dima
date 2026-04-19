import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import './ImageUploader.css';

const ImageUploader = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedURL, setUploadedURL] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const uploadImage = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      setError('');
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `exercise-images/${fileName}`;
      
      // Upload the file to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('exercise-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('exercise-images')
        .getPublicUrl(filePath);
      
      setUploadedURL(publicUrl);
      setFile(null);
      
      // Reset file input
      document.getElementById('file-input').value = '';
      
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Error uploading image: ' + (err.message || err.error_description || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(uploadedURL);
    alert('URL copied to clipboard!');
  };

  return (
    <div className="image-uploader-container">
      <h2>Exercise Image Uploader</h2>
      
      <div className="upload-section">
        <input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
        />
        
        <button 
          className="upload-button"
          onClick={uploadImage}
          disabled={uploading || !file}
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {uploadedURL && (
        <div className="result-section">
          <h3>Uploaded Successfully!</h3>
          
          <div className="image-preview">
            <img src={uploadedURL} alt="Uploaded" />
          </div>
          
          <div className="url-section">
            <input 
              type="text" 
              value={uploadedURL} 
              readOnly 
            />
            <button onClick={copyToClipboard}>Copy URL</button>
          </div>
          
          <div className="instructions">
            <p>Use this URL in your exercises database for the <code>thumbnail_url</code> or in the <code>instructions</code> JSON.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
