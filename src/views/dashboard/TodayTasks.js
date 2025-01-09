import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CCard, CCardBody, CCardHeader, CCol, CButton } from '@coreui/react';
import { FaCheck } from 'react-icons/fa';
import { getTodayTasksAuth,makeTaskCompleteAuth,makeSubTaskCompleteAuth } from '../../api/api';  



const TodayTasks = () => {
    const [tasks, setTasks] = useState([]); // Store tasks from the API
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch tasks on component mount
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const token = localStorage.getItem('token');  // Get the token
                if (!token) {
                    throw new Error('Authentication token is missing.');
                }

                const response = await getTodayTasksAuth(token);  // Fetch tasks from API
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
    }, []);  // Empty dependency array ensures this runs once on mount

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

    // Render loading, error, or tasks
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <CCol xs={12}>
            <CCard className="mb-4" style={{ border: '1px solid #ddd', borderRadius: '10px' }}>
                <CCardHeader className="d-flex justify-content-between align-items-center border-0" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="d-flex align-items-center">
                        <strong className="fs-4">Today's Tasks</strong>
                    </div>
                    <CButton
                        color="primary"
                        variant="outline"
                        className="me-3"
                    >
                        <Link to="/view-all-tasks" style={{ textDecoration: 'none' }}>View All Tasks</Link>
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
                                            <tr style={{ fontSize: '13px' }}>
                                                <td style={{ fontWeight: 'bold' }}>{task.board.title}</td>
                                                <td>
                                                    <span style={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
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
                                                    {task.status !== 'completed' && (
                                                        <CButton
                                                            size="sm"
                                                            color="success"
                                                            variant="outline"
                                                            onClick={() => handleMarkComplete(task._id)}
                                                            disabled={task.subtasks.some(subtask => !subtask.completed)} // Disable if any subtask is incomplete
                                                        >
                                                            <FaCheck /> Mark as Complete
                                                        </CButton>
                                                    )}
                                                </td>
                                            </tr>
                                            {task.subtasks && task.subtasks.length > 0 && task.subtasks.map((subtask, index) => (
                                                <tr key={index} style={{ fontSize: '13px' }}>
                                                    <td colSpan="2" className="ps-5">
                                                        <span style={{ textDecoration: subtask.completed ? 'line-through' : 'none' }}>
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
                                                        {subtask.completed !== true && (
                                                            <CButton size="sm" color="success" variant="outline" onClick={() => handleMarkComplete(task._id, subtask._id)}>
                                                                <FaCheck /> Mark as Complete
                                                            </CButton>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
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

export default TodayTasks;
