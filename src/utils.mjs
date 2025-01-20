/**
 * Fletter sammen N antall arrays til en sortert liste.
 *
 * Eksempel:
 *
 * Input: [1, 2, 3], ["a", "b", "c"], ["x", "y", "z"]
 *
 * Output: [1, "a", "x", 2, "b", "y", 3, "c", "z"]
 *
 * @param {...Array} arrays - Arrays som skal flettes sammen
 * @returns {Record[]} Flettet liste
 */
export const interweaveArrays = (...arrays) => {
  const maxLength = Math.max(...arrays.map((arr) => arr.length));
  const result = [];

  for (let i = 0; i < maxLength; i++) {
    for (const array of arrays) {
      if (i < array.length) {
        result.push(array[i]);
      }
    }
  }

  return result;
};
