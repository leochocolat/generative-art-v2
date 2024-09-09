/*
** Levels
** Source: https://gist.github.com/aferriss/9be46b6350a08148da02559278daa244
*/
vec3 gammaCorrect(vec3 color, float gamma){
    return pow(color, vec3(1.0/gamma));
}

vec3 levelRange(vec3 color, float minInput, float maxInput){
    return min(max(color - vec3(minInput), vec3(0.0)) / (vec3(maxInput) - vec3(minInput)), vec3(1.0));
}

vec3 levels(vec3 color, float minInput, float gamma, float maxInput){
    return gammaCorrect(levelRange(color, minInput, maxInput), gamma);
}

#pragma glslify: export(levels)