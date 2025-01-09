import React from 'react';
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CButton,
  CFormTextarea,
  CFormSelect,

} from '@coreui/react';

const Modal = ({ show, handleClose, taskData, setTaskData, saveTask }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData({ ...taskData, [name]: value });
  };

  // Handle changes for the user and date fields
  const handleUserChange = (e) => {
    setTaskData({ ...taskData, assignedUser: e.target.value });
  };

  const handleDateChange = (e) => {
    setTaskData({ ...taskData, assignedDate: e.target.value });
  };

  const handleSave = () => {
    saveTask(taskData);  // Save the task
    handleClose(); // Close the modal after saving
  };

  // Sample users for assignment (You can replace this with actual users from your app)
  const users = ['John Doe', 'Jane Smith', 'Alex Johnson'];

  return (
    <CModal visible={show} onClose={handleClose}>
      <CModalHeader>
        <CModalTitle>{taskData.id ? 'Edit Task' : 'Add Task'}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CFormInput
          label="Title"
          name="title"
          value={taskData.title || ''}
          onChange={handleChange}
          placeholder="Enter task title"
        />
        <CFormTextarea
          label="Description"
          name="description"
          value={taskData.description || ''}
          onChange={handleChange}
          rows="3"
          placeholder="Enter task description"
        />
        
        {/* User Assignment */}
         
          <label htmlFor="assignedUser">Assign User</label>
          <CFormSelect
            name="assignedUser"
            value={taskData.assignedUser || ''}
            onChange={handleUserChange}
            aria-label="Assign User"
          >
            <option value="">Select a user</option>
            {users.map((user, index) => (
              <option key={index} value={user}>
                {user}
              </option>
            ))}
          </CFormSelect>
        

        {/* Due Date Assignment */}
         
          <label htmlFor="assignedDate">Assigned Date</label>
          <CFormInput
            type="date"
            name="assignedDate"
            value={taskData.assignedDate || ''}
            onChange={handleDateChange}
            aria-label="Assigned Date"
          />
       
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={handleClose}>
          Cancel
        </CButton>
        <CButton color="primary" onClick={handleSave}>
          Save
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default Modal;
