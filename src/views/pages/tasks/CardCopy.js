import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaEdit } from 'react-icons/fa';

const Card = ({ card, onClick,users }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: card.id });

  const [isHovered, setIsHovered] = useState(false); // Track hover state
  const username = users.find((user) => user._id === card.assignedUser)?.username
 
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: '1rem',
    margin: '0.5rem 0',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    position: 'relative', // Position for the icon
  };

  // Style for the edit icon based on hover state
  const iconStyle = {
    display: isHovered ? 'block' : 'none', // Show the icon only on hover
    position: 'absolute', // Absolute positioning
    top: '10px',
    right: '10px',
    color: '#007bff',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)} // Set hover state to true when mouse enters
      onMouseLeave={() => setIsHovered(false)} // Set hover state to false when mouse leaves
    >
      <div className="card-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ position: 'relative', paddingBottom: '30px' }}>{card.title}</span>
         
      {username && username.length > 0 && (
  <span
    style={{
      position: 'absolute',
      bottom: '10px',  // Adjusts the position from the bottom of the card
      right: '10px',  // Adjusts the position from the right side of the card
      background: '#007bff',
      color: '#fff',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      fontSize: '10px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    {username.charAt(0).toUpperCase().concat(username.charAt(1).toUpperCase())}
  </span>
)}


        {/* Edit Icon Container */}
        <div
          className="edit-icon-container"
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering onClick of the parent
            onClick(card); // Trigger the parent onClick
          }}
          style={iconStyle} // Apply hover-based style for the icon
        >
          <FaEdit size={15} />
        </div>
      </div>
    </div>
  );
};

export default Card;
