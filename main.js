/********************************************
 * Creates a new canvas course which is then 
 * linked to the newly converted course and
 * synced via the canvas blueprint feature 
 ********************************************/

const canvas = require('canvas-wrapper');

module.exports = (course, stepCallback) => {
    /* used to count attempts to re-sync */
    const syncLimit = 2;
    var syncCounter = 0;

    /**************************************************************
     * Sometimes there are still unsynced changes upon completion.
     * This will look for unsynced changes & attempt to re-sync.
     **************************************************************/
    function verifySync() {
        /* child module completion */
        function complete() {
            course.log('Backup course created', {
                'Course OU': course.info.backupOU
            });
            stepCallback(null, course);
        }

        /* get any unsynced changes */
        canvas.get(`/api/v1/courses/${course.info.canvasOU}/blueprint_templates/default/unsynced_changes`, (getErr, unsyncedChanges) => {
            if (getErr) {
                course.error(getErr);
                course.warning('Unable to verify blueprint sync integrity. Please ensure there are no remaining unsynced changes.');
                stepCallback(null, course);
                return;
            }

            if (unsyncedChanges.length === 0) {
                complete();
            } else {
                /* Try to sync again if we're under the syncLimit */
                if (syncCounter < syncLimit) {
                    syncCourse();
                } else {
                    /* if we're over the syncLimit & there are still unsynced changes */
                    try {
                        course.warning(`Unable to sync the following changes: ${JSON.stringify(unsyncedChanges)}`);
                    } catch (e) {
                        course.warning('Unable to sync changes. Please check the Canvas UI for details');
                    } finally {
                        complete();
                    }
                }
            }
        });
    }



    /**************************************
     * Monitor status of sync. 
     * Close child module on completion.
     **************************************/
    function checkMigrationStatus(migration) {
        function check() {
            canvas.get(`/api/v1/courses/${course.info.canvasOU}/blueprint_templates/default/migrations/${migration.id}`, (getErr, migrationDets) => {
                if (getErr) {
                    course.error(getErr);
                    stepCallback(null, course);
                    return;
                }

                course.message(`Sync state: ${migrationDets[0].workflow_state}`);

                if (migrationDets[0].workflow_state === 'exports_failed' || migrationDets[0].workflow_state === 'imports_failed') {
                    var syncErr = new Error('Course sync failed');
                    course.error(syncErr);
                    stepCallback(null, course);
                } else if (migrationDets[0].workflow_state != 'completed') {
                    setTimeout(() => {
                        check();
                    }, 1000 * 20);
                } else {
                    ++syncCounter;
                    // course.log('Backup course created', {'Course OU': course.info.prototypeOU});
                    // stepCallback(null, course);
                    verifySync();
                }
            });
        }
        check();
    }

    /**************************************
     * Sync converted & backup course
     *************************************/
    function syncCourse() {
        var postObj = {
            'copy_settings': true
        };

        canvas.post(`/api/v1/courses/${course.info.canvasOU}/blueprint_templates/default/migrations`, postObj, (err, bpMigration) => {
            if (err) {
                course.error(err);
                stepCallback(null, course);
                return;
            }
            course.message('Starting to sync blueprint course');
            checkMigrationStatus(bpMigration);
        });
    }

    /***************************************************************
     * Add the new backup course to the list of associated courses.
     * Alters converted course, not backup
     **************************************************************/
    function associateCourse() {
        var putObj = {
            'course_ids_to_add': [course.info.backupOU]
        };
        canvas.putJSON(`/api/v1/courses/${course.info.canvasOU}/blueprint_templates/default/update_associations`, putObj, (err) => {
            if (err) {
                course.error(err);
                stepCallback(null, course);
                return;
            }
            course.message('Backup course associated with blueprint course');
            syncCourse();
        });
    }

    /********************************
     * Create the backup course
     ********************************/
    function createBackupCourse() {
        var courseObj = {
            'course[account_id]': `${course.settings.accountID}`,
            'course[name]': `${course.info.courseCode} Course Backup`,
            'course[code]': `${course.info.courseCode} CB`
        };

        canvas.post(`/api/v1/accounts/${course.settings.accountID}/courses`, courseObj, (createErr, newCourse) => {
            if (createErr) {
                course.error(createErr);
                stepCallback(null, course);
                return;
            }

            course.message(`Backup course created with id: ${newCourse.id}`);
            // course.newInfo('prototypeOU', newCourse.id);
            course.newInfo('backupOU', newCourse.id);

            associateCourse();
        });
    }

    /*****************************************************************
     * START HERE 
     *****************************************************************/
    if (!course.info.isBlueprint) {
        /* quit if the course isn't a BP course */
        course.message('Course is not a Blueprint course. Skipping child module');
    } else {
        createBackupCourse();
        return;
    }

    stepCallback(null, course);
};