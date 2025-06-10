# Digital Complaint System - Setup Guide

This document explains how to set up and seed the database for testing and development purposes.

## Prerequisites

1. Make sure MongoDB is installed and running
2. Ensure your `.env` file has the correct `MONGO_URI` value
3. Set up Firebase configuration:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Generate a new private key in Project Settings > Service Accounts
   - Copy the generated JSON to `/backend/config/serviceAccountKey.json`
   - Use `serviceAccountKey.template.json` as a reference for the required format
   - Add your Firebase Storage Bucket URL to `.env` as `FIREBASE_STORAGE_BUCKET`

### Firebase Configuration

The system uses Firebase for authentication and file storage. To set up:

1. Copy `backend/config/serviceAccountKey.template.json` to `backend/config/serviceAccountKey.json`
2. Replace the placeholder values with your Firebase service account credentials
3. Never commit `serviceAccountKey.json` to version control

## Seeding the Database

To populate the database with sample data, run:

```bash
node seedDataWithDesert.js
```

## Sample Data Created

The seed script creates:

1. **Departments**:
   - Computer Science
   - Electrical Engineering
   - Mechanical Engineering
   - Civil Engineering

2. **Admins**:
   - Main Admin (email: admin@example.com, password: admin123)
   - Department Admins for each department (email: [deptcode]admin@example.com, password: admin123)

3. **Students**:
   - 20 students distributed across departments
   - Some students have desert data (status, reason, date)
   - All students have password: student123

4. **Complaints**:
   - 30 complaints with various statuses, priorities, and categories
   - Complaints are associated with random students

## Desert Data

The seed script adds desert data to some students with the following fields:
- `desertStatus`: None, Pending, Approved, or Rejected
- `desertReason`: Various reasons for desertion
- `desertDate`: Date when the desert request was made

## Accessing the Data

After seeding, you can access the data through the application or directly through MongoDB tools.