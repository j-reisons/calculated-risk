@group(0) @binding(0) var<uniform> period : u32;
// starting_wealth, strategies, max_bandwidth
@group(0) @binding(1) var<uniform> dimensions : vec3u;

// starting_wealth, strategies, max_bandwidth
@group(0) @binding(2) var<storage, read> transitionValues : array<f32>;
// starting_wealth, strategies
@group(0) @binding(3) var<storage, read> supportBandIndices : array<f32>;
// starting_wealth, strategies
@group(0) @binding(4) var<storage, read> supportBandWidths : array<f32>;
// periods, wealth
@group(0) @binding(5) var<storage, read_write> optimalStrategies : array<f32>;

// starting_wealth, max_bandwidth
@group(0) @binding(6) var<storage, read_write> optimalTransitionValues : array<f32>;
// periods, starting_wealth
@group(0) @binding(7) var<storage, read_write> optimalSupportBandIndices : array<f32>;
// periods, starting_wealth
@group(0) @binding(8) var<storage, read_write> optimalSupportBandWidths : array<f32>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id: vec3u) {

    if global_id.x >= dimensions[0] {
        return;
    }
    let transitionValuesStrides = vec3u(dimensions[1] * dimensions[2], dimensions[2], 1u);
    let supportBandStrides = vec2u(dimensions[1], 1u);
    let optimalStrategiesStrides = vec2u(dimensions[0], 1u);
    let optimalTransitionValuesStrides = vec2u(dimensions[2], 1u);
    let optimalSupportBandIndicesStrides = vec2u(dimensions[0], 1u);

    var optimalStrategy = u32(optimalStrategies[dot(vec2u(period, global_id.x), optimalStrategiesStrides)]);
    if !(optimalStrategy > 0u) {
        optimalStrategy = 0u;
    }

    let supportBandArrayIndex = dot(vec2u(global_id.x, optimalStrategy), supportBandStrides);
    let optimalSupportBandArrayIndex = dot(vec2u(period, global_id.x), optimalSupportBandIndicesStrides);

    optimalSupportBandIndices[optimalSupportBandArrayIndex] = supportBandIndices[supportBandArrayIndex];
    let bandIndex = u32(supportBandIndices[supportBandArrayIndex]);
    optimalSupportBandWidths[optimalSupportBandArrayIndex] = supportBandWidths[supportBandArrayIndex];
    let bandWidth = u32(supportBandWidths[supportBandArrayIndex]);

    var optimalIndex = dot(vec2u(global_id.x, 0u), optimalTransitionValuesStrides);
    let finalIndex = optimalIndex + bandWidth;
    var originalIndex = dot(vec3u(global_id.x, optimalStrategy, 0u), transitionValuesStrides);
    while(optimalIndex < finalIndex){
        optimalTransitionValues[optimalIndex] = transitionValues[originalIndex];
        optimalIndex = optimalIndex + 1u;
        originalIndex = originalIndex + 1u;
    }
}