import React, { useState, useEffect } from 'react';
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton, CForm, CFormInput, CFormTextarea, CFormSelect, CAvatar } from '@coreui/react';
import { FaPlusCircle } from 'react-icons/fa';
import { createTaskAuth, getBoards, getUser, getAllTasksAuth } from '../../api/api'; 

const CreateTaskModal = ({ isOpen, toggleModal, onTaskCreated }) => {
    const [taskName, setTaskName] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [boards, setBoards] = useState([]);
    const [selectedBoard, setSelectedBoard] = useState(''); 
    const [selectedUsers, setSelectedUsers] = useState([]); 
    const [users, setUsers] = useState([]);
    const [errors, setErrors] = useState({});
    const [error, setError] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [subtasks, setSubtasks] = useState([]);
    const [dueDate, setDueDate] = useState('');
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem('token');

    const fetchUsers = async () => {
        try {
            const userData = await getUser(); 
            if (Array.isArray(userData.data)) {
                setUsers(userData.data);
            } else {
                setError('Unexpected data format. Users should be an array.');
            }
        } catch (error) {
            setError('Error fetching users. Please try again later.');
            console.error('Error fetching users', error);
        }
    };

    useEffect(() => {
        const fetchBoards = async () => {
            try {
                const response = await getBoards();
                setBoards(response.boards);
            } catch (error) {
                console.error('Error fetching boards:', error);
            }
        };

        const fetchTasks = async () => {
            try {
                const token = localStorage.getItem('token');  
                if (!token) {
                    throw new Error('Authentication token is missing.');
                }

                const response = await getAllTasksAuth(token);  
                if (response && response.data) {
                    setTasks(response.data);  
                } else {
                    throw new Error('No tasks found.');
                }
            } catch (err) {
                setError(err.message);  
                console.error('Error fetching tasks:', err);
            } 
        };

        fetchBoards();
        fetchUsers();
        fetchTasks();
    }, []);

    const handleSubtaskChange = (index, field, value) => {
        if (field === 'dueDate') {
          const taskDueDate = new Date(dueDate);  
          const subtaskDueDate = new Date(value); 
      
          if (subtaskDueDate > taskDueDate) {
            alert("Subtask's due date must be earlier than the task's due date.");
            return; 
          }
        }
        const updatedSubtasks = [...subtasks];
        updatedSubtasks[index][field] = value;
        setSubtasks(updatedSubtasks);
    };

    const handleAddSubtask = () => {
        setSubtasks([
          ...subtasks,
          {
            title: '',         
            assignedTo: '',    
            priority: 'low',    
            dueDate: '',        
            completed: false    
          }
        ]);
    };

    const getBackGroundColor = () => {
        const colors = ['#007bff'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const getUserInitials = (user) => {
        return user.username
            .split(' ')
            .map((name) => name[0])
            .join('')
            .toUpperCase();
    };

    const handleUserSelection = (userId) => {
        setSelectedUsers((prevSelectedUsers) =>
            prevSelectedUsers.includes(userId)
                ? prevSelectedUsers.filter((id) => id !== userId) 
                : [...prevSelectedUsers, userId] 
        );
    };

    const validateForm = (formValues) => {
        const newErrors = {};
        if (!taskName) newErrors.taskName = 'Task name is required';
        if (!selectedBoard) newErrors.selectedBoard = 'Project selection is required';
        if (!taskDescription) newErrors.taskDescription = 'Description is required';
        if (!formValues.priority) newErrors.priority = 'Priority is required';
        if (!formValues.dueDate) newErrors.dueDate = 'Due date is required';
        if (selectedUsers.length === 0) newErrors.selectedUsers = 'At least one user must be selected for the task';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateSubtasks = () => {
        const newErrors = {};
        subtasks.forEach((subtask, index) => {
            if (!subtask.assignedTo) {
                newErrors[`subtaskAssignee_${index}`] = `Subtask ${index + 1} must have an assignee.`;
            }
        });
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formValues = {
            priority: e.target.priority.value,
            dueDate: e.target.dueDate.value
        };

        if (!validateForm(formValues)) return;

        // Validate subtasks
        const subtaskErrors = validateSubtasks();
        setErrors((prevErrors) => ({ ...prevErrors, ...subtaskErrors }));

        if (Object.keys(subtaskErrors).length > 0) return; // If any subtask errors, stop submission

        const taskData = {
            title: taskName,
            description: taskDescription,
            assignees: selectedUsers,
            priority: formValues.priority,
            dueDate: formValues.dueDate,
            subtasks: subtasks
        };
        setLoading(true);

        try {
            const response = await createTaskAuth(token, selectedBoard, taskData);
            if (response.data.newTask) {
                onTaskCreated(response.data.newTask);  
                toggleModal(); 
            }
        } catch (error) {
            console.error('Error creating task:', error);
        }
        finally {
            setLoading(false); 
        }
    };

    return (
        <>
        {loading && (
            <div className="loading-overlay">
                <div className="loading-content">
                    <CSpinner color="primary" size="lg" />
                    <p>Please wait, your task is being created...</p>
                </div>
            </div>
        )}
       
        <CModal visible={isOpen} onClose={toggleModal} size="xl" backdrop="static">
            <CModalHeader>
                <CModalTitle>Create New Task</CModalTitle>
            </CModalHeader>
            <CModalBody>
                <CForm onSubmit={handleSubmit}>
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <strong>Task Name</strong>
                            <CFormInput 
                                placeholder="Task Name"
                                value={taskName}
                                onChange={(e) => setTaskName(e.target.value)} 
                                className="mb-2 mt-2"
                            />
                            {errors.taskName && <div className="text-danger">{errors.taskName}</div>}
                        </div>
                        <div className="col-md-6">
                            <strong>Project</strong>
                            <CFormSelect 
                                value={selectedBoard}
                                onChange={(e) => setSelectedBoard(e.target.value)}
                                className="mb-2 mt-2"
                            >
                                <option value="">Choose a project...</option>
                                {boards.map((board) => (
                                    <option key={board.id} value={board._id}>
                                        {board.title}
                                    </option>
                                ))}
                            </CFormSelect>
                            {errors.selectedBoard && <div className="text-danger">{errors.selectedBoard}</div>}
                        </div>
                    </div>
                    <div className="row mb-3 mt-2">
                        <div className="col-md-6">
                            <strong>Select Users</strong>
                            <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
                                {users.map((user) => (
                                    <div key={user._id} className="d-flex align-items-center mb-2">
                                        <div className="position-relative">
                                            <CAvatar
                                                size="sm"
                                                className="me-2"
                                                style={{ backgroundColor: getBackGroundColor(), cursor: 'pointer', color: 'white' }}
                                                onClick={() => handleUserSelection(user._id)}
                                            >
                                                {getUserInitials(user)}
                                            </CAvatar>
                                        </div>
                                        <span
                                            onClick={() => handleUserSelection(user._id)}
                                            className={`text-truncate ${selectedUsers.includes(user._id) ? 'fw-bold' : ''}`}
                                            style={{ maxWidth: '120px', cursor: 'pointer' }}
                                        >
                                            {user.username}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            {errors.selectedUsers && <div className="text-danger">{errors.selectedUsers}</div>}
                        </div>
                        <div className="col-md-6">
                            <strong>Priority</strong>
                            <CFormSelect name="priority" className="mb-2 mt-2">
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </CFormSelect>
                            {errors.priority && <div className="text-danger">{errors.priority}</div>}
                            <strong>Due Date</strong>
                            <CFormInput 
                                type="datetime-local" 
                                name="dueDate"
                                className="mb-2 mt-2" 
                                min={new Date().toISOString().slice(0, 16)} 
                            />
                            {errors.dueDate && <div className="text-danger">{errors.dueDate}</div>}
                        </div>
                    </div>
                    <div className="mb-3">
                        <strong>Subtasks</strong>
                        <table className="table table-striped table-bordered table-hover mt-2">
                            <thead className="table-light">
                                <tr style={{ fontSize: '13px' }}>
                                    <th scope="col">Title</th>
                                    <th scope="col">Assignee</th>
                                    <th scope="col">Due Date</th>
                                    <th scope="col">Priority</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subtasks.map((subtask, index) => (
                                    <tr key={index}>
                                        <td>
                                            <CFormInput
                                                value={subtask.title}
                                                onChange={(e) =>
                                                    handleSubtaskChange(index, "title", e.target.value)
                                                }
                                                placeholder="Subtask Title"
                                            />
                                        </td>
                                        <td>
                                            <CFormSelect
                                                value={subtask.assignedTo || ''}
                                                onChange={(e) =>
                                                    handleSubtaskChange(index, "assignedTo", e.target.value)
                                                }
                                            >
                                                <option value="">Select User</option>
                                                {users.map((user) => (
                                                    <option key={user._id} value={user._id}>
                                                        {user.username}
                                                    </option>
                                                ))}
                                            </CFormSelect>
                                            {errors[`subtaskAssignee_${index}`] && (
                                                <div className="text-danger">
                                                    {errors[`subtaskAssignee_${index}`]}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <CFormInput
                                                type="datetime-local"
                                                min={new Date().toISOString().slice(0, 16)}
                                                value={subtask.dueDate}
                                                onChange={(e) =>
                                                    handleSubtaskChange(index, "dueDate", e.target.value)
                                                }
                                            />
                                        </td>
                                        <td>
                                            <CFormSelect
                                                value={subtask.priority}
                                                onChange={(e) =>
                                                    handleSubtaskChange(index, "priority", e.target.value)
                                                }
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </CFormSelect>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button
                            type="button"
                            className="btn btn-link p-0 mt-3"
                            onClick={handleAddSubtask}
                        >
                            <FaPlusCircle /> Add Subtask
                        </button>
                    </div>
                    <div className="mb-3 mt-2">
                        <strong>Description</strong>
                        <CFormTextarea 
                            placeholder="Description"
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            rows={3}
                            className="mb-2 mt-2"
                        />
                        {errors.taskDescription && <div className="text-danger">{errors.taskDescription}</div>}
                    </div>
                    <CModalFooter>
                        <CButton color="secondary" onClick={toggleModal}>
                            Cancel
                        </CButton>
                        <CButton color="primary" type="submit">
                            Create Task
                        </CButton>
                    </CModalFooter>
                </CForm>
            </CModalBody>
        </CModal>
        </>
    );
};

export default CreateTaskModal;
