import React, { useState, useEffect } from 'react';
import { getBoards, createBoard, editBoard, getUser, createTask, getTasksForBoard,editTask } from '../../../api/api';  
import {
  CCard, CCardBody, CCardHeader, CCol, CRow, CButton, CAlert, 
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, 
  CFormInput, CAvatar, CInputGroup
} from '@coreui/react';


const AllBoards = () => {
  const [boards, setBoards] = useState([]);
  const [users, setUsers] = useState([]);  
  const [searchTerm, setSearchTerm] = useState('');
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [editingBoard, setEditingBoard] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);  
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');  
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [editTaskModalVisible, setEditTaskModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState([]);  
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [selectedBoardForTask, setSelectedBoardForTask] = useState(null);
  const [taskToEdit, setTaskToEdit] = useState(null);
 
   
  const [expandedBoards, setExpandedBoards] = useState([]);

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')  
      .replace(/[^\w\-]+/g, '');  
  };

  const fetchBoards = async () => {
    try {
      const data = await getBoards();
      if (Array.isArray(data.boards)) {
        setBoards(data.boards);
        setExpandedBoards(data.boards.map(board => board._id));  
        data.boards.forEach(board => fetchTasksForBoard(board._id));
      } else {
        setError('Unexpected data format. Boards should be an array.');
      }
    } catch (error) {
      setError('Error fetching boards. Please try again later.');
      console.error('Error fetching boards', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getUser();
      setUsers(data.data);
    } catch (error) {
      setError('Error fetching users. Please try again later.');
      console.error('Error fetching users', error);
    }
  };

  const fetchTasksForBoard = async (boardId) => {
    try {
      const data = await getTasksForBoard(boardId);
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

  const handleCreateBoard = async () => {
    try {
      const slug = generateSlug(newBoardTitle);  
      
      const newBoardData = await createBoard({
        title: newBoardTitle,     
        users: selectedUsers,     
        slug: slug,               
      });
      setBoards([...boards, newBoardData]);
      fetchBoards();
      setNewBoardTitle('');   
      setSelectedUsers([]);     
      setShowModal(false);       
    } catch (error) {
      setError('Error creating board. Please try again later.');
      console.error('Error creating board', error);
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
      
      const task = await createTask(selectedBoardForTask, taskData);
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


  const handleEditTask = async () => {
    if (!newTaskTitle || !taskToEdit) return;

    const updatedTaskData = {
      title: newTaskTitle,
      description: taskDescription,     
      assignees: selectedAssignees,     
      dueDate,                         
      priority,                        
    };

    try {
      const updatedTask = await editTask(taskToEdit._id, updatedTaskData);
       
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

  useEffect(() => {
    fetchBoards();
    fetchUsers();  
  }, []);

  const filteredBoards = boards.filter(board =>
    board.title?.toLowerCase().includes(searchTerm.toLowerCase() || '')
  );

  const handleUserSelection = (userId) => {
    setSelectedUsers((prevSelected) => {
      if (prevSelected.includes(userId)) {
        return prevSelected.filter((id) => id !== userId);  
      } else {
        return [...prevSelected, userId];  
      }
    });
  };

  const handleTaskUserSelection = (userId) => {
    setSelectedAssignees((prevSelected) => {
      if (prevSelected.includes(userId)) {
        return prevSelected.filter((id) => id !== userId); 
      } else {
        return [...prevSelected, userId];  
      }
    });
  };

  const getUserInitials = (user) => {
    const nameParts = user.username.split(' '); 
    const firstInitial = nameParts[0]?.charAt(0).toUpperCase();
    const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1]?.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  };

  const getRandomColor = () => {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#57FF33', '#FF33A1', '#FF8C33'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleEditTaskClick = (task) => {
     console.log(task.dueDate)
    setSelectedBoardForTask(task.board);
    setTaskToEdit(task);
    setNewTaskTitle(task.title);
    setTaskDescription(task.description);
    setDueDate(task.dueDate || '');
    setPriority(task.priority);
    setSelectedAssignees(task.assignees);
    setEditTaskModalVisible(true);
  };

  // Toggle accordion state
  const toggleAccordion = (boardId) => {
    setExpandedBoards((prevExpandedBoards) => {
      if (prevExpandedBoards.includes(boardId)) {
        return prevExpandedBoards.filter((id) => id !== boardId);  
      } else {
        return [...prevExpandedBoards, boardId]; 
      }
    });
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4" style={{ border: '1px solid #ddd', borderRadius: '10px' }}>
          <CCardHeader className="d-flex justify-content-between align-items-center border-0" style={{ backgroundColor: '#f8f9fa' }}>
            <div className="d-flex align-items-center">
              <strong className="fs-4">Boards</strong>
            </div>
            <div className="d-flex align-items-center">
              <CButton
                color="primary"
                className="me-3 rounded-pill"
                onClick={() => {
                  setModalType('create');
                  setNewBoardTitle('');
                  setSelectedUsers([]);   
                  setShowModal(true);
                }}
              >
                Create Board
              </CButton>
              <CInputGroup style={{ width: '250px' }} className="rounded-pill">
                <CFormInput
                  placeholder="Search for boards..."
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
              filteredBoards.map((board) => (
                <div key={board._id} className="mb-4" style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '10px' }}>
                  
                  <div
                    className="d-flex justify-content-between align-items-center"
                    style={{ cursor: 'pointer', padding: '10px', borderBottom: '1px solid #ddd' }}
                    onClick={() => toggleAccordion(board._id)}
                  >
                    <span className="h5 mb-0">{board.title}</span>
                    <span style={{ fontSize: '20px' }}>{expandedBoards.includes(board._id) ? "▼" : ">"}</span>
                  </div>

                  
                  {expandedBoards.includes(board._id) && (
                    <div className="mt-3">
                      {board.tasks && board.tasks.length > 0 ? (
                        <table className="table table-striped table-bordered table-hover">
                        <thead className="table-light">
                          <tr style={{ fontSize: '13px', }}>
                            <th scope="col">Title</th>
                            <th scope="col">Assignees</th>
                            <th scope="col">Due Date</th>
                            <th scope="col">Priority</th>
                            <th scope="col">Status</th>
                            <th scope="col">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {board.tasks.map((task) => (
                            <tr key={task._id} style={{ fontSize: '13px', }}>
                              <td>{task.title}</td>
                              <td>
                                {task.assignees && task.assignees.length > 0 ? (
                                task.assignees.map((assignee) => {
                                const user = users.find(user => user._id === assignee);
                                if (user) {
                                const username = user.username;
                                const firstLetter = username.charAt(0).toUpperCase();
                                const lastLetter = username.charAt(username.length - 1).toUpperCase();
        
                                return (
                                <span key={assignee} className="badge bg-primary me-2" style={{borderRadius:"50%",padding:"10px"}}>{firstLetter}{lastLetter}</span>
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
                                <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not Set'}</td>
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
                                <td><span
                                  className={`badge ${
                                  task.status === 'pending'
                                    ? 'bg-danger'
                                    : task.status === 'in-progress'
                                    ? 'bg-warning'
                                    : 'bg-success'
                                  }`}
                                >
                                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                </span></td>
                                <td>
                                <div className="d-flex justify-content-around" style={{ cursor: 'pointer' }}>
                                <CButton size="sm" onClick={() => handleEditTaskClick(task)}>
                                  ...
                                  </CButton>
                                </div>
                                </td>
                              </tr>
                              ))}
                            </tbody>
                            </table>
                            
                            ) : (
                            <div>No tasks found</div>
                            )}
                            <CButton
                            color="primary"
                            variant='outline'
                            size="sm"
                            onClick={() => {
                          setSelectedBoardForTask(board._id);
                          setTaskModalVisible(true);
                        }}
                      >
                        Create Task
                      </CButton>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <CCol>
                <CCardBody className="text-center">
                  <h5>No boards found</h5>
                </CCardBody>
              </CCol>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Create Task Modal */}
      <CModal visible={taskModalVisible} onClose={() => setTaskModalVisible(false)} className="rounded-3" size="lg">
        <CModalHeader className="border-0">
          <CModalTitle>Create Task</CModalTitle>
        </CModalHeader>
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
                <div key={user._id} className="d-flex align-items-center mb-2">
                  <div className="position-relative">
                    <CAvatar
                      size="sm"
                      className="me-2"
                      style={{ backgroundColor: getRandomColor(), cursor: 'pointer' }}
                      onClick={() => handleTaskUserSelection(user._id)}
                    >
                      {getUserInitials(user)}
                    </CAvatar>
                  </div>
                  <span
                    onClick={() => handleTaskUserSelection(user._id)}
                    className={`text-truncate ${selectedAssignees.includes(user._id) ? 'fw-bold' : ''}`}
                    style={{ maxWidth: '120px', cursor: 'pointer' }}
                  >
                    {user.username}
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
      </CModal>

      {/* Create/Edit Board Modal */}
      <CModal visible={showModal} onClose={() => setShowModal(false)} className="rounded-3">
        <CModalHeader className="border-0">
          <CModalTitle>{modalType === 'create' ? 'Create Board' : 'Edit Board'}</CModalTitle>
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
                      style={{ backgroundColor: getRandomColor(), cursor: 'pointer' }}
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
          {modalType === 'create' ? (
            <CButton
              color="primary"
              onClick={handleCreateBoard}
              className="rounded-pill"
            >
              Create
            </CButton>
          ) : (
            <CButton
              color="primary"
              onClick={() => { /* Implement Edit functionality here */ }}
              className="rounded-pill"
            >
              Save Changes
            </CButton>
          )}
          <CButton color="secondary" onClick={() => setShowModal(false)} className="rounded-pill">
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>


      {/* Edit Task Modal */}
      <CModal visible={editTaskModalVisible} onClose={() => setEditTaskModalVisible(false)} className="rounded-3" size="lg">
        <CModalHeader className="border-0">
          <CModalTitle>Edit Task</CModalTitle>
        </CModalHeader>
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
                
                <div key={user._id} className="d-flex align-items-center mb-2">
                  <div className="position-relative">
                    <CAvatar
                      size="sm"
                      className="me-2"
                      style={{ backgroundColor: getRandomColor(), cursor: 'pointer' }}
                      onClick={() => handleTaskUserSelection(user._id)}
                    >
                      {getUserInitials(user)}
                    </CAvatar>
                  </div>
                  <span
                    onClick={() => handleTaskUserSelection(user._id)}
                    className={`text-truncate ${selectedAssignees.includes(user._id) ? 'fw-bold' : ''}`}
                    style={{ maxWidth: '120px', cursor: 'pointer' }}
                  >
                    {user.username}
                  </span>
                </div>
              ))}
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
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleEditTask} className="rounded-pill">
            Save Changes
          </CButton>
          <CButton color="secondary" onClick={() => setEditTaskModalVisible(false)} className="rounded-pill">
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>



    </CRow>
  );
};

export default AllBoards;
