

module.exports = {

    name: 'concat',
    target: 'core',
    config: {
        options: {
            banner: '\n' +
                '/*!\n' +
                '* <%=pkg.description%>\n' +
                '* 版本: <%=pkg.version%>\n' +
                '* for core\n' +
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


            '<%=dir.src%>/MiniQuery.js',
            '<%=dir.src%>/core.end.js',
        ],
        dest: '<%=dir.sdk%>core/miniquery.debug.js'
    }
};