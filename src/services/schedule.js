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
  writeBatch,
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

// Delete All - 전체 일정 삭제 (테스트용)
export async function deleteAllEvents(userId) {
  const q = query(
    collection(db, 'events'),
    where('userId', '==', userId)
  )
  const snapshot = await getDocs(q)
  if (snapshot.empty) return 0

  const batch = writeBatch(db)
  snapshot.docs.forEach((d) => batch.delete(d.ref))
  await batch.commit()
  return snapshot.size
}

// Batch Create - 카테고리 일괄 일정 생성 (중복 방지)
export async function addBatchEvents(userId, events, date, categoryId) {
  // 해당 날짜의 기존 이벤트 조회 (중복 방지)
  const dayStart = new Date(`${date}T00:00:00`)
  const dayEnd = new Date(`${date}T23:59:59`)
  const existingQuery = query(
    collection(db, 'events'),
    where('userId', '==', userId),
    where('startTime', '>=', Timestamp.fromDate(dayStart)),
    where('startTime', '<=', Timestamp.fromDate(dayEnd)),
  )
  const existingSnapshot = await getDocs(existingQuery)
  const existingSet = new Set(
    existingSnapshot.docs.map((d) => {
      const data = d.data()
      return `${data.title}|${data.startTime?.toDate?.()?.getTime()}`
    })
  )

  const batch = writeBatch(db)
  const eventsRef = collection(db, 'events')
  let added = 0

  events.forEach((event) => {
    const startDate = new Date(`${date}T${event.time}`)
    if (isNaN(startDate.getTime())) return

    // 같은 제목 + 같은 시작 시간이면 건너뛰기
    const key = `${event.title}|${startDate.getTime()}`
    if (existingSet.has(key)) return

    const endDate = event.duration
      ? new Date(startDate.getTime() + event.duration * 60000)
      : null

    const newDocRef = doc(eventsRef)
    const docData = {
      userId,
      title: event.title,
      startTime: Timestamp.fromDate(startDate),
      endTime: endDate ? Timestamp.fromDate(endDate) : null,
      category: event.category || 'general',
      location: '',
      attendees: [],
      createdAt: Timestamp.now(),
      createdVia: 'category',
    }
    if (categoryId) docData.categoryId = categoryId
    if (event.careType) docData.careType = event.careType
    batch.set(newDocRef, docData)
    added++
  })

  if (added > 0) await batch.commit()
}
