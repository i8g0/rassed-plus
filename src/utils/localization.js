export function normalizeGender(gender) {
  return gender === 'female' ? 'female' : 'male';
}

export function byGender(gender, maleText, femaleText) {
  return normalizeGender(gender) === 'female' ? femaleText : maleText;
}

export function verbByGender(gender, maleVerb, femaleVerb) {
  return byGender(gender, maleVerb, femaleVerb);
}
