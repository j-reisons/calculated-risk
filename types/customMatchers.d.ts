declare namespace jest {
    interface Matchers<R> {
        toBeApproxEqual2dArray(
        expected: number[][],
        tolerance: number
      ): R;
    }
  }