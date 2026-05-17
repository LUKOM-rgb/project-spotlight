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

  middleName(sex: SexType): string {
    return this.getEntry(this.faker.definitions.person?.middle_name, sex)
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
      'person.middleName': () => this.middleName(sex),
      'person.lastName': () => lastName,
      'person.suffix': () => this.suffix(),
    })

    return fullName
  }

  gender(): string {
    return this.faker.helpers.arrayElement(this.faker.definitions.person?.gender ?? [])
  }
}
