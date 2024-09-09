#define WATER_TOP_COLOR vec3(0.247, 0.751, 1.000)

vec3 ACESFilm(vec3 x){
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0);
}

vec3 fakeLight(vec3 uColor, float ambientStrength, float diffuseStrength, float specularStrength, float translucencyStrength, float shininess, vec3 lightColor, vec3 sunDirection, vec3 specularColor) {

    vec3 textureColor = pow(uColor, vec3(2.2));
    vec3 normal;
    normal = normalize(vNormal);

    vec3 lightTimesTexture = lightColor * textureColor;
    vec3 ambient = textureColor;
    vec3 lightDir = normalize(sunDirection);
  
  
    //How much a fragment faces the light
    float dotNormalLight = dot(normal, lightDir);
    float diff = max(dotNormalLight, 0.0);
  
    //Colour when lit by light
    vec3 diffuse = diff * lightTimesTexture;
  
    float sky = max(dot(normal, vec3(0,1,0)), 0.0);
    vec3 skyLight = sky * vec3(0.12, 0.29, 0.55);
  
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    vec3 halfwayDir = normalize(lightDir + viewDirection);
    //How much a fragment directly reflects the light to the camera
    float spec = pow(max(dot(normal, halfwayDir), 0.0), shininess);
  
    //Colour of light sharply reflected into the camera
    vec3 specular = spec * specularColor * lightColor;

    vec3 diffuseTranslucency = vec3(0);
    vec3 forwardTranslucency = vec3(0);
    float dotViewLight = dot(-lightDir, viewDirection);
    if(dotNormalLight <= 0.0){
      diffuseTranslucency = lightTimesTexture * translucencyStrength * -dotNormalLight;
      if(dotViewLight > 0.0){
        forwardTranslucency = lightTimesTexture * translucencyStrength * pow(dotViewLight, 16.0);
      }
    }
    // vec3 col = vNormal;
    vec3 col = 0.3 * skyLight * textureColor + ambientStrength * ambient + diffuseStrength * diffuse + specularStrength * specular + diffuseTranslucency + forwardTranslucency;
  
    //Add a shadow towards root
    // col = mix(0.35*vec3(0.1, 0.25, 0.02), col, frc);
    
    //Tonemapping
    col = ACESFilm(col);
  
    //Gamma correction 1.0/2.2 = 0.4545...
    col = pow(col, vec3(0.4545));

    return col;
}

#pragma glslify: export(fakeLight)