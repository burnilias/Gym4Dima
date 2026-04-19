import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { saveContent, uploadImage, initializeContentTable, loadAllContent } from '../utils/contentManager';
import './AdminEditTools.css';

// Import Font Awesome for edit icons
const fontAwesomeLink = document.createElement('link');
fontAwesomeLink.rel = 'stylesheet';
fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
document.head.appendChild(fontAwesomeLink);

// This component provides inline editing tools for admins
const AdminEditTools = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editableElements, setEditableElements] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    // Check if user is admin and initialize content table
    const init = async () => {
      const adminStatus = await checkAdminStatus();
      console.log('Admin status checked, isAdmin:', adminStatus);
      
      if (adminStatus) {
        // Only initialize content table if admin
        const tableExists = await initializeContentTable();
        console.log('Content table initialized:', tableExists);
        
        // Load all content from database
        const loadResult = await loadAllContent();
        console.log('Content loaded:', loadResult);
      }
    };
    
    init();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await checkAdminStatus();
      } else if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
        setEditMode(false);
      }
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);
  
  useEffect(() => {
    // Add edit buttons to editable elements when in edit mode
    if (editMode) {
      console.log('Entering edit mode, adding edit buttons');
      setTimeout(() => {
        addEditButtons();
      }, 500); // Slight delay to ensure DOM is ready
    } else {
      removeEditButtons();
    }
    
    return () => {
      // Clean up edit buttons when component unmounts or edit mode changes
      removeEditButtons();
    };
  }, [editMode]);
  
  const checkAdminStatus = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.log('No session found, not admin');
        setIsAdmin(false);
        return false;
      }
      
      console.log('Current user email:', session.user.email);
      
      // ONLY allow the specific admin email
      const adminEmail = 'chahirilias8@gmail.com';
      const isAdminUser = session.user.email.toLowerCase() === adminEmail.toLowerCase();
      
      if (isAdminUser) {
        console.log('✅ Admin account detected:', session.user.email);
        setIsAdmin(true);
        return true;
      }
      
      // If not the specific admin email, not an admin
      console.log('❌ Not admin account:', session.user.email);
      setIsAdmin(false);
      return false;
    } catch (e) {
      console.error('Error checking admin status:', e);
      setIsAdmin(false);
      return false;
    }
  };
  
  const makeAllContentEditable = () => {
    // Make all headings editable
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((element, index) => {
      if (!element.hasAttribute('data-editable')) {
        element.setAttribute('data-editable', 'text');
        element.setAttribute('data-id', `heading-${index}`);
      }
    });
    
    // Make all paragraphs editable
    document.querySelectorAll('p').forEach((element, index) => {
      if (!element.hasAttribute('data-editable')) {
        element.setAttribute('data-editable', 'text');
        element.setAttribute('data-id', `paragraph-${index}`);
      }
    });
    
    // Make all images editable
    document.querySelectorAll('img').forEach((element, index) => {
      if (!element.hasAttribute('data-editable')) {
        element.setAttribute('data-editable', 'image');
        element.setAttribute('data-id', `image-${index}`);
      }
    });
    
    // Make all span elements with text content editable
    document.querySelectorAll('span').forEach((element, index) => {
      if (!element.hasAttribute('data-editable') && element.textContent.trim()) {
        element.setAttribute('data-editable', 'text');
        element.setAttribute('data-id', `span-${index}`);
      }
    });
    
    // Make all div elements with only text content editable
    document.querySelectorAll('div').forEach((element, index) => {
      // Only make divs editable if they contain only text and no other elements
      if (!element.hasAttribute('data-editable') && 
          element.childElementCount === 0 && 
          element.textContent.trim()) {
        element.setAttribute('data-editable', 'text');
        element.setAttribute('data-id', `div-${index}`);
      }
    });
    
    console.log('Made all content editable');
  };
  
  const toggleEditMode = () => {
    if (editMode) {
      // Exiting edit mode
      removeEditButtons();
      setEditMode(false);
      // Remove edit-mode-active class from body
      document.body.classList.remove('edit-mode-active');
    } else {
      // Entering edit mode
      setEditMode(true);
      // Add edit-mode-active class to body
      document.body.classList.add('edit-mode-active');
    }
  };
  
  const addEditButtons = () => {
    // First, make all content editable by adding data-editable attributes
    makeAllContentEditable();
    
    // Then find all elements with data-editable attribute
    const elements = document.querySelectorAll('[data-editable]');
    const editableItems = [];
    console.log(`Found ${elements.length} editable elements`);
    
    elements.forEach((element, index) => {
      const type = element.getAttribute('data-editable');
      const id = element.getAttribute('data-id') || `editable-${index}`;
      const table = element.getAttribute('data-table') || '';
      const field = element.getAttribute('data-field') || '';
      
      // Store original content
      const originalContent = type === 'image' ? element.src : element.innerHTML;
      
      editableItems.push({
        element,
        type,
        id,
        table,
        field,
        originalContent
      });
      
      // Add edit button
      const editButton = document.createElement('button');
      editButton.className = 'admin-edit-button';
      editButton.innerHTML = '<i class="fas fa-pencil-alt"></i>';
      editButton.onclick = () => handleEdit(id);
      
      // Position the button
      const rect = element.getBoundingClientRect();
      editButton.style.position = 'absolute';
      editButton.style.top = `${window.scrollY + rect.top}px`;
      editButton.style.left = `${window.scrollX + rect.right - 30}px`;
      editButton.style.zIndex = '9999';
      editButton.setAttribute('data-edit-button-for', id);
      
      document.body.appendChild(editButton);
    });
    
    console.log(`Added ${editableItems.length} edit buttons`);
    
    setEditableElements(editableItems);
  };
  
  const removeEditButtons = () => {
    // Remove all edit buttons
    const buttons = document.querySelectorAll('.admin-edit-button');
    buttons.forEach(button => {
      button.remove();
    });
    
    // Remove any open edit forms
    const forms = document.querySelectorAll('.admin-edit-form');
    forms.forEach(form => {
      form.remove();
    });
  };
  
  const handleEdit = (id) => {
    const item = editableElements.find(item => item.id === id);
    if (!item) return;
    
    // Remove any existing edit forms
    const existingForms = document.querySelectorAll('.admin-edit-form');
    existingForms.forEach(form => form.remove());
    
    // Create edit form
    const editForm = document.createElement('div');
    editForm.className = 'admin-edit-form';
    
    // Position the form near the element
    const rect = item.element.getBoundingClientRect();
    editForm.style.position = 'absolute';
    editForm.style.top = `${window.scrollY + rect.bottom + 10}px`;
    editForm.style.left = `${window.scrollX + rect.left}px`;
    editForm.style.zIndex = '10000';
    
    // Create form content based on type
    if (item.type === 'text') {
      const textarea = document.createElement('textarea');
      textarea.value = item.element.innerText;
      textarea.rows = 4;
      editForm.appendChild(textarea);
      
      const saveButton = document.createElement('button');
      saveButton.innerText = 'Save';
      saveButton.onclick = () => saveEdit(id, textarea.value);
      editForm.appendChild(saveButton);
      
      const cancelButton = document.createElement('button');
      cancelButton.innerText = 'Cancel';
      cancelButton.onclick = () => editForm.remove();
      editForm.appendChild(cancelButton);
    } else if (item.type === 'image') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      editForm.appendChild(input);
      
      const saveButton = document.createElement('button');
      saveButton.innerText = 'Upload';
      saveButton.onclick = () => {
        if (input.files && input.files[0]) {
          handleImageUpload(id, input.files[0]);
        }
        editForm.remove();
      };
      editForm.appendChild(saveButton);
      
      const cancelButton = document.createElement('button');
      cancelButton.innerText = 'Cancel';
      cancelButton.onclick = () => editForm.remove();
      editForm.appendChild(cancelButton);
    }
    
    document.body.appendChild(editForm);
  };
  
  const saveEdit = async (id, newContent) => {
    setSaving(true);
    setMessage('');
    
    const item = editableElements.find(item => item.id === id);
    if (!item) {
      setSaving(false);
      return;
    }
    
    try {
      // Save to database using contentManager
      const saveResult = await saveContent(id, item.type, newContent);
      
      if (saveResult.success) {
        // Update the element content after successful save
        if (item.type === 'text') {
          item.element.innerHTML = newContent;
        }
        setMessage('Content saved successfully to database!');
      } else {
        console.error('Error saving content:', saveResult.error);
        setMessage('Error saving to database. Please try again.');
        // Don't update the UI if save failed
        return;
      }
    } catch (error) {
      console.error('Error in save edit:', error);
      setMessage('An unexpected error occurred');
    } finally {
      setSaving(false);
      
      // Remove all edit forms
      const forms = document.querySelectorAll('.admin-edit-form');
      forms.forEach(form => form.remove());
    }
  };
  
  const handleImageUpload = async (id, file) => {
    setSaving(true);
    setMessage('');
    
    const item = editableElements.find(item => item.id === id);
    if (!item) {
      setSaving(false);
      return;
    }
    
    try {
      // Upload image and save to database using contentManager
      const uploadResult = await uploadImage(id, file);
      
      if (uploadResult.success) {
        // Update the image src after successful upload
        item.element.src = uploadResult.url;
        setMessage('Image uploaded and saved to database!');
      } else {
        console.error('Error uploading image:', uploadResult.error);
        setMessage('Error uploading image. Please try again.');
        return;
      }
    } catch (error) {
      console.error('Error in upload image:', error);
      setMessage('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };
  
  // Don't render anything for non-admins
  if (!isAdmin) {
    console.log('Not rendering admin tools - user is not admin');
    return null;
  }
  
  // Only render for the specific admin account (chahirilias8@gmail.com)
  
  return (
    <div className="admin-edit-tools">
      <div className="admin-toolbar">
        <button 
          className={`admin-edit-toggle ${editMode ? 'active' : ''}`}
          onClick={toggleEditMode}
        >
          <i className="fas fa-pencil-alt"></i> {editMode ? 'EXIT EDIT MODE' : 'EDIT WEBSITE'}
        </button>
        
        {message && (
          <div className={`admin-message ${saving ? 'saving' : ''}`}>
            {saving ? 'Saving...' : message}
          </div>
        )}
      </div>
      
      {/* Debug info - remove in production */}
      <div style={{display: 'none'}}>
        Admin Status: {isAdmin ? 'Yes' : 'No'}
        <br />
        Edit Mode: {editMode ? 'Active' : 'Inactive'}
        <br />
        Editable Elements: {editableElements.length}
      </div>
    </div>
  );
};

export default AdminEditTools;
