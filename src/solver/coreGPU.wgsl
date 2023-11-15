@group(0) @binding(0) var<uniform> nan : f32;
@group(0) @binding(1) var<uniform> period : u32;
// periods, starting_wealth, strategies, end_wealth
@group(0) @binding(2) var<uniform> dimensions : vec4<u32>;

// starting_wealth, strategies, end_wealth
@group(0) @binding(3) var<storage, read> transitionTensorValues : array<f32>;
// starting_wealth, strategies, 2
@group(0) @binding(4) var<storage, read> transitionTensorSupportBands : array<f32>;

// periods + 1, wealth
@group(0) @binding(5) var<storage, read_write> expectedUtilities : array<f32>;
// periods, wealth
@group(0) @binding(6) var<storage, read_write> optimalStrategies : array<f32>;


const EPSILON = 1E-6;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id: vec3u) {

    if global_id.x >= dimensions[1] {
        return;
    }

    let tensorValuesStride = vec3u(dimensions[2] * dimensions[1], dimensions[1], 1u);
    let tensorSupportStrides = vec3u(dimensions[2] * 2u, 2u, 1u);
    let utilityStrides = vec2u(dimensions[1], 1u);

    var maxUtility = 0f;
    var optimalStrategy = 0f;

    for (var s = 0u; s < dimensions[2]; s = s + 1u) {
        let bottom = u32(transitionTensorSupportBands[dot(vec3u(global_id.x, s, 0u), tensorSupportStrides)]);
        let top = u32(transitionTensorSupportBands[dot(vec3u(global_id.x, s, 1u), tensorSupportStrides)]);

        var strategyUtility = 0.0;
        for (var i = bottom; i < top; i = i + 1u) {
            let nextUtility = expectedUtilities[dot(vec2u(period + 1u, i), utilityStrides)];
            let transition = transitionTensorValues[dot(vec3u(global_id.x, s, i), tensorValuesStride)];
            strategyUtility = strategyUtility +  transition*nextUtility;
        }

        let greater = strategyUtility > maxUtility + EPSILON;
        let equal = strategyUtility == maxUtility;
        
        if(greater){
            maxUtility = strategyUtility;
            optimalStrategy = f32(s);
        }else if (equal){
            optimalStrategy = nan;
        }
    }

    expectedUtilities[dot(vec2u(period,global_id.x), utilityStrides)] = maxUtility;
    optimalStrategies[dot(vec2u(period,global_id.x), utilityStrides)] = optimalStrategy;
}