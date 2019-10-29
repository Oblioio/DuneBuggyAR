/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Simple fake tilt-shift effect, modulating two pass Gaussian blur (see above) by vertical position
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
 * - "r" parameter control where "focused" horizontal line lies
 * 
 *  *
 * Vignette shader
 * based on PaintEffect postprocess from ro.me
 * http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
 * 
 * 
 * OBLIO - (we just combined alteredq's 2 shaders into one for efficiency)
 * 
 */



var TiltShiftVignetteShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"v": { value: 1.0 / 512.0 },
		"r": { value: 0.35 },
		"offset": { value: 1.0 },
		"darkness": { value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

		"	vUv = uv;",
		"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float v;",
		"uniform float r;",
		"uniform float offset;",
		"uniform float darkness;",

		"varying vec2 vUv;",

		"void main() {",

		"	vec4 sum = vec4( 0.0 );",

		"	float vv = v * abs( r - vUv.y );",

		"	sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * vv ) ) * 0.051;",
		"	sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * vv ) ) * 0.0918;",
		"	sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * vv ) ) * 0.12245;",
		"	sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * vv ) ) * 0.1531;",
		"	sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;",
		"	sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * vv ) ) * 0.1531;",
		"	sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * vv ) ) * 0.12245;",
		"	sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * vv ) ) * 0.0918;",
		"	sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * vv ) ) * 0.051;",

		"	vec2 uv = pow( ( vUv - vec2( 0.5 ) ) * vec2( offset ), vec2(2.0) );",
		"	gl_FragColor = vec4( mix( sum.rgb, vec3( 1.0 - darkness ), dot( uv, uv ) ), sum.a );",

		"}"

	].join( "\n" )

};

export { TiltShiftVignetteShader };
