/**
 * Author: Jezreel M. Onos
 * Date: November 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository
 */

const mongoose = require('mongoose');

const THESIS_CATEGORIES = [
  'Artificial Intelligence',
  'Data Science',
  'Software Engineering',
  'Network & Security',
  'Web & Mobile Development',
];

const THESIS_STATUSES = ['Under Review', 'Approved', 'Published', 'Archived'];

const thesisSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Thesis title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    abstract: {
      type: String,
      required: [true, 'Abstract is required'],
      trim: true,
    },
    authors: {
      type: [String],
      required: [true, 'At least one author is required'],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'Must include at least one author',
      },
    },
    adviser: {
      type: String,
      required: [true, 'Adviser name is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Publication year is required'],
      min: [2000, 'Year must be 2000 or later'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the future'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: THESIS_CATEGORIES,
        message: '{VALUE} is not an accepted category',
      },
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: THESIS_STATUSES,
        message: '{VALUE} is not an accepted status',
      },
      default: 'Under Review',
    },
    defenseDate: {
      type: Date,
      required: [true, 'Defense date is required'],
    },
  },
  {
    timestamps: true,
  }
);

thesisSchema.index({ title: 'text', abstract: 'text', authors: 'text' });

const Thesis = mongoose.model('Thesis', thesisSchema);

module.exports = Thesis;
module.exports.THESIS_CATEGORIES = THESIS_CATEGORIES;
module.exports.THESIS_STATUSES = THESIS_STATUSES;
