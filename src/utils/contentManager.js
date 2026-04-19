import { supabase } from '../supabaseClient';

// This utility manages saving and retrieving content from the database
// It ensures all edits are 100% saved to the database

// Initialize the content table if it doesn't exist
export const initializeContentTable = async () => {
  try {
    // Check if the website_content table exists by querying it
    const { error } = await supabase
      .from('website_content')
      .select('id')
      .limit(1);
      
    if (error && error.code === '42P01') {
      console.log('Content table does not exist. Please create it in Supabase.');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking content table:', error);
    return false;
  }
};

// Save content to the database
export const saveContent = async (contentId, contentType, content) => {
  try {
    // First check if the content already exists
    const { data: existingContent, error: fetchError } = await supabase
      .from('website_content')
      .select('*')
      .eq('content_id', contentId)
      .single();
      
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching content:', fetchError);
      return { success: false, error: fetchError.message };
    }
    
    if (existingContent) {
      // Update existing content
      const { error: updateError } = await supabase
        .from('website_content')
        .update({ 
          content_value: content,
          updated_at: new Date()
        })
        .eq('content_id', contentId);
        
      if (updateError) {
        console.error('Error updating content:', updateError);
        return { success: false, error: updateError.message };
      }
      
      return { success: true, message: 'Content updated successfully' };
    } else {
      // Insert new content
      const { error: insertError } = await supabase
        .from('website_content')
        .insert([
          {
            content_id: contentId,
            content_type: contentType,
            content_value: content,
            created_at: new Date(),
            updated_at: new Date()
          }
        ]);
        
      if (insertError) {
        console.error('Error inserting content:', insertError);
        return { success: false, error: insertError.message };
      }
      
      return { success: true, message: 'Content created successfully' };
    }
  } catch (error) {
    console.error('Error saving content:', error);
    return { success: false, error: error.message };
  }
};

// Get content from the database
export const getContent = async (contentId) => {
  try {
    const { data, error } = await supabase
      .from('website_content')
      .select('content_value')
      .eq('content_id', contentId)
      .single();
      
    if (error) {
      console.error('Error fetching content:', error);
      return null;
    }
    
    return data.content_value;
  } catch (error) {
    console.error('Error getting content:', error);
    return null;
  }
};

// Upload an image to Supabase storage and save the URL to the content table
export const uploadImage = async (contentId, file) => {
  try {
    // Upload the image to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${contentId}-${Date.now()}.${fileExt}`;
    const filePath = `content/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);
      
    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return { success: false, error: uploadError.message };
    }
    
    // Get the public URL
    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);
      
    const publicUrl = data.publicUrl;
    
    // Save the URL to the content table
    const saveResult = await saveContent(contentId, 'image', publicUrl);
    
    if (!saveResult.success) {
      return saveResult;
    }
    
    return { success: true, url: publicUrl, message: 'Image uploaded and saved successfully' };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { success: false, error: error.message };
  }
};

// Load all content from the database and apply it to the page
export const loadAllContent = async () => {
  try {
    const { data, error } = await supabase
      .from('website_content')
      .select('*');
      
    if (error) {
      console.error('Error loading content:', error);
      return { success: false, error: error.message };
    }
    
    // Apply content to elements with matching data-id attributes
    data.forEach(item => {
      const elements = document.querySelectorAll(`[data-id="${item.content_id}"]`);
      
      elements.forEach(element => {
        if (item.content_type === 'image') {
          element.src = item.content_value;
        } else {
          element.innerHTML = item.content_value;
        }
      });
    });
    
    return { success: true, message: `Loaded ${data.length} content items` };
  } catch (error) {
    console.error('Error loading all content:', error);
    return { success: false, error: error.message };
  }
};
