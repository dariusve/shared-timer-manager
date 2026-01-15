import terser from '@rollup/plugin-terser';

export default [
  {
    input: 'src/timer-manager.js',
    output: [
      {
        file: 'dist/timer-manager.js',
        format: 'umd',
        name: 'TimerManager',
        sourcemap: true
      },
      {
        file: 'dist/timer-manager.esm.js',
        format: 'es',
        sourcemap: true
      },
      {
        file: 'dist/timer-manager.min.js',
        format: 'umd',
        name: 'TimerManager',
        plugins: [terser()],
        sourcemap: true
      }
    ]
  },
  {
    input: 'src/shared-timer-worker.js',
    output: {
      file: 'dist/shared-timer-worker.js',
      format: 'iife',
      sourcemap: true
    }
  }
];