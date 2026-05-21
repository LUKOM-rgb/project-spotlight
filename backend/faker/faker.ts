import type { LocaleDefinition } from './definitions.ts'
import type { PersonEntryDefinition } from './person.ts'
import { Helpers } from './helper'

export type SexType = 'female' | 'male'
export const Sex = { Female: 'female' as const, Male: 'male' as const }

export class MyFaker {
  helpers = new Helpers()
  constructor(public definitions: LocaleDefinition) {}
}

export class ModuleBase {
  constructor(protected faker: MyFaker) {}
}

export class Person extends ModuleBase {
  private getEntry(entry: PersonEntryDefinition<string> | null | undefined, sex: SexType): string {
    if (!entry) return ''
    // Tenta ir buscar ao sexo específico, senão tenta o genérico
    const list = entry[sex] ?? entry.generic ?? []
    return this.faker.helpers.arrayElement(list)
  }

  firstName(sex: SexType): string {
    return this.getEntry(this.faker.definitions.person?.first_name, sex)
  }

  lastName(sex: SexType): string {
    return this.getEntry(this.faker.definitions.person?.last_name, sex)
  }

  prefix(sex: SexType): string {
    return this.getEntry(this.faker.definitions.person?.prefix, sex)
  }

  suffix(): string {
    return this.faker.helpers.arrayElement(this.faker.definitions.person?.suffix ?? [])
  }

  fullName(
    options: {
      firstName?: string
      lastName?: string
      sex?: SexType
    } = {},
  ): string {
    const {
      sex = this.faker.helpers.arrayElement([Sex.Female, Sex.Male]),
      firstName = this.firstName(sex),
      lastName = this.lastName(sex),
    } = options

    const fullNamePattern: string = this.faker.helpers.weightedArrayElement(
      this.faker.definitions.person?.name ?? [
        { value: '{{person.firstName}} {{person.lastName}}', weight: 1 },
      ],
    )

    const fullName = this.faker.helpers.mustache(fullNamePattern, {
      'person.prefix': () => this.prefix(sex),
      'person.firstName': () => firstName,
      'person.lastName': () => lastName,
      'person.suffix': () => this.suffix(),
    })

    return fullName
  }

  gender(): string {
    return this.faker.helpers.arrayElement(this.faker.definitions.person?.gender ?? [])
  }

  private cleanName(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents/diacritics
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '.')
      .replace(/[^a-z0-9.]/g, '') // keep only lowercase alphanumeric and dots
  }

  email(
    options: {
      firstName?: string
      lastName?: string
      sex?: SexType
    } = {},
  ): string {
    const {
      sex = this.faker.helpers.arrayElement([Sex.Female, Sex.Male]),
      firstName = this.firstName(sex),
      lastName = this.lastName(sex),
    } = options

    const cleanFirst = this.cleanName(firstName)
    const cleanLast = this.cleanName(lastName)

    return `${cleanFirst}.${cleanLast}@example.pt`
  }

  username(
    options: {
      firstName?: string
      lastName?: string
      sex?: SexType
    } = {},
  ): string {
    const {
      sex = this.faker.helpers.arrayElement([Sex.Female, Sex.Male]),
      firstName = this.firstName(sex),
      lastName = this.lastName(sex),
    } = options

    const cleanFirst = this.cleanName(firstName)
    const cleanLast = this.cleanName(lastName)

    const nicknameStyles = [
      () => `${cleanFirst}.${cleanLast}`,
      () => `${cleanFirst}_${cleanLast}`,
      () => `${cleanFirst}${cleanLast}`,
      () => `${cleanFirst}${Math.floor(Math.random() * 90 + 10)}`, // e.g. maria92
      () => `${cleanFirst.charAt(0)}${cleanLast}`, // e.g. msilva
      () => `${cleanFirst}${cleanLast.charAt(0)}`, // e.g. marias
    ]

    return this.faker.helpers.arrayElement(nicknameStyles)()
  }

  password(length: number = 12): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*()_+~|}{[]:;?><,./-='
    const allChars = uppercase + lowercase + numbers + symbols

    // Guarantee at least one char of each type to ensure a strong password
    let password = ''
    password += this.faker.helpers.arrayElement(uppercase.split(''))
    password += this.faker.helpers.arrayElement(lowercase.split(''))
    password += this.faker.helpers.arrayElement(numbers.split(''))
    password += this.faker.helpers.arrayElement(symbols.split(''))

    for (let i = password.length; i < length; i++) {
      password += this.faker.helpers.arrayElement(allChars.split(''))
    }

    // Shuffle final password
    return password
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('')
  }

  numeroTelemovel(): string {
    const prefixes = ['91', '92', '93', '96']
    const prefix = this.faker.helpers.arrayElement(prefixes)
    let rest = ''
    for (let i = 0; i < 7; i++) {
      rest += Math.floor(Math.random() * 10)
    }
    return prefix + rest
  }

  account(
    options: {
      sex?: SexType
      id_conta?: number
      id_artista?: number | null
    } = {},
  ) {
    const sex = options.sex ?? this.faker.helpers.arrayElement([Sex.Female, Sex.Male])
    const firstName = this.firstName(sex)
    const lastName = this.lastName(sex)
    const fullName = this.fullName({ firstName, lastName, sex })
    const id_artista = options.id_artista ?? null

    const baseAccount: Record<string, any> = {
      id_conta: options.id_conta ?? null,
      fullName,
      firstName,
      lastName,
      sex,
      username: this.username({ firstName, lastName, sex }),
      email: this.email({ firstName, lastName, sex }),
      password: this.password(),
      numero_telemovel: this.numeroTelemovel(),
      id_artista,
    }

    if (id_artista !== null) {
      // 8-digit random license number
      let licenseNumber = ''
      for (let i = 0; i < 8; i++) {
        licenseNumber += Math.floor(Math.random() * 10)
      }

      // Validity date (1 to 5 years in future: YYYY-MM-DD)
      const today = new Date()
      const futureYear = today.getFullYear() + Math.floor(Math.random() * 5) + 1
      const futureMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')
      const futureDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')
      const licenseValidity = `${futureYear}-${futureMonth}-${futureDay}`

      baseAccount.licenseNumber = licenseNumber
      baseAccount.licenseValidity = licenseValidity
    }

    return baseAccount
  }
}
