// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect('mongodb+srv://shahid:shahid@caffe-management-system.wgqyokv.mongodb.net/?appName=caffe-management-system',)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => console.log('MongoDB Connection Error:', err));


// Question Schema
const questionSchema = new mongoose.Schema({
    entryNumber: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    resolver: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    }
}, {
    timestamps: true
});

const Question = mongoose.model('Question', questionSchema);

// Routes

// Get all questions
app.get('/api/questions', async (req, res) => {
    try {
        const questions = await Question.find().sort({ date: -1 });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching questions', error: error.message });
    }
});

// Get single question by ID
app.get('/api/questions/:id', async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.json(question);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching question', error: error.message });
    }
});

// Create new question
app.post('/api/questions', async (req, res) => {
    try {
        const { entryNumber, title, date, resolver, status } = req.body;

        // Validate required fields
        if (!title || !resolver) {
            return res.status(400).json({ message: 'Title and resolver are required' });
        }

        // Generate entry number if not provided
        let finalEntryNumber = entryNumber;
        if (!finalEntryNumber) {
            const lastQuestion = await Question.findOne().sort({ createdAt: -1 });
            const nextId = lastQuestion ? parseInt(lastQuestion.entryNumber.split('-')[1]) + 1 : 1;
            finalEntryNumber = `FAT-${nextId.toString().padStart(3, '0')}`;
        }

        const newQuestion = new Question({
            entryNumber: finalEntryNumber,
            title,
            date: date || new Date(),
            resolver,
            status: status || 'pending'
        });

        const savedQuestion = await newQuestion.save();
        res.status(201).json(savedQuestion);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Entry number already exists' });
        }
        res.status(500).json({ message: 'Error creating question', error: error.message });
    }
});

// Update question
app.put('/api/questions/:id', async (req, res) => {
    try {
        const { title, date, resolver, status } = req.body;

        const updatedQuestion = await Question.findByIdAndUpdate(
            req.params.id,
            { title, date, resolver, status },
            { new: true, runValidators: true }
        );

        if (!updatedQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.json(updatedQuestion);
    } catch (error) {
        res.status(500).json({ message: 'Error updating question', error: error.message });
    }
});

// Delete question
app.delete('/api/questions/:id', async (req, res) => {
    try {
        const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
        
        if (!deletedQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting question', error: error.message });
    }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
    try {
        const total = await Question.countDocuments();
        const pending = await Question.countDocuments({ status: 'pending' });
        const completed = await Question.countDocuments({ status: 'completed' });
        const inProgress = await Question.countDocuments({ status: 'in-progress' });

        res.json({
            total,
            pending,
            completed,
            inProgress
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching statistics', error: error.message });
    }
});

// Filter questions
app.post('/api/questions/filter', async (req, res) => {
    try {
        const { status, resolver, dateFrom, dateTo } = req.body;
        
        let query = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        if (resolver && resolver !== 'all') {
            query.resolver = resolver;
        }

        if (dateFrom || dateTo) {
            query.date = {};
            if (dateFrom) {
                query.date.$gte = new Date(dateFrom);
            }
            if (dateTo) {
                query.date.$lte = new Date(dateTo);
            }
        }

        const questions = await Question.find(query).sort({ date: -1 });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Error filtering questions', error: error.message });
    }
});

// Get list of unique resolvers
app.get('/api/resolvers', async (req, res) => {
    try {
        const resolvers = await Question.distinct('resolver');
        res.json(resolvers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching resolvers', error: error.message });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});