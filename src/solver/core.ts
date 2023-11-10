import { Matrix, flatten, index, matrix, range, reshape, size, zeros } from "mathjs";

export interface CoreProblem {
    // A tensor of dimensions (periods, starting_wealth, strategy, next_wealth)
    // Contains transition probabilities from starting_wealth to next_wealth 
    // for a given period and strategy
    transitionTensor: Matrix[];
    // An array of dimension (next_wealth) containing the value of the utility
    // function for each wealth value.
    finalUtilities: number[];
}

export interface CoreSolution {
    // Matrix of dimensions (periods, wealth) containing the indices of optimal strategies
    // -1 values indicate multiple optimal strategies
    readonly optimalStrategies: Matrix;
    // Matrix of dimensions (periods, wealth) containing expected utilities
    readonly expectedUtilities: Matrix;
}


export function coreSolveCPU({ transitionTensor, finalUtilities }: CoreProblem): CoreSolution {
    const periods = transitionTensor.length;
    const [wealth_size, ,] = size(transitionTensor[0]).valueOf() as number[];

    const allWealths = range(0, wealth_size);

    const optimalStrategies = zeros([periods, wealth_size], 'dense') as Matrix;
    const expectedUtilities = zeros([periods + 1, wealth_size], 'dense') as Matrix;

    expectedUtilities.valueOf() as number[][];
    expectedUtilities.subset(index(periods, allWealths), finalUtilities);

    for (let p = periods - 1; p >= 0; p--) {
        const nextUtility = matrix((expectedUtilities.valueOf() as number[][])[p + 1]);
        const periodTransition = transitionTensor[p];
        const strategyUtilities = contractCPU(periodTransition, nextUtility);
        const periodStrategies = (strategyUtilities.valueOf() as number[][]).map(max);

        optimalStrategies.subset(index(p, allWealths), periodStrategies.map(item => item.argmax));
        expectedUtilities.subset(index(p, allWealths), periodStrategies.map(item => item.max));
    }

    return { optimalStrategies, expectedUtilities };
}

export async function coreSolveGPU({ transitionTensor, finalUtilities }: CoreProblem): Promise<CoreSolution> {
    const periods = transitionTensor.length;
    const [wealth_size, ,] = size(transitionTensor[0]).valueOf() as number[];

    const allWealths = range(0, wealth_size);

    const optimalStrategies = zeros([periods, wealth_size], 'dense') as Matrix;
    const expectedUtilities = zeros([periods + 1, wealth_size], 'dense') as Matrix;
    expectedUtilities.subset(index(periods, allWealths), finalUtilities);

    for (let p = periods - 1; p >= 0; p--) {
        const nextUtility = matrix((expectedUtilities.valueOf() as number[][])[p + 1]);
        const periodTransition = transitionTensor[p];
        const strategyUtilities = await contractGPU(periodTransition, nextUtility);
        const periodStrategies = (strategyUtilities.valueOf() as number[][]).map(max);

        optimalStrategies.subset(index(p, allWealths), periodStrategies.map(item => item.argmax));
        expectedUtilities.subset(index(p, allWealths), periodStrategies.map(item => item.max));
    }

    return { optimalStrategies, expectedUtilities };
}

function contractCPU(transition: Matrix, nextUtility: Matrix): Matrix {
    const size = transition.size();
    const result = zeros(size.slice(0, 2), 'dense') as Matrix;

    const transitionValues = (transition.valueOf() as unknown) as number[][][];
    const nextUtilityValues = nextUtility.valueOf() as number[];
    const resultValues = result.valueOf() as number[][];

    for (let i = 0; i < size[0]; i++) {
        for (let j = 0; j < size[1]; j++) {
            for (let k = 0; k < size[2]; k++) {
                resultValues[i][j] += transitionValues[i][j][k] * nextUtilityValues[k];
            }
        }
    }

    return result;
}

// Wrapper around reshape-multiply to contract 3+ dimensional tensors.
// Contraction occurs between the last dimension of tensor1 with the first dimension of tensor2
async function contractGPU(tensor1: Matrix, tensor2: Matrix): Promise<Matrix> {
    const reshaped1 = reshape(tensor1, [-1, tensor1.size()[tensor1.size().length - 1]]);
    const reshaped2 = reshape(tensor2, [tensor2.size()[0], -1]);

    const resultSize = [...tensor1.size().slice(0, -1), ...tensor2.size().slice(1)];
    const resultMatrix = await multiplyGPU(reshaped1, reshaped2);

    return reshape(resultMatrix, resultSize);
}

