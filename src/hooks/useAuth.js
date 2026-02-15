import { useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, setDoc, Timestamp } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../services/firebase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Firebase 미설정 시 데모 모드
      setUser({ uid: 'demo', email: 'demo@example.com', isDemo: true })
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result.user
  }

  const register = async (email, password) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await setDoc(doc(db, 'users', result.user.uid), {
      userId: result.user.uid,
      email: result.user.email,
      createdAt: Timestamp.now(),
    })
    return result.user
  }

  const logout = () => {
    if (!isFirebaseConfigured) {
      setUser(null)
      return
    }
    return signOut(auth)
  }

  return { user, loading, login, register, logout }
}
