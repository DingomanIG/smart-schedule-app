/**
 * helperProfile.js - Firestore 프로필 CRUD
 * 온보딩 완료 후 선호도를 저장하여 다음 사용 시 질문 스킵
 */
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase'

/**
 * 도우미 프로필 저장 (upsert)
 * @param {string} userId
 * @param {string} helperId - 'H01' (일상 도우미)
 * @param {object} preferences - { wakeUp, bedTime, meals, commute, routines }
 */
export async function saveHelperProfile(userId, helperId, preferences) {
  if (!isFirebaseConfigured || !db) return

  const docId = `${userId}_${helperId}`
  const ref = doc(db, 'helperProfiles', docId)

  await setDoc(ref, {
    userId,
    helperId,
    preferences,
    updatedAt: Timestamp.now(),
  }, { merge: true })
}

/**
 * 도우미 프로필 조회
 * @param {string} userId
 * @param {string} helperId - 'H01'
 * @returns {object|null} preferences 또는 null
 */
export async function getHelperProfile(userId, helperId) {
  if (!isFirebaseConfigured || !db) return null

  const docId = `${userId}_${helperId}`
  const ref = doc(db, 'helperProfiles', docId)
  const snap = await getDoc(ref)

  if (snap.exists()) {
    return snap.data().preferences
  }
  return null
}
