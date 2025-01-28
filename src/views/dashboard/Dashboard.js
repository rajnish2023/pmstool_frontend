import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUser, getUserProfile, createBoardAuth, getBoardsAuth, UpdateBoardAuth,createTaskAuth,getTasksAuth,updateTaskAuth,gettaskactivity,sendtaskactivity } from '../../api/api';
import {
  CCard, CCardBody, CCardHeader, CCol, CRow, CButton, CAlert,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CFormInput, CInputGroup, CAvatar, CToast
} from '@coreui/react';
import { FaPencilAlt, FaPlusCircle, FaTimes ,FaEye,FaTrashAlt,FaPaperclip,FaBell,FaFilter,FaPaperPlane ,FaThumbsUp,FaFileAlt ,FaDownload } from 'react-icons/fa';
import { io } from 'socket.io-client';

import './dashboard.css';


const Dashboard = () => {
  const [boards, setBoards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);  
  const [users, setUsers] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const [toastr, setToastr] = useState(null);
  const [editingBoard, setEditingBoard] = useState(null);   
   
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [editTaskModalVisible, setEditTaskModalVisible] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [selectedAssignees, setSelectedAssignees] = useState([]);  
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState('medium');
    const [selectedBoardForTask, setSelectedBoardForTask] = useState(null);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [TaskStatus, setTaskStatus] = useState('pending');

  const token = localStorage.getItem('token');
  const [subtasks, setSubtasks] = useState([]); 
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [messageContent, setMessageContent] = useState('');
  const [files, setFiles] = useState([]);
  const [filePreview, setFilePreview] = useState(null);


  const socket = io('https://pmstoolbackend.onrender.com'); 
  const APP_URL = 'https://pmstoolbackend.onrender.com';
     useEffect(() => {
            
            if (taskToEdit) {
                socket.emit('joinRoom', taskToEdit._id);  
                fetchTaskActivity(taskToEdit._id);   
            }
            return () => {
                if (taskToEdit) {
                    socket.emit('leaveRoom', taskToEdit._id); 
                }
            };
        }, [taskToEdit]);
    
        // Listen for new messages in the task room
        useEffect(() => {
            socket.on('newMessage', (newMessage) => {
                if (newMessage.taskId === taskToEdit._id) {
                    setChatMessages((prevMessages) => [...prevMessages, newMessage]);
                }
            });
    
            return () => {
                socket.off('newMessage');
            };
        }, [taskToEdit]);

         // Function to determine file type based on file extension
const getFileType = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();

  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];
  const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'xlsx'];

  if (imageExtensions.includes(extension)) {
    return 'image';
  } else if (documentExtensions.includes(extension)) {
    return 'document';
  } else {
    return 'unknown'; // For unsupported file types
  }
};


            // Handle file selection and preview
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        // Preview for image files
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview({ type: 'image', content: reader.result });
        };
        reader.readAsDataURL(file);
      } else {
        // Preview template for other files
setFilePreview({ type: 'document', name: file.name, url: URL.createObjectURL(file) });
      }
      setFiles(event.target.files); // Store the selected file(s)
    }
  };
 
  // Remove the selected file
  const removeFile = () => {
    setFiles(null);
    setFilePreview(null);
  };
 
  const handleSendMessage = async () => {
    if (!taskToEdit || !messageContent || !userDetails._id) {
      alert('Please type a massage to continue.');
      return;
    }
      
  
    const formData = new FormData();
    formData.append('taskId', taskToEdit._id);
    formData.append('content', messageContent);
    formData.append('sender', userDetails._id);
  
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        if (files[i] && files[i].size > 0) {
          formData.append('attachments', files[i]);
        }
      }
    }
  
    try {
       const response = await sendtaskactivity(token, formData);
        socket.emit('newMessage', {
        taskId: taskToEdit._id,
        content: messageContent.trim(),
        sender: userDetails,
        attachments: response.data.newMessage.attachments || [],
        createdAt: response.data.newMessage.createdAt
        });
      setFilePreview('');
      setMessageContent('');  
      setFiles([]);  
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  
  
   useEffect(() => {
            socket.on("newMessage", (newMessage) => {
              if (newMessage.taskId === taskToEdit) {
                setChatMessages((prevMessages) => [...prevMessages, newMessage]);
              }
            });
         
            return () => {
              socket.off("newMessage");
            };
          }, [taskToEdit]);


  const fetchTaskActivity = async (taskToEdit) => {
    try {
      const response = await gettaskactivity(token, taskToEdit);
      setChatMessages(response.data);
    } catch (error) {
      console.error('Error fetching task activity:', error);
    }
  };

  useEffect(() => {
    if (taskToEdit) {
      fetchTaskActivity(taskToEdit._id);
    }
  }, [taskToEdit]);

  useEffect(() => {
    const messagesArea = document.getElementById("chat-messages");
    if (messagesArea) {
      messagesArea.scrollTop = messagesArea.scrollHeight;
    }
  }, [chatMessages]);

  // Handle subtask change
  const handleSubtaskChange = (index, field, value) => {
    if (field === 'dueDate') {
      const taskDueDate = new Date(dueDate);  
      const subtaskDueDate = new Date(value); 
  
      if (subtaskDueDate > taskDueDate) {
        alert("Subtask's due date must be earlier than the task's due date.");
        return; // Prevent further processing if the validation fails
      }
    }
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index][field] = value;
    setSubtasks(updatedSubtasks);
  };

  // Handle adding new subtask
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

  // Handle remove subtask
  const handleRemoveSubtask = (index) => {
    const updatedSubtasks = subtasks.filter((_, i) => i !== index);
    setSubtasks(updatedSubtasks);
  };

  // Fetch user profile
  const getUserDetails = async () => {
    try {
      const response = await getUserProfile(token);
      setUserDetails(response.data);
    } catch (error) {
      console.error('Error fetching user details', error);
    }
  };

  // Fetch boards data
  const fetchBoards = async () => {
    try {
      const response = await getBoardsAuth(token);
      if (Array.isArray(response.data)) {
        setBoards(response.data);
        response.data.forEach(board => fetchTasksForBoard(board._id));
      } else {
        setError('Unexpected data format. Boards should be an array.');
      }
    } catch (error) {
      setError('Error fetching boards. Please try again later.');
      console.error('Error fetching boards', error);
    }
  };

  // Fetch users for assignment
  const fetchUsers = async () => {
    try {
      const userData = await getUser(); // Assuming this API provides the list of users
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

  // Create board
  const handleCreateBoard = async () => {
    try {
      const newBoardData = await createBoardAuth(token, {
        title: newBoardTitle,
        slug: newBoardTitle.toLowerCase().replace(/\s+/g, '-'),
        users: selectedUsers,
      });

      setBoards([...boards, newBoardData.data]);
      setNewBoardTitle('');
      setSelectedUsers([]);
      setShowModal(false);
      fetchBoards();

      // Show success message using CToast
      setToastr(
        <CToast
          visible={true}
          color="success"
          autohide={3000}
        >
          Project created successfully!
        </CToast>
      );
      
    } catch (error) {
      setError('Error creating board. Please try again later.');
      console.error('Error creating board', error);
    }
  };

  // Update board (edit)
  const handleEditBoard = async () => {
    try {
      if (!editingBoard) return; // Ensure a board is selected for editing

      const updatedBoardData = await UpdateBoardAuth(token, editingBoard._id, {
        title: newBoardTitle,
        slug: newBoardTitle.toLowerCase().replace(/\s+/g, '-'),
        users: selectedUsers,
      });

      // Update the board in the UI
      setBoards((prevBoards) =>
        prevBoards.map((board) =>
          board._id === editingBoard._id ? updatedBoardData.data : board
        )
      );
      setNewBoardTitle('');
      setSelectedUsers([]);
      setEditModal(false);
      fetchBoards();

      // Show success message using CToast
      setToastr(
        <CToast
          visible={true}
          color="success"
          autohide={3000}
        >
          Project updated successfully!
        </CToast>
      );
    } catch (error) {
      setError('Error updating board. Please try again later.');
      console.error('Error updating board', error);
    }
  };

   const fetchTasksForBoard = async (boardId) => {
      try {
        const data = await getTasksAuth(token,boardId);
         const tasksd = data.data;
        setBoards((prevBoards) =>
          prevBoards.map((board) =>
            board._id === boardId ? { ...board, tasks:tasksd  } : board
          )
        );
      } catch (error) {
         
        console.error('Error fetching tasks', error);
      }
    };

  const handleCreateTask = async () => {
      if (!newTaskTitle || !selectedBoardForTask) return;
      const taskData = {
        title: newTaskTitle,
        description: taskDescription,     
        assignees: selectedAssignees,     
        dueDate,                         
        priority,                        
      };
    
      try {
        
        const task = await createTaskAuth(token,selectedBoardForTask, taskData);
        const tasksd = task.data;
        
        setBoards((prevBoards) =>
          prevBoards.map((board) =>
            board._id === selectedBoardForTask
              ? { ...board, tasks:tasksd } 
              : board
              
          )
        );
        fetchTasksForBoard(selectedBoardForTask);
    
         
        setNewTaskTitle('');
        setTaskDescription('');
        setDueDate('');
        setPriority('medium');
        setSelectedAssignees([]);
        setTaskModalVisible(false);  
      } catch (error) {
        setError('Error creating task. Please try again later.');
        console.error('Error creating task', error);
      }
    };


    //Edit Task with task id and board id of authuser

    const handleEditTaskClick = (task) => {
     setSelectedBoardForTask(task.board);
     setTaskToEdit(task);
     setNewTaskTitle(task.title);
     setTaskDescription(task.description);
     setDueDate(task.dueDate || '');
     setPriority(task.priority);
     setTaskStatus(task.status);
     setSelectedAssignees(task.assignees);
     setEditTaskModalVisible(true);
     setSubtasks(task.subtasks || []);
   };


  // Handle user selection for task assignment
  const handleTaskUserSelection = (userId) => {
    setSelectedAssignees((prevSelected) => {
      if (prevSelected.includes(userId)) {
        return prevSelected.filter((id) => id !== userId); 
      } else {
        return [...prevSelected, userId];  
      }
    });
  };

//Edit Task with task id and board id of authuser

const handleEditTask = async () => {
    if (!newTaskTitle || !taskToEdit) return;

    const updatedTaskData = {
      title: newTaskTitle,
      description: taskDescription,     
      assignees: selectedAssignees,     
      dueDate,                         
      priority,
      TaskStatus,  
      subtasks                      
    };

    try {
      const updatedTask = await updateTaskAuth(token,taskToEdit._id, updatedTaskData);
       
      setBoards((prevBoards) =>
        prevBoards.map((board) =>
          board._id === selectedBoardForTask
            ? {
                ...board,
                tasks: board.tasks.map((task) =>
                  task._id === taskToEdit._id ? updatedTask.data.task : task
                ),
              }
            : board
        )
      );
      fetchTasksForBoard(selectedBoardForTask);
      setEditTaskModalVisible(false);
      setTaskToEdit(null);
    } catch (error) {
      setError('Error editing task. Please try again later.');
      console.error('Error editing task', error);
    }
  };

  //Refresh Task Modal
  const RefreshTaskModal = (boardId) => {
    setSelectedBoardForTask(boardId);
    setNewTaskTitle('');
    setTaskDescription('');
    setDueDate('');
    setPriority('medium');
    setSelectedAssignees([]);
  };


  // Fetch data when component mounts
  useEffect(() => {
    fetchBoards();
    fetchUsers();  // Fetch users for selection
    getUserDetails();
  }, []);

  // Filter boards based on search term
  const filteredBoards = boards.filter(board =>
    board.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get initials of the user
  const getUserInitials = (user) => {
    return user.username
      .split(' ')
      .map((name) => name[0])
      .join('')
      .toUpperCase();
  };

  // Get background color for user avatar
  const getBackGroundColor = () => {
    const colors = ['#007bff'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Handle user selection for assignment
  const handleUserSelection = (userId) => {
    setSelectedUsers((prevSelectedUsers) =>
      prevSelectedUsers.includes(userId)
        ? prevSelectedUsers.filter((id) => id !== userId) // Remove user if already selected
        : [...prevSelectedUsers, userId] // Add user to selection
    );
  };

  // Set the board to be edited
  const openEditModal = (board) => {
    setEditingBoard(board);
    setNewBoardTitle(board.title);
    setSelectedUsers(board.users.map(user => user));
    setEditModal(true);
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4" style={{ border: '1px solid #ddd', borderRadius: '10px' }}>
          <CCardHeader className="d-flex justify-content-between align-items-center border-0" style={{ backgroundColor: '#f8f9fa' }}>
            <div className="d-flex align-items-center">
              <strong className="fs-4">Projects</strong>
            </div>
            <div className="d-flex align-items-center">
              {/* <CButton color="warning" className="me-3" variant="outline"><Link to="/today-tasks" style={{ textDecoration: 'none' }}>
  Today Tasks
</Link></CButton> */}
              {(userDetails.role === '2') && (
                <CButton
                  color="primary"
                  variant="outline"
                  className="me-3"
                  onClick={() => {
                    setNewBoardTitle('');
                    setSelectedUsers([]);
                    setShowModal(true);
                  }}
                >
                  Create Project
                </CButton>
              )}
              <CInputGroup style={{ width: '250px' }} className="rounded-pill">
                <CFormInput
                  placeholder="Search for projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-pill"
                />
              </CInputGroup>
            </div>
          </CCardHeader>
          <CCardBody>
  {error && <CAlert color="danger">{error}</CAlert>}
  {filteredBoards.length > 0 ? (
    <div className="row">
      {filteredBoards.map((board) => (
        <div key={board._id} className="col-md-6 mb-4">
          <div className="border p-2 rounded" style={{ border: '1px solid #ddd' }}>
            <div className="d-flex justify-content-between align-items-center" style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
              <span className="h5 mb-0">{board.title}</span>
              <CButton
                size="sm"
                color="primary"
                variant="outline"
                onClick={() => openEditModal(board)}
              >
                Edit
              </CButton>
            </div>
            <div className="mt-3">
              {board.tasks && board.tasks.length > 0 ? (
                <table className="table table-striped table-bordered table-hover">
                  <thead className="table-light">
                    <tr style={{ fontSize: '13px' }}>
                      <th scope="col">Title</th>
                      <th scope="col">Assignees</th>
                      <th scope="col">Due Date</th>
                      <th scope="col">Priority</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {board.tasks.map((task) => (
                      <tr key={task._id} style={{ fontSize: '13px' }}>
                        <td>{task.title}</td>
                        <td>
                          {task.assignees && task.assignees.length > 0 ? (
                            task.assignees.map((assignee) => {
                              const user = users.find(user => user._id === assignee);
                              if (user) {
                                const username = user.username;
                                // const firstLetter = username.charAt(0).toUpperCase();
                                // const lastLetter = username.charAt(username.length - 1).toUpperCase();
                                const initials = username.split(' ').map((name) => name.charAt(0).toUpperCase()).join('');
                                return (
                                  <span
                                    key={assignee}
                                    className="badge bg-primary me-2"
                                    style={{ borderRadius: '50%', padding: '10px' }}
                                  >
                                    {/* {firstLetter}{lastLetter} */}
                                    { initials}
                                  </span>
                                );
                              }
                              return (
                                <span key={assignee} className="badge bg-secondary me-2">Unknown</span>
                              );
                            })
                          ) : (
                            <span className="text-muted">No Assignees</span>
                          )}
                        </td>
                        <td>
                        {task.dueDate
  ? new Date(task.dueDate).toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric', 
      timeZone: 'Asia/Kolkata' 
    })
  : 'Not Set'}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              task.priority === 'high'
                                ? 'bg-danger'
                                : task.priority === 'medium'
                                ? 'bg-warning'
                                : 'bg-success'
                            }`}
                          >
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex justify-content-around" style={{ cursor: 'pointer' }}>
                            <CButton size="sm" onClick={() => handleEditTaskClick(task)}>
                              <FaEye/>
                            </CButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center">No tasks found</div>
              )}
              <CButton
                color="primary"
                variant="outline"
                size="sm"
                onClick={() => {
                  RefreshTaskModal(board._id);
                  setTaskModalVisible(true);
                }}
              >
                Create Task
              </CButton>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <CCol>
      <CCardBody className="text-center">
        <h5>No projects found</h5>
      </CCardBody>
    </CCol>
  )}
</CCardBody>
</CCard>
</CCol>

      {/* Create Board Modal */}
      <CModal visible={showModal} onClose={() => setShowModal(false)} className="rounded-3" backdrop="static">
        <CModalHeader className="border-0">
          <CModalTitle>Create Project</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            value={newBoardTitle}
            onChange={(e) => setNewBoardTitle(e.target.value)}
            placeholder="Board Title"
            className="mb-3"
          />
          
          {/* User Assignment Section */}
          <div className="mb-3">
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
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleCreateBoard} className="rounded-pill">
            Create
          </CButton>
          <CButton color="secondary" onClick={() => setShowModal(false)} className="rounded-pill">
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Edit Board Modal */}
      <CModal visible={editModal} onClose={() => setEditModal(false)} className="rounded-3">
        <CModalHeader className="border-0">
          <CModalTitle>Edit Project</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            value={newBoardTitle}
            onChange={(e) => setNewBoardTitle(e.target.value)}
            placeholder="Board Title"
            className="mb-3"
          />
          
          {/* User Assignment Section */}
          <div className="mb-3">
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
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleEditBoard} className="rounded-pill">
            Update
          </CButton>
          <CButton color="secondary" onClick={() => setEditModal(false)} className="rounded-pill">
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>

         {/* Create Task Modal */}
            <CModal visible={taskModalVisible} onClose={() => setTaskModalVisible(false)} className="rounded-3" backdrop="static" size="xl">
              <CModalHeader className="border-0">
                <CModalTitle>Create Task</CModalTitle>
              </CModalHeader>
              <CRow>
                <CCol xs={12}>
                <CModalBody>
                <strong>Task</strong>
                <CFormInput
                  placeholder="Task Title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="mb-3"
                />
                <strong>Description</strong>
                <textarea
                  placeholder="Task Description"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="form-control mb-3"
                />
                <div className="mb-3">
                  <strong>Assignees</strong>
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {boards.find(board => board._id === selectedBoardForTask)?.users.map((user) => (
                      <div key={user} className="d-flex align-items-center mb-2">
                        <div className="position-relative">
                          <CAvatar
                            size="sm"
                            className="me-2"
                            style={{ backgroundColor: getBackGroundColor(), cursor: 'pointer',color:'white' }}
                            onClick={() => handleTaskUserSelection( user)}
                          >
                            {getUserInitials(users.find(u => u._id === user))}
                          </CAvatar>
                        </div>
                        <span
                          onClick={() => handleTaskUserSelection(user)}
                          className={`text-truncate ${selectedAssignees.includes(user) ? 'fw-bold' : ''}`}
                          style={{ maxWidth: '120px', cursor: 'pointer' }}
                        >
                          {users.find(u => u._id === user)?.username}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <strong>Due Date</strong>
                <CFormInput
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mb-3"
                />
                <div className="mb-3">
                  <strong>Priority</strong>
                  <select
                    className="form-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </CModalBody>
              <CModalFooter>
                <CButton color="primary" onClick={handleCreateTask} className="rounded-pill">
                  Create Task
                </CButton>
                <CButton color="secondary" onClick={() => setTaskModalVisible(false)} className="rounded-pill">
                  Cancel
                </CButton>
              </CModalFooter>
                </CCol>
              </CRow>
              
            </CModal>


         {/* Edit Task Modal */}
         <CModal visible={editTaskModalVisible} onClose={() => setEditTaskModalVisible(false)} className="rounded-3" backdrop="static" size="xl">
          <CModalHeader className="border-0">
          <CModalTitle>Edit Task</CModalTitle>
          </CModalHeader>
          <CRow>
            <CCol xs={7}>
            <CModalBody>
          <strong>Task</strong>
          <CFormInput
          placeholder="Task Title"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="mb-3"
          />
          <strong>Description</strong>
          <textarea
          placeholder="Task Description"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          className="form-control mb-3"
          />

          <div className="mb-3">
          <strong>Assignees</strong>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {boards.find(board => board._id === selectedBoardForTask)?.users.map((user) => (
              <div key={user} className="d-flex align-items-center mb-2">
                <CAvatar
                  size="sm"
                  className="me-2"
                  style={{ backgroundColor: getBackGroundColor(), cursor: 'pointer', color: 'white' }}
                  onClick={() => handleTaskUserSelection(users.find(u => u._id === user))}
                >
                  {getUserInitials(users.find(u => u._id === user))}
                </CAvatar>
                <span
                  onClick={() => handleTaskUserSelection(user)}
                  className={`text-truncate ${selectedAssignees.includes(user) ? 'fw-bold' : ''}`}
                  style={{ maxWidth: '120px', cursor: 'pointer' }}
                >
                  {users.find(u => u._id === user)?.username}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-3">
        <strong>Subtasks</strong>
        {/* Display the subtasks */}
        <div className="mb-4">
        {subtasks.length > 0 ? (
        <table className="table table-striped table-bordered table-hover">
          <thead className="table-light">
            <tr style={{ fontSize: '13px' }}>
              <th scope="col">Title</th>
              <th scope="col">Assignee</th>
              <th scope="col">Due Date</th>
              <th scope="col">Priority</th>
              {/* <th scope="col">Action</th> */}
            </tr>
          </thead>
          <tbody>
            {subtasks.map((subtask, index) => (
              <tr key={index} style={{ fontSize: '13px' }}>
                {/* Subtask Title */}
                <td>
                  <input
                    type="text"
                    placeholder="Subtask Title"
                    value={subtask.title}
                    onChange={(e) => handleSubtaskChange(index, 'title', e.target.value)}
                    className={`form-control ${subtask.completed ? 'text-decoration-line-through' : ''}`}
                    disabled={subtask.completed}
                  />
                </td>

                {/* Assignees */}
                <td>
                      <select
                        className="form-select"
                        value={subtask.assignedTo || ''}
                        onChange={(e) => handleSubtaskChange(index, 'assignedTo', e.target.value)}
                        disabled={subtask.completed}
                      >
                        <option value="">Assign User</option>
                        {boards
                          .find(board => board._id === selectedBoardForTask)
                          ?.users.map((user) => (
                            <option key={user} value={user}>
                              {users.find((u) => u._id === user)?.username}
                            </option>
                          ))}
                      </select>
                    </td>

                    {/* Due Date */}
                    <td>
                      <CFormInput
                        type="datetime-local"
                        value={subtask.dueDate ? new Date(subtask.dueDate).toISOString().slice(0, 16) : ''}
                        onChange={(e) => handleSubtaskChange(index, 'dueDate', e.target.value)}
                        disabled={subtask.completed}
                      />
                    </td>

                    {/* Priority */}
                    <td>
                      <select
                        className="form-select"
                        value={subtask.priority}
                        onChange={(e) => handleSubtaskChange(index, 'priority', e.target.value)}
                        disabled={subtask.completed}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </td>

                {/* Action */}
                {/* <td>
                  <div className="d-flex justify-content-around" style={{ cursor: 'pointer' }}>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleRemoveSubtask(index)}
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
        ) : (
          <p className="text-muted">No subtasks added yet.</p> 
        )}

        {/* Add new subtask */}
        <button
          type="button"
          className="btn btn-link p-0 mt-3"
          onClick={handleAddSubtask}
        >
          <FaPlusCircle /> Add Subtask
        </button>
      </div>
      </div>

        <strong>Due Date</strong>
        <CFormInput
          type="datetime-local"
          value={dueDate ? new Date(dueDate).toISOString().slice(0, 16) : ''}
          onChange={(e) => setDueDate(e.target.value)}
          className="mb-3"
        />

        <div className="mb-3">
          <strong>Priority</strong>
          <select
            className="form-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="mb-3">
          <strong>Task Status</strong>
          <select className="form-select"
          value={TaskStatus}
          onChange={(e) => setTaskStatus(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </CModalBody>

      <CModalFooter>
        <CButton color="primary" onClick={handleEditTask} className="rounded-pill">
          Save Changes
        </CButton>
        <CButton color="secondary" onClick={() => setEditTaskModalVisible(false)} className="rounded-pill">
          Cancel
        </CButton>
      </CModalFooter>
            </CCol>
            <CCol xs={5}>
                <div className="chat-dashboard d-flex flex-column" style={{ height: '80vh', backgroundColor: '#f9fafb' }}>
                {/* Activity Header */}
              <div className="activity-header px-4 py-3 d-flex align-items-center border-bottom bg-white shadow-sm">
              <strong className="flex-grow-1 fs-5 text-dark">Activity</strong>
              </div>
              {/* Messages Area */}
              <div id="chat-messages" className="messages-area flex-grow-1 overflow-auto px-4 py-3" style={{ backgroundColor: '#f1f3f4', borderRadius: '15px', margin: '10px' }}>
              {chatMessages.length === 0 ? (
              <div className="no-messages text-center text-muted">No messages yet.</div>
             ) : (
              chatMessages.map((msg, index) => (
            <div
            key={index}
            className={`chat-message d-flex mb-4 ${msg.sender._id === userDetails._id ? 'justify-content-end' : 'justify-content-start'}`}
            >
            
          {/* Message Content */}
          <div className="message-content" style={{ maxWidth: '90%', width:'90%' }}>
          <div
           className="p-3"
           style={{
           backgroundColor: msg.sender._id === userDetails._id ? '#6c757d14' : '#ffffff',
           borderRadius: '15px',
          //  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
           transition: 'box-shadow 0.3s ease',
           }}
           >
          <div className="d-flex justify-content-between mb-2">
          <span
           className="timestamp text-muted"
          style={{ fontSize: '0.75rem' }}
          >
          {new Date(msg.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}
        </span>
        </div>
        {/* Avatar for Current User */}
        {msg.sender._id && (
        <div className="d-flex align-items-center mb-2">
        <div
          className="avatar d-flex align-items-center justify-content-center rounded-circle bg-primary text-white"
          style={{
            width: '20px',
            height: '20px',
            fontSize: '0.75rem',
            marginRight: '10px', 
          }}
        >
          {msg.sender.username[0].toUpperCase()}
         </div>
         <div className="username text-muted" style={{ fontSize: '0.8rem' }}>
          {msg.sender.username}
        </div>
      </div>
    )}
    <p
      className="message-text mb-0"
      style={{ fontSize: '1rem', color: '#333', lineHeight: '1.5' }}
    >
      {msg.content}
    </p>
    {/* Display File Attachment */}
    {msg.attachments && msg.attachments.length > 0 && (
      <div className="file-attachment mt-3">
        {/* Check file type using the file extension */}
        {getFileType(msg.attachments[0]) === 'image' ? (
          <div style={{ position: 'relative' }}>
            <img
              src={`${APP_URL}/uploads/${msg.attachments[0]}`} // Adjust to the correct file path
              alt="attachment"
              style={{
                width: '100%',
                height: '150px',
                objectFit: 'cover',
                borderRadius: '10px',
              }}
            />
            {/* Positioned Download Icon for Image */}
            <a
              href={`${APP_URL}/uploads/${msg.attachments[0]}`} // Adjust to the correct file path
              download={msg.attachments[0]}
              target="_blank"
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgb(0, 123, 255)',
                color: 'white',
                padding: '5px',
                borderRadius: '5px',
                textDecoration: 'none',
                zIndex: 1, // Ensure the icon is on top of the image
              }}
            >
              <FaDownload />
            </a>
          </div>
        ) : (
          <div
            style={{
              width: '100px',
              height: '100px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#f9f9f9',
              borderRadius: '5px',
              position: 'relative', // Ensure relative positioning for the download icon
            }}
          >
            <FaFileAlt size={40} color="#007bff" />
            {/* Positioned Download Icon for Documents */}
            <a
              href={`${APP_URL}/uploads/${msg.attachments[0]}`} // Adjust to the correct file path
              download={msg.attachments[0]}
              target="_blank"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)', // Center the download button
                background: 'rgb(0, 123, 255)',
                color: 'white',
                padding: '5px',
                borderRadius: '5px',
                textDecoration: 'none',
                zIndex: 1, // Ensure the icon is on top of the document icon
              }}
            >
              <FaDownload />
            </a>
          </div>
        )}
      </div>
    )}
    </div>
    </div>
    </div>
      ))
    )}
  </div>
{/* File Preview */}
    {filePreview && (
      <div
        className="file-preview"
        style={{
          position: 'relative',
          display: 'inline-block',
          marginBottom: '10px',
          marginLeft:'10px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          overflow: 'hidden',
          maxWidth: '120px',
          height: '100px', // Set a fixed height for proper preview alignment
          background: '#fff',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.3s ease-in-out',
        }}
      >
        {/* Preview for image */}
        {filePreview.type === 'image' ? (
          <img
            src={filePreview.content}
            alt="file preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          // Preview for file types
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#f9f9f9',
              borderRadius: '5px',
            }}
          >
            <FaFileAlt size={40} color="#007bff" />
          </div>
        )}

        {/* Only show Download Button for files (not images) */}
        {filePreview.type !== 'image' && (
          <a
            href={filePreview.url}
            download={filePreview.name}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)', // Center the button
              background: 'rgba(0, 123, 255, 0.7)', // Slightly transparent blue
              color: '#fff',
              padding: '8px',
              borderRadius: '50%',
              textDecoration: 'none',
              fontSize: '16px',
              zIndex: 2, // Ensure it's on top of the preview
            }}
            onMouseEnter={(e) => (e.target.style.background = '#0056b3')}
            onMouseLeave={(e) => (e.target.style.background = 'rgba(0, 123, 255, 0.7)')}
          >
            <FaDownload size={18} />
          </a>
        )}

        {/* Cross Icon to Remove File */}
        <button
          onClick={removeFile}
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            background: 'rgb(0, 123, 255)',
            border: 'none',
            color: 'white',
            borderRadius: '50%',
            cursor: 'pointer',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={(e) => (e.target.style.background = 'rgba(0, 0, 0, 0.7)')}
          onMouseLeave={(e) => (e.target.style.background = 'rgba(0, 0, 0, 0.5)')}
        >
          <FaTimes size={12} />
        </button>
      </div>
    )}

  {/* Input Area */}
  <div className="chat-input d-flex align-items-center px-4 py-3 border-top bg-white shadow-sm">
    <div className="input-container w-100 d-flex align-items-center">
      {/* File Upload */}
      <input
        type="file"
        id="file-upload"
        className="d-none"
        multiple
        // onChange={(e) => setFiles(e.target.files)}
        onChange={handleFileChange}
      />
      <label htmlFor="file-upload" className="btn btn-light me-2 p-2 rounded-circle shadow-sm">
        <FaPaperclip />
      </label>

      {/* Message Input Box */}
      <textarea
        className="form-control me-2"
        placeholder="Type a message..."
        value={messageContent}
        onChange={(e) => setMessageContent(e.target.value)}
        rows="1"
        style={{ resize: 'none', maxHeight: '100px', borderRadius: '25px', fontSize: '1rem' }}
      />

      {/* Send Button */}
      <button
        className="btn btn-primary d-flex justify-content-center align-items-center p-3 rounded-circle shadow-sm"
        onClick={handleSendMessage}
        disabled={!messageContent.trim()}
        style={{ width: '50px', height: '50px' }}
      >
        <FaPaperPlane />
      </button>
    </div>
  </div>
</div>
</CCol>
  </CRow>  
    </CModal>
      {/* Toastr Notifications */}
      {toastr}
    </CRow>
  );
};

export default Dashboard;
