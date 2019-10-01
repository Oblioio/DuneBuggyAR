export default [
    {
        input: 'shared/shared_web.js',
        output: {
            file: 'web/src/shared.js',
            format: 'esm'
        }
    },
    {
        input: 'shared/shared_lensStudio.js',
        output: {
            file: 'lensStudio/Public/shared.js',
            format: 'umd'
        }
    }
];