const collator = new Intl.Collator(undefined, {
  usage: 'sort',
  sensitivity: 'base',
  ignorePunctuation: true,
  numeric: true,
});

export default collator;
