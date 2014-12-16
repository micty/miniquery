

module.exports = {

    name: 'concat',
    target: 'node',
    config: {
        options: {
            banner: '\n' +
                '/*!\n' +
                '* <%=pkg.description%>\n' +
                '* 版本: <%=pkg.version%>\n' +
                '* for node\n' +
                '*/'
        },
        src: [
            '<%=dir.src%>/core.begin.js',

            '<%=dir.src%>core/Miniquery.js',
            '<%=dir.src%>core/Object.js',
            '<%=dir.src%>core/Object.prototype.js',
            '<%=dir.src%>core/Array.js',
            '<%=dir.src%>core/Array.prototype.js',
            '<%=dir.src%>core/String.js',
            '<%=dir.src%>core/String.prototype.js',
            '<%=dir.src%>core/Boolean.js',
            '<%=dir.src%>core/Boolean.prototype.js',
            '<%=dir.src%>core/Date.js',
            '<%=dir.src%>core/Date.prototype.js',
            '<%=dir.src%>core/Math.js',


            '<%=dir.src%>excore/Url.js',
            '<%=dir.src%>excore/Guid.js',
            '<%=dir.src%>excore/Mapper.js',
            '<%=dir.src%>excore/Event.js',
            '<%=dir.src%>excore/Event.prototype.js',
            '<%=dir.src%>excore/Callbacks.js',
            '<%=dir.src%>excore/States.js',


            '<%=dir.src%>/MiniQuery.js',
            '<%=dir.src%>/core.end.js',
        ],
        dest: '<%=dir.sdk%>node/miniquery.debug.js'
    }
};