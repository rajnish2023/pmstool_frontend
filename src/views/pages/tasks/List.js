import React, { useState } from "react";
import { addCardToList } from "../../../api/api";
import Card from "./Card";
import { CButton, CFormInput } from "@coreui/react";
 
const List = ({ list, fetchBoards }) => {
  const [newCardTitle, setNewCardTitle] = useState("");
 
  const handleAddCard = async () => {
    if (!newCardTitle.trim()) return;
    await addCardToList(list._id, newCardTitle);
    setNewCardTitle("");
    fetchBoards();
  };
 
  return (
    <div className="list">
      <h3>{list.title}</h3>
      <div className="cards">
      {list.cards.map((card) => (
          <Card key={card._id} card={card} fetchBoards={fetchBoards} />
        ))}
      </div>
      <div className="add-card">
        <CFormInput
          type="text"
          placeholder="New Card Title"
          value={newCardTitle}
          onChange={(e) => setNewCardTitle(e.target.value)}
        />
        <CButton color="primary" className="mt-2" onClick={handleAddCard}>
          Add Card
        </CButton>
      </div>
    </div>
  );
};
 
export default List;