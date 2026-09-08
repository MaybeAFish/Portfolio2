export let EffectComposer, RenderPass, ShaderPass;

export function loadPostProcessingModules() {
  // if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
  //   return Promise.resolve(); // Skip loading on Safari
  // }

  return Promise.all([
    import('https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/postprocessing/EffectComposer.js'),
    import('https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/postprocessing/RenderPass.js'),
    import('https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/postprocessing/ShaderPass.js')
  ]).then(([EffectComposerModule, RenderPassModule, ShaderPassModule]) => {
    EffectComposer = EffectComposerModule.EffectComposer;
    RenderPass = RenderPassModule.RenderPass;
    ShaderPass = ShaderPassModule.ShaderPass;
  });
}
