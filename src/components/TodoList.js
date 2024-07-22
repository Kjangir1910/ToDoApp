import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  updateDoc,
  getDocs
} from "firebase/firestore";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const priorities = ["Low", "Medium", "High"];

const TodoList = () => {
  const [user, setUser] = useState(null);
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [newTasks, setNewTasks] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchLists(currentUser.uid);
        fetchTasks(currentUser.uid);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchLists = (userId) => {
    const q = query(collection(db, "lists"), where("userId", "==", userId));
    onSnapshot(q, (querySnapshot) => {
      setLists(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
  };

  const fetchTasks = (userId) => {
    const q = query(collection(db, "tasks"), where("userId", "==", userId));
    onSnapshot(q, (querySnapshot) => {
      setTasks(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
  };

  const addList = async () => {
    if (newListName.trim()) {
      await addDoc(collection(db, "lists"), { name: newListName, userId: user.uid });
      setNewListName("");
    }
  };

  const logOut = async () => {
    try {
      await auth.signOut();
      alert("You have been logged out");
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  const addTask = async (listId) => {
    const newTask = newTasks[listId];
    if (newTask && newTask.title.trim()) {
      await addDoc(collection(db, "tasks"), { ...newTask, userId: user.uid, listId });
      setNewTasks({
        ...newTasks,
        [listId]: { title: "", description: "", dueDate: "", priority: "" }
      });
    }
  };

  const deleteTask = async (taskId) => {
    await deleteDoc(doc(db, "tasks", taskId));
  };

  const deleteList = async (listId) => {
    try {
      // Delete all tasks associated with the list
      const q = query(collection(db, "tasks"), where("listId", "==", listId));
      const querySnapshot = await getDocs(q);
      const batch = db.batch();
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // Delete the list
      await deleteDoc(doc(db, "lists", listId));
    } catch (error) {
      console.error("Error deleting list:", error.message);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const draggedTask = tasks.find((task) => task.id === draggableId);
    let updatedTasks = tasks;

    const [sourceListId, sourcePriority] = source.droppableId.split("-");
    const [destinationListId, destinationPriority] = destination.droppableId.split("-");

    if (sourceListId === destinationListId && sourcePriority === destinationPriority) {
      return;
    }

    draggedTask.listId = destinationListId;
    draggedTask.priority = destinationPriority;

    updatedTasks = tasks.map((task) => (task.id === draggableId ? draggedTask : task));

    await updateDoc(doc(db, "tasks", draggableId), {
      listId: destinationListId,
      priority: destinationPriority
    });

    setTasks(updatedTasks);
  };

  const handleNewTaskChange = (listId, field, value) => {
    const updatedNewTasks = { ...newTasks };
    if (!updatedNewTasks[listId]) {
      updatedNewTasks[listId] = { title: "", description: "", dueDate: "", priority: "" };
    }
    updatedNewTasks[listId][field] = value;
    setNewTasks(updatedNewTasks);
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        <h2 style={styles.heading}>To-Do Lists</h2>
        <input
          style={styles.input}
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="New List Name"
        />
        <button style={styles.button} onClick={addList}>
          Add List
        </button>
        <button style={styles.logoutButton} onClick={logOut}>
          Logout
        </button>

        <DragDropContext onDragEnd={onDragEnd}>
          <div style={styles.listsContainer}>
            {lists.map((list) => (
              <div key={list.id} style={styles.list}>
                <h3 style={styles.listHeading}>{list.name}</h3>
                <button
                  onClick={() => deleteList(list.id)}
                  style={styles.deleteButton}
                >
                  Delete List
                </button>
                <input
                  style={styles.input}
                  type="text"
                  value={newTasks[list.id]?.title || ""}
                  onChange={(e) => handleNewTaskChange(list.id, "title", e.target.value)}
                  placeholder="Task Title"
                />
                <input
                  style={styles.input}
                  type="text"
                  value={newTasks[list.id]?.description || ""}
                  onChange={(e) => handleNewTaskChange(list.id, "description", e.target.value)}
                  placeholder="Task Description"
                />
                <input
                  style={styles.input}
                  type="date"
                  value={newTasks[list.id]?.dueDate || ""}
                  onChange={(e) => handleNewTaskChange(list.id, "dueDate", e.target.value)}
                />
                <select
                  style={styles.select}
                  value={newTasks[list.id]?.priority || ""}
                  onChange={(e) => handleNewTaskChange(list.id, "priority", e.target.value)}
                >
                  <option value="">-Select-</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <button
                  onClick={() => addTask(list.id)}
                  style={styles.addButton}
                >
                  Add Task
                </button>
                <div style={styles.tasksContainer}>
                  {priorities.map((priority) => (
                    <Droppable
                      key={`${list.id}-${priority}`}
                      droppableId={`${list.id}-${priority}`}
                    >
                      {(provided, snapshot) => (
                        <div
                          style={{
                            ...styles.droppable,
                            ...(snapshot.isDraggingOver && styles.isDraggingOver)
                          }}
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          <h3 style={styles.priorityHeading}>{priority} Priority</h3>
                          {tasks
                            .filter(
                              (task) =>
                                task.listId === list.id &&
                                task.priority === priority
                            )
                            .map((task, index) => (
                              <Draggable
                                key={task.id}
                                draggableId={task.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    style={{
                                      ...styles.draggable,
                                      ...(snapshot.isDragging && styles.isDragging)
                                    }}
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <h4>{task.title}</h4>
                                    <p>{task.description}</p>
                                    <p>Due: {task.dueDate}</p>
                                    <p>Priority: {task.priority}</p>
                                    <button
                                      onClick={() => deleteTask(task.id)}
                                      style={styles.deleteButton}
                                    >
                                      Delete Task
                                    </button>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    padding: "20px",
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
  },
  mainContent: {
    backgroundColor: "#1e1e1e",
    borderRadius: "8px",
    padding: "20px",
    width: "100%",
    maxWidth: "800px",
  },
  heading: {
    color: "#fff",
    marginBottom: "10px",
  },
  input: {
    display: "block",
    width: "calc(100% - 22px)",
    margin: "5px auto",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  button: {
    backgroundColor: "#4caf50",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "10px 20px",
    margin: "10px 0",
    cursor: "pointer",
    fontSize: "16px",
  },
  logoutButton: {
    backgroundColor: "#f44336",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "10px 20px",
    cursor: "pointer",
    fontSize: "16px",
    marginLeft: "10px",
  },
  listsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  list: {
    backgroundColor: "#2e2e2e",
    borderRadius: "8px",
    padding: "10px",
  },
  listHeading: {
    color: "#fff",
  },
  deleteButton: {
    backgroundColor: "#f44336",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "5px 10px",
    cursor: "pointer",
    fontSize: "14px",
    marginLeft: "10px",
  },
  select: {
    display: "block",
    width: "100%",
    padding: "10px",
    margin: "5px 0",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  addButton: {
    backgroundColor: "#2196f3",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "10px 20px",
    cursor: "pointer",
    fontSize: "16px",
  },
  tasksContainer: {
    marginTop: "20px",
  },
  droppable: {
    backgroundColor: "#3e3e3e",
    borderRadius: "8px",
    padding: "10px",
    margin: "10px 0",
  },
  isDraggingOver: {
    backgroundColor: "#5e5e5e",
  },
  priorityHeading: {
    color: "#fff",
  },
  draggable: {
    backgroundColor: "#4e4e4e",
    borderRadius: "4px",
    padding: "10px",
    margin: "10px 0",
    color: "#fff",
  },
  isDragging: {
    backgroundColor: "#6e6e6e",
  },
};

export default TodoList;