async function multiplyGPU(matrix1: Matrix, matrix2: Matrix): Promise<Matrix> {
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter!.requestDevice();

    const array1 = new Float32Array([...matrix1.size(), ...flatten(matrix1.toArray()) as number[]])
    const buffer1 = device.createBuffer({
        size: array1.byteLength,
        mappedAtCreation: true,
        usage: GPUBufferUsage.STORAGE
    });
    new Float32Array(buffer1.getMappedRange()).set(array1);
    buffer1.unmap();

    const array2 = new Float32Array([...matrix2.size(), ...flatten(matrix2.toArray()) as number[]]);
    const buffer2 = device.createBuffer({
        size: array2.byteLength,
        mappedAtCreation: true,
        usage: GPUBufferUsage.STORAGE
    });
    new Float32Array(buffer2.getMappedRange()).set(array2);
    buffer2.unmap();

    const resultMatrixBufferSize = (2 + matrix1.size()[0] + matrix2.size()[1]) * Float32Array.BYTES_PER_ELEMENT
    const bufferResult = device.createBuffer({
        size: resultMatrixBufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    });


    const shaderModule = device.createShaderModule({
        code: `
          struct Matrix {
            size : vec2f,
            numbers: array<f32>,
          }

          @group(0) @binding(0) var<storage, read> firstMatrix : Matrix;
          @group(0) @binding(1) var<storage, read> secondMatrix : Matrix;
          @group(0) @binding(2) var<storage, read_write> resultMatrix : Matrix;

          @compute @workgroup_size(8, 8)
          fn main(@builtin(global_invocation_id) global_id : vec3u) {
            // Guard against out-of-bounds work group sizes
            if (global_id.x >= u32(firstMatrix.size.x) || global_id.y >= u32(secondMatrix.size.y)) {
              return;
            }

            resultMatrix.size = vec2(firstMatrix.size.x, secondMatrix.size.y);

            let resultCell = vec2(global_id.x, global_id.y);
            var result = 0.0;
            for (var i = 0u; i < u32(firstMatrix.size.y); i = i + 1u) {
              let a = i + resultCell.x * u32(firstMatrix.size.y);
              let b = resultCell.y + i * u32(secondMatrix.size.y);
              result = result + firstMatrix.numbers[a] * secondMatrix.numbers[b];
            }

            let index = resultCell.y + resultCell.x * u32(secondMatrix.size.y);
            resultMatrix.numbers[index] = result;
          }
        `
    });

    const computePipeline = device.createComputePipeline({
        layout: "auto",
        compute: {
            module: shaderModule,
            entryPoint: "main"
        }
    });

    const bindGroup = device.createBindGroup({
        layout: computePipeline.getBindGroupLayout(0),
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: buffer1
                }
            },
            {
                binding: 1,
                resource: {
                    buffer: buffer2
                }
            },
            {
                binding: 2,
                resource: {
                    buffer: bufferResult
                }
            }
        ]
    });

    const commandEncoder = device.createCommandEncoder();
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(computePipeline);
    passEncoder.setBindGroup(0, bindGroup);
    const workgroupCountX = Math.ceil(array1[0] / 8);
    const workgroupCountY = Math.ceil(array2[1] / 8);
    passEncoder.dispatchWorkgroups(workgroupCountX, workgroupCountY);
    passEncoder.end();

    const gpuReadBuffer = device.createBuffer({
        size: resultMatrixBufferSize,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
    });

    commandEncoder.copyBufferToBuffer(bufferResult, 0, gpuReadBuffer, 0, resultMatrixBufferSize);
    const gpuCommands = commandEncoder.finish();
    device.queue.submit([gpuCommands]);

    // Read buffer.
    await gpuReadBuffer.mapAsync(GPUMapMode.READ);
    const output = new Float32Array(gpuReadBuffer.getMappedRange());

    // Read it back out into a Matrix
    return matrix(Array.from(output.subarray(2, output.length))).resize(Array.from(output.subarray(0, 1)));
}

const EPSILON = 1E-10;
function max(array: number[]): { max: number, argmax: number } {
    return array.reduce(
        (value, x, i) => {
            return x > value.max + EPSILON ?
                { max: x, argmax: i }
                : x === value.max
                    ? { max: x, argmax: NaN } // NaN indicates multiple maxima
                    : value
        },
        { max: 0, argmax: 0 });
}