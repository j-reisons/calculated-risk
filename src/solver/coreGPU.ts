import ndarray from "ndarray";
import { CoreProblem, CoreSolution } from "./core";
import shaderSource from './coreGPU.wgsl?raw';
import { initOutputBuffer, initStorageBuffer, initUniformBuffer } from "./utils";

export async function solveCore({ transitionTensor, finalUtilities }: CoreProblem): Promise<CoreSolution> {
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter!.requestDevice();

    const periods = transitionTensor.uniquePeriodIndices.length;
    const wealthSize = finalUtilities.length;

    const nanBuffer = initUniformBuffer(device, [NaN], Float32Array);
    const periodBuffers = Array.from({ length: periods }, (_, i) => [i]).map(i_arr => initUniformBuffer(device, i_arr, Uint32Array));
    const dimensionsBuffers = transitionTensor.values.map(nd => initUniformBuffer(device, nd.shape, Uint32Array));
    const transitionDataBuffers = transitionTensor.values.map(nd => initStorageBuffer(device, nd, Float32Array));
    const supportBandIndicesBuffers = transitionTensor.supportBandIndices.map(nd => initStorageBuffer(device, nd, Float32Array));
    const supportBandWidthsBuffers = transitionTensor.supportBandWidths.map(nd => initStorageBuffer(device, nd, Float32Array));

    const { buffer: expectedUtilitiesBuffer, readBuffer: expectedUtilitiesReadBuffer } = initOutputBuffer(device, (periods + 1) * wealthSize * Float32Array.BYTES_PER_ELEMENT, true);
    new Float32Array(expectedUtilitiesBuffer
        .getMappedRange(periods * wealthSize * Float32Array.BYTES_PER_ELEMENT, wealthSize * Float32Array.BYTES_PER_ELEMENT))
        .set(finalUtilities)
    expectedUtilitiesBuffer.unmap();

    const { buffer: optimalStrategiesBuffer, readBuffer: optimalStrategiesReadBuffer } = initOutputBuffer(device, periods * wealthSize * Float32Array.BYTES_PER_ELEMENT);

    const shaderModule = device.createShaderModule({ code: shaderSource })
    const computePipeline = device.createComputePipeline({
        layout: "auto",
        compute: {
            module: shaderModule,
            entryPoint: "main"
        }
    });

    const periodBindGroups: GPUBindGroup[] = new Array(periods);
    for (let p = 0; p < periods; p++) {
        const u = transitionTensor.uniquePeriodIndices[p];
        periodBindGroups[p] = device.createBindGroup({
            layout: computePipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: nanBuffer } },
                { binding: 1, resource: { buffer: periodBuffers[p] } },
                { binding: 2, resource: { buffer: dimensionsBuffers[u] } },
                { binding: 3, resource: { buffer: transitionDataBuffers[u] } },
                { binding: 4, resource: { buffer: supportBandIndicesBuffers[u] } },
                { binding: 5, resource: { buffer: supportBandWidthsBuffers[u] } },
                { binding: 6, resource: { buffer: expectedUtilitiesBuffer } },
                { binding: 7, resource: { buffer: optimalStrategiesBuffer } }
            ]
        })
    }

    const commandEncoder: GPUCommandEncoder = device.createCommandEncoder();
    const workGroupCount = Math.ceil(wealthSize / 64);

    for (let p = periods - 1; p >= 0; p--) {
        const passEncoder = commandEncoder.beginComputePass();
        passEncoder.setPipeline(computePipeline);
        passEncoder.setBindGroup(0, periodBindGroups[p]);
        passEncoder.dispatchWorkgroups(workGroupCount);
        passEncoder.end();
    }

    commandEncoder.copyBufferToBuffer(expectedUtilitiesBuffer, 0, expectedUtilitiesReadBuffer, 0, expectedUtilitiesBuffer.size);
    commandEncoder.copyBufferToBuffer(optimalStrategiesBuffer, 0, optimalStrategiesReadBuffer, 0, optimalStrategiesBuffer.size);

    const gpuCommands = commandEncoder.finish();
    device.queue.submit([gpuCommands]);

    await expectedUtilitiesReadBuffer.mapAsync(GPUMapMode.READ);
    const expectedUtilities = ndarray(new Float32Array(expectedUtilitiesReadBuffer.getMappedRange()), [periods + 1, wealthSize]);

    await optimalStrategiesReadBuffer.mapAsync(GPUMapMode.READ);
    const optimalStrategies = ndarray(new Float32Array(optimalStrategiesReadBuffer.getMappedRange()), [periods, wealthSize]);

    return { expectedUtilities, optimalStrategies };
}
