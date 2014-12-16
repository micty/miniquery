

(function ($, deepEqual, equal, ok) {




$.test('Array', {

    sum: function (fn) {

        var a = [1, 2, 3, 4];
        var sum = fn(a); //得到 10
        equal(sum, 10);


        //又如
        var a = [
            { value: 1 },
            { value: NaN },
            { value: 3 },
            { value: 4 },
        ];
        var sum = fn(a, true, 'value');
        equal(sum, 8);
    },

    aggregate: function (fn) {

        var books = [
            { name: 'C++', type: '计算机', year: 2012 },   
            { name: 'JavaScript', type: '计算机', year: 2011 },
            { name: '简爱', type: '文学', year: 2011 },
            { name: '数据结构', type: '计算机', year: 2013 },
            { name: '人生', type: '文学', year: 2012 },
            { name: '大学物理', type: '物理', year: 2012 },
            { name: '高等数学', type: '数学', year: 2011 },
            { name: '微积分', type: '数学', year: 2013 }
        ];

        //按 type 进行聚合(分组)
        var byTypes = $.Array.aggregate( books, 'type' );  
        
        //按 year 进行聚合(分组)，并重新返回一个值。
        var byYears = $.Array.aggregate( books, 'year', function(item, index) {
            return { name: item.name, type: item.type, year: '出版年份：' + item.year };
        }); 
    
         deepEqual(byTypes, {
            '计算机': [
                { name: 'C++', type: '计算机', year: 2012 },   
                { name: 'JavaScript', type: '计算机', year: 2011 },
                { name: '数据结构', type: '计算机', year: 2013 }
            ],
            '文学': [
                { name: '简爱', type: '文学', year: 2011 },
                { name: '人生', type: '文学', year: 2012 }
            ],
            '物理': [
                { name: '大学物理', type: '物理', year: 2012 }
            ],
            '数学': [
                { name: '高等数学', type: '数学', year: 2011 },
                { name: '微积分', type: '数学', year: 2013 }
            ]
        });
    
         deepEqual(byYears, {
            2011: [
                { name: 'JavaScript', type: '计算机', year: '出版年份：2011' },
                { name: '简爱', type: '文学', year: '出版年份：2011' },
                { name: '高等数学', type: '数学', year: '出版年份：2011' }
            ],
            2012: [
                { name: 'C++', type: '计算机', year: '出版年份：2012' },
                { name: '人生', type: '文学', year: '出版年份：2012' },
                { name: '大学物理', type: '物理', year: '出版年份：2012' }
            ],
            2013: [
                { name: '数据结构', type: '计算机', year: '出版年份：2013' },
                { name: '微积分', type: '数学', year: '出版年份：2013' }
            ]
        });
    },

    descartes: function (fn) {
        var A = ['a', 'b'];
        var B = [0, 1, 2]; 
        var C = $.Array.descartes(A, B);

        deepEqual(C, [
            ['a', 0], ['a', 1], ['a', 2],
            ['b', 0], ['b', 1], ['b', 2]
        ]);
    },

    transpose: function (fn) {

        var A = [
            ['a', 'b', 'c'],
            [100, 200, 300]
        ];
        var B = $.Array.transpose(A);
        
        deepEqual(B, [
            ['a', 100],
            ['b', 200],
            ['c', 300],
        ]);
    }
});




})(MiniQuery, deepEqual, equal, ok);