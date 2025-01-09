import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CFormInput,
  CFormSelect,
  CFormLabel,
  CFormTextarea,
} from "@coreui/react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FaPencilAlt ,FaPlusCircle, FaTimes } from 'react-icons/fa';
import { getUser } from '../../../api/api';
 
import {getBoardBySlug} from '../../../api/api';
 
const API_URL = "http://localhost:5000/api/board";
 
const BoardComponent = () => {
  const [board, setBoards] = useState([]);
  const [newListTitle, setNewListTitle] = useState("");
  const [showAddListForm, setShowAddListForm] = useState(false);
  const { slug } = useParams();
  console.log(slug);



  // Fetch boards from the API
  const fetchBoards = async () => {
    try {
      const response = await getBoardBySlug(slug);
      
      setBoards(response.board);
    } catch (error) {
      console.error("Error fetching boards:", error);
    }
  };
 
  const createList = async (boardId) => {
    try {
await axios.post(`${API_URL}/boards/${boardId}/lists`, { title: newListTitle });
      setNewListTitle("");
      setShowAddListForm(false);
      fetchBoards();
    } catch (error) {
      console.error("Error creating list:", error);
    }
  };
 
  const moveCard = async (boardId, sourceListId, targetListId, cardId) => {
    try {
await axios.post(`${API_URL}/boards/${boardId}/lists/${sourceListId}/cards/${cardId}/move`, {
        targetListId,
      });
      fetchBoards();
    } catch (error) {
      console.error("Error moving card:", error);
    }
  };
 
  useEffect(() => {
    fetchBoards();
    
  }, []);
 
  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ padding: "20px", backgroundColor: "#f8f9fa" }}>
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          
            <CCard
              key={board._id}
              className="mb-4"
              style={{
                width: "100%",
                backgroundColor: "#fff",
                borderRadius: "10px",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* <CCardHeader
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  padding: "10px 15px",
                  borderRadius: "10px 10px 0 0",
                }}
              >
                {board.title}
              </CCardHeader> */}
              <CCardBody>
                
                <div style={{ display: "flex", overflowX: "auto", gap: "15px" }}>
                {board && board.lists && board.lists.length > 0 ? (
                  board.lists.map((list) => (
                    <List key={list._id} list={list} boardId={board._id} moveCard={moveCard} />
                  ))
                ) : (
                  <div>No lists available</div> // Placeholder when there are no lists
                )}
                  <div>
                    {showAddListForm ? (
                      <div style={{ padding: "15px", minWidth: "250px", maxWidth: "300px", backgroundColor: "#f4f5f7", borderRadius: "5px" }}>
                        <input
                          type="text"
                          value={newListTitle}
                          onChange={(e) => setNewListTitle(e.target.value)}
                          placeholder="List Title"
                          style={{
                            padding: "8px",
                            fontSize: "14px",
                            width: "100%",
                            marginBottom: "10px",
                            borderRadius: "5px",
                            border: "1px solid #ddd",
                          }}
                        />
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <CButton onClick={() => createList(board._id)} color="primary">
                            Add List
                          </CButton>
                          <CButton onClick={() => setShowAddListForm(false)} color="danger">
                            Cancel
                          </CButton>
                        </div>
                      </div>
                    ) : (
                      <CButton
                        onClick={() => setShowAddListForm(true)}
                        color="secondary"
                        style={{
                          minWidth: "190px",
                          maxWidth: "190px",
                          padding: "7px",
                          textAlign: "center",
                          backgroundColor: "#007bff",
                          border: "1px transparent",
                          borderRadius: "5px",
                        }}
                      >
                        Add Another List
                      </CButton>
                    )}
                  </div>
                </div>
                
              </CCardBody>
            </CCard>
 
        </div>
      </div>
    </DndProvider>
  );
};
 
