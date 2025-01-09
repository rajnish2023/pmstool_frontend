import React, { useEffect, useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react';
import { CChartLine } from '@coreui/react-chartjs';
import { getStyle } from '@coreui/utils';
import dayjs from 'dayjs';
import { getUser, getBoards, getTasks } from '../../api/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [boards, setBoards] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [errorUsers, setErrorUsers] = useState(null);
  const [errorBoards, setErrorBoards] = useState(null);
  const [errorTasks, setErrorTasks] = useState(null);
  const [chartData, setChartData] = useState({ dates: [], counts: [] });
  const [taskStats, setTaskStats] = useState({});
  const [userStats, setUserStats] = useState({});
  const [activityLog, setActivityLog] = useState([]);
  const [taskPriorities, setTaskPriorities] = useState({});
  const [notifications, setNotifications] = useState([]);

  // Fetch data from APIs
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        setErrorUsers(null);
        const response = await getUser();
        if (Array.isArray(response.data)) {
          setUsers(response.data);
        } else {
          throw new Error('Invalid users data received.');
        }
      } catch (err) {
        setErrorUsers(err.message || 'Failed to fetch users.');
      } finally {
        setLoadingUsers(false);
      }
    };

    const fetchBoards = async () => {
      try {
        setLoadingBoards(true);
        setErrorBoards(null);
        const response = await getBoards();
        if (Array.isArray(response.boards)) {
          setBoards(response.boards);
        } else {
          throw new Error('Invalid boards data received.');
        }
      } catch (err) {
        setErrorBoards(err.message || 'Failed to fetch boards.');
      } finally {
        setLoadingBoards(false);
      }
    };

    const fetchTasks = async () => {
      try {
        setLoadingTasks(true);
        setErrorTasks(null);
        const response = await getTasks();
        if (Array.isArray(response.data)) {
          setTasks(response.data);

          // Prepare task chart data
          const groupedTasks = response.data.reduce((acc, task) => {
            if (!task.dueDate) return acc; // Skip tasks without due date
            const dueDate = dayjs(task.dueDate).format('YYYY-MM-DD');
            acc[dueDate] = (acc[dueDate] || 0) + 1;
            return acc;
          }, {});
          const dates = Object.keys(groupedTasks).sort();
          const counts = dates.map((date) => groupedTasks[date]);

          setChartData({ dates, counts });

          // Task stats
          const statusStats = response.data.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
          }, {});
          setTaskStats(statusStats);

          // Task priorities
          const priorityStats = response.data.reduce((acc, task) => {
            acc[task.priority] = (acc[task.priority] || 0) + 1;
            return acc;
          }, {});
          setTaskPriorities(priorityStats);

          // User task stats
          const userStats = response.data.reduce((acc, task) => {
            acc[task.assignedUser] = (acc[task.assignedUser] || 0) + 1;
            return acc;
          }, {});
          setUserStats(userStats);

          // Activity Log (Mocked)
          const activities = response.data.map((task) => ({
            action: `Task "${task.title}" was updated.`,
            timestamp: dayjs(task.updatedAt).fromNow(),
            user: task.assignedUser,
          }));
          setActivityLog(activities);

          // Notifications (Mocked)
          const overdueTasks = response.data.filter(task => dayjs(task.dueDate).isBefore(dayjs()) && task.status !== 'Completed');
          setNotifications(overdueTasks.map(task => `Task "${task.title}" is overdue.`));
        } else {
          throw new Error('Invalid tasks data received.');
        }
      } catch (err) {
        setErrorTasks(err.message || 'Failed to fetch tasks.');
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchUsers();
    fetchBoards();
    fetchTasks();
  }, []);

  return (
    <div>
      <h4>Dashboard</h4>

      <CRow className='mb-3'>
        {/* Users Section */}
        <CCol md={6}>
          <CCard>
            <CCardHeader style={{ backgroundColor: '#323a49d1', color: 'white' }}>Users</CCardHeader>
            <CCardBody>
              {loadingUsers ? (
                <p>Loading users...</p>
              ) : errorUsers ? (
                <p className="text-danger">{errorUsers}</p>
              ) : users.length > 0 ? (
                <CTable hover>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Index</CTableHeaderCell>
                      <CTableHeaderCell>Name</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {users.map((user, index) => (
                      <CTableRow key={user._id}>
                        <CTableDataCell>{index + 1}</CTableDataCell>
                        <CTableDataCell>{user.username}</CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              ) : (
                <p>No users found.</p>
              )}
            </CCardBody>
          </CCard>
        </CCol>

        {/* Boards Section */}
        <CCol md={6}>
          <CCard>
            <CCardHeader style={{ backgroundColor: '#323a49d1', color: 'white' }}>Boards</CCardHeader>
            <CCardBody>
              {loadingBoards ? (
                <p>Loading boards...</p>
              ) : errorBoards ? (
                <p className="text-danger">{errorBoards}</p>
              ) : boards.length > 0 ? (
                <CTable hover>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Index</CTableHeaderCell>
                      <CTableHeaderCell>Title</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {boards.map((board, index) => (
                      <CTableRow key={board._id}>
                        <CTableDataCell>{index + 1}</CTableDataCell>
                        <CTableDataCell><Link to={`/board-details/${board.slug}`} style={{textDecoration:"none"}}>{board.title}</Link></CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              ) : (
                <p>No boards found.</p>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Task Analysis Section with Chart */}
      <CRow>
        <CCol>
          <CCard>
            <CCardHeader style={{ backgroundColor: '#323a49d1', color: 'white' }}>Task Analysis</CCardHeader>
            <CCardBody>
              {chartData.dates.length > 0 && chartData.counts.length > 0 ? (
                <CChartLine
                  datasets={[{
                    label: 'Tasks Due',
                    backgroundColor: getStyle('--cui-primary'),
                    borderColor: getStyle('--cui-primary'),
                    data: chartData.counts,
                    fill: false,
                  }]}
                  labels={chartData.dates}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p>No chart data available.</p>
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Other sections like Task Status, Task Priorities, etc. */}
      {/* Continue with your other sections similarly */}
    </div>
  );
};

export default Dashboard;
