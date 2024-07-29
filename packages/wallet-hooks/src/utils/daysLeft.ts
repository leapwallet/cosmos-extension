export function daysLeft(dateString: string) {
  const date = new Date(dateString);

  const day = date.getUTCDate();
  const month = date.toLocaleString('default', { month: 'long' });

  let daySuffix;
  if (day % 10 == 1 && day != 11) {
    daySuffix = 'st';
  } else if (day % 10 == 2 && day != 12) {
    daySuffix = 'nd';
  } else if (day % 10 == 3 && day != 13) {
    daySuffix = 'rd';
  } else {
    daySuffix = 'th';
  }

  const formattedDate = `${day}${daySuffix} ${month}`;
  return formattedDate;
}
