/**
 * Author: Jezreel M. Onos
 * Date: November 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository
 */

const express = require('express');
const mongoose = require('mongoose');
const Thesis = require('../models/Thesis');

const { THESIS_CATEGORIES, THESIS_STATUSES } = Thesis;

const router = express.Router();

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const isValidYear = (value) => {
  const currentYear = new Date().getFullYear();
  return Number.isInteger(value) && value >= 2000 && value <= currentYear + 1;
};

const validateThesisPayload = (payload, isPartial = false) => {
  const errors = [];
  const has = (field) => Object.prototype.hasOwnProperty.call(payload, field);

  if (!isPartial || has('title')) {
    if (!isNonEmptyString(payload.title)) {
      errors.push('Title is required');
    } else if (payload.title.trim().length > 200) {
      errors.push('Title cannot exceed 200 characters');
    }
  }

  if (!isPartial || has('abstract')) {
    if (!isNonEmptyString(payload.abstract)) {
      errors.push('Abstract is required');
    }
  }

  if (!isPartial || has('authors')) {
    const authors = payload.authors;
    const isValidAuthors =
      Array.isArray(authors) &&
      authors.length > 0 &&
      authors.every((author) => isNonEmptyString(author));

    if (!isValidAuthors) {
      errors.push('At least one valid author is required');
    }
  }

  if (!isPartial || has('adviser')) {
    if (!isNonEmptyString(payload.adviser)) {
      errors.push('Adviser name is required');
    }
  }

  if (!isPartial || has('year')) {
    if (!isValidYear(payload.year)) {
      errors.push(`Year must be a whole number between 2000 and ${new Date().getFullYear() + 1}`);
    }
  }

  if (!isPartial || has('category')) {
    if (!THESIS_CATEGORIES.includes(payload.category)) {
      errors.push(`Category must be one of: ${THESIS_CATEGORIES.join(', ')}`);
    }
  }

  if (has('status') && !THESIS_STATUSES.includes(payload.status)) {
    errors.push(`Status must be one of: ${THESIS_STATUSES.join(', ')}`);
  }

  if (!isPartial || has('defenseDate')) {
    if (!payload.defenseDate || Number.isNaN(new Date(payload.defenseDate).getTime())) {
      errors.push('A valid defense date is required');
    }
  }

  return errors;
};

const sendNotFound = (res) => res.status(404).json({ message: 'Thesis not found' });

router.get('/', async (req, res, next) => {
  try {
    const { category, status, year, search } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    }

    if (year) {
      filter.year = Number(year);
    }

    if (search) {
      const pattern = new RegExp(escapeRegExp(String(search).trim()), 'i');
      filter.$or = [{ title: pattern }, { abstract: pattern }, { authors: pattern }];
    }

    const theses = await Thesis.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ count: theses.length, data: theses });
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const validationErrors = validateThesisPayload(req.body);

    if (validationErrors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
    }

    const thesis = await Thesis.create(req.body);
    return res.status(201).json({ message: 'Thesis created', data: thesis });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid thesis id' });
    }

    const thesis = await Thesis.findById(req.params.id);

    if (!thesis) {
      return sendNotFound(res);
    }

    return res.status(200).json({ data: thesis });
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid thesis id' });
    }

    const validationErrors = validateThesisPayload(req.body, true);

    if (validationErrors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
    }

    const thesis = await Thesis.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!thesis) {
      return sendNotFound(res);
    }

    return res.status(200).json({ message: 'Thesis updated', data: thesis });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid thesis id' });
    }

    const thesis = await Thesis.findByIdAndDelete(req.params.id);

    if (!thesis) {
      return sendNotFound(res);
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
