

module.exports = {

    name: 'uglify',
    target: 'kisp',
    config: {
        src: '<%=dir.sdk%>kisp/miniquery.debug.js',
        dest: '<%=dir.sdk%>kisp/miniquery.min.js'
    }
};