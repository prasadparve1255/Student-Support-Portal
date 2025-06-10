const { db } = require('../config/firebaseAdmin');
const { FieldValue } = require('firebase-admin/firestore');

const COLLECTION = 'departments';

class Department {
    static async create(departmentData) {
        const { name, code, description } = departmentData;

        // Use department code as document ID for easier reference
        const departmentRef = db.collection(COLLECTION).doc(code);
        
        // Check if department already exists
        const doc = await departmentRef.get();
        if (doc.exists) {
            throw new Error('Department with this code already exists');
        }

        await departmentRef.set({
            name,
            code,
            description: description || '',
            createdAt: FieldValue.serverTimestamp()
        });

        return departmentRef;
    }

    static async findById(code) {
        const doc = await db.collection(COLLECTION).doc(code).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    }

    static async findByName(name) {
        const snapshot = await db.collection(COLLECTION)
            .where('name', '==', name)
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }

    static async update(code, updateData) {
        const departmentRef = db.collection(COLLECTION).doc(code);
        await departmentRef.update({
            ...updateData,
            updatedAt: FieldValue.serverTimestamp()
        });
        return departmentRef;
    }

    static async delete(code) {
        await db.collection(COLLECTION).doc(code).delete();
    }

    static async list() {
        const snapshot = await db.collection(COLLECTION)
            .orderBy('name', 'asc')
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }
}

module.exports = Department;