import {
  trackProgram,
  trackShader,
  type GpuRegistry,
} from './gl.js';

const VS_SOURCE = `
attribute vec2 a_pos;
attribute vec2 a_uv;
attribute float a_focus;
uniform vec2 u_resolution;
varying vec2 v_uv;
varying float v_focus;

void main() {
  vec2 zeroToOne = a_pos / u_resolution;
  vec2 clipSpace = zeroToOne * 2.0 - 1.0;
  gl_Position = vec4(clipSpace.x, -clipSpace.y, 0.0, 1.0);
  v_uv = a_uv;
  v_focus = a_focus;
}
`;

const FS_SOURCE = `
precision mediump float;
varying vec2 v_uv;
varying float v_focus;
uniform sampler2D u_tex;

void main() {
  vec4 texel = texture2D(u_tex, v_uv);
  // Focus boost — interview-visible highlight without a second draw path.
  float boost = 1.0 + v_focus * 0.45;
  gl_FragColor = vec4(min(texel.rgb * boost, 1.0), 1.0);
}
`;

function compileShader(
  reg: GpuRegistry,
  type: number,
  source: string,
): WebGLShader {
  const { gl } = reg;
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error('[webgl] createShader failed');
  }
  trackShader(reg, shader);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader) ?? 'unknown';
    throw new Error(`[webgl] shader compile failed: ${info}`);
  }
  return shader;
}

export type ShaderProgram = {
  program: WebGLProgram;
  locPos: number;
  locUv: number;
  locFocus: number;
  locResolution: WebGLUniformLocation;
  locTex: WebGLUniformLocation;
};

export function createShaderProgram(reg: GpuRegistry): ShaderProgram {
  const { gl } = reg;
  const vs = compileShader(reg, gl.VERTEX_SHADER, VS_SOURCE);
  const fs = compileShader(reg, gl.FRAGMENT_SHADER, FS_SOURCE);
  const program = gl.createProgram();
  if (!program) {
    throw new Error('[webgl] createProgram failed');
  }
  trackProgram(reg, program);
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program) ?? 'unknown';
    throw new Error(`[webgl] program link failed: ${info}`);
  }

  const locPos = gl.getAttribLocation(program, 'a_pos');
  const locUv = gl.getAttribLocation(program, 'a_uv');
  const locFocus = gl.getAttribLocation(program, 'a_focus');
  const locResolution = gl.getUniformLocation(program, 'u_resolution');
  const locTex = gl.getUniformLocation(program, 'u_tex');
  if (locPos < 0 || locUv < 0 || locFocus < 0 || !locResolution || !locTex) {
    throw new Error('[webgl] missing attribute/uniform locations');
  }

  return {
    program,
    locPos,
    locUv,
    locFocus,
    locResolution,
    locTex,
  };
}
