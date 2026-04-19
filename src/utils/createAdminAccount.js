import { supabase } from '../supabaseClient';

// This script creates an admin account and sets up the necessary database structure
// Run this script once to set up the admin account

const createAdminAccount = async () => {
  console.log('Starting admin account creation process...');
  
  try {
    // We'll assume the is_admin column exists or will be created automatically
    // when we insert the admin user profile
    
    // 1. Check if admin account already exists
    console.log('Checking if admin account already exists...');
    const { data: existingUsers, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'ADMIN@GYM4DIMA.COM');
      
    if (!usersError && existingUsers && existingUsers.length > 0) {
      console.log('Admin account already exists in profiles table.');
      return { success: true, message: 'Admin account already exists.' };
    }
    
    // 2. Create the admin account
    console.log('Creating new admin account...');
    const { data: newUser, error: signUpError } = await supabase.auth.signUp({
      email: 'ADMIN@GYM4DIMA.COM',
      password: 'ADMIN',
      options: {
        data: {
          username: 'Administrator',
          is_admin: true
        }
      }
    });
    
    if (signUpError) {
      console.error('Error creating admin account:', signUpError);
      throw signUpError;
    }
    
    if (!newUser || !newUser.user) {
      throw new Error('Failed to create admin user - user object is undefined');
    }
    
    console.log('Admin account created successfully!');
    
    // 3. Create the admin profile
    console.log('Creating admin profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: newUser.user.id,
          username: 'Administrator',
          email: 'ADMIN@GYM4DIMA.COM',
          is_admin: true,
          is_active: true,
        },
      ]);
    
    if (profileError) {
      console.error('Error creating admin profile:', profileError);
      // If there's an error with the is_admin column, we'll try without it
      if (profileError.message.includes('is_admin')) {
        console.log('Trying without is_admin column...');
        const { error: retryError } = await supabase
          .from('profiles')
          .insert([
            {
              id: newUser.user.id,
              username: 'Administrator',
              email: 'ADMIN@GYM4DIMA.COM',
              is_active: true,
            },
          ]);
          
        if (retryError) {
          console.error('Error creating admin profile (retry):', retryError);
          throw retryError;
        }
      } else {
        throw profileError;
      }
    }
    
    console.log('Admin profile created successfully!');
    
    return { 
      success: true, 
      message: 'Admin account created successfully!',
      details: 'Email: ADMIN@GYM4DIMA.COM, Password: ADMIN'
    };
    
  } catch (error) {
    console.error('Error in admin account creation process:', error);
    return { 
      success: false, 
      message: 'Failed to create admin account', 
      error: error.message 
    };
  }
};

export default createAdminAccount;
