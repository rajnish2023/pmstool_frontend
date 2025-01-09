import React, { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import axios from 'axios';
import { FaPencilAlt, FaPlus } from 'react-icons/fa';
import { CButton, CModal, CModalHeader, CModalBody, CModalFooter, CFormLabel, CFormInput, CFormTextarea, CFormSelect } from '@coreui/react';

const Card = ({ card, boardId, listId }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    title: card.title,
    description: card.description,
    user: card.user,
    dueDate: card.dueDate,
  });
  const [users, setUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);  // Track if user list is visible
  const [selectedUser, setSelectedUser] = useState(card.user);

  // Fetch users from the API
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`/api/boards/${boardId}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [boardId]);

  const [, drag] = useDrag({
    type: 'CARD',
    item: { cardId: card._id, sourceListId: listId },
  });

  const handleEditSubmit = async () => {
    try {
      await axios.put(`${API_URL}/boards/${boardId}/lists/${listId}/cards/${card._id}`, {
        ...editData,
        user: selectedUser,  // Make sure to update the user assignment
      });
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating card:', error);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUser(userId);
    setShowUserList(false);  // Close user list after selection
  };

  return (
    <>
      <div
        ref={drag}
        style={{
          backgroundColor: '#fff',
          padding: '10px',
          borderRadius: '5px',
          border: '1px solid #ddd',
          marginBottom: '10px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          position: 'relative',
        }}
        onMouseEnter={(e) => e.currentTarget.querySelector('.edit-btn').style.display = 'block'}
        onMouseLeave={(e) => e.currentTarget.querySelector('.edit-btn').style.display = 'none'}
      >
        <div style={{ fontWeight: 'normal' }} onClick={() => setShowEditModal(true)}>
          {editData.title}
        </div>
        <CButton
          size="sm"
          onClick={() => setShowEditModal(true)}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            fontSize: '12px',
            display: 'none',
          }}
          className="edit-btn"
        >
          <FaPencilAlt size={15} />
        </CButton>
      </div>

      <CModal visible={showEditModal} onClose={() => setShowEditModal(false)}>
        <CModalHeader>Edit Card</CModalHeader>
        <CModalBody>
          <div>
            <CFormLabel>Title</CFormLabel>
            <CFormInput
              type="text"
              value={editData.title}
              onChange={(e) => setEditData((prev) => ({ ...prev, title: e.target.value }))}
              className="mb-2"
            />
            <CFormLabel>Description</CFormLabel>
            <CFormTextarea
              value={editData.description}
              onChange={(e) => setEditData((prev) => ({ ...prev, description: e.target.value }))}
              className="mb-2"
            />
            <CFormLabel>Assign User</CFormLabel>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CButton
                color="secondary"
                size="sm"
                onClick={() => setShowUserList(!showUserList)}  // Toggle user list visibility
                style={{ marginRight: '10px' }}
              >
                <FaPlus size={12} /> Add User
              </CButton>
              {/* Display the assigned user's name */}
              {selectedUser ? (
                <span>{users.find((user) => user._id === selectedUser)?.username || 'No user assigned'}</span>
              ) : (
                'No user assigned'
              )}
            </div>

            {/* Show list of users when plus button is clicked */}
            {showUserList && (
              <div style={{ border: '1px solid #ddd', marginTop: '10px', padding: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                {users.map((user) => (
                  <div
                    key={user._id}
                    style={{ padding: '5px', cursor: 'pointer' }}
                    onClick={() => handleUserSelect(user._id)}
                  >
                    {user.username}
                  </div>
                ))}
              </div>
            )}

            <CFormLabel>Due Date</CFormLabel>
            <CFormInput
              type="date"
              value={editData.dueDate}
              onChange={(e) => setEditData((prev) => ({ ...prev, dueDate: e.target.value }))}
              className="mb-2"
            />
          </div>
        </CModalBody>

        <CModalFooter>
          <CButton color="primary" onClick={handleEditSubmit}>
            Save
          </CButton>
          <CButton color="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default Card;
