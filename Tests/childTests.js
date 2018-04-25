/*eslint-env node, es6*/

/* Dependencies */
const tap = require('tap');
const canvas = require('canvas-wrapper');

module.exports = (course, callback) => {
    tap.test('course-make-backup', (test) => {
       // console.log('prototype', course);

        canvas.get(`/api/v1/courses/${course.info.prototypeOU}`, (err, courseData) => {
            if (err) {
                course.error(err);
                test.end();
                return;
            }

            canvas.get(`/api/v1/courses/${course.info.canvasOU}`, (err, courseDataOrig) => {
                if (err) {
                    course.error(err);
                    test.end();
                    return;
                }
                console.log('heya', courseDataOriginal);
                
                 // If the course exists in canvas
                //test.ok(courseData, 'Course does not exist');
                // If the course's title is the same as the main course                
                //test.equal(courseData.name, courseDataOriginal.name);
                
            })    
            
        })

        // If the course has content
            // Number of pages
             canvas.get(`/api/v1/courses/${course.info.prototypeOU}/pages`, (err, coursePages) => {
                 if (err) {
                     course.error(err);
                     test.end();
                     return;
                 }
                canvas.get(`/api/v1/courses/${course.info.canvasOU}/pages`, (err, coursePagesOrig) => {
                    if (err) {
                        course.error(err);
                        test.end();
                        return;
                    }

                    test.equal(coursePages.length, coursePagesOrig.length);
                })
                 
             })
            // Number of modules
            // canvas.get(``)
            // canvas.get(``)
            // Number of quizzes
            // canvas.get(``)
            // canvas.get(``)


    test.end();
    });

    callback(null, course);
}; 