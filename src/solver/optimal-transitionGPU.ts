import ndarray, { NdArray } from "ndarray";
import { TransitionTensor } from "./core";
import { OptimalTransitionTensor } from "./optimal-transition";
import shaderSource from './optimal-transitionGPU.wgsl?raw';
import { initOutputBuffer, initStorageBuffer, initUniformBuffer } from "./utils";

export async function indexOptimalTransitionTensor(transitionTensor: TransitionTensor,
    optimalStrategies: NdArray): Promise<OptimalTransitionTensor> {
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter!.requestDevice();

    const periods = transitionTensor.uniquePeriodIndices.length;
    const wealthSize = transitionTensor.values[0].shape[0];
    const periodsArray = Array.from({ length: periods }, (_, i) => i);

    const periodBuffers = periodsArray.map(p => initUniformBuffer(device, [p], Uint32Array));
    const dimensionsBuffers = transitionTensor.values.map(nd => initUniformBuffer(device, nd.shape, Uint32Array));

    const transitionDataBuffers = transitionTensor.values.map(nd => initStorageBuffer(device, nd, Float32Array));
    const supportBandIndicesBuffers = transitionTensor.supportBandIndices.map(nd => initStorageBuffer(device, nd, Float32Array));
    const supportBandWidthsBuffers = transitionTensor.supportBandWidths.map(nd => initStorageBuffer(device, nd, Float32Array));
    const optimalStrategiesBuffer = initStorageBuffer(device, optimalStrategies, Float32Array);

    const maxBandWidths = periodsArray.map(i => transitionTensor.values[transitionTensor.uniquePeriodIndices[i]].shape[2]);
    const optimalTransitionValuesBuffers = periodsArray.map(i => initOutputBuffer(device, wealthSize * maxBandWidths[i] * Float32Array.BYTES_PER_ELEMENT));
    const optimalSupportBandIndicesBuffer = initOutputBuffer(device, periods * wealthSize * Float32Array.BYTES_PER_ELEMENT);
    const optimalSupportBandWidthsBuffer = initOutputBuffer(device, periods * wealthSize * Float32Array.BYTES_PER_ELEMENT);


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
                { binding: 0, resource: { buffer: periodBuffers[p] } },
                { binding: 1, resource: { buffer: dimensionsBuffers[u] } },
                { binding: 2, resource: { buffer: transitionDataBuffers[u] } },
                { binding: 3, resource: { buffer: supportBandIndicesBuffers[u] } },
                { binding: 4, resource: { buffer: supportBandWidthsBuffers[u] } },
                { binding: 5, resource: { buffer: optimalStrategiesBuffer } },
                { binding: 6, resource: { buffer: optimalTransitionValuesBuffers[p].buffer } },
                { binding: 7, resource: { buffer: optimalSupportBandIndicesBuffer.buffer } },
                { binding: 8, resource: { buffer: optimalSupportBandWidthsBuffer.buffer } },
            ]
        })
    }

    const commandEncoder: GPUCommandEncoder = device.createCommandEncoder();
    const workGroupCount = Math.ceil(wealthSize / 64);

    for (let p = 0; p < periods; p++) {
        const passEncoder = commandEncoder.beginComputePass();
        passEncoder.setPipeline(computePipeline);
        passEncoder.setBindGroup(0, periodBindGroups[p]);
        passEncoder.dispatchWorkgroups(workGroupCount);
        passEncoder.end();
    }

    for (let p = 0; p < periods; p++) {
        commandEncoder.copyBufferToBuffer(optimalTransitionValuesBuffers[p].buffer, 0, optimalTransitionValuesBuffers[p].readBuffer, 0, optimalTransitionValuesBuffers[p].buffer.size);
    }
    commandEncoder.copyBufferToBuffer(optimalSupportBandIndicesBuffer.buffer, 0, optimalSupportBandIndicesBuffer.readBuffer, 0, optimalSupportBandIndicesBuffer.buffer.size);
    commandEncoder.copyBufferToBuffer(optimalSupportBandWidthsBuffer.buffer, 0, optimalSupportBandWidthsBuffer.readBuffer, 0, optimalSupportBandWidthsBuffer.buffer.size);

    const gpuCommands = commandEncoder.finish();
    device.queue.submit([gpuCommands]);

    const allSupportBandIndices =
        optimalSupportBandIndicesBuffer.readBuffer.mapAsync(GPUMapMode.READ).then(() => {
            return ndarray(new Float32Array(optimalSupportBandIndicesBuffer.readBuffer.getMappedRange()), [periods, wealthSize]);
        });


    const allSupportBandWidths =
        optimalSupportBandWidthsBuffer.readBuffer.mapAsync(GPUMapMode.READ).then(() => {
            return ndarray(new Float32Array(optimalSupportBandWidthsBuffer.readBuffer.getMappedRange()), [periods, wealthSize]);
        });



    const valuePromises = new Array<Promise<NdArray>>(periods);
    for (let p = 0; p < periods; p++) {
        valuePromises[p] =
            optimalTransitionValuesBuffers[p].readBuffer.mapAsync(GPUMapMode.READ).then(
                () => {
                    return ndarray(new Float32Array(optimalTransitionValuesBuffers[p].readBuffer.getMappedRange()), [wealthSize, maxBandWidths[p]]);
                });
    }

    const values = new Array<NdArray>(periods);
    const supportBandIndices = new Array<NdArray>(periods);
    const supportBandWidths = new Array<NdArray>(periods);

    for (let p = 0; p < periods; p++) {
        values[p] = await valuePromises[p];
        supportBandIndices[p] = (await allSupportBandIndices).pick(p, null);
        supportBandWidths[p] = (await allSupportBandWidths).pick(p, null);
    }

    return { values, supportBandIndices, supportBandWidths };
}
