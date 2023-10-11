import bindings from "bindings";

export function setupGPU(): void {
    const gpuProviderModule = bindings("dawn_windows");
    const gpuProviderFlags = ['disable-dawn-features=disallow_unsafe_apis'];
    const nodeGpuInstance = gpuProviderModule.create(gpuProviderFlags);
    Object.defineProperty(global, 'navigator', { value: { gpu: nodeGpuInstance } });
    Object.defineProperty(global, 'GPUBufferUsage', {
        value: {
            COPY_SRC: 4,
            COPY_DST: 8,
            INDEX: 16,
            INDIRECT: 256,
            MAP_READ: 1,
            MAP_WRITE: 2,
            QUERY_RESOLVE: 512,
            STORAGE: 128,
            UNIFORM: 64,
            VERTEX: 32,
        }
    });
    Object.defineProperty(global, 'GPUMapMode', {
        value: {
            READ: 1,
            WRITE: 2
        }
    });
}

