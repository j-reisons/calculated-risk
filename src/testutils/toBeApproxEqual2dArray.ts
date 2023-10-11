export function toBeApproxEqual2dArray(received: number[][], expected: number[][], tolerance: number): jest.CustomMatcherResult {
    if (received.length !== expected.length) {
        return {
            pass: false,
            message: () => `Expected arrays to have the same length but they have different lengths.`,
        };
    }

    for (let i = 0; i < received.length; i++) {
        if (received[i].length !== expected[i].length) {
            return {
                pass: false,
                message: () => `Array at index ${i} has a different length in the received and expected arrays.`,
            };
        }

        for (let j = 0; j < received[i].length; j++) {
            if (Math.abs(received[i][j] - expected[i][j]) > tolerance) {
                return {
                    pass: false,
                    message: () => `Element at [${i}][${j}] is not approximately equal.`,
                };
            }
        }
    }

    return {
        pass: true,
        message: () => `Arrays are approximately equal within the specified tolerance.`,
    };
}
