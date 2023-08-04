const tailwindJs = {} as any
tailwindJs.hoverTailwincss = (object: []) => {
  const result = {}
  object.forEach((item: string) => {
    result[`hover:${item}`] = true
  })
  return result
}
tailwindJs.activeTailwincss = (object: []) => {
  const result = {}
  object.forEach((item: string) => {
    result[`active:${item}`] = true
  })
  return result
}
tailwindJs.focusTailwincss = (object: []) => {
  const result = {}
  object.forEach((item: string) => {
    result[`focus:${item}`] = true
  })
  return result
}

export default tailwindJs
