/* Module Description */

/* Put dependencies here */

const canvas = require('canvas-wrapper');

module.exports = (course, stepCallback) => {
    function checkMigration(migration) {
        function check() {
            canvas.get(`/api/v1/courses/${course.canvasOU}/blueprint_templates/default/migrations/${migration.id}`, (getErr, migrationDets) => {
                if (getErr) {
                    course.fatalError(getErr);
                    stepCallback(getErr, course);
                    return;
                }

                course.message(`Sync state: ${migrationDets[0].workflow_state}`);

                if (migrationDets[0].workflow_state === 'exports_failed' || migrationDets[0].workflow_state === 'imports_failed') {
                    var syncErr = new Error('Course sync failed');
                    course.fatalError(syncErr);
                    stepCallback(syncErr, course);
                } else if (migrationDets[0].workflow_state != 'completed') {
                    setTimeout(() => {
                        check();
                    }, 1000 * 30);
                } else {
                    stepCallback(null, course);
                }
            });
        }
        check();
    }


    function syncCourse() {
        var postObj = {
            'copy_settings': true
        };

        canvas.post(`/api/v1/courses/${course.canvasOU}/blueprint_templates/default/migrations`, postObj, (err, bpMigration) => {
            if (err) {
                course.fatalError(err);
                stepCallback(err, course);
                return;
            }
            checkMigration(bpMigration);
        });
    }


    function associateCourse() {
        var putObj = {
            'course_ids_to_add': course.info.prototypeOU
        };

        canvas.put(`/api/v1/courses/${course.canvasOU}/blueprint_templates/default/update_associations`, putObj, (err) => {
            if (err) {
                course.fatalError(err);
                stepCallback(err, course);
                return;
            }
            syncCourse();
        });
    }

    associateCourse();
};