import dayjs from 'dayjs'

const timeLeft = (completion_time: string, suffix?: string, start_time?: string) => {
  const diff = dayjs(completion_time).diff(start_time ?? new Date())
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  const hours = Math.floor(diff / (60 * 60 * 1000))
  const mins = Math.floor((diff - hours * 60 * 60 * 1000) / (60 * 1000))
  const secs = Math.floor((diff - hours * 60 * 60 * 1000 - mins * 60 * 1000) / 1000)

  let text = ''
  for (const v of [
    [days, 'day'],
    [hours, 'hour'],
    [mins, 'minute'],
    [secs, 'second'],
  ]) {
    if (v[0] !== 0) {
      text = `${v[0]} ${v[0] === 1 ? v[1] : v[1] + 's'} ${suffix ?? 'left'}`
      break
    }
  }

  return text
}

export default timeLeft
