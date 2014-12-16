

module.exports = {

    name: 'watch',
    target: 'css',
    config: {
        files: '<%=dir.css%>*.less',
        tasks: ['less']
    }
};