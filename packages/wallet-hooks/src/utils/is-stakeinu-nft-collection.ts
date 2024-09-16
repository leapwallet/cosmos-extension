export function isStakeInuNftCollection(collection: string): boolean {
  return [
    '0XE85DC0CCECA105755753FEF452C091DEF5324138',
    'SEI1MDQVJKMXYY87W5TWTX340R0ZLPTVWPCK55NP9CMZ2R2DSUN4AD6SWRNH4H',
  ].includes(collection.toUpperCase());
}
