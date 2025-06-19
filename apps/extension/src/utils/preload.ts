export const preloadOnboardingRoutes = () => {
  return Promise.all([
    import('pages/onboarding'),
    import('pages/onboarding/create'),
    import('pages/onboarding/import'),
    import('pages/onboarding/success'),
  ])
}
