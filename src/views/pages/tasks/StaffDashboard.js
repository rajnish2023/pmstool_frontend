import React, { useState, useEffect, useMemo } from 'react';
import { CButton, CFormSelect } from '@coreui/react'; 
import { getAssignedTasks, getBoards, updateTaskStatus } from '../../../api/api';  // Mocked API functions

const StaffDashboard = () => {
  const [boards, setBoards] = useState([]);
  const [users, setUsers] = useState([]);  // Store the users data (e.g. from the API)
  const [currentUser, setCurrentUser] = useState(null);  // Store the logged-in user
  const [expandedBoards, setExpandedBoards] = useState([]);  // Tracks which boards are expanded
  const [taskModalVisible, setTaskModalVisible] = useState(false);  // Control task modal visibility
  const [selectedBoardForTask, setSelectedBoardForTask] = useState(null);
  const [error, setError] = useState(null);
  
  // Track selected board for new task
  const token = localStorage.getItem('token');

  // Fetch the current user
  const fetchCurrentUser = async (token) => {
    try {
      const user = await getAssignedTasks(token);  // Assuming getCurrentUser fetches the logged-in user data
      setCurrentUser(user);
    } catch (error) {
      console.error('Error fetching current user', error);
      setError('Error fetching current user');
    }
  };

  // Fetch boards and users data
  const fetchBoardsAndUsers = async () => {
    try {
      const boardsData = await getBoards();  // Fetch boards from API
      setBoards(boardsData.boards);  // Assuming boardsData contains an array of boards
      setUsers(boardsData.users);  // Assuming boardsData also contains user data
    } catch (error) {
      console.error('Error fetching boards or users', error);
      setError('Error fetching boards or users');
    }
  };

  useEffect(() => {
    if(token){
        fetchCurrentUser(token);  // Fetch current user data
        fetchBoardsAndUsers();  // Fetch boards and users data
    }
    else{
        setError('User not authenticated');
    }
    
  }, [token]);

  // Filter boards by assigned users - Use useMemo for performance optimization
  const filteredBoards = useMemo(() => {
    return boards.filter((board) => currentUser ? board.users.includes(currentUser._id) : false);
  }, [boards, currentUser]);

  // Toggle board expansion
  const toggleAccordion = (boardId) => {
    setExpandedBoards((prevExpandedBoards) =>
      prevExpandedBoards.includes(boardId)
        ? prevExpandedBoards.filter((id) => id !== boardId)
        : [...prevExpandedBoards, boardId]
    );
  };

  // Helper function to render assignees
  const renderAssignees = (assignees) => {
    if (!assignees || assignees.length === 0) {
      return <span className="text-muted">No Assignees</span>;
    }
    return assignees.map((assigneeId) => {
      const user = users.find((user) => user._id === assigneeId);
      if (user) {
        const username = user.username;
        return (
          <span key={assigneeId} className="badge bg-primary me-2" style={{ borderRadius: '50%', padding: '10px' }}>
            {username.charAt(0).toUpperCase()}{username.charAt(username.length - 1).toUpperCase()}
          </span>
        );
      }
      return <span key={assigneeId} className="badge bg-secondary me-2">Unknown</span>;
    });
  };

  // Handle status change
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);  // Assuming you have an API to update the status
      alert('Task status updated successfully');
    } catch (error) {
      console.error('Error updating task status', error);
      setError('Error updating task status');
    }
  };

  // Helper function to render task rows
  const renderTaskRow = (task) => {
    return (
      <tr key={task._id} style={{ fontSize: '13px' }}>
        <td>{task.title}</td>
        <td>{renderAssignees(task.assignees)}</td>
        <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not Set'}</td>
        <td>
          <span className={`badge ${task.priority === 'high' ? 'bg-danger' : task.priority === 'medium' ? 'bg-warning' : 'bg-success'}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        </td>
        <td>
          <CFormSelect
            value={task.status}
            onChange={(e) => handleStatusChange(task._id, e.target.value)}
            disabled={task.status === 'completed'}   
          >
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </CFormSelect>
        </td>
        <td>
          <div className="d-flex justify-content-around" style={{ cursor: 'pointer' }}>
            <CButton size="sm" onClick={() => console.log('Edit Task', task)}>
              ...
            </CButton>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div>
      {/* Error Message Display */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row">
        {filteredBoards.map((board) => (
          <div key={board._id} className="col-md-6 mb-4">
            <div className="border p-2 rounded" style={{ border: '1px solid #ddd' }}>
              <div
                className="d-flex justify-content-between align-items-center"
                style={{ cursor: 'pointer', padding: '10px', borderBottom: '1px solid #ddd' }}
                onClick={() => toggleAccordion(board._id)}
              >
                <span className="h5 mb-0">{board.title}</span>
                <span style={{ fontSize: '20px', opacity: '0.5' }}>
                  {expandedBoards.includes(board._id) ? "▼" : ">"}
                </span>
              </div>

              {expandedBoards.includes(board._id) && (
                <div className="mt-3">
                  {board.tasks && board.tasks.length > 0 ? (
                    <table className="table table-striped table-bordered table-hover">
                      <thead className="table-light">
                        <tr style={{ fontSize: '13px' }}>
                          <th scope="col">Title</th>
                          <th scope="col">Assignees</th>
                          <th scope="col">Due Date</th>
                          <th scope="col">Priority</th>
                          <th scope="col">Status</th>
                          <th scope="col">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {board.tasks
                          .filter((task) => task.assignees.includes(currentUser._id))   
                          .map(renderTaskRow)}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center">No tasks found</div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task modal content (removed for staff as they cannot create tasks) */}
      {taskModalVisible && selectedBoardForTask && (
        <div>
          <h5>Create Task for Board ID: {selectedBoardForTask}</h5>
          {/* Task modal can be implemented here */}
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
