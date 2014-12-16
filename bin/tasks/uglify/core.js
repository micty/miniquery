

module.exports = {

    name: 'uglify',
    target: 'core',
    config: {
        src: '<%=dir.sdk%>core/miniquery.debug.js',
        dest: '<%=dir.sdk%>core/miniquery.min.js'
    }
};