import React, { useState } from "react";
import { CButton, CFormInput } from "@coreui/react";
import { createBoard } from "../../../api/api";
 
const AddBoard = ({ fetchBoards }) => {
  const [boardTitle, setBoardTitle] = useState("");
 
  const handleCreateBoard = async () => {
    if (!boardTitle.trim()) return;
    await createBoard(boardTitle);
    setBoardTitle("");
    fetchBoards(); // Refresh the boards
  };
 
  return (
    <div className="add-board">
      <CFormInput
        type="text"
        placeholder="New Board Title"
        value={boardTitle}
        onChange={(e) => setBoardTitle(e.target.value)}
      />
      <CButton color="primary" className="mt-2" onClick={handleCreateBoard}>
        Create Board
      </CButton>
    </div>
  );
};
 
export default AddBoard;