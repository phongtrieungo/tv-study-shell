/** Shared GL helpers — context acquire + eager GPU dispose (AD-6 / AD-9). */

export type GlContext = WebGLRenderingContext | WebGL2RenderingContext;

export type GpuRegistry = {
  gl: GlContext;
  api: 'webgl2' | 'webgl';
  buffers: WebGLBuffer[];
  textures: WebGLTexture[];
  programs: WebGLProgram[];
  shaders: WebGLShader[];
};

export function acquireContext(canvas: HTMLCanvasElement): {
  gl: GlContext;
  api: 'webgl2' | 'webgl';
} | null {
  const webgl2 = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
  });
  if (webgl2) {
    return { gl: webgl2, api: 'webgl2' };
  }

  const webgl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
  });
  if (webgl) {
    return { gl: webgl, api: 'webgl' };
  }

  return null;
}

export function createRegistry(gl: GlContext, api: 'webgl2' | 'webgl'): GpuRegistry {
  return {
    gl,
    api,
    buffers: [],
    textures: [],
    programs: [],
    shaders: [],
  };
}

export function trackBuffer(reg: GpuRegistry, buffer: WebGLBuffer): WebGLBuffer {
  reg.buffers.push(buffer);
  return buffer;
}

export function trackTexture(reg: GpuRegistry, texture: WebGLTexture): WebGLTexture {
  reg.textures.push(texture);
  return texture;
}

export function trackProgram(reg: GpuRegistry, program: WebGLProgram): WebGLProgram {
  reg.programs.push(program);
  return program;
}

export function trackShader(reg: GpuRegistry, shader: WebGLShader): WebGLShader {
  reg.shaders.push(shader);
  return shader;
}

/** Delete every tracked GPU object and clear bind points. JS GC does not free VRAM. */
export function disposeGpu(reg: GpuRegistry | null): void {
  if (!reg) {
    return;
  }

  const { gl } = reg;

  for (const buffer of reg.buffers) {
    gl.deleteBuffer(buffer);
  }
  for (const texture of reg.textures) {
    gl.deleteTexture(texture);
  }
  for (const program of reg.programs) {
    gl.deleteProgram(program);
  }
  for (const shader of reg.shaders) {
    gl.deleteShader(shader);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.useProgram(null);

  reg.buffers.length = 0;
  reg.textures.length = 0;
  reg.programs.length = 0;
  reg.shaders.length = 0;
}
