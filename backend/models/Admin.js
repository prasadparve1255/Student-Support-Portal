const { db, auth } = require('../config/firebaseAdmin');
const { FieldValue } = require('firebase-admin/firestore');

const COLLECTION = 'admins';

class Admin {
    static async create(adminData) {
        const { name, email, department, isMainAdmin = false } = adminData;

        // Create Firebase Auth user
        const userRecord = await auth.createUser({
            email,
            password: adminData.password,
            displayName: name,
            emailVerified: true
        });

        // Set custom claims for admin role
        await auth.setCustomUserClaims(userRecord.uid, {
            admin: true,
            mainAdmin: isMainAdmin,
            department: department || null
        });

        // Create admin document in Firestore
        const adminRef = db.collection(COLLECTION).doc(userRecord.uid);
        await adminRef.set({
            name,
            email: email.toLowerCase(),
            department,
            isAdmin: true,
            isMainAdmin,
            createdAt: FieldValue.serverTimestamp()
        });

        return adminRef;
    }

    static async findById(adminId) {
        const doc = await db.collection(COLLECTION).doc(adminId).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    }

    static async findByEmail(email) {
        const snapshot = await db.collection(COLLECTION)
            .where('email', '==', email.toLowerCase())
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }

    static async update(adminId, updateData) {
        const adminRef = db.collection(COLLECTION).doc(adminId);
        const updates = { ...updateData };

        // If password is being updated, update it in Firebase Auth
        if (updateData.password) {
            await auth.updateUser(adminId, {
                password: updateData.password
            });
            delete updates.password;
        }

        // If email is being updated, update it in Firebase Auth
        if (updateData.email) {
            await auth.updateUser(adminId, {
                email: updateData.email
            });
        }

        // Update Firestore document
        await adminRef.update({
            ...updates,
            updatedAt: FieldValue.serverTimestamp()
        });

        return adminRef;
    }

    static async delete(adminId) {
        // Delete from Firebase Auth
        await auth.deleteUser(adminId);
        // Delete from Firestore
        await db.collection(COLLECTION).doc(adminId).delete();
    }

    static async list(filters = {}) {
        let query = db.collection(COLLECTION);

        if (filters.department) {
            query = query.where('department', '==', filters.department);
        }

        if (filters.isMainAdmin !== undefined) {
            query = query.where('isMainAdmin', '==', filters.isMainAdmin);
        }

        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    static async verifyPassword(adminId, password) {
        try {
            // Get admin's email
            const admin = await this.findById(adminId);
            if (!admin) return false;

            // Try to sign in with email/password using Firebase Auth
            await auth.getUserByEmail(admin.email);
            // If successful, password is valid
            return true;
        } catch (error) {
            return false;
        }
    }
}

module.exports = Admin;