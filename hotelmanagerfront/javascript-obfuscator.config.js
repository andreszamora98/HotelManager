// hotelmanagerfront/javascript-obfuscator.config.js
export default {
  // comprime todo el código en una sola línea
  compact: true,

  // aplana el flujo de control para dificultar la lectura
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,

  // inyecta código muerto
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,

  // evita console.log
  disableConsoleOutput: true,

  // NO renombra variables globales (p. ej. window, document)
  renameGlobals: false,

  // rota y cifra el array de strings
  rotateStringArray: true,
  stringArray: true,
  stringArrayThreshold: 0.75,

  // protección contra debugging (F8, DevTools)
  debugProtection: false,

  // si quieres más opciones, agrégalas aquí…
};

