declare module 'diff-arrays-of-objects' {
  /*  From the docs

      var result = diff(
        [
          {id: 1, name: 'a'},
          {id: 2, name: 'b'},
          {id: 3, name: 'c'},
          {id: 4, name: 'd'},
          {id: 5, name: 'e'}
        ],
        [
          {id: 1, name: 'a'},
          {id: 2, name: 'z'},
          {id: 7, name: 'e'}
        ],
        'id'
      );

      // {
      //   added: [
      //     { id: 7, name: 'e' }
      //   ],
      //   removed: [
      //     { id: 3, name: 'c' },
      //     { id: 4, name: 'd' },
      //     { id: 5, name: 'e' }
      //   ],
      //   updated: [
      //     { id: 2, name: 'z' }
      //   ],
      //   same: [
      //     { id: 1, name: 'a' }
      //   ]
      // }

      diff-arrays-of-objects (first, second, idField, [options])
      first
      Required
      Type: array

      First array to be compared.

      second
      Required
      Type: array

      Second array to be compared.

      idField
      Required
      Type: string

      The id field that is used to compare the arrays. Defaults to 'id'.

      options
      Type: object

      {
        compareFunction: <Func> // defaults to lodash's isEqual; must accept two parameters (o1, o2)
        updatedValues: <Number> // controls what gets returned in the "updated" results array:
                                // diff.updatedValues.first (1): the value from the first array
                                // diff.updatedValues.second (2): the value from the second array (default)
                                // diff.updatedValues.both (3): both values, as an array [first, second]
                                // diff.updatedValues.bothWithDeepDiff (4): both values, plus the results of the deep-diff module; [first, second, deep-diff]
      }
  */

  export function diff(
    first: K[],
    second: K[],
    idField: keyof K,
    options?: {
      compareFunction: (a: unknown, b: unknown) => number
      updatedValues: number
    },
  ): {
    added: K[]
    removed: K[]
    updated: K[]
    same: K[]
  }

  export default diff
}
