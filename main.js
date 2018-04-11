/********************************************
 * Creates a new canvas course which is then 
 * linked to the newly converted course and
 * synced via the canvas blueprint feature 
 ********************************************/

const canvas = require('canvas-wrapper');

module.exports = (course, stepCallback) => {
    function checkMigration(migration) {
        function check() {
            canvas.get(`/api/v1/courses/${course.info.canvasOU}/blueprint_templates/default/migrations/${migration.id}`, (getErr, migrationDets) => {
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
                    }, 1000 * 20);
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

        canvas.post(`/api/v1/courses/${course.info.canvasOU}/blueprint_templates/default/migrations`, postObj, (err, bpMigration) => {
            if (err) {
                course.fatalError(err);
                stepCallback(err, course);
                return;
            }
            course.message('Starting to sync blueprint course');
            checkMigration(bpMigration);
        });
    }

    function associateCourse() {
        var putObj = {
            'course_ids_to_add': course.info.prototypeOU
        };

        canvas.put(`/api/v1/courses/${course.info.canvasOU}/blueprint_templates/default/update_associations`, putObj, (err) => {
            if (err) {
                course.fatalError(err);
                stepCallback(err, course);
                return;
            }
            course.message('Backup course associated with blueprint course');
            syncCourse();
        });
    }

    function createBackupCourse() {
        var courseObj = {
            'course[name]': `${course.info.courseCode} Backup`,
            'course[code]': course.info.courseCode
        };

        canvas.post(`/api/v1/accounts/${course.settings.accountID}/courses`, courseObj, (createErr, newCourse) => {
            if (createErr) {
                course.fatalError(createErr);
                stepCallback(createErr, course);
                return;
            }

            course.message(`Backup course created with id: ${newCourse.id}`);
            course.newInfo('prototypeOU', newCourse.id);

            associateCourse();
        });
    }

    var validPlatforms = ['online', 'pathway'];
    if (validPlatforms.includes(course.settings.platform)) {
        course.message('Invalid platform. Skipping child module');
        stepCallback(null, course);
        return;
    }
    createBackupCourse();
};