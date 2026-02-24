import { useState, useRef, useEffect } from 'react'
import { Send, Calendar, Clock, MapPin, Check, X, Loader2, ArrowRight, Trash2, Cake, Heart, PartyPopper } from 'lucide-react'
import { parseSchedule, generateDailySchedule, generatePetCareSchedule, generateWorkSchedule, generateChildcareSchedule } from '../services/openai'
import { createEvent, getEvents, moveEvent, updateEvent, deleteEvent, deleteAllEvents, addBatchEvents } from '../services/schedule'
import { saveHelperProfile, getHelperProfile } from '../services/helperProfile'
import {
  parseTimeInput, parseMealsInput, parseCommuteInput,
  parseRoutinesInput, isDailyHelperTrigger, isPetCareHelperTrigger, isHelperCancel,
  parsePetType, parsePetName, parsePetAge, parsePetSize, parsePetIndoor,
  isProfileEditTrigger,
  isWorkHelperTrigger, parseWorkType, parseWorkHours, parseFocusPeak, parseWorkTasks,
  isChildcareHelperTrigger, parseChildName, parseChildBirthdate, parseChildGender,
} from '../utils/helperParser'
import BatchConfirmCard from './BatchConfirmCard'
import PetCareCard from './PetCareCard'
import WorkScheduleCard from './WorkScheduleCard'
import ChildcareCard from './ChildcareCard'
import { calculateAgeMonths, getChildAgeGroup, AGE_GROUPS } from '../data/childcareDefaults'
import HelperSelector from './HelperSelector'
import { useLanguage } from '../hooks/useLanguage'

const ONBOARDING_STEPS = [
  { key: 'wakeUp',   askKey: 'helperAskWakeUp',   parser: parseTimeInput },
  { key: 'bedTime',  askKey: 'helperAskBedTime',   parser: parseTimeInput },
  { key: 'meals',    askKey: 'helperAskMeals',     parser: parseMealsInput },
  { key: 'commute',  askKey: 'helperAskCommute',   parser: parseCommuteInput },
  { key: 'routines', askKey: 'helperAskRoutines',  parser: parseRoutinesInput },
]

// 반려동물 1마리 정보 수집 스텝
const PET_SINGLE_STEPS = [
  { key: 'petType',   askKey: 'petCareAskType',    parser: parsePetType },
  { key: 'petName',   askKey: 'petCareAskName',    parser: parsePetName },
  { key: 'petAge',    askKey: 'petCareAskAge',     parser: parsePetAge },
  { key: 'petSize',   askKey: 'petCareAskSize',    parser: parsePetSize, skipIf: (a) => a._currentPet?.petType !== 'dog' },
  { key: 'petIndoor', askKey: 'petCareAskIndoor',  parser: parsePetIndoor },
]

// 마지막 공통 질문 스텝
const PET_FINAL_STEPS = [
  { key: 'wakeUp',       askKey: 'petCareAskWakeUp',       parser: parseTimeInput },
  { key: 'simultaneous', askKey: 'petCareAskSimultaneous',  parser: parsePetIndoor, skipIf: (a) => (a.pets || []).length < 2 },
]

// 레거시 호환용
const PET_ONBOARDING_STEPS = [
  ...PET_SINGLE_STEPS,
  { key: 'wakeUp', askKey: 'petCareAskWakeUp', parser: parseTimeInput },
]

// 업무 도우미 프로필 수집 스텝
const WORK_ONBOARDING_STEPS = [
  { key: 'workType',       askKey: 'helperWorkAskWorkType', parser: parseWorkType },
  { key: 'workHours',      askKey: 'helperWorkAskHours',    parser: parseWorkHours },
  { key: 'focusPeak',      askKey: 'helperWorkAskFocus',    parser: parseFocusPeak },
  { key: 'worksWeekends',  askKey: 'helperWorkAskWeekend',  parser: parsePetIndoor },
]

// 육아 도우미 프로필 수집 스텝
const CHILDCARE_ONBOARDING_STEPS = [
  { key: 'childName',      askKey: 'childcareAskName',      parser: parseChildName },
  { key: 'childBirthdate', askKey: 'childcareAskBirthdate', parser: parseChildBirthdate },
  { key: 'childGender',    askKey: 'childcareAskGender',    parser: parseChildGender },
  { key: 'wakeUp',         askKey: 'childcareAskWakeUp',    parser: parseTimeInput },
]

function getOnboardingSteps(type) {
  if (type === 'petcare') return PET_ONBOARDING_STEPS
  if (type === 'work') return WORK_ONBOARDING_STEPS
  if (type === 'childcare') return CHILDCARE_ONBOARDING_STEPS
  return ONBOARDING_STEPS
}

