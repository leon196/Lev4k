#version 330
#define m1 main
uniform int m;
uniform sampler2D sb1;

out vec4 o1;

/*
uniform vec3 camPos;
uniform vec3 camRot;
//*/

float time;
vec2 res = vec2(1280,720);
//vec2 res = vec2(3840,2160);

float mask, dither, glow;
vec3 coord;

float radius = 1.;
float thin = 1.2;

#define repeat(p,r) (mod(p,r)-r/2.)
mat2 rot(float a) {return mat2(cos(a),sin(a),-sin(a),cos(a));}
float gyroid (vec3 p) { return dot(cos(p), sin(p.yzx)); }

// https://mercury.sexy/hg_sdf/
float moda(inout vec2 p, float repetitions) {
	float angle = 2.*3.14/repetitions;
	float a = atan(p.y, p.x) + angle/2.;
	float r = length(p);
	float c = floor(a/angle);
	a = mod(a,angle) - angle/2.;
	p = vec2(cos(a), sin(a))*r;
	// For an odd number of repetitions, fix cell index of the cell in -x direction
	// (cell index would be e.g. -5 and 5 in the two halves of the cell):
	if (abs(c) >= (repetitions/2.)) c = abs(c);
	return c;
}


float smin( float d1, float d2, float k )
{
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h);
}

float smax( float d1, float d2, float k )
{
    float h = clamp( 0.5 - 0.5*(d2+d1)/k, 0.0, 1.0 );
    return mix( d2, -d1, h ) + k*h*(1.0-h);
}

float sdBox(vec3 p, vec3 s) {
	p=abs(p)-s;
	return max(p.x, max(p.y,p.z));
}

