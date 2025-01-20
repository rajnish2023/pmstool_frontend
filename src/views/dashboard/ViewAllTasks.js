import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CCard, CCardBody, CCardHeader, CCol, CButton } from '@coreui/react';
import { FaCheck, FaComments,FaPaperclip, FaPaperPlane,FaTimes,FaDownload ,FaFileAlt   } from 'react-icons/fa';
import './dashboard.css'
import { getAllTasksAuth,getUserProfile, makeTaskTodayAuth, makeSubTaskTodayAuth ,makeTaskCompleteAuth,makeSubTaskCompleteAuth,gettaskactivity,sendtaskactivity } from '../../api/api';  // Import your API function
import { io } from 'socket.io-client';

const socket = io('https://pmstoolbackend.onrender.com');
const APP_URL = 'https://pmstoolbackend.onrender.com/';

const ViewAllTasks = () => {
    const [tasks, setTasks] = useState([]); // Store tasks from the API
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openChats, setOpenChats] = useState({});
    const [messageContent, setMessageContent] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [files, setFiles] = useState(null);
    const [taskToEdit, setTaskToEdit] = useState(null);
     const [userDetails, setUserDetails] = useState({});
     const [filePreview, setFilePreview] = useState(null);

     const token = localStorage.getItem('token');
    

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
  

    // Fetch user profile
      const getUserDetails = async () => {
        try {
          const response = await getUserProfile(token);
          setUserDetails(response.data);
        } catch (error) {
          console.error('Error fetching user details', error);
        }
      };
    // Fetch tasks on component mount
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const token = localStorage.getItem('token');  // Get the token
                if (!token) {
                    throw new Error('Authentication token is missing.');
                }

                const response = await getAllTasksAuth(token);  // Fetch tasks from API
                if (response && response.data) {
                    setTasks(response.data); // Store the tasks from the API
                } else {
                    throw new Error('No tasks found.');
                }
            } catch (err) {
                setError(err.message);  // Set error message
                console.error('Error fetching tasks:', err);
            } finally {
                setLoading(false);  // Set loading to false once the fetch is complete
            }
        };

        fetchTasks();
        getUserDetails();
    }, []);  // Empty dependency array ensures this runs once on mount

    // Function to check if the task is past due and not completed
    const isPastDue = (dueDate, status) => {
        const taskDueDate = new Date(dueDate);
        const currentDate = new Date();
        
        // Strip time and compare dates
        const taskDueDateStr = taskDueDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        const currentDateStr = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

        return taskDueDateStr < currentDateStr && status !== 'completed';  // Check if the task is past due
    };

    // Function to make task as today's task
    const handleMakeTaskToday = async (taskId) => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Authentication token is missing.');
            }

            const response = await makeTaskTodayAuth(token, taskId);
            console.log(response.data);
            if (response && response.data) {
                alert('Task marked as today task successfully');
            } else {
                throw new Error('Failed to mark task as today task');
            }
        } catch (err) {
            console.error('Error marking task as today task:', err);
            alert('Failed to mark task as today task');
        }
    };

    // Function to make subtask as today's task
    const handleMarkSubtaskToday = async (taskId, subtaskId) => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Authentication token is missing.');
            }

            const response = await makeSubTaskTodayAuth(token, taskId, subtaskId);
            if (response && response.data) {
                alert('Subtask marked as today task successfully');
            } else {
                throw new Error('Failed to mark subtask as today task');
            }
        } catch (err) {
            console.error('Error marking subtask as today task:', err);
            alert('Failed to mark subtask as today task');
        }
    };


    // Function to handle marking tasks and subtasks as complete
        const handleMarkComplete = async (taskId, subtaskId = null) => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Authentication token is missing.');
    
                if (subtaskId) {
                    // Mark subtask as complete
                    const response = await makeSubTaskCompleteAuth(token, taskId, subtaskId);
                    if (response && response.data) {
                        alert('Subtask marked as complete');
                        setTasks((prevTasks) => {
                            return prevTasks.map((task) => {
                                if (task._id === taskId) {
                                    const updatedSubtasks = task.subtasks.map((subtask) => {
                                        if (subtask._id === subtaskId) {
                                            subtask.completed = true;
                                        }
                                        return subtask;
                                    });
                                    // Check if all subtasks are completed, and mark the task as complete if so
                                    const allSubtasksCompleted = updatedSubtasks.every(subtask => subtask.completed);
                                    task.status = allSubtasksCompleted ? 'completed' : 'pending';
                                    return { ...task, subtasks: updatedSubtasks };
                                }
                                return task;
                            });
                        });
                    }
                } else {
                    // Mark whole task as complete, only if all subtasks are completed
                    const task = tasks.find(task => task._id === taskId);
                    const allSubtasksCompleted = task.subtasks.every(subtask => subtask.completed);
    
                    if (allSubtasksCompleted) {
                        const response = await makeTaskCompleteAuth(token, taskId);
                        if (response && response.data) {
                            alert('Task marked as complete');
                            setTasks((prevTasks) => {
                                return prevTasks.map((task) => {
                                    if (task._id === taskId) {
                                        task.status = 'completed';
                                        task.subtasks = task.subtasks.map(subtask => ({ ...subtask, completed: true }));
                                    }
                                    return task;
                                });
                            });
                        }
                    } else {
                        alert('All subtasks must be completed before marking the task as complete.');
                    }
                }
            } catch (err) {
                console.error('Error marking task or subtask as complete:', err);
                alert('Failed to mark task or subtask as complete');
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
                setMessageContent('');  // Clear the message content
                setFiles(null);  // Reset file input
            } catch (error) {
                console.error('Error sending message:', error);
                alert('Failed to send the message. Please try again.');
            }
        };
    
        const fetchTaskActivity = async (taskId) => {
            try {
                // Replace with your API call to fetch task activity/messages
                const response = await gettaskactivity(token, taskId);
                setChatMessages(response.data);
            } catch (error) {
                console.error('Error fetching task activity:', error);
            }
        };
        useEffect(() => {
            const messagesArea = document.getElementById("chat-messages");
            if (messagesArea) {
              messagesArea.scrollTop = messagesArea.scrollHeight;
            }
          }, [chatMessages]);
    // Render loading, error, or tasks
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <CCol xs={12}>
            <CCard className="mb-4" style={{ border: '1px solid #ddd', borderRadius: '10px' }}>
                <CCardHeader className="d-flex justify-content-between align-items-center border-0" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="d-flex align-items-center">
                        <strong className="fs-4">Your All Tasks</strong>
                    </div>
                    <CButton
                        color="primary"
                        variant="outline"
                        className="me-3"
                    >
                        <Link to="/today-tasks" style={{ textDecoration: 'none' }}>View Today's Tasks</Link>
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
                                        <>
                                            <tr
                                                style={{
                                                    fontSize: '13px',
                                                    backgroundColor: isPastDue(task.dueDate, task.status) ? '#f8d7da' : 'transparent', // Red background if past due
                                                }}
                                                key={task._id}
                                            >
                                                <td style={{ fontWeight: 'bold' }}>{task.board.title}</td> {/* Project name */}
                                                <td>
                                                    <span
                                                        style={{
                                                            textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                                            color: isPastDue(task.dueDate, task.status) ? 'red' : 'inherit', // Change text color if overdue
                                                        }}
                                                    >
                                                        {task.title}
                                                    </span>
                                                </td>
                                                <td>
                                                    {task.dueDate
                                                        ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
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
                                                <td><span className={`badge ${task.status === 'completed' ? 'bg-success' : 'bg-danger'}`}>{task.status}</span></td>
                                                <td>
                                                    {task.status !== 'completed' &&
                                                    new Date(task.dueDate).toLocaleDateString('en-GB') !==
                                                    new Date().toLocaleDateString('en-GB') && (
                                                        <CButton
                                                            size="sm"
                                                            color="primary"
                                                            variant="outline"
                                                            className="mx-2"
                                                            onClick={() => handleMakeTaskToday(task._id)}>
                                                            <FaCheck /> Make as Today's Task
                                                        </CButton>
                                                    )}
                                                     {task.status !== 'completed' && (
                                                       <CButton
                                                        size="sm"
                                                        color="success"
                                                        variant="outline"
                                                        className="mx-2"
                                                        onClick={() => handleMarkComplete(task._id)}
                                                        disabled={task.subtasks.some(subtask => !subtask.completed)} >
                                                        <FaCheck /> Mark as Complete
                                                         </CButton>
                                                        )}
                                                        <CButton
                                                        size="sm"
                                                        color="info"
                                                        variant="outline"
                                                        className="mx-2"
                                                        onClick={() => toggleChat(task._id)}
                                                         >
                                                        <FaComments  /> Chat Now
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
      <strong className="flex-grow-1 fs-5 text-dark">Chat Now</strong>
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
       
                                            {/* Display subtasks if any */}
                                            {task.subtasks && task.subtasks.length > 0 && task.subtasks.map((subtask, index) => (
                                                <tr
                                                    key={index}
                                                    style={{
                                                        fontSize: '13px',
                                                        backgroundColor: isPastDue(subtask.dueDate, subtask.completed ? 'completed' : 'pending') ? '#f8d7da' : 'transparent', // Red background if past due
                                                    }}
                                                >
                                                    <td colSpan="2" className="ps-5">
                                                        <span
                                                            style={{
                                                                textDecoration: subtask.completed ? 'line-through' : 'none',
                                                                color: isPastDue(subtask.dueDate, subtask.completed ? 'completed' : 'pending') ? 'red' : 'inherit', // Change text color if overdue
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
                                                    <td><span className={`badge ${subtask.completed ? 'bg-success' : 'bg-danger'}`}>{subtask.completed ? 'Completed' : 'Pending'}</span></td>
                                                    <td>
                                                    {subtask.completed !== true &&
                                                    new Date(subtask.dueDate).toLocaleDateString('en-GB') !==
                                                    new Date().toLocaleDateString('en-GB') && (
                                                            <CButton
                                                                size="sm"
                                                                color="primary"
                                                                variant="outline"
                                                                className="mx-2"
                                                                onClick={() => handleMarkSubtaskToday(task._id, subtask._id)}>
                                                                <FaCheck /> Make as Today's Task
                                                            </CButton>
                                                        )
                                                    }
                                                     {subtask.completed !== true && (
                                                    <CButton size="sm" color="success" variant="outline" onClick={() => handleMarkComplete(task._id, subtask._id)}>
                                                    <FaCheck /> Mark as Complete
                                                    </CButton>
                                                     )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No tasks available for today</p>
                        )}
                    </div>
                </CCardBody>
            </CCard>
        </CCol>
    );
};

export default ViewAllTasks;
