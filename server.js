require('dotenv').config(); // Load environment variables from .env

const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const port = 5000;

app.use(express.json());

// Simulate a simple in-memory database
let users = [];
let notes = [];

// JWT Generator
function generateJwt(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

// Middleware for authentication
function authenticateToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });

        req.user = decoded;
        next();
    });
}

// 1. Register
app.post('/api/auth/register', (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    if (users.some(user => user.email === email)) {
        return res.status(400).json({ message: 'Email already registered' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const newUser = {
        id: `user_id_${users.length + 1}`,
        email,
        name,
        password,
    };

    users.push(newUser);
    const access_token = generateJwt(newUser.id);

    res.status(201).json({
        message: 'User registered successfully',
        access_token,
        user: { id: newUser.id, email, name },
    });
});

// 2. Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Missing email or password' });
    }

    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const access_token = generateJwt(user.id);
    res.status(200).json({
        message: 'Login successful',
        access_token,
        user: { id: user.id, email: user.email, name: user.name },
    });
});

// 3. Get current user info
app.get('/api/auth/me', authenticateToken, (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(401).json({ message: 'Invalid token' });

    res.status(200).json({
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            created_at: '2023-03-14T12:00:00.000Z',
            updated_at: '2023-03-14T12:00:00.000Z',
        },
    });
});

// 4. Create a note
app.post('/api/notes', authenticateToken, (req, res) => {
    const { title, details } = req.body;
    if (!title || !details) {
        return res.status(400).json({ message: 'Title and details are required' });
    }

    const note = {
        id: `note_id_${notes.length + 1}`,
        title,
        details,
        owner_id: req.user.id,
        shared_with: [],
        bookmarked_by: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    notes.push(note);
    res.status(201).json({ message: 'Note created successfully', note });
});

// 5. Get all notes for current user
app.get('/api/notes', authenticateToken, (req, res) => {
    const userNotes = notes.filter(
        note =>
            note.owner_id === req.user.id || note.shared_with.includes(req.user.id)
    );
    res.status(200).json({ notes: userNotes });
});

// 6. Get specific note by ID
app.get('/api/notes/:note_id', (req, res) => {
    const note = notes.find(n => n.id === req.params.note_id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.status(200).json({ note });
});

// 7. Delete note
app.delete('/api/notes/:note_id', authenticateToken, (req, res) => {
    const index = notes.findIndex(n => n.id === req.params.note_id);
    if (index === -1) return res.status(404).json({ message: 'Note not found' });

    if (notes[index].owner_id !== req.user.id) {
        return res.status(403).json({ message: 'Not allowed to delete this note' });
    }

    notes.splice(index, 1);
    res.status(200).json({ message: 'Note deleted successfully' });
});

// 8. Update a note
app.put('/api/notes/:note_id', authenticateToken, (req, res) => {
    const { title, details } = req.body;
    const note = notes.find(n => n.id === req.params.note_id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (note.owner_id !== req.user.id) {
        return res.status(403).json({ message: 'Not allowed to update this note' });
    }

    note.title = title || note.title;
    note.details = details || note.details;
    note.updated_at = new Date().toISOString();

    res.status(200).json({ message: 'Note updated successfully', note });
});

// 9. Search notes by title
app.get('/api/notes/search?title=:query_id', authenticateToken, (req, res) => {
    const { title } = req.query;
    if (!title) return res.status(400).json({ message: 'Title query is required' });

    const filtered = notes.filter(note =>
        (note.owner_id === req.user.id || note.shared_with.includes(req.user.id)) &&
        note.title.toLowerCase().includes(title.toLowerCase())
    );

    res.status(200).json({ notes: filtered });
});

// 10. Share note
app.post('/api/notes/:note_id/share', authenticateToken, (req, res) => {
    const { email } = req.body;
    const note = notes.find(n => n.id === req.params.note_id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (note.owner_id !== req.user.id) {
        return res.status(403).json({ message: 'Not allowed to share this note' });
    }

    const userToShare = users.find(u => u.email === email);
    if (!userToShare) return res.status(404).json({ message: 'User not found' });

    if (!note.shared_with.includes(userToShare.id)) {
        note.shared_with.push(userToShare.id);
    }

    res.status(200).json({ message: 'Note shared successfully' });
});

// ✅ 11. Bookmark/Unbookmark note (Method changed to GET)
app.get('/api/notes/:note_id/bookmark', authenticateToken, (req, res) => {
    const note = notes.find(n => n.id === req.params.note_id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const userId = req.user.id;
    if (note.bookmarked_by.includes(userId)) {
        // Unbookmark
        note.bookmarked_by = note.bookmarked_by.filter(id => id !== userId);
        res.status(200).json({ message: 'Note unbookmarked' });
    } else {
        // Bookmark
        note.bookmarked_by.push(userId);
        res.status(200).json({ message: 'Note bookmarked' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
