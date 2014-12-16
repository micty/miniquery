

module.exports = {

    name: 'uglify',
    target: 'node',
    config: {
        src: '<%=dir.sdk%>node/miniquery.debug.js',
        dest: '<%=dir.sdk%>node/miniquery.min.js'
    }
};