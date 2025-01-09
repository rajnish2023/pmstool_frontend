import React, { useState, useEffect } from 'react';
import { CCard, CCardBody, CCardHeader, CFormInput, CButton, CModal, CModalBody, CModalFooter, CModalHeader, CFormSelect, CFormLabel, CFormTextarea } from '@coreui/react';
import { useDroppable } from '@dnd-kit/core';
import Card from './Card';
import { updateTask, deleteTask, createTaskCard, getTaskCards,updateTaskCard } from '../../../api/api';
import { v4 as uuid } from 'uuid';
import { FaTrash } from 'react-icons/fa';
import { use } from 'react';

const List = ({ list, lists, setLists, users=[] }) => {
    const [newCardTitle, setNewCardTitle] = useState('');
    const [formVisible, setFormVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [cardDescription, setCardDescription] = useState('');
    const [assignedUser, setAssignedUser] = useState('');
    const [dueDate, setDueDate] = useState('');

    const { setNodeRef } = useDroppable({ id: list.id });

    // To track the status of fetching for each list
    const [fetchStatus, setFetchStatus] = useState({});

    // Fetch task cards for a single list
    const fetchTaskCardsForList = async (listId) => {
        try {
            const response = await getTaskCards(listId);
            const cards = response?.data?.cards || []; // Ensure an array is returned
            return {
                listId,
                cards,
            };
        } catch (error) {
            console.error(`Failed to fetch task cards for list ${listId}:`, error);
            return {
                listId,
                cards: [],
            };
        }
    };
    
    // Fetch task cards for all lists, checking if they need to be fetched
    const fetchAllTaskCards = async () => {
        try {
            const cardPromises = lists.map(async (l) => {
                // If task cards for the list are already fetched (or empty), skip the fetch
                if (fetchStatus[l.id]?.fetched || fetchStatus[l.id]?.noCards) {
                    return { listId: l.id, cards: fetchStatus[l.id]?.cards || [] };
                }

                const data = await fetchTaskCardsForList(l.id);
                // Update the fetch status for the list (track cards or no cards)
                setFetchStatus((prevState) => ({
                    ...prevState,
                    [l.id]: {
                        fetched: true,
                        cards: data.cards,
                        noCards: data.cards.length === 0,
                    },
                }));

                return data;
            });

            const cardsData = await Promise.all(cardPromises);

            // Update the state with the fetched cards for each list
            const updatedLists = lists.map((l) => {
                const listData = cardsData.find((data) => data.listId === l.id);
                return {
                    ...l,
                    cards: listData?.cards || [], // Fallback to empty array if no cards
                };
            });

            setLists(updatedLists);
        } catch (error) {
            console.error('Error fetching task cards for lists:', error);
        }
    };

    useEffect(() => {
        fetchAllTaskCards(); // Fetch task cards for all lists when the component mounts or lists change
    }, [lists]);

    const handleTitleChange = async (e) => {
        const { value } = e.target;
        const updatedLists = lists.map((l) =>
            l.id === list.id ? { ...l, title: value } : l
        );
        setLists(updatedLists);

        try {
            await updateTask({ id: list.id, title: value });
        } catch (error) {
            console.error('Failed to update task title:', error);
        }
    };

    const handleDeleteCard = async (cardId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this task?');
        if (!confirmDelete) return;

        const updatedLists = lists.map((l) =>
            l.id === list.id
                ? {
                      ...l,
                      cards: l.cards.filter((card) => card.id !== cardId),
                  }
                : l
        );
        setLists(updatedLists);

        try {
            await deleteTask({ id: cardId });
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const handleAddCard = async (e) => {
        e.preventDefault();
        if (!newCardTitle) {
            alert('Card title is required!');
            return;
        }

        const newCard = { id: uuid(), title: newCardTitle, listId: list.id };

        try {
            await createTaskCard(newCard);
            await fetchAllTaskCards(); // Fetch updated cards for all lists

            // Clear form inputs and hide the form
            setNewCardTitle('');
            setCardDescription('');
            setAssignedUser('');
            setDueDate('');
            setFormVisible(false);
        } catch (error) {
            console.error('Failed to create task card:', error);
        }
    };

    const handleEditCard = (card) => {
        setEditingCard(card);
        setCardDescription(card.description || '');
        setAssignedUser(card.assignedUser || '');
        setDueDate(card.dueDate || '');
        setEditModalVisible(true);
    };

    const handleSaveCard = async () => {
        try {
            await updateTaskCard({
                id: editingCard._id,
                title: editingCard.title,
                description: cardDescription,
                assignedUser,
                dueDate,
            });
            await fetchAllTaskCards(); // Refresh the list after saving
            setEditModalVisible(false);
        } catch (error) {
            console.error('Failed to update card:', error);
        }
    };

    return (
        <>
            <CCard style={{ width: '300px', marginBottom: '1rem' }} ref={setNodeRef}>
            <CCardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <CFormInput
               type="text"
               value={list.title}
               placeholder="List Title"
               name="title"
               className="fw-bold"
               onChange={handleTitleChange}
             />
             {/* create dropdown to delete list */}
            
             <CButton 
  color="link" 
  className="p-0" 
  onClick={() => handleDeleteCard(list.id)} 
  style={{
    background: 'transparent', 
    color: '#007bff', 
    fontSize: '18px', 
    textDecoration: 'none', 
    padding: '12px !important', 
    display: 'inline-flex', 
    alignItems: 'center', 
    marginRight: '8px'
  }}
>
  ...
</CButton>

             </CCardHeader>

                <CCardBody>
                    {/* Render cards or a message if no cards */}
                    {list.cards.length === 0 ? (
                        <p>No cards available</p>
                    ) : (
                        list.cards.map((card) => (
                            <Card key={card._id} card={card} onClick={() => handleEditCard(card)}  users={users}/>
                        ))
                    )}

                    {/* Add Card Form */}
                    {formVisible && (
                        <form onSubmit={handleAddCard}>
                            <CFormLabel htmlFor="newCardTitle">Card Title</CFormLabel>
                            <CFormInput
                                id="newCardTitle"
                                type="text"
                                placeholder="Card Title"
                                value={newCardTitle}
                                name="title"
                                onChange={(e) => setNewCardTitle(e.target.value)}
                                required
                            />
                            <div style={{ marginTop: '10px' }}>
                                <CButton color="primary" type="submit">
                                    Add Card
                                </CButton>
                                <CButton
                                    color="secondary"
                                    style={{ marginLeft: '10px' }}
                                    onClick={() => setFormVisible(false)}
                                >
                                    Cancel
                                </CButton>
                            </div>
                        </form>
                    )}

                    {!formVisible && (
                        <CButton color="link" onClick={() => setFormVisible(true)}>
                            + Add Card
                        </CButton>
                    )}
                </CCardBody>
            </CCard>

            {/* Edit Card Modal */}
            <CModal visible={editModalVisible} onClose={() => setEditModalVisible(false)} size="lg">
                <CModalHeader>Edit Card</CModalHeader>
                <CModalBody>
                    <div className="mb-3">
                        <CFormLabel htmlFor="cardTitle">Card Title</CFormLabel>
                        <CFormInput
                            id="cardTitle"
                            type="text"
                            placeholder="Card Title"
                            value={editingCard ? editingCard.title : ''}
                            onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                            className="mb-2"
                        />
                        <CFormLabel htmlFor="cardDescription">Description</CFormLabel>
                        <CFormTextarea
                            id="cardDescription"
                            type="text"
                            placeholder="Card Description"
                            value={cardDescription}
                            onChange={(e) => setCardDescription(e.target.value)}
                            className="mb-2"
                        />
                        <CFormLabel htmlFor="assignedUser">Assign User</CFormLabel>
                        <CFormSelect
                            id="assignedUser"
                            aria-label="Assign User"
                            value={assignedUser}
                            onChange={(e) => setAssignedUser(e.target.value)}
                            className="mb-3"
                        >
                            <option value="">Assign User</option>
                            {Array.isArray(users) && users.length > 0 ? (
                                users.map((user) => (
                                    <option key={user._id} value={user._id} selected={user._id === assignedUser}>
                                        {user.username}
                                    </option>
                                ))
                            ) : (
                                <option>No users available</option>
                            )}
                        </CFormSelect>
                        <CFormLabel htmlFor="dueDate">Due Date</CFormLabel>
                        <CFormInput
                            id="dueDate"
                            type="date"
                            value={dueDate ? new Date(dueDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="mb-3"
                        />
                    </div>
                </CModalBody>
                <CModalFooter>
                    <CButton color="primary" onClick={handleSaveCard}>
                        Save Changes
                    </CButton>
                    <CButton color="secondary" onClick={() => setEditModalVisible(false)}>
                        Cancel
                    </CButton>
                </CModalFooter>
            </CModal>
        </>
    );
};

export default List;
