export function sortStringArr(arr: string[]) {
  return arr.sort((strA, strB) => {
    const nameA = strA.toLowerCase().trim();
    const nameB = strB.toLowerCase().trim();

    if (nameA > nameB) return 1;
    if (nameA < nameB) return -1;
    return 0;
  });
}
