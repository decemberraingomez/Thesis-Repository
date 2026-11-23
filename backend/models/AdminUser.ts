/**
 * Author: Jezreel M. Onos
 * Date: November 23, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

import { Schema, model, Document } from 'mongoose';

export type AdminRole = 'admin';

export interface IAdminUser extends Document {
  email: string;
  name: string;
  role: AdminRole;
  passwordHash: string;
  passwordSalt: string;
  tokenVersion: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const adminUserSchema = new Schema<IAdminUser>(
  {
    email: {
      type: String,
      required: [true, 'Admin email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Admin name is required'],
      trim: true,
      default: 'Library Administrator',
    },
    role: {
      type: String,
      required: true,
      enum: {
        values: ['admin'],
        message: '{VALUE} is not an accepted admin role',
      },
      default: 'admin',
    },
    passwordHash: {
      type: String,
      required: [true, 'Admin password hash is required'],
    },
    passwordSalt: {
      type: String,
      required: [true, 'Admin password salt is required'],
    },
    tokenVersion: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const AdminUser = model<IAdminUser>('AdminUser', adminUserSchema);
