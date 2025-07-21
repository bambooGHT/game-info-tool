export const filterTags = (rawTag: string[], filterTag: string[]) => {
  return new Set(rawTag.filter(item => filterTag.includes(item)));
};

export const excludeTags = (rawTag: string[], excludeTag: string[]) => {
  const result = new Set(rawTag);
  excludeTag.forEach(item => {
    result.delete(item);
  });

  return result;
};