export class Helpers {
  // Sorteia um elemento simples de um array
  arrayElement<T>(array: T[]): T {
    if (!array || array.length === 0) return '' as any
    return array[Math.floor(Math.random() * array.length)]
  }

  // Sorteia com base num peso (weight) - essencial para o teu fullNamePattern
  weightedArrayElement<T extends { value: any; weight: number }>(array: T[]): T['value'] {
    if (!array || array.length === 0) return ''

    const totalWeight = array.reduce((sum, item) => sum + item.weight, 0)
    let random = Math.random() * totalWeight

    for (const item of array) {
      if (random < item.weight) return item.value
      random -= item.weight
    }
    return array[array.length - 1].value // Fallback
  }

  // Substitui {{person.firstName}} pelas funções respetivas
  mustache(str: string, data: Record<string, () => string>): string {
    return str.replace(/\{\{(.+?)\}\}/g, (match, key) => {
      return data[key] ? data[key]() : match
    })
  }
}
