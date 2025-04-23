//controller/ContodoConroller.js
const db = require('../db');

// const sendMail = require('../utils/mailService');

// await sendMail(
//   'test@example.com',              // You can use your email here for testing
//   '🎯 Task Assigned!',
//   `<p>Hello Maan, you've got a new task!</p>`
// );
// Get all todos (tasks)
exports.getTodos = (req, res) => {
    console.log("GET /api/todos hit");
    db.query('SELECT * FROM tasks', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

// Create a new todo (task)
exports.createTodo = (req, res) => {
    const { title, description, status, start_date, end_date, progress } = req.body;

    // 🛑 Validate required fields
    if (!title || !description || !status || !start_date || !end_date || progress === undefined) {
        return res.status(400).json({ error: 'All fields (title, description, status, start_date, end_date, progress) are required.' });
    }

    // 🔍 Log inputs for debugging
    console.log('Creating Task:', { title, description, status, start_date, end_date, progress });

    // ✅ Validate date formats
    const parsedStart = new Date(start_date);
    const parsedEnd = new Date(end_date);

    if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
        return res.status(400).json({ error: 'Invalid start_date or end_date format.' });
    }

    // 🛠️ Format date to MySQL format
    const formatDateForSQL = (dateStr) => {
        const date = new Date(dateStr);
        const pad = (n) => (n < 10 ? '0' + n : n);
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    const formattedStart = formatDateForSQL(parsedStart);
    const formattedEnd = formatDateForSQL(parsedEnd);

    // 📦 SQL query to insert task
    const createdBy = req.user.id; // ✅ Add this at the top of the function

    const query = `
      INSERT INTO tasks (title, description, status, start_date, end_date, progress, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(
      query,
      [title, description, status, formattedStart, formattedEnd, progress, createdBy],
      (err, result) => {
        if (err) {
          console.error("❌ Error inserting task into database:", err);
          return res.status(500).json({ error: 'Database error while inserting task.' });
        }
        res.status(201).json({
          id: result.insertId,
          title,
          description,
          status,
          start_date: formattedStart,
          end_date: formattedEnd,
          progress,
          created_by: createdBy
        });
      }
    );
    
};


// Update an existing todo (task)
exports.updateTodo = (req, res) => {
    const { id } = req.params;
    const { title, description, status, start_date, end_date, progress } = req.body;

    // Validate if the status is one of the valid ENUM values
    const validStatuses = ['Not Started', 'Pending', 'Work in Progress', 'Under Testing', 'Completed'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
    }

    const formatDateForSQL = (dateStr) => {
        const date = new Date(dateStr);
        const pad = (n) => (n < 10 ? '0' + n : n);
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    const formattedStart = formatDateForSQL(start_date);
    const formattedEnd = formatDateForSQL(end_date);

    const query = `UPDATE tasks SET title = ?, description = ?, status = ?, start_date = ?, end_date = ?, progress = ? WHERE id = ?`;

    db.query(
        query,
        [title, description, status, formattedStart, formattedEnd, progress, id],
        (err, result) => {
            if (err) {
                console.error('Error while updating task:', err);
                return res.status(500).send('Database error');
            }
            res.status(200).send('Task updated successfully');
        }
    );
};

// Delete a todo (task)
exports.deleteTodo = (req, res) => {
    const taskId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log('Deleting task:', taskId, 'by user:', userId, 'role:', userRole);

    db.query('SELECT created_by FROM tasks WHERE id = ?', [taskId], (err, results) => {
        if (err) {
            console.error('DB error (SELECT):', err); // ✅ log DB error
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            console.log('No task found with ID:', taskId); // ✅ log task not found
            return res.status(404).json({ error: 'Task not found' });
        }

        const task = results[0];

        if (userRole === 'admin') {
            db.query('DELETE FROM tasks WHERE id = ?', [taskId], (err) => {
                if (err) {
                    console.error('DB error (DELETE):', err); // ✅ log delete error
                    return res.status(500).json({ error: 'Failed to delete task' });
                }
                res.status(200).json({ message: 'Task deleted successfully' });
            });
        } else {
            console.log('Not authorized to delete this task.'); // ✅ log auth fail
            res.status(403).json({ error: 'Not authorized to delete this task' });
        }
    });
};

// Remove user access (admin only)
// Remove user access (admin only) - with email
exports.removeUserAccess = (req, res) => {
  const email = req.body.email; // Expect email in the request body
  const adminUserId = req.user.id; // ID of the admin user requesting the action
  const adminRole = req.user.role; // Role of the admin user

  console.log('Removing access for user with email:', email, 'by admin:', adminUserId);

  // Check if the admin is attempting to remove their own access
  if (req.user.email === email) {
    return res.status(400).json({ error: 'Admin cannot remove their own access.' });
  }

  // Ensure that the user trying to remove access is indeed an admin
  if (adminRole !== 'admin') {
    return res.status(403).json({ error: 'You are not authorized to remove user access.' });
  }

  // SQL query to check if the user exists in the database
  db.query('SELECT id, role FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Database error (SELECT):', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      console.log('No user found with email:', email);
      return res.status(404).json({ error: 'User not found' });
    }

    const user = results[0];

    // Optional: Prevent admins from being removed
    if (user.role === 'admin') {
      return res.status(400).json({ error: 'Cannot remove an admin user.' });
    }

    // SQL query to delete the user from the system
    db.query('DELETE FROM users WHERE email = ?', [email], (err) => {
      if (err) {
        console.error('Database error (DELETE):', err);
        return res.status(500).json({ error: 'Failed to remove user access' });
      }

      // Successfully removed the user
      res.status(200).json({ message: 'User access removed successfully' });
    });
  });
};



