# Lev4k
A 4 kilobyte intro framework based on Leviathan 2.0 but with added/tweaked features, original is here, you should probably use it instead, it's great: https://github.com/armak/Leviathan-2.0

Warning: this tool is not stable but made to be hacked around while making each intro.
It has been used for all my 4k intros, but this is a fresh start so you will find:
- Default sample with basic raymarching + postprocess + shader sound (main branch)
- 4klang branch
- Oidos branch
- LastFrameBuffer branch: give you access to last frame so you can do feedback effects
- Primordial Awakening (Revision 2023) https://www.pouet.net/prod.php?which=94122 (separate branch)

## Added Features
* Audio: shader based music synth, with option for a postprocess pass (reverb, delays) and an experimental "real time" mode with midi input capabilities
* Audio: 4klang song can be paused/seeked in editor mode without needing to made a .wav
* Audio: Oidos song can be used
* Shader: multipasses frome same shader file (using hacky defines), music and visuals can share code
* Export: audio to .wav for rendering a video (define RECORD_SFX)
* Export: frame-by-frame in png or jpg for rendering a video (define RECORD_IMG, do it separate from audio)
* Particle simulation & rendering: in the Primordial Awakening branch
* Camera location: can be used in editor for debug or finding cool camera spots

## Compatibility
Current version intended to be used with Visual Studio 2017 (any version). Make sure you have a version with the latest Windows SDK installed (at least version 10.0.17134.0), or use version 8.1. With some extra configuration 2015 and 2013 should work as well. Some people had a struct_packing issue while compiling in snapshot/release, changing "Struct Member Alignment" in the project settings to "default" fixed it.

## Quick start with Shader Audio
- open fragment.frag file
- change "m1" function for your main rendering
- change "m2" function for your post-process pass
- change "m3" function for your music
- change your intro duration in Shaudio.h SONG_DURATION, SHAUDIO_YRES must be adjusted accordingly so MAX_SAMPLES is inferior to SHAUDIO_XRES * SHAUDIO_YRES
- compile in "editor" config and press f5 to see the result
- when ready compile in "snapshot" or "release" (longer compilation time), you will find your final exe in out directory

## To use 4klang
- make sure you switch to branch "4klang"
- export your music from your DAW as a file named 4klang.inc
- place the 4klang.inc file you exported from you DAW into folder src/4klang
- launch make_music.bat so it generate the corresponding .obj
- compile in visual

## To use Oidos
- make sure you switch to branch "oidos"
- export your music from renoise as a file named music.xrns
- place file music.xrns into folder src/Oidos
- launch build_music_from_xrns.bat so it generate the corresponding .obj
- compile in visual

## Shortcuts in editor mode
- alt+arrow left/right: seek in time backward/forward (+shift to go faster)
- alt+up pause, alt+down play
- alt+space play from start
- crtl-s reload the shaders and re-render the music (can change SHAUDIO_UPDATEONSAVE if it become too slow)

## Configurations
This section describes the different build configurations available from Visual Studio IDE
### Editor
Creates a big exe, but with keyboard controls for pausing and seeking around temporally and hot reloading of shaders
### Snapshot
Use for regular testing of your intro. Only minimal crinklering but nothing extra included. Useful still for keeping track of relative size changes. This configuration overwrites Release configuration binaries, but doesn't generate and overwrite crinkler report.
### Release
The real deal. No-nonsense max crinklering with minimum extra. Use this for occasional testing and your final releases (the compression WILL take a while).

## Acknowledgements
- Original Leviathan 2.0: https://github.com/armak/Leviathan-2.0
- Shader Minifier: https://github.com/laurentlb/Shader_Minifier
- Crinkler: https://github.com/runestubbe/Crinkler
- 4klang: https://github.com/hzdgopher/4klang
- dr_wav: https://github.com/mackron/dr_libs/blob/master/dr_wav.h
- stb_image_write: https://github.com/nothings/stb/blob/master/stb_image_write.h