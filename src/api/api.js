import axios from 'axios';
 
const API = axios.create({ baseURL: 'https://pmstoolbackend.onrender.com/api' });

const BASE_URL = "https://pmstoolbackend.onrender.com/api/board";
 
export const registerUser = (userData) => API.post('/auth/register', userData);
export const loginUser = (userData) => API.post('/auth/login', userData);
export const forgotPassword = (userData) => API.post('/auth/forgot-password', userData);
export const resetPassword = (userData) => API.post('/auth/reset-password', userData);
// export const changePassword = (userData) => API.post('/auth/change-password', userData);
// export const updatePassword = (userData) => API.post('/auth/update-password', userData);
export const getUser = () => API.get('/auth/users');

// user auth api header pass toker authorize 

export const getUserProfile = async (token) => {
  try {
    const response = API.get('/auth/userdetails', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;  // Rethrow error for further handling

  }
};

export const updateUserProfile = async (token, userData) => {
  try {
    const response = API.put('/auth/updateuserdetails', userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;   
  }
};

export const updateUserStatus = async (token,userData) =>{
  try{
    const response = API.put('/auth/updaateuserstatus',userData,{
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  }catch(error){
    console.error('Something wentwrong',error);
    throw error;
  }
}

//update password
export const changePassword = async (token,userData) => {
  try {
    const response = API.put('/auth/changePassword', userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;   
  }
};
 





//task api
// export const createTask = (taskData) => API.post('/auth/task', taskData);
export const getTasks = () => API.get('/auth/tasks');
// export const updateTask = (taskData) => API.put('/auth/updatetask', taskData);
// export const deleteTask = (taskData) => API.post('/auth/deletetask', taskData);


export const createTask = (boardId, taskData) => {
  return API.post(`/task/createtaskb/${boardId}`, taskData);  // Pass `boardId` and `taskData` to the backend
};

export const getTasksForBoard = (boardId) => API.get(`/task/gettasksforboard/${boardId}`);

export const editTask = (taskId, taskData) => {
  return API.put(`/task/updatetask/${taskId}`, taskData); 
}


//staff assigned task api

export const updateTaskStatus = (taskId, status) => API.put(`/auth/updatetaskstatus/${taskId}`, { status });

export const getAssignedTasks = async (token) => {
  try {
    const response = API.get('/api/auth/getAssignedTasks', {
      headers: {
        Authorization: `Bearer ${token}`,   
      },
    });
    return response.data.tasks;   
  } catch (error) {
    console.error('Error fetching assigned tasks:', error);
    throw error;  // Rethrow error for further handling
  }
};



//taskcard api
export const createTaskCard = (taskCardData) => API.post('/auth/createtaskcard', taskCardData);
export const getTaskCards = (listId) => API.get(`/auth/gettaskcardlist/${listId}`);
export const updateTaskCard = (taskCardData) => API.post('/auth/updatetaskcardlist', taskCardData);



export const getBoards = async () => {
    const response = await axios.get("https://pmstoolbackend.onrender.com/api/board/boards");
    return response.data;
  };

export const getBoardBySlug = async (slug) => {
  const response = await axios.get(`${BASE_URL}/boards/${slug}`);
  return response.data;
}
   
  export const createBoard = async (BoardData) => {
  const response = await axios.post(`${BASE_URL}/createboard`,BoardData);
    return response.data;
  };

// create board using auth token
export const createBoardAuth = async (token, BoardData) => {
  try {
    const response = API.post('/authBoard/authcreateboard', BoardData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.error('Error creating board:', error);
    throw error;   
  }
};


// get all boards using auth token
export const getBoardsAuth = async (token) => {
  try {
    const response = API.get('/authBoard/authfetchcreatedboards', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  }
  catch (error) {
    console.error('Error fetching boards:', error);
    throw error;   
  }
}

// update board using auth token
export const UpdateBoardAuth = async (token, boardId, BoardData) => {
  try {
    const response = API.put(`/authBoard/authupdateboard/${boardId}`, BoardData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.error('Error updating board:', error);
    throw error;   
  }
};


export const editBoard = async (id, title) => {
  const response = await axios.put(`${BASE_URL}/updateboard/${id}`, { title });
  return response.data;
};
   
  export const addListToBoard = async (boardId, title) => {
  const response = await axios.post(`${BASE_URL}/boards/${boardId}/lists`, { title });
    return response.data;
  };
   
  export const addCardToList = async (listId, title) => {
  const response = await axios.post(`${BASE_URL}/lists/${listId}/cards`, { title });
    return response.data;
  };
   
  export const updateCard = async (cardId, updatedData) => {
    const response = await axios.put(`${BASE_URL}/cards/${cardId}`, updatedData);
    return response.data;
  };



  // create task by authuser token with board id
 
export const createTaskAuth = async (token, boardId, taskData) => {
  try {
    const response = API.post(`/authBoard/authcreatetask/${boardId}`, taskData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;   
  }
};

// get all tasks by authuser token with board id

export const getTasksAuth = async (token, boardId) => {
  try {
    const response = API.get(`/authBoard/authgettasksforboard/${boardId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  }
  catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;   
  }
}


// update task by authuser token with task id

export const updateTaskAuth = async (token, taskId, taskData) => {
  try {
    const response = API.put(`/authBoard/authupdatetasksforboard/${taskId}`, taskData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;   
  }
};






//authuser gettodaytask

export const getTodayTasksAuth = async (token) => {
  try {
    const response = API.get('/authBoard/authgettodaytasks', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  }
  catch (error) {
    console.error('Error fetching today tasks:', error);
    throw error;   
  }
}

//view all tasks by authuser token 

export const getAllTasksAuth = async (token) => {
  try {
    const response = API.get('/authBoard/authgetalltasks', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  }
  catch (error) {
    console.error('Error fetching all tasks:', error);
    throw error;   
  }
}


//make task as today task by authuser token

export const makeTaskTodayAuth = async (token, taskId) => {
  try {
    const response = await API.put(`/authBoard/maketodaytask/${taskId}`,  
      {},  
      {
        headers: {
          Authorization: `Bearer ${token}`,  
        },
      }
    );
    return response;  
  } catch (error) {
    console.error('Error making task as today task:', error);
    throw error; 
  }
};


//make subtasks as today task by authuser token

export const makeSubTaskTodayAuth = async (token, taskId, subTaskId) => {
  try {
    const response = await API.put(`/authBoard/maketodaysubtask/${taskId}/${subTaskId}`,  
      {},  
      {
        headers: {
          Authorization: `Bearer ${token}`,  
        },
      }
    );
    return response;
  }
  catch (error) {
    console.error('Error making subtask as today task:', error);
    throw error; 
  }
}


//make task complete by authuser token

export const makeTaskCompleteAuth = async (token, taskId) => {
  try {
    const response = await API.put(`/authBoard/maketaskcomplete/${taskId}`,  
      {},  
      {
        headers: {
          Authorization: `Bearer ${token}`,  
        },
      }
    );
    return response;
  }
  catch (error) {
    console.error('Error making task as complete:', error);
    throw error; 
  }

}

//make subtask complete by authuser token

export const makeSubTaskCompleteAuth = async (token, taskId, subTaskId) => {
  try {
    const response = await API.put(`/authBoard/makesubtaskcomplete/${taskId}/${subTaskId}`,  
      {},  
      {
        headers: {
          Authorization: `Bearer ${token}`,  
        },
      }
    );
    return response;
  }
  catch (error) {
    console.error('Error making subtask as complete:', error);
    throw error; 
  }
}


//task activity section  

export const gettaskactivity = async(token,taskId) => {
  try{
    const response = await API.get(`/authTaskActivity/getTaskActivities/${taskId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response;
  }
  catch (error) {
    console.error('Error getting while fetching taskactivity:', error);
    throw error;
  }
}


export const sendtaskactivity = async(token, activityData) => {
  try {
    const response = await API.post(`/authTaskActivity/sendTaskActivities`, activityData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.error('Error while sending activity', error);
    throw error;
  }
}



 