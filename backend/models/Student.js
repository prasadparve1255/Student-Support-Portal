const { db } = require('../config/firebaseAdmin');
const { FieldValue } = require('firebase-admin/firestore');

const COLLECTION = 'students';

class Student {
    static async create(studentData) {
        const { email, name, studentId, department, createdBy, registrationSource } = studentData;
        
        const studentRef = db.collection(COLLECTION).doc(studentId);
        await studentRef.set({
            email: email.toLowerCase(),
            name,
            studentId,
            department,
            createdBy,
            registrationSource,
            createdAt: FieldValue.serverTimestamp(),
            desertStatus: 'None',
            desertReason: '',
            desertDate: null
        });
        
        return studentRef;
    }

    static async findById(studentId) {
        const doc = await db.collection(COLLECTION).doc(studentId).get();
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

    static async update(studentId, updateData) {
        const studentRef = db.collection(COLLECTION).doc(studentId);
        await studentRef.update({
            ...updateData,
            updatedAt: FieldValue.serverTimestamp()
        });
        return studentRef;
    }

    static async delete(studentId) {
        await db.collection(COLLECTION).doc(studentId).delete();
    }

    static async list(filters = {}) {
        let query = db.collection(COLLECTION);
        
        if (filters.department) {
            query = query.where('department', '==', filters.department);
        }
        
        if (filters.desertStatus) {
            query = query.where('desertStatus', '==', filters.desertStatus);
        }

        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }
}

module.exports = Student;