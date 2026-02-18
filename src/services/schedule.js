import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

// Create - 일정 생성
export async function createEvent(userId, eventData) {
  const eventsRef = collection(db, 'events')
  const docRef = await addDoc(eventsRef, {
    userId,
    title: eventData.title,
    startTime: Timestamp.fromDate(new Date(`${eventData.date}T${eventData.time}`)),
    endTime: eventData.duration
      ? Timestamp.fromDate(
          new Date(new Date(`${eventData.date}T${eventData.time}`).getTime() + eventData.duration * 60000)
        )
      : null,
    category: eventData.category || 'general',
    location: eventData.location || '',
    attendees: eventData.attendees || [],
    createdAt: Timestamp.now(),
    createdVia: 'chat',
  })
  return docRef.id
}

// Read - 기간별 일정 조회
export async function getEvents(userId, startDate, endDate) {
  const q = query(
    collection(db, 'events'),
    where('userId', '==', userId),
    where('startTime', '>=', Timestamp.fromDate(startDate)),
    where('startTime', '<=', Timestamp.fromDate(endDate)),
    orderBy('startTime')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

// Update - 일정 수정
export async function updateEvent(eventId, updates) {
  const eventRef = doc(db, 'events', eventId)
  await updateDoc(eventRef, updates)
}

// Move - 일정 날짜/시간 이동
export async function moveEvent(eventId, oldEvent, newDateStr, newHour = null) {
  const oldStart = oldEvent.startTime.toDate()
  const [year, month, day] = newDateStr.split('-').map(Number)
  const newStart = new Date(year, month - 1, day)

  if (newHour !== null) {
    newStart.setHours(Math.floor(newHour), Math.round((newHour % 1) * 60), 0, 0)
  } else {
    newStart.setHours(oldStart.getHours(), oldStart.getMinutes(), oldStart.getSeconds(), 0)
  }

  const updates = { startTime: Timestamp.fromDate(newStart) }

  if (oldEvent.endTime?.toDate) {
    const duration = oldEvent.endTime.toDate().getTime() - oldStart.getTime()
    updates.endTime = Timestamp.fromDate(new Date(newStart.getTime() + duration))
  }

  await updateEvent(eventId, updates)
}

// Toggle completed - 일정 완료/미완료 토글
export async function toggleEventCompleted(eventId, completed) {
  const eventRef = doc(db, 'events', eventId)
  await updateDoc(eventRef, { completed: !completed })
}

// Delete - 일정 삭제
export async function deleteEvent(eventId) {
  const eventRef = doc(db, 'events', eventId)
  await deleteDoc(eventRef)
}
