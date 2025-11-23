const Question = require('../models/question.model');

class QuestionRepository {

    async getAll() {
        return await Question.find().sort({ date: -1 });
    }

    async getById(id) {
        return await Question.findById(id);
    }

    async getLast() {
        return await Question.findOne().sort({ createdAt: -1 });
    }

    async create(data) {
        const question = new Question(data);
        return await question.save();
    }

    async update(id, data) {
        return await Question.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    async delete(id) {
        return await Question.findByIdAndDelete(id);
    }

    async countDocuments(query = {}) {
        return await Question.countDocuments(query);
    }

    async filter(query) {
        return await Question.find(query).sort({ date: -1 });
    }

    async getResolvers() {
        return await Question.distinct('resolver');
    }
}

module.exports = new QuestionRepository();
