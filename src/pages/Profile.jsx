import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Profile.css';

const Profile = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.error('Error fetching user or user not logged in:', error);
        navigate('/login');
        return;
      }
      setEmail(user.email || '');
      setUsername(user.user_metadata?.username || '');

      // Fetch avatar_url from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else if (profileData) {
        setAvatarUrl(profileData.avatar_url);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleFileSelected = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      // Optionally, display a preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarUrl(event.target.result); // Show preview
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleUploadProfilePicture = async () => {
    if (!selectedFile) {
      setError('Please select an image file first.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('User not found. Please log in again.');
      setUploading(false);
      return;
    }

    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `${user.id}_${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    try {
      // Upload image to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars') // Ensure you have an 'avatars' bucket in Supabase Storage
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: true, // Use upsert to overwrite if file with same name exists (e.g., user re-uploads)
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL of the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error('Could not get public URL for the uploaded image.');
      }

      // Update avatar_url in the user's profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(publicUrl); // Update displayed avatar
      setSelectedFile(null); // Clear selected file
      setSuccess('Profile picture updated successfully!');
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      setError(`Failed to upload profile picture: ${err.message}`);
      // Revert preview if upload failed and there was an old avatar
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if(currentUser) {
        const { data: profileData } = await supabase.from('profiles').select('avatar_url').eq('id', currentUser.id).single();
        if (profileData && profileData.avatar_url) setAvatarUrl(profileData.avatar_url);
        else setAvatarUrl(null);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { data: { user: currentSupabaseUser }, error: getUserError } = await supabase.auth.getUser();

    if (getUserError || !currentSupabaseUser) {
      setError('Could not retrieve user information. Please try again.');
      console.error('Error getting current Supabase user:', getUserError);
      return;
    }

    // Password update logic
    if (newPassword) {
      if (!currentPassword) {
        setError('Current password is required to set a new password.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New passwords do not match.');
        return;
      }

      const { error: passwordUpdateError } = await supabase.auth.updateUser({ password: newPassword });
      if (passwordUpdateError) {
        setError(`Password update failed: ${passwordUpdateError.message}`);
        console.error('Supabase password update error:', passwordUpdateError);
        return;
      }
      setSuccess('Password updated successfully! ');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }

    // Username update logic
    const currentUsername = currentSupabaseUser.user_metadata?.username || currentSupabaseUser.email;
    if (username && username !== currentUsername) {
      const { data: updatedUserData, error: usernameUpdateError } = await supabase.auth.updateUser({
        data: { username: username }
      });
      if (usernameUpdateError) {
        setError((prevError) => prevError + ` Username update failed: ${usernameUpdateError.message}`);
        console.error('Supabase username update error:', usernameUpdateError);
        if (!newPassword) setSuccess('');
        return;
      }
      setSuccess((prevSuccess) => prevSuccess + 'Username updated successfully!');
    }

    if (!newPassword && !(username && username !== currentUsername)) {
      setSuccess('No changes detected or applied.');
      return;
    }

    if (!newPassword && (username && username !== currentUsername) && success.includes('Username updated successfully!')) {
      // Message already set
    } else if (!newPassword && (username && username !== currentUsername)) {
      setError('No changes were applied to username.');
    }

    if (!error && !success) {
      setSuccess('Profile updated successfully.');
    }
  };
  
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!deletePassword) {
      setError('Please enter your password to confirm account deletion.');
      return;
    }
    
    try {
      // First verify the password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: deletePassword,
      });
      
      if (signInError) {
        setError('Incorrect password. Account deletion cancelled.');
        return;
      }
      
      // If password is correct, proceed with account deletion
      const { data: { user }, error: getUserError } = await supabase.auth.getUser();

      if (getUserError || !user) {
        setError('Could not retrieve user information. Please try again.');
        return;
      }

      // First delete user data from related tables
      // You may need to add more tables here depending on your database structure
      const { error: profileDeleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileDeleteError) {
        console.error('Error deleting profile data:', profileDeleteError);
        setError('Failed to delete account data. Please try again.');
        return;
      }

      // Now delete the user from auth.users
      const { error: userDeleteError } = await supabase.auth.admin.deleteUser(user.id);

      // If admin API is not available, use the client-side method
      if (userDeleteError) {
        console.log('Admin API not available, using client-side method');
        const { error: clientDeleteError } = await supabase.rpc('delete_user');
        
        if (clientDeleteError) {
          // If RPC function is not available, fall back to the standard method
          if (clientDeleteError.message.includes('does not exist')) {
            // Final fallback - use the standard method which may require verification
            const { error: standardDeleteError } = await supabase.auth.deleteUser();
            
            if (standardDeleteError) {
              console.error('Error deleting user account:', standardDeleteError);
              setError('Failed to delete account. Please try again or contact support.');
              return;
            }
          } else {
            console.error('Error with RPC delete_user:', clientDeleteError);
            setError('Failed to delete account. Please try again or contact support.');
            return;
          }
        }
      }

      setSuccess('Account permanently deleted. You will be logged out.');
      
      // Sign out and redirect to home page after a short delay
      setTimeout(async () => {
        await supabase.auth.signOut();
        // Clear any local storage items if needed
        localStorage.clear();
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };
  
  const toggleDeleteConfirm = () => {
    setShowDeleteConfirm(!showDeleteConfirm);
    setDeletePassword('');
    setError('');
  };

  return (
    <div className="profile-page-container">
      <Navbar showProfile={true} />
      <div className="profile-page-content">
        <div className="profile-form-container">
          <h2 className="profile-title">Edit Profile</h2>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="profile-picture-section">
            <h3>Profile Picture</h3>
            <div className="avatar-container">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="profile-avatar" />
              ) : (
                <div className="profile-avatar-placeholder">No Image</div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleFileSelected} disabled={uploading} />
            {selectedFile && (
              <button onClick={handleUploadProfilePicture} disabled={uploading || !selectedFile} className="upload-avatar-button">
                {uploading ? 'Uploading...' : 'Upload and Confirm Picture'}
              </button>
            )}
          </div>

          <form onSubmit={handleUpdateProfile}>

          {/* Duplicate <form onSubmit={handleUpdateProfile}> removed to fix JSX error. If you need to restore, check with your developer tools. */}
            <div className="form-group">
              <label htmlFor="email">Email Address:</label>
              <input
                type="email"
                id="email"
                value={email}
                disabled
                className="disabled-input"
              />
              <small>Email cannot be changed</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter a unique username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="currentPassword">Current Password:</label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <small>Required to change password</small>
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password:</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password:</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="update-profile-button">
              Update Profile
            </button>
          </form>
          
          <div className="delete-account-section">
            <hr className="section-divider" />
            <h3>Delete Account</h3>
            <p className="warning-text">Warning: This action will permanently delete your account and all associated data. This action cannot be undone. You will be logged out and all your data will be removed from our system.</p>
            
            {!showDeleteConfirm ? (
              <button 
                type="button" 
                className="delete-account-button"
                onClick={toggleDeleteConfirm}
              >
                Delete My Account
              </button>
            ) : (
              <form onSubmit={handleDeleteAccount} className="delete-account-form">
                <div className="form-group">
                  <label htmlFor="deletePassword">Enter your password to confirm:</label>
                  <input
                    type="password"
                    id="deletePassword"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <div className="delete-account-buttons">
                  <button type="submit" className="confirm-delete-button">
                    Permanently Delete My Account
                  </button>
                  <button type="button" className="cancel-button" onClick={toggleDeleteConfirm}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
