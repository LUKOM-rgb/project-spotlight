import type { PersonDefinition } from './person'

/**
 * Wrapper type for all definition categories that will make all properties optional and allow extra properties.
 */
export type LocaleEntry<TCategoryDefinition extends Record<string, unknown>> = {
  [P in keyof TCategoryDefinition]?: TCategoryDefinition[P] | null
} & Record<string, unknown> // Unsupported & custom entries

/**
 * The definitions as used by the translations/locales.
 */
export type LocaleDefinition = {
  person?: PersonDefinition
} & Record<string, Record<string, unknown>>
