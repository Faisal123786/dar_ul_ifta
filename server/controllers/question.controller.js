const QuestionRepository = require('../repositories/question.repository');

// --------------------------- Get All Questions ---------------------------

exports.getAll = async (req, res) => {
    try {
        const questions = await QuestionRepository.getAll();
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching questions', error: error.message });
    }
};

// --------------------------- Get by ID ---------------------------

exports.getById = async (req, res) => {
    try {
        const question = await QuestionRepository.getById(req.params.id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.json(question);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching question', error: error.message });
    }
};

// --------------------------- Create ---------------------------

exports.create = async (req, res) => {
    try {
        const { entryNumber, title, date, resolver, status } = req.body;

        if (!title || !resolver) {
            return res.status(400).json({ message: 'Title and resolver are required' });
        }

        let finalEntryNumber = entryNumber;

        if (!finalEntryNumber) {
            const last = await QuestionRepository.getLast();
            const nextId = last ? parseInt(last.entryNumber.split('-')[1]) + 1 : 1;
            finalEntryNumber = `FAT-${nextId.toString().padStart(3, '0')}`;
        }

        const newQuestion = {
            entryNumber: finalEntryNumber,
            title,
            date: date || new Date(),
            resolver,
            status: status || 'pending'
        };

        const saved = await QuestionRepository.create(newQuestion);

        res.status(201).json(saved);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Entry number already exists' });
        }
        res.status(500).json({ message: 'Error creating question', error: error.message });
    }
};

// --------------------------- Update ---------------------------

exports.update = async (req, res) => {
    try {
        const updated = await QuestionRepository.update(req.params.id, req.body);

        if (!updated) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Error updating question', error: error.message });
    }
};

// --------------------------- Delete ---------------------------

exports.delete = async (req, res) => {
    try {
        const deleted = await QuestionRepository.delete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting question', error: error.message });
    }
};

// --------------------------- Get Statistics ---------------------------

exports.getStats = async (req, res) => {
    try {
        const total = await QuestionRepository.countDocuments();
        const pending = await QuestionRepository.countDocuments({ status: 'pending' });
        const completed = await QuestionRepository.countDocuments({ status: 'completed' });
        const inProgress = await QuestionRepository.countDocuments({ status: 'in-progress' });

        res.json({
            total,
            pending,
            completed,
            inProgress
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching statistics', error: error.message });
    }
};

// --------------------------- Filter ---------------------------

exports.filter = async (req, res) => {
    try {
        const { status, resolver, dateFrom, dateTo } = req.body;

        let query = {};

        if (status && status !== 'all') query.status = status;
        if (resolver && resolver !== 'all') query.resolver = resolver;

        if (dateFrom || dateTo) {
            query.date = {};
            if (dateFrom) query.date.$gte = new Date(dateFrom);
            if (dateTo) query.date.$lte = new Date(dateTo);
        }

        const questions = await QuestionRepository.filter(query);
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Error filtering questions', error: error.message });
    }
};

// --------------------------- Get Resolvers ---------------------------

exports.getResolvers = async (req, res) => {
    try {
        const resolvers = await QuestionRepository.getResolvers();
        res.json(resolvers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching resolvers', error: error.message });
    }
};
