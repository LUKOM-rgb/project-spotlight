// //import type { Faker } from '@faker-js/faker';
// //import type { PersonEntryDefinition } from './person';
// import { ModuleBase } from '../../internal/module-base';

// fullName(
//   options: {
//     /**
//      * The optional first name to use. If not specified a random one will be chosen.
//      *
//      * @default faker.person.firstName(sex)
//      */
//     firstName?: string;
//     /**
//      * The optional last name to use. If not specified a random one will be chosen.
//      *
//      * @default faker.person.lastName(sex)
//      */
//     lastName?: string;
//     /**
//      * The optional sex to use. Can be either `'female'` or `'male'`.
//      *
//      * @default faker.helpers.arrayElement(['female', 'male'])
//      */
//     sex?: SexType;
//   } = {}
// ): string {
//   const {
//     sex = this.faker.helpers.arrayElement([Sex.Female, Sex.Male]),
//     firstName = this.firstName(sex),
//     lastName = this.lastName(sex),
//   } = options;

//   const fullNamePattern: string = this.faker.helpers.weightedArrayElement(
//     this.faker.definitions.person.name
//   );

//   const fullName = this.faker.helpers.mustache(fullNamePattern, {
//     'person.prefix': () => this.prefix(sex),
//     'person.firstName': () => firstName,
//     'person.middleName': () => this.middleName(sex),
//     'person.lastName': () => lastName,
//     'person.suffix': () => this.suffix(),
//   });
//   return fullName;
// }

// /**
//  * Returns a random gender.
//  *
//  * @see faker.person.sex(): For generating a binary-gender value.
//  *
//  * @example
//  * faker.person.gender() // 'Trans*Man'
//  *
//  * @since 8.0.0
//  */
// gender(): string {
//   return this.faker.helpers.arrayElement(
//     this.faker.definitions.person.gender
//   );
// }