float sdTorus( vec3 p, vec2 t )
{
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

float fbm (vec3 p, float d)
{
  float result = 0.;
  float a = 0.5;
  for (float i = 0.; i < 3.; ++i)
  {
    p.z += result * d;
    result += (gyroid(p/a))*a;
    a /= 1.8;
  }
  return result;
}

float sdf_floor(vec3 p)
{
  p.y = -abs(p.y);

  vec3 q = p;
  float d = 100.;
  float b = 100.;


  moda(p.xz, 40.);
  p.x -= radius;
  p.y += thin-.05;
  p.xy *= rot(.2);
  b = sdBox(p, vec3(.1,.02,.1));
  b = max(b, p.y+abs(p.z)-.08);
  d = min(d, b);

  p = q;
  moda(p.xz, 60.);
  p.x -= radius+.2;
  p.y += thin-.1;
  b = sdBox(p, vec3(.05,.1,.05));
  b = max(b, -p.x+p.y-.08);
  d = min(d, b);

  p.x -= .3;
  p.y -= .075;
  b = sdBox(p, vec3(.2,.1,.05));
  b = max(b, -p.x+p.y-.28);
  d = min(d, b);

  return d;
}

float sdf_column(vec3 p)
{
  vec3 q = p;
  float d = 100.;
  float b = 100.;

  moda(p.xz, 22.);

  p.x -= 4.5;
  moda(p.xy, 240.);
  p.x -= 4.;
  b = sdBox(p, vec3(.02,.045,.07));
  b = max(b, -p.x+abs(p.y)-.06);
  p.z = abs(p.z)-.02;
  b = smax(length(p.yz)-.002, b, .002);
  d = min(d, b);

  p = q;
  moda(p.xz, 28.);
  p.x -= .6;
  p.y = abs(p.y)-1.1;
  p.xy *= rot(.5);
  p.x -= .045;
  b = sdBox(p, vec3(.1,.1,.07));
  b = max(b, abs(p.x)+abs(p.y)-.18);
  d = min(d, b);

  p.xy *= rot(-.5);
  p.x -= .1;
  p.y -= .1;
  b = sdBox(p, vec3(.1,.1,.07));
  b = max(b, abs(p.x)+abs(p.y)-.18);
  d = min(d, b);

  return d;
}

float sdf_wall(vec3 p)
{
  vec3 q = p;
  float d = 100.;
  float b = 100.;

  // moda(p.xz, 50.);
  // p.x -= 1.;
  // b = sdTorus(p.xzy, vec2(1.14,.01));
  // b = max(b, abs(p.y)-1.);
  // d = min(d, b);

  p = q;
  p.xz *= rot(3.14/25./2.);
  moda(p.xz, 50.);
  p.x -= 1.;
  moda(p.xy, 30.);
  p.x -= 1.2;
  b = sdBox(p.xzy, vec3(.04,.11,.11));
  // b = max(b, abs(p.x)+abs(p.y)-.12);
  // b = max(b, abs(p.z)+abs(p.x)-.13);
  b = max(b, abs(q.y)-1.);
  d = min(d, b);

  return d;
}

float sdf_flux(vec3 p)
{
  float d = 100.;
  float b = 100.;

  float t = time*1.;
  float flux = fbm(vec3(length(p.xz)*30., abs(atan(p.z, p.x)) * .5 - t*60., t*10.), 0.);
  // flux = -abs(flux);
  p.y = abs(p.y);
  p.y -= 1.1;
  float bb = 100.;
  bb = max(sdTorus(p, vec2(1., .1*dither)), flux);
  b = min(b, bb);
  p.y += .1;

  bb = max(sdTorus(p, vec2(.7, .1*dither)), flux);
  b = min(b, bb);

  glow += 0.005/abs(b);
  d = min(d, b);

  return d;
}

float map(vec3 p)
{
  float d = 100.;
  float b = 100.;
  vec3 q = p;

  d = min(d, -sdTorus(p, vec2(radius, thin)));
  d = smin(d, length(p.xz)-.45, .5);

  d = smin(d, sdf_column(p), .02);
  d = smin(d, sdf_floor(p), .02);
  d = smin(d, sdf_wall(p), .02);

  d = max(abs(d+.01)-.01, -q.z-1.);

  d = min(d, sdf_flux(p));

  coord = p;

  return d;
}

////////////////////////////
// MAIN PASS              //
////////////////////////////

void m1(void)
{	
	time = m/44100.;
	
	vec2 uv = (gl_FragCoord.xy - res.xy/2)/res.y;

	vec3 col = vec3(0);

	// basic raymarcher
	vec3 s=vec3(0,0,-3);
	vec3 r=normalize(vec3(uv, 1));	
	vec3 p=s;
	for(int i=0; i<100; ++i) {
		float d=map(p);
		if(d<0.001) break;
		if(d>100) break;
		p+=r*d;
	}

	float fog = 1-clamp(length(p-s)/100,0,1);
	col += clamp(map(p-r),0,1) * fog;

	col.rb += glow;

	o1 = vec4(col,1);
}

////////////////////////////
// POST-PROCESS           //
////////////////////////////

void m2(void)
{	
	time = m/44100.;
	vec2 uv = gl_FragCoord.xy/res.xy;
	o1 = texture(sb1, uv);
}

////////////////////////////
// AUDIO PASS             //
////////////////////////////

float note_freq(float note, float octave) { return 440.0*pow(2.0,((octave-4.0)*12.0+note)/12.0); }

void m3(void)
{			
	vec2 frag = gl_FragCoord.xy;

	float time = (frag.x + frag.y*1920) / 44100. - 0.05;

	vec2 mus = vec2(0);
	// float beat = fract(time);
	// float note = floor(time);
	// float freq = note_freq(mod(note, 8), 4);
	// mus += sin(freq*6.283*beat + sin(time*30)) * exp(-beat*3) * 0.7;
	// mus += (fract(beat*55.0 + sin(time*730)*0.2)-0.5) * exp(-beat*9) * 0.5;
	// float beat2 = min(fract(time*2), fract(time*6));
	// mus += fract(sin(beat2*342.454)*485.523) * exp(-beat2*10) * 0.2 * step(mod(time,16),12);

	o1 = vec4(0,0,mus);
}
