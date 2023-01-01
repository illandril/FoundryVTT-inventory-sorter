
// Cantrips
export const acidSplash = {
  id: 'Mm16rr1GdNu7OD1z',
  name: 'Acid Splash',
  type: 'spell',
  system: {
    activation: {
      type: 'action',
    },
    level: 0,
    preparation: {
      mode: 'prepared',
    },
  },
} as const;

export const chillTouch = {
  id: '9n6i2fbXdpPVKTQ9',
  name: 'Chill Touch',
  type: 'spell',
  system: {
    activation: {
      type: 'action',
    },
    level: 0,
    preparation: {
      mode: 'prepared',
    },
  },
} as const;

// 1st Level
export const animalFriendship = {
  id: 'CrBmPd5E7W1uEu0i',
  name: 'Animal Friendship',
  type: 'spell',
  system: {
    activation: {
      type: 'action',
    },
    level: 1,
    preparation: {
      mode: 'prepared',
    },
  },
} as const;

export const burningHands = {
  id: '8Dm06CpNDex35zZy',
  name: 'Burning Hands',
  type: 'spell',
  system: {
    activation: {
      type: 'action',
    },
    level: 1,
    preparation: {
      mode: 'prepared',
    },
  },
} as const;

export const hellishRebukePact = {
  id: 'NxH5DoQKZGxFJC5V',
  name: 'Hellish Rebuke',
  type: 'spell',
  system: {
    activation: {
      type: 'reaction',
    },
    level: 1,
    preparation: {
      mode: 'pact',
    },
  },
} as const;

// 2nd Level
export const acidArrow = {
  id: 'TfaZTnHTjRwUIZvO',
  name: 'Acid Arrow',
  type: 'spell',
  system: {
    activation: {
      type: 'action',
    },
    level: 2,
    preparation: {
      mode: 'prepared',
    },
  },
} as const;

export const blindnessDeafnessPact = {
  id: 'vBebTQccyixRe5nr',
  name: 'Blindness/Deafness',
  type: 'spell',
  system: {
    activation: {
      type: 'action',
    },
    level: 2,
    preparation: {
      mode: 'pact',
    },
  },
} as const;

export const calmEmotions = {
  id: 'kzFvW60o0QmH71uR',
  name: 'Calm Emotions',
  type: 'spell',
  system: {
    activation: {
      type: 'action',
    },
    level: 2,
    preparation: {
      mode: 'prepared',
    },
  },
} as const;

export const darknessInnate = {
  id: '48MLsGjanBd0oAjt',
  name: 'Darkness',
  type: 'spell',
  system: {
    activation: {
      type: 'action',
    },
    level: 2,
    preparation: {
      mode: 'innate',
    },
  },
} as const;

// 3rd Level
export const clairvoyanceInnate = {
  id: 'jCAPCtqRKZ9FsUAx',
  name: 'Clairvoyance',
  type: 'spell',
  system: {
    activation: {
      type: 'minute',
    },
    level: 3,
    preparation: {
      mode: 'innate',
    },
  },
} as const;

// 4th Level
export const polymorphAtWill = {
  id: 'hCYpgFuwFmPeE7f1',
  name: 'Polymorph',
  type: 'spell',
  system: {
    activation: {
      type: 'action',
    },
    level: 4,
    preparation: {
      mode: 'atwill',
    },
  },
} as const;

// 8th Level
export const animalShapesAtWill = {
  id: '71q6GyfFpI9yb0ae',
  name: 'Animal Shapes',
  type: 'spell',
  system: {
    activation: {
      type: 'action',
    },
    level: 8,
    preparation: {
      mode: 'atwill',
    },
  },
} as const;
