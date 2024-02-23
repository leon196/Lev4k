#version 330
#define m1 main
uniform int m;
uniform int pm;
uniform sampler2D sb1;

out vec4 o1;

/*
uniform vec3 camPos;
uniform vec3 camRot;
//*/

float time;
vec2 res = vec2(1920,1080);
//vec2 res = vec2(3840,2160);

mat2 rot(float a) {return mat2(cos(a),sin(a),-sin(a),cos(a));}

float box(vec3 p, vec3 s) {
	p=abs(p)-s;
	return max(p.x, max(p.y,p.z));
}

float map(vec3 p) {
	// basic kifs
	for(int i=0; i<4; ++i) {
		p.yz *= rot(time*0.3+i);
		p.xz *= rot(time*0.4+i*1.7);
		p.xy = abs(p.xy)-1.1 - sin(time + i);
	}

	return box(p, vec3(0.1,0.4,1));
}

////////////////////////////
// MAIN PASS              //
////////////////////////////


// Dave Hoskins https://www.shadertoy.com/view/4djSRW
vec2 hash21(float p)
{
	vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973));
	p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx+p3.yz)*p3.zy);
}
vec2 hash23(vec3 p3)
{
	p3 = fract(p3 * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+33.33);
    return fract((p3.xx+p3.yz)*p3.zy);
}

float gyroid (vec3 seed) { return dot(sin(seed),cos(seed.yzx)); }
float fbm (vec3 seed) {
    float result = 0.;
    float a = .5;
    for (int i = 0; i < 3; ++i) {
        result += gyroid(seed/a)*a;
        a /= 3.;
    }
    return result;
}

// move horizontally, with circles and random offset
vec2 move(float t)
{
    vec2 pos = vec2(0);
    float angle = t*12.;
    float radius = .1;
	float speed = 1.;
    float time = t*15.;
    float index = floor(time);
    float anim = fract(time);
    float scroll = fract(t*speed);
    vec2 rng = mix(hash21(index), hash21(index+1.), anim);
    pos += (rng*2.-1.)*.5;
    pos.x += scroll*2.-1.;
    pos += vec2(cos(angle),sin(angle))*radius;
	
    // fbm gyroid noise
    angle = fbm(vec3(pos,t))*6.28;
    radius = .2;
    pos += vec2(cos(angle),sin(angle))*radius;

    return pos;
}

void m1(void)
{	
	time = m/44100.;
	float dt = (m-pm)/44100.;
	
	vec2 p = (gl_FragCoord.xy - res.xy/2)/res.y;
	vec2 uv = gl_FragCoord.xy/res.xy;
	vec2 rng = hash23(vec3(gl_FragCoord.xy, m));
	vec3 col = vec3(0);

	float t = time * 0.2;
	p -= move(t+rng.x*.01) * .5;
	float shape = length(p)-.02+.01*sin(time*10.);
	float shade = smoothstep(.01,0,shape);

	vec3 tint = 0.5+0.5*cos(vec3(1,2,3)*5.1+t*10.);
	col = tint*shade;
	
	col = max(col, texture(sb1, uv).xyz * step(.01, fract(t)));// - 0.1*dt);

	o1 = vec4(col,1);
}

////////////////////////////
// POST-PROCESS           //
////////////////////////////

void m2(void)
{	
	time = m/44100.;
	
	vec2 uv = gl_FragCoord.xy/res.xy;
	
	vec3 col=vec3(0);
	vec2 off=vec2(0.005,0);
	col.x += texture(sb1, uv-off).x;
	col.y += texture(sb1, uv).y;
	col.z += texture(sb1, uv+off).z;
	
	o1 = vec4(col,1);
}

////////////////////////////
// AUDIO PASS             //
////////////////////////////

float note_freq(float note, float octave) { return 440.0*pow(2.0,((octave-4.0)*12.0+note)/12.0); }

void m3(void)
{			
	vec2 frag = gl_FragCoord.xy;

	float time = (frag.x + frag.y*1920) / 44100. - 0.05;
	
	float t = time * 0.2;
	vec2 mm = move(t) * .5;

	vec2 mus = vec2(0);
	float beat = fract(time);
	float note = floor(time);
	float freq = note_freq(mod(note, 8), 4);
	mus += sin(freq*6.283*beat + mm.y * 100. + sin(time*30)) * exp(-beat*3) * 0.7;
	//mus += (fract(beat*55.0 + sin(time*730)*0.2)-0.5) * exp(-beat*9) * 0.5;
	float beat2 = min(fract(time*2), fract(time*6));
	//mus += fract(sin(beat2*342.454)*485.523) * exp(-beat2*10) * 0.2 * step(mod(time,16),12);

	o1 = vec4(0,0,mus);
}
