import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../supabaseClient'; // Import Supabase client
import './NotePage.css';

const NotePage = () => {
  const [notes, setNotes] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState(null); // Changed to store the whole note object
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Get current user session and fetch notes
  useEffect(() => {
    const fetchSessionAndNotes = async () => {
      setIsLoading(true);
      setError('');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Error getting session:', sessionError);
        setError('Failed to load user session.');
        setCurrentUser(null);
        setNotes([]);
        setIsLoading(false);
        return;
      }

      if (session && session.user) {
        setCurrentUser(session.user);
        fetchNotes(session.user.id);
      } else {
        setCurrentUser(null);
        setNotes([]); // Clear notes if no user is logged in
        setIsLoading(false);
        // Optionally, redirect to login or show a message
        // navigate('/login'); 
      }
    };

    fetchSessionAndNotes();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const newSessionUser = session?.user ?? null;
      setCurrentUser(newSessionUser);
      if (newSessionUser) {
        fetchNotes(newSessionUser.id);
      } else {
        setNotes([]);
        setIsLoading(false);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const fetchNotes = async (userId) => {
    setIsLoading(true);
    setError('');
    if (!userId) {
      setNotes([]);
      setIsLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('user_notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notes:', error);
        setError('Failed to load notes. ' + error.message);
        setNotes([]);
      } else {
        setNotes(data || []);
      }
    } catch (e) {
      console.error('Catch fetching notes:', e);
      setError('An unexpected error occurred while fetching notes.');
      setNotes([]);
    }
    setIsLoading(false);
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) {
      alert('Both title and content are required!');
      return;
    }

    if (!currentUser) {
      alert('You must be logged in to save notes.');
      // Potentially redirect to login or show a more prominent message
      return;
    }

    setIsLoading(true);
    setError('');

    const noteData = {
      user_id: currentUser.id,
      title: noteTitle,
      content: noteContent,
    };

    try {
      let response;
      if (editingNote && editingNote.id) {
        // Update existing note
        response = await supabase
          .from('user_notes')
          .update({ title: noteTitle, content: noteContent })
          .eq('id', editingNote.id)
          .eq('user_id', currentUser.id) // Ensure user owns the note
          .select(); 
      } else {
        // Add new note
        response = await supabase
          .from('user_notes')
          .insert(noteData)
          .select();
      }

      const { data, error: supaError } = response;

      if (supaError) {
        console.error('Error saving note:', supaError);
        setError('Failed to save note. ' + supaError.message);
      } else {
        // Clear form and refresh notes
        setNoteTitle('');
        setNoteContent('');
        setEditingNote(null);
        if (currentUser) fetchNotes(currentUser.id); // Re-fetch notes to show the latest
      }
    } catch (e) {
      console.error('Catch saving note:', e);
      setError('An unexpected error occurred while saving the note.');
    }
    setIsLoading(false);
  };

  const handleEditNote = (note) => {
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setEditingNote(note); // Store the whole note object for its ID
  };

  const handleDeleteNote = async (noteId) => {
    if (!currentUser) {
      alert('You must be logged in to delete notes.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this note?')) {
      setIsLoading(true);
      setError('');
      try {
        const { error: supaError } = await supabase
          .from('user_notes')
          .delete()
          .eq('id', noteId)
          .eq('user_id', currentUser.id); // Ensure user owns the note

        if (supaError) {
          console.error('Error deleting note:', supaError);
          setError('Failed to delete note. ' + supaError.message);
        } else {
          // Clear form if the deleted note was being edited
          if (editingNote && editingNote.id === noteId) {
            setNoteTitle('');
            setNoteContent('');
            setEditingNote(null);
          }
          if (currentUser) fetchNotes(currentUser.id); // Re-fetch notes
        }
      } catch (e) {
        console.error('Catch deleting note:', e);
        setError('An unexpected error occurred while deleting the note.');
      }
      setIsLoading(false);
    }
  };

  if (!currentUser && !isLoading) {
    return (
      <div className="note-page-container">
        <Navbar showProfile={true} />
        <div className="note-page-content" style={{ textAlign: 'center', marginTop: '50px' }}>
          <h1>Workout Notes</h1>
          <p>Please log in to view and manage your notes.</p>
          {/* Optionally, add a login button here */}
        </div>
      </div>
    );
  }

  return (
    <div className="note-page-container">
      <Navbar showProfile={true} />
      <div className="note-page-content">
        <div className="note-icon-header">
          <img src="https://img.icons8.com/ios-filled/100/f39c12/note.png" alt="Note Icon" className="note-page-icon"/>
        </div>
        <h1 className="note-page-main-title">Workout Notes</h1>
        <p className="note-page-subtitle">Keep track of your workouts, goals, and progress.</p>

        {error && <p className="error-message" style={{color: 'red', textAlign: 'center'}}>{error}</p>}

        <div className="create-note-section">
          <h2>{editingNote ? 'Edit Note' : 'Create New Note'}</h2>
          <form onSubmit={handleSaveNote} className="note-form">
            <input 
              type="text" 
              placeholder="Note Title" 
              value={noteTitle} 
              onChange={(e) => setNoteTitle(e.target.value)} 
              className="note-title-input"
              required
              disabled={isLoading}
            />
            <textarea 
              placeholder="Enter your workout notes, progress, or goals here..." 
              value={noteContent} 
              onChange={(e) => setNoteContent(e.target.value)}
              className="note-content-textarea"
              rows="8"
              required
              disabled={isLoading}
            ></textarea>
            <button type="submit" className="save-note-button" disabled={isLoading}>
              {isLoading ? (editingNote ? 'Updating...' : 'Saving...') : (editingNote ? 'Update Note' : 'Save Note')}
            </button>
            {editingNote && (
              <button 
                type="button" 
                className="cancel-edit-button" 
                onClick={() => {
                  setEditingNote(null);
                  setNoteTitle('');
                  setNoteContent('');
                }}
                disabled={isLoading}
              >
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        <div className="your-notes-section">
          <h2>Your Notes</h2>
          {isLoading && !notes.length ? (
            <p>Loading notes...</p>
          ) : !notes.length ? (
            <div className="no-notes-message">No notes yet. Create one above!</div>
          ) : (
            <div className="notes-list">
              {notes.map(note => (
                <div key={note.id} className="note-item">
                  <h3>{note.title}</h3>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{note.content}</p> {/* Preserve line breaks */}
                  <small>Last updated: {new Date(note.created_at).toLocaleString()}</small>
                  <div className="note-actions">
                    <button onClick={() => handleEditNote(note)} className="edit-note-button" disabled={isLoading}>Edit</button>
                    <button onClick={() => handleDeleteNote(note.id)} className="delete-note-button" disabled={isLoading}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotePage;