import React, { useState, useEffect } from 'react';
import './TodoList.css';

const TodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  // Load tasks from local storage on initial render
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('todoListTasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error("Failed to parse tasks from localStorage", error);
    }
  }, []);

  // Save tasks to local storage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('todoListTasks', JSON.stringify(tasks));
    } catch (error) {
      console.error("Failed to save tasks to localStorage", error);
    }
  }, [tasks]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const task = {
      id: Date.now(),
      text: newTask,
      completed: false,
    };
    setTasks([...tasks, task]);
    setNewTask('');
  };

  const handleToggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <div className="todo-list-widget">
      <div className="todo-header">
        <h3><i className="fas fa-check-square"></i> To-Do List</h3>
      </div>
      <form onSubmit={handleAddTask} className="todo-add-form">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="todo-input"
        />
        <button type="submit" className="todo-add-btn">
          <i className="fas fa-plus"></i>
        </button>
      </form>
      <ul className="todo-list">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`todo-item ${task.completed ? 'completed' : ''}`}
          >
            <div className="todo-item-content" onClick={() => handleToggleTask(task.id)}>
              <i className={`far ${task.completed ? 'fa-check-circle' : 'fa-circle'}`}></i>
              <span className="todo-text">{task.text}</span>
            </div>
            <button
              onClick={() => handleDeleteTask(task.id)}
              className="todo-delete-btn"
            >
              <i className="fas fa-trash-alt"></i>
            </button>
          </li>
        ))}
        {tasks.length === 0 && (
          <li className="no-tasks-message">
            <i className="fas fa-clipboard-check"></i>
            <p>You're all caught up!</p>
          </li>
        )}
      </ul>
    </div>
  );
};

export default TodoList;
