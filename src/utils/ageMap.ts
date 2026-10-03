export function ageMapper(age: number): number {
  if (age < 18) {
    return 1;
  }
  if (age > 18 && age <= 25) {
    return 2;
  }
  if (age > 25 && age <= 35) {
    return 3;
  }
  if (age > 35 && age <= 45) {
    return 4;
  }
  if (age > 45 && age <= 55) {
    return 5;
  }

  return 6;
}
