// Generated with Shader Minifier 1.3.5 (https://github.com/laurentlb/Shader_Minifier/)
#ifndef FRAGMENT_INL_
# define FRAGMENT_INL_

const char *fragment_frag =
 "#version 330\n"
 "#define m1 main\n"
 "uniform int m;"
 "uniform sampler2D sb1;"
 "out vec4 o1;"
 "float y;"
 "vec2 s=vec2(1920,1080);"
 "mat2 v(float m)"
 "{"
   "return mat2(cos(m),sin(m),-sin(m),cos(m));"
 "}"
 "float v(vec3 m,vec3 y)"
 "{"
   "m=abs(m)-y;"
   "return max(m.x,max(m.y,m.z));"
 "}"
 "float n(vec3 m)"
 "{"
   "for(int s=0;s<4;++s)"
     "m.yz*=v(y*.3+s),m.xz*=v(y*.4+s*1.7),m.xy=abs(m.xy)-1.1-sin(y+s);"
   "return v(m,vec3(.1,.4,1));"
 "}"
 "void m1()"
 "{"
   "y=m/44100.;"
   "vec2 v=(gl_FragCoord.xy-s.xy/2)/s.y;"
   "vec3 f=vec3(0),c=vec3(0,0,-10),t=normalize(vec3(v,1)),i=c;"
   "for(int o=0;o<100;++o)"
     "{"
       "float e=n(i);"
       "if(e<.001)"
         "break;"
       "if(e>100)"
         "break;"
       "i+=t*e;"
     "}"
   "float e=1-clamp(length(i-c)/100,0,1);"
   "f+=clamp(n(i-t),0,1)*e;"
   "o1=vec4(f,1);"
 "}"
 "void m2()"
 "{"
   "y=m/44100.;"
   "vec2 i=gl_FragCoord.xy/s.xy;"
   "vec3 v=vec3(0);"
   "vec2 o=vec2(.005,0);"
   "v.x+=texture(sb1,i-o).x;"
   "v.y+=texture(sb1,i).y;"
   "v.z+=texture(sb1,i+o).z;"
   "o1=vec4(v,1);"
 "}"
 "void m3()"
 "{"
   "vec2 m=gl_FragCoord.xy;"
   "float s=(m.x+m.y*1920)/44100.-.05;"
   "vec2 v=vec2(0);"
   "float y=fract(s);"
   "v+=sin(440.*pow(2.,((4-4.)*12.+mod(floor(s),8))/12.)*6.283*y+sin(s*30))*exp(-y*3)*.7;"
   "v+=(fract(y*55.+sin(s*730)*.2)-.5)*exp(-y*9)*.5;"
   "float i=min(fract(s*2),fract(s*6));"
   "v+=fract(sin(i*342.454)*485.523)*exp(-i*10)*.2*step(mod(s,16),12);"
   "o1=vec4(0,0,v);"
 "}";

#endif // FRAGMENT_INL_