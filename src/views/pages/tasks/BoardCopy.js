import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import List from './List';
import { createTask, getTasks , getUser, getTaskCards } from '../../../api/api';  

const Board = () => {
  const [lists, setLists] = useState([]);
  const [userLists, setUserLists] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');  

  
  const fetchLists = async () => {
    try {
      const fetchedLists = await getTasks();
      if (Array.isArray(fetchedLists.data)) {
        console.log(fetchedLists.data);
        const formattedLists = fetchedLists.data.map(list => ({
          id: list._id,   
          title: list.title,
          cards: [],  // Initialize cards as an empty array since it's not used in the API
        }));

        setLists(formattedLists);   
      } else {
        console.error('Error: Expected an array from getLists API');
        setLists([]);  
      }
    } catch (error) {
      console.error('Error fetching lists:', error);
      setLists([]);  
    }
  };
 
  const UserLists = async () => {
    try {
      const fetchedUserLists = await getUser();
      setUserLists(fetchedUserLists.data);   
    } catch (error) {
      console.error('Error fetching user lists:', error);
      setUserLists([]); 
    }
  };

  useEffect(() => {
    fetchLists();  
    UserLists();
  }, []);  

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeListIndex = lists.findIndex((list) =>
      list.cards.some((card) => card.id === active.id)
    );
    const overListIndex = lists.findIndex((list) => list.id === over.id);

    if (activeListIndex === overListIndex) return;

    const activeCardIndex = lists[activeListIndex].cards.findIndex(
      (card) => card.id === active.id
    );
    const activeCard = lists[activeListIndex].cards[activeCardIndex];

    const updatedLists = [...lists];
    updatedLists[activeListIndex].cards.splice(activeCardIndex, 1);

    if (updatedLists[overListIndex].cards.length === 0) {
      updatedLists[overListIndex].cards.push(activeCard);
    } else {
      const overCardIndex = updatedLists[overListIndex].cards.findIndex(
        (card) => card.id === over.id
      );
      updatedLists[overListIndex].cards.splice(overCardIndex, 0, activeCard);
    }

    setLists(updatedLists);  
  };

   
  const handleCreateList = async (e) => {
    e.preventDefault();

    if (!newListTitle) {
      alert("Please enter a title for the list.");
      return;
    }

    try {
       
      const newList = await createTask({ title: newListTitle });

      
      await fetchLists();  
      
      setShowForm(false);
      setNewListTitle('');
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        padding: '1rem',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
      }}
    >
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={lists.map((list) => list.id)}
          strategy={verticalListSortingStrategy}
        >
          {lists.length === 0 ? (
            <div>Loading...</div>  
          ) : (
            lists.map((list) => (
              <div key={list.id} style={{ flex: '0 0 auto' }}>
                <List list={list} lists={lists} setLists={setLists} users={userLists} />
              </div>
            ))
          )}
        </SortableContext>
      </DndContext>

      {/* Show the form if showForm is true */}
      {showForm ? (
        <form
  onSubmit={handleCreateList}
  style={{
    width: '200px',
  }}
>
  <input
    type="text"
    value={newListTitle}
    onChange={(e) => setNewListTitle(e.target.value)}
    placeholder="Enter list name"
    style={{
      padding: '0.5rem',
      width: '100%',
      marginBottom: '0.5rem',
    }}
  />
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      gap: '0.5rem',
    }}
  >
    <button
      type="submit"
      style={{
        padding: '0.5rem',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        width: '100%',
        cursor: 'pointer',
        fontSize: '14px',
      }}
    >
      Create List
    </button>
    <button
      type="button"
      onClick={() => setShowForm(false)}
      style={{
        padding: '0.5rem',
        backgroundColor: '#ccc',
        color: 'black',
        border: 'none',
        width: '100%',
        cursor: 'pointer',
        fontSize: '14px',
      }}
    >
      Cancel
    </button>
  </div>
</form>
      ) : (
        <button
          onClick={() => setShowForm(true)}  // Show form when clicked
          style={{
            padding: '0.4rem',
            cursor: 'pointer',
            alignSelf: 'flex-start',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            fontSize: '14px',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          + Add another list
        </button>
      )}
    </div>
  );
};

export default Board;
