/**
 * categoryRegistry.js - 카테고리별 온보딩 스텝 레지스트리
 */

import { DAILY_ONBOARDING_STEPS } from './dailyDefaults'
import { PET_ONBOARDING_STEPS } from './petCareDefaults'
import { WORK_ONBOARDING_STEPS } from './workDefaults'
import { CHILDCARE_ONBOARDING_STEPS } from './childcareDefaults'

export function getOnboardingSteps(type) {
  if (type === 'petcare') return PET_ONBOARDING_STEPS
  if (type === 'work') return WORK_ONBOARDING_STEPS
  if (type === 'childcare') return CHILDCARE_ONBOARDING_STEPS
  return DAILY_ONBOARDING_STEPS
}
