import mongoose from 'mongoose';

const NoticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  originalContent: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['text', 'pdf', 'image'],
    default: 'text'
  },
  fileName: {
    type: String
  },
  summary: {
    type: String,
    required: true
  },
  eligibility: [{
    type: String
  }],
  deadlines: [{
    task: { type: String, required: true },
    date: { type: String, default: 'Not specified' },
    originalText: { type: String }
  }],
  checklist: [{
    task: { type: String, required: true },
    completed: { type: Boolean, default: false },
    dueDate: { type: String, default: 'Not specified' }
  }]
}, {
  timestamps: true
});

const Notice = mongoose.model('Notice', NoticeSchema);
export default Notice;
