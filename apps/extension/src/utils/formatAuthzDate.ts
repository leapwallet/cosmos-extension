export function formatAuthzDate(date: string | number): 'Expired' | string {
  const dateNtime = new Date(date)
  const todayDate = new Date()

  if (todayDate > dateNtime) {
    return 'Expired'
  }

  return `${dateNtime.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })} ${
    dateNtime.getHours() === 0 ? 24 : (dateNtime.getHours() < 10 ? '0' : '') + dateNtime.getHours()
  }:${(dateNtime.getMinutes() < 10 ? '0' : '') + dateNtime.getMinutes()}`
}