export default function ChatInterface({ userId, onEventCreated }) {
  const { t } = useLanguage()

  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: t('chatGreeting'),
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastEventContext, setLastEventContext] = useState(null)
  const [helperState, setHelperState] = useState(null)
  const [pendingProfile, setPendingProfile] = useState(null)
  const messagesEndRef = useRef(null)
  const confirmingRef = useRef(false)
  const selectingDaysRef = useRef(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchRecentEvents = async () => {
    try {
      const now = new Date()
      const start = new Date(now)
      start.setDate(start.getDate() - 7)
      const end = new Date(now)
      end.setDate(end.getDate() + 14)
      return await getEvents(userId, start, end)
    } catch {
      return []
    }
  }

  // === Helper: 온보딩 시작 ===
  const startHelperOnboarding = (type) => {
    const steps = getOnboardingSteps(type)
    setHelperState({ type, step: 0, answers: {} })
    const startMsg = type === 'petcare' ? t('petCareStart') : type === 'work' ? t('helperWorkStart') : type === 'childcare' ? t('childcareStart') : t('helperStart')
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: `${startMsg}\n\n${t(steps[0].askKey)}\n${t('helperCancelHint')}` },
    ])
  }

  // === Helper: 시작 (프로필 확인 → 온보딩 or 일수 선택/바로 생성) ===
  const handleStartHelper = async (type) => {
    if (type !== 'daily' && type !== 'petcare' && type !== 'work' && type !== 'childcare') return

    setLoading(true)
    try {
      if (type === 'childcare') {
        const existingProfile = await getHelperProfile(userId, 'H06')
        if (existingProfile) {
          const ageMonths = calculateAgeMonths(existingProfile.childBirthdate)
          const ageGroupKey = getChildAgeGroup(ageMonths)
          const ageGroup = AGE_GROUPS[ageGroupKey]
          setPendingProfile({ _type: 'childcare', ...existingProfile })
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: `${t('childcareProfileFound')} ${existingProfile.childName} (${ageMonths}${t('childcareMonthUnit')}, ${ageGroup?.label})\n${t('helperAskDays')}`, action: 'select_days' },
          ])
        } else {
          startHelperOnboarding(type)
        }
      } else if (type === 'work') {
        const existingProfile = await getHelperProfile(userId, 'H04')
        if (existingProfile) {
          setPendingProfile({ _type: 'work', ...existingProfile })
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: `${t('helperWorkProfileFound')}\n${t('helperWorkAskTasks')}`, action: 'work_ask_tasks' },
          ])
        } else {
          startHelperOnboarding(type)
        }
      } else if (type === 'daily') {
        const existingProfile = await getHelperProfile(userId, 'H01')
        if (existingProfile) {
          setPendingProfile(existingProfile)
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: t('helperAskDays'), action: 'select_days' },
          ])
        } else {
          startHelperOnboarding(type)
        }
      } else if (type === 'petcare') {
        const existingProfile = await getHelperProfile(userId, 'H11')
        if (existingProfile) {
          // 기존 프로필 → 일수 선택
          const pets = existingProfile.pets || [{ petType: existingProfile.petType, petName: existingProfile.petName, petAge: existingProfile.petAge, petSize: existingProfile.petSize, petIndoor: existingProfile.petIndoor }]
          const petSummary = pets.map(p => `${p.petName}(${p.petType === 'dog' ? '🐶' : '🐱'})`).join(', ')
          setPendingProfile({ _type: 'petcare', ...existingProfile })
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: `${t('petCareProfileFound')} ${petSummary}\n${t('helperAskDays')}`, action: 'select_days' },
          ])
        } else {
          startHelperOnboarding(type)
        }
      }
    } catch {
      startHelperOnboarding(type)
    } finally {
      setLoading(false)
    }
  }

  // === Helper: 일수 선택 → 생성 ===
  const handleSelectDays = async (days) => {
    if (!pendingProfile) return
    if (selectingDaysRef.current) return
    selectingDaysRef.current = true
    const profile = pendingProfile
    const isPetCare = profile._type === 'petcare'
    const isWork = profile._type === 'work'
    const isChildcare = profile._type === 'childcare'
    setPendingProfile(null)
    setMessages((prev) => [
      ...prev.map((m) => m.action === 'select_days' ? { ...m, answered: true } : m),
      { role: 'user', content: `${days}${t('helperDayUnit')}` },
      { role: 'assistant', content: isWork ? t('helperWorkGenerating') : isChildcare ? t('childcareGenerating') : t('helperGenerating') },
    ])
    setLoading(true)
    try {
      if (isWork) {
        const { _type, _tasks, ...workProfile } = profile
        await generateAndShowWorkBatch(workProfile, _tasks, days)
      } else if (isChildcare) {
        const { _type, ...childInfo } = profile
        await generateAndShowChildcareBatch(childInfo, days)
      } else if (isPetCare) {
        const { _type, ...petInfo } = profile
        await generateAndShowPetCareBatch(petInfo, days)
      } else {
        await generateAndShowBatch(profile, days)
      }
    } finally {
      selectingDaysRef.current = false
    }
  }

  const parseDaysInput = (text) => {
    const s = text.trim()
    const weekMatch = s.match(/(\d+)\s*주/)
    if (weekMatch) return Math.min(parseInt(weekMatch[1]) * 7, 60)
    const dayMatch = s.match(/(\d+)/)
    if (dayMatch) {
      const n = parseInt(dayMatch[1])
      if (n >= 1 && n <= 60) return n
    }
    return null
  }

  // === Helper: 온보딩 답변 처리 ===
  const processHelperAnswer = async (text) => {
    // 취소 체크
    if (isHelperCancel(text)) {
      setHelperState(null)
      const cancelMsg = helperState.type === 'petcare' ? t('petCareCancelled') : helperState.type === 'work' ? t('helperWorkCancelled') : helperState.type === 'childcare' ? t('childcareCancelled') : t('helperCancelled')
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: cancelMsg },
      ])
      setLoading(false)
      return
    }

    const { type, step, answers } = helperState

    // === 펫 케어 다중 펫 온보딩 ===
    if (type === 'petcare') {
      const phase = answers._phase || 'pet_info'  // pet_info | ask_more | final
      const petStep = answers._petStep || 0
      const pets = answers.pets || []
      const currentPet = answers._currentPet || {}

      if (phase === 'pet_info') {
        const currentStepDef = PET_SINGLE_STEPS[petStep]
        // skipIf 체크 (크기는 강아지만)
        if (currentStepDef.skipIf?.({ _currentPet: currentPet })) {
          // 자동 스킵 → 다음 스텝으로
          const nextPetStep = petStep + 1
          if (nextPetStep < PET_SINGLE_STEPS.length) {
            const nextDef = PET_SINGLE_STEPS[nextPetStep]
            setHelperState({ ...helperState, answers: { ...answers, _petStep: nextPetStep } })
            setMessages(prev => [...prev, { role: 'assistant', content: `${t(nextDef.askKey)}\n${t('helperCancelHint')}` }])
          }
          setLoading(false)
          return
        }

        const parsed = currentStepDef.parser(text)
        if (parsed === null) {
          setMessages(prev => [...prev, { role: 'assistant', content: `${t('helperParseRetry')}\n\n${t(currentStepDef.askKey)}` }])
          setLoading(false)
          return
        }

        const updatedPet = { ...currentPet, [currentStepDef.key]: parsed }

        // 다음 펫 스텝 찾기
        let nextPetStep = petStep + 1
        while (nextPetStep < PET_SINGLE_STEPS.length && PET_SINGLE_STEPS[nextPetStep].skipIf?.({ _currentPet: updatedPet })) {
          nextPetStep++
        }

        if (nextPetStep < PET_SINGLE_STEPS.length) {
          setHelperState({ ...helperState, answers: { ...answers, _currentPet: updatedPet, _petStep: nextPetStep } })
          setMessages(prev => [...prev, { role: 'assistant', content: `${t(PET_SINGLE_STEPS[nextPetStep].askKey)}\n${t('helperCancelHint')}` }])
          setLoading(false)
        } else {
          // 이 펫 완료 → "더 있나요?" 질문
          const newPets = [...pets, updatedPet]
          setHelperState({ ...helperState, answers: { ...answers, pets: newPets, _currentPet: {}, _petStep: 0, _phase: 'ask_more' } })
          const petSummary = newPets.map(p => `${p.petName}(${p.petType === 'dog' ? '🐶' : '🐱'})`).join(', ')
          setMessages(prev => [...prev, { role: 'assistant', content: `✅ ${updatedPet.petName} 등록 완료! (현재: ${petSummary})\n\n${t('petCareAskMorePets')}\n${t('helperCancelHint')}` }])
          setLoading(false)
        }
        return
      }

      if (phase === 'ask_more') {
        const yesNo = parsePetIndoor(text) // true=예, false=아니오
        if (yesNo === null) {
          setMessages(prev => [...prev, { role: 'assistant', content: `${t('helperParseRetry')}\n\n${t('petCareAskMorePets')}` }])
          setLoading(false)
          return
        }
        if (yesNo) {
          // 추가 펫 → pet_info 처음으로
          setHelperState({ ...helperState, answers: { ...answers, _phase: 'pet_info', _petStep: 0, _currentPet: {} } })
          setMessages(prev => [...prev, { role: 'assistant', content: `${t('petCareAskType')}\n${t('helperCancelHint')}` }])
          setLoading(false)
        } else {
          // 펫 추가 끝 → final 질문
          const finalSteps = PET_FINAL_STEPS.filter(s => !s.skipIf?.(answers))
          if (finalSteps.length > 0) {
            setHelperState({ ...helperState, answers: { ...answers, _phase: 'final', _finalStep: 0 } })
            setMessages(prev => [...prev, { role: 'assistant', content: `${t(finalSteps[0].askKey)}\n${t('helperCancelHint')}` }])
            setLoading(false)
          } else {
            // final 질문 없으면 바로 완료
            await finishPetOnboarding({ ...answers, _phase: undefined, _petStep: undefined, _currentPet: undefined, _finalStep: undefined })
          }
        }
        return
      }

      if (phase === 'final') {
        const finalSteps = PET_FINAL_STEPS.filter(s => !s.skipIf?.(answers))
        const fIdx = answers._finalStep || 0
        const currentFinal = finalSteps[fIdx]
        const parsed = currentFinal.parser(text)
        if (parsed === null) {
          setMessages(prev => [...prev, { role: 'assistant', content: `${t('helperParseRetry')}\n\n${t(currentFinal.askKey)}` }])
          setLoading(false)
          return
        }
        const newAnswers = { ...answers, [currentFinal.key]: parsed }
        const nextFIdx = fIdx + 1
        if (nextFIdx < finalSteps.length) {
          setHelperState({ ...helperState, answers: { ...newAnswers, _finalStep: nextFIdx } })
          setMessages(prev => [...prev, { role: 'assistant', content: `${t(finalSteps[nextFIdx].askKey)}\n${t('helperCancelHint')}` }])
          setLoading(false)
        } else {
          await finishPetOnboarding({ ...newAnswers, _phase: undefined, _petStep: undefined, _currentPet: undefined, _finalStep: undefined })
        }
        return
      }
    }

    // === 일상/업무 도우미 (기존 로직) ===
    const steps = getOnboardingSteps(type)
    const currentStep = steps[step]

    // workHours는 객체 반환 → 키 분리 처리
    const parsed = currentStep.parser(text)

    if (parsed === null) {
      setMessages(prev => [...prev, { role: 'assistant', content: `${t('helperParseRetry')}\n\n${t(currentStep.askKey)}` }])
      setLoading(false)
      return
    }

    // workHours 파싱 결과는 { workStart, workEnd } 객체 → 펼쳐서 저장
    let newAnswers
    if (currentStep.key === 'workHours' && typeof parsed === 'object' && parsed.workStart) {
      newAnswers = { ...answers, workStart: parsed.workStart, workEnd: parsed.workEnd }
    } else {
      newAnswers = { ...answers, [currentStep.key]: parsed }
    }

    let nextStep = step + 1
    while (nextStep < steps.length && steps[nextStep].skipIf?.(newAnswers)) {
      nextStep++
    }

    if (nextStep < steps.length) {
      setHelperState({ ...helperState, step: nextStep, answers: newAnswers })
      setMessages(prev => [...prev, { role: 'assistant', content: `${t(steps[nextStep].askKey)}\n${t('helperCancelHint')}` }])
      setLoading(false)
    } else if (type === 'childcare') {
      // 육아 도우미 온보딩 완료: 프로필 저장 + 일수 선택
      setHelperState(null)
      try {
        await saveHelperProfile(userId, 'H06', newAnswers)
      } catch { /* 데모 모드 */ }
      setPendingProfile({ _type: 'childcare', ...newAnswers })
      setMessages(prev => [...prev, { role: 'assistant', content: t('helperAskDays'), action: 'select_days' }])
      setLoading(false)
    } else if (type === 'work') {
      // 업무 도우미 온보딩 완료: 프로필 저장 + 태스크 입력 요청
      setHelperState(null)
      try {
        await saveHelperProfile(userId, 'H04', newAnswers)
      } catch { /* 데모 모드 */ }
      setPendingProfile({ _type: 'work', ...newAnswers })
      setMessages(prev => [...prev, { role: 'assistant', content: t('helperWorkAskTasks'), action: 'work_ask_tasks' }])
      setLoading(false)
    } else {
      // 일상 도우미 온보딩 완료: 프로필 저장 + 일수 선택
      setHelperState(null)
      try {
        await saveHelperProfile(userId, 'H01', newAnswers)
      } catch { /* 데모 모드 */ }
      setPendingProfile(newAnswers)
      setMessages(prev => [...prev, { role: 'assistant', content: t('helperAskDays'), action: 'select_days' }])
      setLoading(false)
    }
  }

  // === 펫 케어 온보딩 완료 처리 ===
  const finishPetOnboarding = async (answers) => {
    setHelperState(null)
    // 내부 상태 키 제거 후 저장
    const { _phase, _petStep, _currentPet, _finalStep, ...profileData } = answers
    try {
      await saveHelperProfile(userId, 'H11', profileData)
    } catch { /* 데모 모드 */ }
    setPendingProfile({ _type: 'petcare', ...profileData })
    setMessages(prev => [...prev, { role: 'assistant', content: t('helperAskDays'), action: 'select_days' }])
    setLoading(false)
  }

  // === Helper: GPT 스케줄 생성 + 배치 카드 표시 (멀티데이) ===
  const generateAndShowBatch = async (preferences, days = 1) => {
    try {
      const result = await generateDailySchedule(preferences)
      const batchDays = []
      const today = new Date()
      for (let i = 0; i < days; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() + i)
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        batchDays.push({ date: dateStr, events: result.events.map((e) => ({ ...e })) })
      }
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: t('helperScheduleGenerated'),
          action: 'create_batch',
          batchDays,
          confirmed: false,
          cancelled: false,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('helperGenerateError') },
      ])
    } finally {
      setLoading(false)
    }
  }

  // === Pet Care: GPT 스케줄 생성 + 카드 표시 (멀티데이) ===
  const generateAndShowPetCareBatch = async (petInfo, days = 1) => {
    try {
      const result = await generatePetCareSchedule(petInfo)
      const today = new Date()
      const petCareDays = []
      for (let i = 0; i < days; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() + i)
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        petCareDays.push({ date: dateStr, events: result.events.map((e) => ({ ...e })) })
      }
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: t('petCareScheduleGenerated'),
          action: 'petcare_batch',
          petCareEvents: petCareDays[0].events,
          petCareDate: petCareDays[0].date,
          petCareDays,
          petInfo,
          confirmed: false,
          cancelled: false,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('helperGenerateError') },
      ])
    } finally {
      setLoading(false)
    }
  }

  // === Work: GPT 업무 스케줄 생성 + 카드 표시 (멀티데이) ===
  const generateAndShowWorkBatch = async (profile, tasks, days = 1) => {
    try {
      const result = await generateWorkSchedule(profile, tasks)
      const today = new Date()
      const workDays = []
      let dayCount = 0
      let offset = 0
      while (dayCount < days) {
        const d = new Date(today)
        d.setDate(d.getDate() + offset)
        offset++
        const dayOfWeek = d.getDay() // 0=Sun, 6=Sat
        if (!profile.worksWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) continue
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        workDays.push({ date: dateStr, events: result.events.map((e) => ({ ...e })) })
        dayCount++
      }
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: t('helperWorkScheduleGenerated'),
          action: 'work_batch',
          workEvents: result.events,
          workDate: workDays[0]?.date,
          workDays,
          confirmed: false,
          cancelled: false,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('helperWorkError') },
      ])
    } finally {
      setLoading(false)
    }
  }

  // === Childcare: GPT 육아 스케줄 생성 + 카드 표시 (멀티데이) ===
  const generateAndShowChildcareBatch = async (childInfo, days = 1) => {
    try {
      const ageMonths = calculateAgeMonths(childInfo.childBirthdate)
      const ageGroupKey = getChildAgeGroup(ageMonths)
      const ageGroup = AGE_GROUPS[ageGroupKey]
      const enrichedInfo = {
        ...childInfo,
        ageMonths,
        ageGroupLabel: ageGroup?.label || '유아기',
        feedingNote: ageGroup?.feedingNote || '유아식 3끼',
        napNote: ageGroup?.napNote || '낮잠 0~1회',
      }
      const result = await generateChildcareSchedule(enrichedInfo)
      const today = new Date()
      const childcareDays = []
      for (let i = 0; i < days; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() + i)
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        childcareDays.push({ date: dateStr, events: result.events.map((e) => ({ ...e })) })
      }
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: t('childcareScheduleGenerated'),
          action: 'childcare_batch',
          childcareEvents: childcareDays[0].events,
          childcareDate: childcareDays[0].date,
          childcareDays,
          childInfo: enrichedInfo,
          confirmed: false,
          cancelled: false,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('childcareError') },
      ])
    } finally {
      setLoading(false)
    }
  }

  // === Childcare: 배치 전체 등록 (멀티데이) ===
  const handleChildcareConfirm = async (msgIndex) => {
    const msg = messages[msgIndex]
    if (!msg.childcareEvents || msg.confirmed) return
    if (confirmingRef.current) return
    confirmingRef.current = true

    try {
      if (msg.childcareDays && msg.childcareDays.length > 1) {
        for (const day of msg.childcareDays) {
          await addBatchEvents(userId, day.events, day.date, 'H06')
        }
      } else {
        await addBatchEvents(userId, msg.childcareEvents, msg.childcareDate, 'H06')
      }
      setMessages((prev) =>
        prev.map((m, i) =>
          i === msgIndex ? { ...m, confirmed: true } : m
        )
      )
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('childcareBatchSaved') },
      ])
      onEventCreated?.()
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('chatProcessError') },
      ])
    } finally {
      confirmingRef.current = false
    }
  }

  // === Childcare: 개별 항목 제거 ===
  const handleChildcareRemoveItem = (msgIndex, eventIdx) => {
    setMessages((prev) =>
      prev.map((m, i) => {
        if (i !== msgIndex || !m.childcareEvents) return m
        const newEvents = m.childcareEvents.filter((_, ei) => ei !== eventIdx)
        const newDays = m.childcareDays
          ? m.childcareDays.map((day) => ({
              ...day,
              events: day.events.filter((_, ei) => ei !== eventIdx),
            })).filter((day) => day.events.length > 0)
          : undefined
        return { ...m, childcareEvents: newEvents, childcareDays: newDays }
      })
    )
  }

  // === Work: 배치 전체 등록 (멀티데이) ===
  const handleWorkConfirm = async (msgIndex) => {
    const msg = messages[msgIndex]
    if (msg.confirmed) return
    if (confirmingRef.current) return
    confirmingRef.current = true

    try {
      if (msg.workDays && msg.workDays.length > 1) {
        for (const day of msg.workDays) {
          if (day.events.length > 0) {
            await addBatchEvents(userId, day.events, day.date, 'H04')
          }
        }
      } else if (msg.workEvents) {
        await addBatchEvents(userId, msg.workEvents, msg.workDate, 'H04')
      }
      setMessages((prev) =>
        prev.map((m, i) =>
          i === msgIndex ? { ...m, confirmed: true } : m
        )
      )
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('helperWorkBatchSaved') },
      ])
      onEventCreated?.()
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('chatProcessError') },
      ])
    } finally {
      confirmingRef.current = false
    }
  }

  // === Work: 개별 항목 제거 (멀티데이) ===
  const handleWorkRemoveItem = (msgIndex, eventIdx) => {
    setMessages((prev) =>
      prev.map((m, i) => {
        if (i !== msgIndex || !m.workEvents) return m
        const newEvents = m.workEvents.filter((_, ei) => ei !== eventIdx)
        const newDays = m.workDays
          ? m.workDays.map((day) => ({
              ...day,
              events: day.events.filter((_, ei) => ei !== eventIdx),
            })).filter((day) => day.events.length > 0)
          : undefined
        return { ...m, workEvents: newEvents, workDays: newDays }
      })
    )
  }

  // === Pet Care: 배치 전체 등록 (멀티데이) ===
  const handlePetCareConfirm = async (msgIndex) => {
    const msg = messages[msgIndex]
    if (!msg.petCareEvents || msg.confirmed) return
    if (confirmingRef.current) return
    confirmingRef.current = true

    try {
      if (msg.petCareDays && msg.petCareDays.length > 1) {
        for (const day of msg.petCareDays) {
          await addBatchEvents(userId, day.events, day.date)
        }
      } else {
        await addBatchEvents(userId, msg.petCareEvents, msg.petCareDate)
      }
      setMessages((prev) =>
        prev.map((m, i) =>
          i === msgIndex ? { ...m, confirmed: true } : m
        )
      )
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('petCareBatchSaved') },
      ])
      onEventCreated?.()
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('chatProcessError') },
      ])
    } finally {
      confirmingRef.current = false
    }
  }

  // === Pet Care: 개별 항목 제거 ===
  const handlePetCareRemoveItem = (msgIndex, eventIdx) => {
    setMessages((prev) =>
      prev.map((m, i) => {
        if (i !== msgIndex || !m.petCareEvents) return m
        const newEvents = m.petCareEvents.filter((_, ei) => ei !== eventIdx)
        const newDays = m.petCareDays
          ? m.petCareDays.map((day) => ({
              ...day,
              events: day.events.filter((_, ei) => ei !== eventIdx),
            })).filter((day) => day.events.length > 0)
          : undefined
        return { ...m, petCareEvents: newEvents, petCareDays: newDays }
      })
    )
  }

  // === Helper: 배치 전체 등록 (멀티데이) ===
  const handleBatchConfirm = async (msgIndex) => {
    const msg = messages[msgIndex]
    if (!msg.batchDays || msg.confirmed) return
    if (confirmingRef.current) return
    confirmingRef.current = true

    try {
      for (const day of msg.batchDays) {
        if (day.events.length > 0) {
          await addBatchEvents(userId, day.events, day.date)
        }
      }
      setMessages((prev) =>
        prev.map((m, i) =>
          i === msgIndex ? { ...m, confirmed: true } : m
        )
      )
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('helperBatchSaved') },
      ])
      onEventCreated?.()
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('chatProcessError') },
      ])
    } finally {
      confirmingRef.current = false
    }
  }

  // === Helper: 배치 개별 항목 제거 (템플릿 기반 — 모든 날짜에서 동일 인덱스 제거) ===
  const handleBatchRemoveItem = (msgIndex, dayIdx, eventIdx) => {
    setMessages((prev) =>
      prev.map((m, i) => {
        if (i !== msgIndex || !m.batchDays) return m
        const newDays = m.batchDays.map((day) => ({
          ...day,
          events: day.events.filter((_, ei) => ei !== eventIdx),
        })).filter((day) => day.events.length > 0)
        return { ...m, batchDays: newDays }
      })
    )
  }

  // === 기존: handleSend (도우미 인터셉트 추가) ===
  const handleSend = async () => {
    if (!input.trim() || loading) return

    const currentInput = input
    const userMsg = { role: 'user', content: currentInput }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      // 1. 온보딩 진행 중이면 인터셉트
      if (helperState !== null) {
        await processHelperAnswer(currentInput)
        return
      }

      // 1.5. 일수 선택 또는 업무 태스크 대기 중이면 인터셉트
      if (pendingProfile) {
        // 업무 도우미: 태스크 입력 대기 (아직 _tasks가 없을 때)
        if (pendingProfile._type === 'work' && !pendingProfile._tasks) {
          const tasks = parseWorkTasks(currentInput)
          if (tasks) {
            // 태스크 저장 후 일수 선택 표시
            setPendingProfile({ ...pendingProfile, _tasks: tasks })
            setMessages((prev) => [
              ...prev.map((m) =>
                m.action === 'work_ask_tasks' ? { ...m, answered: true } : m
              ),
              { role: 'assistant', content: t('helperAskDays'), action: 'select_days' },
            ])
            setLoading(false)
          } else {
            setMessages((prev) => [
              ...prev,
              { role: 'assistant', content: t('helperWorkAskTasksRetry') },
            ])
            setLoading(false)
          }
          return
        }

        // 일수 선택 대기 (일상/펫/업무 공통)
        const days = parseDaysInput(currentInput)
        if (days) {
          await handleSelectDays(days)
        } else {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: t('helperAskDaysRetry') },
          ])
          setLoading(false)
        }
        return
      }

      // 2. 전체 삭제 감지 (테스트용)
      if (/(?:전부|전체|모두|모든|다)\s*삭제|(?:일정|스케줄).*(?:전부|전체|모두|다)\s*(?:삭제|지워|없애)/.test(currentInput)) {
        const recentEvents = await fetchRecentEvents()
        const allEvents = await (async () => {
          try {
            const now = new Date()
            const start = new Date(2020, 0, 1)
            const end = new Date(now.getFullYear() + 1, 11, 31)
            return await getEvents(userId, start, end)
          } catch { return recentEvents }
        })()
        if (allEvents.length === 0) {
          setMessages((prev) => [...prev, { role: 'assistant', content: t('chatNoEvents') }])
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: `${allEvents.length}${t('chatDeleteAllCount')}\n${t('chatConfirmDeleteAll')}`,
              action: 'delete_all',
              eventCount: allEvents.length,
              confirmed: false,
              cancelled: false,
            },
          ])
        }
        setLoading(false)
        return
      }

      // 2.5 프로필 수정 트리거 감지
      const profileEdit = isProfileEditTrigger(currentInput)
      if (profileEdit) {
        const type = profileEdit === 'any' ? 'daily' : profileEdit
        const editMsg = type === 'petcare' ? '펫 케어 프로필을 다시 설정합니다.' : type === 'work' ? '업무 프로필을 다시 설정합니다.' : type === 'childcare' ? '육아 프로필을 다시 설정합니다.' : '일상 프로필을 다시 설정합니다.'
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: editMsg },
        ])
        await handleStartHelper(type)
        return
      }

      // 3. 도우미 트리거 감지
      if (isPetCareHelperTrigger(currentInput)) {
        await handleStartHelper('petcare')
        return
      }
      if (isChildcareHelperTrigger(currentInput)) {
        await handleStartHelper('childcare')
        return
      }
      if (isWorkHelperTrigger(currentInput)) {
        await handleStartHelper('work')
        return
      }
      if (isDailyHelperTrigger(currentInput)) {
        await handleStartHelper('daily')
        return
      }

      // 3. 기존 parseSchedule 로직 (변경 없음)
      const recentEvents = await fetchRecentEvents()
      const parsed = await parseSchedule(currentInput, recentEvents, lastEventContext)

      if (!parsed) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: t('chatParseFail') },
        ])
        return
      }

      const { action, targetEventId } = parsed

      if (action === 'add_major_event') {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: t('chatConfirmMajorEvent'),
            parsed,
            action: 'add_major_event',
          },
        ])
        return
      }

      if (action === 'create') {
        const aiMsg = {
          role: 'assistant',
          content: t('chatConfirmSchedule'),
          parsed,
          action: 'create',
        }
        setMessages((prev) => [...prev, aiMsg])
        return
      }

      // move / update / delete — targetEvent 필요
      let targetEvent = null
      if (targetEventId) {
        targetEvent = recentEvents.find((e) => e.id === targetEventId)
      }

      if (!targetEvent) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: t('chatWhichEvent') },
        ])
        return
      }

      const st = targetEvent.startTime?.toDate ? targetEvent.startTime.toDate() : new Date(targetEvent.startTime)
      const targetInfo = {
        id: targetEvent.id,
        title: targetEvent.title,
        date: `${st.getFullYear()}-${String(st.getMonth() + 1).padStart(2, '0')}-${String(st.getDate()).padStart(2, '0')}`,
        time: `${String(st.getHours()).padStart(2, '0')}:${String(st.getMinutes()).padStart(2, '0')}`,
      }

      if (action === 'move') {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: t('chatConfirmMove'),
            action: 'move',
            parsed,
            targetEvent,
            targetInfo,
          },
        ])
      } else if (action === 'delete') {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: t('chatConfirmDelete'),
            action: 'delete',
            parsed,
            targetEvent,
            targetInfo,
          },
        ])
      } else if (action === 'update') {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: t('chatConfirmUpdate'),
            action: 'update',
            parsed,
            targetEvent,
            targetInfo,
          },
        ])
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('chatError') },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAllConfirm = async (msgIndex) => {
    const msg = messages[msgIndex]
    if (msg.confirmed) return

    try {
      const count = await deleteAllEvents(userId)
      setMessages((prev) =>
        prev.map((m, i) => i === msgIndex ? { ...m, confirmed: true } : m)
      )
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('chatDeletedAll') },
      ])
      setLastEventContext(null)
      onEventCreated?.()
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('chatProcessError') },
      ])
    }
  }

  const handleConfirm = async (msgIndex) => {
    const msg = messages[msgIndex]
    if (!msg.parsed) return

    const markConfirmed = () => {
      setMessages((prev) =>
        prev.map((m, i) =>
          i === msgIndex ? { ...m, confirmed: true } : m
        )
      )
    }

    try {
      const action = msg.action || 'create'

      if (action === 'create') {
        await createEvent(userId, msg.parsed)
        markConfirmed()
        setLastEventContext({
          id: null,
          title: msg.parsed.title,
          date: msg.parsed.date,
          time: msg.parsed.time,
        })
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: t('chatSaved') },
        ])
      } else if (action === 'move') {
        const newHour = msg.parsed.time
          ? parseInt(msg.parsed.time.split(':')[0]) + parseInt(msg.parsed.time.split(':')[1]) / 60
          : null
        await moveEvent(msg.targetEvent.id, msg.targetEvent, msg.parsed.date, newHour)
        markConfirmed()
        setLastEventContext({
          id: msg.targetEvent.id,
          title: msg.targetEvent.title,
          date: msg.parsed.date,
          time: msg.parsed.time || msg.targetInfo.time,
        })
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: t('chatMoved') },
        ])
      } else if (action === 'delete') {
        await deleteEvent(msg.targetEvent.id)
        markConfirmed()
        setLastEventContext(null)
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: t('chatDeleted') },
        ])
      } else if (action === 'update') {
        const updates = msg.parsed.updates || {}
        await updateEvent(msg.targetEvent.id, updates)
        markConfirmed()
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: t('chatUpdated') },
        ])
      } else if (action === 'add_major_event') {
        const p = msg.parsed
        const profile = await getHelperProfile(userId, 'H12') || { birthdays: [], anniversaries: [], events: [] }
        const newItem = { id: Date.now().toString(), name: p.name, memo: p.memo || '' }

        if (p.majorEventType === 'birthday') {
          newItem.date = p.date // MM-DD
          newItem.calendarType = p.calendarType || 'solar'
          newItem.relation = p.relation || 'family'
          profile.birthdays = [...(profile.birthdays || []), newItem]
        } else if (p.majorEventType === 'anniversary') {
          newItem.startDate = p.date // YYYY-MM-DD
          profile.anniversaries = [...(profile.anniversaries || []), newItem]
        } else {
          newItem.startDate = p.date // YYYY-MM-DD
          profile.events = [...(profile.events || []), newItem]
        }

        await saveHelperProfile(userId, 'H12', profile)
        markConfirmed()
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: t('chatMajorEventSaved') },
        ])
      }

      onEventCreated?.()
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('chatProcessError') },
      ])
    }
  }

  const handleCancel = (msgIndex) => {
    setMessages((prev) =>
      prev.map((m, i) =>
        i === msgIndex ? { ...m, cancelled: true } : m
      )
    )
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: t('chatCancelled') },
    ])
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFAFA] dark:bg-gray-900">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2.5 text-sm ${msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-[14px_2px_14px_14px]'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-[2px_14px_14px_14px]'
                }`}
            >
              <span className="whitespace-pre-line">{msg.content}</span>

              {/* 파싱된 일정 카드 — create */}
              {msg.parsed && !msg.confirmed && !msg.cancelled && (!msg.action || msg.action === 'create') && (
                <div className="mt-2 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-xl p-3 space-y-1.5">
                  <p className="font-semibold text-gray-900 dark:text-white">{msg.parsed.title}</p>
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-xs">
                    <Calendar size={12} />
                    <span>{msg.parsed.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-xs">
                    <Clock size={12} />
                    <span>{msg.parsed.time} ({msg.parsed.duration}{t('minuteUnit')})</span>
                  </div>
                  {msg.parsed.location && (
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-xs">
                      <MapPin size={12} />
                      <span>{msg.parsed.location}</span>
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleConfirm(i)}
                      className="flex items-center justify-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-blue-700 min-w-[64px]"
                    >
                      <Check size={12} /> {t('save')}
                    </button>
                    <button
                      onClick={() => handleCancel(i)}
                      className="flex items-center justify-center gap-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-500 min-w-[64px]"
                    >
                      <X size={12} /> {t('cancel')}
                    </button>
                  </div>
                </div>
              )}

              {/* 전체 삭제 카드 — delete_all */}
              {msg.action === 'delete_all' && !msg.confirmed && !msg.cancelled && (
                <div className="mt-2 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-600 rounded-xl p-3 space-y-1.5">
                  <p className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                    <Trash2 size={14} /> {t('deleteAll')}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleDeleteAllConfirm(i)}
                      className="flex items-center justify-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-red-600 min-w-[64px]"
                    >
                      <Trash2 size={12} /> {t('delete')}
                    </button>
                    <button
                      onClick={() => handleCancel(i)}
                      className="flex items-center justify-center gap-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-500 min-w-[64px]"
                    >
                      <X size={12} /> {t('cancel')}
                    </button>
                  </div>
                </div>
              )}

              {/* 일수 선택 버튼 — select_days */}
              {msg.action === 'select_days' && !msg.answered && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {(pendingProfile?._type === 'work'
                    ? [{ days: 1, label: `1${t('helperDayUnit')}` }, { days: 7, label: '1주' }, { days: 14, label: '2주' }, { days: 21, label: '3주' }, { days: 30, label: t('helperMonthUnit') }]
                    : [1, 7, 30, 60].map((d) => ({ days: d, label: `${d}${t('helperDayUnit')}` }))
                  ).map(({ days: d, label }) => (
                    <button
                      key={d}
                      onClick={() => handleSelectDays(d)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {/* 배치 카드 — create_batch (멀티데이) */}
              {msg.action === 'create_batch' && (
                <BatchConfirmCard
                  batchDays={msg.batchDays || []}
                  onConfirmAll={() => handleBatchConfirm(i)}
                  onRemoveItem={(dayIdx, eventIdx) => handleBatchRemoveItem(i, dayIdx, eventIdx)}
                  onCancel={() => handleCancel(i)}
                  confirmed={msg.confirmed}
                  cancelled={msg.cancelled}
                />
              )}

              {/* 펫 케어 카드 — petcare_batch */}
              {msg.action === 'petcare_batch' && (
                <PetCareCard
                  petInfo={msg.petInfo}
                  events={msg.petCareEvents || []}
                  days={msg.petCareDays || []}
                  onConfirmAll={() => handlePetCareConfirm(i)}
                  onRemoveItem={(eventIdx) => handlePetCareRemoveItem(i, eventIdx)}
                  onCancel={() => handleCancel(i)}
                  confirmed={msg.confirmed}
                  cancelled={msg.cancelled}
                />
              )}

              {/* 업무 스케줄 카드 — work_batch */}
              {msg.action === 'work_batch' && (
                <WorkScheduleCard
                  events={msg.workEvents || []}
                  days={msg.workDays || []}
                  onConfirmAll={() => handleWorkConfirm(i)}
                  onRemoveItem={(eventIdx) => handleWorkRemoveItem(i, eventIdx)}
                  onCancel={() => handleCancel(i)}
                  confirmed={msg.confirmed}
                  cancelled={msg.cancelled}
                />
              )}

              {/* 육아 스케줄 카드 — childcare_batch */}
              {msg.action === 'childcare_batch' && (
                <ChildcareCard
                  childInfo={msg.childInfo}
                  events={msg.childcareEvents || []}
                  days={msg.childcareDays || []}
                  onConfirmAll={() => handleChildcareConfirm(i)}
                  onRemoveItem={(eventIdx) => handleChildcareRemoveItem(i, eventIdx)}
                  onCancel={() => handleCancel(i)}
                  confirmed={msg.confirmed}
                  cancelled={msg.cancelled}
                />
              )}

              {/* 일정 이동 카드 — move */}
              {msg.action === 'move' && !msg.confirmed && !msg.cancelled && (
                <div className="mt-2 bg-white dark:bg-gray-800 border border-orange-300 dark:border-orange-600 rounded-xl p-3 space-y-1.5">
                  <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                    <ArrowRight size={14} className="text-orange-500" /> {t('moveSchedule')}
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">"{msg.targetInfo.title}"</p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                    <span>{msg.targetInfo.date} {msg.targetInfo.time}</span>
                    <ArrowRight size={10} />
                    <span className="text-orange-600 dark:text-orange-400 font-medium">
                      {msg.parsed.date}{msg.parsed.time ? ` ${msg.parsed.time}` : ` ${t('keepTime')}`}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleConfirm(i)}
                      className="flex items-center justify-center gap-1 bg-orange-500 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-orange-600 min-w-[64px]"
                    >
                      <Check size={12} /> {t('confirm')}
                    </button>
                    <button
                      onClick={() => handleCancel(i)}
                      className="flex items-center justify-center gap-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-500 min-w-[64px]"
                    >
                      <X size={12} /> {t('cancel')}
                    </button>
                  </div>
                </div>
              )}

              {/* 일정 삭제 카드 — delete */}
              {msg.action === 'delete' && !msg.confirmed && !msg.cancelled && (
                <div className="mt-2 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-600 rounded-xl p-3 space-y-1.5">
                  <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                    <Trash2 size={14} className="text-red-500" /> {t('deleteSchedule')}
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">"{msg.targetInfo.title}"</p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                    <Calendar size={12} />
                    <span>{msg.targetInfo.date} {msg.targetInfo.time}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleConfirm(i)}
                      className="flex items-center justify-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-red-600 min-w-[64px]"
                    >
                      <Trash2 size={12} /> {t('delete')}
                    </button>
                    <button
                      onClick={() => handleCancel(i)}
                      className="flex items-center justify-center gap-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-500 min-w-[64px]"
                    >
                      <X size={12} /> {t('cancel')}
                    </button>
                  </div>
                </div>
              )}

              {/* 일정 수정 카드 — update */}
              {msg.action === 'update' && !msg.confirmed && !msg.cancelled && (
                <div className="mt-2 bg-white dark:bg-gray-800 border border-purple-300 dark:border-purple-600 rounded-xl p-3 space-y-1.5">
                  <p className="font-semibold text-gray-900 dark:text-white">{t('updateSchedule')}</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">"{msg.targetInfo.title}"</p>
                  {msg.parsed.updates && Object.entries(msg.parsed.updates).map(([key, val]) => (
                    <div key={key} className="text-xs text-gray-600 dark:text-gray-400">
                      {key}: <span className="text-purple-600 dark:text-purple-400 font-medium">{val}</span>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleConfirm(i)}
                      className="flex items-center justify-center gap-1 bg-purple-500 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-purple-600 min-w-[64px]"
                    >
                      <Check size={12} /> {t('edit')}
                    </button>
                    <button
                      onClick={() => handleCancel(i)}
                      className="flex items-center justify-center gap-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-500 min-w-[64px]"
                    >
                      <X size={12} /> {t('cancel')}
                    </button>
                  </div>
                </div>
              )}

              {/* 주요 행사 등록 카드 — add_major_event */}
              {msg.action === 'add_major_event' && !msg.confirmed && !msg.cancelled && msg.parsed && (() => {
                const p = msg.parsed
                const type = p.majorEventType
                const borderColor = type === 'birthday' ? 'border-pink-300 dark:border-pink-600' : type === 'anniversary' ? 'border-purple-300 dark:border-purple-600' : 'border-orange-300 dark:border-orange-600'
                const IconComp = type === 'birthday' ? Cake : type === 'anniversary' ? Heart : PartyPopper
                const iconColor = type === 'birthday' ? 'text-pink-500' : type === 'anniversary' ? 'text-purple-500' : 'text-orange-500'
                const btnColor = type === 'birthday' ? 'bg-pink-500 hover:bg-pink-600' : type === 'anniversary' ? 'bg-purple-500 hover:bg-purple-600' : 'bg-orange-500 hover:bg-orange-600'
                const typeLabel = type === 'birthday' ? t('majorTab_birthday') : type === 'anniversary' ? t('majorTab_anniversary') : t('majorTab_event')
                return (
                  <div className={`mt-2 bg-white dark:bg-gray-800 border ${borderColor} rounded-xl p-3 space-y-1.5`}>
                    <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <IconComp size={14} className={iconColor} />
                      {typeLabel} {t('majorAddBtn')}
                    </p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{p.name}</p>
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-xs">
                      <Calendar size={12} />
                      <span>{p.date}</span>
                      {type === 'birthday' && p.calendarType === 'lunar' && (
                        <span className="text-pink-500 dark:text-pink-400">(음력)</span>
                      )}
                    </div>
                    {type === 'birthday' && p.relation && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t('chatMajorRelation')}: {p.relation === 'family' ? t('chatRelFamily') : p.relation === 'friend' ? t('chatRelFriend') : p.relation === 'colleague' ? t('chatRelColleague') : t('chatRelLover')}
                      </div>
                    )}
                    {p.memo && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">{p.memo}</div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleConfirm(i)}
                        className={`flex items-center justify-center gap-1 ${btnColor} text-white px-3 py-1.5 rounded-md text-xs font-medium min-w-[64px]`}
                      >
                        <Check size={12} /> {t('majorAddBtn')}
                      </button>
                      <button
                        onClick={() => handleCancel(i)}
                        className="flex items-center justify-center gap-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-500 min-w-[64px]"
                      >
                        <X size={12} /> {t('cancel')}
                      </button>
                    </div>
                  </div>
                )
              })()}

              {msg.confirmed && msg.action !== 'create_batch' && msg.action !== 'petcare_batch' && msg.action !== 'work_batch' && msg.action !== 'childcare_batch' && (
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">{t('savedComplete')}</p>
              )}
              {msg.cancelled && msg.action !== 'create_batch' && msg.action !== 'petcare_batch' && msg.action !== 'work_batch' && msg.action !== 'childcare_batch' && (
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{t('cancelled')}</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2.5 rounded-[2px_14px_14px_14px] text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              {helperState !== null ? t('helperGenerating') : t('analyzing')}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <HelperSelector onSelectHelper={handleStartHelper} disabled={loading} />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chatInputPlaceholder')}
            disabled={loading}
            className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
