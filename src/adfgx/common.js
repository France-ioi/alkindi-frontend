
const qualifierClasses = {
   'hint': 'qualifier-hint',
   'confirmed': 'qualifier-confirmed',
   'locked': 'qualifier-confirmed',
   'guess': 'qualifier-confirmed',
   'unknown': 'qualifier-unconfirmed'
};

export const getQualifierClass = function(qualifier) {
  return qualifierClasses[qualifier];
};
