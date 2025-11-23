const mongoose = require('mongoose'); 
//model

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

module.exports = mongoose.model('Question', questionSchema);
