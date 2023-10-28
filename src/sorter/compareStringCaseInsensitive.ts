const compareStringCaseInsensitive = (strA: string, strB: string) => {
  return strA.localeCompare(strB, undefined, { sensitivity: 'base' });
};

export default compareStringCaseInsensitive;
