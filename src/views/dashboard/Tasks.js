import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CCard, CCardBody, CCardHeader, CCol, CButton, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle,CRow , CModal,CModalTitle , CModalHeader, CModalBody, CModalFooter, CFormInput, CProgress } from '@coreui/react';
import {FaPlus ,FaComments,FaTimes,FaPaperclip,FaPaperPlane,FaFileAlt,FaDownload,FaEye} from 'react-icons/fa';
import './dashboard.css';
import { getTasksByStatusAuth, updateTaskStatusAuth, updateTaskProgressAuth,updateSubTaskProgressAuth,getUserProfile,sendtaskactivity,gettaskactivity } from '../../api/api';  // Import API functions
import CreateTaskModal from './StaffCreateTask';
import { io } from 'socket.io-client';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const socket = io('https://pmstoolbackend.onrender.com');
const APP_URL = 'https://pmstoolbackend.onrender.com';
 
const Tasks = () => {
    const [tasks, setTasks] = useState([]);  
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showProgressModal, setShowProgressModal] = useState(false);  
    const [showSubtaskProgressModal, setShowSubtaskProgressModal] = useState(false); 
    const [progress, setProgress] = useState(null); 
    const [subtaskprogress, setSubtaskProgress] = useState(null);  
    const [selectedTaskId, setSelectedTaskId] = useState(null);  
    const [selectedSubTaskId, setSelectedSubTaskId] = useState(null); 
    const token = localStorage.getItem('token');
    const { status } = useParams();
    const [openChats, setOpenChats] = useState({});
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [filePreview, setFilePreview] = useState(null);
    const [messageContent, setMessageContent] = useState('');
     const [files, setFiles] = useState(null);
     const [userDetails, setUserDetails] = useState({});
     const [editTaskModalVisible, setEditTaskModalVisible] = useState(false);
     const [newTaskTitle, setNewTaskTitle] = useState('');
     const [taskDescription, setTaskDescription] = useState('');
 
    const openCreateTaskModal = () => {
        setIsModalOpen(true);  
    };
 
    const closeCreateTaskModal = () => {
        setIsModalOpen(false); 
    };
 
    const handleTaskCreated = (newTask) => {
        setTasks((prevTasks) => [newTask, ...prevTasks]);
        closeCreateTaskModal();
    };
   
     const getUserDetails = async () => {
            try {
              const response = await getUserProfile(token);
              setUserDetails(response.data);
            } catch (error) {
              console.error('Error fetching user details', error);
            }
          };

          const getFileType = (fileName) => {
            const extension = fileName.split('.').pop().toLowerCase();
          
            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];
            const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'xlsx'];
          
            if (imageExtensions.includes(extension)) {
              return 'image';
            } else if (documentExtensions.includes(extension)) {
              return 'document';
            } else {
              return 'unknown'; 
            }
          };
      
      const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
          if (file.type.startsWith('image/')) {
           
            const reader = new FileReader();
            reader.onloadend = () => {
              setFilePreview({ type: 'image', content: reader.result });
            };
            reader.readAsDataURL(file);
          } else {
             setFilePreview({ type: 'document', name: file.name, url: URL.createObjectURL(file) });
          }
          setFiles(event.target.files);  
        }
      };
     
     
    const removeFile = () => {
        setFiles(null);
        setFilePreview(null);
      };

    const toggleChat = (taskId) => {
        setTaskToEdit(taskId);
        setOpenChats((prevState) => ({
          ...prevState,
          [taskId]: !prevState[taskId],
        }));
      };

       useEffect(() => {
                  
                  if (taskToEdit) {
                      socket.emit('joinRoom', taskToEdit);  
                      fetchTaskActivity(taskToEdit);   
                  }
                  return () => {
                      if (taskToEdit) {
                          socket.emit('leaveRoom', taskToEdit); 
                      }
                  };
              }, [taskToEdit]);
          
              // Listen for new messages in the task room
              useEffect(() => {
                  socket.on('newMessage', (newMessage) => {
                      console.log(newMessage);
                      if (newMessage.taskId === taskToEdit) {
                          setChatMessages((prevMessages) => [...prevMessages, newMessage]);
                      }
                  });
          
                  return () => {
                      socket.off('newMessage');
                  };
              }, [taskToEdit]);
 
      const handleSendMessage = async (task) => {
                  if (!task || !messageContent.trim() || !userDetails._id) {
                      alert('Please type a massage to continue.');
                      return;
                  }
          
                  const formData = new FormData();
                  formData.append('taskId', task._id);
                  formData.append('content', messageContent.trim());
                  formData.append('sender', userDetails._id);
          
                  if (files && files.length > 0) {
                      Array.from(files).forEach((file) => {
                          if (file.size > 0) {
                              formData.append('attachments', file);
                          }
                      });
                  }
          
                  try {
                     
                      const response = await sendtaskactivity(token, formData);
                      socket.emit('newMessage', {
                          taskId: task._id,
                          content: messageContent.trim(),
                          sender: userDetails,
                          attachments: response.data.newMessage.attachments || [],
                          createdAt: response.data.newMessage.createdAt
                          
                      });
                      setFilePreview('')
                      setMessageContent('');   
                      setFiles(null);   
                  } catch (error) {
                      console.error('Error sending message:', error);
                      alert('Failed to send the message. Please try again.');
                  }
              };
     
