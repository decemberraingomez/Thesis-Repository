import { Schema, model, Document } from 'mongoose';

export type ThesisCategory =
  | 'Artificial Intelligence'
  | 'Data Science'
  | 'Software Engineering'
  | 'Network & Security'
  | 'Web & Mobile Development';

export type ThesisStatus = 'Under Review' | 'Approved' | 'Published' | 'Archived';

export interface IThesis extends Document {
  title: string;
  abstract: string;
  authors: string[];
  adviser: string;
  year: number;
  category: ThesisCategory;
  status: ThesisStatus;
  defenseDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const thesisSchema = new Schema<IThesis>(
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
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
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
        values: [
          'Artificial Intelligence',
          'Data Science',
          'Software Engineering',
          'Network & Security',
          'Web & Mobile Development',
        ],
        message: '{VALUE} is not an accepted category',
      },
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['Under Review', 'Approved', 'Published', 'Archived'],
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

export const Thesis = model<IThesis>('Thesis', thesisSchema);