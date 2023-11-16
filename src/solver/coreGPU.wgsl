@group(0) @binding(0) var<uniform> nan : f32;
@group(0) @binding(1) var<uniform> period : u32;
// TODO : redo all the dimension indexing
// starting_wealth, strategies, max_bandwidth
@group(0) @binding(2) var<uniform> dimensions : vec3u;

// starting_wealth, strategies, max_bandwidth
@group(0) @binding(3) var<storage, read> transitionValues : array<f32>;
// starting_wealth, strategies
@group(0) @binding(4) var<storage, read> supportBandIndices : array<f32>;
// starting_wealth, strategies
@group(0) @binding(5) var<storage, read> supportBandWidths : array<f32>;

// periods + 1, wealth
@group(0) @binding(6) var<storage, read_write> expectedUtilities : array<f32>;
// periods, wealth
@group(0) @binding(7) var<storage, read_write> optimalStrategies : array<f32>;


const EPSILON = 1E-6;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id: vec3u) {

    if global_id.x >= dimensions[0] {
        return;
    }

    let transitionValuesStrides = vec3u(dimensions[1] * dimensions[2], dimensions[2], 1u);
    let supportBandStrides = vec2u(dimensions[1], 1u);
    let utilityStrides = vec2u(dimensions[0], 1u);

    var maxUtility = 0f;
    var optimalStrategy = 0f;

    for (var s = 0u; s < dimensions[1]; s = s + 1u) {
        let index = dot(vec2u(global_id.x,s),supportBandStrides);
        let bandIndex = u32(supportBandIndices[index]);
        let bandWidth = u32(supportBandWidths[index]);

        var strategyUtility = 0.0;
        for (var i = 0u; i < bandWidth; i = i + 1u) {
            let nextUtility = expectedUtilities[dot(vec2u(period + 1u, bandIndex + i), utilityStrides)];
            let transition = transitionValues[dot(vec3u(global_id.x, s, i), transitionValuesStrides)];
            strategyUtility = strategyUtility +  (transition * nextUtility);
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