const fetchTaskActivity = async (taskId) => {
            try {
               
                const response = await gettaskactivity(token, taskId);
                setChatMessages(response.data);
            } catch (error) {
                console.error('Error fetching task activity:', error);
            }
        };

        const handleEditTaskClick = (task) => {
          setNewTaskTitle(task.title);
          setTaskDescription(task.description);
          setEditTaskModalVisible(true);
           
        };

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                if (!token) {
                    throw new Error('Authentication token is missing.');
                }
 
                const response = await getTasksByStatusAuth(token, status);  
                if (response && response.data) {
                    setTasks(response.data); 
                } else {
                    throw new Error('No tasks found.');
                }
            } catch (err) {
                setError(err.message); 
                console.error('Error fetching tasks:', err);
            } finally {
                setLoading(false);  
            }
        };
 
        fetchTasks();
        getUserDetails();
    }, [token, status]);  
 
     useEffect(() => {
                const messagesArea = document.getElementById("chat-messages");
                if (messagesArea) {
                  messagesArea.scrollTop = messagesArea.scrollHeight;
                }
              }, [chatMessages]);
    // Function to check if the task is past due and not completed
    const isPastDue = (dueDate, status) => {
        const taskDueDate = new Date(dueDate);
        const currentDate = new Date();
 
        const taskDueDateStr = taskDueDate.toISOString().split('T')[0];
        const currentDateStr = currentDate.toISOString().split('T')[0];
 
        return taskDueDateStr < currentDateStr && status !== 'completed';
    };
 
    // Function to handle status update
    const handleStatusChange = async (taskId, newStatus) => {
        try {
            const response = await updateTaskStatusAuth(token, taskId, newStatus);
            if (response && response.data) {
                // Update the task status locally without re-fetching
                setTasks(prevTasks => prevTasks.map(task => task._id === taskId ? { ...task, status: newStatus } : task));
            }
        } catch (err) {
            console.error('Error updating task status:', err);
        }
    };
 
    // Function to handle progress update
    const handleProgressChange = async () => {
        if (progress < 0 || progress > 100) {
            alert('Please enter a valid percentage (0-100)');
            return;
        }
 
        try {
            const response = await updateTaskProgressAuth(token, selectedTaskId, progress); // Update task progress
            if (response && response.data) {
                // Update the task progress locally without re-fetching
                setTasks(prevTasks => prevTasks.map(task =>
                    task._id === selectedTaskId ? { ...task, progress } : task
                ));
                setShowProgressModal(false); // Close the modal after update
            }
        } catch (err) {
            console.error('Error updating task progress:', err);
        }
    };

    // Function to handle subtask progress update

    const handleSubtaskProgressChange = async () => {
        if (subtaskprogress < 0 || subtaskprogress > 100) {
            alert('Please enter a valid percentage (0-100)');
            return;
        }

        try {
            const response = await updateSubTaskProgressAuth(token,selectedTaskId,selectedSubTaskId, subtaskprogress); // Update task progress

            if (response && response.data.task) {
                // Update the subtask progress locally without re-fetching
                setTasks(prevTasks => prevTasks.map(task =>
                    task._id === selectedTaskId ? {
                        ...task,
                        subtasks: task.subtasks.map(subtask =>
                            subtask._id === selectedSubTaskId ? { ...subtask, progress: subtaskprogress } : subtask
                        )
                    } : task
                ));
                setShowSubtaskProgressModal(false); // Close the modal after update
            }
        } catch (err) {
            console.error('Error updating task progress:', err);
        }
    };
 
    // Function to get the progress bar color based on the percentage
    const getProgressBarColor = (percentage) => {
        if (percentage <= 40) return 'danger'; // Red
        if (percentage <= 70) return 'warning'; // Orange
        return 'success'; // Green
    };

    const handleReopenTask = async (taskId) => {
      try {
        const response = await updateTaskStatusAuth(token, taskId, 'in-progress'); // Change status to 'in-progress'
        if (response && response.data) {
          setTasks(prevTasks =>
            prevTasks.map(task =>
              task._id === taskId ? { ...task, status: 'in-progress', progress: 90 } : task
            )
          );
          toast.success('Task has been reopened and progress set to 90%', {
            position: "top-right",   
            autoClose: 3000,   
            hideProgressBar: true, 
        });
        }
      } catch (err) {
        console.error('Error reopening task:', err);
      }
    };
 
    // Render loading, error, or tasks
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
 
    return (
        <CCol xs={12}>
            <CCard className="mb-4" style={{ border: '1px solid #ddd', borderRadius: '10px' }}>
                <CCardHeader className="d-flex justify-content-between align-items-center border-0" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="d-flex align-items-center">
                    <strong className="fs-4">
            {status === 'in-progress' && 'Your In-Progress Tasks'}
            {status === 'completed' && 'Your Completed Tasks'}
            {status === 'pending' && 'Your Pending Tasks'}
            {status !== 'in-progress' && status !== 'completed' && status !== 'pending' && 'Your All Tasks'}
        </strong>
                    </div>
                    <CButton color="primary" className="me-3" onClick={openCreateTaskModal}>
                        <FaPlus /> Create Task
                    </CButton>
                </CCardHeader>
                <CCardBody>
                    <div className="mt-3">
                        {tasks.length > 0 ? (
                            <table className="table table-striped table-bordered table-hover">
                                <thead className="table-light">
                                    <tr style={{ fontSize: '13px' }}>
                                        <th scope="col">Project Name</th>
                                        <th scope="col">Task Title</th>
                                        <th scope="col">Due Date</th>
                                        <th scope="col">Priority</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
    {tasks.map((task) => (
        <React.Fragment key={task._id}>
            <tr
                style={{
                    fontSize: '13px',
                    backgroundColor: isPastDue(task.dueDate, task.status) ? '#f8d7da' : 'transparent',
                }}
            >
                <td style={{ fontWeight: 'bold' }}>{task.board.title}</td> {/* Project name */}
                <td>
                    <span
                        style={{
                            textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                            color: isPastDue(task.dueDate, task.status) ? 'red' : 'inherit',
                        }}
                    >
                        {task.title}
                    </span>
                </td>
                <td>
                    {/* {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        : 'Not Set'} */}
                         {task.dueDate
                ? new Date(task.dueDate).toISOString().split('T')[0]
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
                    <div className="d-flex align-items-center">
                        {/* Show progress bar if task is in progress */}
                        {task.status === 'in-progress' && (
                            <>
                                <CProgress
                                    value={task.progress || 0}
                                    color={getProgressBarColor(task.progress || 0)}
                                    className="me-2"
                                >
                                    {/* Display percentage inside the progress bar */}
                                    <span className="progress-bar-label">{task.progress || 0}%</span>
                                </CProgress>
                            </>
                        )}
                        {/* Only show the 'Update Progress' button if task status is 'in-progress' */}
                        {task.status === 'in-progress' && (
                            <CButton
                                color="primary"
                                onClick={() => {
                                    setSelectedTaskId(task._id);
                                    setProgress(task.progress || 0);
                                    setShowProgressModal(true);
                                }}
                            >
                                Update Progress
                            </CButton>
                        )}
                        {task.status !== 'in-progress' && (
                            <span className={`badge ${task.status === 'completed' ? 'bg-success' : 'bg-danger'}`}>
                                {task.status}
                            </span>
                        )}
                    </div>
                </td>
               <td>
    {/* Status Update Dropdown */}
    
        <CDropdown>
            <CDropdownToggle color="secondary" size="sm">
                Move to
            </CDropdownToggle>
            <CDropdownMenu>
                {task.status === 'pending' && (
                    <CDropdownItem onClick={() => handleStatusChange(task._id, 'in-progress')}>
                        In Progress List
                    </CDropdownItem>
                )}
                {task.status === 'in-progress' && task.progress > 90 && (
                    <CDropdownItem onClick={() => handleStatusChange(task._id, 'completed')}>
                        Mark as Completed
                    </CDropdownItem>
                )}
                {task.status !== 'completed' && (
                    <CDropdownItem onClick={() => handleStatusChange(task._id, 'pending')}>
                        ToDo List
                    </CDropdownItem>
                )}
                {task.status === 'completed' && (
  <CDropdownItem onClick={() => handleReopenTask(task._id)}>
    Reopen Task
  </CDropdownItem>
)}
            </CDropdownMenu>
        </CDropdown>
    
    <CButton
                                                        size="sm"
                                                        color="info"
                                                        variant="outline"
                                                        className="mx-2"
                                                        onClick={() => toggleChat(task._id)}
                                                         >
                                                        
                                                        <FaComments  /> Comments
                                                         </CButton>
                                                         <CButton size="sm" color="warning" variant="outline" onClick={() => handleEditTaskClick(task)}>
                                                        <FaEye  /> View Task
                                                         </CButton>
                                                         {openChats[task._id] && (
  <div
    className="chat-dashboard d-flex flex-column"
    style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      width: '450px',
      height: '80vh',
      backgroundColor: '#f9fafb',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      zIndex: 1,
    }}
  >
    {/* Close Button */}
    <button
      onClick={() => toggleChat(task._id)} // This will close the chat
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'transparent',
        border: 'none',
        color: '#333',
        fontSize: '20px',
        cursor: 'pointer',
      }}
    >
      <FaTimes />
    </button>

    {/* Activity Header */}
    <div className="activity-header px-4 py-3 d-flex align-items-center border-bottom bg-white shadow-sm">
      <strong className="flex-grow-1 fs-5 text-dark">Activity</strong>
    </div>

    {/* Messages Area */}
    <div
      id="chat-messages"
      className="messages-area flex-grow-1 overflow-auto px-4 py-3"
      style={{
        backgroundColor: '#f1f3f4',
        borderRadius: '15px',
        margin: '10px',
      }}
    >
      {chatMessages.length === 0 ? (
        <div className="no-messages text-center text-muted">No messages yet.</div>
      ) : (
        chatMessages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message d-flex mb-4 ${
              msg.sender._id === userDetails._id ? 'justify-content-end' : 'justify-content-start'
            }`}
          >
            {/* Message Content */}
            <div className="message-content" style={{ maxWidth: '90%', width: '90%' }}>
              <div
                className="p-3"
                style={{
                //   backgroundColor: '#ffffff',
                backgroundColor: msg.sender._id === userDetails._id ? '#6c757d14' : '#ffffff',
                  borderRadius: '15px',
                //   boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
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
          height: '120px', // Set a fixed height for proper preview alignment
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
          onMouseLeave={(e) => (e.target.style.background = 'rgb(0, 123, 255)')}
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
          style={{
            resize: 'none',
            maxHeight: '100px',
            borderRadius: '25px',
            fontSize: '1rem',
          }}
        />

        {/* Send Button */}
        <button
          className="btn btn-primary d-flex justify-content-center align-items-center p-3 rounded-circle shadow-sm"
          onClick={() => handleSendMessage(task)}
          disabled={!messageContent.trim() && !files}
          style={{ width: '50px', height: '50px' }}
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  </div>
)}
</td>


            </tr>

            {/* Render subtasks if they exist */}
            {task.subtasks && task.subtasks.length > 0 &&
                task.subtasks.map((subtask, subIndex) => (
                    <tr
                        key={subIndex}
                        style={{
                            fontSize: '13px',
                            backgroundColor: isPastDue(subtask.dueDate, subtask.completed ? 'completed' : 'pending') ? '#f8d7da' : 'transparent',
                        }}
                    >
                        <td colSpan="2" className="ps-5">
                            <span
                                style={{
                                    textDecoration: subtask.completed ? 'line-through' : 'none',
                                    color: isPastDue(subtask.dueDate, subtask.completed ? 'completed' : 'pending') ? 'red' : 'inherit',
                                }}
                            >
                                {subtask.title}
                            </span>
                        </td>
                        <td>
                            {subtask.dueDate
                                ? new Date(subtask.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                : 'Not Set'}
                        </td>
                        <td>
                            <span
                                className={`badge ${
                                    subtask.priority === 'high'
                                        ? 'bg-danger'
                                        : subtask.priority === 'medium'
                                        ? 'bg-warning'
                                        : 'bg-success'
                                }`}
                            >
                                {subtask.priority.charAt(0).toUpperCase() + subtask.priority.slice(1)}
                            </span>
                        </td>
                        <td>
                        <div className="d-flex align-items-center">
                        {/* Show progress bar if task is in progress */}
                        {task.status === 'in-progress' && (
                            <>
                            
                                <CProgress
                                    value={subtask.progress || 0}
                                    color={getProgressBarColor(subtask.progress || 0)}
                                    className="me-2"
                                >
                                    {/* Display percentage inside the progress bar */}
                                    <span className="progress-bar-label">{subtask.progress || 0}%</span>
                                </CProgress>
                            </>
                        )}
                        {/* Only show the 'Update Progress' button if task status is 'in-progress' */}
                        {task.status === 'in-progress' && (
                            <CButton
                                color="primary"
                                onClick={() => {
                                    setSelectedTaskId(task._id);
                                    setSelectedSubTaskId(subtask._id);
                                    setSubtaskProgress(subtask.progress || 0);
                                    setShowSubtaskProgressModal(true);
                                }}
                            >
                                Update Progress
                            </CButton>
                        )}
                        {task.status !== 'in-progress' && (
                            <span className={`badge ${task.status === 'completed' ? 'bg-success' : 'bg-danger'}`}>
                                {task.status}
                            </span>
                        )}
                    </div>
                        </td>
                    </tr>
                ))
            }
        </React.Fragment>
    ))}
</tbody>

                            </table>
                        ) : (
                            <p>No tasks available</p>
                        )}
                    </div>
                </CCardBody>
            </CCard>
 
            {/* Modal for updating progress for task */}
            <CModal visible={showProgressModal} onClose={() => setShowProgressModal(false)}>
                <CModalHeader closeButton>Update Task Progress</CModalHeader>
                <CModalBody>
                    <CFormInput
                        type="number"
                        value={progress || 0}
                        min="0"
                        max="100"
                        onChange={(e) => setProgress(e.target.value)}
                        label="Enter Progress Percentage"
                    />
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setShowProgressModal(false)}>
                        Cancel
                    </CButton>
                    <CButton color="primary" onClick={handleProgressChange}>
                        Save Progress
                    </CButton>
                </CModalFooter>
            </CModal>

             {/* Modal for updating progress for subtask */}
             <CModal visible={showSubtaskProgressModal} onClose={() => setShowSubtaskProgressModal(false)}>
                <CModalHeader closeButton>Update Sub Task Progress</CModalHeader>
                <CModalBody>
                    <CFormInput
                        type="number"
                        value={subtaskprogress || 0}
                        min="0"
                        max="100"
                        onChange={(e) => setSubtaskProgress(e.target.value)}
                        label="Enter Progress Percentage"
                    />
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setShowSubtaskProgressModal(false)}>
                        Cancel
                    </CButton>
                    <CButton color="primary" onClick={handleSubtaskProgressChange}>
                        Save Progress
                    </CButton>
                </CModalFooter>
            </CModal>
 
            <CreateTaskModal isOpen={isModalOpen} toggleModal={closeCreateTaskModal} onTaskCreated={handleTaskCreated} />

             {/* Edit Task Modal */}
             <CModal visible={editTaskModalVisible} onClose={() => setEditTaskModalVisible(false)} className="rounded-3" backdrop="static" size="lg">
                     <CModalHeader className="border-0">
                     <CModalTitle>Task Details</CModalTitle>
                     </CModalHeader>
                     <CRow>
                       <CCol xs={12}>
                       <CModalBody>
                     <strong>Task</strong>
                     <CFormInput
                     placeholder="Task Title"
                     value={newTaskTitle}
                     onChange={(e) => setNewTaskTitle(e.target.value)}
                     className="mb-3 mt-3"
                     />
                     <strong>Description</strong>
                     <textarea
                     placeholder="Task Description"
                     value={taskDescription}
                     onChange={(e) => setTaskDescription(e.target.value)}
                     className="form-control mb-3 mt-3"
                     />
                 </CModalBody>
                </CCol>
             </CRow>  
               </CModal>
               <ToastContainer />
        </CCol>
    );
};
 
export default Tasks;