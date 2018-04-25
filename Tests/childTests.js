/*eslint-env node, es6*/
/* eslint no-console:0 */

/* Dependencies */
const tap = require('tap');
const canvas = require('canvas-wrapper');

module.exports = (course, callback) => {
    tap.test('course-make-backup', (test) => {
        // console.log('prototype', course);
        console.log(course.settings);

        // canvas.get(`/api/v1/courses/${course.info.prototypeOU}`, (err, courseData) => {
        //     if (err) {
        //         course.error(err);
        //         test.end();
        //         return;
        //     }
        //     console.log(courseData);

        //     canvas.get(`/api/v1/courses/${course.info.canvasOU}`, (err, courseDataOrig) => {
        //         if (err) {
        //             course.error(err);
        //             test.end();
        //             return;
        //         }
        //         console.log('heya', courseDataOrig);

        //         // If the course exists in canvas
        //         test.ok(courseData, 'Course does not exist');
        //         // If the course's title is the same as the main course                
        //         test.equal(courseData.name, courseDataOrig.name);

        //     });

        // });

        // // If the course has content
        // // Number of pages
        // canvas.get(`/api/v1/courses/${course.info.prototypeOU}/pages`, (err, coursePages) => {
        //     if (err) {
        //         course.error(err);
        //         test.end();
        //         return;
        //     }
        //     canvas.get(`/api/v1/courses/${course.info.canvasOU}/pages`, (err, coursePagesOrig) => {
        //         if (err) {
        //             course.error(err);
        //             test.end();
        //             return;
        //         }

        //         test.equal(coursePages.length, coursePagesOrig.length);
        //     });

        // });

        // // Number of modules
        // canvas.get(`/api/v1/courses/${course.info.prototypeOU}/modules`, (err, courseModules) => {
        //     if (err) {
        //         course.error(err);
        //         test.end();
        //         return;
        //     }
        //     canvas.get(`/api/v1/courses/${course.info.canvasOU}/modules`, (err, courseModulesOrig) => {
        //         if (err) {
        //             course.error(err);
        //             test.end();
        //             return;
        //         }

        //         test.equal(courseModules.length, courseModulesOrig.length);
        //     });

        // });

        // // Number of quizzes
        // canvas.get(`/api/v1/courses/${course.info.prototypeOU}/quizzes`, (err, courseQuizzes) => {
        //     if (err) {
        //         course.error(err);
        //         test.end();
        //         return;
        //     }
        //     canvas.get(`/api/v1/courses/${course.info.canvasOU}/quizzes`, (err, courseQuizzesOrig) => {
        //         if (err) {
        //             course.error(err);
        //             test.end();
        //             return;
        //         }

        //         test.equal(courseQuizzes.length, courseQuizzesOrig.length);
        //     });

        // });


        test.end();
    });

    callback(null, course);
};