// List Component
const List = ({ list, boardId, moveCard }) => {
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardInput, setCardInput] = useState("");
 
  const handleAddCard = async () => {
    if (!cardInput.trim()) return;
    try {
await axios.post(`${API_URL}/boards/${boardId}/lists/${list._id}/cards`, { title: cardInput });
      setCardInput("");
      setShowCardForm(false);
    } catch (error) {
      console.error("Error adding card:", error);
    }
  };
 
  const [, drop] = useDrop({
    accept: "CARD",
    drop: (item) => {
      if (item.sourceListId !== list._id) {
        moveCard(boardId, item.sourceListId, list._id, item.cardId);
      }
    },
  });
 
  return (
    <div
      ref={drop}
      style={{
        backgroundColor: "#f4f5f7",
        padding: "15px",
        borderRadius: "5px",
        minWidth: "300px",
        maxWidth: "300px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h6 style={{ marginBottom: "10px" }}>{list.title}</h6>
      <div>
          {list.cards.map((card) => (
          <Card
            key={card._id}
            card={card}
            boardId={boardId}
            listId={list._id}
            moveCard={moveCard}
          />
        ))}
        {!showCardForm && (
          <CButton
            onClick={() => setShowCardForm(true)}
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "bold",
            }}
           
          >
            Add a Card
          </CButton>
        )}
        {showCardForm && (
          <div>
            <input
              type="text"
              value={cardInput}
              onChange={(e) => setCardInput(e.target.value)}
              placeholder="Card Title"
              style={{
                padding: "8px",
                width: "100%",
                marginBottom: "10px",
                borderRadius: "5px",
                border: "1px solid #ddd",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <CButton onClick={handleAddCard} color="primary">
                Add
              </CButton>
              <CButton onClick={() => setShowCardForm(false)} color="danger">
                Cancel
              </CButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
 
// Card Component
const Card = ({ card, boardId, listId, moveCard }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    title: card.title,
    description: card.description,
    startDate: card.startDate || "",
    dueDate: card.dueDate || "",
    assignedUsers: card.assignedTo || [],  // Array of user IDs
  });

  const [users, setUsers] = useState([]);
  const [assignedUsersDetails, setAssignedUsersDetails] = useState([]); // Store full user details
  const [comments, setComments] = useState(card.comments || []);
  const [newComment, setNewComment] = useState("");
  const [attachments, setAttachments] = useState(card.attachments || []);
  const [activityLog, setActivityLog] = useState([]);
  const [showUserList, setShowUserList] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await getUser();
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (showEditModal) {
      fetchActivityLog();
      fetchUsers();
    }
  }, [showEditModal]);

  useEffect(() => {
    // Match the assigned user IDs with the full user data
    const assignedDetails = users.filter(user => 
      editData.assignedUsers.includes(user._id)
    );
    setAssignedUsersDetails(assignedDetails);
  }, [users, editData.assignedUsers]);

  const [, drag] = useDrag({
    type: "CARD",
    item: { cardId: card._id, sourceListId: listId },
  });

  const fetchActivityLog = async () => {
    try {
      const response = await axios.get(`/api/boards/${boardId}/lists/${listId}/cards/${card._id}/activity`);
      setActivityLog(response.data);
    } catch (error) {
      console.error("Error fetching activity log:", error);
    }
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(`${API_URL}/boards/${boardId}/lists/${listId}/cards/${card._id}`, editData);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating card:", error);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        text: newComment,
        timestamp: new Date().toISOString(),
      };
      setComments([...comments, comment]);
      setNewComment("");
    }
  };

  const handleAttachmentUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newAttachment = { id: Date.now(), name: file.name, url: URL.createObjectURL(file) };
      setAttachments([...attachments, newAttachment]);
    }
  };

  const handleAddUser = (user) => {
    if (!editData.assignedUsers.find((u) => u === user._id)) {
      setEditData((prev) => ({
        ...prev,
        assignedUsers: [...prev.assignedUsers, user._id],
      }));
      setShowUserList(false); // Hide the user list after selecting a user
    }
  };

  const handleRemoveUser = (userId) => {
    setEditData((prev) => ({
      ...prev,
      assignedUsers: prev.assignedUsers.filter((user) => user !== userId),
    }));
  };

  return (
    <>
      <div
        ref={drag}
        style={{
          backgroundColor: "#fff",
          padding: "10px",
          borderRadius: "5px",
          border: "1px solid #ddd",
          marginBottom: "10px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          position: "relative",
        }}
        onMouseEnter={(e) => (e.currentTarget.querySelector("button").style.display = "block")}
        onMouseLeave={(e) => (e.currentTarget.querySelector("button").style.display = "none")}
      >
        <p style={{ fontWeight: "normal" }}>{card.title}</p>
        <CButton
          size="sm"
          onClick={() => setShowEditModal(true)}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            fontSize: "12px",
            display: "none",
          }}
        >
          <FaPencilAlt size={15} />
        </CButton>
      </div>

      <CModal visible={showEditModal} onClose={() => setShowEditModal(false)} size="lg">
        <CModalHeader>Edit Card</CModalHeader>
        <CModalBody>
          <div>
            {/* Title Section */}
            <CFormLabel>Title</CFormLabel>
            <CFormInput
              type="text"
              value={editData.title}
              onChange={(e) =>
                setEditData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="mb-3"
            />

            {/* Description Section */}
            <CFormLabel>Description</CFormLabel>
            <CFormTextarea
              value={editData.description}
              onChange={(e) =>
                setEditData((prev) => ({ ...prev, description: e.target.value }))
              }
              className="mb-3"
            />

            {/* Assigned Users Section */}
            <h6>Assigned Users</h6>
            <div className="d-flex align-items-center mb-3">
              {assignedUsersDetails.map((user) => (
                <div
                  key={user._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginRight: "10px",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: "#ddd",
                      borderRadius: "50%",
                      width: "30px",
                      height: "30px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: "14px",
                      marginRight: "5px",
                    }}
                  >
                    {user.username ? user.username[0].toUpperCase() : ""}
                  </span>
                  <FaTimes
                    style={{ cursor: "pointer", color: "red" }}
                    onClick={() => handleRemoveUser(user._id)}
                  />
                </div>
              ))}
              <FaPlusCircle
                style={{ cursor: "pointer", fontSize: "20px", color: "#007bff" }}
                onClick={() => setShowUserList(!showUserList)} // Toggle the user list
              />
            </div>

            {/* Display the User List if toggled */}
            {showUserList && (
              <div
                style={{
                  maxHeight: "150px",
                  overflowY: "auto",
                  background: "#f8f9fa",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ddd",
                }}
              >
                {users
                  .filter((user) => !editData.assignedUsers.includes(user._id))
                  .map((user) => (
                    <div
                      key={user._id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "8px",
                        borderBottom: "1px solid #ddd",
                        cursor: "pointer",
                        transition: "background-color 0.2s ease",
                      }}
                      onClick={() => handleAddUser(user)}
                    >
                      <span>{user.username}</span>
                    </div>
                  ))}
              </div>
            )}

<div className="row">
  {/* Start Date Section */}
  <div className="col-6">
    <CFormLabel>Start Date</CFormLabel>
    <CFormInput
      type="datetime-local"
      value={editData.startDate ? editData.startDate.slice(0, 16) : ""}
      onChange={(e) =>
        setEditData((prev) => ({ ...prev, startDate: e.target.value }))
      }
      className="mb-3"
    />
  </div>

  {/* Due Date Section */}
  <div className="col-6">
    <CFormLabel>Due Date</CFormLabel>
    <CFormInput
      type="datetime-local"
      value={editData.dueDate ? editData.dueDate.slice(0, 16) : ""}
      onChange={(e) =>
        setEditData((prev) => ({ ...prev, dueDate: e.target.value }))
      }
      className="mb-3"
    />
  </div>
</div>


           
            {/* Activity Log Section */}
            <h6>Activity</h6>
             
          </div>
        </CModalBody>

        <CModalFooter>
          <CButton color="primary" onClick={handleEditSubmit}>
            Save
          </CButton>
          <CButton color="secondary" onClick={() => setShowEditModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

 
export default BoardComponent;