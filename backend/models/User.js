const { db, isFirebaseEnabled } = require('../config/firebase');

// Mock database for development when Firebase is not configured
const mockDatabase = isFirebaseEnabled ? null : new Map();
let mockIdCounter = 1;

class User {
  constructor(data) {
    this.email = data.email;
    this.displayName = data.displayName || '';
    this.photoURL = data.photoURL || '';
    this.provider = data.provider || 'email'; 
    this.isEmailVerified = data.isEmailVerified || false;
    this.createdAt = data.createdAt || new Date();
    this.lastLoginAt = data.lastLoginAt || new Date();
    this.role = data.role || 'user';
    this.isActive = data.isActive !== undefined ? data.isActive : true;
  }

  static async create(userData) {
    try {
      if (!isFirebaseEnabled) {
        // Mock database implementation
        const id = String(mockIdCounter++);
        const user = {
          id,
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        mockDatabase.set(id, user);
        return user;
      }

      const userRef = db.collection('users').doc();
      const user = new User({
        ...userData,
        id: userRef.id,
        createdAt: new Date()
      });
      
      await userRef.set(user);
      return { id: userRef.id, ...user };
    } catch (error) {
      throw new Error('Error creating user: ' + error.message);
    }
  }

  static async findByEmail(email) {
    try {
      if (!isFirebaseEnabled) {
        // Mock database search
        for (const [id, user] of mockDatabase.entries()) {
          if (user.email === email) {
            return { id, ...user };
          }
        }
        return null;
      }

      const snapshot = await db.collection('users')
        .where('email', '==', email)
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error('Error finding user by email: ' + error.message);
    }
  }

  static async findById(id) {
    try {
      if (!isFirebaseEnabled) {
        return mockDatabase.get(id) || null;
      }

      const doc = await db.collection('users').doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error('Error finding user by ID: ' + error.message);
    }
  }

  static async update(id, updateData) {
    try {
      if (!isFirebaseEnabled) {
        const user = mockDatabase.get(id);
        if (!user) return null;
        
        const updatedUser = { ...user, ...updateData, updatedAt: new Date() };
        mockDatabase.set(id, updatedUser);
        return updatedUser;
      }

      await db.collection('users').doc(id).update({
        ...updateData,
        updatedAt: new Date()
      });
      return await this.findById(id);
    } catch (error) {
      throw new Error('Error updating user: ' + error.message);
    }
  }

  static async delete(id) {
    try {
      if (!isFirebaseEnabled) {
        const user = mockDatabase.get(id);
        if (!user) return false;
        
        mockDatabase.set(id, { ...user, isActive: false, deletedAt: new Date() });
        return true;
      }

      await db.collection('users').doc(id).update({
        isActive: false,
        deletedAt: new Date()
      });
      return true;
    } catch (error) {
      throw new Error('Error deleting user: ' + error.message);
    }
  }
}

module.exports = User;