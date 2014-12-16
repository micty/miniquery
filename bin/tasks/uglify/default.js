

module.exports = {

    name: 'uglify',
    target: 'default',
    config: {
        src: '<%=dir.sdk%>default/miniquery.debug.js',
        dest: '<%=dir.sdk%>default/miniquery.min.js'
    }
};