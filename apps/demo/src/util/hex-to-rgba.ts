const hexToRgba = (hex = '#E8E8E8', alpha = 0.4) => {
  const [r, g, b] = hex.match(/\w\w/g)?.map((x) => parseInt(x, 16)) ?? [0, 0, 0]
  return `rgba(${r},${g},${b},${alpha})`
}

export default hexToRgba
