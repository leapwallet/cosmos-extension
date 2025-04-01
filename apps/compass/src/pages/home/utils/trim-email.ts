export const trimEmail = (email: string, startChars: number = 3, endChars: number = 2): string => {
  if (!email || !email.includes('@')) {
    return email
  }

  const [localPart, domain] = email.split('@')

  let trimmedLocalPart = localPart
  if (localPart.length > startChars + endChars) {
    const localStart = localPart.substring(0, startChars)
    const localEnd = localPart.substring(localPart.length - endChars)
    trimmedLocalPart = `${localStart}...${localEnd}`
  }

  return `${trimmedLocalPart}@${domain}`.toLowerCase()
}
